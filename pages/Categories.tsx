
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Category, CategoryCombo } from '../types';
import { Plus, X, Upload, Download, Layers, Search, Check, Bookmark, GripVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CategoryCard, PRESET_COLORS } from '../components/admin/CategoryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryExportModal, CategoryImportModal } from '../components/admin/CategoryImportExportModals';
import { CategoryComboManager } from '../components/admin/CategoryComboManager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ITEMS_PER_PAGE = 9;

const SortableCategoryCard = (props: any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.category.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} className="relative">
            <div {...attributes} {...listeners} className="absolute left-2 top-2 cursor-grab z-10 p-1 text-slate-400 hover:text-slate-600">
                <GripVertical size={16} />
            </div>
            <CategoryCard {...props} />
        </div>
    );
};

const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, categoryCombos, addCategoryCombo, updateCategoryCombo, currentUser, reorderCategories } = useApp(); 
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [exportSummary, setExportSummary] = useState<{ categoryCount: number, subCategoryCount: number, comboCount: number } | null>(null);
  const [importSummary, setImportSummary] = useState<{ newCategories: number, newSubCategories: number, newCombos: number } | null>(null);
  const [pendingCategories, setPendingCategories] = useState<Category[] | null>(null);
  const [pendingCombos, setPendingCombos] = useState<CategoryCombo[] | null>(null);

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
        const oldIndex = filteredCategories.findIndex(c => c.id === active.id);
        const newIndex = filteredCategories.findIndex(c => c.id === over.id);
        const newCategories = arrayMove(filteredCategories, oldIndex, newIndex);
        reorderCategories(newCategories.map(c => c.id));
    }
  };

  const moveUp = (id: string) => {
    const index = filteredCategories.findIndex(c => c.id === id);
    if (index > 0) {
      const newFiltered = [...filteredCategories];
      [newFiltered[index], newFiltered[index - 1]] = [newFiltered[index - 1], newFiltered[index]];
      reorderCategories(newFiltered.map(c => c.id));
    }
  };

  const moveDown = (id: string) => {
    const index = filteredCategories.findIndex(c => c.id === id);
    if (index < filteredCategories.length - 1) {
      const newFiltered = [...filteredCategories];
      [newFiltered[index], newFiltered[index + 1]] = [newFiltered[index + 1], newFiltered[index]];
      reorderCategories(newFiltered.map(c => c.id));
    }
  };

  const paginatedCategories = filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName.trim()) return;
      addCategory({
          id: Date.now().toString(),
          name: newName,
          color: newColor,
          subCategories: [],
          order: categories.length
      });
      setNewName('');
      setNewColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setIsCreateOpen(false);
      showToast('Category created', 'success');
  };

  const handleExportClick = () => {
      const subCount = filteredCategories.reduce((acc, c) => acc + c.subCategories.length, 0);
      setExportSummary({
          categoryCount: filteredCategories.length,
          subCategoryCount: subCount,
          comboCount: categoryCombos.length
      });
  };

  const confirmExport = () => {
      // Categories Sheet
      const catData = filteredCategories.flatMap(c => {
          if (c.subCategories.length === 0) {
              return [{
                  Name: c.name,
                  SubCategories: '',
                  Time: 0,
                  Color: c.color
              }];
          }
          return c.subCategories.map(s => ({
              Name: c.name,
              SubCategories: s.name,
              Time: s.minutes || 0,
              Color: c.color
          }));
      });

      // Combos Sheet
      const comboData = categoryCombos.flatMap(combo => {
          return combo.items.map(item => {
              const cat = categories.find(c => c.id === item.categoryId);
              const sub = cat?.subCategories.find(s => s.id === item.subCategoryId);
              return {
                  ComboName: combo.name,
                  ComboColor: combo.color,
                  Category: cat?.name || 'Unknown',
                  SubCategory: sub?.name || '',
                  DefaultCount: item.defaultCount || ''
              };
          });
      });

      const wb = XLSX.utils.book_new();
      
      const wsCats = XLSX.utils.json_to_sheet(catData);
      XLSX.utils.book_append_sheet(wb, wsCats, "Categories");

      if (comboData.length > 0) {
          const wsCombos = XLSX.utils.json_to_sheet(comboData);
          XLSX.utils.book_append_sheet(wb, wsCombos, "Combos");
      }

      XLSX.writeFile(wb, `Categories_and_Combos_Export.xlsx`);
      showToast('Exported successfully', 'success');
      setExportSummary(null);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
              throw new Error("Invalid file type. Only Excel or CSV files are allowed.");
          }
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
              throw new Error("File is too large. Maximum size is 5MB.");
          }

          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer);
          
          // Process Categories
          const wsCats = wb.Sheets["Categories"] || wb.Sheets[wb.SheetNames[0]];
          const catJson = XLSX.utils.sheet_to_json(wsCats) as Record<string, string | number>[];
          
          let newCats = 0;
          let newSubs = 0;
          let newCombosCount = 0;
          
          const tempCats = JSON.parse(JSON.stringify(categories)) as Category[];
          const tempCombos: CategoryCombo[] = [];

          if (catJson.length > 0) {
              for (const row of catJson) {
                  const catName = row['Name'] || row['name'] || row['Category'];
                  const subName = row['SubCategories'] || row['SubCategory'] || row['subcategory'];
                  const timeVal = row['Time'] || row['time'] || row['Minutes'] || row['minutes'];
                  const colorVal = row['Color'] || row['color'];

                  if (!catName) continue;

                  let cat = tempCats.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
                  
                  if (!cat) {
                      cat = {
                          id: `imported_cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                          name: String(catName).trim(),
                          color: String(colorVal || PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]),
                          subCategories: [],
                          order: tempCats.length
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
                              minutes: parseInt(String(timeVal)) || 0
                          });
                          newSubs++;
                      }
                  }
              }
          }

          // Process Combos
          const wsCombos = wb.Sheets["Combos"];
          if (wsCombos) {
              const comboJson = XLSX.utils.sheet_to_json(wsCombos) as Record<string, string | number>[];
              const comboGroups: Record<string, { name: string, color: string, items: any[] }> = {};

              for (const row of comboJson) {
                  const comboName = row['ComboName'] || row['combo_name'];
                  const comboColor = row['ComboColor'] || row['color'];
                  const catName = row['Category'] || row['category'];
                  const subName = row['SubCategory'] || row['subcategory'];
                  const defCount = row['DefaultCount'] || row['count'];

                  if (!comboName || !catName) continue;

                  if (!comboGroups[String(comboName)]) {
                      comboGroups[String(comboName)] = {
                          name: String(comboName),
                          color: String(comboColor || PRESET_COLORS[0]),
                          items: []
                      };
                  }

                  const cat = tempCats.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
                  if (cat) {
                      const sub = cat.subCategories.find(s => s.name.toLowerCase() === String(subName || '').toLowerCase().trim());
                      comboGroups[String(comboName)].items.push({
                          categoryId: cat.id,
                          subCategoryId: sub?.id,
                          defaultCount: parseInt(String(defCount)) || undefined
                      });
                  }
              }

              for (const name in comboGroups) {
                  const group = comboGroups[name];
                  const existing = categoryCombos.find(c => c.name.toLowerCase() === name.toLowerCase());
                  if (!existing) {
                      tempCombos.push({
                          id: `imported_combo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                          userId: currentUser.id,
                          name: group.name,
                          color: group.color,
                          items: group.items
                      });
                      newCombosCount++;
                  }
              }
          }

          if (newCats === 0 && newSubs === 0 && newCombosCount === 0) {
              showToast('No new data found to import', 'info');
              if (fileInputRef.current) fileInputRef.current.value = '';
              return;
          }

          setPendingCategories(tempCats);
          setPendingCombos(tempCombos);
          setImportSummary({ newCategories: newCats, newSubCategories: newSubs, newCombos: newCombosCount });

      } catch (error: unknown) {
          console.error(error);
          const e = error as Error;
          showToast(e.message || 'Error parsing Excel file', 'error');
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const confirmImport = () => {
      if (pendingCategories) {
          for (const cat of pendingCategories) {
              const original = categories.find(c => c.id === cat.id);
              if (!original) {
                  addCategory(cat);
              } else {
                  if (JSON.stringify(original.subCategories) !== JSON.stringify(cat.subCategories)) {
                      updateCategory(cat);
                  }
              }
          }
      }
      if (pendingCombos) {
          for (const combo of pendingCombos) {
              addCategoryCombo(combo);
          }
      }
      showToast(`Imported ${importSummary?.newCategories} categories, ${importSummary?.newSubCategories} sub-categories, and ${importSummary?.newCombos} combos`, 'success');
      setImportSummary(null);
      setPendingCategories(null);
      setPendingCombos(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

      <CategoryComboManager isOpen={isComboModalOpen} onClose={() => setIsComboModalOpen(false)} />

      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center relative lg:sticky lg:top-2 z-20 backdrop-blur-md bg-opacity-90 transition-all duration-300">
          <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-medium text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-slate-700 outline-none transition-all" placeholder="Search categories..." />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".xlsx, .xls" />
              <button onClick={() => fileInputRef.current?.click()} className="px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] sm:text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"><Upload size={16} /> Import</button>
              <button onClick={handleExportClick} className="px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] sm:text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"><Download size={16} /> Export</button>
              <button onClick={() => setIsComboModalOpen(true)} className="px-3 sm:px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] sm:text-xs rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2 whitespace-nowrap"><Bookmark size={16} /> Combos</button>
              <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 h-8 self-center hidden lg:block"></div>
              <button onClick={() => setIsCreateOpen(true)} className="px-4 sm:px-6 py-3 text-white font-bold text-[10px] sm:text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap transform hover:-translate-y-0.5 hover:shadow-xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"><Plus size={18} strokeWidth={3} /> New Category</button>
          </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={paginatedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {paginatedCategories.length === 0 ? (
                  <div className="col-span-full">
                      <EmptyState 
                          icon={Layers} 
                          title="No Categories Found" 
                          description={searchTerm ? `No categories match "${searchTerm}"` : "Create your first category to start organizing your time."}
                          action={!searchTerm && (
                              <button onClick={() => setIsCreateOpen(true)} className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                                  Create Category
                              </button>
                          )}
                      />
                  </div>
              ) : (
                  paginatedCategories.map(cat => (
                    <SortableCategoryCard 
                        key={cat.id} 
                        category={cat} 
                        updateCategory={updateCategory}
                        onDelete={() => deleteCategory(cat.id)}
                        moveUp={() => moveUp(cat.id)}
                        moveDown={() => moveDown(cat.id)}
                    />
                  ))
              )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modals */}
      {exportSummary && (
          <CategoryExportModal 
              isOpen={!!exportSummary}
              onClose={() => setExportSummary(null)}
              onConfirm={confirmExport}
              summary={exportSummary}
          />
      )}
      
      {importSummary && (
          <CategoryImportModal 
              isOpen={!!importSummary}
              onClose={() => { setImportSummary(null); setPendingCategories(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              onConfirm={confirmImport}
              summary={importSummary}
          />
      )}
    </div>
  );
};

export default CategoryManagement;
