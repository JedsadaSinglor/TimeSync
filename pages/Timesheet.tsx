
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { TimeLog, Category, SubCategory, RecurringTask, RecurrenceFrequency } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Trash2, List, Grid3X3, MessageSquare, Download, Upload, LayoutGrid, Repeat, CalendarClock, Sparkles, Eraser, AlertTriangle, Filter, CheckSquare, Square, Eye, EyeOff, ChevronDown, ChevronRight as ChevronIcon, Hash, Calculator, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateStr } from '../utils/storage';

type ViewMode = 'DAILY' | 'WEEK' | 'MONTH';

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const GridInputCell: React.FC<{
  value: string | number;
  onChange: (val: string) => void;
  isQty: boolean;
  placeholder?: string;
  disabled?: boolean;
  hasNotes?: boolean;
  onNotesClick?: () => void;
}> = React.memo(({ value, onChange, isQty, placeholder, disabled, hasNotes, onNotesClick }) => {
  const [localValue, setLocalValue] = useState<string | number>(value === 0 ? '' : value);

  useEffect(() => {
    setLocalValue(value === 0 ? '' : value);
  }, [value]);

  const commitChange = () => {
    const stringVal = String(localValue);
    const currentPropVal = value === 0 ? '' : String(value);
    if (stringVal !== currentPropVal) {
       if(Number(stringVal) !== Number(currentPropVal)) {
          onChange(stringVal);
       }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.currentTarget.blur();
    }
  };

  return (
    <div className="relative w-full h-full group/cell">
        <input
        type="number"
        min="0"
        disabled={disabled}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={commitChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full h-full px-1 py-3 text-center bg-transparent outline-none transition-all duration-200 text-sm font-medium
            ${disabled ? 'cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600' : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-inset focus:ring-indigo-500/50 focus:shadow-md'}
            ${isQty ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}
            ${Number(localValue) > 0 ? 'bg-white/50 dark:bg-slate-800/50 font-bold' : ''}
        `}
        />
        {hasNotes && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full pointer-events-none shadow-sm"></div>
        )}
        {!disabled && onNotesClick && (
            <button 
                onClick={onNotesClick}
                className={`absolute bottom-1 right-1 p-1 rounded-md hover:bg-indigo-100 dark:hover:bg-slate-700 text-slate-400 opacity-0 group-hover/cell:opacity-100 transition-opacity ${hasNotes ? 'text-indigo-600 dark:text-indigo-400 opacity-100' : ''}`}
                tabIndex={-1}
                title="Edit Notes"
            >
                <MessageSquare size={10} fill={hasNotes ? "currentColor" : "none"} />
            </button>
        )}
    </div>
  );
});

interface TimesheetCellProps {
  day: { dateStr: string; isToday: boolean; dateObj: Date; dayName: string; shortDate: string };
  category: Category;
  subCategory: SubCategory;
  log: TimeLog | undefined;
  readOnly: boolean;
  onCellChange: (d: string, c: Category, s: SubCategory, v: string) => void;
  onNoteClick: (d: string, c: Category, s: SubCategory) => void;
}

const areTimesheetCellPropsEqual = (prev: TimesheetCellProps, next: TimesheetCellProps) => {
    if (prev.day.dateStr !== next.day.dateStr) return false;
    if (prev.day.isToday !== next.day.isToday) return false;
    if (prev.category.id !== next.category.id) return false;
    if (prev.subCategory.id !== next.subCategory.id) return false;
    if (prev.readOnly !== next.readOnly) return false;
    
    const pLog = prev.log;
    const nLog = next.log;
    if (pLog === nLog) return true;
    if (!pLog || !nLog) return false;
    return (
        pLog.durationMinutes === nLog.durationMinutes &&
        pLog.count === nLog.count &&
        pLog.notes === nLog.notes
    );
};

const TimesheetCell = React.memo(({ day, category, subCategory, log, readOnly, onCellChange, onNoteClick }: TimesheetCellProps) => {
  const isQtyMode = (subCategory.minutes || 0) > 0;
  
  // Robust display value calculation
  const displayValue = useMemo(() => {
      if (isQtyMode) {
          if (log?.count !== undefined && log.count !== null) return log.count;
          if (log?.durationMinutes && subCategory.minutes) return Math.round((log.durationMinutes / subCategory.minutes) * 10) / 10;
          return 0;
      }
      return log?.durationMinutes || 0;
  }, [isQtyMode, log, subCategory.minutes]);

  const handleChange = useCallback((val: string) => {
      onCellChange(day.dateStr, category, subCategory, val);
  }, [day.dateStr, category, subCategory, onCellChange]);

  const handleNoteClick = useCallback(() => {
      onNoteClick(day.dateStr, category, subCategory);
  }, [day.dateStr, category, subCategory, onNoteClick]);

  const isWeekend = day.dateObj.getDay() === 0 || day.dateObj.getDay() === 6;

  return (
    <td className={`border border-slate-200/60 dark:border-slate-700/60 p-0 h-11 min-w-[60px] relative
      ${day.isToday ? 'bg-indigo-50/10 dark:bg-indigo-900/5' : (isWeekend ? 'bg-slate-50/40 dark:bg-slate-800/40':'')} 
      ${readOnly ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}
    `}>
        {day.isToday && <div className="absolute inset-y-0 left-0 w-[2px] bg-indigo-500/20 pointer-events-none"></div>}
        {day.isToday && <div className="absolute inset-y-0 right-0 w-[2px] bg-indigo-500/20 pointer-events-none"></div>}
      <GridInputCell 
        value={displayValue} 
        isQty={isQtyMode} 
        onChange={handleChange} 
        placeholder="-" 
        disabled={readOnly}
        hasNotes={!!log?.notes}
        onNotesClick={handleNoteClick}
      />
    </td>
  );
}, areTimesheetCellPropsEqual);

const TimesheetTable: React.FC<{
  categories: Category[];
  logs: TimeLog[];
  days: { dateObj: Date; dateStr: string; dayName: string; shortDate: string; isToday: boolean }[];
  targetUserId: string;
  readOnly: boolean;
  hiddenCategoryIds: Set<string>;
  hiddenSubCategoryIds: Set<string>;
  onUpdateLog: (log: TimeLog) => void;
  onAddLog: (log: TimeLog) => void;
  onDeleteLog: (id: string) => void;
  showToast: (msg: string) => void;
}> = ({ categories, logs, days, targetUserId, readOnly, hiddenCategoryIds, hiddenSubCategoryIds, onUpdateLog, onAddLog, onDeleteLog, showToast }) => {
  
  const [activeNoteCell, setActiveNoteCell] = useState<{ log: TimeLog | null, dateStr: string, catId: string, subId: string } | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const logsMap = useMemo(() => {
    const map = new Map<string, TimeLog>();
    logs.forEach(log => {
      if (log.userId === targetUserId) {
        const subId = log.subCategoryId || 'general';
        const key = `${log.date}_${log.categoryId}_${subId}`;
        if (map.has(key)) {
           const existing = map.get(key)!;
           map.set(key, {
               ...existing,
               durationMinutes: existing.durationMinutes + log.durationMinutes,
               count: (existing.count || 0) + (log.count || 0),
               notes: existing.notes ? `${existing.notes}; ${log.notes}` : log.notes
           });
        } else {
           map.set(key, { ...log }); 
        }
      }
    });
    return map;
  }, [logs, targetUserId]);

  const gridRows = useMemo(() => {
      const rows: { category: Category; subCategory: SubCategory; key: string }[] = [];

      categories.forEach(cat => {
          if (hiddenCategoryIds.has(cat.id)) return;

          if (cat.subCategories && cat.subCategories.length > 0) {
              cat.subCategories.forEach(sub => {
                  if (hiddenSubCategoryIds.has(`${cat.id}-${sub.id}`)) return;
                  rows.push({
                      category: cat,
                      subCategory: sub,
                      key: `${cat.id}-${sub.id}`
                  });
              });
          } else {
               rows.push({
                  category: cat,
                  subCategory: { id: 'general', name: 'General', minutes: 0 },
                  key: `${cat.id}-general`
              });
          }
      });
      return rows;
  }, [categories, hiddenCategoryIds, hiddenSubCategoryIds]);

  const handleCellChange = useCallback((dateStr: string, category: Category, subCategory: SubCategory, valStr: string) => {
    if (readOnly) return; 
    const val = valStr === '' ? 0 : parseFloat(valStr);
    const subId = subCategory.id === 'general' ? '' : subCategory.id;
    const lookupKey = `${dateStr}_${category.id}_${subId || 'general'}`;
    const existingLog = logsMap.get(lookupKey);
    const isQtyMode = (subCategory.minutes || 0) > 0;
    
    let newDuration = val;
    let newCount: number | undefined = undefined;
    if (isQtyMode && subCategory.minutes) {
      newCount = val;
      newDuration = val * subCategory.minutes;
    }

    if (existingLog) {
      if (val === 0) onDeleteLog(existingLog.id);
      else onUpdateLog({ ...existingLog, durationMinutes: newDuration, count: newCount });
    } else if (val > 0) {
      onAddLog({
        id: Date.now().toString(),
        userId: targetUserId,
        date: dateStr,
        categoryId: category.id,
        subCategoryId: subId,
        startTime: '09:00', endTime: '10:00',
        durationMinutes: newDuration,
        count: newCount,
        notes: ''
      });
    }
  }, [readOnly, logsMap, onDeleteLog, onUpdateLog, onAddLog, targetUserId]);

  const openNoteModal = useCallback((dateStr: string, category: Category, subCategory: SubCategory) => {
    const subId = subCategory.id === 'general' ? '' : subCategory.id;
    const lookupKey = `${dateStr}_${category.id}_${subId || 'general'}`;
    const existingLog = logsMap.get(lookupKey) || null;
    
    setActiveNoteCell({ log: existingLog, dateStr, catId: category.id, subId: subId || 'general' });
    setNoteContent(existingLog?.notes || '');
  }, [logsMap]);

  const saveNote = () => {
    if (!activeNoteCell) return;
    const { log, dateStr, catId, subId } = activeNoteCell;
    if (log) {
        onUpdateLog({ ...log, notes: noteContent });
    } else if (noteContent.trim()) {
        onAddLog({
            id: Date.now().toString(),
            userId: targetUserId,
            date: dateStr,
            categoryId: catId,
            subCategoryId: subId === 'general' ? '' : subId,
            startTime: '09:00', endTime: '09:00',
            durationMinutes: 0,
            notes: noteContent
        });
    }
    setActiveNoteCell(null);
    setNoteContent('');
  };

  const getRowTotal = (catId: string, subId: string) => {
    let total = 0;
    const lookupSubId = subId === 'general' ? '' : subId;
    days.forEach(d => {
      const key = `${d.dateStr}_${catId}_${lookupSubId || 'general'}`;
      const log = logsMap.get(key);
      if (log) total += log.durationMinutes;
    });
    return total;
  };

  const colMinWidth = days.length > 10 ? 'min-w-[70px]' : 'min-w-[100px]';

  return (
    <>
    <div className="hidden md:block overflow-auto border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm bg-white dark:bg-slate-900 relative max-h-[75vh] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
      <table className="w-full text-left border-collapse min-w-max">
        <thead>
          <tr>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-2 text-center w-10 sticky left-0 z-20"></th>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px] sticky left-10 z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Category</th>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[160px] sticky left-[210px] z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Subcategory</th>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-4 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24">Default</th>
            {days.map(d => (
              <th key={d.dateStr} className={`border-b border-r border-slate-200 dark:border-slate-700 p-3 text-center ${colMinWidth} ${d.isToday ? 'bg-indigo-50/80 dark:bg-indigo-900/30' : 'bg-slate-50/80 dark:bg-slate-800/80'} backdrop-blur-sm`}>
                <div className={`text-xs font-bold ${d.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{d.dayName}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${d.isToday ? 'text-indigo-500 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>{d.shortDate}</div>
              </th>
            ))}
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-l border-slate-200 dark:border-slate-700 p-4 text-center text-xs font-black uppercase text-slate-500 dark:text-slate-400 w-24 sticky right-0 z-20 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Total</th>
          </tr>
        </thead>
        <tbody>
          {gridRows.length === 0 && (
              <tr>
                  <td colSpan={days.length + 5} className="p-8 text-center text-slate-400 text-sm font-medium bg-white dark:bg-slate-900">
                      No activities visible. Use the <Filter size={14} className="inline mx-1" /> filter to enable categories or subcategories.
                  </td>
              </tr>
          )}
          {gridRows.map((row) => {
            const rowTotal = getRowTotal(row.category.id, row.subCategory.id);
            return (
              <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group even:bg-slate-50/30 dark:even:bg-slate-800/20">
                <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-0 z-10 p-0 transition-colors">
                  <div className="w-full h-full"></div>
                </td>
                <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-10 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.02)] transition-colors" style={{ borderLeft: `4px solid ${row.category.color}` }}>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={row.category.name}>{row.category.name}</div>
                </td>
                <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-[210px] z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.02)] transition-colors">
                   <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate" title={row.subCategory.name}>{row.subCategory.name}</div>
                </td>
                <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 font-mono">
                  {row.subCategory.minutes ? `${row.subCategory.minutes}m` : '-'}
                </td>
                {days.map(d => {
                  const subId = row.subCategory.id === 'general' ? '' : row.subCategory.id;
                  const key = `${d.dateStr}_${row.category.id}_${subId || 'general'}`;
                  const log = logsMap.get(key);
                  return (
                    <TimesheetCell 
                      key={d.dateStr}
                      day={d}
                      category={row.category}
                      subCategory={row.subCategory}
                      log={log}
                      readOnly={readOnly}
                      onCellChange={handleCellChange}
                      onNoteClick={openNoteModal}
                    />
                  );
                })}
                <td className="border-l border-b border-slate-200/60 dark:border-slate-700/60 px-3 text-center text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky right-0 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                  {rowTotal > 0 ? (rowTotal/60).toFixed(1) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-6">
       {gridRows.map(row => {
          const rowTotal = getRowTotal(row.category.id, row.subCategory.id);
          return (
             <div key={row.key} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: row.category.color }}></div>
                <div className="flex justify-between items-start mb-4 pl-3">
                   <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{row.category.name}</div>
                      <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">{row.subCategory.name}</div>
                   </div>
                </div>
                <div className="space-y-3 pl-3">
                   {days.map(d => {
                      const subId = row.subCategory.id === 'general' ? '' : row.subCategory.id;
                      const key = `${d.dateStr}_${row.category.id}_${subId || 'general'}`;
                      const log = logsMap.get(key);
                      // Use same display logic here for mobile
                      const isQtyMode = (row.subCategory.minutes || 0) > 0;
                      let displayValue: string | number = 0;
                      if (isQtyMode) {
                          if (log?.count !== undefined && log.count !== null) displayValue = log.count;
                          else if (log?.durationMinutes && row.subCategory.minutes) displayValue = Math.round((log.durationMinutes / row.subCategory.minutes) * 10) / 10;
                      } else {
                          displayValue = log?.durationMinutes || 0;
                      }

                      return (
                        <div key={d.dateStr} className={`flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-800 ${d.isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : ''}`}>
                           <div className="flex flex-col">
                              <span className={`text-xs font-bold ${d.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{d.dayName}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{d.shortDate}</span>
                           </div>
                           <div className="w-24 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                               <GridInputCell 
                                  value={displayValue} isQty={isQtyMode}
                                  onChange={(val) => handleCellChange(d.dateStr, row.category, row.subCategory, val)} 
                                  placeholder="-" disabled={readOnly}
                                  hasNotes={!!log?.notes} onNotesClick={() => openNoteModal(d.dateStr, row.category, row.subCategory)}
                               />
                           </div>
                        </div>
                      );
                   })}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center pl-3">
                     <span className="text-xs font-bold text-slate-400 uppercase">Total Hours</span>
                     <span className="text-xl font-black text-slate-800 dark:text-white">{(rowTotal/60).toFixed(1)}</span>
                 </div>
             </div>
          );
       })}
       {gridRows.length === 0 && (
          <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
             <div className="text-slate-400 font-medium mb-2">No activities visible</div>
             <div className="text-xs text-slate-500">Tap the filter icon to enable activities.</div>
          </div>
       )}
    </div>
      
    {activeNoteCell && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm animate-scale-up">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-lg flex items-center justify-between">
                <span>Task Notes</span>
                <button onClick={() => setActiveNoteCell(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={18}/></button>
            </h4>
            <textarea autoFocus value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-sm mb-4 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 focus:border-indigo-500 outline-none min-h-[120px] resize-none font-medium" placeholder="Add details about this task..." />
            <div className="flex justify-end gap-3">
                    <button onClick={() => setActiveNoteCell(null)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button onClick={saveNote} className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5">Save Note</button>
            </div>
        </div>
    </div>
    )}
    </>
  );
};

const RecurringTasksModal: React.FC<{ isOpen: boolean; onClose: () => void; categories: Category[]; currentViewRange: { start: Date; end: Date } }> = ({ isOpen, onClose, categories, currentViewRange }) => {
    const { currentUser, recurringTasks, addRecurringTask, deleteRecurringTask, applyRecurringTasks } = useApp();
    const { showToast } = useToast();
    const [catId, setCatId] = useState('');
    const [subId, setSubId] = useState('');
    const [frequency, setFrequency] = useState<RecurrenceFrequency>('WEEKLY');
    const [inputValue, setInputValue] = useState(60); // Holds either duration OR quantity
    const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0-6 Sun-Sat
  
    const myTasks = recurringTasks.filter(t => t.userId === currentUser.id);
    const selectedCategory = categories.find(c => c.id === catId);
    const selectedSub = selectedCategory?.subCategories.find(s => s.id === subId);
    
    const unitMinutes = selectedSub?.minutes || 0;
    const isQtyBased = unitMinutes > 0;

    useEffect(() => {
        // Reset input value when switching between Quantity and Duration modes
        if (isQtyBased) {
            setInputValue(1); // Default 1 item
        } else {
            setInputValue(60); // Default 60 mins
        }
    }, [isQtyBased]);

    const handleAdd = () => {
        if (!catId) return;

        let durationMinutes = inputValue;
        let count: number | undefined = undefined;

        if (isQtyBased && unitMinutes > 0) {
             count = inputValue;
             durationMinutes = inputValue * unitMinutes;
        }

        const newTask: RecurringTask = {
            id: Date.now().toString(),
            userId: currentUser.id,
            categoryId: catId,
            subCategoryId: subId || 'general',
            frequency,
            durationMinutes: durationMinutes,
            count: count,
            notes: 'Recurring Task',
            weekDays: frequency === 'WEEKLY' ? selectedDays : undefined,
            dayOfMonth: frequency === 'MONTHLY' ? 1 : undefined 
        };
        
        // Add to state
        addRecurringTask(newTask);
        
        // Apply immediately to current view
        const appCount = applyRecurringTasks(currentViewRange.start, currentViewRange.end, [newTask]);
        if (appCount > 0) {
            showToast(`Task added & ${appCount} entries created in current view`, 'success');
        } else {
            showToast('Task added (no entries created for current view)', 'success');
        }
        
        setCatId('');
        setSubId('');
        setInputValue(60);
        setSelectedDays([]);
    };
  
    const toggleDay = (day: number) => {
        setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 animate-scale-up overflow-hidden flex flex-col max-h-[90vh]">
               {/* Modal Header */}
               <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                   <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                             <Repeat size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Recurring Tasks</h3>
                   </div>
                   <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
               </div>
               
               <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 bg-slate-50/50 dark:bg-slate-900/50">
                   {/* CREATE SECTION */}
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                          <Plus size={16} className="text-indigo-500" strokeWidth={3} />
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Create New Routine</h4>
                      </div>

                      {/* Row 1: Category & Subcategory */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Category</label>
                              <div className="relative">
                                <select className="w-full p-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none" value={catId} onChange={e => { setCatId(e.target.value); setSubId(''); }}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Sub-Category</label>
                              <div className="relative">
                                <select className="w-full p-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none" value={subId} onChange={e => { setSubId(e.target.value); }} disabled={!catId}>
                                    <option value="">General</option>
                                    {selectedCategory?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                              </div>
                           </div>
                      </div>
  
                      {/* Row 2: Frequency & Input */}
                      <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex-1 space-y-2">
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Frequency</label>
                              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700">
                                  {(['DAILY', 'WEEKLY', 'MONTHLY'] as RecurrenceFrequency[]).map(f => (
                                      <button 
                                        key={f} 
                                        onClick={() => setFrequency(f)} 
                                        className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all uppercase tracking-wide ${frequency === f ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                      >
                                          {f}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div className="w-full md:w-56 space-y-2">
                              <label className={`text-[11px] font-bold uppercase tracking-wider pl-1 flex items-center gap-1.5 transition-colors ${isQtyBased ? 'text-blue-500' : 'text-slate-400'}`}>
                                  {isQtyBased ? <><Hash size={12}/> Quantity (Items)</> : <><Clock size={12}/> Duration (Minutes)</>}
                              </label>
                              <div className="relative group">
                                  <input 
                                      type="number" 
                                      value={inputValue} 
                                      onChange={e => setInputValue(Number(e.target.value))} 
                                      className={`w-full p-3.5 pl-4 pr-12 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-sm font-black outline-none focus:ring-4 transition-all ${isQtyBased ? 'border-blue-100 dark:border-blue-900/50 text-blue-600 focus:border-blue-500 focus:ring-blue-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-800 dark:text-white'}`} 
                                      min="0" 
                                      step={isQtyBased ? "1" : "15"} 
                                      placeholder={isQtyBased ? "Qty" : "Mins"}
                                  />
                                  <div className={`absolute right-4 top-3.5 pointer-events-none transition-colors ${isQtyBased ? 'text-blue-400' : 'text-slate-300'}`}>
                                     {isQtyBased ? <Hash size={18} /> : <Clock size={18} />}
                                  </div>
                              </div>
                          </div>
                      </div>

                       {/* Calculation Helper for Quantity Mode */}
                       {isQtyBased && unitMinutes > 0 && (
                          <div className="animate-fade-in -mt-2">
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-xs">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                                      <Calculator size={16} />
                                  </div>
                                  <div className="text-blue-800 dark:text-blue-200">
                                      <span className="font-medium opacity-70 block text-[10px] uppercase tracking-wider">Total Time Estimate</span>
                                      <div className="font-bold flex items-center gap-1.5 mt-0.5">
                                          <span className="bg-white dark:bg-slate-900 px-1.5 rounded border border-blue-100 dark:border-blue-800/50">{inputValue} items</span> 
                                          <span className="opacity-50">×</span>
                                          <span>{unitMinutes}m</span>
                                          <span className="opacity-50">=</span>
                                          <span className="text-lg">{inputValue * unitMinutes} min</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                       )}
                      
                      {/* Active Days Selector */}
                      {frequency === 'WEEKLY' && (
                           <div className="animate-fade-in space-y-2 pt-2">
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Active Days</label>
                              <div className="flex flex-wrap gap-2">
                                  {['S','M','T','W','T','F','S'].map((d, i) => (
                                      <button key={i} onClick={() => toggleDay(i)} className={`w-10 h-10 rounded-full text-xs font-bold transition-all border flex items-center justify-center ${selectedDays.includes(i) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'}`}>
                                          {d}
                                      </button>
                                  ))}
                              </div>
                           </div>
                      )}
  
                      <button onClick={handleAdd} disabled={!catId || (frequency === 'WEEKLY' && selectedDays.length === 0)} className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:-translate-y-1 flex items-center justify-center gap-2 mt-4">
                          <Plus size={18} strokeWidth={3} /> Add Routine to Schedule
                      </button>
                   </div>
  
                   {/* LIST SECTION */}
                   <div className="space-y-4 pt-2">
                       <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider flex items-center justify-between px-1">
                           <span>Active Routines</span>
                           <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-black border border-slate-100 dark:border-slate-700">{myTasks.length}</span>
                       </h4>
                       
                       <div className="space-y-3">
                           {myTasks.length === 0 && (
                               <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-800/30 flex flex-col items-center gap-3">
                                   <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                                       <CalendarClock size={24} />
                                   </div>
                                   <p>No recurring tasks set up yet.</p>
                               </div>
                           )}
                           {myTasks.map(task => {
                               const cat = categories.find(c => c.id === task.categoryId);
                               const sub = cat?.subCategories.find(s => s.id === task.subCategoryId);
                               const isQty = (sub?.minutes || 0) > 0;

                               return (
                                   <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                       <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{backgroundColor: cat?.color}}></div>
                                       <div className="flex items-center gap-4 pl-3">
                                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 font-bold text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50">
                                               {task.frequency[0]}
                                           </div>
                                           <div>
                                               <div className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                                   {cat?.name} <ChevronIcon size={12} className="text-slate-300" /> <span className="text-slate-600 dark:text-slate-300">{sub?.name || 'General'}</span>
                                               </div>
                                               <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 items-center mt-1.5">
                                                   {isQty ? (
                                                        <span className="font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/50"><Hash size={11} /> {task.count} items</span>
                                                   ) : (
                                                        <span className="font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"><Clock size={11} /> {task.durationMinutes} min</span>
                                                   )}
                                                   {task.frequency === 'WEEKLY' && task.weekDays && (
                                                       <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                                                           {task.weekDays.map(d => ['Su','Mo','Tu','We','Th','Fr','Sa'][d]).join(' ')}
                                                       </span>
                                                   )}
                                               </div>
                                           </div>
                                       </div>
                                       <button onClick={() => deleteRecurringTask(task.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                                           <Trash2 size={18}/>
                                       </button>
                                   </div>
                               )
                           })}
                       </div>
                   </div>
               </div>
           </div>
      </div>
    );
  };

// Wrapper component to manage the modal state locally
const TimesheetWithModal: React.FC = () => {
    // ... (No changes in the wrapper component logic)
    const { logs, categories, addLog, updateLog, deleteLog, currentUser, applyRecurringTasks, resetTimesheet } = useApp();
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('WEEK');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
    
    // Visibility State
    const [hiddenCategoryIds, setHiddenCategoryIds] = useState<Set<string>>(new Set());
    const [hiddenSubCategoryIds, setHiddenSubCategoryIds] = useState<Set<string>>(new Set());
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategoryExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleCategoryVisibility = (id: string) => {
        setHiddenCategoryIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSubCategoryVisibility = (catId: string, subId: string) => {
        const key = `${catId}-${subId}`;
        setHiddenSubCategoryIds(prev => {
             const next = new Set(prev);
             if (next.has(key)) next.delete(key);
             else next.add(key);
             return next;
        });
    };

    const toggleAllCategories = () => {
        if (hiddenCategoryIds.size > 0) {
            setHiddenCategoryIds(new Set()); // Show all
        } else {
            const allIds = new Set(categories.map(c => c.id));
            setHiddenCategoryIds(allIds);
        }
    };
  
    const days = useMemo(() => {
      const todayStr = getLocalDateStr(new Date());
      if (viewMode === 'MONTH') {
         const year = anchorDate.getFullYear();
         const month = anchorDate.getMonth();
         const daysInMonth = new Date(year, month + 1, 0).getDate();
         return Array.from({ length: daysInMonth }).map((_, i) => {
             const d = new Date(year, month, i + 1);
             const dateStr = getLocalDateStr(d);
             return { dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { day: 'numeric' }), isToday: dateStr === todayStr };
         });
      }
      if (viewMode === 'DAILY') {
          const d = new Date(anchorDate);
          const dateStr = getLocalDateStr(d);
          return [{ dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'long' }), shortDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), isToday: dateStr === todayStr }];
      } else {
          const start = getStartOfWeek(anchorDate);
          return Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(start); d.setDate(d.getDate() + i);
              const dateStr = getLocalDateStr(d);
              return { dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isToday: dateStr === todayStr };
          });
      }
    }, [viewMode, anchorDate]);
  
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
  
    const handleAutoFill = () => {
      const start = days[0].dateObj;
      const end = days[days.length-1].dateObj;
      const count = applyRecurringTasks(start, end);
      if (count > 0) showToast(`Auto-filled ${count} logs.`, 'success');
      else showToast('No new tasks added.', 'info');
    };
  
    const handleExport = () => {
      // Flatten all categories and subcategories into columns
      const flatColumns: { cat: Category, sub: SubCategory }[] = [];
      categories.forEach(cat => {
        if (cat.subCategories.length === 0) {
           flatColumns.push({ cat, sub: { id: 'general', name: 'General', minutes: 0 } });
        } else {
           cat.subCategories.forEach(sub => flatColumns.push({ cat, sub }));
        }
      });

      // Create Header Rows
      // Row 1: Category Names
      const headerRow1 = ['Date', ...flatColumns.map(c => c.cat.name), 'Total'];
      // Row 2: Subcategory Names
      const headerRow2 = ['', ...flatColumns.map(c => c.sub.name), ''];

      // Create Data Rows
      const dataRows = days.map(d => {
        // Date format: Thursday, January 1, 2026
        const dateLabel = d.dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const rowData: (string | number)[] = [dateLabel];
        let rowTotal = 0;

        flatColumns.forEach(col => {
            const subId = col.sub.id === 'general' ? '' : col.sub.id;
            const log = logs.find(l =>
                l.userId === currentUser.id &&
                l.date === d.dateStr &&
                l.categoryId === col.cat.id &&
                (l.subCategoryId === subId || (!l.subCategoryId && subId === ''))
            );

            let val: number | string = '';
            if (log) {
                // Check if it's a qty based task (has minutes defined in subcat) or duration based
                const isQty = (col.sub.minutes || 0) > 0;
                const numericVal = isQty ? (log.count || 0) : log.durationMinutes;
                val = numericVal;
                rowTotal += numericVal;
            }
            rowData.push(val);
        });
        rowData.push(rowTotal);
        return rowData;
      });

      // Create Sheet
      const wsData = [headerRow1, headerRow2, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
      XLSX.writeFile(wb, `Timesheet_Report.xlsx`);
      showToast(`Exported successfully`, 'success');
    };
  
    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            // Use cellDates: true to get Date objects for date cells automatically
            const workbook = XLSX.read(data, { cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

            if (jsonData.length < 3) {
                showToast("File format not recognized (too few rows)", "error");
                return;
            }

            // Row 0: Category Headers
            const catHeadersRaw = jsonData[0];
            // Row 1: Subcategory Headers
            const subHeadersRaw = jsonData[1];

            // Normalize Headers (Fill empty category cells with previous value - standard Excel merge behavior)
            const catHeaders: string[] = [];
            let lastCat = '';
            for (let i = 0; i < catHeadersRaw.length; i++) {
                const val = catHeadersRaw[i];
                if (val) {
                    lastCat = String(val);
                }
                catHeaders[i] = lastCat;
            }

            let importedCount = 0;
            
            // Iterate data rows starting at index 2
            for (let i = 2; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;

                // Date is in column 0
                const dateVal = row[0];
                if (!dateVal) continue;

                let dateStr = '';
                
                // Handle Date parsing
                if (dateVal instanceof Date) {
                    dateStr = getLocalDateStr(dateVal);
                } else {
                    // Try parsing string
                    const parsed = new Date(dateVal);
                    if (!isNaN(parsed.getTime())) {
                         dateStr = getLocalDateStr(parsed);
                    } else {
                        // console.log("Invalid date", dateVal);
                        continue;
                    }
                }

                // Iterate Columns (skip col 0 which is Date, and last col which is Total)
                for (let j = 1; j < row.length; j++) {
                     // Check if this column is "Total"
                     if (catHeaders[j] === 'Total') continue;

                     const val = row[j];
                     if (val === undefined || val === null || val === '') continue; 

                     const numVal = parseFloat(val);
                     if (isNaN(numVal) || numVal <= 0) continue;

                     const catName = catHeaders[j];
                     const subName = subHeadersRaw[j];

                     if (!catName) continue;

                     // Find category
                     const category = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
                     if (!category) {
                         // console.log("Category not found:", catName);
                         continue;
                     }

                     // Find subcategory logic
                     let subCategoryId = '';
                     let subCategoryObj: SubCategory | undefined;
                     const sNameClean = subName ? String(subName).trim() : '';
                     
                     if (sNameClean && sNameClean.toLowerCase() !== 'general') {
                         subCategoryObj = category.subCategories.find(s => s.name.toLowerCase() === sNameClean.toLowerCase());
                         if (subCategoryObj) {
                             subCategoryId = subCategoryObj.id;
                         } else {
                             // Skip if specific subcategory not found
                             continue;
                         }
                     } else {
                         subCategoryId = 'general';
                     }
                     
                     // Helper to normalize subId for existence check
                     const checkSubId = subCategoryId === 'general' ? '' : subCategoryId;

                     const exists = logs.some(l => 
                        l.userId === currentUser.id &&
                        l.date === dateStr &&
                        l.categoryId === category.id &&
                        (l.subCategoryId === checkSubId || (!l.subCategoryId && checkSubId === ''))
                     );

                     if (!exists) {
                         let duration = numVal;
                         let count: number | undefined = undefined;

                         if (subCategoryObj && (subCategoryObj.minutes || 0) > 0) {
                             count = numVal;
                             duration = numVal * subCategoryObj.minutes!;
                         } else {
                             duration = numVal;
                         }

                         addLog({
                            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}_${j}`,
                            userId: currentUser.id,
                            date: dateStr,
                            categoryId: category.id,
                            subCategoryId: checkSubId,
                            startTime: '09:00',
                            endTime: '10:00',
                            durationMinutes: duration,
                            count: count,
                            notes: 'Imported'
                         });
                         importedCount++;
                     }
                }
            }

            if (importedCount > 0) {
                showToast(`Successfully imported ${importedCount} entries`, 'success');
            } else {
                showToast('No new entries found. Check dates and category names.', 'info');
            }

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
        <RecurringTasksModal 
            isOpen={isRecurringModalOpen} 
            onClose={() => setIsRecurringModalOpen(false)} 
            categories={categories} 
            currentViewRange={{ start: days[0].dateObj, end: days[days.length-1].dateObj }} 
        />
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
                                                    {/* Parent Category Row */}
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

                                                    {/* Subcategories */}
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
                                                                        <span className={`text-xs font-medium truncate ${isSubHidden ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                                                                            {sub.name}
                                                                        </span>
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
                       <button onClick={handleAutoFill} className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:translate-y-px transition-all flex items-center gap-2 whitespace-nowrap"><Sparkles size={16} /> Auto-fill</button>
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
           />
        </div>

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

export default TimesheetWithModal;
