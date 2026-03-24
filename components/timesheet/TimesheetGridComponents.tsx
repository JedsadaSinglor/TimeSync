import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { Category, SubCategory, TimeLog, DayConfig } from '../../types';

// --- GridInputCell ---
export const GridInputCell: React.FC<{
  value: string | number;
  onChange: (val: string) => void;
  isQty: boolean;
  placeholder?: string;
  disabled?: boolean;
  hasNotes?: boolean;
  onNotesClick?: () => void;
  onDoubleClick?: () => void;
}> = React.memo(({ value, onChange, isQty, placeholder, disabled, hasNotes, onNotesClick, onDoubleClick }) => {
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
        inputMode="decimal"
        min="0"
        disabled={disabled}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={commitChange}
        onKeyDown={handleKeyDown}
        onDoubleClick={onDoubleClick}
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

// --- TimesheetCell ---
export interface TimesheetCellProps {
  day: { dateObj: Date; dateStr: string; isToday: boolean; config?: DayConfig };
  category: Category;
  subCategory: SubCategory;
  log?: TimeLog;
  readOnly: boolean;
  onCellChange: (dateStr: string, category: Category, subCategory: SubCategory, val: string) => void;
  onNoteClick: (dateStr: string, category: Category, subCategory: SubCategory) => void;
  onDoubleClick: (dateStr: string, category: Category, subCategory: SubCategory) => void;
}

const areTimesheetCellPropsEqual = (prev: TimesheetCellProps, next: TimesheetCellProps) => {
    if (prev.day.dateStr !== next.day.dateStr) return false;
    if (prev.day.isToday !== next.day.isToday) return false;
    if (prev.day.config?.isHoliday !== next.day.config?.isHoliday) return false;
    if (prev.day.config?.isWorkingDay !== next.day.config?.isWorkingDay) return false;
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

export const TimesheetCell = React.memo(({ day, category, subCategory, log, readOnly, onCellChange, onNoteClick, onDoubleClick }: TimesheetCellProps) => {
  const isQtyMode = (subCategory.minutes || 0) > 0;
  
  const displayValue = useMemo(() => {
      if (isQtyMode) {
          if (log?.count !== undefined && log.count !== null) return log.count;
          if (log?.durationMinutes && subCategory.minutes) return Math.round((log.durationMinutes / subCategory.minutes) * 10) / 10;
          return 0;
      }
      return log?.durationMinutes || 0;
  }, [isQtyMode, log, subCategory.minutes]);

  const handleChange = useCallback((val: string) => onCellChange(day.dateStr, category, subCategory, val), [day.dateStr, category, subCategory, onCellChange]);
  const handleNoteClick = useCallback(() => onNoteClick(day.dateStr, category, subCategory), [day.dateStr, category, subCategory, onNoteClick]);
  const handleDoubleClick = useCallback(() => onDoubleClick(day.dateStr, category, subCategory), [day.dateStr, category, subCategory, onDoubleClick]);

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
        onDoubleClick={handleDoubleClick}
      />
    </td>
  );
}, areTimesheetCellPropsEqual);

// --- TimesheetRow ---
export interface TimesheetRowProps {
  row: { category: Category; subCategory: SubCategory; key: string };
  days: { dateObj: Date; dateStr: string; isToday: boolean; config?: DayConfig }[];
  logsMap: Map<string, TimeLog>;
  rowTotal: number;
  readOnly: boolean;
  onCellChange: (dateStr: string, category: Category, subCategory: SubCategory, val: string) => void;
  openNoteModal: (dateStr: string, category: Category, subCategory: SubCategory) => void;
  onDoubleClick: (dateStr: string, category: Category, subCategory: SubCategory) => void;
  isCategoryColVisible: boolean; // <-- เพิ่ม Prop นี้
}

const areTimesheetRowPropsEqual = (prev: TimesheetRowProps, next: TimesheetRowProps) => {
    if (prev.row.key !== next.row.key) return false;
    if (prev.rowTotal !== next.rowTotal) return false;
    if (prev.readOnly !== next.readOnly) return false;
    if (prev.isCategoryColVisible !== next.isCategoryColVisible) return false; // <-- เช็คการเปลี่ยนแปลงของ Prop
    if (prev.days !== next.days) return false;
    
    for (const d of prev.days) {
        const subId = prev.row.subCategory.id === 'general' ? '' : prev.row.subCategory.id;
        const key = `${d.dateStr}_${prev.row.category.id}_${subId || 'general'}`;
        const pLog = prev.logsMap.get(key);
        const nLog = next.logsMap.get(key);
        if (pLog !== nLog) return false;
    }
    return true;
};

export const TimesheetRow = React.memo(({ row, days, logsMap, rowTotal, readOnly, onCellChange, openNoteModal, onDoubleClick, isCategoryColVisible }: TimesheetRowProps) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group even:bg-slate-50/30 dark:even:bg-slate-800/20">
            
            {/* คอลัมน์แถบสีซ้ายสุด */}
            <td className="bg-white dark:bg-slate-900 border-r border-b border-slate-200/60 dark:border-slate-700/60 p-0 sticky left-0 z-10 min-w-[40px] max-w-[40px] transition-colors">
                 <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: row.category.color }}></div>
            </td>

            {/* คอลัมน์ Category (แสดง/ซ่อน ตาม isCategoryColVisible) */}
            {isCategoryColVisible && (
                <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky left-[40px] z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.02)] transition-colors w-[200px] min-w-[200px] max-w-[200px]">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={row.category.name}>{row.category.name}</div>
                </td>
            )}

            {/* คอลัมน์ Subcategory (ปรับ left position ตาม isCategoryColVisible) */}
            <td className={`border-r border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 sticky z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.02)] transition-all w-[200px] min-w-[200px] max-w-[200px] ${isCategoryColVisible ? 'left-[240px]' : 'left-[40px]'}`}>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate" title={row.subCategory.name}>{row.subCategory.name}</div>
            </td>

            {/* คอลัมน์ Default */}
            <td className="border-r border-b border-slate-200/60 dark:border-slate-700/60 px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 font-mono">
                {row.subCategory.minutes ? `${row.subCategory.minutes}m` : '-'}
            </td>

            {/* คอลัมน์วันที่ (TimesheetCell) */}
            {days.map((d) => {
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
                        onDoubleClick={onDoubleClick}
                    />
                );
            })}

            {/* คอลัมน์ Total */}
            <td className="border-l border-b border-slate-200/60 dark:border-slate-700/60 px-3 text-center text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky right-0 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                {rowTotal > 0 ? (rowTotal/60).toFixed(1) : '-'}
            </td>
        </tr>
    );
}, areTimesheetRowPropsEqual);