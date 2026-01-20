
import React, { useState, useEffect, useMemo } from 'react';
import { X, Settings, MapPin, Building2, Home, Briefcase, CheckSquare, Check } from 'lucide-react';
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
    const { currentUser, dayConfigs, updateDayConfig } = useApp();
    const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK'>('SINGLE');
    const [workLocation, setWorkLocation] = useState<WorkLocation | undefined>(config?.workLocation || 'WFO');
    const [isHoliday, setIsHoliday] = useState(config?.isHoliday || false);
    const [holidayName, setHolidayName] = useState(config?.holidayName || '');
    const [isWorkingDay, setIsWorkingDay] = useState(config?.isWorkingDay || false);
    
    // Bulk Selection State
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        if(isOpen) {
            setWorkLocation(config?.workLocation || 'WFO');
            setIsHoliday(config?.isHoliday || false);
            setHolidayName(config?.holidayName || '');
            setIsWorkingDay(config?.isWorkingDay || false);
            setActiveTab('SINGLE');
            setSelectedDates(new Set());
        }
    }, [isOpen, config]);

    const handleSaveSingle = () => {
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

    const weekendDates = useMemo(() => {
        const dates = [];
        const current = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
        const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 3, 0);

        while (current <= end) {
            const day = current.getDay();
            if (day === 0 || day === 6) { // Sun or Sat
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }, [dateObj]);

    const groupedWeekendDates = useMemo(() => {
        const groups: Record<string, Date[]> = {};
        weekendDates.forEach(d => {
            const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(d);
        });
        return groups;
    }, [weekendDates]);

    const toggleDateSelection = (dateStr: string) => {
        setSelectedDates(prev => {
            const next = new Set(prev);
            if (next.has(dateStr)) next.delete(dateStr);
            else next.add(dateStr);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedDates.size === weekendDates.length) {
            setSelectedDates(new Set());
        } else {
            setSelectedDates(new Set(weekendDates.map(d => getLocalDateStr(d))));
        }
    };

    const applyBulkSettings = (isWorking: boolean, location?: WorkLocation) => {
        selectedDates.forEach(dateStr => {
            const existing = dayConfigs.find(d => d.date === dateStr && d.userId === currentUser.id);
            updateDayConfig({
                id: existing?.id || `${currentUser.id}_${dateStr}`,
                userId: currentUser.id,
                date: dateStr,
                isWorkingDay: isWorking,
                workLocation: location || existing?.workLocation || 'WFO',
                isHoliday: existing?.isHoliday,
                holidayName: existing?.holidayName
            });
        });
        setSelectedDates(new Set());
    };

    if (!isOpen) return null;

    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] animate-scale-up overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Settings className="text-indigo-500" size={20} /> Day Settings
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"><X size={20}/></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <button 
                        onClick={() => setActiveTab('SINGLE')}
                        className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'SINGLE' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Current Date
                    </button>
                    <button 
                        onClick={() => setActiveTab('BULK')}
                        className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'BULK' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Weekend Planner
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {activeTab === 'SINGLE' ? (
                        <div className="p-6 space-y-6">
                            <div className="text-center mb-2">
                                <div className="text-2xl font-black text-slate-800 dark:text-white">
                                    {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
                                </div>
                                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long' })}
                                </div>
                            </div>

                            {/* Work Location */}
                            {!isHoliday && (!isWeekend || isWorkingDay) && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin size={14} /> Work Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['WFO', 'WFH', 'SITE', 'OTHER'] as WorkLocation[]).map(loc => (
                                            <button
                                                key={loc}
                                                onClick={() => setWorkLocation(loc)}
                                                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                                                    ${workLocation === loc 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-700'
                                                    }
                                                `}
                                            >
                                                {loc === 'WFO' && <Building2 size={16}/>}
                                                {loc === 'WFH' && <Home size={16}/>}
                                                {loc === 'SITE' && <Briefcase size={16}/>}
                                                {loc === 'OTHER' && <MapPin size={16}/>}
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Holiday Toggle */}
                            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors -ml-2">
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isHoliday ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-red-400'}`}>
                                        {isHoliday && <CheckSquare size={14} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} />
                                    <span className={`text-sm font-bold ${isHoliday ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>Mark as Holiday</span>
                                </label>
                                
                                {isHoliday && (
                                    <input 
                                        autoFocus
                                        value={holidayName} 
                                        onChange={e => setHolidayName(e.target.value)}
                                        placeholder="Holiday Name (e.g. New Year)"
                                        className="w-full p-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                                    />
                                )}
                            </div>

                            {/* Weekend Override */}
                            {isWeekend && !isHoliday && (
                                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors -ml-2">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isWorkingDay ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-amber-400'}`}>
                                            {isWorkingDay && <CheckSquare size={14} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isWorkingDay} onChange={e => setIsWorkingDay(e.target.checked)} />
                                        <span className={`text-sm font-bold ${isWorkingDay ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>Work on Weekend?</span>
                                    </label>
                                </div>
                            )}

                            <button onClick={handleSaveSingle} className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2">
                                Save Settings
                            </button>
                        </div>
                    ) : (
                        <div className="pb-24"> 
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 sticky top-0 backdrop-blur-md z-10">
                                <div className="flex items-center justify-between">
                                    <button 
                                        onClick={toggleSelectAll} 
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {selectedDates.size === weekendDates.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    <span className="text-xs font-medium text-slate-400">
                                        {selectedDates.size} selected
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 space-y-6">
                                {Object.entries(groupedWeekendDates).map(([month, dates]) => (
                                    <div key={month}>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 ml-1">{month}</h4>
                                        <div className="space-y-2">
                                            {dates.map((date) => {
                                                const dateStr = getLocalDateStr(date);
                                                const config = dayConfigs.find(d => d.date === dateStr && d.userId === currentUser.id);
                                                const isWorking = config?.isWorkingDay || false;
                                                const loc = config?.workLocation || 'WFO';
                                                const isSat = date.getDay() === 6;
                                                const isSelected = selectedDates.has(dateStr);

                                                return (
                                                    <div 
                                                        key={dateStr} 
                                                        onClick={() => toggleDateSelection(dateStr)}
                                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99]
                                                            ${isSelected 
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/20' 
                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                                                                {isSelected && <Check size={14} strokeWidth={3} />}
                                                            </div>
                                                            <div>
                                                                <div className={`text-sm font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-white'}`}>
                                                                    {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                                </div>
                                                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isSat ? 'text-blue-500' : 'text-slate-400'}`}>
                                                                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            {isWorking ? (
                                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${loc === 'WFH' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                                    {loc === 'WFH' ? <Home size={10}/> : <Building2 size={10}/>} {loc}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Off</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bulk Action Bar - Sticky Bottom */}
                {activeTab === 'BULK' && selectedDates.size > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20 animate-slide-up">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Set selected to</span>
                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={() => applyBulkSettings(true, 'WFO')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors gap-1 border border-transparent hover:border-blue-200">
                                    <Building2 size={16} /> <span className="text-[10px] font-bold">WFO</span>
                                </button>
                                <button onClick={() => applyBulkSettings(true, 'WFH')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors gap-1 border border-transparent hover:border-emerald-200">
                                    <Home size={16} /> <span className="text-[10px] font-bold">WFH</span>
                                </button>
                                <button onClick={() => applyBulkSettings(true, 'SITE')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors gap-1 border border-transparent hover:border-amber-200">
                                    <Briefcase size={16} /> <span className="text-[10px] font-bold">Site</span>
                                </button>
                                <button onClick={() => applyBulkSettings(false)} className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors gap-1 border border-transparent hover:border-slate-300">
                                    <X size={16} /> <span className="text-[10px] font-bold">Off</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
