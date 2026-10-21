import { BankersProcess, BankersState } from '../types';

export interface SafetyCheckResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: Array<{
    step: number;
    description: string;
    workBefore: number[];
    processId: string;
    processName: string;
    canExecute: boolean;
    workAfter: number[];
  }>;
}

export interface ResourceRequestResult {
  granted: boolean;
  reason: string;
  isSafe: boolean;
  safeSequence: string[];
  newState?: BankersState;
}

/**
 * Computes Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
 */
export function calculateNeedMatrix(
  processes: Array<{ id: string; name: string; allocation: number[]; max: number[] }>
): BankersProcess[] {
  return processes.map((p) => {
    const need = p.max.map((maxVal, rIdx) => Math.max(0, maxVal - (p.allocation[rIdx] || 0)));
    return {
      id: p.id,
      name: p.name,
      allocation: [...p.allocation],
      max: [...p.max],
      need,
    };
  });
}

/**
 * Executes Banker's Safety Algorithm
 */
export function checkSafety(
  available: number[],
  processes: BankersProcess[]
): SafetyCheckResult {
  const n = processes.length;
  const m = available.length;

  const work = [...available];
  const finish = new Array(n).fill(false);
  const safeSequence: string[] = [];
  const steps: SafetyCheckResult['steps'] = [];

  let count = 0;
  let stepNumber = 1;

  while (count < n) {
    let found = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const proc = processes[i];
        let canAllocate = true;

        for (let j = 0; j < m; j++) {
          if (proc.need[j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          const workBefore = [...work];
          for (let j = 0; j < m; j++) {
            work[j] += proc.allocation[j];
          }

          finish[i] = true;
          safeSequence.push(proc.name);
          found = true;
          count++;

          steps.push({
            step: stepNumber++,
            description: `${proc.name} can satisfy its remaining Need [${proc.need.join(', ')}] with Available Work [${workBefore.join(', ')}]. Process executes, terminates, and releases its allocated resources [${proc.allocation.join(', ')}].`,
            workBefore,
            processId: proc.id,
            processName: proc.name,
            canExecute: true,
            workAfter: [...work],
          });

          break; // restart check loop with new work vector
        }
      }
    }

    if (!found) {
      // Deadlock condition / Unsafe state
      const unfinished = processes.filter((_, idx) => !finish[idx]);
      steps.push({
        step: stepNumber,
        description: `No remaining process (${unfinished.map((p) => p.name).join(', ')}) can satisfy its Need with current Work [${work.join(', ')}]. System is in an UNSAFE STATE!`,
        workBefore: [...work],
        processId: unfinished[0]?.id || 'NONE',
        processName: unfinished.map((p) => p.name).join(', '),
        canExecute: false,
        workAfter: [...work],
      });
      break;
    }
  }

  const isSafe = count === n;

  return {
    isSafe,
    safeSequence: isSafe ? safeSequence : [],
    steps,
  };
}

/**
 * Resource Request Algorithm for Banker's Algorithm
 */
export function requestResources(
  currentState: BankersState,
  processIndex: number,
  request: number[]
): ResourceRequestResult {
  const { available, processes } = currentState;
  const proc = processes[processIndex];

  if (!proc) {
    return {
      granted: false,
      reason: 'Invalid process selected.',
      isSafe: false,
      safeSequence: [],
    };
  }

  const m = available.length;

  // 1. Check if request <= Need
  for (let j = 0; j < m; j++) {
    if (request[j] > proc.need[j]) {
      return {
        granted: false,
        reason: `Error: Process ${proc.name} requested ${request[j]} instances of Resource ${currentState.resourceNames[j]}, which exceeds its declared maximum claim (Need: ${proc.need[j]}). Request rejected!`,
        isSafe: false,
        safeSequence: [],
      };
    }
  }

  // 2. Check if request <= Available
  for (let j = 0; j < m; j++) {
    if (request[j] > available[j]) {
      return {
        granted: false,
        reason: `Process ${proc.name} must wait: Resource ${currentState.resourceNames[j]} requested (${request[j]}) exceeds currently Available instances (${available[j]}). Request queued in Waiting state.`,
        isSafe: false,
        safeSequence: [],
      };
    }
  }

  // 3. Pretend to allocate
  const testAvailable = available.map((val, j) => val - request[j]);
  const testProcesses: BankersProcess[] = processes.map((p, idx) => {
    if (idx === processIndex) {
      const newAlloc = p.allocation.map((val, j) => val + request[j]);
      const newNeed = p.need.map((val, j) => val - request[j]);
      return {
        ...p,
        allocation: newAlloc,
        need: newNeed,
      };
    }
    return {
      ...p,
      allocation: [...p.allocation],
      max: [...p.max],
      need: [...p.need],
    };
  });

  // 4. Test safety
  const safety = checkSafety(testAvailable, testProcesses);

  if (safety.isSafe) {
    const newState: BankersState = {
      ...currentState,
      available: testAvailable,
      processes: testProcesses,
      isSafe: true,
      safeSequence: safety.safeSequence,
      executionSteps: safety.steps,
    };

    return {
      granted: true,
      reason: `Resource request granted safely! Safe sequence found: <${safety.safeSequence.join(' → ')}>. No deadlock possible.`,
      isSafe: true,
      safeSequence: safety.safeSequence,
      newState,
    };
  } else {
    return {
      granted: false,
      reason: `Resource request denied by Banker's Algorithm: Granting this request would leave the ATM system in an UNSAFE STATE where deadlock could occur if remaining processes demand their peak resources.`,
      isSafe: false,
      safeSequence: [],
    };
  }
}
