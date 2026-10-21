import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSimulation } from '../../context/SimulationContext';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, dismissNotification } = useSimulation();

  return (
    <div className="min-h-screen bg-atmos-bg flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Muted Academic Footer */}
        <footer className="border-t border-atmos-border bg-white py-4 px-6 text-center text-xs text-atmos-secondary no-print">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div>
              <strong className="text-atmos-primary">ATMOS:</strong> Bank ATM Transaction Simulator — Operating Systems (OSY 315319) PBL Project
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>Diploma CE Sem 5</span>
              <span>•</span>
              <span>CO1 to CO5 Demonstrated</span>
              <span>•</span>
              <span className="font-mono text-atmos-teal">RTOS Simulation</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Notifications / Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => {
          let icon = <Info className="w-4 h-4 text-atmos-accent" />;
          let borderClass = 'border-atmos-border';
          let bgClass = 'bg-white';

          if (n.type === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-atmos-success" />;
            borderClass = 'border-[#D3E2D8]';
            bgClass = 'bg-atmos-successBg';
          } else if (n.type === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-atmos-warning" />;
            borderClass = 'border-[#F2E5D0]';
            bgClass = 'bg-atmos-warningBg';
          } else if (n.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-atmos-error" />;
            borderClass = 'border-[#F4D9D9]';
            bgClass = 'bg-atmos-errorBg';
          }

          return (
            <div
              key={n.id}
              className={`pointer-events-auto p-3.5 rounded-lg shadow-md border ${borderClass} ${bgClass} flex items-start gap-3 text-xs text-atmos-primary transition-all animate-in slide-in-from-bottom-2`}
            >
              <div className="mt-0.5 shrink-0">{icon}</div>
              <div className="flex-1 font-medium leading-relaxed">{n.message}</div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="text-atmos-secondary hover:text-atmos-primary p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
