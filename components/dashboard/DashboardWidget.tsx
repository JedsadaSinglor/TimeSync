
import React from 'react';
import { X, GripVertical, Settings2, Clock, Activity, TrendingUp, Building, Home, MapPin, Palmtree, Target, BarChart3, Calendar, PieChart as PieChartIcon, Zap } from 'lucide-react';
import { WidgetType, DashboardWidget as WidgetDef } from '../../types';
import { TrendIndicator, ChartSkeleton } from './DashboardShared';
import { TrendChart, HourlyChart, WeeklyChart, BreakdownChart, DistributionChart } from './DashboardCharts';

interface DashboardWidgetProps {
  widget: WidgetDef;
  stats: any;
  chartsReady: boolean;
  onRemove?: (id: string) => void;
  isEditing?: boolean;
  children?: React.ReactNode;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  widget, stats, chartsReady, onRemove, isEditing, children 
}) => {
  const renderContent = () => {
    switch (widget.type) {
      case 'STATS_HOURS':
        return (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm"><Clock size={20} /></div>
              <TrendIndicator current={stats.totalHours} previous={stats.prevTotalHours} />
            </div>
            <div className="mt-auto">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Hours</h3>
              <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.totalHours.toFixed(1)}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-16 opacity-10 dark:opacity-20 pointer-events-none">
               <TrendChart data={stats.trendData} ready={chartsReady} />
            </div>
          </div>
        );
      case 'STATS_AVG':
        return (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl shadow-sm"><Activity size={20} /></div>
              <TrendIndicator current={stats.avgHoursPerDay} previous={stats.prevAvgHoursPerDay} />
            </div>
            <div className="mt-auto">
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Daily Average</h3>
              <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.avgHoursPerDay.toFixed(1)}<span className="text-sm text-slate-400 ml-1">h</span></p>
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
              <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Top Category</h3>
              <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight truncate" title={stats.topCat.name}>{stats.topCat.name}</p>
              {stats.totalHours > 0 && (
                <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(stats.topCat.minutes / (stats.totalHours * 60)) * 100}%`}}></div>
                </div>
              )}
            </div>
          </div>
        );
      case 'LOCATION_STATS':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
            {[
              { label: 'Office', val: stats.locationStats.WFO, icon: Building, color: 'blue' },
              { label: 'WFH', val: stats.locationStats.WFH, icon: Home, color: 'purple' },
              { label: 'Site', val: stats.locationStats.SITE, icon: MapPin, color: 'amber' },
              { label: 'Holiday', val: stats.locationStats.HOLIDAY, icon: Palmtree, color: 'rose' }
            ].map((loc) => (
              <div key={loc.label} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className={`p-2 bg-${loc.color}-50 dark:bg-${loc.color}-500/10 text-${loc.color}-600 dark:text-${loc.color}-400 rounded-xl`}>
                  <loc.icon size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{loc.label}</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{loc.val}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'SESSION_STATS':
        return (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Target size={14} /></div>
              Session Stats
            </h3>
            <div className="grid grid-cols-1 gap-3 mt-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Session</span>
                <span className="text-xl font-black text-slate-800 dark:text-white">{(stats.sessionStats.avg / 60).toFixed(1)}h</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Longest</span>
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><PieChartIcon size={14} /></div>
              Distribution
            </h3>
            <div className="flex-1 min-h-0 relative">
              <DistributionChart data={stats.distributionData} ready={chartsReady} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.totalHours.toFixed(0)}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Hours</span>
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
                {stats.currentLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{log.notes || "No notes"}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{log.date.substring(5)} • {log.durationMinutes}m</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">{(log.durationMinutes/60).toFixed(1)}h</span>
                  </div>
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
    <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full relative group transition-all duration-300 ${isEditing ? 'ring-2 ring-indigo-500/20' : ''}`}>
      {isEditing && (
        <div className="absolute top-4 right-4 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-grab active:cursor-grabbing rounded-lg hover:text-slate-600 dark:hover:text-slate-200">
            <GripVertical size={14} />
          </div>
          <button 
            onClick={() => onRemove?.(widget.id)}
            className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {renderContent()}
      {children}
    </div>
  );
};
