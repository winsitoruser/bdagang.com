import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import {
  Palette, Type, Layout, Maximize2, Sparkles, Moon, Sun,
  ChevronDown, ChevronRight, RotateCcw, Zap, Square, Circle,
} from 'lucide-react';
import { ThemeSettings, DEFAULT_THEME } from './types';

interface SectionProps {
  title: string;
  icon: React.FC<any>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-gray-400" />
          {title}
        </div>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded-md cursor-pointer border border-gray-200"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-[10px] font-mono border border-gray-200 rounded text-center"
        />
      </div>
    </div>
  );
}

const PRESET_THEMES: { name: string; colors: Partial<ThemeSettings> }[] = [
  {
    name: 'Indigo Modern',
    colors: { colorPrimary: '#6366f1', colorSecondary: '#8b5cf6', colorAccent: '#06b6d4', colorBackground: '#ffffff', colorText: '#1f2937' },
  },
  {
    name: 'Ocean Blue',
    colors: { colorPrimary: '#2563eb', colorSecondary: '#3b82f6', colorAccent: '#0ea5e9', colorBackground: '#ffffff', colorText: '#1e293b' },
  },
  {
    name: 'Emerald Fresh',
    colors: { colorPrimary: '#059669', colorSecondary: '#10b981', colorAccent: '#14b8a6', colorBackground: '#ffffff', colorText: '#1f2937' },
  },
  {
    name: 'Rose Elegant',
    colors: { colorPrimary: '#e11d48', colorSecondary: '#f43f5e', colorAccent: '#ec4899', colorBackground: '#ffffff', colorText: '#1f2937' },
  },
  {
    name: 'Amber Warm',
    colors: { colorPrimary: '#d97706', colorSecondary: '#f59e0b', colorAccent: '#eab308', colorBackground: '#fffbeb', colorText: '#292524' },
  },
  {
    name: 'Dark Pro',
    colors: { colorPrimary: '#818cf8', colorSecondary: '#a78bfa', colorAccent: '#22d3ee', colorBackground: '#0f172a', colorText: '#f1f5f9', colorSurface: '#1e293b', colorBorder: '#334155' },
  },
];

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Source Sans Pro', value: 'Source Sans 3, sans-serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { label: 'Fira Code', value: 'Fira Code, monospace' },
];

export default function ThemePanel() {
  const { state, dispatch } = useBuilder();
  const theme = state.siteConfig?.theme || DEFAULT_THEME;

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    dispatch({ type: 'UPDATE_THEME', theme: updates });
  };

  const resetTheme = () => {
    dispatch({ type: 'UPDATE_THEME', theme: { ...DEFAULT_THEME } });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-pink-600" />
            <h3 className="text-sm font-bold text-gray-800">Tema & Gaya Global</h3>
          </div>
          <button
            onClick={resetTheme}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            title="Reset ke default"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto builder-panel">
        {/* Preset Themes */}
        <Section title="Preset Tema" icon={Sparkles} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_THEMES.map(preset => (
              <button
                key={preset.name}
                onClick={() => updateTheme(preset.colors)}
                className="p-2.5 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex gap-1 mb-1.5">
                  {[preset.colors.colorPrimary, preset.colors.colorSecondary, preset.colors.colorAccent].filter(Boolean).map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-gray-700">{preset.name}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Colors */}
        <Section title="Warna" icon={Palette} defaultOpen={true}>
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Brand</p>
            <ColorField label="Primer" value={theme.colorPrimary} onChange={v => updateTheme({ colorPrimary: v })} />
            <ColorField label="Sekunder" value={theme.colorSecondary} onChange={v => updateTheme({ colorSecondary: v })} />
            <ColorField label="Aksen" value={theme.colorAccent} onChange={v => updateTheme({ colorAccent: v })} />

            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2">Status</p>
            <ColorField label="Sukses" value={theme.colorSuccess} onChange={v => updateTheme({ colorSuccess: v })} />
            <ColorField label="Peringatan" value={theme.colorWarning} onChange={v => updateTheme({ colorWarning: v })} />
            <ColorField label="Bahaya" value={theme.colorDanger} onChange={v => updateTheme({ colorDanger: v })} />

            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2">UI</p>
            <ColorField label="Teks" value={theme.colorText} onChange={v => updateTheme({ colorText: v })} />
            <ColorField label="Teks Sekunder" value={theme.colorTextSecondary} onChange={v => updateTheme({ colorTextSecondary: v })} />
            <ColorField label="Background" value={theme.colorBackground} onChange={v => updateTheme({ colorBackground: v })} />
            <ColorField label="Surface" value={theme.colorSurface} onChange={v => updateTheme({ colorSurface: v })} />
            <ColorField label="Border" value={theme.colorBorder} onChange={v => updateTheme({ colorBorder: v })} />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Tipografi" icon={Type}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Font Heading</label>
            <select
              value={theme.fontHeading}
              onChange={e => updateTheme({ fontHeading: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
            >
              {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <p className="mt-1.5 text-sm font-bold" style={{ fontFamily: theme.fontHeading }}>Preview Heading Abc</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Font Body</label>
            <select
              value={theme.fontBody}
              onChange={e => updateTheme({ fontBody: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
            >
              {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <p className="mt-1.5 text-xs" style={{ fontFamily: theme.fontBody }}>Preview body text — Lorem ipsum dolor sit amet</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Ukuran Base</label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={theme.fontSizeBase}
                  onChange={e => updateTheme({ fontSizeBase: parseInt(e.target.value) })}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-[10px] text-gray-500 w-8 text-right">{theme.fontSizeBase}px</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Line Height</label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  value={theme.lineHeightBase}
                  onChange={e => updateTheme({ lineHeightBase: parseFloat(e.target.value) })}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-[10px] text-gray-500 w-8 text-right">{theme.lineHeightBase}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Layout */}
        <Section title="Layout & Spacing" icon={Layout}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Lebar Maksimum: {theme.maxWidth}px</label>
            <input
              type="range"
              min={800}
              max={1600}
              step={20}
              value={theme.maxWidth}
              onChange={e => updateTheme({ maxWidth: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>800px</span>
              <span>1600px</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Padding Container: {theme.containerPadding}px</label>
            <input
              type="range"
              min={8}
              max={64}
              step={4}
              value={theme.containerPadding}
              onChange={e => updateTheme({ containerPadding: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base Spacing: {theme.spacing}px</label>
            <input
              type="range"
              min={4}
              max={32}
              step={2}
              value={theme.spacing}
              onChange={e => updateTheme({ spacing: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius: {theme.borderRadius}px</label>
            <input
              type="range"
              min={0}
              max={24}
              value={theme.borderRadius}
              onChange={e => updateTheme({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex gap-2 mt-2">
              {[0, 4, 8, 12, 16, 24].map(r => (
                <button
                  key={r}
                  onClick={() => updateTheme({ borderRadius: r })}
                  className={`w-8 h-8 border-2 transition-colors ${theme.borderRadius === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  style={{ borderRadius: r }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Component Styles */}
        <Section title="Gaya Komponen" icon={Maximize2}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Gaya Tombol</label>
            <div className="flex gap-2">
              {([
                { value: 'rounded', label: 'Rounded', radius: '8px' },
                { value: 'pill', label: 'Pill', radius: '999px' },
                { value: 'square', label: 'Square', radius: '0px' },
              ] as const).map(s => (
                <button
                  key={s.value}
                  onClick={() => updateTheme({ buttonStyle: s.value })}
                  className={`flex-1 py-2 text-[10px] font-semibold border-2 transition-all ${
                    theme.buttonStyle === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'
                  }`}
                  style={{ borderRadius: s.radius }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Gaya Input</label>
            <div className="flex gap-2">
              {([
                { value: 'rounded', label: 'Rounded' },
                { value: 'underline', label: 'Underline' },
                { value: 'square', label: 'Square' },
              ] as const).map(s => (
                <button
                  key={s.value}
                  onClick={() => updateTheme({ inputStyle: s.value })}
                  className={`flex-1 py-2 text-[10px] font-semibold rounded-lg border-2 transition-all ${
                    theme.inputStyle === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bayangan</label>
            <div className="flex gap-2">
              {([
                { value: 'none', label: 'Tanpa' },
                { value: 'subtle', label: 'Halus' },
                { value: 'medium', label: 'Sedang' },
                { value: 'strong', label: 'Kuat' },
              ] as const).map(s => (
                <button
                  key={s.value}
                  onClick={() => updateTheme({ shadowStyle: s.value })}
                  className={`flex-1 py-2 text-[10px] font-semibold rounded-lg border-2 transition-all ${
                    theme.shadowStyle === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kecepatan Animasi</label>
            <div className="flex gap-2">
              {([
                { value: 'none', label: 'Mati' },
                { value: 'fast', label: 'Cepat' },
                { value: 'normal', label: 'Normal' },
                { value: 'slow', label: 'Lambat' },
              ] as const).map(s => (
                <button
                  key={s.value}
                  onClick={() => updateTheme({ animationSpeed: s.value })}
                  className={`flex-1 py-2 text-[10px] font-semibold rounded-lg border-2 transition-all ${
                    theme.animationSpeed === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Dark Mode */}
        <Section title="Mode Gelap" icon={Moon}>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              {theme.darkMode ? <Moon size={13} className="text-indigo-500" /> : <Sun size={13} className="text-yellow-500" />}
              <span className="text-xs text-gray-600">Aktifkan Mode Gelap</span>
            </div>
            <div
              onClick={() => updateTheme({ darkMode: !theme.darkMode })}
              className={`relative cursor-pointer rounded-full transition-colors ${theme.darkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}
              style={{ width: 32, height: 18 }}
            >
              <div
                className="absolute top-0.5 bg-white rounded-full shadow-sm transition-transform"
                style={{ width: 14, height: 14, transform: theme.darkMode ? 'translateX(15px)' : 'translateX(2px)' }}
              />
            </div>
          </label>
          {theme.darkMode && (
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <ColorField label="Dark Background" value={theme.darkColorBackground} onChange={v => updateTheme({ darkColorBackground: v })} />
              <ColorField label="Dark Surface" value={theme.darkColorSurface} onChange={v => updateTheme({ darkColorSurface: v })} />
              <ColorField label="Dark Text" value={theme.darkColorText} onChange={v => updateTheme({ darkColorText: v })} />
            </div>
          )}
        </Section>

        {/* Custom CSS */}
        <Section title="CSS Kustom" icon={Zap}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tambahan CSS Global</label>
            <textarea
              value={theme.customCSS}
              onChange={e => updateTheme({ customCSS: e.target.value })}
              placeholder={":root {\n  --custom-var: #000;\n}\n\n.my-class {\n  color: var(--custom-var);\n}"}
              rows={8}
              className="w-full px-3 py-2 text-[11px] font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none bg-gray-50"
            />
          </div>
        </Section>

        {/* Theme Preview */}
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Preview Tema</p>
          <div
            className="p-4 rounded-lg border border-gray-200 space-y-3"
            style={{ backgroundColor: theme.colorBackground, fontFamily: theme.fontBody }}
          >
            <h3 style={{ fontFamily: theme.fontHeading, color: theme.colorText, fontSize: theme.fontSizeBase * 1.5 }} className="font-bold">
              Heading Preview
            </h3>
            <p style={{ color: theme.colorTextSecondary, fontSize: theme.fontSizeBase, lineHeight: theme.lineHeightBase }}>
              Body text preview — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-xs font-semibold text-white"
                style={{
                  backgroundColor: theme.colorPrimary,
                  borderRadius: theme.buttonStyle === 'pill' ? 999 : theme.buttonStyle === 'square' ? 0 : theme.borderRadius,
                }}
              >
                Primary
              </button>
              <button
                className="px-4 py-2 text-xs font-semibold text-white"
                style={{
                  backgroundColor: theme.colorSecondary,
                  borderRadius: theme.buttonStyle === 'pill' ? 999 : theme.buttonStyle === 'square' ? 0 : theme.borderRadius,
                }}
              >
                Secondary
              </button>
              <button
                className="px-4 py-2 text-xs font-semibold text-white"
                style={{
                  backgroundColor: theme.colorAccent,
                  borderRadius: theme.buttonStyle === 'pill' ? 999 : theme.buttonStyle === 'square' ? 0 : theme.borderRadius,
                }}
              >
                Accent
              </button>
            </div>
            <div className="flex gap-2">
              <span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: theme.colorSuccess }} title="Success" />
              <span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: theme.colorWarning }} title="Warning" />
              <span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: theme.colorDanger }} title="Danger" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
