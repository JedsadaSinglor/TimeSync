
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Filter, MessageSquare, X, Settings, Palmtree, Building2, Home, Briefcase, MapPin } from 'lucide-react';
import { Category, SubCategory, TimeLog, DayConfig } from '../../types';

// --- Types ---
interface TimesheetTableProps {
  categories: Category[];
  logs: TimeLog[];
  days: { dateObj: Date; dateStr: string; dayName: string; shortDate: string; isToday: boolean; config?: DayConfig }[];
  targetUserId: string;
  readOnly: boolean;
  hiddenCategoryIds: Set<string>;
  hiddenSubCategoryIds: Set<string>;
  onUpdateLog: (log: TimeLog) => void;
  onAddLog: (log: TimeLog) => void;
  onDeleteLog: (id: string) => void;
  showToast: (msg: string) => void;
  onDaySettingsClick: (day: { dateObj: Date; config?: DayConfig }) => void;
}

// --- Sub-Components ---

const GridInputCell: React.FC<{
  value: string | number;
  onChange: (val: string) => void;
  isQty: boolean;
  placeholder?: string;
  disabled?: boolean;
  hasNotes?: boolean;
  onNotesClick?: () => void;
}> = React.memo(({ value, onChange, isQty, placeholder, disabled, hasNotes, onNotesClick }) => {
  // Local state to prevent re-render on every keystroke in parent
  const [localValue, setLocalValue] = useState<string | number>(value === 0 ? '' : value);

  useEffect(() => {
    setLocalValue(value === 0 ? '' : value);
  }, [value]);

  const commitChange = () => {
    const stringVal = String(localValue);
    const currentPropVal = value === 0 ? '' : String(value);
    // Only fire onChange if value actually changed numerically
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

// Comparison function for TimesheetCell to prevent unnecessary re-renders
const areTimesheetCellPropsEqual = (prev: any, next: any) => {
    if (prev.day.dateStr !== next.day.dateStr) return false;
    if (prev.day.isToday !== next.day.isToday) return false;
    if (prev.day.config?.isHoliday !== next.day.config?.isHoliday) return false;
    if (prev.day.config?.isWorkingDay !== next.day.config?.isWorkingDay) return false;
    // Log comparison
    const pLog = prev.log;
    const nLog = next.log;
    if (pLog === nLog) return true; // Reference equality
    if (!pLog || !nLog) return false; // One is missing
    return (
        pLog.durationMinutes === nLog.durationMinutes &&
        pLog.count === nLog.count &&
        pLog.notes === nLog.notes
    );
};

const TimesheetCell = React.memo(({ day, category, subCategory, log, readOnly, onCellChange, onNoteClick }: any) => {
  const isQtyMode = (subCategory.minutes || 0) > 0;
  
  const displayValue = useMemo(() => {
      if (isQtyMode) {
          if (log?.count !== undefined && log.count !== null) return log.count;
          if (log?.durationMinutes && subCategory.minutes) return Math.round((log.durationMinutes / subCategory.minutes) * 10) / 10;
          return 0;
      }
      return log?.durationMinutes || 0;
  }, [isQtyMode, log, subCategory.minutes]);

  // Stable handlers
  const handleChange = useCallback((val: string) => onCellChange(day.dateStr, category, subCategory, val), [day.dateStr, category, subCategory, onCellChange]);
  const handleNoteClick = useCallback(() => onNoteClick(day.dateStr, category, subCategory), [day.dateStr, category, subCategory, onNoteClick]);

  // Style logic
  const isWeekend = day.dateObj.getDay() === 0 || day.dateObj.getDay() === 6;
  const isHoliday = day.config?.isHoliday;
  const isWorkingWeekend = day.config?.isWorkingDay;

  let bgClass = '';
  if (day.isToday) bgClass = 'bg-indigo-50/10 dark:bg-indigo-900/5';
  else if (isHoliday) bgClass = 'bg-red-50/40 dark:bg-red-900/10';
  else if (isWeekend && !isWorkingWeekend) bgClass = 'bg-slate-50/40 dark:bg-slate-800/40';
  else if (isWorkingWeekend) bgClass = 'bg-amber-50/30 dark:bg-amber-900/10';

  if (readOnly) bgClass = 'bg-slate-50/50 dark:bg-slate-900/50';

  return (
    <td className={`border border-slate-200/60 dark:border-slate-700/60 p-0 h-11 min-w-[60px] relative ${bgClass}`}>
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

const TimesheetRow = React.memo(({ row, days, logsMap, rowTotal, readOnly, onCellChange, openNoteModal }: any) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group even:bg-slate-50/30 dark:even:bg-slate-800/20">
            <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-0 z-10 p-0 transition-colors"></td>
            <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-10 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.02)] transition-colors" style={{ borderLeft: `4px solid ${row.category.color}` }}>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={row.category.name}>{row.category.name}</div>
            </td>
            <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-[210px] z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.02)] transition-colors">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate" title={row.subCategory.name}>{row.subCategory.name}</div>
            </td>
            <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 font-mono">
                {row.subCategory.minutes ? `${row.subCategory.minutes}m` : '-'}
            </td>
            {days.map((d: any) => {
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
                        onCellChange={onCellChange}
                        onNoteClick={openNoteModal}
                    />
                );
            })}
            <td className="border-l border-b border-slate-200/60 dark:border-slate-700/60 px-3 text-center text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky right-0 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                {rowTotal > 0 ? (rowTotal/60).toFixed(1) : '-'}
            </td>
        </tr>
    );
});

// --- Main Component ---

export const TimesheetTable: React.FC<TimesheetTableProps> = ({ 
    categories, logs, days, targetUserId, readOnly, hiddenCategoryIds, hiddenSubCategoryIds, 
    onUpdateLog, onAddLog, onDeleteLog, showToast, onDaySettingsClick 
}) => {
  const [activeNoteCell, setActiveNoteCell] = useState<{ log: TimeLog | null, dateStr: string, catId: string, subId: string } | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Optimize Data Preparation (O(N) single pass)
  const { logsMap, rowTotalsMap } = useMemo(() => {
    const map = new Map<string, TimeLog>();
    const totals = new Map<string, number>(); 
    
    // Create Set for O(1) date lookup
    const visibleDates = new Set(days.map(d => d.dateStr));

    for (const log of logs) {
        if (log.userId !== targetUserId) continue;
        if (!visibleDates.has(log.date)) continue;

        const subId = log.subCategoryId || 'general';
        const lookupKey = `${log.date}_${log.categoryId}_${subId}`;
        const rowKey = `${log.categoryId}-${subId}`;

        if (map.has(lookupKey)) {
           const existing = map.get(lookupKey)!;
           map.set(lookupKey, {
               ...existing,
               durationMinutes: existing.durationMinutes + log.durationMinutes,
               count: (existing.count || 0) + (log.count || 0),
               notes: existing.notes ? `${existing.notes}; ${log.notes}` : log.notes
           });
        } else {
           map.set(lookupKey, { ...log }); 
        }

        totals.set(rowKey, (totals.get(rowKey) || 0) + log.durationMinutes);
    }
    return { logsMap: map, rowTotalsMap: totals };
  }, [logs, targetUserId, days]); // Only recalculate if logs or visible days change

  const gridRows = useMemo(() => {
      const rows: { category: Category; subCategory: SubCategory; key: string }[] = [];
      categories.forEach(cat => {
          if (hiddenCategoryIds.has(cat.id)) return;
          if (cat.subCategories && cat.subCategories.length > 0) {
              cat.subCategories.forEach(sub => {
                  if (hiddenSubCategoryIds.has(`${cat.id}-${sub.id}`)) return;
                  rows.push({ category: cat, subCategory: sub, key: `${cat.id}-${sub.id}` });
              });
          } else {
               rows.push({ category: cat, subCategory: { id: 'general', name: 'General', minutes: 0 }, key: `${cat.id}-general` });
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
    if (log) onUpdateLog({ ...log, notes: noteContent });
    else if (noteContent.trim()) {
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

  const colMinWidth = days.length > 10 ? 'min-w-[70px]' : 'min-w-[100px]';

  return (
    <>
    {/* Desktop View */}
    <div className="hidden md:block overflow-auto border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm bg-white dark:bg-slate-900 relative max-h-[75vh] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
      <table className="w-full text-left border-collapse min-w-max">
        <thead>
          <tr>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-2 text-center w-10 sticky left-0 z-20"></th>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px] sticky left-10 z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Category</th>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[160px] sticky left-[210px] z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Subcategory</th>
            <th className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-r border-slate-200 dark:border-slate-700 p-4 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24">Default</th>
            {days.map((d: any) => {
                const isHoliday = d.config?.isHoliday;
                const loc = d.config?.workLocation || 'WFO';
                let headerBg = d.isToday ? 'bg-indigo-50/80 dark:bg-indigo-900/30' : 'bg-slate-50/80 dark:bg-slate-800/80';
                if(isHoliday) headerBg = 'bg-red-50/80 dark:bg-red-900/20';

                return (
                <th 
                    key={d.dateStr} 
                    className={`border-b border-r border-slate-200 dark:border-slate-700 p-2 text-center ${colMinWidth} ${headerBg} backdrop-blur-sm cursor-pointer group hover:bg-opacity-100 transition-colors`}
                    onClick={() => onDaySettingsClick({ dateObj: d.dateObj, config: d.config })}
                >
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                        <div className={`text-xs font-bold ${isHoliday ? 'text-red-500' : (d.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300')}`}>{d.dayName}</div>
                        <div className={`text-[10px] font-semibold ${isHoliday ? 'text-red-400' : (d.isToday ? 'text-indigo-500 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500')}`}>{d.shortDate}</div>
                        
                        <div className="mt-1">
                            {isHoliday ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500" title={d.config?.holidayName || 'Holiday'}>
                                    <Palmtree size={12} />
                                </span>
                            ) : (
                                (!d.dateObj.getDay() || d.dateObj.getDay() === 6) && !d.config?.isWorkingDay ? null : (
                                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${loc === 'WFO' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : loc === 'WFH' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {loc === 'WFO' && <Building2 size={12}/>}
                                        {loc === 'WFH' && <Home size={12}/>}
                                        {loc === 'SITE' && <Briefcase size={12}/>}
                                        {loc === 'OTHER' && <MapPin size={12}/>}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </th>
                )
            })}
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
          {gridRows.map((row) => (
              <TimesheetRow 
                key={row.key} 
                row={row} 
                days={days} 
                logsMap={logsMap} 
                rowTotal={rowTotalsMap.get(row.key) || 0}
                readOnly={readOnly}
                onCellChange={handleCellChange}
                openNoteModal={openNoteModal}
              />
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile View (simplified) */}
    <div className="md:hidden space-y-6">
       {gridRows.map(row => {
          const rowTotal = rowTotalsMap.get(row.key) || 0;
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
                   {days.map((d: any) => {
                      const subId = row.subCategory.id === 'general' ? '' : row.subCategory.id;
                      const key = `${d.dateStr}_${row.category.id}_${subId || 'general'}`;
                      const log = logsMap.get(key);
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
                           <div className="flex items-center gap-2">
                              <button onClick={() => onDaySettingsClick({ dateObj: d.dateObj, config: d.config })} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500">
                                <Settings size={14}/>
                              </button>
                              <div className="flex flex-col">
                                  <span className={`text-xs font-bold ${d.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{d.dayName}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{d.shortDate}</span>
                              </div>
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
