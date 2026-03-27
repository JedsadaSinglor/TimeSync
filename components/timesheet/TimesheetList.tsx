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
  onLogClick: (log: TimeLog | null, dateStr: string) => void;
  onDaySettingsClick: (day: { dateObj: Date; config?: DayConfig }) => void;
}

export const TimesheetList: React.FC<TimesheetListProps> = ({
  categories, logsByDate, days, targetUserId, readOnly, hiddenCategoryIds, hiddenSubCategoryIds,
  onLogClick, onDaySettingsClick
}) => {
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getSubCategory = (cat: Category | undefined, id: string) => {
      if (!cat) return null;
      if (id === '' || id === 'general') return { id: 'general', name: 'General', minutes: 0 } as SubCategory;
      return cat.subCategories.find(s => s.id === id) || { id: 'general', name: 'General', minutes: 0 } as SubCategory;
  };

  return (
    <div className="space-y-6 flex-1">
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
          <div key={day.dateStr} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${day.isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center ${day.isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">{day.dayName}</span>
                        <span className="text-lg font-black leading-none">{day.dateObj.getDate()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-base font-black tracking-tight ${day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>
                            {day.dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            {totalMinutes > 0 ? (
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Clock size={12} className="text-indigo-500" />
                                    {(totalMinutes / 60).toFixed(1)}h logged
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-slate-400 italic">No activity logged</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onDaySettingsClick({ dateObj: day.dateObj, config: day.config })} 
                        className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
                        title="Day Settings"
                    >
                        <Settings size={20} />
                    </button>
                    {!readOnly && (
                        <button 
                            onClick={() => onLogClick(null, day.dateStr)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-lg transition-all active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} /> Add
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {dayLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[1.5rem] bg-slate-50/30 dark:bg-slate-800/10">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                            <AlignLeft size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Nothing scheduled for today</p>
                        {!readOnly && (
                            <button 
                                onClick={() => onLogClick(null, day.dateStr)}
                                className="mt-4 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                            >
                                Quick Add Entry
                            </button>
                        )}
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
                                    onClick={() => !readOnly && onLogClick(log, day.dateStr)}
                                    className={`group relative p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${!readOnly ? 'cursor-pointer' : ''}`}
                                >
                                    {/* Category Color Strip */}
                                    <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ backgroundColor: cat.color }}></div>
                                    
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{cat.name}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight mt-1">{subCat.name}</h4>
                                        </div>
                                        <div className="flex flex-col items-end">
                                        </div>
                                    </div>

                                    {log.notes && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium italic leading-relaxed">
                                            "{log.notes}"
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                                <Clock size={14} strokeWidth={2.5} />
                                                <span className="text-xs font-black">{log.durationMinutes}m</span>
                                            </div>
                                            {log.count !== undefined && log.count > 0 && (
                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                    <Hash size={14} strokeWidth={2.5} />
                                                    <span className="text-xs font-black">{log.count}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Plus size={14} strokeWidth={3} />
                                            </div>
                                        </div>
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
    </div>
  );
};
