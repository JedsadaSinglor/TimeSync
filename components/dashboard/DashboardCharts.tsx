import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { CustomTooltip, ChartSkeleton } from './DashboardShared';

export const TrendChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
          dy={10} 
          tickFormatter={(val) => {
            const d = new Date(val);
            return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} 
          dx={-10} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area 
          type="monotone" 
          dataKey="minutes" 
          stroke="#6366f1" 
          fillOpacity={1} 
          fill="url(#colorMinutes)" 
          strokeWidth={4} 
          isAnimationActive={false} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const HourlyChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`}
        />
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
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', className: 'dark:fill-slate-800/50' }} />
        <Bar dataKey="minutes" fill="#10b981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
      </BarChart>
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
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`} 
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', className: 'dark:fill-slate-800/50' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false} maxBarSize={60}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Bar>
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
          cy="45%"
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
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
          wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }} 
          iconType="circle" 
          formatter={(value, entry: any) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percent = ((entry.payload.value / total) * 100).toFixed(1);
            return <span className="text-slate-600 dark:text-slate-400">{value} ({percent}%)</span>;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
