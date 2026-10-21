import React, { useState } from 'react';
import { Menu, RotateCcw, Plus, Clock, Activity, HardDrive } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { formatUptime, formatCurrency } from '../../utils/formatters';
import { ResetModal } from '../common/ResetModal';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { uptimeSeconds, metrics, atmCash, resetToDemoData } = useSimulation();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-atmos-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs select-none">
        {/* Left Side: Mobile toggle & Breadcrumb/Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-atmos-secondary hover:text-atmos-primary hover:bg-atmos-highlight rounded transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-atmos-highlight text-atmos-accent border border-atmos-border">
              <span className="w-2 h-2 rounded-full bg-atmos-teal animate-pulse" />
              RTOS Embedded Core
            </span>
            <span className="text-xs text-atmos-secondary hidden md:inline">
              Simulated Multitasking ATM Environment
            </span>
          </div>
        </div>

        {/* Right Side: Telemetry & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Uptime clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-atmos-highlight/70 border border-atmos-border rounded text-xs text-atmos-primary font-mono">
            <Clock className="w-3.5 h-3.5 text-atmos-secondary" />
            <span className="text-atmos-secondary text-[11px] font-sans">Uptime:</span>
            <span>{formatUptime(uptimeSeconds)}</span>
          </div>

          {/* Quick Cash dispenser indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-atmos-border rounded text-xs text-atmos-primary font-mono">
            <span className="text-atmos-secondary text-[11px] font-sans">Vault:</span>
            <span className="font-semibold text-atmos-primary">{formatCurrency(atmCash)}</span>
          </div>

          {/* CPU indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-atmos-border rounded text-xs text-atmos-primary font-mono">
            <Activity className="w-3.5 h-3.5 text-atmos-accent" />
            <span className="text-atmos-secondary text-[11px] font-sans">CPU:</span>
            <span>{metrics.cpuUtilizationPercent}%</span>
          </div>

          {/* Memory indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-atmos-border rounded text-xs text-atmos-primary font-mono">
            <HardDrive className="w-3.5 h-3.5 text-atmos-teal" />
            <span className="text-atmos-secondary text-[11px] font-sans">Buffer:</span>
            <span>
              {metrics.memoryUsedKB} / {metrics.memoryTotalKB} KB
            </span>
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-atmos-secondary hover:text-atmos-primary bg-white hover:bg-atmos-highlight border border-atmos-border rounded transition-colors shadow-2xs"
            title="Restore default deterministic test dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-atmos-secondary" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Launch Transaction Quick Link */}
          <Link
            to="/atm"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-atmos-accent hover:bg-atmos-accentHover rounded transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate ATM</span>
          </Link>
        </div>
      </header>

      {/* Confirmation Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetToDemoData}
      />
    </>
  );
};
