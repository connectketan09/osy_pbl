import React, { useState, useMemo } from 'react';
import {
  Layers,
  Database,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { simulateFifoPageReplacement } from '../utils/fifoPageReplacement';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';

const TEXTBOOK_REF_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
const ATM_BUFFER_PAGES = [1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6];

export const MemoryManagement: React.FC = () => {
  const {
    memoryPartitions,
    processes,
    allocatePartition,
    deallocatePartition,
    metrics,
  } = useSimulation();

  // Active view tab: Buffer Partitions vs FIFO Paging
  const [activeTab, setActiveTab] = useState<'PARTITIONS' | 'PAGING'>('PARTITIONS');

  // FIFO Page Replacement State
  const [refStringInput, setRefStringInput] = useState<string>(TEXTBOOK_REF_STRING.join(', '));
  const [frameCount, setFrameCount] = useState<number>(3);

  // Parse reference string from text input
  const parsedRefString = useMemo(() => {
    return refStringInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !isNaN(Number(s)))
      .map((s) => Number(s));
  }, [refStringInput]);

  // Run FIFO Simulation
  const pagingResult = useMemo(() => {
    return simulateFifoPageReplacement(parsedRefString, frameCount);
  }, [parsedRefString, frameCount]);

  // Free unallocated processes available for partition assignment
  const unallocatedProcesses = processes.filter(
    (p) => p.state !== 'TERMINATED' && !p.allocatedPartitionId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              Memory Management Simulator
            </h1>
            <Badge variant="steel" size="sm">
              CO4 Memory Management
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Analyze physical memory partition layouts with internal fragmentation metrics and simulate First-In, First-Out (FIFO) page replacement caching.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white border border-atmos-border p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('PARTITIONS')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              activeTab === 'PARTITIONS'
                ? 'bg-atmos-accent text-white shadow-xs'
                : 'text-atmos-secondary hover:text-atmos-primary'
            }`}
          >
            Transaction Buffer Partitions
          </button>
          <button
            onClick={() => setActiveTab('PAGING')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              activeTab === 'PAGING'
                ? 'bg-atmos-accent text-white shadow-xs'
                : 'text-atmos-secondary hover:text-atmos-primary'
            }`}
          >
            FIFO Page Replacement
          </button>
        </div>
      </div>

      <SimulatedNotice compact />

      {/* ================= SUB-MODULE 1: PARTITIONS ================= */}
      {activeTab === 'PARTITIONS' && (
        <div className="space-y-6">
          {/* Summary Indicator Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Total System Buffer
              </span>
              <div className="text-xl font-bold font-mono text-atmos-primary mt-1">
                {metrics.memoryTotalKB} KB
              </div>
              <span className="text-xs text-atmos-secondary">1024 KB Physical Allocation</span>
            </div>

            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Allocated Memory
              </span>
              <div className="text-xl font-bold font-mono text-atmos-accent mt-1">
                {metrics.memoryUsedKB} KB
              </div>
              <span className="text-xs text-atmos-secondary">
                {Math.round((metrics.memoryUsedKB / metrics.memoryTotalKB) * 100)}% Utilized
              </span>
            </div>

            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Free Memory Pool
              </span>
              <div className="text-xl font-bold font-mono text-atmos-teal mt-1">
                {metrics.memoryTotalKB - metrics.memoryUsedKB} KB
              </div>
              <span className="text-xs text-atmos-secondary">Available for new lanes</span>
            </div>

            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Internal Fragmentation
              </span>
              <div className="text-xl font-bold font-mono text-atmos-warning mt-1">
                {memoryPartitions.reduce((sum, p) => sum + p.internalFragmentation, 0)} KB
              </div>
              <span className="text-xs text-atmos-secondary">Wasted in fixed partitions</span>
            </div>
          </div>

          {/* Visual Memory Map */}
          <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-atmos-primary">
                  Visual Physical Memory Layout (0 to 1024 KB)
                </h2>
                <p className="text-xs text-atmos-secondary">
                  Contiguous memory map showing kernel space, lane buffers, and fragmentation.
                </p>
              </div>
              <span className="text-xs font-mono text-atmos-secondary">Address Range: 0x0000 - 0x0400</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-12 flex rounded overflow-hidden border border-atmos-border shadow-2xs select-none">
              {memoryPartitions.map((part) => {
                const widthPercent = (part.size / metrics.memoryTotalKB) * 100;
                let bg = part.isAllocated ? (part.id === 'PART-1' ? '#202936' : '#526B85') : '#EDF1F4';
                let textColor = part.isAllocated ? '#FFFFFF' : '#737B85';

                return (
                  <div
                    key={part.id}
                    style={{ width: `${widthPercent}%`, backgroundColor: bg, color: textColor }}
                    className="flex flex-col items-center justify-center border-r last:border-r-0 border-white/20 px-1 truncate transition-all hover:opacity-95"
                    title={`${part.name} [${part.startAddress}KB - ${part.startAddress + part.size}KB] Size: ${part.size}KB`}
                  >
                    <span className="text-[11px] font-bold truncate">{part.id}</span>
                    <span className="text-[9px] opacity-80 font-mono">{part.size}KB</span>
                  </div>
                );
              })}
            </div>

            {/* Address ticks */}
            <div className="flex justify-between text-[10px] font-mono text-atmos-secondary mt-1.5 px-0.5">
              <span>0 KB (Base)</span>
              <span>256 KB</span>
              <span>512 KB</span>
              <span>640 KB</span>
              <span>768 KB</span>
              <span>1024 KB (Limit)</span>
            </div>
          </div>

          {/* Partitions Table */}
          <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-atmos-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-atmos-primary">
                  Transaction Buffer Partition Registry
                </h3>
                <p className="text-xs text-atmos-secondary">
                  Fixed and variable partition slots allocated to ATM operational threads.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Partition ID</th>
                    <th className="py-2.5 px-4">Partition Name</th>
                    <th className="py-2.5 px-4 font-mono">Start Addr</th>
                    <th className="py-2.5 px-4 font-mono">Slot Size</th>
                    <th className="py-2.5 px-4 font-mono">Allocated Size</th>
                    <th className="py-2.5 px-4 font-mono">Internal Frag.</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Active Process</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-atmos-border text-atmos-primary">
                  {memoryPartitions.map((part) => (
                    <tr key={part.id} className="hover:bg-atmos-highlight/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">
                        {part.id}
                      </td>
                      <td className="py-2.5 px-4 font-medium">{part.name}</td>
                      <td className="py-2.5 px-4 font-mono">{part.startAddress} KB</td>
                      <td className="py-2.5 px-4 font-mono">{part.size} KB</td>
                      <td className="py-2.5 px-4 font-mono">
                        {part.allocatedSize ? `${part.allocatedSize} KB` : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {part.internalFragmentation > 0 ? (
                          <span className="text-atmos-warning font-semibold">
                            {part.internalFragmentation} KB
                          </span>
                        ) : (
                          <span className="text-atmos-secondary">0 KB</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={part.isAllocated ? 'steel' : 'teal'} size="sm">
                          {part.isAllocated ? 'ALLOCATED' : 'FREE'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {part.processName || <span className="text-atmos-secondary">Unassigned</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {part.id !== 'PART-1' && part.isAllocated && (
                          <button
                            onClick={() => deallocatePartition(part.id)}
                            className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-atmos-errorBg border border-atmos-border rounded text-atmos-secondary hover:text-atmos-error transition-colors"
                          >
                            Deallocate
                          </button>
                        )}
                        {!part.isAllocated && unallocatedProcesses.length > 0 && (
                          <button
                            onClick={() => {
                              const proc = unallocatedProcesses[0];
                              allocatePartition(part.id, proc.id, proc.memoryRequired);
                            }}
                            className="px-2 py-1 text-[11px] font-medium bg-atmos-highlight hover:bg-atmos-border border border-atmos-border rounded text-atmos-accent transition-colors"
                          >
                            Assign {unallocatedProcesses[0].id}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODULE 2: FIFO PAGE REPLACEMENT ================= */}
      {activeTab === 'PAGING' && (
        <div className="space-y-6">
          {/* Controls: Reference String & Frame Count */}
          <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-atmos-primary mb-1">
              FIFO Page Replacement Configuration
            </h2>
            <p className="text-xs text-atmos-secondary mb-4">
              Simulate page faults when ATM transaction routines are paged into physical frame slots.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
              <div className="sm:col-span-8">
                <label className="block font-medium text-atmos-secondary mb-1">
                  Page Reference String (Comma Separated)
                </label>
                <input
                  type="text"
                  value={refStringInput}
                  onChange={(e) => setRefStringInput(e.target.value)}
                  className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRefStringInput(TEXTBOOK_REF_STRING.join(', '))}
                    className="text-[11px] px-2 py-0.5 rounded bg-atmos-bg border border-atmos-border text-atmos-secondary hover:text-atmos-primary"
                  >
                    Standard Textbook Preset (7,0,1,2...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefStringInput(ATM_BUFFER_PAGES.join(', '))}
                    className="text-[11px] px-2 py-0.5 rounded bg-atmos-bg border border-atmos-border text-atmos-secondary hover:text-atmos-primary"
                  >
                    ATM Buffer Routine Trace
                  </button>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-medium text-atmos-secondary mb-1">
                  Number of Physical Frames
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={frameCount}
                    onChange={(e) => setFrameCount(Math.min(6, Math.max(1, Number(e.target.value))))}
                    className="w-20 font-mono text-center bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden font-bold"
                  />
                  <span className="text-atmos-secondary text-[11px]">Frames in RAM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Total Page References
              </span>
              <div className="text-xl font-bold font-mono text-atmos-primary mt-1">
                {pagingResult.referenceString.length}
              </div>
              <span className="text-xs text-atmos-secondary">Sequential lookups</span>
            </div>

            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Total Page Hits
              </span>
              <div className="text-xl font-bold font-mono text-atmos-success mt-1">
                {pagingResult.totalHits}
              </div>
              <span className="text-xs text-atmos-secondary">Found in frame cache</span>
            </div>

            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Total Page Faults
              </span>
              <div className="text-xl font-bold font-mono text-atmos-error mt-1">
                {pagingResult.totalFaults}
              </div>
              <span className="text-xs text-atmos-secondary">Required frame load/evict</span>
            </div>

            <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
                Page Fault Ratio
              </span>
              <div className="text-xl font-bold font-mono text-atmos-accent mt-1">
                {pagingResult.faultRatio}%
              </div>
              <span className="text-xs text-atmos-secondary">
                Hit Ratio: {pagingResult.hitRatio}%
              </span>
            </div>
          </div>

          {/* Step-by-Step Frame Matrix Table (CO4 Visual Requirement) */}
          <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-atmos-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-atmos-primary">
                  Step-by-Step FIFO Frame Allocation Table
                </h3>
                <p className="text-xs text-atmos-secondary">
                  Contents of physical frames after each page reference (Oldest entered frame is replaced on fault)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3 text-left w-24">Step / Metric</th>
                    {pagingResult.steps.map((st) => (
                      <th key={st.step} className="py-2 px-2.5 font-mono border-l border-atmos-border min-w-10">
                        #{st.step}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-atmos-bg/50 border-b border-atmos-border font-mono text-xs font-bold text-atmos-primary">
                    <td className="py-2 px-3 text-left font-sans text-atmos-secondary font-medium text-[11px]">
                      Page Ref
                    </td>
                    {pagingResult.steps.map((st) => (
                      <td key={`page-${st.step}`} className="py-2 px-2.5 border-l border-atmos-border bg-atmos-highlight/40">
                        {st.page}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-atmos-border font-mono">
                  {/* Rows for each Frame */}
                  {Array.from({ length: frameCount }).map((_, fIdx) => (
                    <tr key={`frame-row-${fIdx}`} className="hover:bg-atmos-highlight/20 transition-colors">
                      <td className="py-2.5 px-3 text-left font-sans font-medium text-atmos-secondary text-[11px]">
                        Frame {fIdx + 1}
                      </td>
                      {pagingResult.steps.map((st) => {
                        const pageInSlot = st.frames[fIdx];
                        const isJustEntered = !st.isHit && pageInSlot === st.page;
                        return (
                          <td
                            key={`step-${st.step}-f-${fIdx}`}
                            className={`py-2.5 px-2 border-l border-atmos-border ${
                              isJustEntered ? 'bg-atmos-teal/15 font-bold text-atmos-teal' : ''
                            }`}
                          >
                            {pageInSlot !== null ? pageInSlot : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Status Row (Hit / Fault) */}
                  <tr className="bg-atmos-bg/40 font-sans font-bold">
                    <td className="py-2.5 px-3 text-left text-atmos-secondary text-[11px]">
                      Outcome
                    </td>
                    {pagingResult.steps.map((st) => (
                      <td key={`status-${st.step}`} className="py-2 px-2 border-l border-atmos-border text-[10px]">
                        {st.isHit ? (
                          <span className="text-atmos-success">HIT</span>
                        ) : (
                          <span className="text-atmos-error">FAULT</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step Narrative Trace */}
          <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-atmos-primary mb-3">
              FIFO Replacement Step-by-Step Audit Log
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {pagingResult.steps.map((st) => (
                <div
                  key={st.step}
                  className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                    st.isHit ? 'bg-[#F0F5F2] border-[#D3E2D8]' : 'bg-atmos-bg border-atmos-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-atmos-primary">Step {st.step}:</span>
                    <span className="text-atmos-secondary">{st.explanation}</span>
                  </div>
                  <Badge variant={st.isHit ? 'success' : 'error'} size="sm">
                    {st.isHit ? 'Cache HIT' : 'Page FAULT'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
