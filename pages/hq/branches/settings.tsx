import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import HQLayout from '../../../components/hq/HQLayout';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import { toast } from 'react-hot-toast';
import {
  Settings, Building2, Save, RefreshCw, Plus, Edit, Trash2, Search,
  DollarSign, Clock, Bell, Shield, Percent, Globe, CheckCircle, AlertTriangle,
  Copy, Eye, Download, Upload, FileText, Layers, Workflow, Lock, Users,
  Activity, Heart, Zap, ToggleLeft, ToggleRight, Star
} from 'lucide-react';

type SettingCategory = 'operations' | 'pricing' | 'notifications' | 'security' | 'compliance' | 'workflow' | 'integration';

interface BranchSettingTemplate {
  id: string;
  name: string;
  description: string;
  category: SettingCategory;
  industry?: string;
  settings: Record<string, any>;
  appliedBranches: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'Umum' }, { value: 'fnb', label: 'F&B' },
  { value: 'retail', label: 'Retail' }, { value: 'logistics', label: 'Logistik' },
  { value: 'hospitality', label: 'Hospitality' }, { value: 'manufacturing', label: 'Manufaktur' },
  { value: 'finance', label: 'Finance' }, { value: 'workshop', label: 'Bengkel' },
  { value: 'pharmacy', label: 'Farmasi' }, { value: 'distributor', label: 'Distributor' },
  { value: 'rental', label: 'Rental' }, { value: 'property', label: 'Property' },
];

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; tKey: string }> = {
  operations: { icon: Clock, color: 'bg-blue-100 text-blue-800', tKey: 'branchSettings.catOperations' },
  pricing: { icon: DollarSign, color: 'bg-green-100 text-green-800', tKey: 'branchSettings.catPricing' },
  notifications: { icon: Bell, color: 'bg-yellow-100 text-yellow-800', tKey: 'branchSettings.catNotifications' },
  security: { icon: Shield, color: 'bg-red-100 text-red-800', tKey: 'branchSettings.catSecurity' },
  compliance: { icon: FileText, color: 'bg-purple-100 text-purple-800', tKey: 'branchSettings.catCompliance' },
  workflow: { icon: Zap, color: 'bg-teal-100 text-teal-800', tKey: 'branchSettings.catWorkflow' },
  integration: { icon: Globe, color: 'bg-indigo-100 text-indigo-800', tKey: 'branchSettings.catIntegration' },
};



const MOCK_SETTING_TEMPLATES: BranchSettingTemplate[] = [
  { id: 'tpl1', name: 'Standar F&B', description: 'Template pengaturan standar untuk outlet F&B', category: 'operations', industry: 'fnb', settings: { openingHour: '08:00', closingHour: '22:00', maxCapacity: 60, takeawayEnabled: true, deliveryEnabled: true }, appliedBranches: 4, isDefault: true, createdAt: '2025-06-01', updatedAt: '2026-01-15' },
  { id: 'tpl2', name: 'Harga Premium Jakarta', description: 'Template harga untuk cabang premium Jakarta', category: 'pricing', industry: 'fnb', settings: { priceMultiplier: 1.15, taxIncluded: true, serviceCharge: 5 }, appliedBranches: 2, isDefault: false, createdAt: '2025-08-01', updatedAt: '2026-02-10' },
  { id: 'tpl3', name: 'Keamanan Standar', description: 'Pengaturan keamanan default untuk semua cabang', category: 'security', industry: 'general', settings: { maxLoginAttempts: 5, sessionTimeout: 30, twoFactorRequired: false }, appliedBranches: 6, isDefault: true, createdAt: '2025-01-01', updatedAt: '2025-12-20' },
];

export default function BranchSettings() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [templates, setTemplates] = useState<BranchSettingTemplate[]>(MOCK_SETTING_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [subTab, setSubTab] = useState<'templates' | 'compliance' | 'workflows'>('templates');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BranchSettingTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '',
    category: 'operations' as SettingCategory,
    industry: 'general',
    isDefault: false
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hq/branches/enhanced?action=settings-templates');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.length > 0) { setTemplates(json.data); return; }
      }
      const response = await fetch('/api/hq/branch-settings');
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.templates) setTemplates(payload.templates);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setTemplates(MOCK_SETTING_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTemplates();
  }, []);

  if (!mounted) return null;

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hq/branch-settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(t('branchSettings.templateCreated'));
      } else {
        // fallback: add locally
        setTemplates(prev => [...prev, { ...formData, id: Date.now().toString(), settings: {}, appliedBranches: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
        toast.success(t('branchSettings.templateCreatedLocal'));
      }
    } catch {
      setTemplates(prev => [...prev, { ...formData, id: Date.now().toString(), settings: {}, appliedBranches: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    }
    setSaving(false);
    setShowCreateModal(false);
    fetchTemplates();
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      if (selectedTemplate) {
        setTemplates(prev => prev.map(tpl => tpl.id === selectedTemplate.id ? { ...tpl, ...formData, updatedAt: new Date().toISOString() } : tpl));
        toast.success(t('branchSettings.templateUpdated'));
      }
    } catch { toast.error(t('branchSettings.updateFailed')); }
    setSaving(false);
    setShowEditModal(false);
    fetchTemplates();
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    setTemplates(prev => prev.filter(tpl => tpl.id !== selectedTemplate.id));
    toast.success(t('branchSettings.templateDeleted'));
    setShowDeleteConfirm(false);
    setSelectedTemplate(null);
  };

  const handleExportTemplates = () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `branch-settings-templates-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('branchSettings.templatesExported'));
  };

  const getCategoryIcon = (category: string) => {
    const cfg = CATEGORY_CONFIG[category];
    if (!cfg) return <Settings className="w-4 h-4" />;
    const Icon = cfg.icon;
    return <Icon className="w-4 h-4" />;
  };
  const getCategoryColor = (category: string) => CATEGORY_CONFIG[category]?.color || 'bg-gray-100 text-gray-800';
  const getCategoryLabel = (category: string) => CATEGORY_CONFIG[category]?.tKey || category;

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) || tpl.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tpl.category === categoryFilter;
    const matchesIndustry = industryFilter === 'all' || !tpl.industry || tpl.industry === industryFilter || tpl.industry === 'general';
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const categoryCounts = Object.keys(CATEGORY_CONFIG).reduce((acc, k) => {
    acc[k] = templates.filter(tpl => tpl.category === k).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <HQLayout title={t('branchSettings.title')} subtitle={t('branchSettings.subtitle')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('branchSettings.title')}</h1>
            <p className="text-gray-500">{t('branchSettings.manageDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportTemplates} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4" /> {t('branchSettings.exportBtn')}
            </button>
            <button onClick={() => { setFormData({ name: '', description: '', category: 'operations', industry: 'general', isDefault: false }); setShowCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="w-4 h-4" /> {t('branchSettings.createTemplate')}
            </button>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-7 gap-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = categoryCounts[key] || 0;
            return (
              <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)} className={`rounded-xl p-3 border transition-all text-left ${categoryFilter === key ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg ${cfg.color.split(' ')[0]}`}><Icon className={`w-4 h-4 ${cfg.color.split(' ')[1]}`} /></div>
                </div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{t(cfg.tKey)}</p>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {[{ v: 'templates' as const, l: t('branchSettings.tabTemplates'), icon: Layers }, { v: 'compliance' as const, l: t('branchSettings.tabCompliance'), icon: FileText }, { v: 'workflows' as const, l: t('branchSettings.tabWorkflows'), icon: Zap }].map(tb => (
            <button key={tb.v} onClick={() => setSubTab(tb.v)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${subTab === tb.v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <tb.icon className="w-4 h-4" />{tb.l}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={t('branchSettings.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-56 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">{t('branchSettings.allCategories')}</option>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{t(v.tKey)}</option>)}
              </select>
              <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">{t('branchSettings.allIndustries')}</option>
                {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button onClick={fetchTemplates} disabled={loading} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('branchSettings.refresh')}
            </button>
          </div>
        </div>

        {/* ═══ Templates Sub-Tab ═══ */}
        {subTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-3 flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">{t('branchSettings.noTemplatesFound')}</div>
            ) : (
              filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                          {getCategoryIcon(template.category)}{t(getCategoryLabel(template.category))}
                        </span>
                        {template.industry && template.industry !== 'general' && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs">{INDUSTRY_OPTIONS.find(i => i.value === template.industry)?.label}</span>
                        )}
                      </div>
                      {template.isDefault && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Default</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{template.appliedBranches} {t('branchSettings.branchCount')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(template.updatedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <button onClick={() => { setSelectedTemplate(template); setShowViewModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{t('branchSettings.view')}</button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedTemplate(template); setFormData({ name: template.name, description: template.description, category: template.category, industry: template.industry || 'general', isDefault: template.isDefault }); setShowEditModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { const n = { ...template, id: Date.now().toString(), name: `${template.name} (Copy)`, isDefault: false }; setTemplates(prev => [...prev, n]); toast.success(t('branchSettings.duplicated')); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setSelectedTemplate(template); setShowDeleteConfirm(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" disabled={template.isDefault}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ Compliance Sub-Tab ═══ */}
        {subTab === 'compliance' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-700"><strong>{t('branchSettings.complianceTitle')}</strong>: {t('branchSettings.complianceDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'BPOM & Farmasi', desc: 'Validasi resep, monitoring suhu, log zat terkontrol, alert kadaluarsa', industry: 'pharmacy', icon: Heart, color: 'bg-red-50 border-red-200', items: ['Validasi Resep Wajib', 'Cold Chain Monitoring', 'Log Zat Terkontrol', 'Alert Kadaluarsa 90 Hari', 'Apoteker Jaga Wajib'] },
                { title: 'Keamanan Pangan (F&B)', desc: 'HACCP, suhu penyimpanan, kebersihan, traceability bahan', industry: 'fnb', icon: CheckCircle, color: 'bg-green-50 border-green-200', items: ['HACCP Compliance', 'Monitoring Suhu', 'Log Kebersihan Harian', 'Traceability Bahan', 'Sertifikasi Halal'] },
                { title: 'Kepatuhan Keuangan', desc: 'KYC, AML, audit trail, retensi data, pelaporan BI', industry: 'finance', icon: Shield, color: 'bg-blue-50 border-blue-200', items: ['KYC Verification', 'AML Screening', 'Audit Trail 7 Tahun', 'Pelaporan BI/OJK', 'Data Encryption'] },
                { title: 'Standar Retail', desc: 'Label harga, consumer protection, garansi, retur', industry: 'retail', icon: Globe, color: 'bg-yellow-50 border-yellow-200', items: ['Label Harga Wajib', 'Consumer Protection', 'Kebijakan Garansi', 'Prosedur Retur', 'Stock Accuracy'] },
                { title: 'Keselamatan Kerja', desc: 'K3, APAR, P3K, pelatihan keselamatan, inspeksi rutin', industry: 'manufacturing', icon: AlertTriangle, color: 'bg-orange-50 border-orange-200', items: ['Checklist K3', 'Inspeksi APAR', 'Kotak P3K', 'Pelatihan Bulanan', 'APD Compliance'] },
                { title: 'Hospitality Standard', desc: 'Standar layanan, kebersihan kamar, food safety, fire safety', industry: 'hospitality', icon: Star, color: 'bg-teal-50 border-teal-200', items: ['SOP Layanan Tamu', 'Inspeksi Kebersihan', 'Fire Safety Check', 'Food Handler Cert', 'Guest Satisfaction'] },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className={`rounded-xl border p-5 ${c.color}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm"><Icon className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{c.title}</h4>
                        <p className="text-xs text-gray-500">{INDUSTRY_OPTIONS.find(i => i.value === c.industry)?.label}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{c.desc}</p>
                    <div className="space-y-1.5">
                      {c.items.map(item => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setFormData({ name: c.title, description: c.desc, category: 'compliance', industry: c.industry, isDefault: false }); setShowCreateModal(true); }} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                      <Plus className="w-4 h-4" /> {t('branchSettings.createTemplate')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Workflows Sub-Tab ═══ */}
        {subTab === 'workflows' && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-sm text-teal-700"><strong>{t('branchSettings.workflowTitle')}</strong>: {t('branchSettings.workflowDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Approval Diskon', desc: 'Persetujuan bertingkat untuk pemberian diskon', steps: ['Kasir request diskon', 'Manager review (≤15%)', 'Regional approve (≤30%)', 'HQ approve (>30%)'], icon: Percent },
                { title: 'Approval Purchase Order', desc: 'Alur persetujuan pembelian barang', steps: ['Staff buat PO', 'Manager cabang review', 'Finance verify budget', 'Procurement execute'], icon: FileText },
                { title: 'Refund & Void', desc: 'Prosedur retur dan void transaksi', steps: ['Kasir initiate refund', 'Verifikasi barang', 'Manager approve', 'Finance process'], icon: DollarSign },
                { title: 'Stock Transfer', desc: 'Alur transfer stok antar cabang', steps: ['Request dari cabang', 'Gudang verify stock', 'Manager approve', 'Logistik kirim'], icon: Building2 },
                { title: 'Employee Onboarding', desc: 'Proses onboarding karyawan baru', steps: ['HR create profile', 'Assign training', 'Manager verify', 'System access granted'], icon: Users },
                { title: 'Incident Escalation', desc: 'Eskalasi insiden dan masalah cabang', steps: ['Staff report issue', 'Auto-assign category', 'L1 support 2jam', 'L2 escalate 4jam', 'L3 management 8jam'], icon: AlertTriangle },
              ].map(w => {
                const Icon = w.icon;
                return (
                  <div key={w.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-teal-100 rounded-lg"><Icon className="w-4 h-4 text-teal-700" /></div>
                      <h4 className="font-semibold text-gray-900 text-sm">{w.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{w.desc}</p>
                    <div className="space-y-2">
                      {w.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</div>
                          <span className="text-xs text-gray-600">{step}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setFormData({ name: w.title, description: w.desc, category: 'workflow', industry: 'general', isDefault: false }); setShowCreateModal(true); }} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-medium text-teal-700 hover:bg-teal-100">
                      <Plus className="w-3.5 h-3.5" /> {t('branchSettings.activateWorkflow')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal isOpen={showCreateModal || showEditModal} onClose={() => { setShowCreateModal(false); setShowEditModal(false); }} title={showCreateModal ? t('branchSettings.createNewTemplate') : t('branchSettings.editTemplate')} size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('branchSettings.templateName')}</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={t('branchSettings.templateNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('branchSettings.description')}</label>
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} placeholder={t('branchSettings.descriptionPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('branchSettings.category')}</label>
                <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as SettingCategory }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{t(v.tKey)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('branchSettings.industry')}</label>
                <select value={formData.industry} onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor="isDefault" className="text-sm text-gray-700">{t('branchSettings.makeDefault')}</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">{t('branchSettings.cancel')}</button>
              <button onClick={showCreateModal ? handleCreate : handleEdit} disabled={saving || !formData.name} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? t('branchSettings.saving') : t('branchSettings.save')}
              </button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedTemplate?.name || t('branchSettings.detailTemplate')} size="lg">
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTemplate.category)}`}>
                  {getCategoryIcon(selectedTemplate.category)}{getCategoryLabel(selectedTemplate.category)}
                </span>
                {selectedTemplate.industry && selectedTemplate.industry !== 'general' && (
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">{INDUSTRY_OPTIONS.find(i => i.value === selectedTemplate.industry)?.label}</span>
                )}
                {selectedTemplate.isDefault && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Default</span>}
              </div>
              <p className="text-gray-600">{selectedTemplate.description}</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{t('branchSettings.settings')}</h4>
                <div className="space-y-2">
                  {Object.entries(selectedTemplate.settings).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-500 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-sm">
                        {typeof value === 'boolean' ? (value ? `✅ ${t('branchSettings.yes')}` : `❌ ${t('branchSettings.no')}`) : Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t('branchSettings.appliedTo')} {selectedTemplate.appliedBranches} {t('branchSettings.branchCount')}</span>
                <span>{t('branchSettings.lastUpdated')}: {new Date(selectedTemplate.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title={t('branchSettings.deleteTemplate')} message={t('branchSettings.deleteConfirm', { name: selectedTemplate?.name || '' })} confirmText={t('branchSettings.delete')} variant="danger" />
      </div>
    </HQLayout>
  );
}
