
import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { Plus, Settings2, Check, X, Layout as LayoutIcon, RotateCcw } from 'lucide-react';
import { DashboardWidget as WidgetDef, WidgetType } from '../../types';
import { DashboardWidget } from './DashboardWidget';
import { DEFAULT_WIDGETS } from '../../constants';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  widgets: WidgetDef[];
  stats: any;
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
  widgets, stats, chartsReady, onLayoutChange, onReset 
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <LayoutIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Custom Dashboard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personalize your analytics view</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                <Plus size={16} /> Add Widget
              </button>
              <button 
                onClick={onReset}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Reset to Default"
              >
                <RotateCcw size={18} />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
              >
                <Check size={16} /> Done
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Settings2 size={16} /> Customize
            </button>
          )}
        </div>
      </div>

      {showAddMenu && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl animate-scale-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Available Widgets</h3>
            <button onClick={() => setShowAddMenu(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {WIDGET_OPTIONS.map(option => (
              <button
                key={option.type}
                onClick={() => handleAddWidget(option)}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-left hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition-all group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{option.title}</p>
                <p className="text-[10px] text-slate-400 mt-1">Size: {option.defaultW}x{option.defaultH}</p>
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
