import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  HelpCircle,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { BankersProcess, BankersState } from '../types';
import { checkSafety, calculateNeedMatrix, requestResources } from '../utils/bankersAlgorithm';
import { INITIAL_BANKERS_STATE } from '../utils/storage';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';

const UNSAFE_PRESET_PROCESSES: BankersProcess[] = [
  {
    id: 'P0',
    name: 'P0 (Lane 1 Large W/D)',
    allocation: [2, 1, 1, 1],
    max: [3, 2, 2, 2],
    need: [1, 1, 1, 1],
  },
  {
    id: 'P1',
    name: 'P1 (Lane 2 Drive-thru)',
    allocation: [1, 1, 1, 1],
    max: [2, 2, 2, 2],
    need: [1, 1, 1, 1],
  },
  {
    id: 'P2',
    name: 'P2 (Lane 3 Cash Deposit)',
    allocation: [0, 0, 1, 1],
    max: [1, 2, 2, 2],
    need: [1, 2, 1, 1],
  },
];

export const BankersAlgorithm: React.FC = () => {
  const [resourceNames] = useState<string[]>([
    'Cash Dispenser',
    'Receipt Printer',
    'Card Reader',
    'HSM Crypto',
  ]);

  const [available, setAvailable] = useState<number[]>([1, 1, 1, 1]);
  const [processes, setProcesses] = useState<BankersProcess[]>(() =>
    calculateNeedMatrix(INITIAL_BANKERS_STATE.processes)
  );

  // Resource Request Tester State
  const [selectedProcessIdx, setSelectedProcessIdx] = useState<number>(1);
  const [requestVector, setRequestVector] = useState<number[]>([0, 1, 0, 0]);
  const [requestFeedback, setRequestFeedback] = useState<{
    tested: boolean;
    granted: boolean;
    reason: string;
    safeSeq: string[];
  } | null>(null);

  // Run Banker's Safety Algorithm
  const safetyResult = useMemo(() => {
    return checkSafety(available, processes);
  }, [available, processes]);

  // Handle cell edit for Allocation or Max
  const handleMatrixChange = (
    procIndex: number,
    matrixType: 'allocation' | 'max',
    resIndex: number,
    value: number
  ) => {
    const val = Math.max(0, value);
    setProcesses((prev) => {
      const updated = prev.map((p, idx) => {
        if (idx === procIndex) {
          const newAlloc = [...p.allocation];
          const newMax = [...p.max];
          if (matrixType === 'allocation') {
            newAlloc[resIndex] = val;
          } else {
            newMax[resIndex] = val;
          }
          return {
            ...p,
            allocation: newAlloc,
            max: newMax,
            need: newMax.map((mVal, rI) => Math.max(0, mVal - (newAlloc[rI] || 0))),
          };
        }
        return p;
      });
      return updated;
    });
    setRequestFeedback(null);
  };

  const handleAvailableChange = (resIndex: number, value: number) => {
    const val = Math.max(0, value);
    setAvailable((prev) => {
      const next = [...prev];
      next[resIndex] = val;
      return next;
    });
    setRequestFeedback(null);
  };

  const handleTestRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const currentState: BankersState = {
      resourceNames,
      totalInstances: [3, 2, 4, 3],
      available,
      processes,
      isSafe: safetyResult.isSafe,
      safeSequence: safetyResult.safeSequence,
      executionSteps: safetyResult.steps,
    };

    const res = requestResources(currentState, selectedProcessIdx, requestVector);
    setRequestFeedback({
      tested: true,
      granted: res.granted,
      reason: res.reason,
      safeSeq: res.safeSequence,
    });
  };

  const handleApplyRequestToState = () => {
    if (!requestFeedback || !requestFeedback.granted) return;

    // Apply tentatively granted request
    const testAvailable = available.map((val, j) => val - requestVector[j]);
    const testProcesses = processes.map((p, idx) => {
      if (idx === selectedProcessIdx) {
        const newAlloc = p.allocation.map((val, j) => val + requestVector[j]);
        const newNeed = p.need.map((val, j) => val - requestVector[j]);
        return {
          ...p,
          allocation: newAlloc,
          need: newNeed,
        };
      }
      return p;
    });

    setAvailable(testAvailable);
    setProcesses(testProcesses);
    setRequestFeedback(null);
  };

  const handleLoadSafePreset = () => {
    setAvailable([1, 1, 1, 1]);
    setProcesses(calculateNeedMatrix(INITIAL_BANKERS_STATE.processes));
    setRequestFeedback(null);
  };

  const handleLoadUnsafePreset = () => {
    setAvailable([0, 0, 0, 0]); // Zero available resources causes deadlock deadlock
    setProcesses(calculateNeedMatrix(UNSAFE_PRESET_PROCESSES));
    setRequestFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              Banker’s Algorithm & Resource Allocation
            </h1>
            <Badge variant="steel" size="sm">
              CO3 Deadlock Avoidance
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Simulate deadlock avoidance in concurrent ATM transactions sharing physical cash dispensers, receipt printers, card readers, and cryptographic HSM modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSafePreset}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary border border-atmos-border rounded transition-colors shadow-2xs"
          >
            Safe State Preset
          </button>
          <button
            onClick={handleLoadUnsafePreset}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-error border border-atmos-border rounded transition-colors shadow-2xs"
          >
            Deadlock / Unsafe Preset
          </button>
          <button
            onClick={handleLoadSafePreset}
            className="p-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary rounded border border-atmos-border shadow-2xs"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SimulatedNotice compact />

      {/* Safety Status Banner */}
      <div
        className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
          safetyResult.isSafe
            ? 'bg-atmos-successBg border-[#D3E2D8] text-atmos-primary'
            : 'bg-atmos-errorBg border-[#F4D9D9] text-atmos-primary'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {safetyResult.isSafe ? (
              <ShieldCheck className="w-5 h-5 text-atmos-success" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-atmos-error" />
            )}
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider">
              {safetyResult.isSafe ? 'System Status: SAFE STATE' : 'System Status: UNSAFE STATE (DEADLOCK RISK)'}
            </div>
            <div className="text-xs text-atmos-secondary mt-0.5">
              {safetyResult.isSafe ? (
                <>
                  A safe sequence exists where all processes can execute to completion without deadlock:
                  <span className="font-mono font-bold text-atmos-primary ml-1.5">
                    &lt; {safetyResult.safeSequence.join(' → ')} &gt;
                  </span>
                </>
              ) : (
                'No safe sequence could be found. With current Available vectors, remaining processes cannot be guaranteed execution without deadlock.'
              )}
            </div>
          </div>
        </div>

        <Badge variant={safetyResult.isSafe ? 'success' : 'error'} size="md">
          {safetyResult.isSafe ? 'DEADLOCK FREE' : 'POTENTIAL DEADLOCK'}
        </Badge>
      </div>

      {/* Available Resources Vector Inputs */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-atmos-primary mb-1">
          Available Vector [A]
        </h2>
        <p className="text-xs text-atmos-secondary mb-3">
          Currently unallocated shared hardware instances in the ATM cluster.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {resourceNames.map((resName, rIdx) => (
            <div key={resName} className="p-3 rounded bg-atmos-bg/50 border border-atmos-border">
              <label className="block text-[11px] font-medium text-atmos-secondary truncate mb-1">
                {resName}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={available[rIdx]}
                  onChange={(e) => handleAvailableChange(rIdx, Number(e.target.value))}
                  className="w-full text-sm font-mono font-bold bg-white border border-atmos-border rounded px-2.5 py-1 text-atmos-primary focus:outline-hidden"
                />
                <span className="text-[11px] text-atmos-secondary">Units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation, Max, and Calculated Need Matrices */}
      <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-atmos-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-atmos-primary">
              Resource Matrices: Allocation, Max, and Need
            </h2>
            <p className="text-xs text-atmos-secondary">
              Formula: Need[i][j] = Max[i][j] − Allocation[i][j]
            </p>
          </div>
          <span className="text-[11px] font-mono text-atmos-secondary">
            Editable cells: Allocation & Max
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4" rowSpan={2}>Process Name</th>
                <th className="py-2 px-3 text-center border-l border-atmos-border" colSpan={4}>
                  Allocation Matrix
                </th>
                <th className="py-2 px-3 text-center border-l border-atmos-border" colSpan={4}>
                  Max Demand Matrix
                </th>
                <th className="py-2 px-3 text-center border-l border-atmos-border bg-atmos-highlight/30" colSpan={4}>
                  Calculated Need Matrix (Max − Alloc)
                </th>
              </tr>
              <tr className="bg-atmos-bg/50 border-b border-atmos-border text-atmos-secondary font-mono text-[9px]">
                {/* Allocation Headers */}
                {resourceNames.map((r) => (
                  <th key={`alloc-h-${r}`} className="py-1 px-2 text-center border-l border-atmos-border">
                    {r.split(' ')[0]}
                  </th>
                ))}
                {/* Max Headers */}
                {resourceNames.map((r) => (
                  <th key={`max-h-${r}`} className="py-1 px-2 text-center border-l border-atmos-border">
                    {r.split(' ')[0]}
                  </th>
                ))}
                {/* Need Headers */}
                {resourceNames.map((r) => (
                  <th key={`need-h-${r}`} className="py-1 px-2 text-center border-l border-atmos-border bg-atmos-highlight/30">
                    {r.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-atmos-border text-atmos-primary">
              {processes.map((proc, pIdx) => (
                <tr key={proc.id} className="hover:bg-atmos-highlight/30 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium">
                    <div className="text-atmos-primary font-semibold">{proc.name}</div>
                    <div className="text-[10px] text-atmos-secondary">ID: {proc.id}</div>
                  </td>

                  {/* Allocation Inputs */}
                  {proc.allocation.map((val, rIdx) => (
                    <td key={`alloc-${pIdx}-${rIdx}`} className="py-2 px-2 text-center border-l border-atmos-border">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => handleMatrixChange(pIdx, 'allocation', rIdx, Number(e.target.value))}
                        className="w-11 text-center font-mono py-1 bg-atmos-bg border border-atmos-border rounded focus:outline-hidden"
                      />
                    </td>
                  ))}

                  {/* Max Inputs */}
                  {proc.max.map((val, rIdx) => (
                    <td key={`max-${pIdx}-${rIdx}`} className="py-2 px-2 text-center border-l border-atmos-border">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => handleMatrixChange(pIdx, 'max', rIdx, Number(e.target.value))}
                        className="w-11 text-center font-mono py-1 bg-atmos-bg border border-atmos-border rounded focus:outline-hidden"
                      />
                    </td>
                  ))}

                  {/* Calculated Need Output */}
                  {proc.need.map((val, rIdx) => (
                    <td
                      key={`need-${pIdx}-${rIdx}`}
                      className="py-2 px-2 text-center font-mono font-bold text-atmos-accent border-l border-atmos-border bg-atmos-highlight/20"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-by-Step Educational Safety Trace */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-atmos-primary mb-1">
          Safety Algorithm Step-by-Step Execution Trace
        </h3>
        <p className="text-xs text-atmos-secondary mb-4">
          Visual verification of the Banker&apos;s Safety Algorithm loops.
        </p>

        <div className="space-y-2.5">
          {safetyResult.steps.map((st) => (
            <div
              key={st.step}
              className={`p-3 rounded border text-xs flex items-start gap-3 ${
                st.canExecute
                  ? 'bg-atmos-bg border-atmos-border'
                  : 'bg-atmos-errorBg border-[#F4D9D9]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 ${
                  st.canExecute
                    ? 'bg-atmos-highlight text-atmos-accent'
                    : 'bg-[#F4D9D9] text-atmos-error font-bold'
                }`}
              >
                {st.step}
              </div>
              <div className="flex-1">
                <div className="font-medium text-atmos-primary">{st.description}</div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 font-mono text-[11px] text-atmos-secondary">
                  <span>Work Before: [{st.workBefore.join(', ')}]</span>
                  <span>→</span>
                  <span className="font-bold text-atmos-primary">
                    Work After Release: [{st.workAfter.join(', ')}]
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Request Algorithm Simulator */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-atmos-border mb-4">
          <div>
            <h3 className="text-sm font-semibold text-atmos-primary">
              Resource Request Algorithm Tester (Request_i)
            </h3>
            <p className="text-xs text-atmos-secondary">
              Test whether a runtime resource request from an active ATM lane can be safely granted or must wait.
            </p>
          </div>
          <span className="text-[11px] font-mono text-atmos-secondary">
            Rules: Request ≤ Need &amp; Request ≤ Available
          </span>
        </div>

        <form onSubmit={handleTestRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {/* Process Picker */}
            <div>
              <label className="block text-atmos-secondary font-medium mb-1">
                Requesting Process
              </label>
              <select
                value={selectedProcessIdx}
                onChange={(e) => {
                  setSelectedProcessIdx(Number(e.target.value));
                  setRequestFeedback(null);
                }}
                className="w-full bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
              >
                {processes.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Request Vector Inputs */}
            {resourceNames.map((resName, rIdx) => (
              <div key={`req-${resName}`}>
                <label className="block text-atmos-secondary font-medium mb-1 truncate">
                  Req: {resName}
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={requestVector[rIdx]}
                  onChange={(e) => {
                    const next = [...requestVector];
                    next[rIdx] = Math.max(0, Number(e.target.value));
                    setRequestVector(next);
                    setRequestFeedback(null);
                  }}
                  className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-atmos-accent hover:bg-atmos-accentHover text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              Evaluate Request Safety
            </button>
          </div>
        </form>

        {/* Feedback on Request */}
        {requestFeedback && (
          <div
            className={`mt-4 p-4 rounded-lg border text-xs ${
              requestFeedback.granted
                ? 'bg-atmos-successBg border-[#D3E2D8] text-atmos-primary'
                : 'bg-atmos-errorBg border-[#F4D9D9] text-atmos-primary'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {requestFeedback.granted ? (
                <CheckCircle2 className="w-4 h-4 text-atmos-success shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-atmos-error shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-xs mb-1">
                  {requestFeedback.granted
                    ? 'Request Approved by Banker’s Algorithm'
                    : 'Request Rejected / Process Blocked'}
                </div>
                <p className="leading-relaxed text-[11px] text-atmos-secondary">
                  {requestFeedback.reason}
                </p>

                {requestFeedback.granted && (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={handleApplyRequestToState}
                      className="px-3 py-1.5 bg-atmos-success text-white rounded font-medium text-xs hover:bg-[#436651] transition-colors"
                    >
                      Apply Allocation to System State
                    </button>
                    <span className="text-[11px] font-mono text-atmos-secondary">
                      Safe Sequence: &lt; {requestFeedback.safeSeq.join(' → ')} &gt;
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
