
import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { Plus, Settings2, Check, X, Layout as LayoutIcon, RotateCcw } from 'lucide-react';
import { Category, DashboardWidget as WidgetDef, WidgetType } from '../../types';
import { DashboardWidget } from './DashboardWidget';
import { DEFAULT_WIDGETS } from '../../constants';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  widgets: WidgetDef[];
  stats: any;
  categories: Category[];
  chartsReady: boolean;
  onLayoutChange: (widgets: WidgetDef[]) => void;
  onReset: () => void;
}

const WIDGET_OPTIONS: { type: WidgetType; title: string; defaultW: number; defaultH: number }[] = [
  { type: 'STATS_HOURS', title: 'Total Hours', defaultW: 1, defaultH: 1 },
  { type: 'STATS_AVG', title: 'Daily Average', defaultW: 1, defaultH: 1 },
  { type: 'STATS_TOP', title: 'Top Category', defaultW: 1, defaultH: 1 },
  { type: 'LOCATION_STATS', title: 'Work Locations', defaultW: 3, defaultH: 1 },
  { type: 'SESSION_STATS', title: 'Session Stats', defaultW: 1, defaultH: 2 },
  { type: 'PEAK_HOURS', title: 'Peak Hours', defaultW: 1, defaultH: 2 },
  { type: 'WEEKLY_RHYTHM', title: 'Weekly Rhythm', defaultW: 1, defaultH: 2 },
  { type: 'ACTIVITY_BREAKDOWN', title: 'Activity Breakdown', defaultW: 2, defaultH: 4 },
  { type: 'DISTRIBUTION', title: 'Distribution', defaultW: 1, defaultH: 4 },
  { type: 'RECENT_LOGS', title: 'Recent Activity', defaultW: 3, defaultH: 4 },
];

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  widgets, stats, categories, chartsReady, onLayoutChange, onReset 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleLayoutChange = (currentLayout: any[]) => {
    if (!isEditing) return;
    
    const updatedWidgets = widgets.map(w => {
      const l = currentLayout.find(item => item.i === w.id);
      if (l) {
        return { ...w, x: l.x, y: l.y, w: l.w, h: l.h };
      }
      return w;
    });
    
    onLayoutChange(updatedWidgets);
  };

  const handleRemoveWidget = (id: string) => {
    onLayoutChange(widgets.filter(w => w.id !== id));
  };

  const handleAddWidget = (option: typeof WIDGET_OPTIONS[0]) => {
    const newWidget: WidgetDef = {
      id: `w_${Date.now()}`,
      type: option.type,
      title: option.title,
      x: 0,
      y: Infinity, // Put at the bottom
      w: option.defaultW,
      h: option.defaultH,
    };
    onLayoutChange([...widgets, newWidget]);
    setShowAddMenu(false);
  };

  const layout = useMemo(() => widgets.map(w => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    minW: 1,
    minH: 1,
  })), [widgets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <LayoutIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Custom View</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personalize your analytics</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {isEditing ? (
            <>
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                <Plus size={18} /> Add Widget
              </button>
              <button 
                onClick={onReset}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                title="Reset to Default"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
              >
                <Check size={18} /> Save Layout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full md:w-auto px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
            >
              <Settings2 size={18} /> Customize
            </button>
          )}
        </div>
      </div>

      {showAddMenu && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl animate-scale-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Add Widget</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a component to add to your dashboard</p>
            </div>
            <button onClick={() => setShowAddMenu(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {WIDGET_OPTIONS.map(option => (
              <button
                key={option.type}
                onClick={() => handleAddWidget(option)}
                className="p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[2rem] text-left hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} className="text-indigo-500" />
                </div>
                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{option.title}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {option.defaultW}x{option.defaultH}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`-mx-4 ${isEditing ? 'cursor-default' : ''}`}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 3, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={150}
          draggableHandle=".cursor-grab"
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
          margin={[24, 24]}
        >
          {widgets.map(w => (
            <div key={w.id}>
              <DashboardWidget 
                widget={w} 
                stats={stats} 
                categories={categories}
                chartsReady={chartsReady} 
                isEditing={isEditing}
                onRemove={handleRemoveWidget}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};
