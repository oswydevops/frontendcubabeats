import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  themeMode?: 'dark' | 'light';
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  themeMode = 'dark',
  children,
  maxWidth = 'max-w-md'
}) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0D0D14]/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div 
        className={`relative w-full ${maxWidth} rounded-2xl ${
          themeMode === 'dark' 
            ? 'bg-[#13131F] border border-[rgba(127,119,221,0.25)] text-white' 
            : 'bg-white border border-gray-100 text-[#111827]'
        } shadow-2xl p-6 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-opacity-10 border-white">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-opacity-10 hover:bg-white transition-colors cursor-pointer ${
              themeMode === 'dark' ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-black'
            }`}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
