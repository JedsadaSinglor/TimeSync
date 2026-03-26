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
        <div title="vs previous period" className={`flex items-center gap-1 ${colorClass} px-2 py-1 rounded-full shadow-sm border border-transparent`}>
            <Icon size={12} strokeWidth={3} />
            <span className="text-[10px] font-black">{Math.abs(percent).toFixed(1)}%</span>
        </div>
    );
};

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  totalValue?: number; // Optional total for percentage calculation
}

export const CustomTooltip = ({ active, payload, label, totalValue }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const stackTotal = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    const chartTotal = totalValue || stackTotal;
    
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50 ring-1 ring-white/10 min-w-[200px]">
        {label && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">{label}</p>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        )}
        <div className="space-y-2.5">
          {payload.map((entry: any, index: number) => {
             if (entry.value === undefined || entry.value === null) return null;
             const percent = chartTotal > 0 ? ((entry.value / chartTotal) * 100).toFixed(1) : '0.0';
             return (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
                  <span className="text-xs font-bold text-slate-300 tracking-tight">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-white font-mono tracking-tighter">
                    {(entry.value / 60).toFixed(1)}h
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold w-10 text-right tabular-nums">[{percent}%]</span>
                </div>
              </div>
             );
          })}
          {payload.length > 1 && (
            <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-xs font-black text-indigo-400 font-mono tracking-tighter">{(stackTotal / 60).toFixed(1)}h</span>
            </div>
          )}
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
