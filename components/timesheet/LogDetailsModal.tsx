import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Trash2, Clock, Hash, AlignLeft, Calendar, Layers, Check } from 'lucide-react';
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
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('general');
    const [duration, setDuration] = useState<number>(0);
    const [durationInput, setDurationInput] = useState<string>('00:00');
    const [count, setCount] = useState<number | undefined>(undefined);
    const [notes, setNotes] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('09:00');
    const [endTime, setEndTime] = useState<string>('10:00');

    const inputRef = useRef<HTMLInputElement>(null);

    const minutesToHHMM = (mins: number): string => {
        if (isNaN(mins) || mins < 0) return '00:00';
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

    // Initialization Effect
    useEffect(() => {
        if (isOpen) {
            const safeCatId = log?.categoryId || initialCategory?.id || (categories.length > 0 ? categories[0].id : '');
            const safeSubId = log?.subCategoryId || initialSubCategory?.id || 'general';
            
            setSelectedCategoryId(safeCatId);
            setSelectedSubCategoryId(safeSubId);
            
            const mins = log?.durationMinutes || 0;
            setDuration(mins);
            setDurationInput(minutesToHHMM(mins));
            
            const cat = categories.find(c => c.id === safeCatId);
            const sub = safeSubId === 'general' ? { minutes: 0 } : cat?.subCategories.find(s => s.id === safeSubId);
            const initialIsQtyMode = (sub?.minutes || 0) > 0;
            
            setCount(log?.count || (initialIsQtyMode ? 1 : undefined));
            setNotes(log?.notes || '');
            setStartTime(log?.startTime || '09:00');
            setEndTime(log?.endTime || '10:00');

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, log, initialCategory, initialSubCategory, categories]);

    // Quantity Mode Sync Effect
    useEffect(() => {
        if (isQtyMode) {
            const newMins = (count || 0) * (selectedSubCategory?.minutes || 0);
            setDuration(newMins);
            setDurationInput(minutesToHHMM(newMins));
        }
    }, [isQtyMode, count, selectedSubCategory?.minutes]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleDurationChange = (val: string) => {
        setDurationInput(val);
        if (/^\d{1,3}:[0-5]\d$/.test(val)) {
            setDuration(hhmmToMinutes(val));
        }
    };

    const handleSave = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedCategory) return;
        
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
            count: count, // เสมอบันทึก Count ถ้ามีการกรอก
            notes: notes.trim(),
            startTime,
            endTime
        });
    };

    const handleDelete = () => {
        if (log && window.confirm('Are you sure you want to delete this log entry?')) {
            onDelete(log.id);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl animate-scale-up flex flex-col overflow-hidden max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 md:px-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            {log ? 'Edit Activity' : 'Log Activity'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-slate-500 dark:text-slate-400">
                            <Calendar size={14} className="text-indigo-500" />
                            {/* ป้องกันบั๊ก [object Object] ให้ปลอดภัยที่สุด */}
                            <span className="text-sm font-bold">{typeof dateStr === 'string' ? dateStr : 'Invalid Date'}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        aria-label="Close modal"
                        className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Form) */}
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="p-6 md:p-8 space-y-8 flex-1">
                        
                        {/* Category & Subcategory Selection */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Category</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {categories.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategoryId(c.id);
                                                setSelectedSubCategoryId('general');
                                            }}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 border ${selectedCategoryId === c.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md transform scale-105' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: c.color }}></div>
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {selectedCategory && selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
                                <div className="space-y-3 animate-fade-in pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-1.5">
                                        <Layers size={12} /> Sub-Category
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSubCategoryId('general')}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedSubCategoryId === 'general' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/50 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            General
                                        </button>
                                        {selectedCategory.subCategories.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setSelectedSubCategoryId(s.id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedSubCategoryId === s.id ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/50 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area: แสดง Attempts เสมอ */}
                        <div className="p-5 bg-[#f8f9fa] dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <div className="grid grid-cols-2 gap-5">
                                
                                {/* 1. Attempts Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] pl-1">
                                        Attempts
                                    </label>
                                    <div className="relative">
                                        <Hash size={18} className="absolute left-3.5 top-3.5 text-indigo-500" />
                                        <input 
                                            ref={inputRef}
                                            type="number" 
                                            min="0"
                                            value={count || ''} 
                                            onChange={e => setCount(Number(e.target.value))} 
                                            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" 
                                            placeholder="0" 
                                        />
                                    </div>
                                </div>

                                {/* 2. Duration Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] pl-1">
                                        {isQtyMode ? 'Auto Duration' : 'Duration (HH:MM)'}
                                    </label>
                                    <div className={`relative ${isQtyMode ? 'opacity-70' : ''}`}>
                                        <Clock size={18} className={`absolute left-3.5 top-3.5 ${isQtyMode ? 'text-slate-400' : 'text-indigo-500'}`} />
                                        <input 
                                            type="text" 
                                            value={String(durationInput)} 
                                            onChange={e => !isQtyMode && handleDurationChange(e.target.value)} 
                                            disabled={isQtyMode} 
                                            className={`w-full pl-10 pr-4 py-3.5 border rounded-xl text-sm font-bold outline-none transition-all shadow-sm ${
                                                isQtyMode 
                                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                                            }`}
                                            placeholder="00:00"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Notes Area */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-1.5">
                                <AlignLeft size={12} /> Notes & Details
                            </label>
                            <textarea 
                                value={String(notes)} 
                                onChange={e => setNotes(e.target.value)} 
                                className="w-full px-4 py-3.5 bg-[#f8f9fa] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-y placeholder:text-slate-400" 
                                placeholder="What did you work on?" 
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between px-6 py-5 md:px-8 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-[#f8f9fa]/50 dark:bg-slate-900/50">
                        {log ? (
                            <button 
                                type="button"
                                onClick={handleDelete} 
                                className="flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl transition-colors font-bold text-sm focus-visible:ring-2 focus-visible:ring-rose-400 outline-none" 
                                title="Delete Log"
                            >
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        ) : (
                            <div /> 
                        )}
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all hover:-translate-y-0.5 active:scale-95 focus-visible:ring-4 focus-visible:ring-indigo-500/30 outline-none"
                            >
                                <Check size={18} /> Save Entry
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};