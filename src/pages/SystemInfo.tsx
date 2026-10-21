import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Layers,
  FolderGit2,
  HardDrive,
  ShieldCheck,
  Clock,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Activity,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { formatUptime, formatCurrency } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';
import { ResetModal } from '../components/common/ResetModal';

export const SystemInfo: React.FC = () => {
  const { uptimeSeconds, metrics, processes, resetToDemoData, atmCash } = useSimulation();
  const [isResetOpen, setIsResetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              OS Architecture & System Information
            </h1>
            <Badge variant="steel" size="sm">
              CO1 OS Concepts & RTOS
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Simulated embedded real-time operating system specifications, classification criteria, and microkernel service architecture for ATM terminal hardware.
          </p>
        </div>

        <button
          onClick={() => setIsResetOpen(true)}
          className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary border border-atmos-border rounded transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Simulation
        </button>
      </div>

      <SimulatedNotice />

      {/* Core Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-atmos-secondary mb-2">
            <span className="font-semibold uppercase text-[10px]">OS System Identity</span>
            <Server className="w-4 h-4 text-atmos-accent" />
          </div>
          <div className="text-base font-bold text-atmos-primary">ATMOS Embedded</div>
          <div className="text-xs text-atmos-secondary mt-0.5">Kernel Build: v2.4.18-rt</div>
          <div className="mt-2 text-[11px] font-mono text-atmos-accent">POSIX.1b RT Compliant</div>
        </div>

        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-atmos-secondary mb-2">
            <span className="font-semibold uppercase text-[10px]">System Classification</span>
            <Activity className="w-4 h-4 text-atmos-teal" />
          </div>
          <div className="text-base font-bold text-atmos-primary">Dual-Tier RTOS</div>
          <div className="text-xs text-atmos-secondary mt-0.5">Hard &amp; Soft Real-Time</div>
          <div className="mt-2 text-[11px] font-mono text-atmos-teal">Deterministic Scheduling</div>
        </div>

        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-atmos-secondary mb-2">
            <span className="font-semibold uppercase text-[10px]">Continuous Uptime</span>
            <Clock className="w-4 h-4 text-atmos-secondary" />
          </div>
          <div className="text-base font-bold font-mono text-atmos-primary">
            {formatUptime(uptimeSeconds)}
          </div>
          <div className="text-xs text-atmos-secondary mt-0.5">Elapsed since cold boot</div>
          <div className="mt-2 text-[11px] font-mono text-atmos-secondary">Clock: 1000 Hz Tick</div>
        </div>

        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-atmos-secondary mb-2">
            <span className="font-semibold uppercase text-[10px]">Active OS Threads</span>
            <Cpu className="w-4 h-4 text-atmos-warning" />
          </div>
          <div className="text-base font-bold font-mono text-atmos-primary">
            {metrics.activeProcessesCount} Tasks
          </div>
          <div className="text-xs text-atmos-secondary mt-0.5">Across 4 hardware lanes</div>
          <div className="mt-2 text-[11px] font-mono text-atmos-accent">CPU: {metrics.cpuUtilizationPercent}%</div>
        </div>
      </div>

      {/* Embedded OS & Real-Time Classification Detailed Section */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-atmos-primary mb-1">
          Real-Time System Classification &amp; Deadline Guarantees
        </h2>
        <p className="text-xs text-atmos-secondary mb-4">
          How an ATM embedded operating system categorizes and enforces deadlines across various peripheral modules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Hard Real-Time */}
          <div className="p-4 rounded-lg border border-[#F4D9D9] bg-atmos-errorBg/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-atmos-error uppercase text-[11px] tracking-wider">
                1. Hard Real-Time Domain
              </span>
              <Badge variant="error" size="sm">
                Zero Deadline Tolerance
              </Badge>
            </div>
            <p className="text-atmos-secondary text-xs leading-relaxed mb-3">
              Failure to meet timing deadlines results in financial discrepancy, physical device jamming, or catastrophic security breach.
            </p>

            <ul className="space-y-1.5 text-[11px] text-atmos-primary">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-atmos-error" />
                <strong>Cash Cassette Dispenser:</strong> Motor stepping timing to avoid multi-note pulling (&lt; 20ms).
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-atmos-error" />
                <strong>HSM Crypto Key Exchange:</strong> Ephemeral session key destruction upon chassis tamper detection (&lt; 5ms).
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-atmos-error" />
                <strong>Card Shutter Jam Detection:</strong> Optical sensor interrupt polling (&lt; 15ms).
              </li>
            </ul>
          </div>

          {/* Soft Real-Time */}
          <div className="p-4 rounded-lg border border-[#CFDFDC] bg-[#F0F5F4]/60">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-atmos-teal uppercase text-[11px] tracking-wider">
                2. Soft Real-Time Domain
              </span>
              <Badge variant="teal" size="sm">
                Graceful Degradation
              </Badge>
            </div>
            <p className="text-atmos-secondary text-xs leading-relaxed mb-3">
              Occasional deadline misses reduce customer experience quality but do not damage hardware or compromise transaction integrity.
            </p>

            <ul className="space-y-1.5 text-[11px] text-atmos-primary">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-atmos-teal" />
                <strong>Thermal Receipt Printer:</strong> Line feed and text burning buffer output (&lt; 500ms).
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-atmos-teal" />
                <strong>Central Switch Network Sync:</strong> ISO 8583 banking host messaging with retry window (&lt; 3000ms).
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-atmos-teal" />
                <strong>LCD Screen Rerendering:</strong> Touchscreen UI feedback animations (&lt; 100ms).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Five Core OS Services (CO1 Syllabus Requirement) */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-atmos-primary mb-1">
          ATMOS Core Operating System Services (CO1)
        </h2>
        <p className="text-xs text-atmos-secondary mb-4">
          Implementation mechanisms for standard OS services adapted for financial embedded terminals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Service 1 */}
          <div className="p-3.5 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-atmos-primary">
              <Cpu className="w-4 h-4 text-atmos-accent" />
              <span>1. Process Management</span>
            </div>
            <p className="text-atmos-secondary text-[11px] leading-relaxed">
              Maintains Process Control Blocks (PCBs) for concurrent card transactions across lanes. Implements priority scheduling and preemption between VIP and background tasks.
            </p>
          </div>

          {/* Service 2 */}
          <div className="p-3.5 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-atmos-primary">
              <Layers className="w-4 h-4 text-atmos-teal" />
              <span>2. Memory Management</span>
            </div>
            <p className="text-atmos-secondary text-[11px] leading-relaxed">
              Manages 1024 KB partitioned transaction buffers. Isolates sensitive cardholder track data with hardware memory protection rings and simulates FIFO page frame replacement.
            </p>
          </div>

          {/* Service 3 */}
          <div className="p-3.5 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-atmos-primary">
              <FolderGit2 className="w-4 h-4 text-atmos-secondary" />
              <span>3. File &amp; Storage Management</span>
            </div>
            <p className="text-atmos-secondary text-[11px] leading-relaxed">
              Maintains an indexed transaction log file system across 64 virtual flash blocks. Supports direct pointer lookup for fast account-wise mini-statement queries.
            </p>
          </div>

          {/* Service 4 */}
          <div className="p-3.5 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-atmos-primary">
              <HardDrive className="w-4 h-4 text-atmos-warning" />
              <span>4. I/O Device Management</span>
            </div>
            <p className="text-atmos-secondary text-[11px] leading-relaxed">
              Standardized device drivers for Cash Dispenser Cassette, Motorized Card Reader (EMV), Encrypted PIN Pad (EPP), and Thermal Printer with DMA buffers.
            </p>
          </div>

          {/* Service 5 */}
          <div className="p-3.5 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-atmos-primary">
              <ShieldCheck className="w-4 h-4 text-atmos-success" />
              <span>5. Security &amp; Protection</span>
            </div>
            <p className="text-atmos-secondary text-[11px] leading-relaxed">
              Dual-mode CPU execution (Kernel vs User mode). Hardware Security Module (HSM) isolating 3DES/AES cryptographic keys from user-space application memory.
            </p>
          </div>

          {/* Service 6 */}
          <div className="p-3.5 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-atmos-primary">
              <Terminal className="w-4 h-4 text-atmos-accent" />
              <span>6. Deadlock Avoidance</span>
            </div>
            <p className="text-atmos-secondary text-[11px] leading-relaxed">
              Applies Dijkstra&apos;s Banker&apos;s Algorithm prior to granting physical dispenser and HSM reservations, ensuring the ATM system always operates in a safe state.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison: General-Purpose OS vs Embedded RTOS */}
      <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-atmos-border">
          <h3 className="text-sm font-semibold text-atmos-primary">
            General-Purpose OS (GPOS) vs. Embedded ATM RTOS Comparison
          </h3>
          <p className="text-xs text-atmos-secondary">
            Key operational differences essential for CE Sem 5 OSY viva explanation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Evaluation Dimension</th>
                <th className="py-2.5 px-4">General-Purpose OS (e.g. Windows/macOS)</th>
                <th className="py-2.5 px-4">Embedded ATM RTOS (ATMOS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atmos-border text-atmos-primary">
              <tr className="hover:bg-atmos-highlight/30">
                <td className="py-2.5 px-4 font-semibold">Primary Goal</td>
                <td className="py-2.5 px-4 text-atmos-secondary">High throughput &amp; user multitasking</td>
                <td className="py-2.5 px-4 font-bold text-atmos-primary">Deterministic response &amp; deadline adherence</td>
              </tr>
              <tr className="hover:bg-atmos-highlight/30">
                <td className="py-2.5 px-4 font-semibold">Interrupt Latency</td>
                <td className="py-2.5 px-4 text-atmos-secondary">Unbounded, best-effort (~10–50 ms)</td>
                <td className="py-2.5 px-4 font-mono font-bold text-atmos-teal">Guaranteed microsecond bounds (&lt; 50 µs)</td>
              </tr>
              <tr className="hover:bg-atmos-highlight/30">
                <td className="py-2.5 px-4 font-semibold">Memory Footprint</td>
                <td className="py-2.5 px-4 text-atmos-secondary">Gigabytes (Virtual memory with swap file)</td>
                <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">Megabytes (Locked buffer partitions)</td>
              </tr>
              <tr className="hover:bg-atmos-highlight/30">
                <td className="py-2.5 px-4 font-semibold">Failure Consequence</td>
                <td className="py-2.5 px-4 text-atmos-secondary">System reboot, application crash report</td>
                <td className="py-2.5 px-4 text-atmos-error font-medium">Financial loss, hardware jam, security lock</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={resetToDemoData}
      />
    </div>
  );
};
