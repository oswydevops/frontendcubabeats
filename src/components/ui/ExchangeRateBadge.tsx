import React from 'react';
import { useApp } from '../../store/AppContext';
import { formatRelativeTime } from '../../utils/date';
import { TrendingUp, Clock, Info } from 'lucide-react';

interface ExchangeRateBadgeProps {
  variant?: 'pill' | 'card' | 'banner' | 'compact';
  showMLC?: boolean;
  className?: string;
}

export const ExchangeRateBadge: React.FC<ExchangeRateBadgeProps> = ({
  variant = 'pill',
  showMLC = true,
  className = ''
}) => {
  const { exchangeRates } = useApp();

  const usdToCup = exchangeRates?.USD || exchangeRates?.CUP || 385;
  const mlcToCup = exchangeRates?.MLC || 280;
  const mlcPerUsd = (usdToCup / mlcToCup).toFixed(2);
  const timeText = formatRelativeTime(exchangeRates?.timestamp || (Date.now() - 3 * 3600 * 1000));
  const sourceText = exchangeRates?.source || 'El Toque';

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161626] border border-brand-primary/25 text-xs text-gray-300 ${className}`}
        title={`Tasa de cambio del mercado informal · Fuente: ${sourceText} · Actualizado: ${timeText}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono font-semibold text-white">1 USD ≈ {usdToCup} CUP</span>
        {showMLC && (
          <>
            <span className="text-gray-500">·</span>
            <span className="font-mono text-cyan-300">{mlcPerUsd} MLC</span>
          </>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-xl bg-[#131322] border border-brand-primary/20 text-left space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Tasa Oficial Informal (El Toque)
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
            <Clock size={11} className="text-gray-500" />
            {timeText}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#1A1A2E] p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 block font-mono">1 USD a CUP</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">≈ {usdToCup} CUP</span>
          </div>
          <div className="bg-[#1A1A2E] p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 block font-mono">1 USD a MLC</span>
            <span className="text-base font-extrabold font-mono text-cyan-400">≈ {mlcPerUsd} MLC</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-gray-400 pt-1 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Info size={11} className="text-[#7F77DD]" />
            Fuente: <span className="text-white font-medium">{sourceText}</span>
          </span>
          <span className="text-gray-500">Auto-sincronizado</span>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`px-4 py-2.5 rounded-xl bg-[#151525] border border-[#7F77DD]/30 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-3 shadow-sm ${className}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Tasa del Día:</span>
          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            1 USD ≈ {usdToCup} CUP
          </span>
          {showMLC && (
            <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              1 USD ≈ {mlcPerUsd} MLC
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span>Fuente: <strong className="text-white font-medium">{sourceText}</strong></span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-gray-500" />
            Actualizado {timeText}
          </span>
        </div>
      </div>
    );
  }

  // Default 'pill'
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161628] border border-[rgba(127,119,221,0.3)] text-xs text-gray-300 shadow-sm ${className}`}
      title={`Tasa de cambio del mercado informal · Fuente: ${sourceText} · Actualizado: ${timeText}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono font-bold text-white">1 USD ≈ {usdToCup} CUP</span>
        {showMLC && (
          <>
            <span className="text-gray-600 font-mono">·</span>
            <span className="font-mono text-cyan-300 font-semibold">{mlcPerUsd} MLC</span>
          </>
        )}
      </div>
      <span className="text-gray-600">·</span>
      <span className="text-[11px] text-gray-400">
        Fuente: <strong className="text-white font-medium">{sourceText}</strong>
      </span>
      <span className="text-gray-600">·</span>
      <span className="text-[11px] text-gray-400 flex items-center gap-1">
        <Clock size={11} className="text-gray-500" />
        {timeText}
      </span>
    </div>
  );
};
