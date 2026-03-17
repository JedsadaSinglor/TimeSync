import React, { useState, useMemo } from 'react';
import { Category, SubCategory, TimeLog, DayConfig } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { Filter, Plus, Clock, AlignLeft, Settings, Tag, Hash } from 'lucide-react';
import { LogDetailsModal } from './LogDetailsModal';

interface TimesheetListProps {
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

export const TimesheetList: React.FC<TimesheetListProps> = ({
  categories, logsByDate, days, targetUserId, readOnly, hiddenCategoryIds, hiddenSubCategoryIds,
  onUpdateLog, onAddLog, onDeleteLog, showToast, onDaySettingsClick
}) => {
  const [activeLogDetails, setActiveLogDetails] = useState<{ log: TimeLog | null, dateStr: string } | null>(null);

  const handleSaveLogDetails = (updatedLog: Partial<TimeLog>) => {
    if (!activeLogDetails) return;
    const { log, dateStr } = activeLogDetails;
    
    if (log) {
        onUpdateLog({ ...log, ...updatedLog } as TimeLog);
    } else {
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

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getSubCategory = (cat: Category | undefined, id: string) => {
      if (!cat) return null;
      if (id === '' || id === 'general') return { id: 'general', name: 'General', minutes: 0 } as SubCategory;
      return cat.subCategories.find(s => s.id === id) || { id: 'general', name: 'General', minutes: 0 } as SubCategory;
  };

  return (
    <div className="space-y-6">
      {days.map(day => {
        const dayLogs = (logsByDate[day.dateStr] || []).filter(log => {
            if (log.userId !== targetUserId) return false;
            if (hiddenCategoryIds.has(log.categoryId)) return false;
            const subId = log.subCategoryId || 'general';
            if (hiddenSubCategoryIds.has(`${log.categoryId}-${subId}`)) return false;
            return true;
        });

        const totalMinutes = dayLogs.reduce((acc, log) => acc + log.durationMinutes, 0);

        return (
          <div key={day.dateStr} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className={`text-lg font-black ${day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>{day.dayName}</span>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{day.shortDate}</span>
                    </div>
                    {totalMinutes > 0 && (
                        <div className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                            {(totalMinutes / 60).toFixed(1)}h total
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onDaySettingsClick({ dateObj: day.dateObj, config: day.config })} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <Settings size={18} />
                    </button>
                    {!readOnly && (
                        <button 
                            onClick={() => setActiveLogDetails({ log: null, dateStr: day.dateStr })}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                        >
                            <Plus size={16} /> Add Entry
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {dayLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium">
                        No entries for this day.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {dayLogs.map(log => {
                            const cat = getCategory(log.categoryId);
                            const subCat = getSubCategory(cat, log.subCategoryId);
                            if (!cat || !subCat) return null;

                            return (
                                <div 
                                    key={log.id} 
                                    onClick={() => !readOnly && setActiveLogDetails({ log, dateStr: day.dateStr })}
                                    className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all ${!readOnly ? 'cursor-pointer' : ''} group`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{cat.name}</span>
                                        </div>
                                        {!(subCat.minutes && subCat.minutes > 0) && (
                                            <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                                {log.startTime} - {log.endTime}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-base font-black text-slate-800 dark:text-white mb-4">
                                        {subCat.name}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            <span>{log.durationMinutes}m</span>
                                        </div>
                                        {log.count !== undefined && log.count > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Hash size={14} />
                                                <span>{log.count}</span>
                                            </div>
                                        )}
                                        {log.notes && (
                                            <div className="flex items-center gap-1.5">
                                                <AlignLeft size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
          </div>
        );
      })}

      {activeLogDetails && (
        <LogDetailsModal 
            isOpen={!!activeLogDetails}
            onClose={() => setActiveLogDetails(null)}
            log={activeLogDetails.log}
            dateStr={activeLogDetails.dateStr}
            categories={categories}
            onSave={handleSaveLogDetails}
            onDelete={onDeleteLog}
        />
      )}
    </div>
  );
};
