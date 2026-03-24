
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
  const { logs, categories, currentUser, dayConfigs } = useApp();
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
    currentLogs
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
    <div className="space-y-6 animate-fade-in pb-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/timesheet" className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
            <Clock size={18} />
            <span>Log Time</span>
          </Link>
        </div>
      </div>

      {/* Control Bar - Consolidated Filters & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm sticky top-4 z-40 transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto overflow-hidden">
            {/* Time Range Selector */}
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl w-full sm:w-auto shrink-0">
              {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as TimeRange[]).map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === r ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>
                  {r}
                </button>
              ))}
            </div>

            {/* Category Selector - Dropdown for many categories */}
            <div className="relative group w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedSubCategoryId('ALL'); }}
                    className="appearance-none w-full sm:w-48 px-4 py-2 pr-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Filter size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Category Selector - Moved into control bar */}
            {selectedCategoryId !== 'ALL' && selectedCategoryObj && selectedCategoryObj.subCategories.length > 0 && (
              <div className="relative group w-full sm:w-auto animate-fade-in">
                <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-500/10 p-1 rounded-2xl w-full sm:w-auto border border-indigo-100/50 dark:border-indigo-500/20">
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={selectedSubCategoryId}
                      onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                      className="appearance-none w-full sm:w-48 px-4 py-2 pr-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm border-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
                    >
                      <option value="ALL">All Sub-Categories</option>
                      {selectedCategoryObj.subCategories.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                      <Layers size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full lg:w-auto justify-end shrink-0">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow" title="Export CSV">
              <Download size={16} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
      </div>
      
      <DashboardGrid 
        widgets={DEFAULT_WIDGETS} 
        stats={stats} 
        categories={categories}
        chartsReady={chartsReady} 
      />
    </div>
  );
};

export default Dashboard;
