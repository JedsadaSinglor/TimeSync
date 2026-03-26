import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Filter, Layers, Loader2, Activity, Clock, Download, Target, Calendar, ChevronDown, Settings2, Check, TrendingUp } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';
import { useDashboardStats, TimeRange } from '../hooks/useDashboardStats';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { DEFAULT_WIDGETS } from '../constants';

import { motion } from 'motion/react';
import { TrendIndicator } from '../components/dashboard/DashboardShared';

const Dashboard: React.FC = () => {
  const { logs, categories, currentUser, dayConfigs, dashboardWidgets, updateDashboardWidgets } = useApp();
  const { showToast } = useToast();
  const [chartsReady, setChartsReady] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('MONTH');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date, end: Date }>({ start: new Date(), end: new Date() });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);

  // Smooth loading transition for charts
  useEffect(() => {
    const timer = setTimeout(() => setChartsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const stats = useDashboardStats(
    logs, categories, currentUser, dayConfigs, timeRange, selectedCategoryId, selectedSubCategoryId, chartsReady, customDateRange
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

  const handleCategoryClick = (name: string) => {
    if (selectedCategoryId === 'ALL') {
      const cat = categories.find(c => c.name === name);
      if (cat) {
        setSelectedCategoryId(cat.id);
        setSelectedSubCategoryId('ALL');
      }
    } else {
      const subCat = selectedCategoryObj?.subCategories.find(s => s.name === name);
      if (subCat) {
        if (selectedSubCategoryId === subCat.id) {
          setSelectedSubCategoryId('ALL');
        } else {
          setSelectedSubCategoryId(subCat.id);
        }
      } else if (name === 'General') {
        if (selectedSubCategoryId === 'general') {
          setSelectedSubCategoryId('ALL');
        } else {
          setSelectedSubCategoryId('general');
        }
      } else {
        // If clicking on a category
        const cat = categories.find(c => c.name === name);
        if (cat) {
          if (selectedCategoryId === cat.id) {
            setSelectedCategoryId('ALL');
            setSelectedSubCategoryId('ALL');
          } else {
            setSelectedCategoryId(cat.id);
            setSelectedSubCategoryId('ALL');
          }
        }
      }
    }
  };

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
        <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all outline-none ${
              isEditing 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/30 hover:bg-indigo-700' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-[#f8f9fa] dark:hover:bg-slate-700 focus-visible:ring-4 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700'
            }`}
          >
            {isEditing ? (
              <><Check size={18} /> Done Editing</>
            ) : (
              <><Settings2 size={18} /> Customize</>
            )}
          </button>
          
          <button 
              onClick={handleExportCSV} 
              aria-label="Export to CSV"
              className="flex-1 md:flex-none px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-[#f8f9fa] dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow outline-none focus-visible:ring-4 focus-visible:ring-slate-500/20" 
          >
            <Download size={18} className="text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

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
            <div className="flex items-center bg-[#f8f9fa] dark:bg-slate-800/80 p-1.5 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto">
              {(['WEEK', 'MONTH', 'YEAR', 'ALL', 'CUSTOM'] as TimeRange[]).map(r => (
                <button 
                  key={r} 
                  onClick={() => setTimeRange(r)} 
                  aria-pressed={timeRange === r}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 whitespace-nowrap ${timeRange === r ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border border-transparent'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {timeRange === 'CUSTOM' && (
              <div className="flex items-center gap-2 bg-[#f8f9fa] dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <input 
                  type="date" 
                  value={customDateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input 
                  type="date" 
                  value={customDateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                />
              </div>
            )}

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
      </div>

      {/* =========================================
          Summary Section
          ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-indigo-600 dark:bg-indigo-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group border border-indigo-400/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-1000" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-sm"><Clock size={20} /></div>
              <TrendIndicator current={stats.totalHours} previous={stats.prevTotalHours} inverse={false} />
            </div>
            <p className="text-indigo-100/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Hours</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-5xl font-black tracking-tighter">{stats.totalHours.toFixed(1)}</h2>
              <span className="text-xs font-bold text-indigo-200/60">HRS</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm"><Activity size={20} /></div>
            <TrendIndicator current={stats.avgHoursPerDay} previous={stats.prevAvgHoursPerDay} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Daily Average</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.avgHoursPerDay.toFixed(1)}</h2>
            <span className="text-xs font-bold text-slate-400">H/DAY</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl shadow-sm"><TrendingUp size={20} /></div>
            <TrendIndicator current={stats.topCat.minutes} previous={stats.prevMinutesForTopCat} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Top Focus</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate mb-1" title={stats.topCat.name}>{stats.topCat.name}</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(stats.topCat.minutes / 60).toFixed(1)}h logged</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm"><Calendar size={20} /></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Days</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.activeDays}</h2>
            <span className="text-xs font-bold text-slate-400">DAYS</span>
          </div>
        </motion.div>
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
            widgets={dashboardWidgets.filter(w => ['WEEKLY_RHYTHM', 'ACTIVITY_BREAKDOWN', 'DISTRIBUTION', 'LOG_ACTIVITY_FORM', 'RECENT_LOGS'].includes(w.type))} 
            stats={stats} 
            categories={categories}
            chartsReady={chartsReady} 
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onLayoutChange={updateDashboardWidgets}
            onReset={() => updateDashboardWidgets(DEFAULT_WIDGETS)}
            onCategoryClick={handleCategoryClick}
          />
      )}
    </div>
  );
};

export default Dashboard;