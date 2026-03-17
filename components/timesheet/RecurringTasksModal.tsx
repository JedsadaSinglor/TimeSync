import React, { useState, useEffect } from 'react';
import { X, Repeat, Plus, Trash2, Calendar, Check, Clock, CalendarDays, ArrowRight, Bookmark } from 'lucide-react';
import { Category, RecurringTask, RecurrenceFrequency } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface RecurringTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RecurringTasksModal: React.FC<RecurringTasksModalProps> = ({ isOpen, onClose, categories }) => {
  const { recurringTasks, addRecurringTask, deleteRecurringTask, currentUser, categoryCombos } = useApp();
  const [activeTab, setActiveTab] = useState<'LIST' | 'NEW'>('LIST');
  const [creationMode, setCreationMode] = useState<'SINGLE' | 'COMBO'>('SINGLE');
  
  // Form State
  const [catId, setCatId] = useState('');
  const [subId, setSubId] = useState('');
  const [selectedComboId, setSelectedComboId] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('DAILY');
  const [count, setCount] = useState<number>(1);
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
        setCatId(categories[0]?.id || '');
        setSubId('');
        setSelectedComboId(categoryCombos[0]?.id || '');
        setActiveTab('LIST');
        setCreationMode('SINGLE');
        setWeekDays([1, 2, 3, 4, 5]);
        setDayOfMonth(1);
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setCount(1);
    }
  }, [isOpen, categories, categoryCombos]);

  if (!isOpen) return null;

  const toggleWeekDay = (dayIndex: number) => {
      setWeekDays(prev => 
          prev.includes(dayIndex) 
              ? prev.filter(d => d !== dayIndex) 
              : [...prev, dayIndex].sort()
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (creationMode === 'SINGLE') {
          if (!catId) return;
          const newTask: RecurringTask = {
              id: `rt_${Date.now()}`,
              userId: currentUser.id,
              categoryId: catId,
              subCategoryId: subId || 'general',
              frequency,
              weekDays: frequency === 'WEEKLY' ? weekDays : undefined,
              dayOfMonth: frequency === 'MONTHLY' ? dayOfMonth : undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              durationMinutes: 0,
              count: count,
              notes: ''
          };
          addRecurringTask(newTask);
      } else {
          const combo = categoryCombos.find(c => c.id === selectedComboId);
          if (!combo) return;
          
          combo.items.forEach((item, idx) => {
              const newTask: RecurringTask = {
                  id: `rt_${Date.now()}_${idx}`,
                  userId: currentUser.id,
                  categoryId: item.categoryId,
                  subCategoryId: item.subCategoryId || 'general',
                  frequency,
                  weekDays: frequency === 'WEEKLY' ? weekDays : undefined,
                  dayOfMonth: frequency === 'MONTHLY' ? dayOfMonth : undefined,
                  startDate: startDate || undefined,
                  endDate: endDate || undefined,
                  durationMinutes: 0,
                  count: (item.defaultCount || 1) * count,
                  notes: `From combo: ${combo.name}`
              };
              addRecurringTask(newTask);
          });
      }
      
      setActiveTab('LIST');
  };

  const getRecurrenceSummary = (task: RecurringTask) => {
      if (task.frequency === 'DAILY') return 'Every day';
      if (task.frequency === 'WEEKLY') {
          if (!task.weekDays || task.weekDays.length === 7) return 'Every day';
          if (task.weekDays.length === 5 && !task.weekDays.includes(0) && !task.weekDays.includes(6)) return 'Weekdays (Mon-Fri)';
          if (task.weekDays.length === 2 && task.weekDays.includes(0) && task.weekDays.includes(6)) return 'Weekends';
          return 'Weekly on ' + task.weekDays.map(d => WEEKDAYS[d]).join(', ');
      }
      if (task.frequency === 'MONTHLY') return `Monthly on day ${task.dayOfMonth}`;
      return task.frequency;
  };

  const myTasks = recurringTasks.filter(t => t.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
               <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                   <Repeat className="text-indigo-500" size={24} /> Routines
               </h3>
               <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500" aria-label="Close Modal"><X size={20}/></button>
           </div>
           
           <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
               <button 
                onClick={() => setActiveTab('LIST')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'LIST' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                   My Routines ({myTasks.length})
               </button>
               <button 
                onClick={() => setActiveTab('NEW')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'NEW' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                   <Plus size={16} className="inline mb-0.5 mr-1" /> Add New
               </button>
           </div>

           <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-900/50">
               {activeTab === 'LIST' ? (
                   <div className="space-y-3">
                       {myTasks.length === 0 && (
                           <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                   <Repeat size={32} className="opacity-40" />
                               </div>
                               <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No routines yet</h4>
                               <p className="font-medium text-sm max-w-xs mx-auto mb-6">Set up recurring tasks to automatically fill your timesheet.</p>
                               <button onClick={() => setActiveTab('NEW')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all hover:-translate-y-0.5">Create Routine</button>
                           </div>
                       )}
                       {myTasks.map(task => {
                           const cat = categories.find(c => c.id === task.categoryId);
                           const sub = cat?.subCategories.find(s => s.id === task.subCategoryId)?.name || (task.subCategoryId === 'general' ? 'General' : '');
                           return (
                               <div key={task.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                   <div className="absolute top-0 left-0 w-1.5 h-full" style={{backgroundColor: cat?.color}}></div>
                                   <div className="flex justify-between items-start pl-3">
                                       <div>
                                           <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-bold text-slate-800 dark:text-white text-lg">{cat?.name}</span>
                                                {sub && <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{sub}</span>}
                                           </div>
                                           <div className="space-y-1">
                                                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                    <Repeat size={12} />
                                                    {getRecurrenceSummary(task)}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                    <Check size={12} />
                                                    <span>{task.count || 1} attempts</span>
                                                </div>
                                                {(task.startDate || task.endDate) && (
                                                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 mt-1">
                                                        <CalendarDays size={10} />
                                                        {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Start'} 
                                                        <ArrowRight size={8} /> 
                                                        {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Forever'}
                                                    </div>
                                                )}
                                           </div>
                                       </div>
                                       <button onClick={() => deleteRecurringTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" aria-label="Delete Routine">
                                           <Trash2 size={18} />
                                       </button>
                                   </div>
                               </div>
                           )
                       })}
                   </div>
               ) : (
                   <form onSubmit={handleSubmit} className="space-y-6">
                       {/* Creation Mode Toggle */}
                       <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                           <button 
                               type="button"
                               onClick={() => setCreationMode('SINGLE')}
                               className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${creationMode === 'SINGLE' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                           >
                               Single Task
                           </button>
                           <button 
                               type="button"
                               onClick={() => setCreationMode('COMBO')}
                               className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${creationMode === 'COMBO' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                           >
                               Combo Set
                           </button>
                       </div>

                       {creationMode === 'SINGLE' ? (
                           <div className="space-y-6 animate-fade-in">
                               <div className="space-y-2">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Category</label>
                                   <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                       {categories.map(c => (
                                           <button
                                               key={c.id}
                                               type="button"
                                               onClick={() => { setCatId(c.id); setSubId(''); }}
                                               className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${catId === c.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                                           >
                                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                               {c.name}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                               
                               {categories.find(c => c.id === catId)?.subCategories && categories.find(c => c.id === catId)!.subCategories.length > 0 && (
                                   <div className="space-y-2 animate-fade-in">
                                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Sub-Category</label>
                                       <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                           <button
                                               type="button"
                                               onClick={() => setSubId('')}
                                               className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${subId === '' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                                           >
                                               General
                                           </button>
                                           {categories.find(c => c.id === catId)?.subCategories.map(s => (
                                               <button
                                                   key={s.id}
                                                   type="button"
                                                   onClick={() => setSubId(s.id)}
                                                   className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${subId === s.id ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
                                               >
                                                   {s.name}
                                               </button>
                                           ))}
                                       </div>
                                   </div>
                               )}
                           </div>
                       ) : (
                           <div className="space-y-2 animate-fade-in">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Select Combo Set</label>
                               {categoryCombos.length === 0 ? (
                                   <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-medium">
                                       No combo sets found. Create one in Category Manager first.
                                   </div>
                               ) : (
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                       {categoryCombos.map(combo => (
                                           <div 
                                               key={combo.id}
                                               onClick={() => setSelectedComboId(combo.id)}
                                               className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedComboId === combo.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                                           >
                                               <div className="flex items-center gap-3 mb-2">
                                                   <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: combo.color || '#6366f1' }}>
                                                       <Bookmark size={16} />
                                                   </div>
                                                   <div className="min-w-0 flex-1">
                                                       <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{combo.name}</h4>
                                                       <p className="text-xs text-slate-500 dark:text-slate-400">{combo.items.length} items</p>
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                       )}

                       <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                               <Repeat size={14} /> Frequency
                           </label>
                           <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                               {(['DAILY', 'WEEKLY', 'MONTHLY'] as RecurrenceFrequency[]).map(f => (
                                   <button 
                                    key={f} 
                                    type="button"
                                    onClick={() => setFrequency(f)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${frequency === f ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                   >
                                       {f}
                                   </button>
                               ))}
                           </div>

                           {/* Weekly Options */}
                           {frequency === 'WEEKLY' && (
                               <div className="animate-fade-in pt-2">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Repeat On</label>
                                   <div className="flex justify-between gap-1">
                                       {WEEKDAYS.map((day, index) => {
                                           const isSelected = weekDays.includes(index);
                                           return (
                                               <button
                                                   key={day}
                                                   type="button"
                                                   onClick={() => toggleWeekDay(index)}
                                                   className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                               >
                                                   {day.charAt(0)}
                                               </button>
                                           );
                                       })}
                                   </div>
                               </div>
                           )}

                           {/* Monthly Options */}
                           {frequency === 'MONTHLY' && (
                               <div className="animate-fade-in pt-2">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Day of Month</label>
                                   <div className="flex items-center gap-3">
                                       <input 
                                           type="number" 
                                           min="1" 
                                           max="31" 
                                           value={dayOfMonth} 
                                           onChange={e => setDayOfMonth(parseInt(e.target.value) || 1)}
                                           className="w-20 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                       />
                                       <span className="text-sm font-medium text-slate-500">of every month</span>
                                   </div>
                               </div>
                           )}
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
                               <input 
                                   type="date" 
                                   value={startDate} 
                                   onChange={e => setStartDate(e.target.value)} 
                                   className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">End Date (Optional)</label>
                               <input 
                                   type="date" 
                                   value={endDate} 
                                   onChange={e => setEndDate(e.target.value)} 
                                   className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                               />
                           </div>
                       </div>

                       <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                               {creationMode === 'SINGLE' ? 'Attempts' : 'Combo Set Attempts'}
                           </label>
                           <div className="relative">
                               <Check className="absolute left-3 top-3.5 text-slate-400" size={16} />
                               <input 
                                   type="number" 
                                   min="1" 
                                   value={count} 
                                   onChange={e => setCount(parseInt(e.target.value) || 1)} 
                                   className="w-full p-3 pl-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                               />
                           </div>
                       </div>

                       <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
                           <Check size={20} /> Save Routine
                       </button>
                   </form>
               )}
           </div>
       </div>
    </div>
  );
};
