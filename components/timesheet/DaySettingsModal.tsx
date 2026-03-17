import React, { useState, useEffect } from 'react';
import { X, Settings, MapPin, Building2, Home, Briefcase, CheckSquare, Calendar, Palmtree, Coffee } from 'lucide-react';
import { DayConfig, WorkLocation } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { getLocalDateStr } from '../../utils/storage';

interface DaySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    dateObj: Date;
    config: DayConfig | undefined;
    onSave: (config: DayConfig) => void;
}

export const DaySettingsModal: React.FC<DaySettingsModalProps> = ({ isOpen, onClose, dateObj, config, onSave }) => {
    const { currentUser } = useApp();
    const [workLocation, setWorkLocation] = useState<WorkLocation | undefined>(config?.workLocation || 'WFO');
    const [isHoliday, setIsHoliday] = useState(config?.isHoliday || false);
    const [holidayName, setHolidayName] = useState(config?.holidayName || '');
    const [isWorkingDay, setIsWorkingDay] = useState(config?.isWorkingDay || false);

    useEffect(() => {
        if(isOpen) {
            setWorkLocation(config?.workLocation || 'WFO');
            setIsHoliday(config?.isHoliday || false);
            setHolidayName(config?.holidayName || '');
            setIsWorkingDay(config?.isWorkingDay || false);
        }
    }, [isOpen, config]);

    const handleSave = () => {
        onSave({
            id: config?.id || `${currentUser.id}_${getLocalDateStr(dateObj)}`,
            userId: currentUser.id,
            date: getLocalDateStr(dateObj),
            workLocation,
            isHoliday,
            holidayName: isHoliday ? holidayName : undefined,
            isWorkingDay: isWorkingDay
        });
        onClose();
    };

    if (!isOpen) return null;

    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 flex flex-col animate-scale-up overflow-hidden relative">
                
                {/* Header with Date Context */}
                <div className="relative p-6 pb-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Calendar size={120} />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                         <div>
                            <div className="flex items-center gap-2 text-indigo-200 font-bold uppercase tracking-wider text-xs mb-1">
                                <Settings size={14} /> Day Settings
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">{dateObj.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
                            <p className="text-indigo-100 font-medium text-lg">{dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                         </div>
                         <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm" aria-label="Close Modal">
                             <X size={20} />
                         </button>
                    </div>
                </div>

                <div className="p-6 -mt-6 bg-white dark:bg-slate-900 rounded-t-[2rem] relative z-20 space-y-6">
                    
                    {/* Status Selection Grid */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Day Status</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => { setIsHoliday(false); setIsWorkingDay(true); }}
                                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden
                                    ${!isHoliday && isWorkingDay 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl w-fit mb-3 transition-colors ${!isHoliday && isWorkingDay ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <Briefcase size={20} />
                                </div>
                                <div className="font-bold text-slate-800 dark:text-white">Working Day</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">Regular work schedule</div>
                                { !isHoliday && isWorkingDay && <div className="absolute top-3 right-3 text-indigo-500"><CheckSquare size={18} /></div> }
                            </button>

                            <button 
                                onClick={() => { setIsHoliday(true); setIsWorkingDay(false); }}
                                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden
                                    ${isHoliday 
                                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                                        : 'border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl w-fit mb-3 transition-colors ${isHoliday ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <Palmtree size={20} />
                                </div>
                                <div className="font-bold text-slate-800 dark:text-white">Holiday / Leave</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">Time off or public holiday</div>
                                { isHoliday && <div className="absolute top-3 right-3 text-rose-500"><CheckSquare size={18} /></div> }
                            </button>
                        </div>
                    </div>

                    {/* Conditional Settings based on Status */}
                    <div className="animate-fade-in">
                        {isHoliday ? (
                            <div className="space-y-3 bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                <label htmlFor="holiday-name" className="text-xs font-bold text-rose-500 uppercase tracking-wider">Holiday Details</label>
                                <input 
                                    id="holiday-name"
                                    autoFocus
                                    value={holidayName} 
                                    onChange={e => setHolidayName(e.target.value)}
                                    placeholder="e.g. New Year, Sick Leave, Vacation..."
                                    className="w-full p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold placeholder:font-normal outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Work Location</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['WFO', 'WFH', 'SITE', 'OTHER'] as WorkLocation[]).map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => setWorkLocation(loc)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200
                                                ${workLocation === loc 
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                                                }
                                            `}
                                        >
                                            {loc === 'WFO' && <Building2 size={20}/>}
                                            {loc === 'WFH' && <Home size={20}/>}
                                            {loc === 'SITE' && <MapPin size={20}/>}
                                            {loc === 'OTHER' && <Coffee size={20}/>}
                                            <span className="text-[10px] font-black">{loc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button onClick={handleSave} className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 dark:shadow-indigo-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
