
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { DayConfig, TimeLog, CategoryCombo, Category, SubCategory } from '../types';
import { ChevronLeft, ChevronRight, Calendar, List, Grid3X3, Download, Upload, LayoutGrid, CalendarClock, Eraser, AlertTriangle, Filter, CheckSquare, Square, ChevronDown, ChevronRight as ChevronIcon, Settings, Table, AlignJustify } from 'lucide-react';
import { getLocalDateStr } from '../utils/storage';
import { getStartOfWeek, exportTimesheetToExcel, parseTimesheetImport, downloadTemplate } from '../utils/timesheetHelpers';
import { DaySettingsModal } from '../components/timesheet/DaySettingsModal';
import { RecurringTasksModal } from '../components/timesheet/RecurringTasksModal';
import { TimesheetTable } from '../components/timesheet/TimesheetTable';
import { TimesheetList } from '../components/timesheet/TimesheetList';
import { ExportConfirmationModal, ImportConfirmationModal } from '../components/timesheet/ImportExportModals';
import { TimesheetToolbar } from '../components/timesheet/TimesheetToolbar';
import { LogDetailsModal } from '../components/timesheet/LogDetailsModal';

type ViewMode = 'DAILY' | 'WEEK' | 'MONTH';
type LayoutMode = 'TABLE' | 'LIST';

const TimesheetPage: React.FC = () => {
    const { logs, logsByDate, categories, addLog, batchAddLogs, updateLog, deleteLog, currentUser, applyRecurringTasks, resetTimesheet, dayConfigs, updateDayConfig, categoryCombos, addCategory } = useApp();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const viewMode = (searchParams.get('view') as ViewMode) || 'WEEK';
    const layoutMode = (searchParams.get('layout') as LayoutMode) || 'TABLE';
    
    const anchorDate = useMemo(() => {
        const d = searchParams.get('date');
        if (!d) return new Date();
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m - 1, day);
    }, [searchParams]);

    const setViewMode = (mode: ViewMode) => {
        setSearchParams(prev => {
            prev.set('view', mode);
            return prev;
        });
    };

    const setLayoutMode = (mode: LayoutMode) => {
        setSearchParams(prev => {
            prev.set('layout', mode);
            return prev;
        });
    };

    const setAnchorDate = (date: Date) => {
        setSearchParams(prev => {
            prev.set('date', getLocalDateStr(date));
            return prev;
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
    const [daySettingsModal, setDaySettingsModal] = useState<{ isOpen: boolean; dateObj: Date; config?: DayConfig }>({ isOpen: false, dateObj: new Date() });
    const [activeLogDetails, setActiveLogDetails] = useState<{ log: TimeLog | null, dateStr: string, category?: Category, subCategory?: SubCategory } | null>(null);
    
    // Import/Export State
    const [exportSummary, setExportSummary] = useState<{ startDate: string; endDate: string; totalDays: number; totalHours: number; categoryCount: number } | null>(null);
    const [importSummary, setImportSummary] = useState<{ count: number; duplicateCount: number; newCategoryCount: number; startDate: string; endDate: string } | null>(null);
    const [pendingImportLogs, setPendingImportLogs] = useState<{ unique: TimeLog[], duplicates: TimeLog[], newCategories: Category[] }>({ unique: [], duplicates: [], newCategories: [] });

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

    // Apply recurring tasks when view changes
    useEffect(() => {
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
  
    const handleExportClick = () => {
        console.log('handleExportClick called');
        if (days.length === 0) {
            console.log('No days to export');
            showToast('No data to export', 'error');
            return;
        }
        
        const startDate = days[0].dateStr;
        const endDate = days[days.length - 1].dateStr;
        
        // Calculate total hours for visible range
        const totalHours = logs
            .filter(l => l.userId === currentUser.id && days.some(d => d.dateStr === l.date))
            .reduce((acc, l) => acc + (l.durationMinutes || 0), 0) / 60;

        const summary = {
            startDate,
            endDate,
            totalDays: days.length,
            totalHours,
            categoryCount: categories.length
        };
        console.log('Setting export summary:', summary);
        setExportSummary(summary);
    };

    const confirmExport = () => {
        console.log('confirmExport called');
        exportTimesheetToExcel(days, categories, logs, currentUser);
        showToast(`Exported successfully`, 'success');
        setExportSummary(null);
    };

    const handleDownloadTemplate = () => {
        downloadTemplate(categories);
        showToast(`Template downloaded`, 'success');
    };
  
    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleImportFile called');
        const file = event.target.files?.[0];
        if (!file) {
            console.log('No file selected');
            return;
        }
        try {
            const { uniqueLogs, duplicateLogs, newCategories } = await parseTimesheetImport(file, categories, logs, currentUser);
            console.log('Parsed import:', { unique: uniqueLogs.length, duplicates: duplicateLogs.length, newCategories: newCategories.length });
            
            if (uniqueLogs.length === 0 && duplicateLogs.length === 0 && newCategories.length === 0) {
                showToast('No valid entries found.', 'info');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // Calculate summary
            const allLogs = [...uniqueLogs, ...duplicateLogs];
            const dates = allLogs.map(l => l.date).sort();
            const startDate = dates.length > 0 ? dates[0] : '';
            const endDate = dates.length > 0 ? dates[dates.length - 1] : '';

            setPendingImportLogs({ unique: uniqueLogs, duplicates: duplicateLogs, newCategories: newCategories });
            const summary = {
                count: uniqueLogs.length,
                duplicateCount: duplicateLogs.length,
                newCategoryCount: newCategories.length,
                startDate,
                endDate
            };
            console.log('Setting import summary:', summary);
            setImportSummary(summary);

        } catch (e: unknown) {
            console.error('Import error:', e);
            const error = e as Error;
            showToast(error.message || "Error processing file", "error");
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmImport = (skipDuplicates: boolean) => {
        // Add new categories
        pendingImportLogs.newCategories.forEach(cat => addCategory(cat));
        
        const logsToAdd = skipDuplicates ? pendingImportLogs.unique : [...pendingImportLogs.unique, ...pendingImportLogs.duplicates];
        
        if (logsToAdd.length > 0) {
            batchAddLogs(logsToAdd);
            showToast(`Successfully imported ${logsToAdd.length} entries and ${pendingImportLogs.newCategories.length} categories`, 'success');
        } else {
            showToast(`Imported ${pendingImportLogs.newCategories.length} categories`, 'info');
        }
        
        setImportSummary(null);
        setPendingImportLogs({ unique: [], duplicates: [], newCategories: [] });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
  
    const confirmClear = () => {
        resetTimesheet();
        setIsResetConfirmationOpen(false);
        showToast('Timesheet cleared successfully', 'success');
    };

    const handleApplyComboToDay = (combo: CategoryCombo, multiplier: number = 1) => {
        const targetDate = getLocalDateStr(anchorDate);
        
        const newLogs: TimeLog[] = combo.items.map(item => ({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser.id,
            date: targetDate,
            categoryId: item.categoryId,
            subCategoryId: item.subCategoryId || 'general',
            startTime: '09:00', // Default start time
            endTime: '10:00',   // Default end time
            durationMinutes: 0,
            count: (item.defaultCount || 0) * multiplier,
            notes: `Applied from combo: ${combo.name}`
        }));

        batchAddLogs(newLogs);
        showToast(`Applied ${newLogs.length} entries to ${targetDate}`, 'success');
    };
  
    const handleUpdateDayConfig = (dateObj: Date, newConfig: DayConfig) => {
        setDaySettingsModal(prev => ({ ...prev, isOpen: false }));
        updateDayConfig(newConfig);
        showToast('Day settings updated', 'success');
    };

    const handleSaveLogDetails = (updatedLog: Partial<TimeLog>) => {
        if (!activeLogDetails) return;
        const { log, dateStr } = activeLogDetails;
        
        if (log) {
            updateLog({ ...log, ...updatedLog } as TimeLog);
        } else {
            addLog({
                id: Date.now().toString(),
                userId: currentUser.id,
                date: dateStr,
                categoryId: updatedLog.categoryId || '',
                subCategoryId: updatedLog.subCategoryId || '',
                startTime: updatedLog.startTime || '09:00',
                endTime: updatedLog.endTime || '10:00',
                durationMinutes: updatedLog.durationMinutes || 0,
                count: updatedLog.count,
                notes: updatedLog.notes || ''
            });
        }
        setActiveLogDetails(null);
    };

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => a.order - b.order);
    }, [categories]);

    return (
      <div className="flex flex-col gap-6 animate-fade-in font-sans flex-1 min-h-full">
        <DaySettingsModal 
            isOpen={daySettingsModal.isOpen} 
            onClose={() => setDaySettingsModal(prev => ({ ...prev, isOpen: false }))} 
            dateObj={daySettingsModal.dateObj} 
            config={daySettingsModal.config} 
            onSave={(config) => handleUpdateDayConfig(daySettingsModal.dateObj, config)} 
        />
        <RecurringTasksModal 
            isOpen={isRecurringModalOpen} 
            onClose={() => setIsRecurringModalOpen(false)} 
            categories={sortedCategories} 
        />
        
        {/* Controls Header */}
        <TimesheetToolbar 
            viewMode={viewMode}
            setViewMode={setViewMode}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            label={label}
            navigate={navigate}
            setAnchorDate={setAnchorDate}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            categories={sortedCategories}
            hiddenCategoryIds={hiddenCategoryIds}
            hiddenSubCategoryIds={hiddenSubCategoryIds}
            expandedCategories={expandedCategories}
            toggleAllCategories={toggleAllCategories}
            toggleCategoryVisibility={toggleCategoryVisibility}
            toggleCategoryExpand={toggleCategoryExpand}
            toggleSubCategoryVisibility={toggleSubCategoryVisibility}
            categoryCombos={categoryCombos}
            setHiddenCategoryIds={setHiddenCategoryIds}
            onApplyComboToDay={handleApplyComboToDay}
            setIsRecurringModalOpen={setIsRecurringModalOpen}
            openTodaySettings={openTodaySettings}
            fileInputRef={fileInputRef}
            handleImportFile={handleImportFile}
            handleDownloadTemplate={handleDownloadTemplate}
            handleExportClick={handleExportClick}
            setIsResetConfirmationOpen={setIsResetConfirmationOpen}
        />

        {/* Main Grid */}
        <div className="flex-1 flex flex-col animate-fade-in-up">
          {layoutMode === 'TABLE' ? (
              <TimesheetTable 
                 categories={sortedCategories}
                 logsByDate={logsByDate}
                 days={days}
                 targetUserId={currentUser.id}
                 readOnly={false}
                 hiddenCategoryIds={hiddenCategoryIds}
                 hiddenSubCategoryIds={hiddenSubCategoryIds}
                 onUpdateLog={updateLog}
                 onAddLog={addLog}
                 onDeleteLog={deleteLog}
                 onLogClick={(log, dateStr, category, subCategory) => setActiveLogDetails({ log, dateStr, category, subCategory })}
                 onDaySettingsClick={(d) => setDaySettingsModal({ isOpen: true, dateObj: d.dateObj, config: d.config })}
               />
          ) : (
              <TimesheetList 
                 categories={sortedCategories}
                 logsByDate={logsByDate}
                 days={days}
                 targetUserId={currentUser.id}
                 readOnly={false}
                 hiddenCategoryIds={hiddenCategoryIds}
                 hiddenSubCategoryIds={hiddenSubCategoryIds}
                 onLogClick={(log, dateStr) => setActiveLogDetails({ log, dateStr })}
                 onDaySettingsClick={(d) => setDaySettingsModal({ isOpen: true, dateObj: d.dateObj, config: d.config })}
               />
          )}
        </div>

        {activeLogDetails && (
            <LogDetailsModal 
                isOpen={!!activeLogDetails}
                onClose={() => setActiveLogDetails(null)}
                log={activeLogDetails.log}
                dateStr={activeLogDetails.dateStr}
                categories={sortedCategories}
                initialCategory={activeLogDetails.category}
                initialSubCategory={activeLogDetails.subCategory}
                onSave={handleSaveLogDetails}
                onDelete={(id) => { deleteLog(id); setActiveLogDetails(null); }}
            />
        )}

        {exportSummary && (
            <ExportConfirmationModal 
                isOpen={!!exportSummary}
                onClose={() => setExportSummary(null)}
                onConfirm={confirmExport}
                summary={exportSummary}
            />
        )}
        
        {importSummary && (
            <ImportConfirmationModal 
                isOpen={!!importSummary}
                onClose={() => { setImportSummary(null); setPendingImportLogs({ unique: [], duplicates: [], newCategories: [] }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                onConfirm={confirmImport}
                summary={importSummary}
            />
        )}

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
