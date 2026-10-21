import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Play,
  CheckCircle,
  XCircle,
  Pause,
  RotateCw,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import {
  ProcessState,
  TransactionProcess,
  TransactionType,
  TransactionPriority,
} from '../types';
import { formatCurrency, formatDateTime, maskAccountNumber } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';

export const ProcessManager: React.FC = () => {
  const {
    processes,
    accounts,
    createTransactionProcess,
    transitionProcessState,
    scheduleNextProcess,
    completeProcess,
    cancelProcess,
  } = useSimulation();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [laneFilter, setLaneFilter] = useState<string>('ALL');

  // Selected process for PCB drawer/modal
  const [selectedPcbProcess, setSelectedPcbProcess] = useState<TransactionProcess | null>(null);

  // New Process Creation Form Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAccount, setNewAccount] = useState(accounts[0]?.accountNumber || '');
  const [newType, setNewType] = useState<TransactionType>('WITHDRAWAL');
  const [newAmount, setNewAmount] = useState<number>(3000);
  const [newPriority, setNewPriority] = useState<TransactionPriority>('REGULAR');
  const [newLane, setNewLane] = useState<number>(1);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransactionProcess({
      accountNumber: newAccount,
      type: newType,
      amount: newType === 'BALANCE_INQUIRY' || newType === 'MINI_STATEMENT' ? 0 : newAmount,
      priority: newPriority,
      laneNumber: newLane,
    });
    setIsCreateOpen(false);
  };

  // Filtered processes
  const filteredProcesses = processes.filter((proc) => {
    const matchesSearch =
      proc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.pid.toString().includes(searchQuery) ||
      proc.accountHolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.accountNumber.includes(searchQuery);

    const matchesState = stateFilter === 'ALL' || proc.state === stateFilter;
    const matchesPriority = priorityFilter === 'ALL' || proc.priority === priorityFilter;
    const matchesLane = laneFilter === 'ALL' || proc.laneNumber === Number(laneFilter);

    return matchesSearch && matchesState && matchesPriority && matchesLane;
  });

  const stateCounts = {
    NEW: processes.filter((p) => p.state === 'NEW').length,
    READY: processes.filter((p) => p.state === 'READY').length,
    RUNNING: processes.filter((p) => p.state === 'RUNNING').length,
    WAITING: processes.filter((p) => p.state === 'WAITING').length,
    TERMINATED: processes.filter((p) => p.state === 'TERMINATED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              ATM Process Manager & PCB
            </h1>
            <Badge variant="steel" size="sm">
              CO2 Process Management
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Simulate process creation, 5-state lifecycle transitions, and Process Control Block (PCB) memory structures for bank card operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scheduleNextProcess}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-atmos-highlight text-atmos-primary border border-atmos-border rounded transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 text-atmos-accent" />
            Dispatch Next Ready
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 text-xs font-medium bg-atmos-accent hover:bg-atmos-accentHover text-white rounded transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Process
          </button>
        </div>
      </div>

      <SimulatedNotice compact />

      {/* 5-State Process Diagram (CO2 Visual Requirement) */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-atmos-primary">
              Standard 5-State Process Model Transition Queue (CO2)
            </h2>
            <p className="text-xs text-atmos-secondary">
              Transactions move from admission (NEW) through scheduling (READY/RUNNING) to completion (TERMINATED) or I/O blocks (WAITING).
            </p>
          </div>
          <span className="text-xs font-mono text-atmos-secondary">
            Active PIDs: {processes.filter((p) => p.state !== 'TERMINATED').length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* NEW */}
          <div className="p-3 rounded-lg border border-atmos-border bg-atmos-bg/40 text-center">
            <div className="text-[10px] uppercase font-semibold text-atmos-secondary">1. NEW</div>
            <div className="text-xl font-bold text-atmos-primary my-1">{stateCounts.NEW}</div>
            <div className="text-[10px] text-atmos-secondary">Admitted to memory</div>
          </div>

          {/* READY */}
          <div className="p-3 rounded-lg border border-atmos-border bg-atmos-bg/40 text-center">
            <div className="text-[10px] uppercase font-semibold text-atmos-teal">2. READY</div>
            <div className="text-xl font-bold text-atmos-teal my-1">{stateCounts.READY}</div>
            <div className="text-[10px] text-atmos-secondary">Waiting in CPU queue</div>
          </div>

          {/* RUNNING */}
          <div className="p-3 rounded-lg border border-atmos-border bg-atmos-bg/40 text-center">
            <div className="text-[10px] uppercase font-semibold text-atmos-accent">3. RUNNING</div>
            <div className="text-xl font-bold text-atmos-accent my-1">{stateCounts.RUNNING}</div>
            <div className="text-[10px] text-atmos-secondary">Executing on Core</div>
          </div>

          {/* WAITING */}
          <div className="p-3 rounded-lg border border-atmos-border bg-atmos-bg/40 text-center">
            <div className="text-[10px] uppercase font-semibold text-atmos-warning">4. WAITING</div>
            <div className="text-xl font-bold text-atmos-warning my-1">{stateCounts.WAITING}</div>
            <div className="text-[10px] text-atmos-secondary">Blocked on HSM / I/O</div>
          </div>

          {/* TERMINATED */}
          <div className="p-3 rounded-lg border border-atmos-border bg-atmos-bg/40 text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-semibold text-atmos-success">5. TERMINATED</div>
            <div className="text-xl font-bold text-atmos-success my-1">{stateCounts.TERMINATED}</div>
            <div className="text-[10px] text-atmos-secondary">Resources freed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-atmos-secondary" />
          <input
            type="text"
            placeholder="Search PID, Account, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-atmos-bg border border-atmos-border rounded text-atmos-primary focus:outline-hidden focus:border-atmos-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
          >
            <option value="ALL">All States</option>
            <option value="NEW">State: NEW</option>
            <option value="READY">State: READY</option>
            <option value="RUNNING">State: RUNNING</option>
            <option value="WAITING">State: WAITING</option>
            <option value="TERMINATED">State: TERMINATED</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="VIP">Priority: VIP (1)</option>
            <option value="REGULAR">Priority: Regular (2)</option>
          </select>

          {/* Lane Filter */}
          <select
            value={laneFilter}
            onChange={(e) => setLaneFilter(e.target.value)}
            className="text-xs bg-atmos-bg border border-atmos-border rounded px-2.5 py-1.5 text-atmos-primary focus:outline-hidden"
          >
            <option value="ALL">All Lanes</option>
            <option value="1">Lane 1</option>
            <option value="2">Lane 2</option>
            <option value="3">Lane 3</option>
            <option value="4">Lane 4</option>
          </select>
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">PID / Txn ID</th>
                <th className="py-2.5 px-4">Account Holder</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Lane</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">State</th>
                <th className="py-2.5 px-4">Burst / Remaining</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atmos-border text-atmos-primary">
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-atmos-secondary">
                    No transaction processes found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredProcesses.map((proc) => {
                  let stateBadgeVariant: 'default' | 'success' | 'warning' | 'error' | 'steel' | 'teal' = 'default';
                  if (proc.state === 'RUNNING') stateBadgeVariant = 'steel';
                  else if (proc.state === 'READY') stateBadgeVariant = 'teal';
                  else if (proc.state === 'WAITING') stateBadgeVariant = 'warning';
                  else if (proc.state === 'TERMINATED') stateBadgeVariant = 'success';

                  return (
                    <tr key={proc.id} className="hover:bg-atmos-highlight/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium">
                        <div className="text-atmos-primary">{proc.id}</div>
                        <div className="text-[10px] text-atmos-secondary">PID: {proc.pid}</div>
                      </td>
                      <td className="py-2.5 px-4 font-medium">
                        <div>{proc.accountHolder}</div>
                        <div className="text-[10px] text-atmos-secondary font-mono">
                          {maskAccountNumber(proc.accountNumber)}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-medium">
                        {proc.type.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold">
                        {proc.amount > 0 ? formatCurrency(proc.amount) : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        Lane {proc.laneNumber}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={proc.priority === 'VIP' ? 'warning' : 'default'} size="sm">
                          {proc.priority} ({proc.priorityLevel})
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={stateBadgeVariant} size="sm">
                          {proc.state}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-atmos-secondary">
                        {proc.burstTime}s / {proc.remainingTime}s
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View PCB Button */}
                          <button
                            onClick={() => setSelectedPcbProcess(proc)}
                            className="p-1.5 rounded hover:bg-atmos-highlight text-atmos-secondary hover:text-atmos-primary transition-colors"
                            title="Inspect Process Control Block (PCB)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* State Transition Action Buttons */}
                          {proc.state === 'NEW' && (
                            <button
                              onClick={() => transitionProcessState(proc.id, 'READY', 'Admitted to Ready queue')}
                              className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-atmos-highlight border border-atmos-border rounded text-atmos-teal flex items-center gap-1"
                              title="Admit to Ready Queue"
                            >
                              Admit
                            </button>
                          )}

                          {proc.state === 'READY' && (
                            <button
                              onClick={() => transitionProcessState(proc.id, 'RUNNING', 'Dispatched by scheduler')}
                              className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-atmos-highlight border border-atmos-border rounded text-atmos-accent flex items-center gap-1"
                              title="Dispatch to CPU"
                            >
                              Dispatch
                            </button>
                          )}

                          {proc.state === 'RUNNING' && (
                            <>
                              <button
                                onClick={() => transitionProcessState(proc.id, 'WAITING', 'Blocked waiting for HSM I/O')}
                                className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-atmos-highlight border border-atmos-border rounded text-atmos-warning"
                                title="Block on I/O"
                              >
                                Block
                              </button>
                              <button
                                onClick={() => completeProcess(proc.id)}
                                className="px-2 py-1 text-[11px] font-medium bg-atmos-successBg hover:bg-[#E3EDE7] border border-[#D3E2D8] rounded text-atmos-success flex items-center gap-1"
                                title="Complete Transaction"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Finish
                              </button>
                            </>
                          )}

                          {proc.state === 'WAITING' && (
                            <button
                              onClick={() => transitionProcessState(proc.id, 'READY', 'I/O event completed')}
                              className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-atmos-highlight border border-atmos-border rounded text-atmos-teal"
                              title="I/O Finished -> Return to Ready"
                            >
                              I/O Done
                            </button>
                          )}

                          {proc.state !== 'TERMINATED' && (
                            <button
                              onClick={() => cancelProcess(proc.id)}
                              className="p-1.5 rounded hover:bg-atmos-errorBg text-atmos-secondary hover:text-atmos-error transition-colors"
                              title="Abort Process"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PCB Details Drawer/Modal (CO2 PCB Information) */}
      {selectedPcbProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-atmos-border rounded-lg shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-atmos-border mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-atmos-highlight flex items-center justify-center text-atmos-accent">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-atmos-primary">
                    Process Control Block (PCB) — {selectedPcbProcess.id}
                  </h3>
                  <p className="text-[11px] text-atmos-secondary">
                    Kernel Task Descriptor Structure • In-Memory Offset 0x00A40
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPcbProcess(null)}
                className="p-1 rounded text-atmos-secondary hover:text-atmos-primary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Basic Process Attributes */}
              <div className="bg-atmos-bg/50 p-3.5 rounded border border-atmos-border space-y-2">
                <div className="font-semibold text-atmos-primary uppercase text-[10px] tracking-wider mb-2">
                  1. Identification & Scheduling
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Process ID (PID):</span>
                  <span className="font-mono font-bold">{selectedPcbProcess.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Current State:</span>
                  <Badge variant="steel" size="sm">
                    {selectedPcbProcess.state}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Priority Level:</span>
                  <span className="font-semibold">
                    {selectedPcbProcess.priority} (Class {selectedPcbProcess.priorityLevel})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Hardware Lane:</span>
                  <span>Lane #{selectedPcbProcess.laneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Creation Timestamp:</span>
                  <span className="font-mono text-[11px]">
                    {formatDateTime(selectedPcbProcess.createdAt)}
                  </span>
                </div>
              </div>

              {/* CPU Context & Registers */}
              <div className="bg-atmos-bg/50 p-3.5 rounded border border-atmos-border space-y-2">
                <div className="font-semibold text-atmos-primary uppercase text-[10px] tracking-wider mb-2">
                  2. CPU Registers & Context
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-atmos-secondary">Program Counter (PC):</span>
                  <span className="text-atmos-accent">{selectedPcbProcess.programCounter}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-atmos-secondary">Register AX (Accumulator):</span>
                  <span>{selectedPcbProcess.registers.AX}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-atmos-secondary">Register BX (Base):</span>
                  <span>{selectedPcbProcess.registers.BX}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-atmos-secondary">Register CX (Counter):</span>
                  <span>{selectedPcbProcess.registers.CX}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-atmos-secondary">Register DX (Data):</span>
                  <span>{selectedPcbProcess.registers.DX}</span>
                </div>
              </div>

              {/* Memory Limits & Allocations */}
              <div className="bg-atmos-bg/50 p-3.5 rounded border border-atmos-border space-y-2">
                <div className="font-semibold text-atmos-primary uppercase text-[10px] tracking-wider mb-2">
                  3. Memory Buffer Allocation (CO4)
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Buffer Size Required:</span>
                  <span className="font-mono font-semibold">{selectedPcbProcess.memoryRequired} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Assigned Partition:</span>
                  <span className="font-mono text-atmos-teal">
                    {selectedPcbProcess.allocatedPartitionId || 'None (Terminated)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Protection Domain:</span>
                  <span>Ring 3 User-Isolated Buffer</span>
                </div>
              </div>

              {/* Hardware Device Allocations */}
              <div className="bg-atmos-bg/50 p-3.5 rounded border border-atmos-border space-y-2">
                <div className="font-semibold text-atmos-primary uppercase text-[10px] tracking-wider mb-2">
                  4. Hardware Resources Reserved (CO3)
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Cash Dispenser:</span>
                  <span className="font-mono">
                    {selectedPcbProcess.resourcesRequired.cashDispenser} Unit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Receipt Printer:</span>
                  <span className="font-mono">
                    {selectedPcbProcess.resourcesRequired.receiptPrinter} Unit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Card Reader:</span>
                  <span className="font-mono">
                    {selectedPcbProcess.resourcesRequired.cardReader} Unit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atmos-secondary">Crypto HSM Module:</span>
                  <span className="font-mono">
                    {selectedPcbProcess.resourcesRequired.hsmModule} Unit
                  </span>
                </div>
              </div>
            </div>

            {/* Notes / OS Log */}
            <div className="mt-4 p-3 bg-atmos-highlight/40 rounded border border-atmos-border text-xs">
              <span className="font-semibold text-atmos-primary">Kernel Scheduler Log: </span>
              <span className="text-atmos-secondary">{selectedPcbProcess.notes}</span>
            </div>

            <div className="mt-5 pt-3 border-t border-atmos-border flex justify-end">
              <button
                onClick={() => setSelectedPcbProcess(null)}
                className="px-4 py-2 text-xs font-medium bg-atmos-accent hover:bg-atmos-accentHover text-white rounded transition-colors"
              >
                Close PCB Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Process Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-atmos-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-atmos-primary mb-1">
              Create New ATM Transaction Process
            </h3>
            <p className="text-xs text-atmos-secondary mb-4">
              Initializes a new process PCB in state NEW and assigns to hardware lane.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-atmos-secondary mb-1">
                  Customer Card Account
                </label>
                <select
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  className="w-full bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                >
                  {accounts.map((a) => (
                    <option key={a.accountNumber} value={a.accountNumber}>
                      {a.accountHolder} ({maskAccountNumber(a.accountNumber)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-atmos-secondary mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TransactionType)}
                    className="w-full bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                  >
                    <option value="WITHDRAWAL">Withdrawal</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="BALANCE_INQUIRY">Balance Inquiry</option>
                    <option value="MINI_STATEMENT">Mini Statement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-atmos-secondary mb-1">
                    Lane Number
                  </label>
                  <select
                    value={newLane}
                    onChange={(e) => setNewLane(Number(e.target.value))}
                    className="w-full bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                  >
                    <option value={1}>Lane 1 (Front)</option>
                    <option value={2}>Lane 2 (Drive-thru)</option>
                    <option value={3}>Lane 3 (Lobby)</option>
                    <option value={4}>Lane 4 (VIP)</option>
                  </select>
                </div>
              </div>

              {(newType === 'WITHDRAWAL' || newType === 'DEPOSIT') && (
                <div>
                  <label className="block font-medium text-atmos-secondary mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-atmos-secondary mb-1">
                  Process Priority
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newPriority === 'REGULAR'}
                      onChange={() => setNewPriority('REGULAR')}
                    />
                    <span>Regular (Priority 2)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newPriority === 'VIP'}
                      onChange={() => setNewPriority('VIP')}
                    />
                    <span>VIP Customer (Priority 1)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-atmos-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-atmos-secondary hover:text-atmos-primary rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-atmos-accent hover:bg-atmos-accentHover text-white rounded font-medium shadow-xs"
                >
                  Create Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
