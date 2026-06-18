import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'green' | 'red' | 'amber' | 'blue';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  className = ''
}) => {
  const styles = {
    purple: 'bg-[#EEEDFE]/15 text-[#7F77DD] border border-[#7F77DD]/30', // custom elegant dark mode fallback for main view
    green: 'bg-[#EAF3DE] text-[#3B6D11]',
    red: 'bg-[#FCEBEB] text-[#A32D2D]',
    amber: 'bg-[#FAEEDA] text-[#854F0B]',
    blue: 'bg-[#E6F1FB] text-[#185FA5]'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
