import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'steel' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeVariant = 'steel',
}) => {
  return (
    <div className="bg-white border border-atmos-border rounded-lg p-5 shadow-sm hover:border-[#CCD2D8] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-atmos-secondary">
          {title}
        </span>
        <div className="w-8 h-8 rounded bg-atmos-highlight flex items-center justify-center text-atmos-accent">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-atmos-primary">
          {value}
        </div>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              badgeVariant === 'success'
                ? 'bg-atmos-successBg text-atmos-success border border-[#D3E2D8]'
                : badgeVariant === 'warning'
                ? 'bg-atmos-warningBg text-atmos-warning border border-[#F2E5D0]'
                : 'bg-atmos-highlight text-atmos-accent border border-atmos-border'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-2 text-xs text-atmos-secondary truncate">{subtext}</p>
      )}
    </div>
  );
};
