
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Filter, Layers, Loader2, Activity, Clock, Download } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4">
        <div className="relative">
           <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
             <Sparkles size={12} className="animate-pulse" />
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Dashboard</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <Link to="/timesheet" className="group relative px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl shadow-xl shadow-slate-200 dark:shadow-indigo-900/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 font-bold flex items-center justify-center gap-3 overflow-hidden w-full md:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Clock size={20} className="group-hover:rotate-12 transition-transform" /> 
                <span>Log Time</span>
             </Link>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 relative lg:sticky lg:top-4 z-20 transition-all duration-300">
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center border-b border-slate-100 dark:border-slate-800 pb-6">
             <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
                <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto shadow-inner no-scrollbar">
                {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as TimeRange[]).map(r => (
                    <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap min-w-[100px] ${timeRange === r ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    {r === 'WEEK' ? 'This Week' : r === 'MONTH' ? 'This Month' : r === 'YEAR' ? 'This Year' : 'All Time'}
                    </button>
                ))}
                </div>
            </div>
            <div className="flex gap-3 w-full xl:w-auto justify-end">
                <button onClick={handleExportCSV} className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-bold text-xs group" title="Export CSV">
                <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Export CSV
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="relative group">
                  <label htmlFor="category-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Category</label>
                  <div className="relative">
                    <select id="category-select" value={selectedCategoryId} onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedSubCategoryId('ALL'); }} className="w-full appearance-none bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 pl-5 pr-12 py-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 outline-none transition-all hover:border-indigo-300 dark:hover:border-slate-600 cursor-pointer">
                        <option value="ALL">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                  </div>
              </div>
               <div className="relative group">
                  <label htmlFor="subcategory-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Sub-Category</label>
                  <div className="relative">
                    <select id="subcategory-select" value={selectedSubCategoryId} onChange={(e) => setSelectedSubCategoryId(e.target.value)} disabled={selectedCategoryId === 'ALL'} className="w-full appearance-none bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 pl-5 pr-12 py-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-indigo-300 dark:hover:border-slate-600 cursor-pointer">
                        <option value="ALL">All Sub-categories</option>
                        {selectedCategoryObj?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                  </div>
              </div>
          </div>
      </div>

      <DashboardGrid 
        widgets={dashboardWidgets} 
        stats={stats} 
        chartsReady={chartsReady} 
        onLayoutChange={updateDashboardWidgets}
        onReset={() => updateDashboardWidgets(DEFAULT_WIDGETS)}
      />
    </div>
  );
};

export default Dashboard;
