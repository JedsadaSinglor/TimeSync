
import React, { useState, useEffect } from 'react';
import { ResponsiveGridLayout, useContainerWidth, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Category, DashboardWidget as WidgetDef } from '../../types';
import { DashboardWidget } from './DashboardWidget';
import { Settings2, Check } from 'lucide-react';

interface DashboardGridProps {
  widgets: WidgetDef[];
  stats: any;
  categories: Category[];
  chartsReady: boolean;
  onLayoutChange?: (widgets: WidgetDef[]) => void;
  onReset?: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  widgets, stats, categories, chartsReady, onLayoutChange, onReset
}) => {
  const { width, containerRef, mounted } = useContainerWidth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentLayouts, setCurrentLayouts] = useState<{ [key: string]: Layout }>({
    lg: widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))
  });

  useEffect(() => {
    setCurrentLayouts({
      lg: widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))
    });
  }, [widgets]);

  const handleLayoutChange = (layout: Layout, layouts: { [key: string]: Layout }) => {
    setCurrentLayouts(layouts);
    if (onLayoutChange) {
      const updatedWidgets = widgets.map(w => {
        const l = layout.find(item => item.i === w.id);
        if (l) {
          return { ...w, x: l.x, y: l.y, w: l.w, h: l.h };
        }
        return w;
      });
      onLayoutChange(updatedWidgets);
    }
  };

  return (
    <div className="w-full space-y-4" ref={containerRef as any}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard Overview</h2>
        <div className="flex gap-2">
          {isEditing && onReset && (
            <button 
              onClick={onReset}
              className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Reset Layout
            </button>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isEditing 
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {isEditing ? (
              <><Check size={16} /> Done Editing</>
            ) : (
              <><Settings2 size={16} /> Customize Layout</>
            )}
          </button>
        </div>
      </div>

      <div className="w-full">
        {mounted && (
          <ResponsiveGridLayout
            width={width}
            className="layout"
            layouts={currentLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={180}
            onLayoutChange={handleLayoutChange}
            dragConfig={{ enabled: isEditing, handle: '.drag-handle' }}
            resizeConfig={{ enabled: isEditing }}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            positionStrategy={{ type: 'transform', scale: 1, calcStyle: (pos) => ({ transform: `translate(${pos.left}px, ${pos.top}px)`, width: `${pos.width}px`, height: `${pos.height}px`, position: 'absolute' }) }}
          >
            {widgets.map(w => (
              <div key={w.id}>
                <DashboardWidget 
                  widget={w} 
                  stats={stats} 
                  categories={categories}
                  chartsReady={chartsReady} 
                  isEditing={isEditing}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
};
