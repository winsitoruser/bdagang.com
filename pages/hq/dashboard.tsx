import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, LayoutItem, verticalCompactor, useContainerWidth } from 'react-grid-layout';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import HQLayout from '../../components/hq/HQLayout';
import { LayoutGrid, Plus, Save, RotateCcw, Edit, Sparkles, GripVertical, X } from 'lucide-react';
import { WidgetLayoutItem, WidgetSize, SIZE_TO_GRID, MODULE_COLORS, MODULE_LABELS } from '../../lib/widgets/types';
import { getWidgetById, DEFAULT_LAYOUT } from '../../lib/widgets/registry';
import WidgetPicker from '../../components/hq/dashboard/WidgetPicker';

const STORAGE_KEY = 'bedagang-dashboard-layout';
const ROW_HEIGHT = 60;
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

function widgetToGridSize(w: number): WidgetSize {
  if (w >= 10) return 'xl';
  if (w >= 7) return 'lg';
  if (w >= 4) return 'md';
  return 'sm';
}

export default function HQDashboard() {
  const [mounted, setMounted] = useState(false);
  const [widgets, setWidgets] = useState<WidgetLayoutItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const { width: containerWidth, containerRef, mounted: containerMounted } = useContainerWidth();
  const [showPicker, setShowPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.widgets && Array.isArray(parsed.widgets) && parsed.widgets.length > 0 && parsed.widgets[0].x !== undefined) {
          setWidgets(parsed.widgets);
          return;
        }
      }
    } catch {}
    setWidgets([...DEFAULT_LAYOUT]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/hq/dashboard/widget-layout');
        if (r.ok) {
          const j = await r.json();
          if (j.data?.widgets?.length > 0 && j.data.widgets[0].x !== undefined) {
            setWidgets(j.data.widgets);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(j.data));
          }
        }
      } catch {}
    })();
  }, []);

  const saveLayout = useCallback(async (layout: WidgetLayoutItem[]) => {
    const data = { widgets: layout, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    try {
      await fetch('/api/hq/dashboard/widget-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: layout }),
      });
    } catch {}
    setHasChanges(false);
  }, []);

  const handleAddWidget = useCallback((widgetId: string) => {
    const def = getWidgetById(widgetId);
    if (!def) return;
    const grid = SIZE_TO_GRID[def.defaultSize];
    const maxY = widgets.length > 0 ? Math.max(...widgets.map(w => (w.y || 0) + (w.h || 4))) : 0;
    const maxOrder = widgets.length > 0 ? Math.max(...widgets.map(w => w.order)) : -1;
    const newWidget: WidgetLayoutItem = {
      widgetId,
      size: def.defaultSize,
      order: maxOrder + 1,
      x: 0,
      y: maxY,
      w: grid.w,
      h: grid.h,
      minW: grid.minW,
      minH: grid.minH,
    };
    setWidgets(prev => [...prev, newWidget]);
    setHasChanges(true);
  }, [widgets]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.widgetId !== widgetId).map((w, i) => ({ ...w, order: i })));
    setHasChanges(true);
  }, []);

  const handleResetLayout = useCallback(() => {
    setWidgets([...DEFAULT_LAYOUT]);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    saveLayout(widgets);
    setIsEditMode(false);
  }, [widgets, saveLayout]);

  const gridLayout: LayoutItem[] = useMemo(() => {
    return widgets.map(w => {
      const grid = SIZE_TO_GRID[w.size] || SIZE_TO_GRID['sm'];
      return {
        i: w.widgetId,
        x: w.x ?? 0,
        y: w.y ?? 0,
        w: w.w ?? grid.w,
        h: w.h ?? grid.h,
        minW: w.minW ?? grid.minW,
        minH: w.minH ?? grid.minH,
        maxW: 12,
        maxH: 16,
        static: !isEditMode,
      };
    });
  }, [widgets, isEditMode]);

  const handleLayoutChange = useCallback((layout: Layout, _layouts: ResponsiveLayouts) => {
    if (!isEditMode) return;
    setWidgets(prev => {
      const layoutMap = new Map(layout.map(l => [l.i, l]));
      return prev.map(w => {
        const l = layoutMap.get(w.widgetId);
        if (!l) return w;
        return {
          ...w,
          x: l.x,
          y: l.y,
          w: l.w,
          h: l.h,
          size: widgetToGridSize(l.w),
        };
      });
    });
    setHasChanges(true);
  }, [isEditMode]);

  if (!mounted) return null;

  return (
    <HQLayout>
      <div className="-mx-6 -mt-6 -mb-6">
        {/* Dashboard Header - always on top */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-4 sm:px-6 pb-3 pt-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isEditMode ? 'Seret widget untuk mengatur tata letak' : `${widgets.length} widget aktif`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isEditMode ? (
                <>
                  <button onClick={() => setShowPicker(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Tambah Widget
                  </button>
                  <button onClick={handleResetLayout} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <Save className="w-3.5 h-3.5" /> Simpan
                  </button>
                  <button onClick={() => { setIsEditMode(false); setHasChanges(false); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors">
                    Batal
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit Dashboard
                </button>
              )}
            </div>
          </div>

          {isEditMode && (
            <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Mode Edit</strong> — Seret widget ke posisi manapun, tarik sudut untuk mengubah ukuran.
                {hasChanges && <span className="ml-2 text-blue-900 dark:text-blue-100 font-semibold">• Ada perubahan belum disimpan</span>}
              </p>
            </div>
          )}
        </div>

        {/* Widget Grid Canvas */}
        <div className={`px-4 sm:px-5 lg:px-6 pt-4 pb-6 min-h-[calc(100vh-10rem)] transition-colors ${isEditMode ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''}`}>
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
              <LayoutGrid className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Belum ada widget</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm">Mulai dengan menambahkan widget untuk memonitor bisnis Anda secara real-time.</p>
            <button onClick={() => { setIsEditMode(true); setShowPicker(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
              <Plus className="w-4 h-4" /> Tambah Widget Pertama
            </button>
          </div>
        ) : (
          <div ref={containerRef as React.RefObject<HTMLDivElement>} className="w-full">
          {containerMounted && <ResponsiveGridLayout
            className={`dashboard-grid ${isEditMode ? 'dashboard-grid--editing' : ''}`}
            width={containerWidth}
            layouts={{ lg: gridLayout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={GRID_COLS}
            rowHeight={ROW_HEIGHT}
            dragConfig={{ enabled: isEditMode, bounded: true, handle: '.widget-drag-handle' }}
            resizeConfig={{ enabled: isEditMode }}
            onLayoutChange={handleLayoutChange}
            compactor={verticalCompactor}
            margin={[14, 14] as const}
            containerPadding={[0, 0] as const}
          >
            {widgets.map(item => {
              const widgetDef = getWidgetById(item.widgetId);
              if (!widgetDef) return <div key={item.widgetId} />;
              const WidgetComponent = widgetDef.component;
              const moduleColor = MODULE_COLORS[widgetDef.module];
              return (
                <div key={item.widgetId} className="widget-grid-item">
                  <div className={`h-full bg-white dark:bg-gray-800 rounded-xl border transition-all overflow-hidden flex flex-col ${
                    isEditMode
                      ? 'border-dashed border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/5 ring-1 ring-blue-200/50'
                      : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                  }`}>
                    {/* Widget Header */}
                    <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 ${
                      isEditMode ? 'widget-drag-handle cursor-grab active:cursor-grabbing bg-gray-50/80 dark:bg-gray-800/80' : ''
                    }`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isEditMode && <GripVertical className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                        <span className="text-gray-400 flex-shrink-0">
                          <widgetDef.icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{widgetDef.title}</span>
                        <span className={`hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded-full flex-shrink-0 ${moduleColor}`}>
                          {MODULE_LABELS[widgetDef.module]}
                        </span>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveWidget(item.widgetId); }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 ml-1"
                          title="Hapus widget"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Widget Content */}
                    <div className="flex-1 p-3 overflow-auto">
                      <WidgetComponent />
                    </div>
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>}
          </div>
        )}
        </div>
      </div>

      {showPicker && (
        <WidgetPicker isOpen={showPicker} activeWidgets={widgets} onAddWidget={handleAddWidget} onRemoveWidget={handleRemoveWidget} onClose={() => setShowPicker(false)} />
      )}

      <style jsx global>{`
        .dashboard-grid {
          position: relative;
        }
        .dashboard-grid .react-grid-item {
          transition: all 200ms ease;
        }
        .dashboard-grid .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.1) !important;
          border: 2px dashed rgba(59, 130, 246, 0.5) !important;
          border-radius: 12px !important;
          opacity: 1 !important;
          transition: all 150ms ease;
        }
        .dashboard-grid .react-grid-item.resizing {
          opacity: 0.9;
          z-index: 10;
          will-change: width, height;
        }
        .dashboard-grid .react-grid-item.react-draggable-dragging {
          z-index: 100;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08);
          border-radius: 12px;
          opacity: 0.92;
          will-change: transform;
          transition: box-shadow 200ms ease, opacity 200ms ease;
        }
        .dashboard-grid .react-grid-item > .react-resizable-handle {
          width: 20px;
          height: 20px;
          bottom: 2px;
          right: 2px;
        }
        .dashboard-grid .react-grid-item > .react-resizable-handle::after {
          border-right: 2.5px solid rgba(59, 130, 246, 0.5);
          border-bottom: 2.5px solid rgba(59, 130, 246, 0.5);
          width: 10px;
          height: 10px;
          right: 4px;
          bottom: 4px;
        }
        .dashboard-grid--editing .react-grid-item > .react-resizable-handle:hover::after {
          border-color: rgba(59, 130, 246, 0.9);
        }
        .widget-grid-item {
          height: 100%;
        }
        @media (max-width: 640px) {
          .dashboard-grid .react-grid-item > .react-resizable-handle {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </HQLayout>
  );
}
