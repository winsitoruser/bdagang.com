import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import {
  Settings,
  Building2,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Clock,
  Bell,
  Shield,
  Percent,
  Globe,
  CheckCircle,
  AlertTriangle,
  Copy,
  Eye
} from 'lucide-react';

interface BranchSettingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'operations' | 'pricing' | 'notifications' | 'security';
  settings: Record<string, any>;
  appliedBranches: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BranchSettings() {
  const [mounted, setMounted] = useState(false);
  const [templates, setTemplates] = useState<BranchSettingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BranchSettingTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'operations' as BranchSettingTemplate['category'],
    isDefault: false
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/branch-settings');
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.templates) setTemplates(payload.templates);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTemplates();
  }, []);

  if (!mounted) {
    return null;
  }

  const handleCreate = async () => {
    setSaving(true);
    // API call to create template
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setShowCreateModal(false);
    fetchTemplates();
  };

  const handleEdit = async () => {
    setSaving(true);
    // API call to update template
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setShowEditModal(false);
    fetchTemplates();
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    // API call to delete template
    setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
    setShowDeleteConfirm(false);
    setSelectedTemplate(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operations': return <Clock className="w-4 h-4" />;
      case 'pricing': return <DollarSign className="w-4 h-4" />;
      case 'notifications': return <Bell className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operations': return 'bg-blue-100 text-blue-800';
      case 'pricing': return 'bg-green-100 text-green-800';
      case 'notifications': return 'bg-yellow-100 text-yellow-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'operations': return 'Operasional';
      case 'pricing': return 'Harga';
      case 'notifications': return 'Notifikasi';
      case 'security': return 'Keamanan';
      default: return category;
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: templates.length,
    operations: templates.filter(t => t.category === 'operations').length,
    pricing: templates.filter(t => t.category === 'pricing').length,
    notifications: templates.filter(t => t.category === 'notifications').length,
    security: templates.filter(t => t.category === 'security').length
  };

  return (
    <HQLayout title="Pengaturan Cabang" subtitle="Kelola template pengaturan untuk cabang">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Template</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.operations}</p>
                <p className="text-sm text-gray-500">Operasional</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pricing}</p>
                <p className="text-sm text-gray-500">Harga</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.notifications}</p>
                <p className="text-sm text-gray-500">Notifikasi</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.security}</p>
                <p className="text-sm text-gray-500">Keamanan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari template..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="operations">Operasional</option>
                <option value="pricing">Harga</option>
                <option value="notifications">Notifikasi</option>
                <option value="security">Keamanan</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTemplates}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setFormData({ name: '', description: '', category: 'operations', isDefault: false });
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Buat Template
              </button>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Tidak ada template ditemukan
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {getCategoryIcon(template.category)}
                      {getCategoryLabel(template.category)}
                    </div>
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{template.appliedBranches} cabang</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(template.updatedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowViewModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setFormData({
                          name: template.name,
                          description: template.description,
                          category: template.category,
                          isDefault: template.isDefault
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        // Duplicate template
                        const newTemplate = { ...template, id: Date.now().toString(), name: `${template.name} (Copy)`, isDefault: false };
                        setTemplates(prev => [...prev, newTemplate]);
                      }}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={template.isDefault}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => { setShowCreateModal(false); setShowEditModal(false); }}
          title={showCreateModal ? 'Buat Template Baru' : 'Edit Template'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Template</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama template"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Deskripsi template"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="operations">Operasional</option>
                <option value="pricing">Harga</option>
                <option value="notifications">Notifikasi</option>
                <option value="security">Keamanan</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">Jadikan template default</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={showCreateModal ? handleCreate : handleEdit}
                disabled={saving || !formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={selectedTemplate?.name || 'Detail Template'}
          size="lg"
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTemplate.category)}`}>
                  {getCategoryIcon(selectedTemplate.category)}
                  {getCategoryLabel(selectedTemplate.category)}
                </span>
                {selectedTemplate.isDefault && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Default</span>
                )}
              </div>
              <p className="text-gray-600">{selectedTemplate.description}</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Pengaturan</h4>
                <div className="space-y-2">
                  {Object.entries(selectedTemplate.settings).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">
                        {typeof value === 'boolean' ? (value ? 'Ya' : 'Tidak') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Diterapkan ke {selectedTemplate.appliedBranches} cabang</span>
                <span>Terakhir diperbarui: {new Date(selectedTemplate.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Hapus Template"
          message={`Apakah Anda yakin ingin menghapus template "${selectedTemplate?.name}"? Template yang sedang digunakan oleh cabang akan direset ke pengaturan default.`}
          confirmText="Hapus"
          variant="danger"
        />
      </div>
    </HQLayout>
  );
}
