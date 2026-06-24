import React from 'react';

interface DashboardSkeletonProps {
  variant?: 'producer' | 'admin';
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ variant = 'producer' }) => {
  return (
    <div className="space-y-8 text-left bg-brand-bg text-white p-5 md:p-8 rounded-3xl border border-brand-border/40 shadow-2xl min-h-[90vh] animate-pulse">
      
      {/* 1. Header Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-brand-border pb-6">
        <div className="space-y-2.5 flex-grow">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/30" />
            <div className="h-4 bg-[#1C1C2E] rounded-md w-36" />
          </div>
          <div className="h-8 bg-[#1C1C2E] rounded-md w-72 md:w-96" />
          <div className="h-4 bg-[#1C1C2E]/60 rounded-md w-full max-w-2xl" />
        </div>
        
        {/* Buttons placeholders */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="h-10 w-24 bg-[#13131F] border border-brand-border rounded-xl" />
          <div className="h-10 w-36 bg-[#1C1C2E] rounded-xl" />
        </div>
      </div>

      {/* 2. Optional KYC Badge or alert banner skeleton */}
      {variant === 'producer' && (
        <div className="bg-amber-950/10 border border-amber-500/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 flex-grow">
            <div className="w-10 h-10 bg-[#25253c]/40 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-grow">
              <div className="h-4.5 bg-[#25253c]/40 rounded-md w-64" />
              <div className="h-3.5 bg-[#25253c]/30 rounded-md w-11/12" />
            </div>
          </div>
          <div className="w-32 h-8 bg-[#25253c]/50 rounded-xl flex-shrink-0" />
        </div>
      )}

      {/* 3. KPI blocks grid skeleton */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${variant === 'producer' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {Array.from({ length: variant === 'producer' ? 4 : 3 }).map((_, i) => (
          <div key={i} className="bg-[#13131F]/60 p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-[#1C1C2E]/70 rounded-md w-28" />
              <div className="w-8 h-8 rounded-xl bg-[#25253c]/30 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-7 bg-[#1C1C2E] rounded-md w-24" />
              <div className="h-3 bg-[#1C1C2E]/40 rounded-md w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Large Analytics Content / Table Layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Long List or Table of metrics */}
        <div className="lg:col-span-8 bg-[#13131F]/50 p-6 rounded-2xl border border-brand-border/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
            <div className="space-y-2">
              <div className="h-3 bg-[#1C1C2E]/50 rounded-md w-24" />
              <div className="h-5 bg-[#1C1C2E] rounded-md w-48" />
            </div>
            <div className="w-36 h-7 bg-[#1C1C2E]/60 rounded-md" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, rIdx) => (
              <div key={rIdx} className="flex justify-between items-center py-3 border-b border-white/5">
                <div className="flex items-center gap-3 flex-grow">
                  <div className="w-10 h-10 rounded-xl bg-[#25253c]/30 flex-shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-[#1C1C2E] rounded-md w-2/5" />
                    <div className="h-3.5 bg-[#1C1C2E]/50 rounded-md w-1/5" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4.5 bg-[#1C1C2E] rounded-md w-16 ml-auto" />
                  <div className="h-3 bg-[#1C1C2E]/40 rounded-md w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Circular metrics or stats panel card */}
        <div className="lg:col-span-4 bg-[#13131F]/50 p-6 rounded-2xl border border-brand-border/40 flex flex-col justify-between space-y-6">
          <div className="space-y-2 border-b border-brand-border/60 pb-4">
            <div className="h-5 bg-[#1C1C2E] rounded-md w-36" />
            <div className="h-3.5 bg-[#1C1C2E]/50 rounded-md w-24" />
          </div>

          {/* Simulated chart / circle mockup */}
          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36 rounded-full border-[10px] border-[#1C1C2E] flex items-center justify-center">
              <div className="absolute inset-2 rounded-full border-4 border-[#25253c]/20" />
              <div className="space-y-1 text-center">
                <div className="h-4 bg-[#1D1C2E] rounded-md w-12 mx-auto" />
                <div className="h-3 bg-[#1D1C2E]/40 rounded-md w-8 mx-auto" />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-[#1C1C2E]/50 rounded-md w-16" />
              <div className="h-3 bg-[#1C1C2E] rounded-md w-8" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-[#1C1C2E]/50 rounded-md w-20" />
              <div className="h-3 bg-[#1C1C2E] rounded-md w-8" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-[#1C1C2E]/50 rounded-md w-24" />
              <div className="h-3 bg-[#1C1C2E] rounded-md w-8" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
