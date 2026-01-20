
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Check, X, Folder, Edit2, Timer 
} from 'lucide-react';
import { Category, SubCategory } from '../../types';

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

export const SubCategoryItem: React.FC<{
  sub: SubCategory;
  category: Category;
  updateCategory: (c: Category) => void;
  onDeleteClick: () => void;
}> = ({ sub, category, updateCategory, onDeleteClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(sub.name);
  const [minutes, setMinutes] = useState(sub.minutes?.toString() || '');

  const handleSave = () => {
    if (!name.trim()) return;
    const updatedSubs = category.subCategories.map(s => 
      s.id === sub.id ? { ...s, name, minutes: parseInt(minutes) || 0 } : s
    );
    updateCategory({ ...category, subCategories: updatedSubs });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-1 animate-fade-in bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm ring-2 ring-indigo-500/20">
        <input 
            autoFocus
            className="flex-1 min-w-0 bg-transparent text-xs font-bold px-2 py-1.5 outline-none text-slate-800 dark:text-white"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
        />
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-md px-1.5">
            <Timer size={10} className="text-slate-400"/>
            <input 
                className="w-8 bg-transparent text-[10px] font-mono text-center py-1.5 outline-none text-slate-700 dark:text-slate-200"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                placeholder="0"
            />
        </div>
        <button onClick={handleSave} className="p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"><Check size={12}/></button>
        <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><X size={12}/></button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center group py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-400 transition-colors"></div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{sub.name}</span>
        {(sub.minutes || 0) > 0 && (
          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
            {sub.minutes}m
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors">
          <Edit2 size={12} />
        </button>
        <button onClick={onDeleteClick} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export const CategoryCard: React.FC<{
  category: Category;
  updateCategory: (c: Category) => void;
  onDelete: () => void;
}> = ({ category, updateCategory, onDelete }) => {
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

  const saveCategoryEdit = () => {
      updateCategory({ 
          ...category, 
          name: editName, 
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
              name: newSubName, 
              minutes: parseInt(newSubMinutes) || 0 
          }]
      });
      setNewSubName('');
      setNewSubMinutes('');
      setIsAddingSub(false);
  };

  const deleteSub = (subId: string) => {
      updateCategory({
          ...category,
          subCategories: category.subCategories.filter(s => s.id !== subId)
      });
  };

  if (isEditing) {
      return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-indigo-500 p-5 space-y-4 animate-scale-up relative z-10">
              <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Category Name</label>
                  <input 
                    autoFocus 
                    className="w-full text-lg font-bold border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
              </div>
              <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Color Tag</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setEditColor(c)}
                            className={`w-6 h-6 rounded-full transition-transform ${editColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : 'hover:scale-110'}`}
                            style={{backgroundColor: c}}
                        />
                    ))}
                  </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={saveCategoryEdit} className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">Save Changes</button>
              </div>
          </div>
      )
  }

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full border-slate-200 dark:border-slate-800">
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ backgroundColor: category.color }}></div>
        <div className="p-5 pl-6 flex justify-between items-start">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-2" title={category.name}>{category.name}</h3>
                <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                            {category.subCategories.length} Items
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                    <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
        <div className="px-3 pb-3 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pr-1 space-y-0.5">
                {category.subCategories.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                        <Folder size={20} className="mb-2 opacity-50"/>
                        <span className="text-xs font-medium">Empty Folder</span>
                    </div>
                )}
                {category.subCategories.map(sub => (
                    <SubCategoryItem 
                        key={sub.id} 
                        sub={sub} 
                        category={category} 
                        updateCategory={updateCategory} 
                        onDeleteClick={() => deleteSub(sub.id)}
                    />
                ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                {isAddingSub ? (
                    <form onSubmit={addSubCategory} className="animate-fade-in flex gap-2">
                        <input 
                            autoFocus
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                            placeholder="New Sub-category"
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                        />
                        <input 
                            className="w-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1 py-1.5 text-xs font-mono text-center focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                            placeholder="Min"
                            value={newSubMinutes}
                            onChange={e => setNewSubMinutes(e.target.value)}
                        />
                        <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"><Check size={14}/></button>
                        <button type="button" onClick={() => setIsAddingSub(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={14}/></button>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAddingSub(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};
