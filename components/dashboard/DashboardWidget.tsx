
import React, { useState } from 'react';
import { X, GripVertical, Clock, Activity, TrendingUp, Building, Home, MapPin, Palmtree, Target, BarChart3, Calendar, PieChart as PieChartIcon, Zap } from 'lucide-react';
import { Category, WidgetType, DashboardWidget as WidgetDef } from '../../types';
import { TrendIndicator, ChartSkeleton, CustomTooltip } from './DashboardShared';
import { TrendChart, HourlyChart, WeeklyChart, BreakdownChart, DistributionChart } from './DashboardCharts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { getLocalDateStr } from '../../utils/storage';

interface DashboardWidgetProps {
  widget: WidgetDef;
  stats: any;
  categories: Category[];
  chartsReady: boolean;
  onRemove?: (id: string) => void;
  isEditing?: boolean;
  children?: React.ReactNode;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  widget, stats, categories, chartsReady, onRemove, isEditing, children 
}) => {
  const { currentUser } = useApp();
  const { showToast } = useToast();

  const renderContent = () => {
    switch (widget.type) {
      case 'STATS_HOURS':
        return (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm"><Clock size={20} /></div>
              <TrendIndicator current={stats.totalHours} previous={stats.prevTotalHours} />
            </div>
            <div className="mt-auto">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Hours</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.totalHours.toFixed(1)}</p>
                <span className="text-xs font-bold text-slate-500">HRS</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-[0.07] dark:opacity-[0.12] pointer-events-none">
               <TrendChart data={stats.trendData} ready={chartsReady} />
            </div>
          </div>
        );
      case 'STATS_AVG':
        return (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm"><Activity size={20} /></div>
              <TrendIndicator current={stats.avgHoursPerDay} previous={stats.prevAvgHoursPerDay} />
            </div>
            <div className="mt-auto">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Daily Average</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.avgHoursPerDay.toFixed(1)}</p>
                <span className="text-xs font-bold text-slate-500">H/DAY</span>
              </div>
            </div>
          </div>
        );
      case 'STATS_TOP':
        return (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl shadow-sm"><TrendingUp size={20} /></div>
              <TrendIndicator current={stats.topCat.minutes} previous={stats.prevMinutesForTopCat} />
            </div>
            <div className="mt-auto">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Top Focus</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate mb-1" title={stats.topCat.name}>{stats.topCat.name}</p>
              {stats.totalHours > 0 && (
                <div className="mt-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{(stats.topCat.minutes / 60).toFixed(1)}h logged</span>
                    <span className="text-[10px] font-black text-orange-500 dark:text-orange-400">{((stats.topCat.minutes / (stats.totalHours * 60)) * 100).toFixed(0)}% of total</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.4)]" style={{ width: `${(stats.topCat.minutes / (stats.totalHours * 60)) * 100}%`}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'STATS_ACTIVE_DAYS':
        return (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm"><Calendar size={20} /></div>
            </div>
            <div className="mt-auto">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Days</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.activeDays}</p>
                <span className="text-xs font-bold text-slate-500">DAYS</span>
              </div>
            </div>
          </div>
        );
      case 'LOCATION_STATS':
        const locData = [
          { name: 'Office', value: stats.locationStats.WFO, color: '#3b82f6' },
          { name: 'WFH', value: stats.locationStats.WFH, color: '#a855f7' },
          { name: 'Site', value: stats.locationStats.SITE, color: '#f59e0b' },
          { name: 'Holiday', value: stats.locationStats.HOLIDAY, color: '#f43f5e' }
        ].filter(d => d.value > 0);
        
        return (
          <div className="flex items-center justify-between h-full gap-4">
            <div className="flex-1">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Work Locations</h3>
              {locData.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {locData.map((loc) => (
                    <div key={loc.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: loc.color }} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{loc.name}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white ml-auto">{loc.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No location data</p>
              )}
            </div>
            {locData.length > 0 && (
              <div className="w-20 h-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={locData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value" isAnimationActive={false}>
                      {locData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      case 'SESSION_STATS':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Target size={14} /></div>
              Session Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Avg</span>
                <span className="text-xl font-black text-slate-800 dark:text-white">{(stats.sessionStats.avg / 60).toFixed(1)}h</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Longest</span>
                <span className="text-xl font-black text-slate-800 dark:text-white">{(stats.sessionStats.longest / 60).toFixed(1)}h</span>
              </div>
            </div>
          </div>
        );
      case 'PEAK_HOURS':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><BarChart3 size={14} /></div>
              Peak Hours
            </h3>
            <div className="flex-1 min-h-0">
              <HourlyChart data={stats.hourlyData} ready={chartsReady} />
            </div>
          </div>
        );
      case 'WEEKLY_RHYTHM':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Activity size={14} /></div>
              Weekly Rhythm
            </h3>
            <div className="flex-1 min-h-0">
              <WeeklyChart data={stats.weeklyData} ready={chartsReady} />
            </div>
          </div>
        );
      case 'ACTIVITY_BREAKDOWN':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Calendar size={14} /></div>
              Activity Breakdown
            </h3>
            <div className="flex-1 min-h-0">
              <BreakdownChart data={stats.breakdownData} stacks={stats.stacks} ready={chartsReady} />
            </div>
          </div>
        );
      case 'DISTRIBUTION':
        return (
          <div className="flex flex-col h-full">
  <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-800 dark:text-white">
    <span 
      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
      aria-hidden="true"
    >
      <PieChartIcon size={14} />
    </span>
    Distribution
  </h3>
  
  <div className="relative flex-1 min-h-0">
    <DistributionChart data={stats.distributionData} ready={chartsReady} />
    
    <div className="absolute left-[30%] top-1/2 -translate-x-1/2 -translate-y-[55%] flex flex-col items-center justify-center pointer-events-none">
      <span className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
        {Math.round(stats.totalHours)}
      </span>
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
        Hours
      </span>
    </div>
  </div>
</div>
        );
      case 'RECENT_LOGS':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Zap size={14} /></div>
              Recent Activity
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-2">
                {stats.currentLogs.slice(0, 5).map((log: any) => {
                  const cat = categories.find(c => c.id === log.categoryId);
                  return (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center group/item hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat?.color || '#cbd5e1' }} />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${log.notes ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                            {log.notes || "No notes"}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                            {log.date.substring(5)} • {log.durationMinutes}m
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">{(log.durationMinutes/60).toFixed(1)}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none border border-slate-200 dark:border-slate-800 p-6 h-full relative group transition-all duration-500 hover:-translate-y-1 ${isEditing ? 'ring-2 ring-indigo-500/40' : ''}`}>
      {isEditing && (
        <>
          <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity drag-handle">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-grab active:cursor-grabbing rounded-xl hover:text-slate-600 dark:hover:text-slate-200 shadow-sm">
              <GripVertical size={14} />
            </div>
          </div>
          <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onRemove?.(widget.id)}
              className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm"
            >
              <X size={14} />
            </button>
          </div>
        </>
      )}
      <div className={`h-full animate-fade-in ${isEditing ? 'pt-8' : ''}`}>
        {renderContent()}
      </div>
      {children}
    </div>
  );
};
