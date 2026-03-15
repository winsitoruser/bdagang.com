import React from 'react';
import { useBuilder } from './BuilderContext';
import { getWidgetDefinition } from './widgets/registry';
import { WidgetInstance } from './types';
import {
  Eye, EyeOff, Lock, Unlock, GripVertical, Trash2, ChevronUp, ChevronDown,
  ChevronRight, Layers as LayersIcon,
} from 'lucide-react';

function WidgetRow({ widget, indent = false }: { widget: WidgetInstance; indent?: boolean }) {
  const { state, dispatch } = useBuilder();
  const def = getWidgetDefinition(widget.type);
  const Icon = def?.icon;
  const isSelected = state.selectedWidgetId === widget.id;

  return (
    <div
      className={`flex items-center gap-2 py-1.5 rounded-lg cursor-pointer transition-all ${
        indent ? 'pl-6 pr-2' : 'px-2'
      } ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-100 border border-transparent'
      } ${widget.hidden ? 'opacity-50' : ''}`}
      onClick={() => dispatch({ type: 'SELECT_WIDGET', id: widget.id })}
    >
      <GripVertical size={12} className="text-gray-300 flex-shrink-0 cursor-grab" />
      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
        isSelected ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {Icon && <Icon size={12} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-700 truncate">
          {def?.name || widget.type}
        </div>
        <div className="text-[10px] text-gray-400">
          ({widget.layout.x},{widget.layout.y}) {widget.layout.w}x{widget.layout.h}
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'TOGGLE_WIDGET_VISIBILITY', id: widget.id });
          }}
          className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
          title={widget.hidden ? 'Tampilkan' : 'Sembunyikan'}
        >
          {widget.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'LOCK_WIDGET', id: widget.id });
          }}
          className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
          title={widget.locked ? 'Buka Kunci' : 'Kunci'}
        >
          {widget.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'PUSH_HISTORY', description: 'Hapus widget' });
            dispatch({ type: 'DELETE_WIDGET', id: widget.id });
          }}
          className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
          title="Hapus"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function LayersPanel() {
  const { state, dispatch, currentWidgets, currentSections } = useBuilder();

  const hasSections = currentSections.length > 0;
  const totalWidgets = hasSections
    ? currentSections.reduce((sum, s) => sum + s.widgets.length, 0)
    : currentWidgets.length;

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Layer & Widget</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {hasSections ? `${currentSections.length} section, ` : ''}{totalWidgets} widget
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {totalWidgets === 0 && !hasSections && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Belum ada widget
          </div>
        )}

        {/* Section-based layers */}
        {hasSections && currentSections.map((section, idx) => {
          const isSectionSelected = state.selectedSectionId === section.id;
          const sortedWidgets = [...section.widgets].sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x);

          return (
            <div key={section.id} className="mb-1">
              {/* Section Header */}
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all ${
                  isSectionSelected
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-100 border border-transparent'
                } ${section.hidden ? 'opacity-50' : ''}`}
                onClick={() => dispatch({ type: 'SELECT_SECTION', sectionId: isSectionSelected ? null : section.id })}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'TOGGLE_SECTION_COLLAPSE', sectionId: section.id });
                  }}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight size={12} className={`transition-transform ${section.collapsed ? '' : 'rotate-90'}`} />
                </button>
                <LayersIcon size={12} className={isSectionSelected ? 'text-purple-600' : 'text-gray-400'} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 truncate">{section.name}</div>
                  <div className="text-[10px] text-gray-400">{section.widgets.length} widget</div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, updates: { hidden: !section.hidden } });
                    }}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                  >
                    {section.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'PUSH_HISTORY', description: `Hapus section: ${section.name}` });
                      dispatch({ type: 'DELETE_SECTION', sectionId: section.id });
                    }}
                    className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Section Widgets */}
              {!section.collapsed && sortedWidgets.map(widget => (
                <WidgetRow key={widget.id} widget={widget} indent />
              ))}
            </div>
          );
        })}

        {/* Legacy flat widgets (no sections) */}
        {!hasSections && [...currentWidgets]
          .sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x)
          .map(widget => (
            <WidgetRow key={widget.id} widget={widget} />
          ))
        }
      </div>
    </div>
  );
}
