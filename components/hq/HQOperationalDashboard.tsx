import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, LayoutItem, verticalCompactor, useContainerWidth } from 'react-grid-layout';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import HQLayout from '@/components/hq/HQLayout';
import { LayoutGrid, Plus, Save, RotateCcw, Edit, Sparkles, GripVertical, X } from 'lucide-react';
import { WidgetLayoutItem, WidgetSize, SIZE_TO_GRID, MODULE_COLORS, MODULE_LABELS } from '@/lib/widgets/types';
import { getWidgetById, DEFAULT_LAYOUT } from '@/lib/widgets/registry';
import WidgetPicker from '@/components/hq/dashboard/WidgetPicker';

const STORAGE_KEY = 'bedagang-dashboard-layout';
const ROW_HEIGHT = 60;
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

function widgetToGridSize(w: number): WidgetSize {
  if (w >= 10) return 'xl';
  if (w >= 7) return 'lg';
  if (w >= 4) return 'md';
  return 'sm';
}

/**
 * Dashboard widget operasional multi-cabang (pemilik / HQ).
 * Widget dashboard HQ (multi-cabang). Panel pemilik restoran terpisah: `OwnerRestaurantDashboard` + `OpanelLayout`.
 */
export default function HQOperationalDashboard() {
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

  const handleAddWidget = useCallback(
    (widgetId: string) => {
      const def = getWidgetById(widgetId);
      if (!def) return;
      const grid = SIZE_TO_GRID[def.defaultSize];
      const maxY = widgets.length > 0 ? Math.max(...widgets.map((w) => (w.y || 0) + (w.h || 4))) : 0;
      const maxOrder = widgets.length > 0 ? Math.max(...widgets.map((w) => w.order)) : -1;
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
      setWidgets((prev) => [...prev, newWidget]);
      setHasChanges(true);
    },
    [widgets],
  );

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setWidgets((prev) =>
      prev.filter((w) => w.widgetId !== widgetId).map((w, i) => ({ ...w, order: i })),
    );
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
    return widgets.map((w) => {
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

  const handleLayoutChange = useCallback(
    (layout: Layout, _layouts: ResponsiveLayouts) => {
      if (!isEditMode) return;
      setWidgets((prev) => {
        const layoutMap = new Map(layout.map((l) => [l.i, l]));
        return prev.map((w) => {
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
    },
    [isEditMode],
  );

  if (!mounted) return null;

  return (
    <HQLayout>
      <div className="-mx-6 -mt-6 -mb-6">
        <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 px-4 pb-3 pt-4 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard operasional</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isEditMode ? 'Seret widget untuk mengatur tata letak' : `${widgets.length} widget aktif`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Widget
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLayout}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                  >
                    <Save className="h-3.5 w-3.5" /> Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setHasChanges(false);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Dashboard
                </button>
              )}
            </div>
          </div>

          {isEditMode && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Mode Edit</strong> — Seret widget ke posisi manapun, tarik sudut untuk mengubah ukuran.
                {hasChanges && (
                  <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                    • Ada perubahan belum disimpan
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div
          className={`min-h-[calc(100vh-10rem)] px-4 pb-6 pt-4 transition-colors sm:px-5 lg:px-6 ${
            isEditMode ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''
          }`}
        >
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
                <LayoutGrid className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Belum ada widget</h3>
              <p className="mb-5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Mulai dengan menambahkan widget untuk memonitor bisnis Anda secara real-time.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(true);
                  setShowPicker(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Tambah Widget Pertama
              </button>
            </div>
          ) : (
            <div ref={containerRef as React.RefObject<HTMLDivElement>} className="w-full">
              {containerMounted && (
                <ResponsiveGridLayout
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
                  {widgets.map((item) => {
                    const widgetDef = getWidgetById(item.widgetId);
                    if (!widgetDef) return <div key={item.widgetId} />;
                    const WidgetComponent = widgetDef.component;
                    const moduleColor = MODULE_COLORS[widgetDef.module];
                    return (
                      <div key={item.widgetId} className="widget-grid-item">
                        <div
                          className={`flex h-full flex-col overflow-hidden rounded-xl border transition-all ${
                            isEditMode
                              ? 'border-dashed border-blue-300 shadow-lg shadow-blue-500/5 ring-1 ring-blue-200/50 dark:border-blue-700'
                              : 'border-gray-200 shadow-sm hover:shadow-md dark:border-gray-700'
                          } bg-white dark:bg-gray-800`}
                        >
                          <div
                            className={`flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700 ${
                              isEditMode
                                ? 'widget-drag-handle cursor-grab bg-gray-50/80 active:cursor-grabbing dark:bg-gray-800/80'
                                : ''
                            }`}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              {isEditMode && <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />}
                              <span className="flex-shrink-0 text-gray-400">
                                <widgetDef.icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                                {widgetDef.title}
                              </span>
                              <span
                                className={`hidden flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:inline-flex ${moduleColor}`}
                              >
                                {MODULE_LABELS[widgetDef.module]}
                              </span>
                            </div>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveWidget(item.widgetId);
                                }}
                                className="ml-1 flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                title="Hapus widget"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="flex-1 overflow-auto p-3">
                            <WidgetComponent />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </ResponsiveGridLayout>
              )}
            </div>
          )}
        </div>
      </div>

      {showPicker && (
        <WidgetPicker
          isOpen={showPicker}
          activeWidgets={widgets}
          onAddWidget={handleAddWidget}
          onRemoveWidget={handleRemoveWidget}
          onClose={() => setShowPicker(false)}
        />
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
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          opacity: 0.92;
          will-change: transform;
          transition:
            box-shadow 200ms ease,
            opacity 200ms ease;
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
