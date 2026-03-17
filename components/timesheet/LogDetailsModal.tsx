import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, Clock, Hash, AlignLeft, Calendar, Tag, Layers } from 'lucide-react';
import { TimeLog, Category, SubCategory } from '../../types';

interface LogDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: TimeLog | null;
    dateStr: string;
    categories: Category[];
    initialCategory?: Category;
    initialSubCategory?: SubCategory;
    onSave: (log: Partial<TimeLog>) => void;
    onDelete: (id: string) => void;
}

export const LogDetailsModal: React.FC<LogDetailsModalProps> = ({
    isOpen, onClose, log, dateStr, categories, initialCategory, initialSubCategory, onSave, onDelete
}) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
    const [duration, setDuration] = useState<number>(0);
    const [count, setCount] = useState<number | undefined>(undefined);
    const [notes, setNotes] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('09:00');
    const [endTime, setEndTime] = useState<string>('10:00');

    useEffect(() => {
        if (isOpen) {
            setSelectedCategoryId(log?.categoryId || initialCategory?.id || (categories.length > 0 ? categories[0].id : ''));
            setSelectedSubCategoryId(log?.subCategoryId || initialSubCategory?.id || 'general');
            setDuration(log?.durationMinutes || 0);
            setCount(log?.count);
            setNotes(log?.notes || '');
            setStartTime(log?.startTime || '09:00');
            setEndTime(log?.endTime || '10:00');
        }
    }, [isOpen, log, initialCategory, initialSubCategory, categories]);

    const selectedCategory = useMemo(() => categories.find(c => c.id === selectedCategoryId), [categories, selectedCategoryId]);
    const selectedSubCategory = useMemo(() => {
        if (!selectedCategory) return null;
        if (selectedSubCategoryId === 'general') return { id: 'general', name: 'General', minutes: 0 } as SubCategory;
        return selectedCategory.subCategories.find(s => s.id === selectedSubCategoryId) || { id: 'general', name: 'General', minutes: 0 } as SubCategory;
    }, [selectedCategory, selectedSubCategoryId]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedCategory) return;
        onSave({
            ...log,
            date: dateStr,
            categoryId: selectedCategory.id,
            subCategoryId: selectedSubCategory?.id === 'general' ? undefined : selectedSubCategory?.id,
            durationMinutes: duration,
            count: count,
            notes: notes,
            startTime,
            endTime
        });
        onClose();
    };

    const handleDelete = () => {
        if (log) {
            onDelete(log.id);
            onClose();
        }
    };

    const isQtyMode = (selectedSubCategory?.minutes || 0) > 0;

    useEffect(() => {
        if (isQtyMode) {
            setDuration((count || 0) * (selectedSubCategory?.minutes || 0));
        }
    }, [isQtyMode, count, selectedSubCategory?.minutes]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">{log ? 'Edit Entry' : 'New Entry'}</h3>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                            <Calendar size={14} />
                            <span className="text-sm font-medium">{dateStr}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <Tag size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                <select 
                                    value={selectedCategoryId} 
                                    onChange={e => {
                                        setSelectedCategoryId(e.target.value);
                                        setSelectedSubCategoryId('general');
                                    }} 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-Category</label>
                            <div className="relative">
                                <Layers size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                <select 
                                    value={selectedSubCategoryId} 
                                    onChange={e => setSelectedSubCategoryId(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                >
                                    <option value="general">General</option>
                                    {selectedCategory?.subCategories?.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        {!isQtyMode && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {isQtyMode ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attempt (Count)</label>
                                        <div className="relative">
                                            <Hash size={18} className="absolute left-3.5 top-3 text-indigo-500" />
                                            <input type="number" value={count || ''} onChange={e => {
                                                setCount(Number(e.target.value));
                                            }} className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="Qty" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Duration (min)</label>
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input type="number" value={duration} disabled className="w-full pl-10 pr-3 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (min)</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                        <div className="relative">
                            <AlignLeft size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-none" placeholder="Add details..." />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {log && (
                        <button onClick={handleDelete} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Delete Log">
                            <Trash2 size={20} />
                        </button>
                    )}
                    <div className="flex-1"></div>
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-95">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
