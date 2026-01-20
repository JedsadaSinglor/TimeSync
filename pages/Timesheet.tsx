
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { DayConfig } from '../types';
import { ChevronLeft, ChevronRight, Calendar, List, Grid3X3, Download, Upload, LayoutGrid, CalendarClock, Eraser, AlertTriangle, Filter, CheckSquare, Square, ChevronDown, ChevronRight as ChevronIcon, Settings } from 'lucide-react';
import { getLocalDateStr } from '../utils/storage';
import { getStartOfWeek, exportTimesheetToExcel, parseTimesheetImport } from '../utils/timesheetHelpers';
import { DaySettingsModal } from '../components/timesheet/DaySettingsModal';
import { RecurringTasksModal } from '../components/timesheet/RecurringTasksModal';
import { TimesheetTable } from '../components/timesheet/TimesheetTable';

type ViewMode = 'DAILY' | 'WEEK' | 'MONTH';

const TimesheetPage: React.FC = () => {
    const { logs, categories, addLog, updateLog, deleteLog, currentUser, applyRecurringTasks, resetTimesheet, dayConfigs, updateDayConfig } = useApp();
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('WEEK');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
    const [daySettingsModal, setDaySettingsModal] = useState<{ isOpen: boolean; dateObj: Date; config?: DayConfig }>({ isOpen: false, dateObj: new Date() });
    
    // Filter States
    const [hiddenCategoryIds, setHiddenCategoryIds] = useState<Set<string>>(new Set());
    const [hiddenSubCategoryIds, setHiddenSubCategoryIds] = useState<Set<string>>(new Set());
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // --- Filter Logic ---
    const toggleCategoryExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleCategoryVisibility = (id: string) => {
        setHiddenCategoryIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSubCategoryVisibility = (catId: string, subId: string) => {
        const key = `${catId}-${subId}`;
        setHiddenSubCategoryIds(prev => {
             const next = new Set(prev);
             if (next.has(key)) next.delete(key); else next.add(key);
             return next;
        });
    };

    const toggleAllCategories = () => {
        if (hiddenCategoryIds.size > 0) setHiddenCategoryIds(new Set());
        else setHiddenCategoryIds(new Set(categories.map(c => c.id)));
    };
  
    // --- Data Preparation ---
    const dayConfigMap = useMemo(() => {
        const map = new Map<string, DayConfig>();
        dayConfigs.forEach(c => {
            if (c.userId === currentUser.id) map.set(c.date, c);
        });
        return map;
    }, [dayConfigs, currentUser.id]);

    const days = useMemo(() => {
      const todayStr = getLocalDateStr(new Date());
      let dList: { dateObj: Date; dateStr: string; dayName: string; shortDate: string; isToday: boolean; config?: DayConfig }[] = [];

      if (viewMode === 'MONTH') {
         const year = anchorDate.getFullYear();
         const month = anchorDate.getMonth();
         const daysInMonth = new Date(year, month + 1, 0).getDate();
         dList = Array.from({ length: daysInMonth }).map((_, i) => {
             const d = new Date(year, month, i + 1);
             const dateStr = getLocalDateStr(d);
             return { dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { day: 'numeric' }), isToday: dateStr === todayStr };
         });
      } else if (viewMode === 'DAILY') {
          const d = new Date(anchorDate);
          const dateStr = getLocalDateStr(d);
          dList = [{ dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'long' }), shortDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), isToday: dateStr === todayStr }];
      } else {
          const start = getStartOfWeek(anchorDate);
          dList = Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(start); d.setDate(d.getDate() + i);
              const dateStr = getLocalDateStr(d);
              return { dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isToday: dateStr === todayStr };
          });
      }

      return dList.map(d => ({ ...d, config: dayConfigMap.get(d.dateStr) }));
    }, [viewMode, anchorDate, dayConfigMap]);

    // Apply recurring tasks when view changes (using useMemo as a reactive effect without DOM side effects)
    useMemo(() => {
        if (days.length > 0) applyRecurringTasks(days[0].dateObj, days[days.length - 1].dateObj);
    }, [days, applyRecurringTasks]);
  
    const label = useMemo(() => {
        if (viewMode === 'MONTH') return anchorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (viewMode === 'DAILY') return anchorDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const s = days[0].dateObj; const e = days[days.length - 1].dateObj;
        return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }, [viewMode, anchorDate, days]);
  
    const navigate = (dir: -1 | 1) => {
      const newDate = new Date(anchorDate);
      if (viewMode === 'DAILY') newDate.setDate(newDate.getDate() + dir);
      else if (viewMode === 'MONTH') newDate.setMonth(newDate.getMonth() + dir);
      else newDate.setDate(newDate.getDate() + (dir * 7));
      setAnchorDate(newDate);
    };
  
    const openTodaySettings = () => {
        const today = new Date();
        const dateStr = getLocalDateStr(today);
        setDaySettingsModal({ isOpen: true, dateObj: today, config: dayConfigMap.get(dateStr) });
    };
  
    const handleExport = () => {
        exportTimesheetToExcel(days, categories, logs, currentUser);
        showToast(`Exported successfully`, 'success');
    };
  
    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const { newLogs, count } = await parseTimesheetImport(file, categories, logs, currentUser);
            newLogs.forEach(log => addLog(log)); // Batch adding might be better but AppContext handles state
            if (count > 0) showToast(`Successfully imported ${count} entries`, 'success');
            else showToast('No new entries found.', 'info');
        } catch (e) {
            console.error(e);
            showToast("Error processing file", "error");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
  
    const confirmClear = () => {
        resetTimesheet();
        setIsResetConfirmationOpen(false);
        showToast('Timesheet cleared successfully', 'success');
    };
  
    return (
      <div className="flex flex-col gap-6 animate-fade-in font-sans pb-20">
        <DaySettingsModal 
            isOpen={daySettingsModal.isOpen} 
            onClose={() => setDaySettingsModal(prev => ({ ...prev, isOpen: false }))} 
            dateObj={daySettingsModal.dateObj} 
            config={daySettingsModal.config} 
            onSave={updateDayConfig} 
        />
        <RecurringTasksModal 
            isOpen={isRecurringModalOpen} 
            onClose={() => setIsRecurringModalOpen(false)} 
            categories={categories} 
        />
        
        {/* Controls Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6 sticky top-2 z-10">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto shadow-inner">
                  <button onClick={() => setViewMode('DAILY')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'DAILY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><List size={16} /> Daily</button>
                  <button onClick={() => setViewMode('WEEK')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'WEEK' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><Grid3X3 size={16} /> Weekly</button>
                  <button onClick={() => setViewMode('MONTH')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'MONTH' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><LayoutGrid size={16} /> Monthly</button>
               </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                  <div className="flex w-full md:w-auto gap-2 items-center">
                       {/* Category Filter Dropdown */}
                       <div className="relative z-50">
                          <button 
                             onClick={() => setIsFilterOpen(!isFilterOpen)} 
                             className={`p-3 rounded-2xl border transition-colors shadow-sm ${isFilterOpen || hiddenCategoryIds.size > 0 ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                             title="Filter Categories"
                          >
                              <Filter size={20} />
                          </button>
                          
                          {isFilterOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-50 animate-scale-up">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visible Rows</span>
                                        <button onClick={toggleAllCategories} className="text-xs font-bold text-indigo-500 hover:text-indigo-600">
                                            {hiddenCategoryIds.size > 0 ? 'Show All' : 'Hide All'}
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                        {categories.map(cat => {
                                            const isCatHidden = hiddenCategoryIds.has(cat.id);
                                            const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                                            const isExpanded = expandedCategories.has(cat.id);

                                            return (
                                                <div key={cat.id} className="select-none">
                                                    <div 
                                                        className={`flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group ${isCatHidden ? 'opacity-70' : ''}`}
                                                        onClick={() => toggleCategoryVisibility(cat.id)}
                                                    >
                                                        <div className={`transition-colors ${isCatHidden ? 'text-slate-300 dark:text-slate-600' : 'text-indigo-500'}`}>
                                                            {isCatHidden ? <Square size={16} /> : <CheckSquare size={16} />}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: cat.color}}></span>
                                                            <span className={`text-sm font-bold truncate ${isCatHidden ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{cat.name}</span>
                                                        </div>
                                                        {hasSubs && (
                                                            <div 
                                                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                                                                onClick={(e) => toggleCategoryExpand(cat.id, e)}
                                                            >
                                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronIcon size={14} />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {hasSubs && isExpanded && !isCatHidden && (
                                                        <div className="pl-8 space-y-1 mt-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4 mb-2">
                                                            {cat.subCategories.map(sub => {
                                                                const isSubHidden = hiddenSubCategoryIds.has(`${cat.id}-${sub.id}`);
                                                                return (
                                                                    <div 
                                                                        key={sub.id}
                                                                        onClick={() => toggleSubCategoryVisibility(cat.id, sub.id)}
                                                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                                    >
                                                                         <div className={`transition-colors ${isSubHidden ? 'text-slate-300 dark:text-slate-600' : 'text-indigo-400'}`}>
                                                                            {isSubHidden ? <Square size={14} /> : <CheckSquare size={14} />}
                                                                        </div>
                                                                        <span className={`text-xs font-medium truncate ${isSubHidden ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{sub.name}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {categories.length === 0 && <div className="text-center text-xs text-slate-400 py-4">No categories found</div>}
                                    </div>
                                </div>
                              </>
                          )}
                       </div>

                       <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1 h-8"></div>

                       <button onClick={() => setIsRecurringModalOpen(true)} className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm" title="Recurring Tasks Manager"><CalendarClock size={20} /></button>
                       <button onClick={openTodaySettings} className="flex-1 md:flex-none px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 whitespace-nowrap"><Settings size={16} /> Day Settings</button>
                      <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                      <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".xlsx, .xls" className="hidden" />
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all" title="Import"><Upload size={18} /></button>
                          <button onClick={handleExport} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all" title="Export"><Download size={18} /></button>
                          <button onClick={() => setIsResetConfirmationOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all" title="Clear Timesheet"><Eraser size={18} /></button>
                      </div>
                  </div>
              <div className="flex w-full md:w-auto items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800 px-2 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-95"><ChevronLeft size={20}/></button>
                  <div className="flex items-center gap-2 min-w-[140px] justify-center text-center">
                      <Calendar size={18} className="text-indigo-500 dark:text-indigo-400 hidden sm:block" />
                      <span className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">{label}</span>
                  </div>
                  <button onClick={() => navigate(1)} className="p-2.5 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-95"><ChevronRight size={20}/></button>
              </div>
              <button onClick={() => setAnchorDate(new Date())} className="w-full md:w-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-3 md:py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/20 md:border-none text-center">Today</button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 animate-fade-in-up">
          <TimesheetTable 
             categories={categories}
             logs={logs}
             days={days}
             targetUserId={currentUser.id}
             readOnly={false}
             hiddenCategoryIds={hiddenCategoryIds}
             hiddenSubCategoryIds={hiddenSubCategoryIds}
             onUpdateLog={updateLog}
             onAddLog={addLog}
             onDeleteLog={deleteLog}
             showToast={(msg) => showToast(msg, 'success')}
             onDaySettingsClick={(d) => setDaySettingsModal({ isOpen: true, dateObj: d.dateObj, config: d.config })}
           />
        </div>

        {/* Reset Confirmation Modal */}
        {isResetConfirmationOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-scale-up">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 text-red-500 mx-auto md:mx-0">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center md:text-left">Clear Timesheet?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center md:text-left leading-relaxed">
                        Are you sure you want to delete <strong>all time entries</strong>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsResetConfirmationOpen(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                        <button onClick={confirmClear} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all hover:-translate-y-0.5">Yes, Clear All</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
}

export default TimesheetPage;
