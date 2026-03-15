import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
// react-grid-layout: editor page uses ssr:false so this only runs client-side
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RGL = require('react-grid-layout');
const GridLayout = (RGL.default || RGL) as React.ComponentType<any>;
import { useBuilder } from './BuilderContext';
import { DEVICE_WIDTHS, GRID_COLS, Section, WidgetInstance } from './types';
import { getWidgetDefinition } from './widgets/registry';
import WidgetRenderer from './widgets/WidgetRenderer';
import {
  Trash2, GripVertical, Copy, Lock, Settings,
  Plus, ChevronUp, ChevronDown, Eye, EyeOff,
  Layers, LayoutTemplate, Palette, Maximize2,
  ChevronRight, MoveVertical, ArrowUpDown,
  Lock as LockIcon, Unlock, PaintBucket,
} from 'lucide-react';

// ======== Add-Section Divider Button ========
function AddSectionButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <div className="relative flex items-center justify-center py-2 group/add">
      <div className="absolute inset-x-6 h-px bg-gray-200 group-hover/add:bg-purple-300 transition-colors" />
      <button
        onClick={onClick}
        className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold
          bg-white border-2 border-dashed border-gray-300 text-gray-400
          hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 hover:shadow-sm
          transition-all duration-200"
      >
        <Plus size={13} />
        {label || 'Tambah Section'}
      </button>
    </div>
  );
}

// ======== Section Toolbar ========
function SectionToolbar({
  section,
  isFirst,
  isLast,
  isSelected,
}: {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
}) {
  const { dispatch } = useBuilder();

  return (
    <div className={`flex items-center justify-between px-4 py-2 transition-colors ${
      isSelected ? 'bg-blue-50 border-b border-blue-200' : 'bg-gray-50 border-b border-gray-200'
    }`}>
      {/* Left: section name + type */}
      <div
        className="flex items-center gap-2 cursor-pointer min-w-0"
        onClick={() => dispatch({ type: 'SELECT_SECTION', sectionId: isSelected ? null : section.id })}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'TOGGLE_SECTION_COLLAPSE', sectionId: section.id });
          }}
          className="p-0.5 rounded text-gray-400 hover:text-gray-600"
        >
          <ChevronRight size={14} className={`transition-transform ${section.collapsed ? '' : 'rotate-90'}`} />
        </button>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          section.type === 'hero' ? 'bg-blue-500' :
          section.type === 'header' ? 'bg-violet-500' :
          section.type === 'footer' ? 'bg-gray-700' :
          section.type === 'cta' ? 'bg-red-500' :
          section.type === 'features' ? 'bg-green-500' :
          section.type === 'testimonials' ? 'bg-amber-500' :
          section.type === 'pricing' ? 'bg-emerald-500' :
          section.type === 'contact' ? 'bg-purple-500' :
          section.type === 'gallery' ? 'bg-cyan-500' :
          'bg-gray-400'
        }`} />
        <span className="text-[11px] font-bold text-gray-700 truncate max-w-[140px]">{section.name}</span>
        <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
          {section.widgets.length} widget
        </span>
        {section.hidden && <EyeOff size={11} className="text-gray-400" />}
        {section.locked && <LockIcon size={11} className="text-amber-500" />}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => dispatch({ type: 'MOVE_SECTION', sectionId: section.id, direction: 'up' })}
          disabled={isFirst}
          className={`p-1 rounded transition-colors ${isFirst ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          title="Pindah ke atas"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={() => dispatch({ type: 'MOVE_SECTION', sectionId: section.id, direction: 'down' })}
          disabled={isLast}
          className={`p-1 rounded transition-colors ${isLast ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          title="Pindah ke bawah"
        >
          <ChevronDown size={13} />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        <button
          onClick={() => dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, updates: { hidden: !section.hidden } })}
          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          title={section.hidden ? 'Tampilkan' : 'Sembunyikan'}
        >
          {section.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button
          onClick={() => dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, updates: { locked: !section.locked } })}
          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          title={section.locked ? 'Buka kunci' : 'Kunci'}
        >
          {section.locked ? <LockIcon size={13} /> : <Unlock size={13} />}
        </button>

        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        <button
          onClick={() => {
            dispatch({ type: 'PUSH_HISTORY', description: `Duplikasi section: ${section.name}` });
            dispatch({ type: 'DUPLICATE_SECTION', sectionId: section.id });
          }}
          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Duplikasi section"
        >
          <Copy size={13} />
        </button>
        <button
          onClick={() => {
            dispatch({ type: 'PUSH_HISTORY', description: `Hapus section: ${section.name}` });
            dispatch({ type: 'DELETE_SECTION', sectionId: section.id });
          }}
          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Hapus section"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ======== Section Grid (widgets inside a section) ========
function SectionGrid({ section }: { section: Section }) {
  const { state, dispatch, addWidgetToSection } = useBuilder();
  const device = state.devicePreview;
  const cols = GRID_COLS[device];
  const canvasWidth = DEVICE_WIDTHS[device];
  const rowHeight = 40;

  const layout = useMemo(() =>
    section.widgets.map(w => ({
      i: w.id,
      x: w.layout.x,
      y: w.layout.y,
      w: Math.min(w.layout.w, cols),
      h: w.layout.h,
      minW: w.layout.minW,
      minH: w.layout.minH,
      maxW: w.layout.maxW,
      maxH: w.layout.maxH,
      isDraggable: !w.locked && !section.locked && !state.isPreviewing,
      isResizable: !w.locked && !section.locked && !state.isPreviewing,
    })),
    [section.widgets, cols, state.isPreviewing, section.locked]
  );

  const handleLayoutChange = useCallback((newLayout: any[]) => {
    dispatch({ type: 'UPDATE_SECTION_LAYOUTS', sectionId: section.id, layouts: newLayout });
  }, [dispatch, section.id]);

  const handleDrop = useCallback((_layoutItems: any[], layoutItem: any, e: any) => {
    const widgetType = e?.dataTransfer?.getData('widgetType') || state.droppingWidgetType;
    if (widgetType) {
      addWidgetToSection(section.id, widgetType, layoutItem.x, layoutItem.y);
      dispatch({ type: 'SET_DRAGGING', isDragging: false, widgetType: null });
    }
  }, [addWidgetToSection, section.id, state.droppingWidgetType, dispatch]);

  const droppingItem = state.droppingWidgetType
    ? (() => {
        const def = getWidgetDefinition(state.droppingWidgetType);
        return def ? { i: '__dropping__', x: 0, y: 0, w: def.defaultSize.w, h: def.defaultSize.h } : undefined;
      })()
    : undefined;

  const sectionBg = section.style?.backgroundColor || 'transparent';
  const maxWidthMap: Record<string, number> = { full: canvasWidth, container: 1200, narrow: 800 };
  const maxWPx = maxWidthMap[section.style?.maxWidth || 'container'] || canvasWidth;
  const gridWidth = Math.min(canvasWidth, maxWPx);

  if (!GridLayout) {
    return <div className="p-4 text-red-500 text-sm">Error: react-grid-layout not loaded</div>;
  }

  if (section.collapsed) {
    return (
      <div className="py-3 px-6 text-center text-xs text-gray-400 italic">
        Section diciutkan — klik ▶ untuk membuka
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: sectionBg !== 'transparent' ? sectionBg : undefined,
        paddingTop: section.style?.paddingTop ?? 48,
        paddingBottom: section.style?.paddingBottom ?? 48,
        minHeight: section.style?.minHeight || 80,
        borderTop: section.style?.borderTop !== 'none' ? section.style?.borderTop : undefined,
        borderBottom: section.style?.borderBottom !== 'none' ? section.style?.borderBottom : undefined,
      }}
      className="relative"
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
    >
      <div style={{ maxWidth: maxWPx, margin: '0 auto', paddingLeft: section.style?.paddingLeft ?? 24, paddingRight: section.style?.paddingRight ?? 24 }}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols}
          rowHeight={rowHeight}
          width={gridWidth - (section.style?.paddingLeft ?? 24) - (section.style?.paddingRight ?? 24)}
          onLayoutChange={handleLayoutChange as any}
          onDrop={handleDrop as any}
          isDroppable={true}
          droppingItem={droppingItem}
          compactType="vertical"
          preventCollision={false}
          useCSSTransforms={true}
          draggableHandle=".widget-drag-handle"
          margin={[8, 8]}
          containerPadding={[0, 0]}
          style={{ minHeight: section.widgets.length === 0 ? 120 : undefined }}
        >
          {section.widgets.map(widget => (
            <div key={widget.id}>
              <WidgetItem
                widget={widget}
                sectionId={section.id}
                isSelected={state.selectedWidgetId === widget.id}
                isHovered={state.hoveredWidgetId === widget.id}
              />
            </div>
          ))}
        </GridLayout>
        {section.widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-gray-400 pointer-events-none" style={{ marginTop: -100 }}>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
              <Plus size={20} className="text-gray-300" />
            </div>
            <p className="text-xs font-medium text-gray-400 mb-1">Section kosong</p>
            <p className="text-[10px] text-gray-300">Drag widget dari panel kiri ke sini</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ======== Widget Item (used in both legacy and section grid) ========
function WidgetItem({
  widget,
  sectionId,
  isSelected,
  isHovered,
}: {
  widget: WidgetInstance;
  sectionId?: string;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const { dispatch } = useBuilder();
  const def = getWidgetDefinition(widget.type);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'PUSH_HISTORY', description: 'Hapus widget' });
    if (sectionId) {
      dispatch({ type: 'DELETE_WIDGET_FROM_SECTION', sectionId, widgetId: widget.id });
    } else {
      dispatch({ type: 'DELETE_WIDGET', id: widget.id });
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'PUSH_HISTORY', description: 'Duplikasi widget' });
    dispatch({ type: 'DUPLICATE_WIDGET', id: widget.id });
  };

  return (
    <div
      className={`widget-item group relative rounded-lg transition-all duration-150 ${
        widget.hidden ? 'opacity-30' : ''
      } ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10 z-20'
          : isHovered
            ? 'ring-2 ring-blue-300 z-10'
            : 'ring-1 ring-transparent hover:ring-gray-300'
      } ${widget.locked ? 'cursor-not-allowed' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_WIDGET', id: widget.id });
        dispatch({ type: 'SET_RIGHT_PANEL_TAB', tab: 'properties' });
      }}
      onMouseEnter={() => dispatch({ type: 'HOVER_WIDGET', id: widget.id })}
      onMouseLeave={() => dispatch({ type: 'HOVER_WIDGET', id: null })}
    >
      <div className="w-full h-full overflow-hidden rounded-lg">
        <WidgetRenderer widget={widget} />
      </div>

      {/* Widget Label */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-30">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-t-md ${
            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
          }`}>
            {def?.name || widget.type}
          </span>
          {widget.locked && <Lock size={10} className="text-amber-500" />}
        </div>
      )}

      {/* Drag Handle + Quick Actions */}
      {(isSelected || isHovered) && !widget.locked && (
        <div className="absolute -top-6 right-0 flex items-center gap-0.5 z-30">
          <button
            className="widget-drag-handle p-1 bg-gray-700 text-white rounded-t-md hover:bg-gray-800 cursor-grab active:cursor-grabbing"
            title="Pindahkan"
          >
            <GripVertical size={12} />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 bg-gray-700 text-white rounded-t-md hover:bg-blue-600"
            title="Duplikasi"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 bg-gray-700 text-white rounded-t-md hover:bg-red-600"
            title="Hapus"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Resize indicator */}
      {isSelected && !widget.locked && (
        <div className="absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center">
          <div className="w-2 h-2 rounded-sm bg-blue-500" />
        </div>
      )}
    </div>
  );
}

// ======== MAIN CANVAS ========
export default function BuilderCanvas() {
  const { state, dispatch, currentWidgets, currentSections, addWidget } = useBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const device = state.devicePreview;
  const cols = GRID_COLS[device];
  const canvasWidth = DEVICE_WIDTHS[device];
  const rowHeight = 40;

  const hasSections = currentSections.length > 0;


  // Legacy layout for pages without sections
  const legacyLayout = useMemo(() =>
    currentWidgets.map(w => ({
      i: w.id,
      x: w.layout.x,
      y: w.layout.y,
      w: Math.min(w.layout.w, cols),
      h: w.layout.h,
      minW: w.layout.minW,
      minH: w.layout.minH,
      maxW: w.layout.maxW,
      maxH: w.layout.maxH,
      isDraggable: !w.locked && !state.isPreviewing,
      isResizable: !w.locked && !state.isPreviewing,
    })),
    [currentWidgets, cols, state.isPreviewing]
  );

  const handleLegacyLayoutChange = useCallback((newLayout: any[]) => {
    dispatch({ type: 'UPDATE_LAYOUTS', layouts: newLayout });
  }, [dispatch]);

  const handleLegacyDrop = useCallback((_layoutItems: any[], layoutItem: any, e: any) => {
    const widgetType = e?.dataTransfer?.getData('widgetType') || state.droppingWidgetType;
    if (widgetType) {
      addWidget(widgetType, layoutItem.x, layoutItem.y);
      dispatch({ type: 'SET_DRAGGING', isDragging: false, widgetType: null });
    }
  }, [addWidget, state.droppingWidgetType, dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.widget-item')) return;
    dispatch({ type: 'SELECT_WIDGET', id: null });
    dispatch({ type: 'SELECT_SECTION', sectionId: null });
  }, [dispatch]);

  const droppingItem = state.droppingWidgetType
    ? (() => {
        const def = getWidgetDefinition(state.droppingWidgetType);
        return def ? { i: '__dropping__', x: 0, y: 0, w: def.defaultSize.w, h: def.defaultSize.h } : undefined;
      })()
    : undefined;

  // Not mounted yet or GridLayout not loaded
  if (!mounted || !GridLayout) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat canvas...</p>
        </div>
      </div>
    );
  }

  // ======= Preview Mode =======
  if (state.isPreviewing) {
    return (
      <div className="flex-1 flex justify-center overflow-auto bg-gray-100 p-8">
        <div
          style={{ width: canvasWidth, transform: `scale(${state.zoom / 100})`, transformOrigin: 'top center' }}
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
        >
          {/* Render sections in order */}
          {currentSections.filter(s => !s.hidden).map(section => {
            const sectionBg = section.style?.backgroundColor || 'transparent';
            const maxWidthMap = { full: '100%', container: '1200px', narrow: '800px' };
            const maxW = maxWidthMap[section.style?.maxWidth || 'container'];
            return (
              <div
                key={section.id}
                style={{
                  backgroundColor: sectionBg !== 'transparent' ? sectionBg : undefined,
                  paddingTop: section.style?.paddingTop ?? 48,
                  paddingBottom: section.style?.paddingBottom ?? 48,
                }}
              >
                <div style={{ maxWidth: maxW, margin: '0 auto', position: 'relative', paddingLeft: section.style?.paddingLeft ?? 24, paddingRight: section.style?.paddingRight ?? 24 }}>
                  {section.widgets.filter(w => !w.hidden).sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x).map(widget => (
                    <div
                      key={widget.id}
                      style={{
                        position: 'absolute',
                        left: `${(widget.layout.x / cols) * 100}%`,
                        top: widget.layout.y * rowHeight,
                        width: `${(widget.layout.w / cols) * 100}%`,
                        height: widget.layout.h * rowHeight,
                        padding: 4,
                      }}
                    >
                      <WidgetRenderer widget={widget} isPreview />
                    </div>
                  ))}
                  <div style={{ height: section.widgets.reduce((max, w) => Math.max(max, (w.layout.y + w.layout.h) * rowHeight), 80) }} />
                </div>
              </div>
            );
          })}
          {/* Legacy widgets */}
          {!hasSections && (
            <div style={{ position: 'relative', minHeight: 600 }}>
              {currentWidgets.filter(w => !w.hidden).sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x).map(widget => (
                <div
                  key={widget.id}
                  style={{
                    position: 'absolute',
                    left: `${(widget.layout.x / cols) * 100}%`,
                    top: widget.layout.y * rowHeight,
                    width: `${(widget.layout.w / cols) * 100}%`,
                    height: widget.layout.h * rowHeight,
                    padding: 4,
                  }}
                >
                  <WidgetRenderer widget={widget} isPreview />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ======= Edit Mode =======
  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-auto bg-gray-100/80"
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-center py-6 px-4">
        <div
          style={{
            width: canvasWidth,
            transform: `scale(${state.zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Device Frame */}
          <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
            state.isDragging ? 'ring-2 ring-blue-400 ring-offset-2' : ''
          }`}>

            {/* ====== SECTION-BASED CANVAS ====== */}
            {hasSections && (
              <div>
                {/* Top add-section */}
                <AddSectionButton
                  onClick={() => dispatch({ type: 'SHOW_SECTION_PICKER', insertIndex: 0 })}
                  label="Tambah Section di Atas"
                />

                {currentSections.map((section, idx) => {
                  const isSectionSelected = state.selectedSectionId === section.id;
                  return (
                    <div key={section.id}>
                      {/* Section Container */}
                      <div
                        className={`relative transition-all ${
                          isSectionSelected ? 'ring-2 ring-blue-400 ring-inset' : ''
                        } ${section.hidden ? 'opacity-40' : ''}`}
                      >
                        <SectionToolbar
                          section={section}
                          isFirst={idx === 0}
                          isLast={idx === currentSections.length - 1}
                          isSelected={isSectionSelected}
                        />
                        <SectionGrid section={section} />
                      </div>

                      {/* Add-section between */}
                      <AddSectionButton
                        onClick={() => dispatch({ type: 'SHOW_SECTION_PICKER', insertIndex: idx + 1 })}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ====== LEGACY FLAT CANVAS (no sections) ====== */}
            {!hasSections && (
              <div
                className="relative min-h-[600px]"
                style={{
                  backgroundImage: state.showGrid
                    ? `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`
                    : 'none',
                  backgroundSize: `${canvasWidth / cols}px ${rowHeight}px`,
                }}
              >
                {currentWidgets.length === 0 && !state.isDragging && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <LayoutTemplate size={32} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-500 mb-2">Canvas Kosong</p>
                    <p className="text-sm text-gray-400 max-w-sm text-center mb-6">
                      Mulai dengan menambahkan section dari template, atau drag widget dari panel kiri
                    </p>
                    <div className="flex gap-3 pointer-events-auto">
                      <button
                        onClick={() => dispatch({ type: 'SHOW_SECTION_PICKER', insertIndex: 0 })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold
                          hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
                      >
                        <LayoutTemplate size={16} />
                        Pilih Template Section
                      </button>
                    </div>
                  </div>
                )}

                {state.isDragging && currentWidgets.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 bg-blue-50/50">
                      <p className="text-blue-500 font-medium text-lg">Lepaskan widget di sini</p>
                    </div>
                  </div>
                )}

                <GridLayout
                  className="layout"
                  layout={legacyLayout}
                  cols={cols}
                  rowHeight={rowHeight}
                  width={canvasWidth}
                  onLayoutChange={handleLegacyLayoutChange as any}
                  onDrop={handleLegacyDrop as any}
                  isDroppable={true}
                  droppingItem={droppingItem}
                  compactType="vertical"
                  preventCollision={false}
                  useCSSTransforms={true}
                  draggableHandle=".widget-drag-handle"
                  margin={[8, 8]}
                  containerPadding={[16, 16]}
                >
                  {currentWidgets.map(widget => (
                    <div key={widget.id}>
                      <WidgetItem
                        widget={widget}
                        isSelected={state.selectedWidgetId === widget.id}
                        isHovered={state.hoveredWidgetId === widget.id}
                      />
                    </div>
                  ))}
                </GridLayout>

                {/* Bottom add-section button when legacy canvas has widgets */}
                {currentWidgets.length > 0 && (
                  <div className="py-4">
                    <AddSectionButton
                      onClick={() => dispatch({ type: 'SHOW_SECTION_PICKER', insertIndex: 0 })}
                      label="Konversi ke Section Layout"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
