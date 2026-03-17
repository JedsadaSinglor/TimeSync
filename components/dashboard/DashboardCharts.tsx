import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { CustomTooltip, ChartSkeleton } from './DashboardShared';

export const TrendChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} tickFormatter={(val) => {
            const d = new Date(val);
            return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => `${(val/60).toFixed(0)}h`} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="minutes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMinutes)" strokeWidth={3} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const HourlyChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', className: 'dark:fill-slate-800/50' }} />
        <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const WeeklyChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <PolarAngleAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
        <Radar name="Minutes" dataKey="minutes" stroke="#10b981" fill="#10b981" fillOpacity={0.4} isAnimationActive={false} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const BreakdownChart = ({ data, stacks, ready }: { data: any[], stacks: string[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val}h`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', className: 'dark:fill-slate-800/50' }} />
        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
        {stacks.map((stack, index) => (
            <Bar key={stack} dataKey={stack} stackId="a" fill={COLORS[index % COLORS.length]} radius={index === stacks.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} isAnimationActive={false} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DistributionChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};
