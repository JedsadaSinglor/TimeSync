import { useMemo } from 'react';
import { TimeLog, Category, DayConfig, User } from '../types';

export type TimeRange = 'WEEK' | 'MONTH' | 'YEAR' | 'ALL' | 'CUSTOM';

export const toLocalISOString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateRange = (range: TimeRange, offset: number = 0, customRange?: { start: Date, end: Date }) => {
    if (range === 'CUSTOM' && customRange) {
        if (offset > 0) {
            const diff = customRange.end.getTime() - customRange.start.getTime();
            const start = new Date(customRange.start.getTime() - diff);
            const end = new Date(customRange.end.getTime() - diff);
            start.setHours(0,0,0,0); end.setHours(23,59,59,999);
            return { start, end };
        }
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        start.setHours(0,0,0,0); end.setHours(23,59,59,999);
        return { start, end };
    }
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

export const useDashboardStats = (
    logs: TimeLog[], 
    categories: Category[], 
    currentUser: User | null, 
    dayConfigs: DayConfig[],
    timeRange: TimeRange,
    selectedCategoryId: string,
    selectedSubCategoryId: string,
    chartsReady: boolean,
    customDateRange?: { start: Date, end: Date }
) => {
    const getFilteredLogs = (startDate: Date, endDate: Date) => {
        if (!currentUser) return [];
        const startStr = toLocalISOString(startDate);
        const endStr = toLocalISOString(endDate);
        let filtered = logs.filter(l => l.date >= startStr && l.date <= endStr);
        
        filtered = filtered.filter(l => l.userId === currentUser.id);

        if (selectedCategoryId !== 'ALL') {
            filtered = filtered.filter(l => l.categoryId === selectedCategoryId);
        }
        if (selectedSubCategoryId !== 'ALL') {
            filtered = filtered.filter(l => l.subCategoryId === selectedSubCategoryId);
        }
        return filtered;
    };

    const { start: currStart, end: currEnd } = useMemo(() => getDateRange(timeRange, 0, customDateRange), [timeRange, customDateRange]);
    const currentLogs = useMemo(() => getFilteredLogs(currStart, currEnd), [logs, selectedCategoryId, selectedSubCategoryId, currStart, currEnd, currentUser]);

    const { start: prevStart, end: prevEnd } = useMemo(() => getDateRange(timeRange, 1, customDateRange), [timeRange, customDateRange]);
    const previousLogs = useMemo(() => getFilteredLogs(prevStart, prevEnd), [logs, selectedCategoryId, selectedSubCategoryId, prevStart, prevEnd, currentUser]);

    const totalMinutes = currentLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
    const prevTotalMinutes = previousLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
    const totalHours = (totalMinutes / 60);
    const prevTotalHours = (prevTotalMinutes / 60);

    const activeDays = new Set(currentLogs.map(l => l.date)).size;
    const prevActiveDays = new Set(previousLogs.map(l => l.date)).size;
    const avgHoursPerDay = (totalHours / (activeDays || 1));
    const prevAvgHoursPerDay = (prevTotalHours / (prevActiveDays || 1));

    const getTopCategory = (logData: typeof logs) => {
        const map: Record<string, number> = {};
        logData.forEach(l => {
            const key = selectedCategoryId === 'ALL' ? l.categoryId : (l.subCategoryId || 'general');
            map[key] = (map[key] || 0) + l.durationMinutes;
        });
        const sorted = Object.entries(map).sort((a,b) => b[1] - a[1]);
        if (sorted.length === 0) return { name: 'N/A', minutes: 0 };
        const id = sorted[0][0];
        let name = 'Unknown';
        if (selectedCategoryId === 'ALL') {
            name = categories.find(c => c.id === id)?.name || 'Unknown';
        } else {
            const cat = categories.find(c => c.id === selectedCategoryId);
            const sub = cat?.subCategories.find(s => s.id === id);
            name = sub?.name || (id === 'general' ? 'General' : 'Unknown');
        }
        return { name, minutes: sorted[0][1] };
    };

    const topCat = getTopCategory(currentLogs);
    const prevMinutesForTopCat = previousLogs
        .filter(l => (selectedCategoryId === 'ALL' ? l.categoryId : l.subCategoryId) === (selectedCategoryId === 'ALL' ? categories.find(c => c.name === topCat.name)?.id : categories.find(c => c.id === selectedCategoryId)?.subCategories.find(s => s.name === topCat.name)?.id))
        .reduce((acc, l) => acc + l.durationMinutes, 0);

    const breakdownData = useMemo(() => {
        if (!chartsReady) return [];
        const dataMap: Record<string, Record<string, number | string>> = {};
        const granularity = (timeRange === 'YEAR' || timeRange === 'ALL') ? 'MONTH' : 'DAY';
        const loopStart = new Date(currStart);
        const loopEnd = timeRange === 'ALL' ? new Date() : new Date(currEnd);
        if(timeRange === 'ALL') loopStart.setDate(loopStart.getDate() - 365); 

        let current = new Date(loopStart);
        while (current <= loopEnd) {
            let key = '';
            let label = '';
            if (granularity === 'MONTH') {
                key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                label = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                dataMap[key] = { dateStr: key, label };
                current.setMonth(current.getMonth() + 1);
            } else {
                key = toLocalISOString(current);
                label = timeRange === 'WEEK' ? current.toLocaleDateString('en-US', { weekday: 'short' }) : current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dataMap[key] = { dateStr: key, label };
                current.setDate(current.getDate() + 1);
            }
        }
        currentLogs.forEach(log => {
            let key = granularity === 'MONTH' ? log.date.substring(0, 7) : log.date;
            if (dataMap[key]) {
                let keyName = 'Unknown';
                if (selectedCategoryId === 'ALL') {
                    keyName = categories.find(c => c.id === log.categoryId)?.name || 'Unknown';
                } else {
                    const cat = categories.find(c => c.id === selectedCategoryId);
                    const sub = cat?.subCategories.find(s => s.id === log.subCategoryId);
                    keyName = sub ? sub.name : 'General';
                }
                if (typeof dataMap[key][keyName] !== 'number') dataMap[key][keyName] = 0;
                dataMap[key][keyName] = (dataMap[key][keyName] as number) + log.durationMinutes;
            }
        });
        return Object.values(dataMap).sort((a, b) => String(a.dateStr).localeCompare(String(b.dateStr)));
    }, [chartsReady, currentLogs, currStart, currEnd, timeRange, categories, selectedCategoryId]);

    const distributionData = useMemo(() => {
        if (!chartsReady) return [];
        const map: Record<string, number> = {};
        currentLogs.forEach(l => {
            let name = 'Unknown';
            if (selectedCategoryId === 'ALL') {
                name = categories.find(c => c.id === l.categoryId)?.name || 'Unknown';
            } else {
                const cat = categories.find(c => c.id === selectedCategoryId);
                const sub = cat?.subCategories.find(s => s.id === l.subCategoryId);
                name = sub?.name || 'General';
            }
            map[name] = (map[name] || 0) + l.durationMinutes;
        });
        const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];
        return Object.keys(map).map((name, index) => ({
            name, value: map[name], color: selectedCategoryId === 'ALL' ? categories.find(c => c.name === name)?.color || COLORS[index % COLORS.length] : COLORS[index % COLORS.length]
        })).filter(d => d.value > 0).sort((a,b) => b.value - a.value);
    }, [chartsReady, currentLogs, categories, selectedCategoryId]);

    const trendData = useMemo(() => {
        if (!chartsReady) return [];
        const map: Record<string, number> = {};
        const granularity = (timeRange === 'YEAR' || timeRange === 'ALL') ? 'MONTH' : 'DAY';
        currentLogs.forEach(l => {
            const key = granularity === 'MONTH' ? l.date.substring(0, 7) : l.date;
            map[key] = (map[key] || 0) + l.durationMinutes;
        });
        return Object.keys(map).sort().map(date => ({ date, minutes: map[date] }));
    }, [chartsReady, currentLogs, timeRange]);

    const hourlyData = useMemo(() => {
        if (!chartsReady) return [];
        const hours = Array(24).fill(0).map((_, i) => ({ hour: i, minutes: 0, label: `${i}:00` }));
        currentLogs.forEach(l => {
            if (!l.startTime) return;
            const [startH, startM] = l.startTime.split(':').map(Number);
            if (isNaN(startH) || isNaN(startM)) return;
            
            let remainingMinutes = l.durationMinutes;
            let currentHour = startH;
            let currentMinute = startM;

            while (remainingMinutes > 0 && currentHour < 24) {
                const minutesInThisHour = Math.min(60 - currentMinute, remainingMinutes);
                hours[currentHour].minutes += minutesInThisHour;
                remainingMinutes -= minutesInThisHour;
                currentHour++;
                currentMinute = 0;
            }
        });
        return hours;
    }, [chartsReady, currentLogs]);

    const weeklyData = useMemo(() => {
        if (!chartsReady) return [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayStats = days.map(d => ({ day: d, minutes: 0 }));
        currentLogs.forEach(l => {
            const [year, month, day] = l.date.split('-').map(Number);
            const dayIndex = new Date(year, month - 1, day).getDay();
            dayStats[dayIndex].minutes += l.durationMinutes;
        });
        return dayStats;
    }, [chartsReady, currentLogs]);

    const sessionStats = useMemo(() => {
        if (currentLogs.length === 0) return { avg: 0, longest: 0, longestDate: '-' };
        const avg = currentLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / currentLogs.length;
        const longest = Math.max(...currentLogs.map(l => l.durationMinutes));
        const longestLog = currentLogs.find(l => l.durationMinutes === longest);
        return { avg, longest, longestDate: longestLog ? longestLog.date : '-' };
    }, [currentLogs]);

    const locationStats = useMemo(() => {
        const stats = { WFO: 0, WFH: 0, SITE: 0, OTHER: 0, HOLIDAY: 0 };
        if (!currentUser) return stats;
        const startStr = toLocalISOString(currStart);
        const endStr = toLocalISOString(currEnd);
        
        const configs = dayConfigs.filter(d => 
            d.userId === currentUser.id && 
            d.date >= startStr && 
            d.date <= endStr
        );

        configs.forEach(c => {
            if (c.isHoliday) stats.HOLIDAY++;
            else if (c.workLocation) stats[c.workLocation]++;
        });
        return stats;
    }, [dayConfigs, currStart, currEnd, currentUser]);

    const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);
    const stacks = useMemo(() => {
        if (selectedCategoryId === 'ALL') return categories.map(c => c.name);
        if (!selectedCategoryObj) return [];
        return ['General', ...selectedCategoryObj.subCategories.map(s => s.name)];
    }, [categories, selectedCategoryId, selectedCategoryObj]);

    return {
        currentLogs,
        totalHours,
        prevTotalHours,
        avgHoursPerDay,
        prevAvgHoursPerDay,
        topCat,
        prevMinutesForTopCat,
        breakdownData,
        distributionData,
        trendData,
        hourlyData,
        weeklyData,
        sessionStats,
        locationStats,
        stacks,
        activeDays
    };
};
