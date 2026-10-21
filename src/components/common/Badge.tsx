import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'steel' | 'teal';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-[#EDF1F4] text-[#526B85] border border-[#D5DCE2]';

  switch (variant) {
    case 'success':
      colorClasses = 'bg-[#F0F5F2] text-[#527A62] border border-[#D3E2D8]';
      break;
    case 'warning':
      colorClasses = 'bg-[#FDF9F3] text-[#A78045] border border-[#F2E5D0]';
      break;
    case 'error':
      colorClasses = 'bg-[#FDF5F5] text-[#A65D5D] border border-[#F4D9D9]';
      break;
    case 'steel':
      colorClasses = 'bg-[#EDF1F4] text-[#526B85] border border-[#CBD5E1]';
      break;
    case 'teal':
      colorClasses = 'bg-[#F0F5F4] text-[#638A84] border border-[#CFDFDC]';
      break;
    default:
      colorClasses = 'bg-[#F1F3F5] text-[#5A6370] border border-[#E2E5E8]';
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded ${sizeClasses} ${colorClasses} tracking-tight`}
    >
      {children}
    </span>
  );
};
