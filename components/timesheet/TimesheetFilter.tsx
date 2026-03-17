import React from 'react';
import { Filter, CheckSquare, Square, ChevronDown, ChevronRight as ChevronIcon } from 'lucide-react';
import { Category } from '../../types';

interface TimesheetFilterProps {
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
}

export const TimesheetFilter: React.FC<TimesheetFilterProps> = ({
    isFilterOpen,
    setIsFilterOpen,
    categories,
    hiddenCategoryIds,
    hiddenSubCategoryIds,
    expandedCategories,
    toggleAllCategories,
    toggleCategoryVisibility,
    toggleCategoryExpand,
    toggleSubCategoryVisibility
}) => {
    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm font-medium ${isFilterOpen || hiddenCategoryIds.size > 0 ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                title="Filter Categories"
            >
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
            </button>
            {isFilterOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                    <div className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-50 animate-scale-up origin-top-right sm:origin-top-left">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visible Rows</span>
                            <button onClick={toggleAllCategories} className="text-xs font-bold text-indigo-500 hover:text-indigo-600">
                                {hiddenCategoryIds.size > 0 ? 'Show All' : 'Hide All'}
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {categories.map(cat => {
                                const isCatHidden = hiddenCategoryIds.has(cat.id);
                                const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                                const isExpanded = expandedCategories.has(cat.id);

                                return (
                                    <div key={cat.id} className="select-none">
                                        <div 
                                            className={`flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group ${isCatHidden ? 'opacity-70' : ''}`}
                                            onClick={() => toggleCategoryVisibility(cat.id)}
                                        >
                                            <div className={`transition-colors ${isCatHidden ? 'text-slate-300 dark:text-slate-600' : 'text-indigo-500'}`}>
                                                {isCatHidden ? <Square size={16} /> : <CheckSquare size={16} />}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: cat.color}}></span>
                                                <span className={`text-sm font-bold truncate ${isCatHidden ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{cat.name}</span>
                                            </div>
                                            {hasSubs && (
                                                <div 
                                                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                                                    onClick={(e) => toggleCategoryExpand(cat.id, e)}
                                                >
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronIcon size={14} />}
                                                </div>
                                            )}
                                        </div>
                                        {hasSubs && isExpanded && !isCatHidden && (
                                            <div className="pl-8 space-y-1 mt-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4 mb-2">
                                                {cat.subCategories.map(sub => {
                                                    const isSubHidden = hiddenSubCategoryIds.has(`${cat.id}-${sub.id}`);
                                                    return (
                                                        <div 
                                                            key={sub.id}
                                                            onClick={() => toggleSubCategoryVisibility(cat.id, sub.id)}
                                                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                        >
                                                                <div className={`transition-colors ${isSubHidden ? 'text-slate-300 dark:text-slate-600' : 'text-indigo-400'}`}>
                                                                {isSubHidden ? <Square size={14} /> : <CheckSquare size={14} />}
                                                            </div>
                                                            <span className={`text-xs font-medium truncate ${isSubHidden ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{sub.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {categories.length === 0 && <div className="text-center text-xs text-slate-400 py-4">No categories found</div>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
