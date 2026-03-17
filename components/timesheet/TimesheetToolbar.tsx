import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, List, Grid3X3, LayoutGrid, Table, AlignJustify, CalendarClock, Settings, Upload, Download, Eraser, MoreHorizontal, Plus, X } from 'lucide-react';
import { TimesheetFilter } from './TimesheetFilter';
import { Category, CategoryCombo } from '../../types';
import { Bookmark, Check } from 'lucide-react';

type ViewMode = 'DAILY' | 'WEEK' | 'MONTH';
type LayoutMode = 'TABLE' | 'LIST';

interface TimesheetToolbarProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    layoutMode: LayoutMode;
    setLayoutMode: (mode: LayoutMode) => void;
    label: string;
    navigate: (dir: -1 | 1) => void;
    setAnchorDate: (date: Date) => void;
    
    // Filter Props
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
    categories: Category[];
    hiddenCategoryIds: Set<string>;
    hiddenSubCategoryIds: Set<string>;
    expandedCategories: Set<string>;
    toggleAllCategories: () => void;
    toggleCategoryVisibility: (id: string) => void;
    toggleCategoryExpand: (id: string, e: React.MouseEvent) => void;
    toggleSubCategoryVisibility: (catId: string, subId: string) => void;
    categoryCombos: CategoryCombo[];
    setHiddenCategoryIds: (ids: Set<string>) => void;
    onApplyComboToDay?: (combo: CategoryCombo, multiplier?: number) => void;

    // Action Props
    setIsRecurringModalOpen: (isOpen: boolean) => void;
    openTodaySettings: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadTemplate: () => void;
    handleExportClick: () => void;
    setIsResetConfirmationOpen: (isOpen: boolean) => void;
}

export const TimesheetToolbar: React.FC<TimesheetToolbarProps> = ({
    viewMode, setViewMode,
    layoutMode, setLayoutMode,
    label, navigate, setAnchorDate,
    isFilterOpen, setIsFilterOpen, categories, hiddenCategoryIds, hiddenSubCategoryIds, expandedCategories, toggleAllCategories, toggleCategoryVisibility, toggleCategoryExpand, toggleSubCategoryVisibility,
    categoryCombos, setHiddenCategoryIds, onApplyComboToDay,
    setIsRecurringModalOpen, openTodaySettings, fileInputRef, handleImportFile, handleDownloadTemplate, handleExportClick, setIsResetConfirmationOpen
}) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);
    const [isComboMenuOpen, setIsComboMenuOpen] = React.useState(false);

    const applyComboFilter = (combo: CategoryCombo) => {
        const comboSet = new Set(combo.items.map(i => i.categoryId));
        const allIds = categories.map(c => c.id);
        const hidden = allIds.filter(id => !comboSet.has(id));
        setHiddenCategoryIds(new Set(hidden));
        setIsComboMenuOpen(false);
    };

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative z-20 sticky top-4">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                {/* Left: Date Navigation */}
                <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex-1 lg:w-auto justify-between">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-all active:scale-95"><ChevronLeft size={18}/></button>
                        <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[150px] justify-center px-2">
                            <Calendar size={16} className="text-indigo-500 hidden sm:block" />
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs sm:text-sm whitespace-nowrap">{label}</span>
                        </div>
                        <button onClick={() => navigate(1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-all active:scale-95"><ChevronRight size={18}/></button>
                    </div>
                    <button onClick={() => setAnchorDate(new Date())} className="px-3 sm:px-4 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold rounded-xl hover:bg-indigo-100 dark:bg-indigo-500/20 transition-colors shrink-0">Today</button>
                </div>

                {/* Center/Right: View Controls & Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-start lg:justify-end">
                    {/* View Mode */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        <button onClick={() => setViewMode('DAILY')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${viewMode === 'DAILY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><List size={14} /> Daily</button>
                        <button onClick={() => setViewMode('WEEK')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${viewMode === 'WEEK' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Grid3X3 size={14} /> Weekly</button>
                        <button onClick={() => setViewMode('MONTH')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${viewMode === 'MONTH' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={14} /> Monthly</button>
                    </div>

                    {/* Layout Mode */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                        <button onClick={() => setLayoutMode('TABLE')} className={`p-2 rounded-lg transition-all ${layoutMode === 'TABLE' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="Table View"><Table size={16} /></button>
                        <button onClick={() => setLayoutMode('LIST')} className={`p-2 rounded-lg transition-all ${layoutMode === 'LIST' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="List View"><AlignJustify size={16} /></button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden lg:block mx-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700/50 flex-1 sm:flex-none justify-between sm:justify-start">
                        {categoryCombos.length > 0 && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsComboMenuOpen(!isComboMenuOpen)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm font-medium ${isComboMenuOpen ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    title="Category Combos"
                                >
                                    <Bookmark size={16} />
                                    <span className="hidden sm:inline">Combos</span>
                                </button>

                                {isComboMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsComboMenuOpen(false)} />
                                        <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-scale-up origin-top-left sm:origin-top-right flex flex-col max-h-[60vh]">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <Bookmark size={14} className="text-indigo-500" />
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Apply Combos</span>
                                                </div>
                                                <button onClick={() => setIsComboMenuOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                {categoryCombos.map(combo => (
                                                    <div key={combo.id} className="flex flex-col p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: combo.color || '#6366f1' }} />
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{combo.name}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{combo.items.length} items</span>
                                                        </div>
                                                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => applyComboFilter(combo)}
                                                                className="flex-1 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <List size={10} /> Filter
                                                            </button>
                                                            <div className="flex-1 flex items-center gap-1">
                                                                <input 
                                                                    type="number" 
                                                                    min="1" 
                                                                    defaultValue="1" 
                                                                    id={`combo-multiplier-${combo.id}`}
                                                                    className="w-10 py-1 px-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-center outline-none focus:border-indigo-500"
                                                                    title="Attempts"
                                                                />
                                                                <button 
                                                                    onClick={() => { 
                                                                        const input = document.getElementById(`combo-multiplier-${combo.id}`) as HTMLInputElement;
                                                                        const multiplier = parseInt(input?.value || '1', 10);
                                                                        onApplyComboToDay?.(combo, multiplier); 
                                                                        setIsComboMenuOpen(false); 
                                                                    }}
                                                                    className="flex-1 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <Plus size={10} /> Apply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                                                <button 
                                                    onClick={() => { setHiddenCategoryIds(new Set()); setIsComboMenuOpen(false); }}
                                                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                                >
                                                    <Check size={14} /> Show All Categories
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <TimesheetFilter 
                            isFilterOpen={isFilterOpen}
                            setIsFilterOpen={setIsFilterOpen}
                            categories={categories}
                            hiddenCategoryIds={hiddenCategoryIds}
                            hiddenSubCategoryIds={hiddenSubCategoryIds}
                            expandedCategories={expandedCategories}
                            toggleAllCategories={toggleAllCategories}
                            toggleCategoryVisibility={toggleCategoryVisibility}
                            toggleCategoryExpand={toggleCategoryExpand}
                            toggleSubCategoryVisibility={toggleSubCategoryVisibility}
                        />

                        <button onClick={() => setIsRecurringModalOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-sm font-medium" title="Recurring Tasks"><CalendarClock size={16} /><span className="hidden sm:inline">Recurring</span></button>
                        <button onClick={openTodaySettings} className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-sm font-medium" title="Day Settings"><Settings size={16} /><span className="hidden sm:inline">Settings</span></button>
                        
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                        
                        <div className="relative">
                            <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={`p-2 rounded-lg transition-all ${isMoreMenuOpen ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="More Actions">
                                <MoreHorizontal size={16} />
                            </button>
                            
                            {isMoreMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                                    <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-scale-up origin-top-right">
                                        <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".xlsx, .xls" className="hidden" />
                                        
                                        <button onClick={() => { setIsMoreMenuOpen(false); handleDownloadTemplate(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                                            <LayoutGrid size={16} className="text-indigo-500" /> Download Template
                                        </button>
                                        
                                        <button onClick={() => { setIsMoreMenuOpen(false); fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                                            <Upload size={16} className="text-emerald-500" /> Import Excel
                                        </button>
                                        
                                        <button onClick={() => { setIsMoreMenuOpen(false); handleExportClick(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                                            <Download size={16} className="text-blue-500" /> Export Data
                                        </button>
                                        
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                        
                                        <button onClick={() => { setIsMoreMenuOpen(false); setIsResetConfirmationOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-left">
                                            <Eraser size={16} /> Clear Timesheet
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
