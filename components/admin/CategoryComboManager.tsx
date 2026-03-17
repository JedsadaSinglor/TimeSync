
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { CategoryCombo, CategoryComboItem, TimeLog } from '../../types';
import { Plus, X, Trash2, Edit2, Check, Layers, Bookmark, Clock, Hash, ChevronDown, ChevronRight, Play, Send } from 'lucide-react';
import { PRESET_COLORS } from './CategoryCard';
import { getLocalDateStr } from '../../utils/storage';

interface CategoryComboManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryComboManager: React.FC<CategoryComboManagerProps> = ({ isOpen, onClose }) => {
  const { categories, categoryCombos, addCategoryCombo, updateCategoryCombo, deleteCategoryCombo, currentUser, batchAddLogs } = useApp();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCombo, setEditingCombo] = useState<CategoryCombo | null>(null);
  const [name, setName] = useState('');
  const [comboColor, setComboColor] = useState(PRESET_COLORS[0]);
  const [items, setItems] = useState<CategoryComboItem[]>([]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Please enter a name for the combo', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Please add at least one item to the combo', 'error');
      return;
    }

    const comboData: CategoryCombo = {
      id: editingCombo?.id || `combo_${Date.now()}`,
      userId: currentUser.id,
      name,
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

  const handleEdit = (e: React.MouseEvent, combo: CategoryCombo) => {
    e.stopPropagation();
    setEditingCombo(combo);
    setName(combo.name);
    setComboColor(combo.color || PRESET_COLORS[0]);
    setItems(combo.items || []);
    setIsCreating(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCategoryCombo(id);
    showToast('Combo deleted', 'info');
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <Bookmark size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Category Combos</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {isCreating ? 'Configure your combo template' : 'Manage your quick-apply sets'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
              >
                <Plus size={18} /> Create New
              </button>
            )}
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
          {isCreating ? (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Combo Name</label>
                    <input 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Morning Routine"
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Combo Color</label>
                    <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setComboColor(c)}
                          className={`w-7 h-7 rounded-full transition-all ${comboColor === c ? 'scale-110 ring-4 ring-indigo-500/30 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Combo Items</label>
                    <button 
                      onClick={addItem}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <p className="text-sm font-medium text-slate-400">No items added yet. Click "Add Item" to start.</p>
                      </div>
                    )}
                    {items.map((item, index) => {
                      const selectedCat = categories.find(c => c.id === item.categoryId);
                      return (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 animate-fade-in">
                          <div className="flex-1 min-w-[200px] space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Category</label>
                              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {categories.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => updateItem(index, { categoryId: c.id, subCategoryId: undefined })}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${item.categoryId === c.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                                  >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                    {c.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {selectedCat && selectedCat.subCategories.length > 0 && (
                              <div className="space-y-2 animate-fade-in">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Sub-Category</label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, { subCategoryId: undefined })}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!item.subCategoryId ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                                  >
                                    All Sub-categories
                                  </button>
                                  {selectedCat.subCategories.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => updateItem(index, { subCategoryId: s.id })}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${item.subCategoryId === s.id ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                                    >
                                      {s.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                              <Hash size={14} className="text-slate-400" />
                              <input 
                                type="number"
                                value={item.defaultCount || ''}
                                onChange={e => updateItem(index, { defaultCount: parseInt(e.target.value) || undefined })}
                                placeholder="Attempts"
                                className="w-20 bg-transparent border-none text-xs font-bold text-slate-700 dark:text-white outline-none"
                              />
                            </div>
                            <button 
                              onClick={() => removeItem(index)}
                              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={reset}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
                >
                  {editingCombo ? 'Update Combo Set' : 'Save Combo Set'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryCombos.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Bookmark size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No combos created yet</h3>
                  <p className="text-slate-400 font-medium mb-8">Create your first combo to start organizing your time efficiently.</p>
                  <button onClick={() => setIsCreating(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                    Create your first combo
                  </button>
                </div>
              ) : (
                categoryCombos.map(combo => (
                  <div 
                    key={combo.id} 
                    className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform" style={{ backgroundColor: combo.color || PRESET_COLORS[0], boxShadow: `0 12px 24px -6px ${combo.color || PRESET_COLORS[0]}50` }}>
                          <Play size={24} fill="currentColor" />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => handleEdit(e, combo)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={(e) => handleDelete(e, combo.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white truncate mb-1">{combo.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{combo.items.length} items in set</p>
                      </div>

                      <div className="space-y-2">
                        {combo.items.slice(0, 4).map((item, i) => {
                          const cat = categories.find(c => c.id === item.categoryId);
                          if (!cat) return null;
                          return (
                            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="truncate">{cat.name}</span>
                              {item.defaultCount && <span className="ml-auto text-[10px] text-slate-400">x{item.defaultCount}</span>}
                            </div>
                          );
                        })}
                        {combo.items.length > 4 && (
                          <p className="text-[10px] font-black text-indigo-500 mt-2">+{combo.items.length - 4} more items</p>
                        )}
                      </div>
                    </div>

                    <div className="flex border-t border-slate-100 dark:border-slate-700">
                      <input 
                        type="number" 
                        min="1" 
                        defaultValue="1" 
                        id={`combo-manager-multiplier-${combo.id}`}
                        className="w-16 py-5 px-3 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 text-center outline-none focus:bg-white dark:focus:bg-slate-800 transition-colors border-r border-slate-100 dark:border-slate-700"
                        title="Attempts"
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById(`combo-manager-multiplier-${combo.id}`) as HTMLInputElement;
                          const multiplier = parseInt(input?.value || '1', 10);
                          quickApply(combo, multiplier);
                        }}
                        className="flex-1 py-5 bg-slate-50 dark:bg-slate-800/50 text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <Send size={14} /> Apply to Today
                      </button>
                    </div>
                  </div>
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
