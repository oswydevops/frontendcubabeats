import React from 'react';

interface BeatCardSkeletonProps {
  index: number;
}

export const BeatCardSkeleton: React.FC<BeatCardSkeletonProps> = ({ index }) => {
  return (
    <div
      id={`beat-skeleton-card-${index}`}
      className="flex flex-col bg-[#13131F] rounded-2xl border border-[rgba(127,119,221,0.06)] overflow-hidden h-full"
    >
      {/* Cover Image Placeholder */}
      <div className="relative w-full aspect-square bg-[#1C1C2E] overflow-hidden">
        {/* Subtle diagonal highlight mimicking shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        
        {/* Absolute placeholder icons or decorative pulse circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#25253c] opacity-20 animate-pulse" />
        </div>

        {/* Top Mini Badges placeholders in image area */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <div className="h-4 w-12 bg-[#25253c] rounded-md opacity-50 animate-pulse" />
        </div>
      </div>

      {/* Info Part placeholders */}
      <div className="p-4 flex flex-col flex-grow justify-between min-h-[140px]">
        <div className="space-y-2">
          {/* Beat Title line */}
          <div className="h-4 bg-[#1C1C2E] rounded-md w-4/5 animate-pulse" />
          
          {/* Producer Name line */}
          <div className="h-3.5 bg-[#1C1C2E]/60 rounded-md w-2/5 animate-pulse" />

          {/* Miniature Tag Badges */}
          <div className="flex gap-1.5 pt-2.5">
            <div className="h-4 bg-[#25253c]/40 rounded-md w-10 animate-pulse" />
            <div className="h-4 bg-[#25253c]/40 rounded-md w-12 animate-pulse" />
            <div className="h-4 bg-[#25253c]/40 rounded-md w-11 animate-pulse" />
          </div>
        </div>

        {/* Pricing tag & Cart action footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-auto">
          <div className="space-y-1.5 flex-grow">
            <div className="h-3 bg-[#1C1C2E]/50 rounded-md w-14 animate-pulse" />
            <div className="h-4.5 bg-[#1C1C2E] rounded-md w-24 animate-pulse" />
          </div>
          
          {/* Cart Button Placeholder */}
          <div className="w-8 h-8 rounded-lg bg-[#25253c]/60 flex-shrink-0 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
