import { ScheduledProcess, GanttBlock, SchedulingResult, SchedulingAlgorithm } from '../types';

const PROCESS_COLORS = [
  '#526B85', // steel blue
  '#638A84', // desaturated teal
  '#7A8B99', // slate grey
  '#A78045', // muted amber
  '#8B7E94', // dusty purple
  '#527A62', // subdued green
  '#A65D5D', // brick red
  '#68768A', // muted navy
];

export const getProcessColor = (index: number): string => {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
};

/**
 * First-Come, First-Served (FCFS) Scheduling Algorithm
 */
export function calculateFCFS(inputProcesses: ScheduledProcess[]): SchedulingResult {
  if (inputProcesses.length === 0) {
    return createEmptyResult('FCFS');
  }

  // Clone and sort by arrival time, then id
  const processes = inputProcesses.map((p, idx) => ({
    ...p,
    color: p.color || getProcessColor(idx),
  })).sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  const schedule: GanttBlock[] = [];
  let currentTime = 0;

  for (const proc of processes) {
    // If CPU is idle before arrival
    if (currentTime < proc.arrivalTime) {
      schedule.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: proc.arrivalTime,
        isIdle: true,
      });
      currentTime = proc.arrivalTime;
    }

    const startTime = currentTime;
    const endTime = startTime + proc.burstTime;

    schedule.push({
      processId: proc.id,
      processName: proc.name,
      startTime,
      endTime,
      isIdle: false,
      color: proc.color,
    });

    proc.completionTime = endTime;
    proc.turnaroundTime = proc.completionTime - proc.arrivalTime;
    proc.waitingTime = proc.turnaroundTime - proc.burstTime;
    proc.responseTime = startTime - proc.arrivalTime;

    currentTime = endTime;
  }

  return summarizeResult('FCFS', schedule, processes);
}

/**
 * Non-preemptive Shortest Job First (SJF) Scheduling Algorithm
 */
export function calculateSJF(inputProcesses: ScheduledProcess[]): SchedulingResult {
  if (inputProcesses.length === 0) {
    return createEmptyResult('SJF');
  }

  const processes = inputProcesses.map((p, idx) => ({
    ...p,
    color: p.color || getProcessColor(idx),
  }));

  const schedule: GanttBlock[] = [];
  const completed: ScheduledProcess[] = [];
  const remaining = [...processes];
  let currentTime = 0;

  while (remaining.length > 0) {
    // Find all arrived processes
    const available = remaining.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // Find the next earliest arrival
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime));
      schedule.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Select process with shortest burst time (tie breaker: arrival time, then id)
    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));
    const selected = available[0];

    const startTime = currentTime;
    const endTime = startTime + selected.burstTime;

    schedule.push({
      processId: selected.id,
      processName: selected.name,
      startTime,
      endTime,
      isIdle: false,
      color: selected.color,
    });

    selected.completionTime = endTime;
    selected.turnaroundTime = selected.completionTime - selected.arrivalTime;
    selected.waitingTime = selected.turnaroundTime - selected.burstTime;
    selected.responseTime = startTime - selected.arrivalTime;

    currentTime = endTime;
    completed.push(selected);
    const index = remaining.findIndex((p) => p.id === selected.id);
    remaining.splice(index, 1);
  }

  return summarizeResult('SJF', schedule, completed);
}

/**
 * Non-preemptive Priority Scheduling Algorithm
 * Convention: LOWER numerical value = HIGHER priority (e.g., 1 is highest priority/VIP, 5 is low)
 */
export function calculatePriority(inputProcesses: ScheduledProcess[]): SchedulingResult {
  if (inputProcesses.length === 0) {
    return createEmptyResult('PRIORITY');
  }

  const processes = inputProcesses.map((p, idx) => ({
    ...p,
    color: p.color || getProcessColor(idx),
  }));

  const schedule: GanttBlock[] = [];
  const completed: ScheduledProcess[] = [];
  const remaining = [...processes];
  let currentTime = 0;

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime));
      schedule.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Select process with highest priority (lowest number)
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));
    const selected = available[0];

    const startTime = currentTime;
    const endTime = startTime + selected.burstTime;

    schedule.push({
      processId: selected.id,
      processName: selected.name,
      startTime,
      endTime,
      isIdle: false,
      color: selected.color,
    });

    selected.completionTime = endTime;
    selected.turnaroundTime = selected.completionTime - selected.arrivalTime;
    selected.waitingTime = selected.turnaroundTime - selected.burstTime;
    selected.responseTime = startTime - selected.arrivalTime;

    currentTime = endTime;
    completed.push(selected);
    const index = remaining.findIndex((p) => p.id === selected.id);
    remaining.splice(index, 1);
  }

  return summarizeResult('PRIORITY', schedule, completed);
}

/**
 * Round Robin (RR) Scheduling Algorithm with configurable quantum
 */
export function calculateRoundRobin(inputProcesses: ScheduledProcess[], quantum: number): SchedulingResult {
  if (inputProcesses.length === 0 || quantum <= 0) {
    return createEmptyResult('ROUND_ROBIN');
  }

  // Work with fresh copies
  const processes = inputProcesses.map((p, idx) => ({
    ...p,
    color: p.color || getProcessColor(idx),
  }));

  const remainingBurst = new Map<string, number>();
  const firstStartTime = new Map<string, number>();
  processes.forEach((p) => remainingBurst.set(p.id, p.burstTime));

  const schedule: GanttBlock[] = [];
  const readyQueue: ScheduledProcess[] = [];
  const arrivedSet = new Set<string>();

  // Sort initial pool by arrival time
  const sortedByArrival = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  let currentTime = 0;
  let completedCount = 0;
  const n = processes.length;

  // Add initial arrivals at time 0
  sortedByArrival.forEach((p) => {
    if (p.arrivalTime <= currentTime && !arrivedSet.has(p.id)) {
      readyQueue.push(p);
      arrivedSet.add(p.id);
    }
  });

  while (completedCount < n) {
    if (readyQueue.length === 0) {
      // Find the next arrival among unarrived
      const unarrived = sortedByArrival.filter((p) => !arrivedSet.has(p.id));
      if (unarrived.length > 0) {
        const nextArrival = Math.min(...unarrived.map((p) => p.arrivalTime));
        schedule.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArrival,
          isIdle: true,
        });
        currentTime = nextArrival;

        // Enqueue newly arrived
        unarrived.forEach((p) => {
          if (p.arrivalTime <= currentTime && !arrivedSet.has(p.id)) {
            readyQueue.push(p);
            arrivedSet.add(p.id);
          }
        });
      }
      continue;
    }

    const currentProcess = readyQueue.shift()!;
    const rem = remainingBurst.get(currentProcess.id)!;

    if (!firstStartTime.has(currentProcess.id)) {
      firstStartTime.set(currentProcess.id, currentTime);
    }

    const executionTime = Math.min(quantum, rem);
    const startTime = currentTime;
    const endTime = startTime + executionTime;

    schedule.push({
      processId: currentProcess.id,
      processName: currentProcess.name,
      startTime,
      endTime,
      isIdle: false,
      color: currentProcess.color,
    });

    currentTime = endTime;
    const newRem = rem - executionTime;
    remainingBurst.set(currentProcess.id, newRem);

    // Check newly arrived processes while this process was executing
    sortedByArrival.forEach((p) => {
      if (p.arrivalTime <= currentTime && !arrivedSet.has(p.id)) {
        readyQueue.push(p);
        arrivedSet.add(p.id);
      }
    });

    if (newRem > 0) {
      // Put back at the end of queue
      readyQueue.push(currentProcess);
    } else {
      // Process finished
      completedCount++;
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime = firstStartTime.get(currentProcess.id)! - currentProcess.arrivalTime;
    }
  }

  // Restore processes in original order or id order
  const finalProcesses = inputProcesses.map((ip) => processes.find((p) => p.id === ip.id)!);

  return summarizeResult('ROUND_ROBIN', schedule, finalProcesses);
}

function summarizeResult(
  algorithm: SchedulingAlgorithm,
  schedule: GanttBlock[],
  processes: ScheduledProcess[]
): SchedulingResult {
  const n = processes.length;
  const totalWT = processes.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
  const totalTAT = processes.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
  const totalRT = processes.reduce((acc, p) => acc + (p.responseTime || 0), 0);

  const totalTime = schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;
  const busyTime = schedule.filter((b) => !b.isIdle).reduce((acc, b) => acc + (b.endTime - b.startTime), 0);

  const cpuUtilization = totalTime > 0 ? (busyTime / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? (n / totalTime) : 0;

  return {
    algorithm,
    schedule,
    processes,
    avgWaitingTime: n > 0 ? Number((totalWT / n).toFixed(2)) : 0,
    avgTurnaroundTime: n > 0 ? Number((totalTAT / n).toFixed(2)) : 0,
    avgResponseTime: n > 0 ? Number((totalRT / n).toFixed(2)) : 0,
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    throughput: Number(throughput.toFixed(3)),
  };
}

function createEmptyResult(algorithm: SchedulingAlgorithm): SchedulingResult {
  return {
    algorithm,
    schedule: [],
    processes: [],
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    avgResponseTime: 0,
    cpuUtilization: 0,
    throughput: 0,
  };
}
