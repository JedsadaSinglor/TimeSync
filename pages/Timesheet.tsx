import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { DayConfig, TimeLog, CategoryCombo, Category, SubCategory } from '../types';
import { AlertTriangle, Filter } from 'lucide-react';
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

// ==========================================
// Custom Hook: URL State Management
// ==========================================
const useTimesheetParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const viewMode = (searchParams.get('view') as ViewMode) || 'WEEK';
    const layoutMode = (searchParams.get('layout') as LayoutMode) || 'TABLE';
    
    const anchorDate = useMemo(() => {
        const d = searchParams.get('date');
        if (!d) return new Date();
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m - 1, day);
    }, [searchParams]);

    const setViewMode = useCallback((mode: ViewMode) => setSearchParams(p => { p.set('view', mode); return p; }), [setSearchParams]);
    const setLayoutMode = useCallback((mode: LayoutMode) => setSearchParams(p => { p.set('layout', mode); return p; }), [setSearchParams]);
    const setAnchorDate = useCallback((date: Date) => setSearchParams(p => { p.set('date', getLocalDateStr(date)); return p; }), [setSearchParams]);

    return { viewMode, layoutMode, anchorDate, setViewMode, setLayoutMode, setAnchorDate };
};

// ==========================================
// Custom Hook: Filter State Management
// ==========================================
const useTimesheetFilters = (categories: Category[]) => {
    const [hiddenCategoryIds, setHiddenCategoryIds] = useState<Set<string>>(new Set());
    const [hiddenSubCategoryIds, setHiddenSubCategoryIds] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleCategoryExpand = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCategories(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleCategoryVisibility = useCallback((id: string) => {
        setHiddenCategoryIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleSubCategoryVisibility = useCallback((catId: string, subId: string) => {
        const key = `${catId}-${subId}`;
        setHiddenSubCategoryIds(prev => {
             const next = new Set(prev);
             next.has(key) ? next.delete(key) : next.add(key);
             return next;
        });
    }, []);

    const toggleAllCategories = useCallback(() => {
        setHiddenCategoryIds(prev => prev.size > 0 ? new Set() : new Set(categories.map(c => c.id)));
    }, [categories]);

    return {
        hiddenCategoryIds, setHiddenCategoryIds,
        hiddenSubCategoryIds,
        expandedCategories,
        isFilterOpen, setIsFilterOpen,
        toggleCategoryExpand, toggleCategoryVisibility, toggleSubCategoryVisibility, toggleAllCategories
    };
};

// ==========================================
// Main Component
// ==========================================
const TimesheetPage: React.FC = () => {
    const { logs, logsByDate, categories, addLog, batchAddLogs, updateLog, deleteLog, currentUser, applyRecurringTasks, resetTimesheet, dayConfigs, updateDayConfig, categoryCombos, addCategory } = useApp();
    const { showToast } = useToast();
    
    // FIX: Define readOnly state (Defaults to false since users edit their own timesheet)
    const readOnly = false; 

    // Using our clean custom hooks
    const { viewMode, layoutMode, anchorDate, setViewMode, setLayoutMode, setAnchorDate } = useTimesheetParams();
    const filters = useTimesheetFilters(categories);

    // Local UI States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
    const [daySettingsModal, setDaySettingsModal] = useState<{ isOpen: boolean; dateObj: Date; config?: DayConfig }>({ isOpen: false, dateObj: new Date() });
    const [activeLogDetails, setActiveLogDetails] = useState<{ log: TimeLog | null, dateStr: string, category?: Category, subCategory?: SubCategory } | null>(null);
    
    // Import/Export States
    const [exportSummary, setExportSummary] = useState<{ startDate: string; endDate: string; totalDays: number; totalHours: number; categoryCount: number } | null>(null);
    const [importSummary, setImportSummary] = useState<{ count: number; duplicateCount: number; newCategoryCount: number; startDate: string; endDate: string } | null>(null);
    const [pendingImportLogs, setPendingImportLogs] = useState<{ unique: TimeLog[], duplicates: TimeLog[], newCategories: Category[] }>({ unique: [], duplicates: [], newCategories: [] });

    // --- Optimized Data Preparation ---
    const dayConfigMap = useMemo(() => {
        const map = new Map<string, DayConfig>();
        for (const c of dayConfigs) {
            if (c.userId === currentUser.id) map.set(c.date, c);
        }
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
                return { dateObj: d, dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { day: 'numeric' }), isToday: dateStr === todayStr };
            });
        } else if (viewMode === 'DAILY') {
            const dateStr = getLocalDateStr(anchorDate);
            dList = [{ dateObj: anchorDate, dateStr, dayName: anchorDate.toLocaleDateString('en-US', { weekday: 'long' }), shortDate: anchorDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), isToday: dateStr === todayStr }];
        } else {
            const start = getStartOfWeek(anchorDate);
            dList = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(start); d.setDate(d.getDate() + i);
                const dateStr = getLocalDateStr(d);
                return { dateObj: d, dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isToday: dateStr === todayStr };
            });
        }

        return dList.map(d => ({ ...d, config: dayConfigMap.get(d.dateStr) }));
    }, [viewMode, anchorDate, dayConfigMap]);

    // Apply recurring tasks when visible days change
    useEffect(() => {
        if (days.length > 0) applyRecurringTasks(days[0].dateObj, days[days.length - 1].dateObj);
    }, [days, applyRecurringTasks]);

    // Highly Optimized Logs Mapping (Prevents expensive object spreads inside loops)
    const { logsMap, rowTotalsMap } = useMemo(() => {
        const map = new Map<string, TimeLog>();
        const totals = new Map<string, number>(); 
        
        for (const day of days) {
            const dayLogs = logsByDate[day.dateStr];
            if (!dayLogs) continue;

            for (const log of dayLogs) {
                if (log.userId !== currentUser.id) continue;

                const subId = log.subCategoryId || 'general';
                const lookupKey = `${log.date}_${log.categoryId}_${subId}`;
                const rowKey = `${log.categoryId}-${subId}`;

                const existing = map.get(lookupKey);
                if (existing) {
                   // Direct mutation on clone is vastly faster than {...existing, ...log} in a loop
                   existing.durationMinutes += log.durationMinutes;
                   existing.count = (existing.count || 0) + (log.count || 0);
                   existing.notes = existing.notes ? `${existing.notes}; ${log.notes}` : log.notes;
                } else {
                   map.set(lookupKey, { ...log }); 
                }

                totals.set(rowKey, (totals.get(rowKey) || 0) + log.durationMinutes);
            }
        }
        return { logsMap: map, rowTotalsMap: totals };
    }, [logsByDate, currentUser.id, days]);

    const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);

    // --- Callbacks ---

    // Decoupled from `logsMap` to prevent massive re-renders when typing
    const handleCellChange = useCallback((dateStr: string, category: Category, subCategory: SubCategory, valStr: string) => {
        if (readOnly) return; 
        const val = valStr === '' ? 0 : parseFloat(valStr);
        const subId = subCategory.id === 'general' ? '' : subCategory.id;
        const isQtyMode = (subCategory.minutes || 0) > 0;
        
        let newDuration = val;
        let newCount: number | undefined = undefined;
        if (isQtyMode && subCategory.minutes) {
            newCount = val;
            newDuration = val * subCategory.minutes;
        }

        // Lookup directly from logsByDate to avoid stale closures and re-renders
        const dayLogs = logsByDate[dateStr] || [];
        const existingLog = dayLogs.find(l => l.categoryId === category.id && (l.subCategoryId || 'general') === (subId || 'general') && l.userId === currentUser.id);

        if (existingLog) {
            if (val === 0) deleteLog(existingLog.id);
            else updateLog({ ...existingLog, durationMinutes: newDuration, count: newCount });
        } else if (val > 0) {
            addLog({
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: currentUser.id,
                date: dateStr,
                categoryId: category.id,
                subCategoryId: subId,
                startTime: '09:00', endTime: '10:00',
                durationMinutes: newDuration,
                count: newCount,
                notes: ''
            });
        }
    }, [readOnly, logsByDate, currentUser.id, updateLog, deleteLog, addLog]);

    const openLogDetails = useCallback((dateStr: string, category: Category, subCategory: SubCategory) => {
        const subId = subCategory.id === 'general' ? '' : subCategory.id;
        const lookupKey = `${dateStr}_${category.id}_${subId || 'general'}`;
        const existingLog = logsMap.get(lookupKey) || null;
        setActiveLogDetails({ log: existingLog, dateStr, category, subCategory });
    }, [logsMap]);

    const navigateDate = useCallback((dir: -1 | 1) => {
        const newDate = new Date(anchorDate);
        if (viewMode === 'DAILY') newDate.setDate(newDate.getDate() + dir);
        else if (viewMode === 'MONTH') newDate.setMonth(newDate.getMonth() + dir);
        else newDate.setDate(newDate.getDate() + (dir * 7));
        setAnchorDate(newDate);
    }, [anchorDate, viewMode, setAnchorDate]);

    const label = useMemo(() => {
        if (viewMode === 'MONTH') return anchorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (viewMode === 'DAILY') return anchorDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        if (days.length === 0) return '';
        const s = days[0].dateObj; const e = days[days.length - 1].dateObj;
        return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }, [viewMode, anchorDate, days]);

    // --- Import / Export Handlers ---
    const handleExportClick = useCallback(() => {
        if (days.length === 0) return showToast('No data to export', 'error');
        const totalHours = logs
            .filter(l => l.userId === currentUser.id && days.some(d => d.dateStr === l.date))
            .reduce((acc, l) => acc + (l.durationMinutes || 0), 0) / 60;

        setExportSummary({
            startDate: days[0].dateStr, endDate: days[days.length - 1].dateStr,
            totalDays: days.length, totalHours, categoryCount: categories.length
        });
    }, [days, logs, currentUser.id, categories.length, showToast]);

    const confirmExport = useCallback(() => {
        exportTimesheetToExcel(days, categories, logs, currentUser);
        showToast('Exported successfully', 'success');
        setExportSummary(null);
    }, [days, categories, logs, currentUser, showToast]);

    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const { uniqueLogs, duplicateLogs, newCategories } = await parseTimesheetImport(file, categories, logs, currentUser);
            if (!uniqueLogs.length && !duplicateLogs.length && !newCategories.length) {
                showToast('No valid entries found.', 'info');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            const allDates = [...uniqueLogs, ...duplicateLogs].map(l => l.date).sort();
            setPendingImportLogs({ unique: uniqueLogs, duplicates: duplicateLogs, newCategories });
            setImportSummary({
                count: uniqueLogs.length, duplicateCount: duplicateLogs.length, newCategoryCount: newCategories.length,
                startDate: allDates[0] || '', endDate: allDates[allDates.length - 1] || ''
            });
        } catch (e: any) {
            showToast(e.message || "Error processing file", "error");
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmImport = useCallback((skipDuplicates: boolean) => {
        pendingImportLogs.newCategories.forEach(addCategory);
        const logsToAdd = skipDuplicates ? pendingImportLogs.unique : [...pendingImportLogs.unique, ...pendingImportLogs.duplicates];
        if (logsToAdd.length > 0) {
            batchAddLogs(logsToAdd);
            showToast(`Imported ${logsToAdd.length} entries and ${pendingImportLogs.newCategories.length} categories`, 'success');
        }
        setImportSummary(null);
        setPendingImportLogs({ unique: [], duplicates: [], newCategories: [] });
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [pendingImportLogs, addCategory, batchAddLogs, showToast]);

    const handleApplyComboToDay = useCallback((combo: CategoryCombo, multiplier: number = 1) => {
        const targetDate = getLocalDateStr(anchorDate);
        const newLogs: TimeLog[] = combo.items.map(item => ({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser.id, date: targetDate,
            categoryId: item.categoryId, subCategoryId: item.subCategoryId || 'general',
            startTime: '09:00', endTime: '10:00', durationMinutes: 0,
            count: (item.defaultCount || 0) * multiplier, notes: `Applied from combo: ${combo.name}`
        }));
        batchAddLogs(newLogs);
        showToast(`Applied ${newLogs.length} entries to ${targetDate}`, 'success');
    }, [anchorDate, currentUser.id, batchAddLogs, showToast]);

    const handleSaveLogDetails = useCallback((updatedLog: Partial<TimeLog>) => {
        if (!activeLogDetails) return;
        const { log, dateStr } = activeLogDetails;
        if (log) {
            updateLog({ ...log, ...updatedLog } as TimeLog);
        } else {
            addLog({
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: currentUser.id, date: dateStr,
                categoryId: updatedLog.categoryId || '', subCategoryId: updatedLog.subCategoryId || '',
                startTime: updatedLog.startTime || '09:00', endTime: updatedLog.endTime || '10:00',
                durationMinutes: updatedLog.durationMinutes || 0, count: updatedLog.count, notes: updatedLog.notes || ''
            });
        }
        setActiveLogDetails(null);
    }, [activeLogDetails, currentUser.id, updateLog, addLog]);

    // Keyboard a11y for Reset Modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsResetConfirmationOpen(false); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
      <div className="flex flex-col gap-6 animate-fade-in font-sans flex-1 min-h-full relative">
        <DaySettingsModal 
            isOpen={daySettingsModal.isOpen} 
            onClose={() => setDaySettingsModal(p => ({ ...p, isOpen: false }))} 
            dateObj={daySettingsModal.dateObj} config={daySettingsModal.config} 
            onSave={(config) => { setDaySettingsModal(p => ({ ...p, isOpen: false })); updateDayConfig(config); showToast('Day settings updated', 'success'); }} 
        />
        <RecurringTasksModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} categories={sortedCategories} />
        
        <TimesheetToolbar 
            viewMode={viewMode} setViewMode={setViewMode}
            layoutMode={layoutMode} setLayoutMode={setLayoutMode}
            label={label} navigate={navigateDate} setAnchorDate={setAnchorDate}
            categories={sortedCategories} categoryCombos={categoryCombos}
            {...filters} 
            onApplyComboToDay={handleApplyComboToDay}
            setIsRecurringModalOpen={setIsRecurringModalOpen}
            openTodaySettings={() => setDaySettingsModal({ isOpen: true, dateObj: new Date(), config: dayConfigMap.get(getLocalDateStr(new Date())) })}
            fileInputRef={fileInputRef} handleImportFile={handleImportFile}
            handleDownloadTemplate={() => { downloadTemplate(categories); showToast('Template downloaded', 'success'); }}
            handleExportClick={handleExportClick}
            setIsResetConfirmationOpen={setIsResetConfirmationOpen}
        />

        <div className="flex-1 flex flex-col animate-fade-in-up">
          {layoutMode === 'TABLE' ? (
              <TimesheetTable 
                 categories={sortedCategories} logsByDate={logsByDate} days={days} targetUserId={currentUser.id} readOnly={readOnly}
                 hiddenCategoryIds={filters.hiddenCategoryIds} hiddenSubCategoryIds={filters.hiddenSubCategoryIds}
                 onUpdateLog={updateLog} onAddLog={addLog} onDeleteLog={deleteLog}
                 onLogClick={openLogDetails}
                 onDaySettingsClick={(d) => setDaySettingsModal({ isOpen: true, dateObj: d.dateObj, config: d.config })}
               />
          ) : (
              <TimesheetList 
                 categories={sortedCategories} logsByDate={logsByDate} days={days} targetUserId={currentUser.id} readOnly={readOnly}
                 hiddenCategoryIds={filters.hiddenCategoryIds} hiddenSubCategoryIds={filters.hiddenSubCategoryIds}
                 onLogClick={(log, dateStr) => setActiveLogDetails({ log, dateStr })}
                 onDaySettingsClick={(d) => setDaySettingsModal({ isOpen: true, dateObj: d.dateObj, config: d.config })}
               />
          )}
        </div>

        {activeLogDetails && (
            <LogDetailsModal 
                isOpen={!!activeLogDetails} onClose={() => setActiveLogDetails(null)}
                log={activeLogDetails.log} dateStr={activeLogDetails.dateStr} categories={sortedCategories}
                initialCategory={activeLogDetails.category} initialSubCategory={activeLogDetails.subCategory}
                onSave={handleSaveLogDetails} onDelete={(id) => { deleteLog(id); setActiveLogDetails(null); }}
            />
        )}

        {exportSummary && <ExportConfirmationModal isOpen={!!exportSummary} onClose={() => setExportSummary(null)} onConfirm={confirmExport} summary={exportSummary} />}
        
        {importSummary && (
            <ImportConfirmationModal 
                isOpen={!!importSummary} 
                onClose={() => { setImportSummary(null); setPendingImportLogs({ unique: [], duplicates: [], newCategories: [] }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                onConfirm={confirmImport} summary={importSummary}
            />
        )}

        {isResetConfirmationOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" role="alertdialog" aria-modal="true">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-scale-up">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 text-red-500 mx-auto md:mx-0"><AlertTriangle size={24} /></div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center md:text-left">Clear Timesheet?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center md:text-left leading-relaxed">Are you sure you want to delete <strong>all time entries</strong>? This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsResetConfirmationOpen(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-none">Cancel</button>
                        <button onClick={() => { resetTimesheet(); setIsResetConfirmationOpen(false); showToast('Timesheet cleared', 'success'); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-400 outline-none">Yes, Clear All</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
}

export default TimesheetPage;