import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';
import { Users, Clock, Activity, Target } from 'lucide-react';

type TimeRange = 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const getDateRange = (range: TimeRange, offset: number = 0) => {
    const now = new Date();
    if (offset > 0) {
        if (range === 'WEEK') now.setDate(now.getDate() - (7 * offset));
        if (range === 'MONTH') now.setMonth(now.getMonth() - offset);
        if (range === 'YEAR') now.setFullYear(now.getFullYear() - offset);
    }
    const start = new Date(now);
    const end = new Date(now);
    if (range === 'WEEK') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff); end.setDate(start.getDate() + 6); 
    } else if (range === 'MONTH') {
      start.setDate(1); end.setMonth(start.getMonth() + 1); end.setDate(0); 
    } else if (range === 'YEAR') {
      start.setMonth(0, 1); end.setMonth(11, 31); 
    } else {
        start.setFullYear(2020, 0, 1); end.setFullYear(2030, 11, 31);
    }
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    return { start, end };
};

export const TeamPerformance: React.FC = () => {
    const { logs, categories, users, teams, currentUser } = useApp();
    const [timeRange, setTimeRange] = useState<TimeRange>('MONTH');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');

    const availableTeams = useMemo(() => {
        if (currentUser.role === 'ADMIN' || currentUser.role === 'GROUP_LEADER') {
            return teams;
        }
        return teams.filter(t => currentUser.teamIds?.includes(t.id));
    }, [teams, currentUser]);

    const teamMembers = useMemo(() => {
        if (selectedTeamId === 'ALL') {
            // Show all users in available teams
            const validTeamIds = new Set(availableTeams.map(t => t.id));
            return users.filter(u => u.teamIds?.some(tid => validTeamIds.has(tid)));
        }
        return users.filter(u => u.teamIds?.includes(selectedTeamId));
    }, [users, selectedTeamId, availableTeams]);

    const { start: currStart, end: currEnd } = useMemo(() => getDateRange(timeRange, 0), [timeRange]);

    const teamLogs = useMemo(() => {
        const startStr = toLocalISOString(currStart);
        const endStr = toLocalISOString(currEnd);
        const memberIds = new Set(teamMembers.map(u => u.id));
        return logs.filter(l => l.date >= startStr && l.date <= endStr && memberIds.has(l.userId));
    }, [logs, currStart, currEnd, teamMembers]);

    const { totalHours, avgHoursPerMember } = useMemo(() => {
        const totalMins = teamLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
        const tHours = totalMins / 60;
        return {
            totalHours: tHours,
            avgHoursPerMember: teamMembers.length > 0 ? tHours / teamMembers.length : 0
        };
    }, [teamLogs, teamMembers]);

    const memberPerformance = useMemo(() => {
        const map: Record<string, number> = {};
        teamLogs.forEach(l => {
            map[l.userId] = (map[l.userId] || 0) + l.durationMinutes;
        });
        return teamMembers.map(m => ({
            name: m.name,
            hours: (map[m.id] || 0) / 60
        })).sort((a, b) => b.hours - a.hours);
    }, [teamLogs, teamMembers]);

    const categoryDistribution = useMemo(() => {
        const map: Record<string, number> = {};
        teamLogs.forEach(l => {
            const cat = categories.find(c => c.id === l.categoryId);
            const name = cat?.name || 'Unknown';
            map[name] = (map[name] || 0) + l.durationMinutes;
        });
        return Object.keys(map).map((name, index) => ({
            name,
            value: map[name] / 60,
            color: categories.find(c => c.name === name)?.color || COLORS[index % COLORS.length]
        })).sort((a,b) => b.value - a.value);
    }, [teamLogs, categories]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto shadow-inner no-scrollbar">
                    {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as TimeRange[]).map(r => (
                        <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap min-w-[100px] ${timeRange === r ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {r === 'WEEK' ? 'This Week' : r === 'MONTH' ? 'This Month' : r === 'YEAR' ? 'This Year' : 'All Time'}
                        </button>
                    ))}
                </div>
                <div className="w-full md:w-64 relative group">
                    <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 pl-4 pr-10 py-3 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 outline-none transition-all hover:border-indigo-300 dark:hover:border-slate-600">
                        <option value="ALL">All My Teams</option>
                        {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Users className="absolute right-3 top-3 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={14} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Clock size={20} /></div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Team Hours</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white">{totalHours.toFixed(1)}<span className="text-lg text-slate-400 ml-1">h</span></p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Users size={20} /></div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Hours / Member</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white">{avgHoursPerMember.toFixed(1)}<span className="text-lg text-slate-400 ml-1">h</span></p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl"><Target size={20} /></div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Members</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800 dark:text-white">{memberPerformance.filter(m => m.hours > 0).length} <span className="text-lg text-slate-400">/ {teamMembers.length}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-slate-400" /> Member Performance
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={memberPerformance} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                                <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="hours" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6 flex items-center gap-2">
                        <Target size={18} className="text-slate-400" /> Team Category Distribution
                    </h3>
                    <div className="h-80 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryDistribution} innerRadius={60} outerRadius={100} paddingAngle={4} cornerRadius={6} dataKey="value">
                                    {categoryDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
