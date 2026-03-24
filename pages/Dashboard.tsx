import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Filter, Layers, Loader2, Activity, Clock, Download, Target, Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';
import { useDashboardStats, TimeRange } from '../hooks/useDashboardStats';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { DEFAULT_WIDGETS } from '../constants';

const Dashboard: React.FC = () => {
  const { logs, categories, currentUser, dayConfigs } = useApp();
  const { showToast } = useToast();
  const [chartsReady, setChartsReady] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('MONTH');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('ALL');

  // Smooth loading transition for charts
  useEffect(() => {
    const timer = setTimeout(() => setChartsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const stats = useDashboardStats(
    logs, categories, currentUser, dayConfigs, timeRange, selectedCategoryId, selectedSubCategoryId, chartsReady
  );

  const { currentLogs } = stats;

  if (!currentUser) return null;

  // Early return for Empty State
  if (logs.length === 0) {
    return (
        <div className="animate-fade-in space-y-8 max-w-5xl mx-auto px-4 md:px-8 pt-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Welcome back, {currentUser.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                    Your personal productivity dashboard is ready.
                </p>
            </div>

            <EmptyState 
                icon={Activity}
                title="No Activity Logged Yet"
                description="Start tracking your time to see powerful insights about your productivity patterns here."
                action={
                    <Link to="/timesheet" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all hover:-translate-y-1 shadow-xl shadow-indigo-500/20 dark:shadow-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 outline-none">
                        <Clock size={20} /> Go to Timesheet
                    </Link>
                }
                className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-[2.5rem]"
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
      
      {/* =========================================
          Header Section
          ========================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-4 md:pt-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <Link 
            to="/timesheet" 
            className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-500/20 dark:shadow-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 outline-none"
          >
            <Clock size={18} />
            <span>Log Time</span>
          </Link>
        </div>
      </div>

      {/* =========================================
          Control Bar (Sticky)
          ========================================= */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm sticky top-4 z-40 transition-all duration-300">
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto overflow-hidden">
            
            {/* Time Range Selector Pill */}
            <div className="flex items-center bg-[#f8f9fa] dark:bg-slate-800/80 p-1.5 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200/50 dark:border-slate-700/50">
              {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as TimeRange[]).map(r => (
                <button 
                  key={r} 
                  onClick={() => setTimeRange(r)} 
                  aria-pressed={timeRange === r}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${timeRange === r ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border border-transparent'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Filters Group */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              
              {/* Category Dropdown */}
              <div className="relative group w-full sm:w-auto">
                <div className="flex items-center bg-[#f8f9fa] dark:bg-slate-800/80 p-1.5 rounded-2xl w-full sm:w-auto border border-slate-200/50 dark:border-slate-700/50 transition-colors focus-within:border-indigo-300 dark:focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <div className="relative w-full sm:w-auto flex items-center">
                    <div className="pl-3 text-slate-400 pointer-events-none">
                      <Filter size={16} />
                    </div>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedSubCategoryId('ALL'); }}
                      aria-label="Filter by Category"
                      className="appearance-none w-full sm:w-48 px-3 py-2 pr-10 rounded-xl text-sm font-bold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Category Dropdown (Conditionally Rendered) */}
              {selectedCategoryId !== 'ALL' && selectedCategoryObj && selectedCategoryObj.subCategories.length > 0 && (
                <div className="relative group w-full sm:w-auto animate-fade-in">
                  <div className="flex items-center bg-indigo-50/50 dark:bg-indigo-500/10 p-1.5 rounded-2xl w-full sm:w-auto border border-indigo-100 dark:border-indigo-500/20 transition-colors focus-within:border-indigo-300 dark:focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <div className="relative w-full sm:w-auto flex items-center">
                      <div className="pl-3 text-indigo-400 pointer-events-none">
                        <Layers size={16} />
                      </div>
                      <select
                        value={selectedSubCategoryId}
                        onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                        aria-label="Filter by Sub-Category"
                        className="appearance-none w-full sm:w-48 px-3 py-2 pr-10 rounded-xl text-sm font-bold bg-transparent text-indigo-700 dark:text-indigo-300 border-none outline-none cursor-pointer"
                      >
                        <option value="ALL">All Sub-Categories</option>
                        {selectedCategoryObj.subCategories.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 pointer-events-none text-indigo-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Action */}
          <div className="flex w-full lg:w-auto justify-end shrink-0 border-t border-slate-100 dark:border-slate-800 pt-3 lg:pt-0 lg:border-none mt-1 lg:mt-0">
            <button 
                onClick={handleExportCSV} 
                aria-label="Export to CSV"
                className="w-full lg:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-[#f8f9fa] dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow outline-none focus-visible:ring-4 focus-visible:ring-slate-500/20" 
            >
              <Download size={18} className="text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
      </div>
      
      {/* =========================================
          Dashboard Grid Content
          ========================================= */}
      {!chartsReady ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[2rem] col-span-full xl:col-span-1"></div>
              <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[2rem] col-span-1 xl:col-span-2"></div>
              <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[2rem] col-span-1 xl:col-span-2"></div>
              <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[2rem] col-span-1"></div>
          </div>
      ) : (
          <DashboardGrid 
            widgets={DEFAULT_WIDGETS} 
            stats={stats} 
            categories={categories}
            chartsReady={chartsReady} 
          />
      )}
    </div>
  );
};

export default Dashboard;