// ATMOS Type Definitions for Operating Systems PBL

export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export type TransactionType = 'WITHDRAWAL' | 'DEPOSIT' | 'BALANCE_INQUIRY' | 'MINI_STATEMENT';

export type TransactionPriority = 'REGULAR' | 'VIP';

export interface TransactionProcess {
  id: string; // e.g. TXN-1001
  pid: number; // e.g. 1024
  accountNumber: string; // e.g. ****-****-4821
  accountHolder: string;
  type: TransactionType;
  amount: number;
  priority: TransactionPriority;
  priorityLevel: number; // 1 = VIP (High), 2 = Regular (Normal)
  laneNumber: number; // ATM Lane 1 to 4
  state: ProcessState;
  createdAt: string;
  arrivalTime: number; // in relative seconds or ticks
  burstTime: number; // estimated processing burst in CPU units
  remainingTime: number;
  memoryRequired: number; // in KB, e.g. 64, 128
  allocatedPartitionId?: string;
  resourcesRequired: {
    cashDispenser: number;
    receiptPrinter: number;
    cardReader: number;
    hsmModule: number;
  };
  programCounter: string;
  registers: {
    AX: string;
    BX: string;
    CX: string;
    DX: string;
  };
  notes?: string;
}

// Module C: CPU Scheduling Types
export type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'PRIORITY' | 'ROUND_ROBIN';

export interface ScheduledProcess {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number; // Lower number = higher priority (Convention: 1 = VIP, 5 = Low)
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
  color?: string;
}

export interface GanttBlock {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  isIdle: boolean;
  color?: string;
}

export interface SchedulingResult {
  algorithm: SchedulingAlgorithm;
  schedule: GanttBlock[];
  processes: ScheduledProcess[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number;
}

// Module D: Banker's Algorithm Types
export interface BankersProcess {
  id: string;
  name: string;
  allocation: number[];
  max: number[];
  need: number[];
}

export interface BankersState {
  resourceNames: string[];
  totalInstances: number[];
  available: number[];
  processes: BankersProcess[];
  isSafe: boolean;
  safeSequence: string[];
  executionSteps: Array<{
    step: number;
    description: string;
    workBefore: number[];
    processId: string;
    canExecute: boolean;
    workAfter: number[];
  }>;
}

// Module E: Memory Management Types
export interface MemoryPartition {
  id: string;
  name: string;
  startAddress: number; // in KB
  size: number; // in KB
  isAllocated: boolean;
  processId?: string;
  processName?: string;
  allocatedSize?: number;
  internalFragmentation: number;
}

export interface PageReplacementStep {
  step: number;
  page: number;
  frames: (number | null)[];
  isHit: boolean;
  evictedPage?: number | null;
  explanation: string;
}

export interface PageReplacementResult {
  steps: PageReplacementStep[];
  referenceString: number[];
  frameCount: number;
  totalHits: number;
  totalFaults: number;
  hitRatio: number;
  faultRatio: number;
}

// Module F: Indexed File Allocation Types
export type BlockType = 'FREE' | 'SUPERBLOCK' | 'INDEX_BLOCK' | 'DATA_BLOCK';

export interface VirtualDiskBlock {
  blockId: number;
  type: BlockType;
  fileId?: string;
  contentPreview?: string;
}

export interface VirtualFileRecord {
  id: string;
  transactionId: string;
  accountNumber: string;
  accountHolder: string;
  type: TransactionType;
  amount: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'REVERSED';
  indexBlock: number;
  dataBlocks: number[];
  fileSizeKB: number;
}

// Module G: ATM Account & Hardware
export interface BankAccount {
  accountNumber: string; // e.g. "4532-8819-9021"
  accountHolder: string;
  pin: string; // default "1234"
  balance: number;
  accountType: 'SAVINGS' | 'CURRENT';
  isVIP: boolean;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  cpuUtilizationPercent: number;
  memoryUsedKB: number;
  memoryTotalKB: number;
  availableCash: number;
  cashCapacity: number;
  activeProcessesCount: number;
  totalTransactionsCount: number;
}
