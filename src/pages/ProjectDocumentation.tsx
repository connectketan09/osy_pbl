import React from 'react';
import {
  Printer,
  Download,
  BookOpen,
  CheckCircle2,
  Cpu,
  Layers,
  FolderGit2,
  Clock,
  ShieldCheck,
  Server,
  FileSpreadsheet,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { Badge } from '../components/common/Badge';

export const ProjectDocumentation: React.FC = () => {
  const { files, processes, accounts, metrics } = useSimulation();

  // Print handler using standard browser print
  const handlePrint = () => {
    window.print();
  };

  // CSV Export for simulated transaction audit records
  const handleExportCsv = () => {
    const headers = [
      'File_ID',
      'Transaction_ID',
      'Account_Number',
      'Account_Holder',
      'Type',
      'Amount_INR',
      'Index_Block',
      'Data_Blocks',
      'Status',
      'Timestamp',
    ];

    const rows = files.map((f) => [
      f.id,
      f.transactionId,
      f.accountNumber,
      `"${f.accountHolder}"`,
      f.type,
      f.amount,
      f.indexBlock,
      `"[${f.dataBlocks.join(';')}]"`,
      f.status,
      f.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ATMOS_Transaction_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Print Actions */}
      <div className="pb-3 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              Project Documentation &amp; Micro-Project Report
            </h1>
            <Badge variant="steel" size="sm">
              OSY 315319
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Complete technical documentation, course outcome alignment (CO1–CO5), mathematical models, and report layout for Semester 5 CE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary border border-atmos-border rounded transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Download CSV of virtual file system records"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-atmos-teal" />
            <span>Export CSV History</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium bg-atmos-accent hover:bg-atmos-accentHover text-white rounded transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Documentation Container */}
      <div className="bg-white border border-atmos-border rounded-lg p-6 sm:p-10 shadow-xs space-y-8 text-atmos-primary card-print">
        {/* Cover / Academic Header Banner */}
        <div className="text-center pb-6 border-b border-atmos-border">
          <div className="text-xs uppercase tracking-widest font-semibold text-atmos-secondary mb-1">
            Maharashtra State Board of Technical Education (MSBTE)
          </div>
          <div className="text-xs text-atmos-secondary font-medium">
            Diploma in Computer Engineering • Semester 5 • Curriculum Scheme &apos;I&apos;
          </div>
          <div className="text-sm font-semibold text-atmos-accent mt-1">
            Subject: Operating Systems (Course Code: 315319 / OSY)
          </div>

          <div className="my-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-atmos-primary uppercase">
              ATMOS — Bank ATM Transaction Simulator
            </h1>
            <p className="text-sm text-atmos-secondary mt-1 font-medium">
              Simulation of an Embedded Real-Time Operating System Managing Concurrent Multi-Lane Financial Transactions
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-atmos-secondary bg-atmos-bg px-4 py-2 rounded border border-atmos-border">
            <span>Project Type: Course PBL Micro-Project</span>
            <span>•</span>
            <span>Academic Year: 2026-2027</span>
            <span>•</span>
            <span>Status: Verified &amp; Operational</span>
          </div>
        </div>

        {/* Section 1: Problem Statement */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2 border-b border-atmos-border pb-1.5">
            <span className="text-atmos-accent font-mono text-sm">1.0</span> Problem Statement
          </h2>
          <p className="text-xs text-atmos-secondary leading-relaxed">
            Modern automated teller machines (ATMs) are mission-critical embedded real-time systems that must service concurrent transaction requests across physical cash dispensers, motorized card readers, encrypted PIN pads (EPP), and network ledgers. In typical diploma operating systems instruction, core concepts such as process scheduling, deadlock avoidance, memory partitioning, and indexed disk allocation are taught as disparate theoretical abstractions. Students frequently struggle to visualize how an embedded OS kernel orchestrates these components simultaneously while adhering to strict deterministic deadlines and resource constraints.
          </p>
          <p className="text-xs text-atmos-secondary leading-relaxed">
            <strong>ATMOS</strong> solves this educational gap by providing a cohesive, mathematically verified, interactive operating system simulator modeled specifically around a bank ATM cluster. It allows students, evaluators, and examiners to observe the end-to-end lifecycle of a financial transaction from interrupt-driven process admission (PCB), buffer allocation, and CPU scheduling, through deadlock-free Banker&apos;s resource granting and indexed non-volatile audit logging.
          </p>
        </section>

        {/* Section 2: Introduction, Aim and Objectives */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2 border-b border-atmos-border pb-1.5">
            <span className="text-atmos-accent font-mono text-sm">2.0</span> Aim &amp; Objectives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/40 space-y-2">
              <h3 className="font-bold text-atmos-primary text-xs uppercase tracking-wider">
                Primary Aim
              </h3>
              <p className="text-atmos-secondary leading-relaxed">
                To design, implement, and benchmark a complete, interactive, college-level Operating Systems project-based learning (PBL) application named <strong>ATMOS</strong> that models the internal resource management, process lifecycles, and storage mechanisms of an embedded real-time bank ATM.
              </p>
            </div>

            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/40 space-y-2">
              <h3 className="font-bold text-atmos-primary text-xs uppercase tracking-wider">
                Key Objectives
              </h3>
              <ul className="space-y-1 text-atmos-secondary list-disc pl-4 leading-relaxed">
                <li>Demonstrate embedded real-time classification (Hard vs Soft RTOS).</li>
                <li>Simulate the standard 5-state process model with live Process Control Block (PCB) structures.</li>
                <li>Implement and benchmark FCFS, Non-preemptive SJF, Priority, and Round Robin scheduling algorithms.</li>
                <li>Guarantee deadlock-free resource allocation among ATM hardware components using Dijkstra&apos;s Banker&apos;s Algorithm.</li>
                <li>Model physical transaction-buffer partitioning and simulate FIFO page replacement caching.</li>
                <li>Demonstrate indexed file allocation on a 64-block virtual disk with account-wise mini-statement queries.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Course Outcome (CO) Mapping */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2 border-b border-atmos-border pb-1.5">
            <span className="text-atmos-accent font-mono text-sm">3.0</span> Course Outcome (CO) Mapping (CO1 to CO5)
          </h2>
          <p className="text-xs text-atmos-secondary">
            Compliance matrix aligning every simulator module to the MSBTE OSY 315319 syllabus outcomes:
          </p>

          <div className="overflow-x-auto border border-atmos-border rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-atmos-bg text-atmos-secondary font-medium uppercase text-[10px]">
                  <th className="py-2.5 px-4 w-16">CO Code</th>
                  <th className="py-2.5 px-4">Course Outcome Statement</th>
                  <th className="py-2.5 px-4">ATMOS Implementation Module</th>
                  <th className="py-2.5 px-4">Practical Verification Skill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atmos-border text-atmos-primary">
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">CO1</td>
                  <td className="py-2.5 px-4">
                    Install and configure operating systems and analyze OS structures.
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    Module A: System Information &amp; Architecture
                  </td>
                  <td className="py-2.5 px-4 text-atmos-secondary">
                    Classification of Hard vs Soft RTOS, microkernel service analysis, and POSIX compliance.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">CO2</td>
                  <td className="py-2.5 px-4">
                    Execute process management concepts and process control blocks.
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    Module B: ATM Process Manager &amp; PCB
                  </td>
                  <td className="py-2.5 px-4 text-atmos-secondary">
                    Interactive 5-state lifecycle transitions (New, Ready, Running, Waiting, Terminated) and PCB inspection.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">CO3</td>
                  <td className="py-2.5 px-4">
                    Apply CPU scheduling algorithms and resolve deadlocks.
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    Module C: CPU Scheduling &amp; Module D: Banker&apos;s Algorithm
                  </td>
                  <td className="py-2.5 px-4 text-atmos-secondary">
                    FCFS, SJF, Priority, and Round Robin Gantt charts; Banker&apos;s safety sequence and request testing.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">CO4</td>
                  <td className="py-2.5 px-4">
                    Apply memory management techniques and page replacement policies.
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    Module E: Memory Partitions &amp; FIFO Paging
                  </td>
                  <td className="py-2.5 px-4 text-atmos-secondary">
                    Buffer allocation with internal fragmentation metrics; step-by-step FIFO hit/fault ratio calculation.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">CO5</td>
                  <td className="py-2.5 px-4">
                    Apply file allocation strategies and directory structures.
                  </td>
                  <td className="py-2.5 px-4 font-medium">
                    Module F: Indexed Virtual File System
                  </td>
                  <td className="py-2.5 px-4 text-atmos-secondary">
                    64-block virtual disk indexing; index block pointer analysis; account-wise mini-statement query generation.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Mathematical Algorithms & Formulations */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2 border-b border-atmos-border pb-1.5">
            <span className="text-atmos-accent font-mono text-sm">4.0</span> Mathematical Formulations &amp; Algorithms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Scheduling Formulations */}
            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/30 space-y-2">
              <h3 className="font-bold text-atmos-primary">
                A. CPU Scheduling Formulas
              </h3>
              <p className="text-atmos-secondary text-[11px] leading-relaxed">
                For a set of <em>n</em> processes with arrival time <em>AT<sub>i</sub></em>, burst time <em>BT<sub>i</sub></em>, and completion time <em>CT<sub>i</sub></em>:
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded border border-atmos-border space-y-1 text-atmos-primary">
                <div>• Turnaround Time (TAT) = CT<sub>i</sub> − AT<sub>i</sub></div>
                <div>• Waiting Time (WT) = TAT<sub>i</sub> − BT<sub>i</sub></div>
                <div>• Average Waiting Time (AWT) = (Σ WT<sub>i</sub>) / n</div>
                <div>• Average Turnaround Time (ATAT) = (Σ TAT<sub>i</sub>) / n</div>
                <div>• CPU Utilization = (Total Busy Time / Schedule Horizon) × 100%</div>
              </div>
            </div>

            {/* Banker's Formulations */}
            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/30 space-y-2">
              <h3 className="font-bold text-atmos-primary">
                B. Banker&apos;s Deadlock Avoidance Equations
              </h3>
              <p className="text-atmos-secondary text-[11px] leading-relaxed">
                Let <em>Available[m]</em>, <em>Max[n][m]</em>, and <em>Allocation[n][m]</em> be system matrices:
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded border border-atmos-border space-y-1 text-atmos-primary">
                <div>• Need[i][j] = Max[i][j] − Allocation[i][j]</div>
                <div>• Condition 1: Request<sub>i</sub> ≤ Need<sub>i</sub></div>
                <div>• Condition 2: Request<sub>i</sub> ≤ Available</div>
                <div>• Work Vector Update: Work = Work + Allocation<sub>i</sub></div>
                <div>• State is SAFE iff Finish[i] = true ∀ i ∈ [0..n−1]</div>
              </div>
            </div>

            {/* FIFO Page Replacement */}
            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/30 space-y-2">
              <h3 className="font-bold text-atmos-primary">
                C. FIFO Page Replacement Metric Model
              </h3>
              <p className="text-atmos-secondary text-[11px] leading-relaxed">
                Given frame capacity <em>F</em> and reference sequence <em>R</em> of length <em>M</em>:
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded border border-atmos-border space-y-1 text-atmos-primary">
                <div>• Hit Condition: Page r<sub>k</sub> ∈ Frames</div>
                <div>• Fault Condition: Page r<sub>k</sub> ∉ Frames (Evict head of FIFO queue)</div>
                <div>• Hit Ratio (%) = (Total Hits / M) × 100%</div>
                <div>• Fault Ratio (%) = (Total Faults / M) × 100%</div>
                <div>• Invariant: Hit Ratio + Fault Ratio = 100%</div>
              </div>
            </div>

            {/* Indexed Allocation */}
            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/30 space-y-2">
              <h3 className="font-bold text-atmos-primary">
                D. Virtual Indexed File Allocation
              </h3>
              <p className="text-atmos-secondary text-[11px] leading-relaxed">
                Storage divided into 64 uniform 4KB disk blocks (Total 256KB):
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded border border-atmos-border space-y-1 text-atmos-primary">
                <div>• Block 0: Superblock / Filesystem Inode metadata</div>
                <div>• Index Block: Contains pointers [d<sub>0</sub>, d<sub>1</sub>, ..., d<sub>k−1</sub>]</div>
                <div>• External Fragmentation = 0 (Any free block used)</div>
                <div>• Direct Access Time = O(1) via Index Block pointer array</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Technology Stack & Implementation Architecture */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2 border-b border-atmos-border pb-1.5">
            <span className="text-atmos-accent font-mono text-sm">5.0</span> Technology Stack &amp; Architecture
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded border border-atmos-border bg-atmos-bg/30">
              <div className="font-semibold text-atmos-primary">Frontend Framework</div>
              <div className="text-atmos-secondary font-mono mt-0.5">React 18 with TypeScript</div>
            </div>
            <div className="p-3 rounded border border-atmos-border bg-atmos-bg/30">
              <div className="font-semibold text-atmos-primary">Build Tool</div>
              <div className="text-atmos-secondary font-mono mt-0.5">Vite v6 Bundler</div>
            </div>
            <div className="p-3 rounded border border-atmos-border bg-atmos-bg/30">
              <div className="font-semibold text-atmos-primary">Styling &amp; Theme</div>
              <div className="text-atmos-secondary font-mono mt-0.5">Tailwind CSS (Muted Enterprise)</div>
            </div>
            <div className="p-3 rounded border border-atmos-border bg-atmos-bg/30">
              <div className="font-semibold text-atmos-primary">Icons &amp; Data Viz</div>
              <div className="text-atmos-secondary font-mono mt-0.5">Lucide React &amp; Recharts</div>
            </div>
            <div className="p-3 rounded border border-atmos-border bg-atmos-bg/30">
              <div className="font-semibold text-atmos-primary">Client-Side Routing</div>
              <div className="text-atmos-secondary font-mono mt-0.5">React Router DOM v6</div>
            </div>
            <div className="p-3 rounded border border-atmos-border bg-atmos-bg/30">
              <div className="font-semibold text-atmos-primary">Simulation Persistence</div>
              <div className="text-atmos-secondary font-mono mt-0.5">Browser LocalStorage API</div>
            </div>
          </div>
        </section>

        {/* Section 6: Limitations & Future Scope */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2 border-b border-atmos-border pb-1.5">
            <span className="text-atmos-accent font-mono text-sm">6.0</span> Limitations &amp; Future Scope
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
              <h3 className="font-bold text-atmos-primary uppercase text-[11px]">Current Limitations</h3>
              <ul className="space-y-1 text-atmos-secondary list-disc pl-4 leading-relaxed">
                <li>Simulated browser execution environment without direct raw microkernel assembly bindings.</li>
                <li>Single-core CPU scheduling model (multicore SMP scheduling not modeled).</li>
                <li>Fixed 64-block virtual disk limit for clear classroom demonstration.</li>
                <li>Fictional currency transactions without external ISO 8583 payment gateway bridge.</li>
              </ul>
            </div>

            <div className="p-4 rounded border border-atmos-border bg-atmos-bg/40 space-y-1.5">
              <h3 className="font-bold text-atmos-primary uppercase text-[11px]">Future Scope</h3>
              <ul className="space-y-1 text-atmos-secondary list-disc pl-4 leading-relaxed">
                <li>Integration of multi-core CPU scheduling (Multilevel Feedback Queue - MLFQ).</li>
                <li>Simulation of two-level and hierarchical indexed file allocation (indirect blocks).</li>
                <li>Network fault injection (packet drop simulation between ATM and Core Banking Host).</li>
                <li>Hardware emulator bridge with WebUSB / serial port support for real card readers.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 7: Conclusion & Sign-off */}
        <section className="space-y-3 pt-4 border-t border-atmos-border">
          <h2 className="text-base font-bold text-atmos-primary flex items-center gap-2">
            <span className="text-atmos-accent font-mono text-sm">7.0</span> Conclusion
          </h2>
          <p className="text-xs text-atmos-secondary leading-relaxed">
            The <strong>ATMOS — Bank ATM Transaction Simulator</strong> successfully unifies the core theoretical concepts of the MSBTE Semester 5 Operating Systems curriculum into a robust, deterministic, visually polished, and mathematically accurate platform. By linking everyday financial transactions to underlying process control blocks, CPU dispatch algorithms, Banker&apos;s deadlock tests, memory partitions, and virtual disk indexing, the application provides an exemplary demonstration of applied operating systems engineering ready for academic assessment, viva defense, and micro-project reporting.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 text-center text-xs">
            <div>
              <div className="border-b border-atmos-secondary/40 pb-6 mb-1" />
              <div className="font-medium text-atmos-primary">Student Signature</div>
              <div className="text-[10px] text-atmos-secondary">Jay Rajput (Sem 5 CE)</div>
            </div>

            <div>
              <div className="border-b border-atmos-secondary/40 pb-6 mb-1" />
              <div className="font-medium text-atmos-primary">Course Guide / Faculty</div>
              <div className="text-[10px] text-atmos-secondary">Department of Computer Engg.</div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="border-b border-atmos-secondary/40 pb-6 mb-1" />
              <div className="font-medium text-atmos-primary">External Examiner</div>
              <div className="text-[10px] text-atmos-secondary">MSBTE Assessment Board</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
