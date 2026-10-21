import React, { useState } from 'react';
import {
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Layers,
  Cpu,
  Clock,
  Printer,
  Copy,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { TransactionType } from '../types';
import { formatCurrency, formatDateTime, maskAccountNumber } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { SimulatedNotice } from '../components/common/SimulatedNotice';

export const AtmTransactions: React.FC = () => {
  const {
    accounts,
    atmCash,
    executeAtmTransaction,
    processes,
    files,
    showNotification,
  } = useSimulation();

  // State for the ATM terminal
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.accountNumber || '');
  const [pin, setPin] = useState<string>('1234');
  const [activeTab, setActiveTab] = useState<TransactionType>('WITHDRAWAL');
  const [amount, setAmount] = useState<number>(2000);
  const [lane, setLane] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAccount = accounts.find((a) => a.accountNumber === selectedAccount);

  const handleAccountChange = (accNum: string) => {
    setSelectedAccount(accNum);
    const acc = accounts.find((a) => a.accountNumber === accNum);
    if (acc) {
      setPin(acc.pin);
    }
    setErrorMessage(null);
  };

  const handlePresetAmount = (presetVal: number) => {
    setAmount(presetVal);
    setErrorMessage(null);
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedAccount) {
      setErrorMessage('Please select an account card.');
      return;
    }

    if (activeTab === 'WITHDRAWAL' && amount > currentAccount!.balance) {
      setErrorMessage(`Insufficient balance! Account has ₹${currentAccount!.balance}.`);
      return;
    }

    if (activeTab === 'WITHDRAWAL' && amount > atmCash) {
      setErrorMessage(`ATM Cash Vault depleted! Dispenser has only ₹${atmCash}.`);
      return;
    }

    setIsProcessing(true);

    // Call execution
    const result = executeAtmTransaction(selectedAccount, pin, activeTab, amount, lane);

    setTimeout(() => {
      setIsProcessing(false);
      if (result.success) {
        setLastReceipt(result.receipt);
        showNotification(result.message, 'success');
      } else {
        setErrorMessage(result.message);
        showNotification(result.message, 'error');
      }
    }, 1000);
  };

  // Recent matching files for mini-statement display
  const matchingRecords = files.filter((f) => f.accountNumber === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-atmos-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atmos-primary">
              ATM Terminal Simulator
            </h1>
            <Badge variant="teal" size="sm">
              Module G
            </Badge>
          </div>
          <p className="text-xs text-atmos-secondary mt-1">
            Simulate customer self-service transactions with live operating system process scheduling, memory allocation, and indexed file journaling.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-atmos-secondary">Dispenser Cash:</span>
          <span className="font-mono font-semibold px-2 py-1 bg-white border border-atmos-border rounded text-atmos-primary">
            {formatCurrency(atmCash)}
          </span>
        </div>
      </div>

      <SimulatedNotice compact />

      {/* Main Grid: ATM Console (Left) and OS Feedback & Receipt (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: ATM Console */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-atmos-border mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-atmos-accent" />
                <h2 className="text-sm font-semibold text-atmos-primary">
                  1. Select Customer Smart Card
                </h2>
              </div>
              <span className="text-xs text-atmos-secondary font-mono">
                Hardware Lane: #{lane}
              </span>
            </div>

            {/* Account Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {accounts.map((acc) => {
                const isSelected = acc.accountNumber === selectedAccount;
                return (
                  <div
                    key={acc.accountNumber}
                    onClick={() => handleAccountChange(acc.accountNumber)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-atmos-accent bg-atmos-highlight/40 shadow-2xs ring-1 ring-atmos-accent'
                        : 'border-atmos-border bg-white hover:bg-atmos-bg/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-atmos-primary">
                        {acc.accountHolder}
                      </span>
                      {acc.isVIP && (
                        <Badge variant="warning" size="sm">
                          VIP Priority (1)
                        </Badge>
                      )}
                    </div>
                    <div className="font-mono text-xs text-atmos-secondary mb-1">
                      {maskAccountNumber(acc.accountNumber)}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-atmos-border/60">
                      <span className="text-[11px] text-atmos-secondary">{acc.accountType}</span>
                      <span className="font-mono font-semibold text-atmos-primary">
                        {formatCurrency(acc.balance)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lane & PIN selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-atmos-border">
              <div>
                <label className="block text-xs font-medium text-atmos-secondary mb-1">
                  ATM Hardware Lane
                </label>
                <select
                  value={lane}
                  onChange={(e) => setLane(Number(e.target.value))}
                  className="w-full text-xs bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden focus:border-atmos-accent"
                >
                  <option value={1}>Lane 1 — Cash Terminal Front</option>
                  <option value={2}>Lane 2 — Drive-thru Express</option>
                  <option value={3}>Lane 3 — Branch Lobby Kiosk</option>
                  <option value={4}>Lane 4 — VIP Lounge Kiosk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-atmos-secondary mb-1">
                  Card PIN (Auto-filled for Demo)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full text-xs font-mono bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden focus:border-atmos-accent"
                />
              </div>
            </div>
          </div>

          {/* Transaction Type Form */}
          <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-atmos-primary mb-3">
              2. Choose Transaction Operation
            </h2>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('WITHDRAWAL');
                  setAmount(2000);
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${
                  activeTab === 'WITHDRAWAL'
                    ? 'bg-atmos-accent text-white border-atmos-accent shadow-xs'
                    : 'bg-white text-atmos-secondary hover:text-atmos-primary border-atmos-border hover:bg-atmos-highlight'
                }`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                Withdrawal
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('DEPOSIT');
                  setAmount(5000);
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${
                  activeTab === 'DEPOSIT'
                    ? 'bg-atmos-accent text-white border-atmos-accent shadow-xs'
                    : 'bg-white text-atmos-secondary hover:text-atmos-primary border-atmos-border hover:bg-atmos-highlight'
                }`}
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                Deposit
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('BALANCE_INQUIRY');
                  setAmount(0);
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${
                  activeTab === 'BALANCE_INQUIRY'
                    ? 'bg-atmos-accent text-white border-atmos-accent shadow-xs'
                    : 'bg-white text-atmos-secondary hover:text-atmos-primary border-atmos-border hover:bg-atmos-highlight'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Balance
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('MINI_STATEMENT');
                  setAmount(0);
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${
                  activeTab === 'MINI_STATEMENT'
                    ? 'bg-atmos-accent text-white border-atmos-accent shadow-xs'
                    : 'bg-white text-atmos-secondary hover:text-atmos-primary border-atmos-border hover:bg-atmos-highlight'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Mini Stmt
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-atmos-errorBg border border-[#F4D9D9] text-atmos-error text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleExecute} className="space-y-4">
              {/* Amount section (for withdrawal & deposit) */}
              {(activeTab === 'WITHDRAWAL' || activeTab === 'DEPOSIT') && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-atmos-secondary">
                      Transaction Amount (INR)
                    </label>
                    <span className="text-[11px] text-atmos-secondary">
                      {activeTab === 'WITHDRAWAL' ? 'Max ATM Dispense: ₹20,000' : 'Daily Limit: ₹50,000'}
                    </span>
                  </div>

                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-base font-mono font-semibold bg-atmos-bg border border-atmos-border rounded px-3 py-2 text-atmos-primary focus:outline-hidden focus:border-atmos-accent"
                  />

                  {/* Preset Quick Chips */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[500, 1000, 2000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handlePresetAmount(val)}
                        className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                          amount === val
                            ? 'bg-atmos-accent text-white border-atmos-accent'
                            : 'bg-white text-atmos-secondary border-atmos-border hover:bg-atmos-highlight'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inquiry / Mini Statement notice */}
              {activeTab === 'BALANCE_INQUIRY' && (
                <div className="p-3 bg-atmos-highlight/50 border border-atmos-border rounded text-xs text-atmos-secondary">
                  Checks current ledger balance verified by Hardware Security Module (HSM). Spawns a light-weight 64KB inquiry process in ATM OS.
                </div>
              )}

              {activeTab === 'MINI_STATEMENT' && (
                <div className="p-3 bg-atmos-highlight/50 border border-atmos-border rounded text-xs text-atmos-secondary">
                  Retrieves recent transaction records from indexed virtual disk blocks without sequential search overhead.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-atmos-accent hover:bg-atmos-accentHover disabled:opacity-60 text-white rounded font-medium text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing in ATM OS RTOS Kernel...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Execute {activeTab.replace('_', ' ')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction Receipt & Real-time OS Dispatch Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Virtual ATM Receipt Card */}
          <div className="bg-white border border-atmos-border rounded-lg shadow-sm p-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-atmos-border mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-atmos-accent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-atmos-primary">
                  ATM Customer Receipt
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atmos-highlight text-atmos-accent">
                THERMAL PRINT
              </span>
            </div>

            {lastReceipt ? (
              <div className="font-mono text-xs text-atmos-primary space-y-2.5 bg-atmos-bg/40 p-4 rounded border border-atmos-border">
                <div className="text-center pb-2 border-b border-dashed border-atmos-border">
                  <div className="font-bold tracking-wider text-sm">STATE BANK OF ATMOS</div>
                  <div className="text-[10px] text-atmos-secondary">EMBEDDED RTOS KIOSK NODE-01</div>
                  <div className="text-[10px] text-atmos-secondary">{formatDateTime(lastReceipt.timestamp)}</div>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-atmos-secondary">TRANSACTION ID:</span>
                  <span className="font-bold">{lastReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-atmos-secondary">CUSTOMER:</span>
                  <span>{lastReceipt.accountHolder}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-atmos-secondary">CARD NUMBER:</span>
                  <span>{lastReceipt.maskedAccount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-atmos-secondary">OPERATION:</span>
                  <span className="font-bold">{lastReceipt.type}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-atmos-secondary">LANE / TERMINAL:</span>
                  <span>LANE #{lastReceipt.lane}</span>
                </div>

                {lastReceipt.amount > 0 && (
                  <div className="flex justify-between text-xs pt-1 border-t border-dashed border-atmos-border font-bold">
                    <span>AMOUNT:</span>
                    <span>{formatCurrency(lastReceipt.amount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] pt-1 border-t border-dashed border-atmos-border">
                  <span className="text-atmos-secondary">LEDGER BALANCE:</span>
                  <span className="font-semibold">{formatCurrency(lastReceipt.updatedBalance)}</span>
                </div>

                <div className="text-center pt-3 text-[10px] text-atmos-secondary border-t border-dashed border-atmos-border">
                  * SIMULATED OS RECORD SAVED IN VIRTUAL DISK *
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-atmos-bg/30 rounded border border-dashed border-atmos-border">
                <Printer className="w-8 h-8 text-atmos-secondary mx-auto mb-2 opacity-50" />
                <p className="text-xs text-atmos-secondary font-medium">
                  No recent transaction receipt generated.
                </p>
                <p className="text-[11px] text-atmos-secondary mt-1">
                  Execute a transaction on the left to print a receipt and see the OS lifecycle in action.
                </p>
              </div>
            )}
          </div>

          {/* Under-the-hood OS Pipeline Explanation */}
          <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-atmos-primary mb-3">
              Operating System Dispatch Trace
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-atmos-highlight text-atmos-accent flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-semibold text-atmos-primary">PCB Creation (CO2)</div>
                  <div className="text-atmos-secondary text-[11px]">
                    Card insertion triggers an interrupt, creating a PCB with registers and priority level.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-atmos-highlight text-atmos-accent flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-semibold text-atmos-primary">Memory Buffer Allocation (CO4)</div>
                  <div className="text-atmos-secondary text-[11px]">
                    64KB to 128KB buffer partition allocated to hold transaction state and cryptographic session tokens.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-atmos-highlight text-atmos-accent flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-semibold text-atmos-primary">Deadlock Avoidance Check (CO3)</div>
                  <div className="text-atmos-secondary text-[11px]">
                    Banker&apos;s algorithm verifies whether cash dispenser and HSM can be reserved safely without deadlocking.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-atmos-highlight text-atmos-accent flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <div className="font-semibold text-atmos-primary">Indexed File Journaling (CO5)</div>
                  <div className="text-atmos-secondary text-[11px]">
                    Upon completion, an Index Block is assigned on virtual storage with direct pointers to the audit data blocks.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
