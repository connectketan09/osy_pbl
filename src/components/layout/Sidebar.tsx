import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Cpu,
  Clock,
  ShieldAlert,
  Layers,
  FolderGit2,
  Server,
  BookOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  coBadge?: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Overview Dashboard',
    to: '/',
    icon: LayoutDashboard,
    description: 'System metrics & telemetry',
  },
  {
    name: 'ATM Transactions',
    to: '/atm',
    icon: CreditCard,
    coBadge: 'EXEC',
    description: 'Direct ATM terminal simulator',
  },
  {
    name: 'Process Manager',
    to: '/processes',
    icon: Cpu,
    coBadge: 'CO2',
    description: 'PCB & 5-state lifecycle',
  },
  {
    name: 'CPU Scheduling',
    to: '/scheduling',
    icon: Clock,
    coBadge: 'CO3',
    description: 'FCFS, SJF, Priority, RR',
  },
  {
    name: 'Banker’s Algorithm',
    to: '/bankers',
    icon: ShieldAlert,
    coBadge: 'CO3',
    description: 'Deadlock avoidance & safety',
  },
  {
    name: 'Memory Management',
    to: '/memory',
    icon: Layers,
    coBadge: 'CO4',
    description: 'Partitions & FIFO paging',
  },
  {
    name: 'File System',
    to: '/files',
    icon: FolderGit2,
    coBadge: 'CO5',
    description: 'Indexed allocation & blocks',
  },
  {
    name: 'System Information',
    to: '/system-info',
    icon: Server,
    coBadge: 'CO1',
    description: 'Embedded RTOS architecture',
  },
  {
    name: 'Project Documentation',
    to: '/docs',
    icon: BookOpen,
    coBadge: 'VIVA',
    description: 'College OSY micro-project report',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-atmos-sidebar text-[#C5CCD6] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#1B232E] select-none`}
      >
        {/* Header / Brand */}
        <div className="h-16 px-5 border-b border-[#2C3848] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-atmos-accent flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
              AT
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                ATMOS
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#2C3848] text-atmos-highlight">
                  v2.4
                </span>
              </div>
              <div className="text-[11px] text-[#8692A2] font-medium tracking-tight">
                Bank ATM OS Simulator
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-[#8692A2] hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="px-5 py-2.5 bg-[#1B232E]/70 border-b border-[#2C3848]">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-[#738294]">
            Diploma CE — Sem 5
          </div>
          <div className="text-xs font-medium text-[#D1D8E0] flex justify-between items-center mt-0.5">
            <span>Operating Systems</span>
            <span className="font-mono text-[11px] text-[#8F9CAE]">OSY 315319</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-[#6C7A8B]">
            OS Core Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-atmos-sidebarActive text-white border-l-2 border-atmos-accent shadow-xs'
                      : 'text-[#9AA5B5] hover:bg-atmos-sidebarHover hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-[#8693A4]" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.coBadge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      item.coBadge === 'VIVA'
                        ? 'bg-[#3A3347] text-[#D8C7F0]'
                        : item.coBadge === 'EXEC'
                        ? 'bg-[#263D39] text-[#7FD6C2]'
                        : 'bg-[#293649] text-[#A6BFD9]'
                    }`}
                  >
                    {item.coBadge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System State Footer */}
        <div className="p-4 border-t border-[#2C3848] bg-[#1B232E]/90 text-[11px]">
          <div className="flex items-center justify-between text-[#8692A2] mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-atmos-teal animate-pulse" />
              RTOS Kernel State
            </span>
            <span className="font-mono text-white text-[10px]">SIMULATED</span>
          </div>
          <div className="text-[10px] text-[#697788] leading-tight mt-1">
            Compliant with MSBTE CE5I curriculum guidelines.
          </div>
        </div>
      </aside>
    </>
  );
};
