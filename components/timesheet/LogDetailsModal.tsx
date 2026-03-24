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
    const [durationInput, setDurationInput] = useState<string>('00:00');
    const [count, setCount] = useState<number | undefined>(undefined);
    const [notes, setNotes] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('09:00');
    const [endTime, setEndTime] = useState<string>('10:00');

    const minutesToHHMM = (mins: number): string => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const hhmmToMinutes = (hhmm: string): number => {
        const parts = hhmm.split(':');
        if (parts.length !== 2) return 0;
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
    };

    const selectedCategory = useMemo(() => categories.find(c => c.id === selectedCategoryId), [categories, selectedCategoryId]);
    const selectedSubCategory = useMemo(() => {
        if (!selectedCategory) return null;
        if (selectedSubCategoryId === 'general') return { id: 'general', name: 'General', minutes: 0 } as SubCategory;
        return selectedCategory.subCategories.find(s => s.id === selectedSubCategoryId) || { id: 'general', name: 'General', minutes: 0 } as SubCategory;
    }, [selectedCategory, selectedSubCategoryId]);

    const isQtyMode = (selectedSubCategory?.minutes || 0) > 0;

    useEffect(() => {
        if (isOpen) {
            const catId = log?.categoryId || initialCategory?.id || (categories.length > 0 ? categories[0].id : '');
            const subId = log?.subCategoryId || initialSubCategory?.id || 'general';
            
            setSelectedCategoryId(catId);
            setSelectedSubCategoryId(subId);
            
            const mins = log?.durationMinutes || 0;
            setDuration(mins);
            setDurationInput(minutesToHHMM(mins));
            
            // Determine if the initial selection is qty mode to set default count
            const cat = categories.find(c => c.id === catId);
            const sub = subId === 'general' ? { minutes: 0 } : cat?.subCategories.find(s => s.id === subId);
            const initialIsQtyMode = (sub?.minutes || 0) > 0;
            
            setCount(log?.count || (initialIsQtyMode ? 1 : undefined));
            setNotes(log?.notes || '');
            setStartTime(log?.startTime || '09:00');
            setEndTime(log?.endTime || '10:00');
        }
    }, [isOpen, log, initialCategory, initialSubCategory, categories]);

    useEffect(() => {
        if (isQtyMode) {
            const newMins = (count || 0) * (selectedSubCategory?.minutes || 0);
            setDuration(newMins);
            setDurationInput(minutesToHHMM(newMins));
        }
    }, [isQtyMode, count, selectedSubCategory?.minutes]);

    const handleDurationChange = (val: string) => {
        setDurationInput(val);
        // Only update numeric duration if it's a valid hh:mm format
        if (/^\d{1,3}:[0-5]\d$/.test(val)) {
            setDuration(hhmmToMinutes(val));
        }
    };

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedCategory) return;
        
        // Final sync of duration from input if valid
        let finalDuration = duration;
        if (/^\d{1,3}:[0-5]\d$/.test(durationInput)) {
            finalDuration = hhmmToMinutes(durationInput);
        }

        onSave({
            ...log,
            date: dateStr,
            categoryId: selectedCategory.id,
            subCategoryId: selectedSubCategory?.id === 'general' ? undefined : selectedSubCategory?.id,
            durationMinutes: finalDuration,
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg animate-scale-up max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden flex flex-col relative">
                <div className="flex justify-between items-center px-6 py-5 sm:px-8 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">{log ? 'Edit Activity' : 'Log Activity'}</h3>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                            <Calendar size={14} />
                            <span className="text-sm font-medium">{dateStr}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedCategoryId(c.id);
                                            setSelectedSubCategoryId('general');
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${selectedCategoryId === c.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {selectedCategory && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Sub-Category</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedSubCategoryId('general')}
                                        className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${selectedSubCategoryId === 'general' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        General
                                    </button>
                                    {selectedCategory.subCategories.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedSubCategoryId(s.id)}
                                            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${selectedSubCategoryId === s.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            {isQtyMode ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Sessions</label>
                                        <div className="relative">
                                            <Hash size={18} className="absolute left-3.5 top-3 text-indigo-500" />
                                            <input type="number" value={count || ''} onChange={e => {
                                                setCount(Number(e.target.value));
                                            }} className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Duration</label>
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input type="text" value={durationInput} disabled className="w-full pl-10 pr-3 py-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Duration</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={durationInput} 
                                            onChange={e => handleDurationChange(e.target.value)} 
                                            className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                            placeholder="00:00"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Notes</label>
                        <div className="relative">
                            <AlignLeft size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-none" placeholder="Add details..." />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-4 sm:px-8 sm:pb-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    {log && (
                        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm mr-auto" title="Delete Log">
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
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
