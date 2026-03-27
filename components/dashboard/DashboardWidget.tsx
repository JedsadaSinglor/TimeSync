
import React from 'react';
import { motion } from 'motion/react';
import { X, GripVertical, Clock, Activity, TrendingUp, BarChart3, Calendar, PieChart as PieChartIcon, Zap, Plus, ChevronRight } from 'lucide-react';
import { Category, DashboardWidget as WidgetDef } from '../../types';
import { TrendIndicator } from './DashboardShared';
import { TrendChart, WeeklyChart, BreakdownChart, DistributionChart } from './DashboardCharts';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

interface DashboardWidgetProps {
  widget: WidgetDef;
  stats: any;
  categories: Category[];
  chartsReady: boolean;
  onRemove?: (id: string) => void;
  isEditing?: boolean;
  onCategoryClick?: (categoryName: string) => void;
  children?: React.ReactNode;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  widget, stats, categories, chartsReady, onRemove, isEditing, onCategoryClick, children 
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
      case 'WEEKLY_RHYTHM':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"><Activity size={14} /></div>
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
            <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"><BarChart3 size={14} /></div>
              Activity Breakdown
            </h3>
            <div className="flex-1 min-h-0">
              <BreakdownChart data={stats.breakdownData} stacks={stats.stacks} categories={categories} ready={chartsReady} onCategoryClick={onCategoryClick} />
            </div>
          </div>
        );
      case 'DISTRIBUTION':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"><PieChartIcon size={14} /></div>
              Distribution
            </h3>
            <div className="relative flex-1 min-h-0">
              <DistributionChart data={stats.distributionData} ready={chartsReady} onCategoryClick={onCategoryClick} />
              <div className="absolute left-[35%] top-1/2 -translate-x-1/2 -translate-y-[55%] flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white">
                  {Math.round(stats.totalHours)}
                </span>
                <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">
                  Hours
                </span>
              </div>
            </div>
          </div>
        );
      case 'RECENT_LOGS':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"><Zap size={14} /></div>
              Recent Activity
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-3">
                {stats.currentLogs.slice(0, 6).map((log: any) => {
                  const cat = categories.find(c => c.id === log.categoryId);
                  return (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 flex justify-between items-center group/item hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat?.color || '#cbd5e1' }} />
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate tracking-tight ${log.notes ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                            {log.notes || "No notes"}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            {log.date.substring(5)} • {log.durationMinutes}m
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-xs font-black text-slate-900 dark:text-white block tabular-nums">{(log.durationMinutes/60).toFixed(1)}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'LOG_ACTIVITY_FORM':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"><Plus size={14} /></div>
              Quick Log
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-3">Ready to track your progress?</p>
                <Link 
                  to="/timesheet" 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={16} />
                  Start Logging
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 2).map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => showToast(`Logging for ${cat.name}...`, 'success')}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all flex flex-col items-center gap-1 group/btn"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter group-hover/btn:text-indigo-600">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-none border border-slate-200 dark:border-slate-800 p-6 h-full relative group transition-all duration-500 hover:z-50 overflow-visible ${isEditing ? 'ring-2 ring-indigo-500/40' : ''}`}
    >
      {isEditing && (
        <>
          <div className="absolute top-6 left-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity drag-handle">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-grab active:cursor-grabbing rounded-xl hover:text-slate-600 dark:hover:text-slate-200 shadow-sm">
              <GripVertical size={14} />
            </div>
          </div>
          <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onRemove?.(widget.id)}
              className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm"
            >
              <X size={14} />
            </button>
          </div>
        </>
      )}
      <div className={`h-full animate-fade-in ${isEditing ? 'pt-10' : ''}`}>
        {renderContent()}
      </div>
      {children}
    </motion.div>
  );
};
