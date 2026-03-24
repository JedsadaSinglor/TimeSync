import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { CategoryCombo, CategoryComboItem, TimeLog, Category } from '../../types';
import { Plus, X, Trash2, Edit2, Bookmark, Hash, Play, Send } from 'lucide-react';
import { PRESET_COLORS } from './CategoryCard';
import { getLocalDateStr } from '../../utils/storage';

interface CategoryComboManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==========================================
// Sub-Component: Combo Card (Grid View Item)
// ==========================================
const ComboCard: React.FC<{
  combo: CategoryCombo;
  categories: Category[];
  onEdit: (combo: CategoryCombo) => void;
  onDelete: (id: string) => void;
  onApply: (combo: CategoryCombo, multiplier: number) => void;
}> = ({ combo, categories, onEdit, onDelete, onApply }) => {
  const [multiplier, setMultiplier] = useState<number>(1);

  return (
    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-5">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-transform" 
            style={{ backgroundColor: combo.color || PRESET_COLORS[0] }}
          >
            <Play size={20} fill="currentColor" />
          </div>
          <div className="flex gap-1">
            <button aria-label="Edit combo" onClick={() => onEdit(combo)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
              <Edit2 size={16} />
            </button>
            <button aria-label="Delete combo" onClick={() => onDelete(combo.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">{combo.name}</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{combo.items.length} items in set</p>
        </div>

        <div className="space-y-2.5">
          {combo.items.slice(0, 4).map((item, i) => {
            const cat = categories.find(c => c.id === item.categoryId);
            if (!cat) return null;
            return (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}</span>
                {item.defaultCount && <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">x{item.defaultCount}</span>}
              </div>
            );
          })}
          {combo.items.length > 4 && (
            <p className="text-xs font-semibold text-indigo-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              + {combo.items.length - 4} more items
            </p>
          )}
        </div>
      </div>

      <div className="flex border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <input 
          type="number" 
          min="1" 
          value={multiplier}
          onChange={(e) => setMultiplier(Math.max(1, parseInt(e.target.value) || 1))}
          aria-label="Multiplier"
          className="w-16 py-4 px-3 bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 text-center outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-shadow border-r border-slate-200 dark:border-slate-700"
        />
        <button 
          onClick={() => onApply(combo, multiplier)}
          className="flex-1 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-colors"
        >
          <Send size={16} /> Apply to Today
        </button>
      </div>
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================
export const CategoryComboManager: React.FC<CategoryComboManagerProps> = ({ isOpen, onClose }) => {
  const { categories, categoryCombos, addCategoryCombo, updateCategoryCombo, deleteCategoryCombo, currentUser, batchAddLogs } = useApp();
  const { showToast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingCombo, setEditingCombo] = useState<CategoryCombo | null>(null);
  const [name, setName] = useState('');
  const [comboColor, setComboColor] = useState(PRESET_COLORS[0]);
  const [items, setItems] = useState<CategoryComboItem[]>([]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return showToast('Please enter a name for the combo', 'error');
    if (items.length === 0) return showToast('Please add at least one item to the combo', 'error');

    const comboData: CategoryCombo = {
      id: editingCombo?.id || `combo_${Date.now()}`,
      userId: currentUser.id,
      name: name.trim(),
      items,
      color: comboColor
    };

    if (editingCombo) {
      updateCategoryCombo(comboData);
      showToast('Combo updated successfully', 'success');
    } else {
      addCategoryCombo(comboData);
      showToast('New combo created', 'success');
    }
    reset();
  };

  const reset = () => {
    setIsCreating(false);
    setEditingCombo(null);
    setName('');
    setComboColor(PRESET_COLORS[0]);
    setItems([]);
  };

  const handleEdit = (combo: CategoryCombo) => {
    setEditingCombo(combo);
    setName(combo.name);
    setComboColor(combo.color || PRESET_COLORS[0]);
    setItems(combo.items || []);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this combo?')) {
      deleteCategoryCombo(id);
      showToast('Combo deleted', 'info');
    }
  };

  const addItem = () => {
    if (categories.length === 0) return;
    setItems(prev => [...prev, { categoryId: categories[0].id }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<CategoryComboItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const quickApply = (combo: CategoryCombo, multiplier: number = 1) => {
    const today = getLocalDateStr(new Date());
    const newLogs: TimeLog[] = combo.items.map(item => ({
      id: `log_quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      date: today,
      categoryId: item.categoryId,
      subCategoryId: item.subCategoryId || 'general',
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 0,
      count: (item.defaultCount || 0) * multiplier,
      notes: `Quick log from combo: ${combo.name}`
    }));

    batchAddLogs(newLogs);
    showToast(`Applied "${combo.name}" to today`, 'success');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-[#f8f9fa] dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-scale-up overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 flex justify-between items-start shrink-0 rounded-t-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <Bookmark size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Category Combos</h2>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                {isCreating ? 'Configure your combo template' : 'Manage your quick-apply sets'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-transparent hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {isCreating ? (
            <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
              
              {/* Top Configuration Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="comboName" className="text-xs font-bold text-slate-500 tracking-widest font-mono uppercase">Combo Name</label>
                  <input 
                    id="comboName"
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Morning Routine"
                    className="w-full px-4 py-3.5 rounded-2xl border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 tracking-widest font-mono uppercase">Combo Color</label>
                  <div className="flex flex-wrap gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 bg-[#f8f9fa] dark:bg-slate-900">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setComboColor(c)}
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${comboColor === c ? 'ring-2 ring-indigo-200 dark:ring-indigo-700 ring-offset-4 dark:ring-offset-slate-900' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      >
                         {comboColor === c && <div className="w-8 h-8 rounded-full border border-white/30" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items Section Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-xs font-bold text-slate-500 tracking-widest font-mono uppercase">Combo Items</label>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} strokeWidth={3} /> Add Log Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.length === 0 ? (
                     <div className="py-10 text-center rounded-2xl bg-[#f8f9fa] dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700">
                       <p className="text-sm font-medium text-slate-500">No items added yet. Click "Add Log Item" to start.</p>
                     </div>
                  ) : (
                    items.map((item, index) => {
                      const selectedCat = categories.find(c => c.id === item.categoryId);
                      return (
                        <div key={index} className="p-5 bg-white border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col xl:flex-row gap-6 shadow-sm">
                          
                          {/* Left Side: Categories */}
                          <div className="flex-1 space-y-6">
                            
                            {/* Category Selection */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-[0.15em] mb-3 block">Select Category</label>
                              <div className="flex flex-wrap gap-2.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {categories.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => updateItem(index, { categoryId: c.id, subCategoryId: undefined })}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${item.categoryId === c.id ? 'bg-[#1e293b] dark:bg-slate-200 text-white dark:text-slate-900 border-transparent shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                                  >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                                    {c.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Sub-Category Selection */}
                            {selectedCat && selectedCat.subCategories.length > 0 && (
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-[0.15em] mb-3 block">Select Sub-Category (Optional)</label>
                                <div className="flex flex-wrap gap-2.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, { subCategoryId: undefined })}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${!item.subCategoryId ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                                  >
                                    Default (General)
                                  </button>
                                  {selectedCat.subCategories.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => updateItem(index, { subCategoryId: s.id })}
                                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${item.subCategoryId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                                    >
                                      {s.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Side: Count & Delete */}
                          <div className="flex items-end justify-between xl:justify-end xl:flex-col gap-4 min-w-[140px] pl-0 xl:pl-6 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-700 pt-4 xl:pt-0">
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 shadow-sm flex-1 xl:flex-none">
                              <span className="text-slate-400 font-mono text-sm">#</span>
                              <input 
                                type="number"
                                min="0"
                                value={item.defaultCount || ''}
                                onChange={e => updateItem(index, { defaultCount: parseInt(e.target.value) || undefined })}
                                placeholder="Count"
                                className="w-full xl:w-16 bg-transparent border-none text-sm font-bold text-slate-700 dark:text-white outline-none"
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-3 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50 rounded-xl transition-all shadow-sm bg-slate-50 dark:bg-slate-900/50"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={reset} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-0.5">
                  {editingCombo ? 'Update Combo Set' : 'Save Combo Set'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryCombos.length === 0 ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 shadow-sm border border-slate-100 dark:border-slate-700">
                    <Bookmark size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No combos created yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm">Create your first combo to automatically log a series of activities at once.</p>
                  <button 
                    onClick={() => setIsCreating(true)} 
                    className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
                  >
                    Create your first combo
                  </button>
                </div>
              ) : (
                categoryCombos.map(combo => (
                  <ComboCard 
                    key={combo.id}
                    combo={combo}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onApply={quickApply}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};