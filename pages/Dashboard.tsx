
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Filter, Layers, Loader2, Activity, Clock, Download, Target, Calendar } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';
import { useDashboardStats, TimeRange } from '../hooks/useDashboardStats';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { DEFAULT_WIDGETS } from '../constants';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

const Dashboard: React.FC = () => {
  const { logs, categories, currentUser, dayConfigs, dashboardWidgets, updateDashboardWidgets } = useApp();
  const { showToast } = useToast();
  const [chartsReady, setChartsReady] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('MONTH');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setChartsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = useDashboardStats(
    logs, categories, currentUser, dayConfigs, timeRange, selectedCategoryId, selectedSubCategoryId, chartsReady
  );

  const {
    currentLogs,
    totalHours,
    activeDays
  } = stats;

  if (!currentUser) return null;

  if (logs.length === 0) {
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        Welcome back, {currentUser.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Your personal productivity dashboard is ready.
                    </p>
                </div>
            </div>

            <EmptyState 
                icon={Activity}
                title="No Activity Logged Yet"
                description="Start tracking your time to see powerful insights about your productivity patterns here."
                action={
                    <Link to="/timesheet" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Clock size={18} /> Go to Timesheet
                    </Link>
                }
                className="py-20"
            />
        </div>
    );
  }

  const handleExportCSV = () => {
    const headers = ['User', 'Date', 'Start', 'End', 'Category', 'SubCategory', 'Minutes', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...currentLogs.map(log => {
        const cat = categories.find(c => c.id === log.categoryId)?.name || '';
        const subCat = categories.find(c => c.id === log.categoryId)?.subCategories.find(s => s.id === log.subCategoryId)?.name || '';
        return [`"${currentUser.name}"`, log.date, log.startTime, log.endTime, `"${cat}"`, `"${subCat}"`, log.durationMinutes, `"${log.notes.replace(/"/g, '""')}"`].join(',');
      })
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timesync_export_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Export downloaded", "success");
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="space-y-10 animate-fade-in pb-20 font-sans">
      {/* Hero Section - Editorial Style */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 dark:bg-indigo-950 p-8 md:p-12 text-white shadow-2xl shadow-slate-200 dark:shadow-none">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <Activity size={400} className="absolute -top-20 -right-20 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
              <Sparkles size={12} className="text-indigo-300" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              Your <span className="text-indigo-400">Flow</span><br />
              Analytics
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-md">
              Visualizing your productivity patterns and time distribution across all projects.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex gap-3">
              <Link to="/timesheet" className="flex-1 md:flex-none px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all hover:-translate-y-1 shadow-lg">
                <Clock size={20} />
                <span>Log Time</span>
              </Link>
              <button onClick={handleExportCSV} className="p-4 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center" title="Export CSV">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - Minimal Utility */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1), icon: Clock, color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Daily Avg', value: stats.avgHoursPerDay.toFixed(1) + 'h', icon: Activity, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Top Focus', value: stats.topCat.name, icon: Target, color: 'orange', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
          { label: 'Active Days', value: stats.activeDays, icon: Calendar, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar - Consolidated Filters & Actions */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl sticky top-4 z-40 transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar lg:w-1/4">
              {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as TimeRange[]).map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${timeRange === r ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  {r}
                </button>
              ))}
            </div>

            {/* Category Selector */}
            <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
              <button
                onClick={() => { setSelectedCategoryId('ALL'); setSelectedSubCategoryId('ALL'); }}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategoryId === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                All Categories
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategoryId(c.id); setSelectedSubCategoryId('ALL'); }}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${selectedCategoryId === c.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 lg:w-auto">
              <button onClick={handleExportCSV} className="flex-1 lg:flex-none p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700" title="Export CSV">
                <Download size={18} />
              </button>
              <Link to="/timesheet" className="flex-[2] lg:flex-none px-6 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg">
                <Clock size={16} /> Log Time
              </Link>
            </div>
          </div>
          
          {selectedCategoryId !== 'ALL' && selectedCategoryObj && selectedCategoryObj.subCategories.length > 0 && (
            <div className="mt-2 p-1.5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl flex items-center gap-2 overflow-x-auto no-scrollbar animate-fade-in">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-3">Sub-Categories:</span>
              <button
                onClick={() => setSelectedSubCategoryId('ALL')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSubCategoryId === 'ALL' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-indigo-400/60 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
              >
                All
              </button>
              {selectedCategoryObj.subCategories.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubCategoryId(s.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSubCategoryId === s.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-indigo-400/60 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
      </div>

      <DashboardGrid 
        widgets={dashboardWidgets} 
        stats={stats} 
        categories={categories}
        chartsReady={chartsReady} 
        onLayoutChange={updateDashboardWidgets}
        onReset={() => updateDashboardWidgets(DEFAULT_WIDGETS)}
      />
    </div>
  );
};

export default Dashboard;
