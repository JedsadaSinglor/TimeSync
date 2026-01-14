
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Category, SubCategory } from '../types';
import { 
  Plus, Trash2, Check, X, Folder, Edit2, Upload, Download, 
  Timer, Lock, Settings, Palette, Layers, Search, MoreHorizontal, Tag
} from 'lucide-react';
import * as XLSX from 'xlsx';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

const ITEMS_PER_PAGE = 9;

const SubCategoryItem: React.FC<{
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

const CategoryCard: React.FC<{
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

const CategoryManagement: React.FC = () => {
  const { categories, logs, addCategory, updateCategory, deleteCategory } = useApp(); 
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const filteredCategories = useMemo(() => {
      let filtered = categories;
      if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          filtered = filtered.filter(c => 
              c.name.toLowerCase().includes(lower) || 
              c.subCategories.some(s => s.name.toLowerCase().includes(lower))
          );
      }
      return filtered;
  }, [categories, searchTerm]);

  const paginatedCategories = filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName.trim()) return;
      addCategory({
          id: Date.now().toString(),
          name: newName,
          color: newColor,
          subCategories: []
      });
      setNewName('');
      setNewColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setIsCreateOpen(false);
      showToast('Category created', 'success');
  };

  const handleExport = () => {
      const data = filteredCategories.flatMap(c => {
          if (c.subCategories.length === 0) {
              return [{
                  Name: c.name,
                  SubCategories: '',
                  Time: 0
              }];
          }
          return c.subCategories.map(s => ({
              Name: c.name,
              SubCategories: s.name,
              Time: s.minutes || 0
          }));
      });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Categories");
      XLSX.writeFile(wb, `Categories_Export.xlsx`);
      showToast('Exported successfully', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer);
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws) as any[];
          
          if (json.length === 0) {
              showToast('File is empty', 'info');
              return;
          }

          let newCats = 0;
          let newSubs = 0;
          
          // Deep copy to avoid mutating state directly/reference issues during the loop
          const tempCats = JSON.parse(JSON.stringify(categories)) as Category[];

          for (const row of json) {
              // Try to map columns flexibly based on user format "Name", "SubCategories", "Time"
              const catName = row['Name'] || row['name'] || row['Category'];
              const subName = row['SubCategories'] || row['SubCategory'] || row['subcategory'];
              const timeVal = row['Time'] || row['time'] || row['Minutes'] || row['minutes'];

              if (!catName) continue;

              let cat = tempCats.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
              
              if (!cat) {
                  cat = {
                      id: `imported_cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                      name: String(catName).trim(),
                      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
                      subCategories: []
                  };
                  tempCats.push(cat);
                  newCats++;
              }

              if (subName) {
                  const sName = String(subName).trim();
                  const exists = cat.subCategories.some(s => s.name.toLowerCase() === sName.toLowerCase());
                  if (!exists) {
                      cat.subCategories.push({
                          id: `imported_sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                          name: sName,
                          minutes: parseInt(timeVal) || 0
                      });
                      newSubs++;
                  }
              }
          }

          // Apply changes to Context
          for (const cat of tempCats) {
              const original = categories.find(c => c.id === cat.id);
              if (!original) {
                  addCategory(cat);
              } else {
                  // check if subs changed
                  if (JSON.stringify(original.subCategories) !== JSON.stringify(cat.subCategories)) {
                      updateCategory(cat);
                  }
              }
          }

          if (newCats > 0 || newSubs > 0) {
              showToast(`Imported ${newCats} categories and ${newSubs} sub-categories`, 'success');
          } else {
              showToast('No new data found to import', 'info');
          }

      } catch (error) {
          console.error(error);
          showToast('Error parsing Excel file', 'error');
      } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-fade-in font-sans">
      {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
                  <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10`}>
                      <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400`}>
                              <Layers size={20} />
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">New Category</h3>
                          </div>
                      </div>
                      <button onClick={() => setIsCreateOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500">
                          <X size={20}/>
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <form id="create-category-form" onSubmit={handleCreate} className="space-y-6">
                          <div className="space-y-3">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category Name</label>
                              <div className="relative group">
                                  <input 
                                      autoFocus
                                      className="w-full pl-4 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                      placeholder="e.g. Design System"
                                      value={newName}
                                      onChange={e => setNewName(e.target.value)}
                                  />
                              </div>
                          </div>
                          <div className="space-y-3">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Color Tag</label>
                              <div className="flex flex-wrap gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                                  {PRESET_COLORS.map(c => (
                                      <button
                                          key={c}
                                          type="button"
                                          onClick={() => setNewColor(c)}
                                          className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${newColor === c ? 'scale-110 ring-4 ring-offset-2 ring-indigo-100 dark:ring-indigo-900 ring-offset-white dark:ring-offset-slate-900' : 'hover:scale-110 hover:opacity-80'}`}
                                          style={{backgroundColor: c}}
                                      >
                                          {newColor === c && <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </form>
                  </div>
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
                      <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">Cancel</button>
                      <button form="create-category-form" type="submit" className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none">
                          <Plus size={18} strokeWidth={3} /> Create Category
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Category Manager</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                  Manage categories and sub-activities.
              </p>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-2 z-20 backdrop-blur-md bg-opacity-90">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-medium text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-slate-700 outline-none transition-all" placeholder="Search categories..." />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"><Upload size={16} /> Import</button>
              <button onClick={handleExport} className="px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"><Download size={16} /> Export</button>
              <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 h-8 self-center"></div>
              <button onClick={() => setIsCreateOpen(true)} className="px-6 py-3 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap transform hover:-translate-y-0.5 hover:shadow-xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"><Plus size={18} strokeWidth={3} /> New Category</button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {paginatedCategories.map(cat => (
            <CategoryCard 
                key={cat.id} 
                category={cat} 
                updateCategory={updateCategory}
                onDelete={() => deleteCategory(cat.id)}
            />
          ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
