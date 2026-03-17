
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Filter, MessageSquare, X, Settings, Palmtree, Building2, Home, Briefcase, MapPin, ChevronDown } from 'lucide-react';
import { Category, SubCategory, TimeLog, DayConfig } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { LogDetailsModal } from './LogDetailsModal';
import { TimesheetRow, GridInputCell } from './TimesheetGridComponents';

// --- Types ---
interface TimesheetTableProps {
  categories: Category[];
  logsByDate: Record<string, TimeLog[]>;
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

// --- Main Component ---

export const TimesheetTable: React.FC<TimesheetTableProps> = ({ 
    categories, logsByDate, days, targetUserId, readOnly, hiddenCategoryIds, hiddenSubCategoryIds, 
    onUpdateLog, onAddLog, onDeleteLog, showToast, onDaySettingsClick 
}) => {
  const [activeLogDetails, setActiveLogDetails] = useState<{ log: TimeLog | null, dateStr: string, category: Category, subCategory: SubCategory } | null>(null);
  const [expandedMobileRows, setExpandedMobileRows] = useState<Set<string>>(new Set());

  const toggleMobileRow = (key: string) => {
      setExpandedMobileRows(prev => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key); else next.add(key);
          return next;
      });
  };

  // Optimize Data Preparation (O(VisibleDays * LogsPerDay))
  const { logsMap, rowTotalsMap } = useMemo(() => {
    const map = new Map<string, TimeLog>();
    const totals = new Map<string, number>(); 
    
    // Iterate only visible days
    for (const day of days) {
        const dayLogs = logsByDate[day.dateStr];
        if (!dayLogs) continue;

        for (const log of dayLogs) {
            if (log.userId !== targetUserId) continue;

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
    }
    return { logsMap: map, rowTotalsMap: totals };
  }, [logsByDate, targetUserId, days]);

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

  const openLogDetails = useCallback((dateStr: string, category: Category, subCategory: SubCategory) => {
    const subId = subCategory.id === 'general' ? '' : subCategory.id;
    const lookupKey = `${dateStr}_${category.id}_${subId || 'general'}`;
    const existingLog = logsMap.get(lookupKey) || null;
    setActiveLogDetails({ log: existingLog, dateStr, category, subCategory });
  }, [logsMap]);

  const handleSaveLogDetails = (updatedLog: Partial<TimeLog>) => {
    if (!activeLogDetails) return;
    const { log, dateStr } = activeLogDetails;
    
    if (log) {
        onUpdateLog({ ...log, ...updatedLog } as TimeLog);
    } else {
        // Create new log
        onAddLog({
            id: Date.now().toString(),
            userId: targetUserId,
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
            {days.map((d) => {
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
                  <td colSpan={days.length + 5} className="p-4">
                      <EmptyState 
                        icon={Filter} 
                        title="No activities visible" 
                        description="Use the filter icon to enable categories or subcategories." 
                        className="border-none bg-transparent shadow-none"
                      />
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
                openNoteModal={openLogDetails}
                onDoubleClick={openLogDetails}
              />
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile View (simplified) */}
    <div className="md:hidden space-y-4">
       {gridRows.map(row => {
          const rowTotal = rowTotalsMap.get(row.key) || 0;
          const isExpanded = expandedMobileRows.has(row.key);
          
          return (
             <div key={row.key} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: row.category.color }}></div>
                <div 
                    className="flex justify-between items-center p-5 pl-6 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
                    onClick={() => toggleMobileRow(row.key)}
                >
                   <div className="flex-1 pr-4">
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">{row.category.name}</div>
                      <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">{row.subCategory.name}</div>
                   </div>
                   <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Total</span>
                            <span className="text-lg font-black text-slate-800 dark:text-white">{(rowTotal/60).toFixed(1)}<span className="text-[10px] ml-0.5 text-slate-400">h</span></span>
                        </div>
                        <div className={`w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}>
                            <ChevronDown size={20} />
                        </div>
                   </div>
                </div>
                
                {isExpanded && (
                    <div className="space-y-4 p-5 pl-6 pt-2 animate-fade-in border-t border-slate-100 dark:border-slate-800/50 mt-2">
                   {days.map((d) => {
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
                        <div key={d.dateStr} className={`flex items-center justify-between p-3 rounded-2xl border ${d.isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'border-slate-100 dark:border-slate-800'}`}>
                           <div className="flex items-center gap-4 flex-1">
                              <button onClick={() => onDaySettingsClick({ dateObj: d.dateObj, config: d.config })} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors shrink-0">
                                <Settings size={18}/>
                              </button>
                              <div className="flex flex-col">
                                  <span className={`text-sm font-black ${d.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{d.dayName}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{d.shortDate}</span>
                              </div>
                           </div>
                           <div className="w-32 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden shadow-sm">
                               <GridInputCell 
                                  value={displayValue} isQty={isQtyMode}
                                  onChange={(val) => handleCellChange(d.dateStr, row.category, row.subCategory, val)} 
                                  placeholder="-" disabled={readOnly}
                                  hasNotes={!!log?.notes} onNotesClick={() => openLogDetails(d.dateStr, row.category, row.subCategory)}
                                  onDoubleClick={() => openLogDetails(d.dateStr, row.category, row.subCategory)}
                               />
                           </div>
                        </div>
                      );
                   })}
                </div>
                )}
             </div>
          );
       })}
       {gridRows.length === 0 && (
          <EmptyState 
            icon={Filter} 
            title="No activities visible" 
            description="Tap the filter icon to enable activities." 
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
       )}
    </div>
      
    {activeLogDetails && (
        <LogDetailsModal 
            isOpen={!!activeLogDetails}
            onClose={() => setActiveLogDetails(null)}
            log={activeLogDetails.log}
            dateStr={activeLogDetails.dateStr}
            categories={categories}
            initialCategory={activeLogDetails.category}
            initialSubCategory={activeLogDetails.subCategory}
            onSave={handleSaveLogDetails}
            onDelete={onDeleteLog}
        />
    )}
    </>
  );
};
