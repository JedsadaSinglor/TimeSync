
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Download, Sparkles, Clock, Calendar, TrendingUp, Activity, Filter, Zap, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, Layers, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

type TimeRange = 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const TrendIndicator = ({ current, previous, inverse = false }: { current: number, previous: number, inverse?: boolean }) => {
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-100 dark:border-slate-700 p-4 rounded-xl shadow-xl animate-fade-in z-50 ring-1 ring-black/5">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
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

const ChartSkeleton = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800">
    <Loader2 className="animate-spin text-slate-300 dark:text-slate-600 mb-2" size={24} />
    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Loading Data...</span>
  </div>
);

const Dashboard: React.FC = () => {
  const { logs, categories, currentUser } = useApp();
  const { showToast } = useToast();
  const [chartsReady, setChartsReady] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('MONTH');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setChartsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!currentUser) return null;

  const getDateRange = (range: TimeRange, offset: number = 0) => {
    const now = new Date();
    if (offset > 0) {
        if (range === 'WEEK') now.setDate(now.getDate() - (7 * offset));
        if (range === 'MONTH') now.setMonth(now.getMonth() - offset);
        if (range === 'YEAR') now.setFullYear(now.getFullYear() - offset);
    }
    const start = new Date(now);
    const end = new Date(now);
    if (range === 'WEEK') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff); end.setDate(start.getDate() + 6); 
    } else if (range === 'MONTH') {
      start.setDate(1); end.setMonth(start.getMonth() + 1); end.setDate(0); 
    } else if (range === 'YEAR') {
      start.setMonth(0, 1); end.setMonth(11, 31); 
    } else {
        start.setFullYear(2020, 0, 1); end.setFullYear(2030, 11, 31);
    }
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    return { start, end };
  };

  const getFilteredLogs = (startDate: Date, endDate: Date) => {
      const startStr = toLocalISOString(startDate);
      const endStr = toLocalISOString(endDate);
      let filtered = logs.filter(l => l.date >= startStr && l.date <= endStr);
      
      // Personal mode: always current user
      filtered = filtered.filter(l => l.userId === currentUser.id);

      if (selectedCategoryId !== 'ALL') {
          filtered = filtered.filter(l => l.categoryId === selectedCategoryId);
      }
      if (selectedSubCategoryId !== 'ALL') {
          filtered = filtered.filter(l => l.subCategoryId === selectedSubCategoryId);
      }
      return filtered;
  };

  const { start: currStart, end: currEnd } = useMemo(() => getDateRange(timeRange, 0), [timeRange]);
  const currentLogs = useMemo(() => getFilteredLogs(currStart, currEnd), [logs, selectedCategoryId, selectedSubCategoryId, currStart, currEnd, currentUser]);

  const { start: prevStart, end: prevEnd } = useMemo(() => getDateRange(timeRange, 1), [timeRange]);
  const previousLogs = useMemo(() => getFilteredLogs(prevStart, prevEnd), [logs, selectedCategoryId, selectedSubCategoryId, prevStart, prevEnd, currentUser]);

  const totalMinutes = currentLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const prevTotalMinutes = previousLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHours = (totalMinutes / 60);
  const prevTotalHours = (prevTotalMinutes / 60);

  const activeDays = new Set(currentLogs.map(l => l.date)).size || 1;
  const prevActiveDays = new Set(previousLogs.map(l => l.date)).size || 1;
  const avgHoursPerDay = (totalHours / activeDays);
  const prevAvgHoursPerDay = (prevTotalHours / prevActiveDays);

  const getTopCategory = (logData: typeof logs) => {
      const map: Record<string, number> = {};
      logData.forEach(l => {
          const key = selectedCategoryId === 'ALL' ? l.categoryId : (l.subCategoryId || 'general');
          map[key] = (map[key] || 0) + l.durationMinutes;
      });
      const sorted = Object.entries(map).sort((a,b) => b[1] - a[1]);
      if (sorted.length === 0) return { name: 'N/A', minutes: 0 };
      const id = sorted[0][0];
      let name = 'Unknown';
      if (selectedCategoryId === 'ALL') {
          name = categories.find(c => c.id === id)?.name || 'Unknown';
      } else {
          const cat = categories.find(c => c.id === selectedCategoryId);
          const sub = cat?.subCategories.find(s => s.id === id);
          name = sub?.name || (id === 'general' ? 'General' : 'Unknown');
      }
      return { name, minutes: sorted[0][1] };
  };

  const topCat = getTopCategory(currentLogs);
  const prevMinutesForTopCat = previousLogs
    .filter(l => (selectedCategoryId === 'ALL' ? l.categoryId : l.subCategoryId) === (selectedCategoryId === 'ALL' ? categories.find(c => c.name === topCat.name)?.id : categories.find(c => c.id === selectedCategoryId)?.subCategories.find(s => s.name === topCat.name)?.id))
    .reduce((acc, l) => acc + l.durationMinutes, 0);

  const breakdownData = useMemo(() => {
    if (!chartsReady) return [];
    const dataMap: Record<string, any> = {};
    const granularity = (timeRange === 'YEAR' || timeRange === 'ALL') ? 'MONTH' : 'DAY';
    const loopStart = new Date(currStart);
    const loopEnd = timeRange === 'ALL' ? new Date() : new Date(currEnd);
    if(timeRange === 'ALL') loopStart.setDate(loopStart.getDate() - 365); 

    let current = new Date(loopStart);
    while (current <= loopEnd) {
        let key = '';
        let label = '';
        if (granularity === 'MONTH') {
            key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            label = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            dataMap[key] = { dateStr: key, label };
            current.setMonth(current.getMonth() + 1);
        } else {
            key = toLocalISOString(current);
            label = timeRange === 'WEEK' ? current.toLocaleDateString('en-US', { weekday: 'short' }) : current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dataMap[key] = { dateStr: key, label };
            current.setDate(current.getDate() + 1);
        }
    }
    currentLogs.forEach(log => {
        let key = granularity === 'MONTH' ? log.date.substring(0, 7) : log.date;
        if (dataMap[key]) {
            let keyName = 'Unknown';
            if (selectedCategoryId === 'ALL') {
                keyName = categories.find(c => c.id === log.categoryId)?.name || 'Unknown';
            } else {
                const cat = categories.find(c => c.id === selectedCategoryId);
                const sub = cat?.subCategories.find(s => s.id === log.subCategoryId);
                keyName = sub ? sub.name : 'General';
            }
            if (dataMap[key][keyName] === undefined) dataMap[key][keyName] = 0;
            dataMap[key][keyName] += (log.durationMinutes / 60);
        }
    });
    return Object.values(dataMap).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [chartsReady, currentLogs, currStart, currEnd, timeRange, categories, selectedCategoryId]);

  const distributionData = useMemo(() => {
      if (!chartsReady) return [];
      const map: Record<string, number> = {};
      currentLogs.forEach(l => {
          let name = 'Unknown';
          if (selectedCategoryId === 'ALL') {
             name = categories.find(c => c.id === l.categoryId)?.name || 'Unknown';
          } else {
             const cat = categories.find(c => c.id === selectedCategoryId);
             const sub = cat?.subCategories.find(s => s.id === l.subCategoryId);
             name = sub?.name || 'General';
          }
          map[name] = (map[name] || 0) + l.durationMinutes;
      });
      return Object.keys(map).map((name, index) => ({
          name, value: map[name], color: selectedCategoryId === 'ALL' ? categories.find(c => c.name === name)?.color || COLORS[index % COLORS.length] : COLORS[index % COLORS.length]
      })).filter(d => d.value > 0).sort((a,b) => b.value - a.value);
  }, [chartsReady, currentLogs, categories, selectedCategoryId]);

  const trendData = useMemo(() => {
      if (!chartsReady) return [];
      const map: Record<string, number> = {};
      const granularity = (timeRange === 'YEAR' || timeRange === 'ALL') ? 'MONTH' : 'DAY';
      currentLogs.forEach(l => {
          const key = granularity === 'MONTH' ? l.date.substring(0, 7) : l.date;
          map[key] = (map[key] || 0) + l.durationMinutes;
      });
      return Object.keys(map).sort().map(date => ({ date, minutes: map[date] }));
  }, [chartsReady, currentLogs, timeRange]);

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
  const stacks = useMemo(() => {
      if (selectedCategoryId === 'ALL') return categories.map(c => c.name);
      if (!selectedCategoryObj) return [];
      return ['General', ...selectedCategoryObj.subCategories.map(s => s.name)];
  }, [categories, selectedCategoryId, selectedCategoryObj]);

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div className="relative">
           <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
             <Sparkles size={14} />
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">Dashboard</h1>
        </div>
        <div className="flex gap-3">
             <Link to="/timesheet" className="group relative px-6 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl shadow-xl shadow-slate-200 dark:shadow-indigo-900/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 font-bold flex items-center gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Clock size={20} className="group-hover:rotate-12 transition-transform" /> 
                <span>Log Time</span>
             </Link>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 sticky top-2 z-20">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center border-b border-slate-100 dark:border-slate-800 pb-5">
             <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto shadow-inner">
                {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as TimeRange[]).map(r => (
                    <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${timeRange === r ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    {r === 'WEEK' ? 'This Week' : r === 'MONTH' ? 'This Month' : r === 'YEAR' ? 'This Year' : 'All Time'}
                    </button>
                ))}
                </div>
            </div>
            <div className="flex gap-3 w-full xl:w-auto justify-end">
                <button onClick={handleExportCSV} className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm hover:shadow-md flex items-center gap-2 font-bold text-xs" title="Export CSV">
                <Download size={16} /> Export CSV
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Category</label>
                  <div className="relative">
                    <select value={selectedCategoryId} onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedSubCategoryId('ALL'); }} className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 pl-4 pr-10 py-3 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 outline-none transition-all hover:border-indigo-300 dark:hover:border-slate-600">
                        <option value="ALL">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Layers className="absolute right-3 top-3 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={14} />
                  </div>
              </div>
               <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Sub-Category</label>
                  <div className="relative">
                    <select value={selectedSubCategoryId} onChange={(e) => setSelectedSubCategoryId(e.target.value)} disabled={selectedCategoryId === 'ALL'} className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 pl-4 pr-10 py-3 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-indigo-300 dark:hover:border-slate-600">
                        <option value="ALL">All Sub-categories</option>
                        {selectedCategoryObj?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={14} />
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-5 dark:group-hover:opacity-10 pointer-events-none"><Clock size={120} /></div>
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm"><Clock size={24} /></div>
            <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">vs Previous</span>
                <TrendIndicator current={totalHours} previous={prevTotalHours} />
            </div>
          </div>
          <div className="z-10 relative">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Hours</h3>
            <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{totalHours.toFixed(1)}</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-24 opacity-20 dark:opacity-30 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500">
             {chartsReady && (<ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><Area type="monotone" dataKey="minutes" stroke="#3b82f6" fill="#3b82f6" strokeWidth={3} isAnimationActive={false} /></AreaChart></ResponsiveContainer>)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-5 dark:group-hover:opacity-10 pointer-events-none"><Activity size={120} /></div>
          <div className="flex justify-between items-start mb-6 z-10 relative">
             <div className="p-3.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm"><Activity size={24} /></div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">vs Previous</span>
                <TrendIndicator current={avgHoursPerDay} previous={prevAvgHoursPerDay} />
            </div>
          </div>
          <div className="z-10 relative">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Daily Average</h3>
            <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{avgHoursPerDay.toFixed(1)}<span className="text-xl text-slate-400 dark:text-slate-500 font-medium ml-2">hrs</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-5 dark:group-hover:opacity-10 pointer-events-none"><TrendingUp size={120} /></div>
          <div className="flex justify-between items-start mb-6 z-10 relative">
             <div className="p-3.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm"><TrendingUp size={24} /></div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">vs Previous</span>
                <TrendIndicator current={topCat.minutes} previous={prevMinutesForTopCat} />
            </div>
          </div>
          <div className="z-10 relative">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{selectedCategoryId === 'ALL' ? 'Top Category' : 'Top Sub-Category'}</h3>
            <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate leading-tight mt-2" title={topCat.name}>{topCat.name}</p>
          </div>
           {totalMinutes > 0 && (
             <div className="mt-5 w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative z-10">
               <div className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${(topCat.minutes / totalMinutes) * 100}%`}}></div>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-xl flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Calendar size={20} /></div>
                {selectedCategoryId === 'ALL' ? 'Activity Breakdown' : `${selectedCategoryObj?.name} Breakdown`}
                </h3>
            </div>
          </div>
          <div className="h-96 w-full">
            {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: 600, fontSize: '12px', color: '#64748b' }} />
                    {stacks.map((stackName, index) => {
                        let color = COLORS[index % COLORS.length];
                        if(selectedCategoryId === 'ALL') { color = categories.find(c => c.name === stackName)?.color || color; }
                        return (<Bar key={stackName} dataKey={stackName} stackId="a" fill={color} radius={[4, 4, 0, 0]} barSize={32} animationDuration={1000} animationEasing="ease-out" />);
                    })}
                </BarChart>
                </ResponsiveContainer>
            ) : <ChartSkeleton />}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 dark:text-white text-xl flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><PieChartIcon size={20}/></div>
              Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-[320px] relative flex items-center justify-center">
            {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={distributionData} innerRadius={70} outerRadius={100} paddingAngle={4} cornerRadius={6} dataKey="value" animationDuration={1000} animationEasing="ease-out">
                            {distributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} className="hover:opacity-80 transition-opacity cursor-pointer" />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            ) : <ChartSkeleton />}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{totalHours.toFixed(0)}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hours</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-4 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100 dark:scrollbar-thumb-slate-800 pr-2">
              {distributionData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm group cursor-default">
                      <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900" style={{backgroundColor: d.color}}></span>
                          <span className="text-slate-600 dark:text-slate-300 font-bold truncate max-w-[140px]" title={d.name}>{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-slate-800 dark:text-white font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs">{(d.value/60).toFixed(1)}h</span>
                         <span className="text-xs font-bold text-slate-400 w-8 text-right">{((d.value/totalMinutes)*100).toFixed(0)}%</span>
                      </div>
                  </div>
              ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 dark:text-white text-xl flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Zap size={20} /></div>
                Recent Logs
                </h3>
                <Link to="/timesheet" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group">
                    View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {currentLogs.sort((a,b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime()).slice(0, 6).map(log => {
                     const cat = categories.find(c => c.id === log.categoryId);
                     const sub = cat?.subCategories.find(s => s.id === log.subCategoryId)?.name;
                     return (
                         <div key={log.id} className="flex gap-4 items-start p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 group cursor-default">
                             <div className="min-w-0 flex-1">
                                 <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{currentUser.name}</p>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">{log.date.substring(5)}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                     <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: cat?.color || '#cbd5e1'}}></span>
                                     <span className="truncate font-semibold">{cat?.name}</span>
                                     {sub && <span className="opacity-60 font-medium border-l border-slate-300 dark:border-slate-600 pl-2">{sub}</span>}
                                 </div>
                                 <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                     <span className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate max-w-[140px] italic">{log.notes || "No notes provided"}</span>
                                     <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">{(log.durationMinutes/60).toFixed(1)}h</span>
                                 </div>
                             </div>
                         </div>
                     )
                 })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
