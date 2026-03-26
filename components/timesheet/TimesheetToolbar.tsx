import React, { useRef } from 'react';
import { 
    ChevronLeft, ChevronRight, Calendar, List as ListIcon, Grid3X3, LayoutGrid, 
    Table, AlignJustify, CalendarClock, Settings, Upload, Download, Eraser, 
    MoreHorizontal, Plus, X, Bookmark, Check, Filter 
} from 'lucide-react';
import { TimesheetFilter } from './TimesheetFilter';
import { Category, CategoryCombo } from '../../types';

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

    // Refs for input multipliers to avoid full re-renders on keystroke
    const multiplierRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const applyComboFilter = (combo: CategoryCombo) => {
        const comboSet = new Set(combo.items.map(i => i.categoryId));
        const allIds = categories.map(c => c.id);
        const hidden = allIds.filter(id => !comboSet.has(id));
        setHiddenCategoryIds(new Set(hidden));
        setIsComboMenuOpen(false);
    };

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3 relative z-40 sticky top-2 sm:top-4">
            
            {/* Hidden File Input for Imports */}
            <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".xlsx, .xls" className="hidden" />

            {/* =========================================
                Left Section: Date Navigation
                ========================================= */}
            <div className="flex items-center justify-between w-full md:w-auto gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-[#f8f9fa] dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex-1 md:flex-none justify-between">
                    <button onClick={() => navigate(-1)} aria-label="Previous Period" className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95">
                        <ChevronLeft size={18}/>
                    </button>
                    <div className="flex items-center gap-1.5 min-w-[130px] sm:min-w-[150px] justify-center px-1">
                        <Calendar size={14} className="text-indigo-500 hidden sm:block" />
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-tight whitespace-nowrap">{label}</span>
                    </div>
                    <button onClick={() => navigate(1)} aria-label="Next Period" className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95">
                        <ChevronRight size={18}/>
                    </button>
                </div>
                <button 
                    onClick={() => setAnchorDate(new Date())} 
                    className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
                >
                    Today
                </button>
            </div>

            {/* =========================================
                Right Section: Views & Actions
                ========================================= */}
            {/* 🚨 แก้ไข: เปลี่ยนจาก overflow-x-auto เป็น flex-wrap เพื่อป้องกัน Dropdown โดนตัด 🚨 */}
            <div className="flex flex-wrap justify-start md:justify-end items-center w-full md:w-auto gap-2">
                
                {/* View & Layout Control Pill */}
                <div className="flex bg-[#f8f9fa] dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {(['DAILY', 'WEEK', 'MONTH'] as ViewMode[]).map((mode) => (
                        <button 
                            key={mode}
                            onClick={() => setViewMode(mode)} 
                            title={`${mode.charAt(0) + mode.slice(1).toLowerCase()} View`}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${viewMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {mode === 'DAILY' && <ListIcon size={14} />}
                            {mode === 'WEEK' && <Grid3X3 size={14} />}
                            {mode === 'MONTH' && <LayoutGrid size={14} />}
                            <span className="hidden lg:inline capitalize">{mode.toLowerCase()}</span>
                        </button>
                    ))}
                    
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
                    
                    <button onClick={() => setLayoutMode('TABLE')} aria-label="Table View" className={`p-1.5 rounded-lg transition-all ${layoutMode === 'TABLE' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <Table size={14} />
                    </button>
                    <button onClick={() => setLayoutMode('LIST')} aria-label="List View" className={`p-1.5 rounded-lg transition-all ${layoutMode === 'LIST' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <AlignJustify size={14} />
                    </button>
                </div>

                {/* Actions Group (Filters, Combos, Settings, More) */}
                <div className="flex items-center gap-1 bg-[#f8f9fa] dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    
                    {/* 1. Filter */}
                    <TimesheetFilter 
                        isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen}
                        categories={categories} hiddenCategoryIds={hiddenCategoryIds} hiddenSubCategoryIds={hiddenSubCategoryIds}
                        expandedCategories={expandedCategories} toggleAllCategories={toggleAllCategories}
                        toggleCategoryVisibility={toggleCategoryVisibility} toggleCategoryExpand={toggleCategoryExpand}
                        toggleSubCategoryVisibility={toggleSubCategoryVisibility}
                    />

                    {/* 2. Combos */}
                    {categoryCombos.length > 0 && (
                        <div className="relative">
                            <button 
                                onClick={() => { setIsComboMenuOpen(!isComboMenuOpen); setIsMoreMenuOpen(false); }}
                                aria-expanded={isComboMenuOpen}
                                className={`p-2 rounded-lg transition-all ${isComboMenuOpen ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                title="Category Combos"
                            >
                                <Bookmark size={16} />
                            </button>

                            {isComboMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsComboMenuOpen(false)} />
                                    <div className="absolute top-full mt-2 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-[300px] sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-scale-up flex flex-col max-h-[60vh]">
                                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Combos</span>
                                            <button onClick={() => setIsComboMenuOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={14} /></button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                            {categoryCombos.map(combo => (
                                                <div key={combo.id} className="flex flex-col p-2.5 hover:bg-[#f8f9fa] dark:hover:bg-slate-800/80 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: combo.color || '#6366f1' }} />
                                                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{combo.name}</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md">{combo.items.length} items</span>
                                                    </div>
                                                    <div className="flex gap-1.5 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => applyComboFilter(combo)} className="flex-1 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 shadow-sm"><Filter size={10} /> Filter</button>
                                                        <div className="flex-1 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
                                                            <input type="number" min="1" defaultValue="1" ref={el => { if (el) multiplierRefs.current[combo.id] = el; }} className="w-8 py-1 text-[10px] font-bold bg-transparent text-center outline-none text-slate-800 dark:text-white" title="Multiplier" />
                                                            <button onClick={() => { onApplyComboToDay?.(combo, parseInt(multiplierRefs.current[combo.id]?.value || '1', 10)); setIsComboMenuOpen(false); }} className="flex-1 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded text-[10px] font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center"><Plus size={10} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => { setHiddenCategoryIds(new Set()); setIsComboMenuOpen(false); }} className="mt-2 w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-t border-slate-100 dark:border-slate-800"><Check size={14} /> Show All</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 3. Recurring */}
                    <button onClick={() => setIsRecurringModalOpen(true)} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Recurring Tasks">
                        <CalendarClock size={16} />
                    </button>

                    {/* 4. Settings */}
                    <button onClick={openTodaySettings} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Day Settings">
                        <Settings size={16} />
                    </button>
                    
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                    
                    {/* 5. More Actions Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => { setIsMoreMenuOpen(!isMoreMenuOpen); setIsComboMenuOpen(false); }} 
                            aria-expanded={isMoreMenuOpen}
                            className={`p-2 rounded-lg transition-all ${isMoreMenuOpen ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} 
                            title="More Actions"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        
                        {isMoreMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                                <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-scale-up origin-top-right flex flex-col gap-0.5" role="menu">
                                    
                                    <button role="menuitem" onClick={() => { setIsMoreMenuOpen(false); handleDownloadTemplate(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#f8f9fa] dark:hover:bg-slate-800 rounded-xl transition-colors text-left group">
                                        <div className="p-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-md"><LayoutGrid size={14} /></div>
                                        Template
                                    </button>
                                    
                                    <button role="menuitem" onClick={() => { setIsMoreMenuOpen(false); fileInputRef.current?.click(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#f8f9fa] dark:hover:bg-slate-800 rounded-xl transition-colors text-left group">
                                        <div className="p-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-md"><Upload size={14} /></div>
                                        Import Excel
                                    </button>
                                    
                                    <button role="menuitem" onClick={() => { setIsMoreMenuOpen(false); handleExportClick(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#f8f9fa] dark:hover:bg-slate-800 rounded-xl transition-colors text-left group">
                                        <div className="p-1 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-md"><Download size={14} /></div>
                                        Export Data
                                    </button>
                                    
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                    
                                    <button role="menuitem" onClick={() => { setIsMoreMenuOpen(false); setIsResetConfirmationOpen(true); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors text-left group">
                                        <div className="p-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md"><Eraser size={14} /></div>
                                        Clear All
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};