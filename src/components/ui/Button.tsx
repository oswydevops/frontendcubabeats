import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98';
  
  const variants = {
    primary: 'gradient-primary text-white hover:opacity-95 shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/20',
    secondary: 'border border-brand-primary-light text-brand-primary-light bg-transparent hover:bg-brand-primary-light/10',
    ghost: 'bg-brand-primary-light/10 text-brand-primary-light hover:bg-brand-primary-light/20',
    danger: 'gradient-danger text-white hover:opacity-95 shadow-md shadow-brand-accent-red/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
