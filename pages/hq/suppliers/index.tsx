import React, { useState, useEffect, useCallback } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import {
  Truck, Save, RefreshCw, Plus, Edit, Trash2, Search, Eye,
  Phone, Mail, MapPin, Building2, DollarSign, Package, Star,
  Calendar, FileText, CheckCircle, AlertTriangle, Clock, Download, Loader2
} from 'lucide-react';

interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  payment_terms: string;
  bank_name: string;
  bank_account: string;
  notes: string;
  is_active: boolean;
  product_count: number;
  po_count: number;
  created_at: string;
}

export default function SuppliersPage() {
  const [mounted, setMounted] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '', name: '', contactPerson: '', phone: '', email: '',
    address: '', city: '', paymentTerms: 'Net 30',
    bankName: '', bankAccount: '', notes: ''
  });

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hq/warehouse?action=suppliers');
      const json = await res.json();
      if (json.success) {
        setSuppliers(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch suppliers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setMounted(true); fetchSuppliers(); }, [fetchSuppliers]);

  if (!mounted) return null;

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hq/warehouse?action=suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchSuppliers();
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!selectedSupplier) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hq/warehouse?action=suppliers&id=${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchSuppliers();
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      await fetch(`/api/hq/warehouse?action=suppliers&id=${supplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !supplier.is_active })
      });
      fetchSuppliers();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;
    try {
      await fetch(`/api/hq/warehouse?action=suppliers&id=${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false })
      });
      fetchSuppliers();
    } catch (e) { console.error(e); }
    setShowDeleteConfirm(false);
    setSelectedSupplier(null);
  };

  const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  const filtered = suppliers.filter(s => {
    const matchSearch = !searchTerm ||
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active);
    return matchSearch && matchStatus;
  });

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.is_active).length,
    totalProducts: suppliers.reduce((s, sup) => s + (sup.product_count || 0), 0),
    totalPO: suppliers.reduce((s, sup) => s + (sup.po_count || 0), 0),
  };

  const openCreate = () => {
    setFormData({ code: '', name: '', contactPerson: '', phone: '', email: '', address: '', city: '', paymentTerms: 'Net 30', bankName: '', bankAccount: '', notes: '' });
    setShowCreateModal(true);
  };

  const openEdit = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setFormData({
      code: sup.code || '', name: sup.name || '', contactPerson: sup.contact_person || '',
      phone: sup.phone || '', email: sup.email || '', address: sup.address || '',
      city: sup.city || '', paymentTerms: sup.payment_terms || 'Net 30',
      bankName: sup.bank_name || '', bankAccount: sup.bank_account || '', notes: sup.notes || ''
    });
    setShowEditModal(true);
  };

  return (
    <HQLayout title="Manajemen Supplier" subtitle="Kelola data supplier dan vendor">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Supplier', value: stats.total, icon: Truck, color: 'blue' },
            { label: 'Aktif', value: stats.active, icon: CheckCircle, color: 'green' },
            { label: 'Produk Terkait', value: stats.totalProducts, icon: Package, color: 'purple' },
            { label: 'Total PO', value: stats.totalPO, icon: FileText, color: 'orange' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${s.color}-100 rounded-lg`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Cari supplier..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchSuppliers} disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Plus className="w-4 h-4" /> Tambah Supplier
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Tidak ada supplier ditemukan</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">Kontak</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">Lokasi</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase">Produk</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase">PO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">Payment</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sup) => (
                    <tr key={sup.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{sup.name}</p>
                        <p className="text-xs text-gray-500">{sup.code}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium">{sup.contact_person || '-'}</p>
                        {sup.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{sup.phone}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{sup.city || '-'}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">{sup.product_count || 0}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{sup.po_count || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{sup.payment_terms || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => handleToggleActive(sup)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${sup.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {sup.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedSupplier(sup); setShowViewModal(true); }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(sup)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedSupplier(sup); setShowDeleteConfirm(true); }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* View Modal */}
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)}
          title={selectedSupplier?.name || 'Detail Supplier'} subtitle={selectedSupplier?.code} size="lg">
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedSupplier.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedSupplier.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><p className="text-sm text-gray-500">Kontak Person</p><p className="font-medium">{selectedSupplier.contact_person || '-'}</p></div>
                  {selectedSupplier.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{selectedSupplier.phone}</span></div>}
                  {selectedSupplier.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{selectedSupplier.email}</span></div>}
                  {selectedSupplier.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div><p>{selectedSupplier.address}</p><p className="text-sm text-gray-500">{selectedSupplier.city}</p></div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Produk</p>
                      <p className="text-xl font-bold">{selectedSupplier.product_count || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Purchase Order</p>
                      <p className="text-xl font-bold">{selectedSupplier.po_count || 0}</p>
                    </div>
                  </div>
                  <div><p className="text-sm text-gray-500">Payment Terms</p><p className="font-medium">{selectedSupplier.payment_terms || '-'}</p></div>
                  {selectedSupplier.bank_name && <div><p className="text-sm text-gray-500">Bank</p><p className="font-medium">{selectedSupplier.bank_name} - {selectedSupplier.bank_account}</p></div>}
                </div>
              </div>
              {selectedSupplier.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800">Catatan</p>
                  <p className="text-yellow-700">{selectedSupplier.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Create/Edit Modal */}
        <Modal isOpen={showCreateModal || showEditModal}
          onClose={() => { setShowCreateModal(false); setShowEditModal(false); }}
          title={showCreateModal ? 'Tambah Supplier' : 'Edit Supplier'} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Supplier</label>
                <input type="text" value={formData.code}
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  readOnly={showEditModal} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Person</label>
                <input type="text" value={formData.contactPerson}
                  onChange={(e) => setFormData(p => ({ ...p, contactPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input type="text" value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                <input type="text" value={formData.city}
                  onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select value={formData.paymentTerms}
                  onChange={(e) => setFormData(p => ({ ...p, paymentTerms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="COD">COD</option>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 14">Net 14</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
                <input type="text" value={formData.bankName}
                  onChange={(e) => setFormData(p => ({ ...p, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekening</label>
                <input type="text" value={formData.bankAccount}
                  onChange={(e) => setFormData(p => ({ ...p, bankAccount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
              <button onClick={showCreateModal ? handleCreate : handleEdit}
                disabled={saving || !formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete} title="Nonaktifkan Supplier"
          message={`Apakah Anda yakin ingin menonaktifkan supplier "${selectedSupplier?.name}"?`}
          confirmText="Nonaktifkan" variant="danger" />
      </div>
    </HQLayout>
  );
}
