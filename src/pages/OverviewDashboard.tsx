import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Cpu,
  Clock,
  ShieldAlert,
  Layers,
  FolderGit2,
  Server,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';
import { formatCurrency, formatDateTime, maskAccountNumber } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const {
    metrics,
    processes,
    files,
    atmCash,
    scheduleNextProcess,
    accounts,
  } = useSimulation();

  // Process state counts for CO2 telemetry
  const stateCounts = {
    NEW: processes.filter((p) => p.state === 'NEW').length,
    READY: processes.filter((p) => p.state === 'READY').length,
    RUNNING: processes.filter((p) => p.state === 'RUNNING').length,
    WAITING: processes.filter((p) => p.state === 'WAITING').length,
    TERMINATED: processes.filter((p) => p.state === 'TERMINATED').length,
  };

  // Activity breakdown by lane
  const laneActivity = [
    { lane: 'Lane 1', count: files.filter((_, i) => i % 4 === 0).length + 3, active: processes.filter((p) => p.laneNumber === 1 && p.state !== 'TERMINATED').length },
    { lane: 'Lane 2', count: files.filter((_, i) => i % 4 === 1).length + 2, active: processes.filter((p) => p.laneNumber === 2 && p.state !== 'TERMINATED').length },
    { lane: 'Lane 3', count: files.filter((_, i) => i % 4 === 2).length + 4, active: processes.filter((p) => p.laneNumber === 3 && p.state !== 'TERMINATED').length },
    { lane: 'Lane 4', count: files.filter((_, i) => i % 4 === 3).length + 1, active: processes.filter((p) => p.laneNumber === 4 && p.state !== 'TERMINATED').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-atmos-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              ATM Operations Control Center
            </h1>
            <Badge variant="steel" size="sm">
              CO1 — CO5
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Real-time telemetry and process synchronization for multi-lane bank ATM embedded operating system.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={scheduleNextProcess}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-primary border border-atmos-border rounded transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-atmos-accent" />
            Dispatch Ready Process
          </button>
          <Link
            to="/atm"
            className="px-3 py-1.5 text-xs font-medium bg-atmos-accent hover:bg-atmos-accentHover text-white rounded transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Launch Terminal
          </Link>
        </div>
      </div>

      {/* Educational Notice */}
      <SimulatedNotice />

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={metrics.totalTransactionsCount}
          subtext={`${files.length} indexed files stored`}
          icon={TrendingUp}
          badge="+4 today"
          badgeVariant="success"
        />
        <StatCard
          title="Active PCB Processes"
          value={metrics.activeProcessesCount}
          subtext={`${stateCounts.RUNNING} running, ${stateCounts.READY} ready`}
          icon={Cpu}
          badge="CO2 Process"
          badgeVariant="steel"
        />
        <StatCard
          title="Available Cash in Vault"
          value={formatCurrency(atmCash)}
          subtext="Capacity: ₹10,00,000"
          icon={CreditCard}
          badge="Dispenser OK"
          badgeVariant="success"
        />
        <StatCard
          title="Memory Buffer Usage"
          value={`${metrics.memoryUsedKB} KB`}
          subtext={`of ${metrics.memoryTotalKB} KB total partition pool`}
          icon={Layers}
          badge={`${Math.round((metrics.memoryUsedKB / metrics.memoryTotalKB) * 100)}% Used`}
          badgeVariant={metrics.memoryUsedKB > 800 ? 'warning' : 'teal'}
        />
      </div>

      {/* Middle Row: Process State Breakdown & Lane Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process State Lifecycle Telemetry (CO2) */}
        <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-atmos-primary">
                Process State Distribution (CO2)
              </h2>
              <Link
                to="/processes"
                className="text-xs text-atmos-accent hover:underline flex items-center gap-1"
              >
                View PCB <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-atmos-secondary mb-4">
              Real-time snapshot of the 5-state process lifecycle queue.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-atmos-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#526B85]" /> RUNNING
                  </span>
                  <span className="font-mono text-atmos-secondary">{stateCounts.RUNNING} process</span>
                </div>
                <div className="w-full bg-atmos-highlight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#526B85] h-full transition-all"
                    style={{ width: `${(stateCounts.RUNNING / Math.max(1, processes.length)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-atmos-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#638A84]" /> READY
                  </span>
                  <span className="font-mono text-atmos-secondary">{stateCounts.READY} process</span>
                </div>
                <div className="w-full bg-atmos-highlight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#638A84] h-full transition-all"
                    style={{ width: `${(stateCounts.READY / Math.max(1, processes.length)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-atmos-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A78045]" /> WAITING (I/O)
                  </span>
                  <span className="font-mono text-atmos-secondary">{stateCounts.WAITING} process</span>
                </div>
                <div className="w-full bg-atmos-highlight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#A78045] h-full transition-all"
                    style={{ width: `${(stateCounts.WAITING / Math.max(1, processes.length)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-atmos-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#737B85]" /> NEW
                  </span>
                  <span className="font-mono text-atmos-secondary">{stateCounts.NEW} process</span>
                </div>
                <div className="w-full bg-atmos-highlight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#737B85] h-full transition-all"
                    style={{ width: `${(stateCounts.NEW / Math.max(1, processes.length)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-atmos-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#527A62]" /> TERMINATED
                  </span>
                  <span className="font-mono text-atmos-secondary">{stateCounts.TERMINATED} process</span>
                </div>
                <div className="w-full bg-atmos-highlight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#527A62] h-full transition-all"
                    style={{ width: `${(stateCounts.TERMINATED / Math.max(1, processes.length)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-atmos-border flex items-center justify-between text-[11px] text-atmos-secondary">
            <span>Scheduler: Priority + Preemption check</span>
            <span className="font-mono">Ticks: 1000ms</span>
          </div>
        </div>

        {/* Lane Activity Chart */}
        <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-atmos-primary">
                Multi-Lane Transaction Activity
              </h2>
              <span className="text-xs text-atmos-secondary">Simulated ATM Kiosk Terminals</span>
            </div>
            <p className="text-xs text-atmos-secondary mb-3">
              Distribution of concurrent financial requests across simulated physical hardware lanes.
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={laneActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="lane" tick={{ fontSize: 11, fill: '#737B85' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#737B85' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E5E8',
                      fontSize: '12px',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="count" name="Completed Logs" fill="#526B85" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="Active Threads" fill="#638A84" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-atmos-border flex items-center justify-between text-xs text-atmos-secondary">
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-[#526B85] rounded-xs" /> Completed Records
              <span className="inline-block w-3 h-3 bg-[#638A84] rounded-xs ml-2" /> Active Lane Threads
            </span>
            <Link to="/scheduling" className="text-atmos-accent hover:underline flex items-center gap-1">
              Configure RR Quantum <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards for all 5 Course Outcomes */}
      <div>
        <h2 className="text-sm font-semibold text-atmos-primary mb-3">
          Explore Operating System Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/processes"
            className="bg-white border border-atmos-border hover:border-atmos-accent rounded-lg p-4 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                CO2 Process Management
              </span>
              <Cpu className="w-4 h-4 text-atmos-secondary group-hover:text-atmos-accent" />
            </div>
            <h3 className="text-sm font-semibold text-atmos-primary group-hover:text-atmos-accent transition-colors">
              Process Manager & PCB
            </h3>
            <p className="text-xs text-atmos-secondary mt-1 line-clamp-2">
              Observe process control blocks, register snapshots, and transition card transactions through the 5 OS states.
            </p>
          </Link>

          <Link
            to="/scheduling"
            className="bg-white border border-atmos-border hover:border-atmos-accent rounded-lg p-4 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                CO3 CPU Scheduling
              </span>
              <Clock className="w-4 h-4 text-atmos-secondary group-hover:text-atmos-accent" />
            </div>
            <h3 className="text-sm font-semibold text-atmos-primary group-hover:text-atmos-accent transition-colors">
              CPU Scheduling Simulator
            </h3>
            <p className="text-xs text-atmos-secondary mt-1 line-clamp-2">
              Compare FCFS, SJF, Priority (VIP vs Regular), and Round Robin with interactive Gantt charts and waiting time benchmarks.
            </p>
          </Link>

          <Link
            to="/bankers"
            className="bg-white border border-atmos-border hover:border-atmos-accent rounded-lg p-4 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                CO3 Deadlock Avoidance
              </span>
              <ShieldAlert className="w-4 h-4 text-atmos-secondary group-hover:text-atmos-accent" />
            </div>
            <h3 className="text-sm font-semibold text-atmos-primary group-hover:text-atmos-accent transition-colors">
              Banker’s Safety Algorithm
            </h3>
            <p className="text-xs text-atmos-secondary mt-1 line-clamp-2">
              Calculate Need matrices, find safe sequences, and simulate resource requests across cash dispensers and HSM modules.
            </p>
          </Link>

          <Link
            to="/memory"
            className="bg-white border border-atmos-border hover:border-atmos-accent rounded-lg p-4 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                CO4 Memory Management
              </span>
              <Layers className="w-4 h-4 text-atmos-secondary group-hover:text-atmos-accent" />
            </div>
            <h3 className="text-sm font-semibold text-atmos-primary group-hover:text-atmos-accent transition-colors">
              Buffer Partitions & FIFO Paging
            </h3>
            <p className="text-xs text-atmos-secondary mt-1 line-clamp-2">
              Inspect transaction memory allocation with internal fragmentation metrics and simulate FIFO page replacement hit/fault ratios.
            </p>
          </Link>

          <Link
            to="/files"
            className="bg-white border border-atmos-border hover:border-atmos-accent rounded-lg p-4 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                CO5 Storage & Files
              </span>
              <FolderGit2 className="w-4 h-4 text-atmos-secondary group-hover:text-atmos-accent" />
            </div>
            <h3 className="text-sm font-semibold text-atmos-primary group-hover:text-atmos-accent transition-colors">
              Indexed Virtual File System
            </h3>
            <p className="text-xs text-atmos-secondary mt-1 line-clamp-2">
              Visualize 64 disk blocks with index block pointers to non-contiguous transaction records and generate mini-statements.
            </p>
          </Link>

          <Link
            to="/system-info"
            className="bg-white border border-atmos-border hover:border-atmos-accent rounded-lg p-4 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                CO1 Embedded RTOS
              </span>
              <Server className="w-4 h-4 text-atmos-secondary group-hover:text-atmos-accent" />
            </div>
            <h3 className="text-sm font-semibold text-atmos-primary group-hover:text-atmos-accent transition-colors">
              Embedded OS Architecture
            </h3>
            <p className="text-xs text-atmos-secondary mt-1 line-clamp-2">
              Review hard vs soft real-time classification, microkernel services, and POSIX compliance simulated for ATM hardware.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-atmos-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-atmos-primary">
              Recent Indexed Transaction Records (CO5)
            </h2>
            <p className="text-xs text-atmos-secondary">
              Transactions stored on virtual storage using indexed block allocation
            </p>
          </div>
          <Link
            to="/files"
            className="text-xs text-atmos-accent hover:underline font-medium flex items-center gap-1"
          >
            Full File System <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Txn / File ID</th>
                <th className="py-2.5 px-4">Account Holder</th>
                <th className="py-2.5 px-4">Card Number</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Index Block</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atmos-border text-atmos-primary">
              {files.slice(0, 5).map((file) => (
                <tr key={file.id} className="hover:bg-atmos-highlight/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-atmos-accent">
                    {file.transactionId}
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    {file.accountHolder}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-atmos-secondary">
                    {maskAccountNumber(file.accountNumber)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-atmos-primary">
                      {file.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium">
                    {file.amount > 0 ? formatCurrency(file.amount) : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-atmos-highlight text-atmos-accent text-[11px]">
                      Block #{file.indexBlock}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant="success" size="sm">
                      {file.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right text-atmos-secondary font-mono text-[11px]">
                    {formatDateTime(file.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
