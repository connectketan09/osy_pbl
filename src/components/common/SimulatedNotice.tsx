import React from 'react';
import { Info } from 'lucide-react';

interface SimulatedNoticeProps {
  className?: string;
  compact?: boolean;
}

export const SimulatedNotice: React.FC<SimulatedNoticeProps> = ({
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-atmos-secondary bg-white border border-atmos-border rounded ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-atmos-teal animate-pulse" />
        <span className="font-medium text-atmos-primary">Simulated Environment:</span>
        <span>OS metrics & records are virtual constructs for CE Sem 5 OSY PBL.</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 bg-white border border-atmos-border rounded-lg flex items-start gap-3 shadow-xs ${className}`}
    >
      <div className="p-1 rounded bg-atmos-highlight text-atmos-accent mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="text-xs text-atmos-secondary leading-relaxed">
        <strong className="text-atmos-primary font-medium">Educational Simulation Notice:</strong>{' '}
        All system metrics (CPU utilization, real-time scheduler cycles, buffer partitions, Banker's resource allocations, and indexed disk blocks) are deterministic simulations designed for the Diploma in Computer Engineering, Semester 5 Operating Systems (OSY 315319) course. They do not read or control your actual host machine's hardware or real financial banking networks.
      </div>
    </div>
  );
};
