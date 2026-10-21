import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BankAccount,
  TransactionProcess,
  MemoryPartition,
  VirtualFileRecord,
  BankersState,
  SystemMetrics,
  ProcessState,
  TransactionType,
  TransactionPriority,
} from '../types';
import {
  STORAGE_KEYS,
  INITIAL_ACCOUNTS,
  INITIAL_PROCESSES,
  INITIAL_MEMORY_PARTITIONS,
  INITIAL_BANKERS_STATE,
  INITIAL_FILES,
  INITIAL_ATM_CASH,
} from '../utils/storage';
import { allocateIndexedFile, initializeDiskBlocks } from '../utils/indexedAllocation';

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface CreateProcessInput {
  accountNumber: string;
  type: TransactionType;
  amount: number;
  priority: TransactionPriority;
  laneNumber: number;
}

interface SimulationContextType {
  accounts: BankAccount[];
  processes: TransactionProcess[];
  memoryPartitions: MemoryPartition[];
  files: VirtualFileRecord[];
  bankersState: BankersState;
  atmCash: number;
  uptimeSeconds: number;
  metrics: SystemMetrics;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  showNotification: (message: string, type?: NotificationItem['type']) => void;
  // Transaction and Process actions
  createTransactionProcess: (input: CreateProcessInput) => TransactionProcess;
  transitionProcessState: (processId: string, newState: ProcessState, notes?: string) => void;
  scheduleNextProcess: () => void;
  completeProcess: (processId: string) => void;
  cancelProcess: (processId: string) => void;
  // ATM Terminal Direct Simulation
  executeAtmTransaction: (
    accountNumber: string,
    pin: string,
    type: TransactionType,
    amount: number,
    laneNumber?: number
  ) => { success: boolean; message: string; receipt?: any };
  // Memory Partition actions
  allocatePartition: (partitionId: string, processId: string, sizeNeeded: number) => boolean;
  deallocatePartition: (partitionId: string) => void;
  // File System actions
  createFile: (record: Omit<VirtualFileRecord, 'id' | 'indexBlock' | 'dataBlocks' | 'fileSizeKB'>) => boolean;
  deleteFile: (fileId: string) => void;
  // Banker's Algorithm
  setBankersState: React.Dispatch<React.SetStateAction<BankersState>>;
  // Reset demo
  resetToDemoData: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Bank Accounts
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  // 2. Processes
  const [processes, setProcesses] = useState<TransactionProcess[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCESSES);
    return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
  });

  // 3. Memory Partitions
  const [memoryPartitions, setMemoryPartitions] = useState<MemoryPartition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMORY_PARTITIONS);
    return saved ? JSON.parse(saved) : INITIAL_MEMORY_PARTITIONS;
  });

  // 4. Virtual Files
  const [files, setFiles] = useState<VirtualFileRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILES);
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  // 5. Banker's Algorithm State
  const [bankersState, setBankersState] = useState<BankersState>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANKERS);
    return saved ? JSON.parse(saved) : INITIAL_BANKERS_STATE;
  });

  // 6. ATM Cash
  const [atmCash, setAtmCash] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATM_CASH);
    return saved ? JSON.parse(saved) : INITIAL_ATM_CASH;
  });

  // 7. System Uptime (ticks each second)
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UPTIME_BASE);
    return saved ? Number(saved) : 8420; // Default simulated uptime
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Periodic Uptime Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => {
        const next = prev + 1;
        if (next % 10 === 0) {
          localStorage.setItem(STORAGE_KEYS.UPTIME_BASE, String(next));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMORY_PARTITIONS, JSON.stringify(memoryPartitions));
  }, [memoryPartitions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANKERS, JSON.stringify(bankersState));
  }, [bankersState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATM_CASH, JSON.stringify(atmCash));
  }, [atmCash]);

  const showNotification = (message: string, type: NotificationItem['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissNotification(id);
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Derive System Metrics
  const activeProcessesCount = processes.filter((p) => p.state !== 'TERMINATED').length;
  const memoryUsedKB = memoryPartitions
    .filter((p) => p.isAllocated)
    .reduce((sum, p) => sum + (p.allocatedSize || p.size), 0);
  const memoryTotalKB = memoryPartitions.reduce((sum, p) => sum + p.size, 0);

  const cpuUtilizationPercent = Math.min(
    95,
    Math.max(8, 12 + activeProcessesCount * 18 + (processes.some((p) => p.state === 'RUNNING') ? 15 : 0))
  );

  const metrics: SystemMetrics = {
    uptimeSeconds,
    cpuUtilizationPercent,
    memoryUsedKB,
    memoryTotalKB,
    availableCash: atmCash,
    cashCapacity: 1000000,
    activeProcessesCount,
    totalTransactionsCount: files.length + processes.filter((p) => p.state === 'TERMINATED').length,
  };

  // Memory Partition Helpers
  const allocatePartition = (partitionId: string, processId: string, sizeNeeded: number): boolean => {
    let success = false;
    setMemoryPartitions((prev) =>
      prev.map((part) => {
        if (part.id === partitionId && !part.isAllocated && part.size >= sizeNeeded) {
          success = true;
          return {
            ...part,
            isAllocated: true,
            processId,
            processName: `Process ${processId}`,
            allocatedSize: sizeNeeded,
            internalFragmentation: part.size - sizeNeeded,
          };
        }
        return part;
      })
    );
    return success;
  };

  const deallocatePartition = (partitionId: string) => {
    setMemoryPartitions((prev) =>
      prev.map((part) => {
        if (part.id === partitionId) {
          return {
            ...part,
            isAllocated: false,
            processId: undefined,
            processName: undefined,
            allocatedSize: undefined,
            internalFragmentation: 0,
          };
        }
        return part;
      })
    );
  };

  // Process Lifecycle
  const createTransactionProcess = (input: CreateProcessInput): TransactionProcess => {
    const nextPid = 1000 + processes.length + 1;
    const nextId = `TXN-${nextPid}`;
    const acc = accounts.find((a) => a.accountNumber === input.accountNumber);
    const holderName = acc ? acc.accountHolder : 'Synthetic Customer';

    const memoryNeeded = input.type === 'WITHDRAWAL' ? 128 : 64;

    // Check for free partition
    const freePartition = memoryPartitions.find((p) => !p.isAllocated && p.size >= memoryNeeded);
    let assignedPartId: string | undefined = undefined;

    if (freePartition) {
      assignedPartId = freePartition.id;
      allocatePartition(freePartition.id, nextId, memoryNeeded);
    }

    const newProc: TransactionProcess = {
      id: nextId,
      pid: nextPid,
      accountNumber: input.accountNumber,
      accountHolder: holderName,
      type: input.type,
      amount: input.amount,
      priority: input.priority,
      priorityLevel: input.priority === 'VIP' ? 1 : 2,
      laneNumber: input.laneNumber,
      state: 'NEW',
      createdAt: new Date().toISOString(),
      arrivalTime: Math.floor(uptimeSeconds % 100),
      burstTime: input.type === 'WITHDRAWAL' ? 6 : input.type === 'MINI_STATEMENT' ? 5 : 4,
      remainingTime: input.type === 'WITHDRAWAL' ? 6 : input.type === 'MINI_STATEMENT' ? 5 : 4,
      memoryRequired: memoryNeeded,
      allocatedPartitionId: assignedPartId,
      resourcesRequired: {
        cashDispenser: input.type === 'WITHDRAWAL' ? 1 : 0,
        receiptPrinter: 1,
        cardReader: 1,
        hsmModule: 1,
      },
      programCounter: '0x00400000',
      registers: {
        AX: `0x${input.amount.toString(16).toUpperCase().padStart(4, '0')}`,
        BX: `0x000${input.laneNumber}`,
        CX: '0x0000',
        DX: `0x${nextPid.toString(16).toUpperCase()}`,
      },
      notes: `Process created in Lane ${input.laneNumber}. PCB initialized.`,
    };

    setProcesses((prev) => [newProc, ...prev]);
    showNotification(`Process ${newProc.id} created (State: NEW) for Lane ${input.laneNumber}`, 'info');
    return newProc;
  };

  const transitionProcessState = (processId: string, newState: ProcessState, notes?: string) => {
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id === processId) {
          return {
            ...p,
            state: newState,
            notes: notes || `State transitioned to ${newState}`,
          };
        }
        return p;
      })
    );
  };

  const scheduleNextProcess = () => {
    // Check if there is already a RUNNING process
    const currentRunning = processes.find((p) => p.state === 'RUNNING');
    if (currentRunning) {
      showNotification(`CPU is currently busy with Process ${currentRunning.id}`, 'warning');
      return;
    }

    // Pick highest priority READY process (Priority: VIP first, then earlier arrival)
    const readyProcesses = processes.filter((p) => p.state === 'READY');
    if (readyProcesses.length === 0) {
      // If no READY processes, check if any NEW processes can be admitted
      const newProcess = processes.find((p) => p.state === 'NEW');
      if (newProcess) {
        transitionProcessState(newProcess.id, 'READY', 'Admitted from NEW to READY queue');
        showNotification(`Admitted Process ${newProcess.id} to READY queue`, 'info');
      } else {
        showNotification('No processes waiting in READY or NEW queues.', 'info');
      }
      return;
    }

    // Sort by priority level (1 = VIP, 2 = Regular), then arrival time
    readyProcesses.sort((a, b) => a.priorityLevel - b.priorityLevel || a.arrivalTime - b.arrivalTime);
    const chosen = readyProcesses[0];

    transitionProcessState(
      chosen.id,
      'RUNNING',
      `Dispatched by OS CPU Scheduler. Executing in Lane ${chosen.laneNumber}.`
    );
    showNotification(`CPU Scheduler dispatched Process ${chosen.id} (State: RUNNING)`, 'success');
  };

  const completeProcess = (processId: string) => {
    const proc = processes.find((p) => p.id === processId);
    if (!proc) return;

    // 1. Release memory partition
    if (proc.allocatedPartitionId) {
      deallocatePartition(proc.allocatedPartitionId);
    }

    // 2. Mark state TERMINATED
    transitionProcessState(
      processId,
      'TERMINATED',
      'Transaction completed. All system resources and memory deallocated.'
    );

    // 3. Create simulated file record with indexed allocation
    createFile({
      transactionId: proc.id,
      accountNumber: proc.accountNumber,
      accountHolder: proc.accountHolder,
      type: proc.type,
      amount: proc.amount,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });

    showNotification(`Process ${proc.id} terminated. Record indexed in virtual file system.`, 'success');
  };

  const cancelProcess = (processId: string) => {
    const proc = processes.find((p) => p.id === processId);
    if (!proc) return;

    if (proc.allocatedPartitionId) {
      deallocatePartition(proc.allocatedPartitionId);
    }

    transitionProcessState(
      processId,
      'TERMINATED',
      'Cancelled by operator or ATM exception. Memory reclaimed.'
    );
    showNotification(`Process ${proc.id} cancelled. Resources released.`, 'warning');
  };

  // Virtual Indexed File Creation
  const createFile = (
    record: Omit<VirtualFileRecord, 'id' | 'indexBlock' | 'dataBlocks' | 'fileSizeKB'>
  ): boolean => {
    const currentBlocks = initializeDiskBlocks(files);
    const dataBlocksNeeded = record.type === 'MINI_STATEMENT' ? 3 : record.type === 'WITHDRAWAL' ? 2 : 1;

    const allocation = allocateIndexedFile(currentBlocks, dataBlocksNeeded);
    if (!allocation) {
      showNotification('Virtual disk full! Cannot allocate indexed transaction block.', 'error');
      return false;
    }

    const nextFileId = `FILE-${1000 + files.length + 1}`;
    const newFile: VirtualFileRecord = {
      ...record,
      id: nextFileId,
      indexBlock: allocation.indexBlock,
      dataBlocks: allocation.dataBlocks,
      fileSizeKB: (1 + allocation.dataBlocks.length) * 4,
    };

    setFiles((prev) => [newFile, ...prev]);
    return true;
  };

  const deleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    showNotification(`Virtual file record ${fileId} deleted. Index and data blocks freed.`, 'info');
  };

  // Dedicated ATM Terminal Direct Simulation
  const executeAtmTransaction = (
    accountNumber: string,
    pin: string,
    type: TransactionType,
    amount: number,
    laneNumber: number = 1
  ): { success: boolean; message: string; receipt?: any } => {
    const account = accounts.find((a) => a.accountNumber === accountNumber);

    if (!account) {
      return { success: false, message: 'Card identification failed. Account not found in directory.' };
    }

    if (account.pin !== pin) {
      return { success: false, message: 'Invalid PIN entered. Authentication rejected by HSM security module.' };
    }

    // Validation for withdrawal
    if (type === 'WITHDRAWAL') {
      if (amount <= 0) {
        return { success: false, message: 'Please specify a positive withdrawal amount.' };
      }
      if (amount > account.balance) {
        return { success: false, message: `Insufficient account funds. Available balance: ₹${account.balance}.` };
      }
      if (amount > atmCash) {
        return { success: false, message: `ATM cash cassette depleted. Current dispenser cash: ₹${atmCash}.` };
      }
    }

    // Validation for deposit
    if (type === 'DEPOSIT' && amount <= 0) {
      return { success: false, message: 'Deposit amount must be greater than zero.' };
    }

    // Apply financial balances
    let newBalance = account.balance;
    let newAtmCash = atmCash;

    if (type === 'WITHDRAWAL') {
      newBalance = account.balance - amount;
      newAtmCash = atmCash - amount;
    } else if (type === 'DEPOSIT') {
      newBalance = account.balance + amount;
      newAtmCash = atmCash + amount;
    }

    // Update account & ATM cash
    setAccounts((prev) =>
      prev.map((a) => (a.accountNumber === accountNumber ? { ...a, balance: newBalance } : a))
    );
    setAtmCash(newAtmCash);

    // Create process in ATM OS
    const proc = createTransactionProcess({
      accountNumber,
      type,
      amount,
      priority: account.isVIP ? 'VIP' : 'REGULAR',
      laneNumber,
    });

    // Auto-advance process through states to simulate embedded lifecycle
    transitionProcessState(proc.id, 'READY', 'Card verified; enqueued in CPU Ready queue.');

    setTimeout(() => {
      transitionProcessState(proc.id, 'RUNNING', 'Dispatched to CPU for ledger update.');
      setTimeout(() => {
        completeProcess(proc.id);
      }, 1200);
    }, 600);

    const receipt = {
      transactionId: proc.id,
      timestamp: new Date().toISOString(),
      accountHolder: account.accountHolder,
      maskedAccount: accountNumber.replace(/\d{4}-\d{4}-\d{4}/, '****-****-****'),
      type,
      amount,
      previousBalance: account.balance,
      updatedBalance: newBalance,
      lane: laneNumber,
      atmId: 'ATMOS-MUM-NODE-01',
    };

    return {
      success: true,
      message: `Transaction ${type} of ₹${amount} completed successfully.`,
      receipt,
    };
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.PROCESSES);
    localStorage.removeItem(STORAGE_KEYS.MEMORY_PARTITIONS);
    localStorage.removeItem(STORAGE_KEYS.FILES);
    localStorage.removeItem(STORAGE_KEYS.BANKERS);
    localStorage.removeItem(STORAGE_KEYS.ATM_CASH);
    localStorage.removeItem(STORAGE_KEYS.UPTIME_BASE);

    setAccounts(INITIAL_ACCOUNTS);
    setProcesses(INITIAL_PROCESSES);
    setMemoryPartitions(INITIAL_MEMORY_PARTITIONS);
    setFiles(INITIAL_FILES);
    setBankersState(INITIAL_BANKERS_STATE);
    setAtmCash(INITIAL_ATM_CASH);
    setUptimeSeconds(8420);

    showNotification('System demo data successfully restored to default state.', 'success');
  };

  return (
    <SimulationContext.Provider
      value={{
        accounts,
        processes,
        memoryPartitions,
        files,
        bankersState,
        atmCash,
        uptimeSeconds,
        metrics,
        notifications,
        dismissNotification,
        showNotification,
        createTransactionProcess,
        transitionProcessState,
        scheduleNextProcess,
        completeProcess,
        cancelProcess,
        executeAtmTransaction,
        allocatePartition,
        deallocatePartition,
        createFile,
        deleteFile,
        setBankersState,
        resetToDemoData,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
