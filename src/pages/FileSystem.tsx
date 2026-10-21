import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  HardDrive,
  Search,
  Plus,
  Trash2,
  FileText,
  RotateCcw,
  CheckCircle2,
  Layers,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { VirtualFileRecord, TransactionType } from '../types';
import { initializeDiskBlocks, TOTAL_DISK_BLOCKS } from '../utils/indexedAllocation';
import { formatCurrency, formatDateTime, maskAccountNumber } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';

export const FileSystem: React.FC = () => {
  const { files, deleteFile, createFile, accounts } = useSimulation();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('ALL');

  // Selected file for Index Block detail inspection
  const [inspectedFile, setInspectedFile] = useState<VirtualFileRecord | null>(files[0] || null);

  // Mini-statement account picker
  const [miniStatementAccount, setMiniStatementAccount] = useState<string>(accounts[0]?.accountNumber || '');

  // New file manual creator modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createAccount, setCreateAccount] = useState(accounts[0]?.accountNumber || '');
  const [createType, setCreateType] = useState<TransactionType>('WITHDRAWAL');
  const [createAmount, setCreateAmount] = useState(2500);

  // Initialize virtual 64-block disk map
  const diskBlocks = useMemo(() => {
    return initializeDiskBlocks(files);
  }, [files]);

  // Filtered files
  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.accountNumber.includes(searchQuery) ||
      f.accountHolder.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAccount =
      selectedAccountFilter === 'ALL' || f.accountNumber === selectedAccountFilter;

    return matchesSearch && matchesAccount;
  });

  // Account-wise mini statement records
  const miniStatementRecords = files
    .filter((f) => f.accountNumber === miniStatementAccount)
    .slice(0, 5);

  const selectedMiniAccount = accounts.find((a) => a.accountNumber === miniStatementAccount);

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = accounts.find((a) => a.accountNumber === createAccount);
    const holder = acc ? acc.accountHolder : 'Synthetic Customer';

    const ok = createFile({
      transactionId: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      accountNumber: createAccount,
      accountHolder: holder,
      type: createType,
      amount: createType === 'BALANCE_INQUIRY' || createType === 'MINI_STATEMENT' ? 0 : createAmount,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });

    if (ok) {
      setIsCreateModalOpen(false);
    }
  };

  // Block counts
  const freeCount = diskBlocks.filter((b) => b.type === 'FREE').length;
  const indexCount = diskBlocks.filter((b) => b.type === 'INDEX_BLOCK').length;
  const dataCount = diskBlocks.filter((b) => b.type === 'DATA_BLOCK').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              Indexed Virtual File System
            </h1>
            <Badge variant="steel" size="sm">
              CO5 Storage & Files
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Simulate indexed file allocation for persistent ATM audit trails. Each transaction is allocated an index block containing direct pointers to data blocks.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1.5 text-xs font-medium bg-atmos-accent hover:bg-atmos-accentHover text-white rounded transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Transaction File
        </button>
      </div>

      <SimulatedNotice compact />

      {/* Disk Overview Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
            Total Disk Capacity
          </span>
          <div className="text-xl font-bold font-mono text-atmos-primary mt-1">
            64 Blocks
          </div>
          <span className="text-xs text-atmos-secondary">256 KB Virtual Storage</span>
        </div>

        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
            Free Blocks
          </span>
          <div className="text-xl font-bold font-mono text-atmos-teal mt-1">
            {freeCount} Free
          </div>
          <span className="text-xs text-atmos-secondary">{Math.round((freeCount / 64) * 100)}% Available</span>
        </div>

        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
            Index Blocks
          </span>
          <div className="text-xl font-bold font-mono text-atmos-accent mt-1">
            {indexCount} Inodes
          </div>
          <span className="text-xs text-atmos-secondary">1 index block per file</span>
        </div>

        <div className="bg-white border border-atmos-border rounded-lg p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-atmos-secondary">
            Allocated Data Blocks
          </span>
          <div className="text-xl font-bold font-mono text-atmos-primary mt-1">
            {dataCount} Blocks
          </div>
          <span className="text-xs text-atmos-secondary">Audit data & receipts</span>
        </div>
      </div>

      {/* Visual 64 Disk-Block Allocation Grid (CO5 Visual Requirement) */}
      <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-atmos-primary">
              Virtual Disk Block Allocation Map (Blocks 0 to 63)
            </h2>
            <p className="text-xs text-atmos-secondary">
              Click on any block to highlight its linked file or inspect its index pointers.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] text-atmos-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#202936]" /> Superblock (0)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-atmos-accent" /> Index Block
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-atmos-teal" /> Data Block
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#E2E5E8]" /> Free Block
            </span>
          </div>
        </div>

        {/* 64 Block Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 pt-2">
          {diskBlocks.map((block) => {
            const isInspectedIndex = inspectedFile && inspectedFile.indexBlock === block.blockId;
            const isInspectedData = inspectedFile && inspectedFile.dataBlocks.includes(block.blockId);

            let bgClass = 'bg-[#ECEFF1] text-[#737B85] border-transparent';
            if (block.type === 'SUPERBLOCK') {
              bgClass = 'bg-[#202936] text-white border-[#202936]';
            } else if (block.type === 'INDEX_BLOCK') {
              bgClass = 'bg-atmos-accent text-white border-atmos-accent';
            } else if (block.type === 'DATA_BLOCK') {
              bgClass = 'bg-atmos-teal text-white border-atmos-teal';
            }

            if (isInspectedIndex) {
              bgClass += ' ring-2 ring-black ring-offset-1 font-bold';
            } else if (isInspectedData) {
              bgClass += ' ring-2 ring-atmos-accent ring-offset-1 font-bold';
            }

            return (
              <div
                key={block.blockId}
                onClick={() => {
                  if (block.fileId) {
                    const match = files.find((f) => f.id === block.fileId);
                    if (match) setInspectedFile(match);
                  }
                }}
                className={`h-9 rounded-sm flex flex-col items-center justify-center font-mono text-[10px] cursor-pointer transition-all hover:scale-105 border ${bgClass}`}
                title={`Block #${block.blockId} (${block.type}) ${block.fileId ? `Linked File: ${block.fileId}` : 'Free'}`}
              >
                <span>{block.blockId}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Index Block Details & Mini-Statement Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Index Block Inspector */}
        <div className="lg:col-span-5 bg-white border border-atmos-border rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-atmos-border mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-atmos-accent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-atmos-primary">
                  Index Block Pointer Architecture
                </h3>
              </div>
              {inspectedFile && (
                <span className="font-mono text-xs text-atmos-accent font-bold">
                  Block #{inspectedFile.indexBlock}
                </span>
              )}
            </div>

            {inspectedFile ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-atmos-bg/50 rounded border border-atmos-border space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-atmos-secondary">File Descriptor:</span>
                    <span className="font-bold text-atmos-primary">{inspectedFile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-atmos-secondary">Transaction Ref:</span>
                    <span className="text-atmos-accent">{inspectedFile.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-atmos-secondary">Customer Account:</span>
                    <span>{maskAccountNumber(inspectedFile.accountNumber)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-atmos-secondary">File Payload Size:</span>
                    <span>{inspectedFile.fileSizeKB} KB ({inspectedFile.dataBlocks.length} data blocks)</span>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-atmos-secondary text-[11px] block mb-2">
                    Direct Pointers Stored in Index Block #{inspectedFile.indexBlock}:
                  </span>
                  <div className="space-y-1.5">
                    {inspectedFile.dataBlocks.map((blk, idx) => (
                      <div
                        key={blk}
                        className="p-2 rounded bg-atmos-highlight/40 border border-atmos-border flex items-center justify-between font-mono text-[11px]"
                      >
                        <span className="text-atmos-secondary">Pointer[{idx}]</span>
                        <span className="flex items-center gap-1 font-bold text-atmos-teal">
                          → Disk Block #{blk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-atmos-highlight/30 text-atmos-secondary text-[11px] leading-relaxed">
                  <strong className="text-atmos-primary">Indexed Allocation Advantage:</strong> Unlike contiguous allocation, blocks do not suffer from external fragmentation. Unlike linked allocation, random access to block <code>i</code> does not require reading prior blocks.
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-atmos-secondary bg-atmos-bg/40 rounded border border-dashed border-atmos-border">
                Select any file record below to inspect its virtual index block pointers.
              </div>
            )}
          </div>
        </div>

        {/* Right: Account-Wise Mini-Statement Generator (CO5 Requirement) */}
        <div className="lg:col-span-7 bg-white border border-atmos-border rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-atmos-border mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-atmos-accent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-atmos-primary">
                  Account-Wise Mini-Statement Retrieval (CO5)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atmos-highlight text-atmos-secondary">
                INDEX LOOKUP
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="text-xs font-medium text-atmos-secondary">
                Select Target Account:
              </label>
              <select
                value={miniStatementAccount}
                onChange={(e) => setMiniStatementAccount(e.target.value)}
                className="text-xs bg-atmos-bg border border-atmos-border rounded px-2.5 py-1 text-atmos-primary focus:outline-hidden"
              >
                {accounts.map((a) => (
                  <option key={a.accountNumber} value={a.accountNumber}>
                    {a.accountHolder} ({maskAccountNumber(a.accountNumber)})
                  </option>
                ))}
              </select>
            </div>

            {/* Mini Statement Output Box */}
            <div className="font-mono text-xs bg-atmos-bg/50 p-4 rounded border border-atmos-border space-y-2">
              <div className="flex justify-between pb-2 border-b border-dashed border-atmos-border text-[11px]">
                <div>
                  <span className="text-atmos-secondary font-sans">Account: </span>
                  <span className="font-bold">{selectedMiniAccount?.accountHolder}</span>
                </div>
                <div>
                  <span className="text-atmos-secondary font-sans">Balance: </span>
                  <span className="font-bold">
                    {selectedMiniAccount ? formatCurrency(selectedMiniAccount.balance) : '—'}
                  </span>
                </div>
              </div>

              {miniStatementRecords.length === 0 ? (
                <div className="py-4 text-center text-atmos-secondary text-[11px]">
                  No indexed transaction files recorded for this account card yet.
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {miniStatementRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex justify-between items-center text-[11px] py-1 border-b last:border-b-0 border-atmos-border/40"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-atmos-secondary text-[10px]">
                          {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-semibold">{rec.type}</span>
                        <span className="text-[10px] text-atmos-secondary">
                          (Index: #{rec.indexBlock})
                        </span>
                      </div>
                      <span className="font-bold">
                        {rec.amount > 0 ? formatCurrency(rec.amount) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-atmos-secondary mt-3">
            Mini-statements are reconstructed dynamically by indexing directly into transaction records without disk head seek latency.
          </div>
        </div>
      </div>

      {/* Directory Listing Table */}
      <div className="bg-white border border-atmos-border rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-atmos-primary">
              Simulated Virtual Disk Directory Listing
            </h3>
            <p className="text-xs text-atmos-secondary">
              All indexed transaction files currently persisted in virtual flash memory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-atmos-secondary" />
              <input
                type="text"
                placeholder="Search transaction file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-atmos-bg border border-atmos-border rounded text-atmos-primary focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-atmos-bg/70 border-b border-atmos-border text-atmos-secondary font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">File ID / Txn ID</th>
                <th className="py-2.5 px-4">Account Holder</th>
                <th className="py-2.5 px-4">Card Number</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4 font-mono">Index Block</th>
                <th className="py-2.5 px-4 font-mono">Data Blocks</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atmos-border text-atmos-primary">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-atmos-secondary">
                    No transaction files found in directory.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => {
                  const isInspected = inspectedFile?.id === file.id;
                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-atmos-highlight/40 transition-colors ${
                        isInspected ? 'bg-atmos-highlight/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-atmos-accent">
                        <div>{file.id}</div>
                        <div className="text-[10px] text-atmos-secondary font-normal">{file.transactionId}</div>
                      </td>
                      <td className="py-2.5 px-4 font-medium">{file.accountHolder}</td>
                      <td className="py-2.5 px-4 font-mono text-atmos-secondary">
                        {maskAccountNumber(file.accountNumber)}
                      </td>
                      <td className="py-2.5 px-4 font-medium">{file.type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold">
                        {file.amount > 0 ? formatCurrency(file.amount) : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-atmos-highlight text-atmos-accent font-bold">
                          #{file.indexBlock}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-atmos-secondary">
                        [{file.dataBlocks.join(', ')}]
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-atmos-secondary">
                        {formatDateTime(file.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectedFile(file)}
                            className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-atmos-highlight border border-atmos-border rounded text-atmos-secondary hover:text-atmos-primary"
                          >
                            Inspect Index
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-1 rounded text-atmos-secondary hover:text-atmos-error hover:bg-atmos-errorBg"
                            title="Delete file & free disk blocks"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Manual File Creator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-atmos-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-atmos-primary mb-1">
              Create Virtual Transaction File
            </h3>
            <p className="text-xs text-atmos-secondary mb-4">
              Allocates an index block and data blocks on the simulated disk.
            </p>

            <form onSubmit={handleCreateFileSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-atmos-secondary font-medium mb-1">
                  Card Account
                </label>
                <select
                  value={createAccount}
                  onChange={(e) => setCreateAccount(e.target.value)}
                  className="w-full bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                >
                  {accounts.map((a) => (
                    <option key={a.accountNumber} value={a.accountNumber}>
                      {a.accountHolder} ({maskAccountNumber(a.accountNumber)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-atmos-secondary font-medium mb-1">
                  Transaction Operation
                </label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value as TransactionType)}
                  className="w-full bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                >
                  <option value="WITHDRAWAL">Withdrawal (Allocates 2 Data Blocks)</option>
                  <option value="DEPOSIT">Deposit (Allocates 1 Data Block)</option>
                  <option value="MINI_STATEMENT">Mini Statement (Allocates 3 Data Blocks)</option>
                  <option value="BALANCE_INQUIRY">Balance Inquiry (Allocates 1 Data Block)</option>
                </select>
              </div>

              {(createType === 'WITHDRAWAL' || createType === 'DEPOSIT') && (
                <div>
                  <label className="block text-atmos-secondary font-medium mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(Number(e.target.value))}
                    className="w-full font-mono bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-atmos-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-atmos-secondary hover:text-atmos-primary rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-atmos-accent hover:bg-atmos-accentHover text-white rounded font-medium shadow-xs"
                >
                  Allocate Blocks & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
