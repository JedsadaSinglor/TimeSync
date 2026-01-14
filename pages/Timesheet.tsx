
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { TimeLog, Category, SubCategory, RecurringTask, RecurrenceFrequency } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, X, Trash2, List, Grid3X3, MessageSquare, Download, Upload, LayoutGrid, Repeat, CalendarClock, Sparkles, Eraser, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

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
  const displayValue = isQtyMode ? (log?.count || 0) : (log?.durationMinutes || 0);

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
  onUpdateLog: (log: TimeLog) => void;
  onAddLog: (log: TimeLog) => void;
  onDeleteLog: (id: string) => void;
  showToast: (msg: string) => void;
}> = ({ categories, logs, days, targetUserId, readOnly, onUpdateLog, onAddLog, onDeleteLog, showToast }) => {
  const [manualRows, setManualRows] = useState<Set<string>>(new Set());
  const [newCatId, setNewCatId] = useState('');
  const [newSubId, setNewSubId] = useState('');
  
  const [activeNoteCell, setActiveNoteCell] = useState<{ log: TimeLog | null, dateStr: string, catId: string, subId: string } | null>(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => { setManualRows(new Set()); }, [targetUserId]);

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
      const activeKeys = new Set<string>();
      const dateSet = new Set(days.map(d => d.dateStr));

      logs.forEach(log => {
          if (log.userId === targetUserId && dateSet.has(log.date)) {
              const subId = log.subCategoryId || 'general';
              activeKeys.add(`${log.categoryId}-${subId}`);
          }
      });
      manualRows.forEach(key => activeKeys.add(key));
      
      const rows = Array.from(activeKeys).map(key => {
          let category = categories.find(c => key.startsWith(c.id));
          if (!category) {
             const parts = key.split('-');
             category = categories.find(c => c.id === parts[0]);
          }
          if (!category) return null;
          const subIdPart = key.substring(category.id.length + 1);
          let subCategory = subIdPart === 'general' ? { id: 'general', name: 'General', minutes: 0 } : category.subCategories.find(s => s.id === subIdPart);
          if (!subCategory) subCategory = { id: subIdPart, name: '(Unknown)', minutes: 0 };
          return { category, subCategory, key };
      }).filter(Boolean) as { category: Category; subCategory: SubCategory; key: string }[];
      
      return rows.sort((a, b) => a.category.name.localeCompare(b.category.name) || a.subCategory.name.localeCompare(b.subCategory.name));
  }, [logs, targetUserId, days, manualRows, categories, readOnly]);

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

  const handleManualAdd = () => {
      if (!newCatId) return;
      const sub = newSubId || 'general';
      const key = `${newCatId}-${sub}`;
      setManualRows(prev => { const next = new Set(prev); next.add(key); return next; });
      setNewCatId(''); setNewSubId('');
      showToast('Row added to grid');
  };

  const handleRemoveRow = (catId: string, subId: string, rowKey: string) => {
      const logsToDelete: string[] = [];
      const lookupSubId = subId === 'general' ? 'general' : subId;
      days.forEach(d => {
          const mapKey = `${d.dateStr}_${catId}_${lookupSubId}`;
          const log = logsMap.get(mapKey);
          if (log) logsToDelete.push(log.id);
      });
      if (logsToDelete.length > 0) {
          if (window.confirm(`Delete row and ${logsToDelete.length} entries for this period?`)) {
              logsToDelete.forEach(id => onDeleteLog(id));
              setManualRows(prev => { const next = new Set(prev); next.delete(rowKey); return next; });
              showToast('Row and entries deleted');
          }
      } else {
          setManualRows(prev => { const next = new Set(prev); next.delete(rowKey); return next; });
      }
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

  const selectedNewCategory = categories.find(c => c.id === newCatId);
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
          {gridRows.map((row) => {
            const rowTotal = getRowTotal(row.category.id, row.subCategory.id);
            return (
              <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group even:bg-slate-50/30 dark:even:bg-slate-800/20">
                <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-0 z-10 p-0 transition-colors">
                  {!readOnly && (
                      <button 
                        onClick={() => handleRemoveRow(row.category.id, row.subCategory.id, row.key)} 
                        className="hidden group-hover:flex w-full h-full items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                        title="Remove Row"
                      >
                        <X size={14}/>
                      </button>
                  )}
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
          
          {!readOnly && (
              <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 shadow-inner">
                  <td colSpan={3} className="border-r border-slate-200 dark:border-slate-700 p-3 sticky left-0 z-10 bg-slate-50 dark:bg-slate-800">
                       <div className="flex gap-3">
                            <div className="flex-1 min-w-[140px]">
                                <select className="w-full p-2.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-xl outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-slate-700 transition-all cursor-pointer" value={newCatId} onChange={e => { setNewCatId(e.target.value); setNewSubId(''); }}>
                                    <option value="">+ Add Activity</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[140px]">
                                <select className="w-full p-2.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-xl outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-slate-700 transition-all cursor-pointer" value={newSubId} onChange={e => setNewSubId(e.target.value)} disabled={!selectedNewCategory}>
                                    {(!selectedNewCategory || selectedNewCategory.subCategories.length === 0) ? <option value="general">General</option> : <option value="">Sub-Activity</option>}
                                    {selectedNewCategory?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                       </div>
                  </td>
                  <td colSpan={days.length + 2} className="border-slate-200 dark:border-slate-700 p-3">
                       <button onClick={handleManualAdd} disabled={!newCatId} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 transition-all shadow-sm hover:shadow-md transform active:scale-95">
                           <Plus size={16} /> Add Row
                       </button>
                  </td>
              </tr>
          )}
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
                   {!readOnly && (
                       <button onClick={() => handleRemoveRow(row.category.id, row.subCategory.id, row.key)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={18} /></button>
                   )}
                </div>
                <div className="space-y-3 pl-3">
                   {days.map(d => {
                      const subId = row.subCategory.id === 'general' ? '' : row.subCategory.id;
                      const key = `${d.dateStr}_${row.category.id}_${subId || 'general'}`;
                      const log = logsMap.get(key);
                      const isQtyMode = (row.subCategory.minutes || 0) > 0;
                      const displayValue = isQtyMode ? (log?.count || 0) : (log?.durationMinutes || 0);
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
       {!readOnly && (
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-indigo-500" /> Add Activity</div>
               <div className="space-y-3">
                    <select className="w-full p-3 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" value={newCatId} onChange={e => { setNewCatId(e.target.value); setNewSubId(''); }}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select className="w-full p-3 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50" value={newSubId} onChange={e => setNewSubId(e.target.value)} disabled={!selectedNewCategory}>
                        {(!selectedNewCategory || selectedNewCategory.subCategories.length === 0) ? <option value="general">General</option> : <option value="">Select Sub-Activity</option>}
                        {selectedNewCategory?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={handleManualAdd} disabled={!newCatId} className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-black dark:hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-lg">Add to Grid</button>
               </div>
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

const RecurringTasksModal: React.FC<{ isOpen: boolean; onClose: () => void; categories: Category[] }> = ({ isOpen, onClose, categories }) => {
    const { currentUser, recurringTasks, addRecurringTask, deleteRecurringTask } = useApp();
    const [catId, setCatId] = useState('');
    const [subId, setSubId] = useState('');
    const [frequency, setFrequency] = useState<RecurrenceFrequency>('WEEKLY');
    const [duration, setDuration] = useState(60);
    const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0-6 Sun-Sat
  
    const myTasks = recurringTasks.filter(t => t.userId === currentUser.id);
  
    const handleAdd = () => {
        if (!catId) return;
        const newTask: RecurringTask = {
            id: Date.now().toString(),
            userId: currentUser.id,
            categoryId: catId,
            subCategoryId: subId || 'general',
            frequency,
            durationMinutes: duration,
            notes: 'Recurring Task',
            weekDays: frequency === 'WEEKLY' ? selectedDays : undefined,
            dayOfMonth: frequency === 'MONTHLY' ? 1 : undefined 
        };
        addRecurringTask(newTask);
        setCatId('');
        setSubId('');
        setSelectedDays([]);
    };
  
    const toggleDay = (day: number) => {
        setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };
  
    if (!isOpen) return null;
  
    const selectedCategory = categories.find(c => c.id === catId);
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 animate-scale-up overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                   <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"><Repeat size={20} className="text-indigo-500"/> Recurring Tasks</h3>
                   <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={20}/></button>
               </div>
               
               <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Create New Routine</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Category</label>
                              <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={catId} onChange={e => { setCatId(e.target.value); setSubId(''); }}>
                                  <option value="">Select Category</option>
                                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Sub-Category</label>
                              <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold outline-none disabled:opacity-50 focus:ring-2 focus:ring-indigo-500" value={subId} onChange={e => setSubId(e.target.value)} disabled={!catId}>
                                  <option value="">General</option>
                                  {selectedCategory?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                           </div>
                      </div>
  
                      <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Frequency</label>
                              <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                                  {(['DAILY', 'WEEKLY', 'MONTHLY'] as RecurrenceFrequency[]).map(f => (
                                      <button key={f} onClick={() => setFrequency(f)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${frequency === f ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                          {f}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div className="w-full md:w-32">
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Minutes</label>
                              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" min="0" step="15" />
                          </div>
                      </div>
                      
                      {frequency === 'WEEKLY' && (
                           <div>
                              <label className="text-xs font-bold text-slate-400 mb-2 block">Days of Week</label>
                              <div className="flex gap-2">
                                  {['S','M','T','W','T','F','S'].map((d, i) => (
                                      <button key={i} onClick={() => toggleDay(i)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors border flex items-center justify-center ${selectedDays.includes(i) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}>
                                          {d}
                                      </button>
                                  ))}
                              </div>
                           </div>
                      )}
  
                      <button onClick={handleAdd} disabled={!catId || (frequency === 'WEEKLY' && selectedDays.length === 0)} className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-black dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all hover:-translate-y-0.5">Add Routine</button>
                   </div>
  
                   <div className="space-y-3">
                       <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">Your Routines <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{myTasks.length}</span></h4>
                       {myTasks.length === 0 && (
                           <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30">No recurring tasks set up.</div>
                       )}
                       {myTasks.map(task => {
                           const cat = categories.find(c => c.id === task.categoryId);
                           const sub = cat?.subCategories.find(s => s.id === task.subCategoryId);
                           return (
                               <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                   <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{backgroundColor: cat?.color || '#cbd5e1'}}>
                                           {task.frequency[0]}
                                       </div>
                                       <div>
                                           <div className="font-bold text-slate-800 dark:text-white text-sm">{cat?.name} <span className="text-slate-400 font-normal">/</span> {sub?.name || 'General'}</div>
                                           <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-2 items-center mt-0.5">
                                               <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{task.durationMinutes}m</span>
                                               <span className="opacity-50">•</span>
                                               <span className="capitalize">{task.frequency.toLowerCase()}</span>
                                               {task.frequency === 'WEEKLY' && task.weekDays && (
                                                   <span className="text-[10px] text-indigo-500 font-bold">
                                                       ({task.weekDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')})
                                                   </span>
                                               )}
                                           </div>
                                       </div>
                                   </div>
                                   <button onClick={() => deleteRecurringTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                               </div>
                           )
                       })}
                   </div>
               </div>
           </div>
      </div>
    );
  };

// Wrapper component to manage the modal state locally
const TimesheetWithModal: React.FC = () => {
    const { logs, categories, addLog, updateLog, deleteLog, currentUser, applyRecurringTasks, resetTimesheet } = useApp();
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('WEEK');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  
    const days = useMemo(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      if (viewMode === 'MONTH') {
         const year = anchorDate.getFullYear();
         const month = anchorDate.getMonth();
         const daysInMonth = new Date(year, month + 1, 0).getDate();
         return Array.from({ length: daysInMonth }).map((_, i) => {
             const d = new Date(year, month, i + 1);
             const dateStr = d.toISOString().split('T')[0];
             return { dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), shortDate: d.toLocaleDateString('en-US', { day: 'numeric' }), isToday: dateStr === todayStr };
         });
      }
      if (viewMode === 'DAILY') {
          const d = new Date(anchorDate);
          const dateStr = d.toISOString().split('T')[0];
          return [{ dateObj: d, dateStr: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'long' }), shortDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), isToday: dateStr === todayStr }];
      } else {
          const start = getStartOfWeek(anchorDate);
          return Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(start); d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split('T')[0];
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
      const dateHeaders = days.map(d => d.dateStr);
      const headers = ['Category', 'Subcategory', ...dateHeaders];
      const dataRows: (string | number)[][] = [];
      categories.forEach(cat => {
          if (cat.subCategories.length === 0) {
              const rowData: (string|number)[] = [cat.name, 'General'];
              dateHeaders.forEach(date => {
                  const log = logs.find(l => l.userId === currentUser.id && l.date === date && l.categoryId === cat.id && (l.subCategoryId === 'general' || !l.subCategoryId));
                  rowData.push(log ? log.durationMinutes : '');
              });
              dataRows.push(rowData);
          } else {
              cat.subCategories.forEach((sub) => {
                  const rowData: (string|number)[] = [cat.name, sub.name];
                  dateHeaders.forEach(date => {
                      const log = logs.find(l => l.userId === currentUser.id && l.date === date && l.categoryId === cat.id && l.subCategoryId === sub.id);
                      rowData.push(log ? log.durationMinutes : '');
                  });
                  dataRows.push(rowData);
              });
          }
      });
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
      XLSX.writeFile(wb, `Timesheet_Export.xlsx`);
      showToast(`Exported successfully`, 'success');
    };
  
    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

            if (jsonData.length === 0) {
                showToast("File is empty", "error");
                return;
            }

            const headers = jsonData[0];
            const isMatrix = headers[0] === 'Category' && headers[1] === 'Subcategory';
            
            let importedCount = 0;

            if (isMatrix) {
                // Matrix Import Logic
                const dateCols: { index: number, date: string }[] = [];
                for (let i = 2; i < headers.length; i++) {
                    const h = headers[i];
                    if (typeof h === 'string' && h.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        dateCols.push({ index: i, date: h });
                    }
                }

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0) continue;

                    const catName = row[0];
                    const subName = row[1];
                    
                    if (!catName) continue;

                    const category = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase());
                    if (!category) continue;

                    let subCategoryId = 'general';
                    if (subName && subName.toString().toLowerCase() !== 'general') {
                        const sub = category.subCategories.find(s => s.name.toLowerCase() === String(subName).toLowerCase());
                        if (sub) subCategoryId = sub.id;
                    }

                    dateCols.forEach(col => {
                        const val = row[col.index];
                        const duration = parseFloat(val);
                        if (duration > 0) {
                             const exists = logs.some(l => 
                                l.userId === currentUser.id &&
                                l.date === col.date &&
                                l.categoryId === category.id &&
                                (l.subCategoryId === subCategoryId || (!l.subCategoryId && subCategoryId === 'general'))
                            );

                            if (!exists) {
                                // Default start time 9:00 AM
                                const startH = 9;
                                const startM = 0;
                                const totalM = startH * 60 + startM + duration;
                                const endH = Math.floor(totalM / 60) % 24;
                                const endM = totalM % 60;
                                const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

                                addLog({
                                    id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    userId: currentUser.id,
                                    date: col.date,
                                    categoryId: category.id,
                                    subCategoryId: subCategoryId === 'general' ? '' : subCategoryId,
                                    startTime: '09:00',
                                    endTime: endTime,
                                    durationMinutes: duration,
                                    notes: 'Imported'
                                });
                                importedCount++;
                            }
                        }
                    });
                }
                if (importedCount > 0) {
                   showToast(`Successfully imported ${importedCount} entries`, 'success');
                } else {
                   showToast('No new entries to import', 'info');
                }
            } else {
                showToast("Invalid format. Please use the export template.", "error");
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
        <RecurringTasksModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} categories={categories} />
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6 sticky top-2 z-10">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto shadow-inner">
                  <button onClick={() => setViewMode('DAILY')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'DAILY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><List size={16} /> Daily</button>
                  <button onClick={() => setViewMode('WEEK')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'WEEK' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><Grid3X3 size={16} /> Weekly</button>
                  <button onClick={() => setViewMode('MONTH')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'MONTH' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><LayoutGrid size={16} /> Monthly</button>
               </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                  <div className="flex w-full md:w-auto gap-2">
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
