import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  themeMode?: 'dark' | 'light';
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  themeMode = 'dark',
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const baseInputStyle = 'w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none text-sm';
  
  const darkStyle = 'bg-[#1C1C2E] border-[rgba(127,119,221,0.2)] text-white placeholder-white/35 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]/35';
  
  const lightStyle = 'bg-white border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]/35';

  const selectedStyle = themeMode === 'dark' ? darkStyle : lightStyle;

  return (
    <div className="w-full text-left">
      {label && (
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`${baseInputStyle} ${selectedStyle} ${error ? 'border-brand-accent-red focus:border-[#E24B4A]' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors ${themeMode === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-[#111827]'}`}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-brand-accent-red mt-1 block font-medium">{error}</span>}
    </div>
  );
};
