import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ScheduledProcess, SchedulingAlgorithm, SchedulingResult } from '../types';
import {
  calculateFCFS,
  calculateSJF,
  calculatePriority,
  calculateRoundRobin,
  getProcessColor,
} from '../utils/schedulingAlgorithms';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';

// Initial sample processes matching an ATM transaction dispatch workload
const DEFAULT_ATM_PROCESSES: ScheduledProcess[] = [
  { id: 'P1', name: 'P1 (Lane 1 VIP W/D)', arrivalTime: 0, burstTime: 5, priority: 1 },
  { id: 'P2', name: 'P2 (Lane 2 Reg Dep)', arrivalTime: 1, burstTime: 3, priority: 3 },
  { id: 'P3', name: 'P3 (Lane 3 Reg Inq)', arrivalTime: 2, burstTime: 8, priority: 4 },
  { id: 'P4', name: 'P4 (Lane 4 VIP Stmt)', arrivalTime: 3, burstTime: 6, priority: 1 },
  { id: 'P5', name: 'P5 (Lane 1 Reg W/D)', arrivalTime: 4, burstTime: 4, priority: 2 },
];

// Preset Scenarios
const PRESET_VIP_SCENARIO: ScheduledProcess[] = [
  { id: 'T1', name: 'T1: Regular Cash W/D (Lane 1)', arrivalTime: 0, burstTime: 7, priority: 3 },
  { id: 'T2', name: 'T2: Regular Balance Inq (Lane 2)', arrivalTime: 1, burstTime: 4, priority: 4 },
  { id: 'T3', name: 'T3: VIP Fast Cash (Lane 3)', arrivalTime: 2, burstTime: 3, priority: 1 },
  { id: 'T4', name: 'T4: VIP Card Pin Change (Lane 4)', arrivalTime: 3, burstTime: 5, priority: 1 },
  { id: 'T5', name: 'T5: Audit Log Sync (Batch)', arrivalTime: 4, burstTime: 2, priority: 5 },
];

const PRESET_ROUND_ROBIN_LANES: ScheduledProcess[] = [
  { id: 'L1', name: 'L1: Terminal Lane 1 Debit', arrivalTime: 0, burstTime: 6, priority: 2 },
  { id: 'L2', name: 'L2: Terminal Lane 2 Deposit', arrivalTime: 0, burstTime: 4, priority: 2 },
  { id: 'L3', name: 'L3: Terminal Lane 3 Inquiry', arrivalTime: 0, burstTime: 8, priority: 2 },
  { id: 'L4', name: 'L4: Terminal Lane 4 Mini Stmt', arrivalTime: 0, burstTime: 3, priority: 2 },
];

export const CpuScheduling: React.FC = () => {
  const [processes, setProcesses] = useState<ScheduledProcess[]>(DEFAULT_ATM_PROCESSES);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SchedulingAlgorithm>('FCFS');
  const [quantum, setQuantum] = useState<number>(2);
  const [showComparison, setShowComparison] = useState<boolean>(true);

  // New process input fields
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newArrival, setNewArrival] = useState(0);
  const [newBurst, setNewBurst] = useState(4);
  const [newPriority, setNewPriority] = useState(2);

  // Calculate results dynamically
  const fcfsResult = useMemo(() => calculateFCFS(processes), [processes]);
  const sjfResult = useMemo(() => calculateSJF(processes), [processes]);
  const priorityResult = useMemo(() => calculatePriority(processes), [processes]);
  const rrResult = useMemo(() => calculateRoundRobin(processes, quantum), [processes, quantum]);

  const activeResult: SchedulingResult = useMemo(() => {
    switch (selectedAlgorithm) {
      case 'FCFS':
        return fcfsResult;
      case 'SJF':
        return sjfResult;
      case 'PRIORITY':
        return priorityResult;
      case 'ROUND_ROBIN':
        return rrResult;
      default:
        return fcfsResult;
    }
  }, [selectedAlgorithm, fcfsResult, sjfResult, priorityResult, rrResult]);

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = newId.trim() || `P${processes.length + 1}`;
    const pName = newName.trim() || `${pid} (ATM Lane Txn)`;

    const newProc: ScheduledProcess = {
      id: pid,
      name: pName,
      arrivalTime: Math.max(0, newArrival),
      burstTime: Math.max(1, newBurst),
      priority: Math.max(1, newPriority),
      color: getProcessColor(processes.length),
    };

    setProcesses([...processes, newProc]);
    setNewId('');
    setNewName('');
    setNewArrival(newArrival + 1);
  };

  const handleDeleteProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const handleResetDefault = () => {
    setProcesses(DEFAULT_ATM_PROCESSES);
  };

  const loadPreset = (preset: ScheduledProcess[]) => {
    setProcesses(preset);
  };

  // Find lowest waiting time among algorithms for comparison
  const minWaitTime = Math.min(
    fcfsResult.avgWaitingTime,
    sjfResult.avgWaitingTime,
    priorityResult.avgWaitingTime,
    rrResult.avgWaitingTime
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              CPU Scheduling Simulator
            </h1>
            <Badge variant="steel" size="sm">
              CO3 CPU Scheduling
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Simulate and benchmark FCFS, Non-preemptive SJF, Non-preemptive Priority, and Round Robin scheduling algorithms with real Gantt charts and timing equations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPreset(PRESET_VIP_SCENARIO)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary border border-atmos-border rounded transition-colors shadow-2xs"
          >
            Load VIP Scenario
          </button>
          <button
            onClick={() => loadPreset(PRESET_ROUND_ROBIN_LANES)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary border border-atmos-border rounded transition-colors shadow-2xs"
          >
            Load Multi-Lane RR
          </button>
          <button
            onClick={handleResetDefault}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary border border-atmos-border rounded transition-colors shadow-2xs"
            title="Reset to default benchmark"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SimulatedNotice compact />

      {/* Priority Convention Banner (CO3 requirement) */}
      <div className="p-3 bg-white border border-atmos-border rounded-lg flex items-start gap-3 text-xs text-atmos-secondary shadow-xs">
        <Info className="w-4 h-4 text-atmos-accent shrink-0 mt-0.5" />
        <div>
          <strong className="text-atmos-primary font-medium">Standard Priority Convention:</strong>{' '}
          In this simulator, <span className="underline font-semibold text-atmos-primary">LOWER numerical value represents HIGHER priority</span> (e.g. Priority 1 = VIP Cardholders, Priority 2 = Regular ATM Debit, Priority 5 = Background Log Sync). Ties are deterministically resolved by Arrival Time, then Process ID.
        </div>
      </div>

      {/* Algorithm Selector & Quantum Control */}
      <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['FCFS', 'SJF', 'PRIORITY', 'ROUND_ROBIN'] as SchedulingAlgorithm[]).map((algo) => (
            <button
              key={algo}
              onClick={() => setSelectedAlgorithm(algo)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all border ${
                selectedAlgorithm === algo
                  ? 'bg-atmos-accent text-white border-atmos-accent shadow-xs'
                  : 'bg-white text-atmos-secondary hover:text-atmos-primary border-atmos-border hover:bg-atmos-highlight'
              }`}
            >
              {algo === 'ROUND_ROBIN'
                ? `Round Robin (q=${quantum})`
                : algo === 'PRIORITY'
                ? 'Priority (Non-preemptive)'
                : algo === 'SJF'
                ? 'SJF (Non-preemptive)'
                : 'FCFS (First-Come)'}
            </button>
          ))}
        </div>

        {/* Round Robin Quantum Config */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {selectedAlgorithm === 'ROUND_ROBIN' && (
            <div className="flex items-center gap-2 text-xs">
              <label className="text-atmos-secondary font-medium">Time Quantum (q):</label>
              <input
                type="number"
                min="1"
                max="20"
                value={quantum}
                onChange={(e) => setQuantum(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1 bg-atmos-bg border border-atmos-border rounded font-mono text-center text-atmos-primary focus:outline-hidden"
              />
            </div>
          )}

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 ${
              showComparison
                ? 'bg-atmos-highlight text-atmos-accent border-atmos-border'
                : 'bg-white text-atmos-secondary border-atmos-border hover:bg-atmos-highlight'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Algorithm Comparison</span>
          </button>
        </div>
      </div>

      {/* Visual Gantt Chart (CO3 Visual Requirement) */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-atmos-primary">
              Visual Gantt Execution Timeline ({activeResult.algorithm})
            </h2>
            <p className="text-xs text-atmos-secondary">
              Chronological CPU burst allocations with precise start and finish ticks.
            </p>
          </div>
          <span className="text-xs font-mono text-atmos-secondary">
            Total Cycle Duration: {activeResult.schedule.length > 0 ? activeResult.schedule[activeResult.schedule.length - 1].endTime : 0} units
          </span>
        </div>

        {activeResult.schedule.length === 0 ? (
          <div className="p-8 text-center text-xs text-atmos-secondary bg-atmos-bg/40 rounded border border-dashed border-atmos-border">
            No processes scheduled. Add processes below to render Gantt timeline.
          </div>
        ) : (
          <div className="space-y-4">
            {/* The Gantt Bar */}
            <div className="w-full flex rounded overflow-hidden border border-atmos-border h-11 text-xs select-none shadow-2xs">
              {activeResult.schedule.map((block, idx) => {
                const totalDuration = activeResult.schedule[activeResult.schedule.length - 1].endTime;
                const blockDuration = block.endTime - block.startTime;
                const widthPercent = (blockDuration / totalDuration) * 100;

                return (
                  <div
                    key={idx}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: block.isIdle ? '#ECEFF1' : block.color || '#526B85',
                      color: block.isIdle ? '#737B85' : '#FFFFFF',
                    }}
                    className="flex flex-col items-center justify-center border-r last:border-r-0 border-white/20 px-1 truncate transition-all hover:brightness-105"
                    title={`${block.processName} [${block.startTime} → ${block.endTime}] Duration: ${blockDuration}`}
                  >
                    <span className="font-bold text-[11px] truncate">
                      {block.isIdle ? 'IDLE' : block.processId}
                    </span>
                    <span className="text-[9px] opacity-85 font-mono">
                      {blockDuration}u
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time labels below Gantt chart */}
            <div className="relative w-full h-5 text-[11px] font-mono text-atmos-secondary">
              <span className="absolute left-0">0</span>
              {activeResult.schedule.map((block, idx) => {
                const totalDuration = activeResult.schedule[activeResult.schedule.length - 1].endTime;
                const leftPercent = (block.endTime / totalDuration) * 100;
                return (
                  <span
                    key={idx}
                    style={{ left: `${leftPercent}%` }}
                    className="absolute -translate-x-1/2"
                  >
                    {block.endTime}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-atmos-border">
          <div className="p-3 rounded bg-atmos-bg/50 border border-atmos-border">
            <div className="text-[10px] text-atmos-secondary uppercase font-semibold">
              Average Waiting Time (AWT)
            </div>
            <div className="text-lg font-bold font-mono text-atmos-primary mt-0.5">
              {activeResult.avgWaitingTime} units
            </div>
            <div className="text-[10px] text-atmos-secondary font-mono mt-0.5">
              Σ WT / N
            </div>
          </div>

          <div className="p-3 rounded bg-atmos-bg/50 border border-atmos-border">
            <div className="text-[10px] text-atmos-secondary uppercase font-semibold">
              Average Turnaround Time (ATAT)
            </div>
            <div className="text-lg font-bold font-mono text-atmos-primary mt-0.5">
              {activeResult.avgTurnaroundTime} units
            </div>
            <div className="text-[10px] text-atmos-secondary font-mono mt-0.5">
              Σ TAT / N
            </div>
          </div>

          <div className="p-3 rounded bg-atmos-bg/50 border border-atmos-border">
            <div className="text-[10px] text-atmos-secondary uppercase font-semibold">
              CPU Utilization
            </div>
            <div className="text-lg font-bold font-mono text-atmos-accent mt-0.5">
              {activeResult.cpuUtilization}%
            </div>
            <div className="text-[10px] text-atmos-secondary font-mono mt-0.5">
              (Busy Time / Total) * 100
            </div>
          </div>

          <div className="p-3 rounded bg-atmos-bg/50 border border-atmos-border">
            <div className="text-[10px] text-atmos-secondary uppercase font-semibold">
              Throughput
            </div>
            <div className="text-lg font-bold font-mono text-atmos-teal mt-0.5">
              {activeResult.throughput} p/u
            </div>
            <div className="text-[10px] text-atmos-secondary font-mono mt-0.5">
              Processes completed per unit time
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Timing Table for Selected Algorithm */}
      <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-atmos-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-atmos-primary">
              Process Schedule Metrics Table ({activeResult.algorithm})
            </h3>
            <p className="text-xs text-atmos-secondary">
              Completion Time (CT), Turnaround Time (TAT = CT − AT), and Waiting Time (WT = TAT − BT)
            </p>
          </div>
          <span className="text-xs font-mono text-atmos-secondary">
            Formula: TAT = CT − AT | WT = TAT − BT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">PID</th>
                <th className="py-2.5 px-4">Process Name</th>
                <th className="py-2.5 px-4 font-mono">Arrival (AT)</th>
                <th className="py-2.5 px-4 font-mono">Burst (BT)</th>
                <th className="py-2.5 px-4 font-mono">Priority</th>
                <th className="py-2.5 px-4 font-mono">Completion (CT)</th>
                <th className="py-2.5 px-4 font-mono">Turnaround (TAT)</th>
                <th className="py-2.5 px-4 font-mono">Waiting (WT)</th>
                <th className="py-2.5 px-4 font-mono">Response (RT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atmos-border text-atmos-primary">
              {activeResult.processes.map((proc) => (
                <tr key={proc.id} className="hover:bg-atmos-highlight/40 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">
                    {proc.id}
                  </td>
                  <td className="py-2.5 px-4 font-medium">{proc.name}</td>
                  <td className="py-2.5 px-4 font-mono">{proc.arrivalTime}</td>
                  <td className="py-2.5 px-4 font-mono">{proc.burstTime}</td>
                  <td className="py-2.5 px-4 font-mono">
                    <Badge variant={proc.priority === 1 ? 'warning' : 'default'} size="sm">
                      P{proc.priority} {proc.priority === 1 && '(VIP)'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold">{proc.completionTime}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-atmos-primary">
                    {proc.turnaroundTime}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-atmos-accent">
                    {proc.waitingTime}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-atmos-secondary">{proc.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Across All 4 Algorithms */}
      {showComparison && (
        <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-atmos-primary">
                Multi-Algorithm Performance Benchmarking
              </h3>
              <p className="text-xs text-atmos-secondary">
                Side-by-side comparison of FCFS, SJF, Priority, and Round Robin on the current workload.
              </p>
            </div>
            <span className="text-xs font-mono text-atmos-teal font-medium">
              Target: Minimize Average Waiting Time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { name: 'FCFS', res: fcfsResult, desc: 'First Come, First Served' },
              { name: 'SJF', res: sjfResult, desc: 'Shortest Job First (Non-preemptive)' },
              { name: 'Priority', res: priorityResult, desc: 'Priority (1 = VIP Highest)' },
              { name: 'Round Robin', res: rrResult, desc: `Round Robin (Quantum = ${quantum})` },
            ].map(({ name, res, desc }) => {
              const isBest = res.avgWaitingTime === minWaitTime && res.avgWaitingTime > 0;
              return (
                <div
                  key={name}
                  className={`p-4 rounded-lg border transition-all ${
                    isBest
                      ? 'border-atmos-teal bg-[#F0F5F4] ring-1 ring-atmos-teal'
                      : 'border-atmos-border bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-atmos-primary">{name}</span>
                    {isBest && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-atmos-teal text-white font-medium">
                        OPTIMAL AWT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-atmos-secondary mb-3">{desc}</div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-atmos-secondary">Avg Waiting Time:</span>
                      <span className="font-bold text-atmos-primary">{res.avgWaitingTime} u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-atmos-secondary">Avg Turnaround:</span>
                      <span className="font-bold text-atmos-primary">{res.avgTurnaroundTime} u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-atmos-secondary">CPU Utilization:</span>
                      <span>{res.cpuUtilization}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Process Input & Management Form */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-atmos-primary mb-3">
          Configure Workload Processes
        </h3>

        {/* Add process form */}
        <form onSubmit={handleAddProcess} className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4 text-xs">
          <div>
            <label className="block text-atmos-secondary mb-1">Process ID</label>
            <input
              type="text"
              placeholder="e.g. P6"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="w-full bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-atmos-secondary mb-1">Transaction Label</label>
            <input
              type="text"
              placeholder="e.g. VIP Lane Cash W/D"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-atmos-secondary mb-1">Arrival Time</label>
            <input
              type="number"
              min="0"
              value={newArrival}
              onChange={(e) => setNewArrival(Number(e.target.value))}
              className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-atmos-secondary mb-1">Burst Time</label>
            <input
              type="number"
              min="1"
              value={newBurst}
              onChange={(e) => setNewBurst(Number(e.target.value))}
              className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-atmos-secondary mb-1">Priority (1=High)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-atmos-accent hover:bg-atmos-accentHover text-white rounded font-medium flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Existing process pills */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-atmos-border">
          {processes.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-atmos-bg border border-atmos-border rounded text-xs"
            >
              <span className="font-bold text-atmos-primary font-mono">{p.id}</span>
              <span className="text-atmos-secondary text-[11px]">
                (AT:{p.arrivalTime}, BT:{p.burstTime}, P:{p.priority})
              </span>
              <button
                onClick={() => handleDeleteProcess(p.id)}
                className="text-atmos-secondary hover:text-atmos-error"
                title="Remove process"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
