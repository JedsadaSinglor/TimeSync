import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Check, X, Folder, Edit2, Timer, ChevronUp, ChevronDown 
} from 'lucide-react';
import { Category, SubCategory } from '../../types';

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

// ==========================================
// Sub-Component: SubCategory Item
// ==========================================
export const SubCategoryItem: React.FC<{
  sub: SubCategory;
  category: Category;
  updateCategory: (c: Category) => void;
  onDeleteClick: () => void;
}> = ({ sub, category, updateCategory, onDeleteClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(sub.name);
  const [minutes, setMinutes] = useState(sub.minutes?.toString() || '');

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    const updatedSubs = category.subCategories.map(s => 
      s.id === sub.id ? { ...s, name, minutes: parseInt(minutes) || 0 } : s
    );
    updateCategory({ ...category, subCategories: updatedSubs });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-2 p-1.5 animate-fade-in bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-500/50 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100">
        <input 
            autoFocus
            className="flex-1 min-w-0 bg-transparent text-xs font-bold px-2 py-1 outline-none text-slate-800 dark:text-white"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Sub-category Name"
        />
        <div className="flex items-center gap-1.5 bg-[#f8f9fa] dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1">
            <Timer size={12} className="text-slate-400"/>
            <input 
                type="number"
                min="0"
                className="w-8 bg-transparent text-xs font-mono font-bold text-center outline-none text-slate-700 dark:text-slate-200"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                placeholder="0"
                title="Minutes"
            />
        </div>
        <button type="submit" aria-label="Save changes" className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Check size={14}/>
        </button>
        <button type="button" aria-label="Cancel editing" onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={14}/>
        </button>
      </form>
    );
  }

  return (
    <div className="flex justify-between items-center group py-2.5 px-3 hover:bg-[#f8f9fa] dark:hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-indigo-400 transition-colors"></div>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{sub.name}</span>
        {(sub.minutes || 0) > 0 && (
          <span className="text-[10px] text-slate-500 font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md flex items-center shadow-sm">
            {sub.minutes}m
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button aria-label="Edit subcategory" onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
          <Edit2 size={14} />
        </button>
        <button aria-label="Delete subcategory" onClick={onDeleteClick} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// Main Component: Category Card
// ==========================================
export const CategoryCard: React.FC<{
  category: Category;
  updateCategory: (c: Category) => void;
  onDelete: () => void;
  moveUp: () => void;
  moveDown: () => void;
}> = ({ category, updateCategory, onDelete, moveUp, moveDown }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubMinutes, setNewSubMinutes] = useState('');
  
  const [editName, setEditName] = useState(category.name);
  const [editColor, setEditColor] = useState(category.color);

  useEffect(() => {
      setEditName(category.name);
      setEditColor(category.color);
  }, [category]);

  const saveCategoryEdit = (e?: React.FormEvent) => {
      if(e) e.preventDefault();
      if(!editName.trim()) return;
      
      updateCategory({ 
          ...category, 
          name: editName.trim(), 
          color: editColor
      });
      setIsEditing(false);
  };

  const addSubCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSubName.trim()) return;
      updateCategory({
          ...category,
          subCategories: [...category.subCategories, { 
              id: Date.now().toString(), 
              name: newSubName.trim(), 
              minutes: parseInt(newSubMinutes) || 0 
          }]
      });
      setNewSubName('');
      setNewSubMinutes('');
      setIsAddingSub(false);
  };

  const handleDeleteSub = (subId: string) => {
      if(window.confirm('Remove this sub-category?')) {
          updateCategory({
              ...category,
              subCategories: category.subCategories.filter(s => s.id !== subId)
          });
      }
  };

  const handleDeleteCategory = () => {
      if(window.confirm(`Delete the entire "${category.name}" category? This cannot be undone.`)) {
          onDelete();
      }
  };

  // ----------------------------------------
  // Edit Mode View
  // ----------------------------------------
  if (isEditing) {
      return (
          <form onSubmit={saveCategoryEdit} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 p-6 space-y-6 animate-scale-up relative z-10">
              <div>
                  <label htmlFor={`edit-cat-${category.id}`} className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-[0.15em] mb-3 block">Category Name</label>
                  <input 
                    id={`edit-cat-${category.id}`}
                    autoFocus 
                    className="w-full text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl bg-[#f8f9fa] dark:bg-slate-800/50 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-slate-900 dark:text-white transition-all"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
              </div>
              <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-[0.15em] mb-3 block">Color Tag</label>
                  <div className="flex flex-wrap gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#f8f9fa] dark:bg-slate-900">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            aria-label={`Select color ${c}`}
                            onClick={() => setEditColor(c)}
                            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${editColor === c ? 'ring-2 ring-indigo-200 dark:ring-indigo-700 ring-offset-4 dark:ring-offset-slate-900' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                            style={{backgroundColor: c}}
                        >
                            {editColor === c && <div className="w-6 h-6 rounded-full border-2 border-white/50" />}
                        </button>
                    ))}
                  </div>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95">Save Changes</button>
              </div>
          </form>
      )
  }

  // ----------------------------------------
  // Default View
  // ----------------------------------------
  return (
    <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-indigo-300 dark:hover:border-indigo-500 h-full border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex-1 min-w-0 flex items-start gap-3">
                <div className="w-4 h-4 rounded-full mt-1 shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white truncate pr-2" title={category.name}>{category.name}</h3>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                        {category.subCategories.length} Items
                    </span>
                </div>
            </div>
            
            {/* Action Buttons (Visible on Hover) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 pl-2">
                <button aria-label="Move Up" onClick={moveUp} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <ChevronUp size={16} />
                </button>
                <button aria-label="Move Down" onClick={moveDown} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <ChevronDown size={16} />
                </button>
                <button aria-label="Edit Category" onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                    <Edit2 size={16} />
                </button>
                <button aria-label="Delete Category" onClick={handleDeleteCategory} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>

        {/* Subcategories List */}
        <div className="px-3 py-3 flex-1 flex flex-col bg-[#f8f9fa]/50 dark:bg-transparent rounded-b-[2rem]">
            <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-1 space-y-1">
                {category.subCategories.length === 0 && (
                    <div className="h-[100px] flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50 m-2">
                        <Folder size={24} strokeWidth={1.5} className="mb-2 text-slate-300 dark:text-slate-600"/>
                        <span className="text-xs font-semibold">No sub-categories</span>
                    </div>
                )}
                {category.subCategories.map(sub => (
                    <SubCategoryItem 
                        key={sub.id} 
                        sub={sub} 
                        category={category} 
                        updateCategory={updateCategory} 
                        onDeleteClick={() => handleDeleteSub(sub.id)}
                    />
                ))}
            </div>

            {/* Add Subcategory Area */}
            <div className="mt-3 px-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                {isAddingSub ? (
                    <form onSubmit={addSubCategory} className="animate-fade-in flex gap-2">
                        <input 
                            autoFocus
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-400 outline-none text-slate-800 dark:text-white transition-all shadow-sm"
                            placeholder="New Sub-category"
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                        />
                        <div className="relative">
                            <input 
                                type="number"
                                min="0"
                                className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-mono font-bold text-center focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 dark:text-white transition-all shadow-sm"
                                placeholder="Min"
                                value={newSubMinutes}
                                onChange={e => setNewSubMinutes(e.target.value)}
                            />
                        </div>
                        <button type="submit" aria-label="Save subcategory" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"><Check size={16}/></button>
                        <button type="button" aria-label="Cancel" onClick={() => setIsAddingSub(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"><X size={16}/></button>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAddingSub(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all bg-white dark:bg-slate-800"
                    >
                        <Plus size={16} strokeWidth={2.5} /> Add Sub-category
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};