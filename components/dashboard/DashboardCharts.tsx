
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Label
} from 'recharts';
import { CustomTooltip, ChartSkeleton } from './DashboardShared';

export const TrendChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/30" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
          dy={10} 
          tickFormatter={(val) => {
            // Append T00:00:00 to ensure ISO date strings are parsed as local time
            const d = new Date(val.includes('T') ? val : `${val}T00:00:00`);
            return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
          dx={-10} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }} wrapperStyle={{ zIndex: 1000 }} allowEscapeViewBox={{ x: true, y: true }} />
        <Area 
          type="monotone" 
          dataKey="minutes" 
          name="Total Time"
          stroke="#6366f1" 
          fillOpacity={1} 
          fill="url(#colorMinutes)" 
          strokeWidth={3} 
          isAnimationActive={false} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const WeeklyChart = ({ data, ready }: { data: any[], ready: boolean }) => {
  if (!ready) return <ChartSkeleton />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/30" />
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', className: 'dark:fill-slate-800/20' }} wrapperStyle={{ zIndex: 1000 }} allowEscapeViewBox={{ x: true, y: true }} />
        <Bar dataKey="minutes" name="Total Time" fill="url(#barGradient)" radius={[4, 4, 0, 0]} isAnimationActive={false} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const BreakdownChart = ({ data, stacks, categories, ready, onCategoryClick }: { data: any[], stacks: string[], categories: any[], ready: boolean, onCategoryClick?: (name: string) => void }) => {
  if (!ready) return <ChartSkeleton />;
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];
  
  const getColor = (stackName: string, index: number) => {
    const category = categories.find(c => c.name === stackName);
    if (category && category.color) return category.color;
    // For subcategories or if not found, fallback to COLORS array
    return COLORS[index % COLORS.length];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/30" />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
          dy={10} 
          minTickGap={20}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
          tickFormatter={(val) => `${(val/60).toFixed(0)}h`} 
          allowDecimals={false}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ fill: '#f1f5f9', className: 'dark:fill-slate-800/20' }} 
          allowEscapeViewBox={{ x: true, y: true }}
          offset={20}
          wrapperStyle={{ zIndex: 1000 }}
        />
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconType="circle" 
          iconSize={8} 
          wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
          onClick={(e) => onCategoryClick && e.dataKey && onCategoryClick(String(e.dataKey))}
        />
        {stacks.map((stack, index) => (
          <Bar 
            key={stack} 
            dataKey={stack} 
            stackId="a" 
            fill={getColor(stack, index)} 
            isAnimationActive={false} 
            maxBarSize={60}
            barSize={32}
            radius={index === stacks.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            onClick={() => onCategoryClick && onCategoryClick(stack)}
            className={onCategoryClick ? "cursor-pointer transition-opacity hover:opacity-80" : ""}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DistributionChart = ({ data, ready, onCategoryClick }: { data: any[], ready: boolean, onCategoryClick?: (name: string) => void }) => {
  if (!ready) return <ChartSkeleton />;
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="35%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          isAnimationActive={false}
          onClick={(data) => onCategoryClick && onCategoryClick(data.name)}
          className={onCategoryClick ? "cursor-pointer outline-none" : "outline-none"}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" className="hover:opacity-80 transition-opacity" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip totalValue={totalValue} />} wrapperStyle={{ zIndex: 1000 }} allowEscapeViewBox={{ x: true, y: true }} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="center" 
          wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingLeft: '30px' }} 
          iconType="circle" 
          iconSize={10}
          onClick={(e) => onCategoryClick && e.value && onCategoryClick(String(e.value))}
          formatter={(value, entry: any) => {
            const percent = totalValue > 0 ? ((entry.payload.value / totalValue) * 100).toFixed(1) : '0.0';
            return (
              <span className={`text-slate-600 dark:text-slate-400 ml-2 ${onCategoryClick ? 'cursor-pointer hover:text-indigo-500 transition-colors' : ''}`}>
                {value} <span className="text-slate-400 dark:text-slate-600 font-mono text-[10px]">[{percent}%]</span>
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
