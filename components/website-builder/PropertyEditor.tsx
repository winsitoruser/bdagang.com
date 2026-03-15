import React, { useState, useMemo } from 'react';
import { useBuilder } from './BuilderContext';
import { getWidgetDefinition } from './widgets/registry';
import { WidgetProperty } from './types';
import {
  X, Trash2, Copy, Lock, Unlock, Eye, EyeOff,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronDown, ChevronRight, Settings, Palette, Layout, Type,
} from 'lucide-react';

const groupIcons: Record<string, React.FC<any>> = {
  'Konten': Type,
  'Style': Palette,
  'Layout': Layout,
  'Pengaturan': Settings,
  'Links': Layout,
};

function PropertyField({ prop, value, onChange }: {
  prop: WidgetProperty;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (prop.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={prop.placeholder}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white resize-y
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value ?? 0}
          onChange={e => onChange(Number(e.target.value))}
          min={prop.min}
          max={prop.max}
          step={prop.step}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      );

    case 'slider':
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            value={value ?? prop.defaultValue}
            onChange={e => onChange(Number(e.target.value))}
            min={prop.min ?? 0}
            max={prop.max ?? 100}
            step={prop.step ?? 1}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer
              accent-blue-500"
          />
          <span className="text-xs text-gray-500 font-mono w-10 text-right">
            {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
          </span>
        </div>
      );

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={value ?? '#000000'}
              onChange={e => onChange(e.target.value)}
              className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5"
            />
          </div>
          <input
            type="text"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-200 rounded-md bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
      );

    case 'select':
      return (
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        >
          {prop.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'boolean':
      return (
        <button
          onClick={() => onChange(!value)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            value ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            value ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`} />
        </button>
      );

    case 'alignment':
      return (
        <div className="flex gap-1">
          {[
            { val: 'left', icon: AlignLeft },
            { val: 'center', icon: AlignCenter },
            { val: 'right', icon: AlignRight },
            { val: 'justify', icon: AlignJustify },
          ].map(({ val, icon: Icon }) => (
            <button
              key={val}
              onClick={() => onChange(val)}
              className={`flex-1 p-1.5 rounded-md transition-colors ${
                value === val
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className="mx-auto" />
            </button>
          ))}
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      );
  }
}

export default function PropertyEditor() {
  const { state, selectedWidget, dispatch } = useBuilder();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Konten', 'Style', 'Layout', 'Pengaturan', 'Links']));

  const definition = selectedWidget ? getWidgetDefinition(selectedWidget.type) : null;

  const groupedProperties = useMemo(() => {
    if (!definition) return {};
    const groups: Record<string, WidgetProperty[]> = {};
    definition.properties.forEach(prop => {
      const group = prop.group || 'Umum';
      if (!groups[group]) groups[group] = [];
      groups[group].push(prop);
    });
    return groups;
  }, [definition]);

  const toggleGroup = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group); else next.add(group);
    setExpandedGroups(next);
  };

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedWidget) return;
    dispatch({ type: 'UPDATE_WIDGET_PROPERTY', widgetId: selectedWidget.id, key, value });
  };

  if (!selectedWidget || !definition) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Settings size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">Tidak ada widget dipilih</p>
        <p className="text-xs text-center text-gray-400 leading-relaxed">
          Pilih widget di canvas untuk mengedit propertinya
        </p>
      </div>
    );
  }

  const Icon = definition.icon;

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{definition.name}</div>
              <div className="text-[10px] text-gray-400">{selectedWidget.id.slice(0, 8)}...</div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SELECT_WIDGET', id: null })}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => {
              dispatch({ type: 'PUSH_HISTORY', description: `Duplikasi ${definition.name}` });
              dispatch({ type: 'DUPLICATE_WIDGET', id: selectedWidget.id });
            }}
            className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-md text-xs
              text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            title="Duplikasi"
          >
            <Copy size={13} />
            <span>Duplikasi</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'LOCK_WIDGET', id: selectedWidget.id })}
            className="flex items-center justify-center gap-1 p-1.5 rounded-md text-xs
              text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            title={selectedWidget.locked ? 'Buka Kunci' : 'Kunci'}
          >
            {selectedWidget.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_WIDGET_VISIBILITY', id: selectedWidget.id })}
            className="flex items-center justify-center gap-1 p-1.5 rounded-md text-xs
              text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            title={selectedWidget.hidden ? 'Tampilkan' : 'Sembunyikan'}
          >
            {selectedWidget.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'PUSH_HISTORY', description: `Hapus ${definition.name}` });
              dispatch({ type: 'DELETE_WIDGET', id: selectedWidget.id });
            }}
            className="flex items-center justify-center gap-1 p-1.5 rounded-md text-xs
              text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
            title="Hapus"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(groupedProperties).map(([groupName, props]) => {
          const isExpanded = expandedGroups.has(groupName);
          const GroupIcon = groupIcons[groupName] || Settings;

          return (
            <div key={groupName} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <GroupIcon size={14} className="text-gray-400" />
                <span className="flex-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {groupName}
                </span>
                {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  {props.map(prop => (
                    <div key={prop.key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        {prop.label}
                      </label>
                      <PropertyField
                        prop={prop}
                        value={selectedWidget.properties[prop.key]}
                        onChange={(val) => handlePropertyChange(prop.key, val)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Size Info */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'X', value: selectedWidget.layout.x },
            { label: 'Y', value: selectedWidget.layout.y },
            { label: 'W', value: selectedWidget.layout.w },
            { label: 'H', value: selectedWidget.layout.h },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-md py-1.5">
              <div className="text-[10px] text-gray-400 font-medium">{item.label}</div>
              <div className="text-xs font-semibold text-gray-700">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
