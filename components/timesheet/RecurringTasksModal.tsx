
import React, { useState, useEffect } from 'react';
import { X, Repeat, Plus, Trash2 } from 'lucide-react';
import { Category, RecurringTask, RecurrenceFrequency } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface RecurringTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export const RecurringTasksModal: React.FC<RecurringTasksModalProps> = ({ isOpen, onClose, categories }) => {
  const { recurringTasks, addRecurringTask, deleteRecurringTask, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'LIST' | 'NEW'>('LIST');
  
  // Form State
  const [catId, setCatId] = useState('');
  const [subId, setSubId] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('WEEKLY');
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [duration, setDuration] = useState<number>(60);
  const [count, setCount] = useState<number>(0); // For qty based
  const [notes, setNotes] = useState('');

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
        setCatId(categories[0]?.id || '');
        setSubId('');
        setWeekDays([1, 2, 3, 4, 5]); // Mon-Fri
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!catId) return;
      
      const category = categories.find(c => c.id === catId);
      const subCategory = category?.subCategories.find(s => s.id === subId);
      const isQty = (subCategory?.minutes || 0) > 0;

      const newTask: RecurringTask = {
          id: `rt_${Date.now()}`,
          userId: currentUser.id,
          categoryId: catId,
          subCategoryId: subId || 'general',
          frequency,
          weekDays: frequency === 'WEEKLY' ? weekDays : undefined,
          dayOfMonth: frequency === 'MONTHLY' ? dayOfMonth : undefined,
          durationMinutes: isQty ? (count * (subCategory?.minutes || 0)) : duration,
          count: isQty ? count : undefined,
          notes: notes
      };
      
      addRecurringTask(newTask);
      setActiveTab('LIST');
  };

  const toggleWeekDay = (day: number) => {
      setWeekDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const myTasks = recurringTasks.filter(t => t.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
               <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                   <Repeat className="text-indigo-500" size={24} /> Recurring Tasks
               </h3>
               <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"><X size={20}/></button>
           </div>
           
           <div className="flex border-b border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => setActiveTab('LIST')}
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'LIST' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
               >
                   My Tasks ({myTasks.length})
               </button>
               <button 
                onClick={() => setActiveTab('NEW')}
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'NEW' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
               >
                   <Plus size={16} className="inline mb-0.5" /> Create New
               </button>
           </div>

           <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-900/50">
               {activeTab === 'LIST' ? (
                   <div className="space-y-4">
                       {myTasks.length === 0 && (
                           <div className="text-center py-12 text-slate-400">
                               <Repeat size={48} className="mx-auto mb-4 opacity-20" />
                               <p className="font-medium">No recurring tasks set up.</p>
                               <button onClick={() => setActiveTab('NEW')} className="mt-4 text-indigo-500 font-bold text-sm hover:underline">Create your first routine</button>
                           </div>
                       )}
                       {myTasks.map(task => {
                           const cat = categories.find(c => c.id === task.categoryId);
                           const sub = cat?.subCategories.find(s => s.id === task.subCategoryId)?.name || (task.subCategoryId === 'general' ? 'General' : '');
                           return (
                               <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center group">
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: cat?.color}}></span>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{cat?.name}</span>
                                            {sub && <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{sub}</span>}
                                       </div>
                                       <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                                           <span className="font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">{task.frequency}</span>
                                           <span>
                                               {task.frequency === 'WEEKLY' && task.weekDays?.map(d => ['S','M','T','W','T','F','S'][d]).join(', ')}
                                               {task.frequency === 'MONTHLY' && `Day ${task.dayOfMonth}`}
                                           </span>
                                           <span>• {task.durationMinutes}m</span>
                                       </div>
                                   </div>
                                   <button onClick={() => deleteRecurringTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                       <Trash2 size={18} />
                                   </button>
                               </div>
                           )
                       })}
                   </div>
               ) : (
                   <form onSubmit={handleSubmit} className="space-y-5">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                               <select value={catId} onChange={e => { setCatId(e.target.value); setSubId(''); }} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                           </div>
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Sub-Category</label>
                               <select value={subId} onChange={e => setSubId(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                                   <option value="">General</option>
                                   {categories.find(c => c.id === catId)?.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                               </select>
                           </div>
                       </div>

                       <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase">Frequency</label>
                           <div className="flex gap-2">
                               {(['DAILY', 'WEEKLY', 'MONTHLY'] as RecurrenceFrequency[]).map(f => (
                                   <button 
                                    key={f} 
                                    type="button"
                                    onClick={() => setFrequency(f)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${frequency === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                   >
                                       {f}
                                   </button>
                               ))}
                           </div>
                       </div>

                       {frequency === 'WEEKLY' && (
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Repeat On</label>
                               <div className="flex justify-between gap-1">
                                   {['S','M','T','W','T','F','S'].map((d, i) => (
                                       <button
                                        key={i}
                                        type="button"
                                        onClick={() => toggleWeekDay(i)}
                                        className={`w-9 h-9 rounded-lg text-xs font-black transition-colors ${weekDays.includes(i) ? 'bg-indigo-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                                       >
                                           {d}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       )}

                       {frequency === 'MONTHLY' && (
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Day of Month</label>
                               <input type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(parseInt(e.target.value))} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                           </div>
                       )}

                       <div className="grid grid-cols-2 gap-4">
                           {(() => {
                               const cat = categories.find(c => c.id === catId);
                               const sub = cat?.subCategories.find(s => s.id === subId);
                               const isQty = (sub?.minutes || 0) > 0;
                               if (isQty) {
                                   return (
                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                                         <input type="number" min="1" value={count} onChange={e => setCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                         <p className="text-[10px] text-slate-400">Total: {count * (sub?.minutes || 0)} mins</p>
                                     </div>
                                   )
                               }
                               return (
                                 <div className="space-y-2">
                                     <label className="text-xs font-bold text-slate-500 uppercase">Duration (mins)</label>
                                     <input type="number" min="1" step="15" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                 </div>
                               )
                           })()}
                           
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                               <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
                           </div>
                       </div>

                       <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5">
                           Add Recurring Task
                       </button>
                   </form>
               )}
           </div>
       </div>
    </div>
  );
};
