import React from 'react';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

export const TrendIndicator = ({ current, previous, inverse = false }: { current: number, previous: number, inverse?: boolean }) => {
    if (previous === 0) return <span className="text-[10px] text-slate-400 font-medium">New</span>;
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    const isUp = diff > 0;
    const isNeutral = diff === 0;
    if (isNeutral) return <span className="text-[10px] text-slate-400 font-medium">-</span>;
    const isPositiveColor = isUp ? !inverse : inverse;
    const colorClass = isPositiveColor ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400';
    const Icon = isUp ? ArrowUpRight : ArrowDownRight;
    return (
        <div className={`flex items-center gap-1 ${colorClass} px-2 py-1 rounded-full shadow-sm border border-transparent`}>
            <Icon size={12} strokeWidth={3} />
            <span className="text-[10px] font-black">{Math.abs(percent).toFixed(1)}%</span>
        </div>
    );
};

export interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; color: string; name: string }[];
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-100 dark:border-slate-700 p-4 rounded-xl shadow-xl animate-fade-in z-50 ring-1 ring-black/5">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index: number) => (
             entry.value && entry.value > 0 && (
              <div key={index} className="flex items-center justify-between gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {entry.value.toFixed(1)} h
                </span>
              </div>
             )
          ))}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</span>
            <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{total.toFixed(1)} h</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ChartSkeleton = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800">
    <Loader2 className="animate-spin text-slate-300 dark:text-slate-600 mb-2" size={24} />
    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Loading Data...</span>
  </div>
);
