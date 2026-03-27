import React, { useState, useEffect } from 'react';
import { ResponsiveGridLayout, useContainerWidth, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Category, DashboardWidget as WidgetDef } from '../../types';
import { DashboardWidget } from './DashboardWidget';
import { Settings2, Check, RotateCcw, LayoutDashboard, Info } from 'lucide-react';

interface DashboardGridProps {
  widgets: WidgetDef[];
  stats: any;
  categories: Category[];
  chartsReady: boolean;
  onLayoutChange?: (widgets: WidgetDef[]) => void;
  onReset?: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onCategoryClick?: (categoryName: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  widgets, stats, categories, chartsReady, onLayoutChange, onReset, isEditing, setIsEditing, onCategoryClick
}) => {
  const { width, containerRef, mounted } = useContainerWidth();
  const [currentLayouts, setCurrentLayouts] = useState<{ [key: string]: Layout }>({
    lg: widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))
  });

  // Sync external widget changes to internal layout state
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
    <div className="w-full flex flex-col gap-4">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <LayoutDashboard size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Dashboard Overview
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isEditing && onReset && (
            <button 
              onClick={onReset}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
              title="Revert to default layout"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset Layout</span>
            </button>
          )}
        </div>
      </div>

      {/* Editing Mode Helper Banner */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isEditing ? 'max-h-20 opacity-100 mb-2' : 'max-h-0 opacity-0 m-0'}`}
      >
        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
          <Info size={18} className="text-indigo-500 shrink-0" />
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
            <strong>Edit Mode Active:</strong> Drag widgets by their headers to reorganize. Pull the bottom-right corners to resize them.
          </p>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div 
        ref={containerRef as any}
        className={`w-full min-h-[400px] rounded-[2.5rem] transition-all duration-500 ${
          isEditing 
            ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] border-2 border-indigo-200 dark:border-indigo-500/30 p-2 -mx-2' 
            : 'bg-transparent border-2 border-transparent p-0 mx-0'
        }`}
      >
        {mounted && (
          <ResponsiveGridLayout
            width={width}
            className={`layout ${isEditing ? 'is-editing' : ''}`}
            layouts={currentLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={200}
            onLayoutChange={handleLayoutChange}
            dragConfig={{ enabled: isEditing, handle: '.drag-handle' }}
            resizeConfig={{ enabled: isEditing }}
            margin={[24, 24]}
            containerPadding={[0, 0]}
            positionStrategy={{ 
              type: 'transform', 
              scale: 1, 
              calcStyle: (pos) => ({ 
                transform: `translate(${pos.left}px, ${pos.top}px)`, 
                width: `${pos.width}px`, 
                height: `${pos.height}px`, 
                position: 'absolute' 
              }) 
            }}
          >
            {widgets.map(w => (
              <div key={w.id} className="group/widget overflow-visible">
                <DashboardWidget 
                  widget={w} 
                  stats={stats} 
                  categories={categories}
                  chartsReady={chartsReady} 
                  isEditing={isEditing}
                  onCategoryClick={onCategoryClick}
                />
                
                {/* Edit Mode Overlay (Optional reinforcement) */}
                {isEditing && (
                  <div className="absolute inset-0 border-2 border-indigo-400/0 group-hover/widget:border-indigo-400/50 rounded-[2rem] pointer-events-none transition-colors z-20" />
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
};