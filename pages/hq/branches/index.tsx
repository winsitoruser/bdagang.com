import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import DataTable, { Column } from '../../../components/hq/ui/DataTable';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Settings,
  TrendingUp,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Power
} from 'lucide-react';

interface Branch {
  id: string;
  code: string;
  name: string;
  type: 'main' | 'branch' | 'warehouse' | 'kiosk';
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  manager: {
    id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  priceTierId: string | null;
  priceTierName: string | null;
  createdAt: string;
  lastSync: string;
  status: 'online' | 'offline' | 'warning';
  stats: {
    todaySales: number;
    monthSales: number;
    employeeCount: number;
    lowStockItems: number;
  };
  setupStatus?: 'pending' | 'in_progress' | 'completed' | 'skipped' | null;
  setupProgress?: number;
}

const mockBranches: Branch[] = [
  {
    id: '1',
    code: 'HQ-001',
    name: 'Cabang Pusat Jakarta',
    type: 'main',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    phone: '021-1234567',
    email: 'pusat@bedagang.com',
    manager: { id: '1', name: 'Ahmad Wijaya', email: 'ahmad@bedagang.com' },
    isActive: true,
    priceTierId: null,
    priceTierName: 'Harga Standar',
    createdAt: '2024-01-01',
    lastSync: new Date().toISOString(),
    status: 'online',
    stats: { todaySales: 45000000, monthSales: 1250000000, employeeCount: 25, lowStockItems: 5 }
  },
  {
    id: '2',
    code: 'BR-002',
    name: 'Cabang Bandung',
    type: 'branch',
    address: 'Jl. Asia Afrika No. 45',
    city: 'Bandung',
    province: 'Jawa Barat',
    phone: '022-7654321',
    email: 'bandung@bedagang.com',
    manager: { id: '2', name: 'Siti Rahayu', email: 'siti@bedagang.com' },
    isActive: true,
    priceTierId: '1',
    priceTierName: 'Harga Mall',
    createdAt: '2024-03-15',
    lastSync: new Date(Date.now() - 300000).toISOString(),
    status: 'online',
    stats: { todaySales: 32000000, monthSales: 920000000, employeeCount: 18, lowStockItems: 12 }
  },
  {
    id: '3',
    code: 'BR-003',
    name: 'Cabang Surabaya',
    type: 'branch',
    address: 'Jl. Tunjungan No. 78',
    city: 'Surabaya',
    province: 'Jawa Timur',
    phone: '031-8765432',
    email: 'surabaya@bedagang.com',
    manager: { id: '3', name: 'Budi Santoso', email: 'budi@bedagang.com' },
    isActive: true,
    priceTierId: null,
    priceTierName: 'Harga Standar',
    createdAt: '2024-05-20',
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    status: 'warning',
    stats: { todaySales: 28500000, monthSales: 850000000, employeeCount: 15, lowStockItems: 8 }
  },
  {
    id: '4',
    code: 'WH-001',
    name: 'Gudang Pusat Cikarang',
    type: 'warehouse',
    address: 'Kawasan Industri Jababeka Blok A5',
    city: 'Cikarang',
    province: 'Jawa Barat',
    phone: '021-89123456',
    email: 'gudang@bedagang.com',
    manager: { id: '4', name: 'Rudi Hermawan', email: 'rudi@bedagang.com' },
    isActive: true,
    priceTierId: null,
    priceTierName: null,
    createdAt: '2024-01-01',
    lastSync: new Date().toISOString(),
    status: 'online',
    stats: { todaySales: 0, monthSales: 0, employeeCount: 12, lowStockItems: 3 }
  },
  {
    id: '5',
    code: 'KS-001',
    name: 'Kiosk Mall Taman Anggrek',
    type: 'kiosk',
    address: 'Mall Taman Anggrek Lt. 3',
    city: 'Jakarta Barat',
    province: 'DKI Jakarta',
    phone: '021-56781234',
    email: 'kiosk.ta@bedagang.com',
    manager: { id: '5', name: 'Dewi Kusuma', email: 'dewi@bedagang.com' },
    isActive: true,
    priceTierId: '2',
    priceTierName: 'Harga Mall Premium',
    createdAt: '2024-08-01',
    lastSync: new Date(Date.now() - 7200000).toISOString(),
    status: 'offline',
    stats: { todaySales: 8500000, monthSales: 280000000, employeeCount: 5, lowStockItems: 2 }
  }
];

export default function BranchManagement() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'branch' as Branch['type'],
    address: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    managerId: '',
    priceTierId: ''
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/branches?page=${page}&limit=${pageSize}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        setBranches(payload.branches || mockBranches);
        setTotal(payload.total || mockBranches.length);
      } else {
        setBranches(mockBranches);
        setTotal(mockBranches.length);
      }
    } catch (error) {
      setBranches(mockBranches);
      setTotal(mockBranches.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBranches();
  }, [page, pageSize]);

  if (!mounted) {
    return null;
  }

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/hq/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        resetForm();
        
        // Redirect to setup wizard if available
        if (data.redirectToSetup && data.setupUrl) {
          window.location.href = data.setupUrl;
        } else {
          fetchBranches();
        }
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowEditModal(false);
        resetForm();
        fetchBranches();
      }
    } catch (error) {
      console.error('Error updating branch:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/branches/${selectedBranch.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setShowDeleteConfirm(false);
        setSelectedBranch(null);
        fetchBranches();
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/branches/${selectedBranch.id}/toggle-active`, {
        method: 'POST'
      });
      if (response.ok) {
        setShowToggleConfirm(false);
        setSelectedBranch(null);
        fetchBranches();
      }
    } catch (error) {
      console.error('Error toggling branch:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'branch',
      address: '',
      city: '',
      province: '',
      phone: '',
      email: '',
      managerId: '',
      priceTierId: ''
    });
  };

  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      type: branch.type,
      address: branch.address,
      city: branch.city,
      province: branch.province,
      phone: branch.phone,
      email: branch.email,
      managerId: branch.manager.id,
      priceTierId: branch.priceTierId || ''
    });
    setShowEditModal(true);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      main: 'Pusat',
      branch: 'Cabang',
      warehouse: 'Gudang',
      kiosk: 'Kiosk'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      main: 'bg-purple-100 text-purple-800',
      branch: 'bg-blue-100 text-blue-800',
      warehouse: 'bg-orange-100 text-orange-800',
      kiosk: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<Branch>[] = [
    {
      key: 'code',
      header: 'Kode & Nama',
      sortable: true,
      render: (_, branch) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            branch.status === 'online' ? 'bg-green-100' : 
            branch.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Building2 className={`w-5 h-5 ${
              branch.status === 'online' ? 'text-green-600' : 
              branch.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{branch.name}</div>
            <div className="text-sm text-gray-500">{branch.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipe',
      sortable: true,
      render: (_, branch) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(branch.type)}`}>
          {getTypeLabel(branch.type)}
        </span>
      )
    },
    {
      key: 'city',
      header: 'Lokasi',
      sortable: true,
      render: (_, branch) => (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{branch.city}, {branch.province}</span>
        </div>
      )
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (_, branch) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{branch.manager.name}</div>
            <div className="text-xs text-gray-500">{branch.manager.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (_, branch) => (
        <div className="flex flex-col items-center gap-1">
          <StatusBadge status={branch.status} />
          {!branch.isActive && (
            <span className="text-xs text-red-500">Non-aktif</span>
          )}
        </div>
      )
    },
    {
      key: 'setup',
      header: 'Setup',
      align: 'center',
      width: '100px',
      render: (_, branch) => {
        if (!branch.setupStatus || branch.setupStatus === 'completed') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Siap
            </span>
          );
        }
        if (branch.setupStatus === 'pending' || branch.setupStatus === 'in_progress') {
          return (
            <button
              onClick={(e) => { e.stopPropagation(); window.location.href = `/hq/branches/${branch.id}/setup`; }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200"
            >
              <Settings className="w-3 h-3" />
              {branch.setupProgress || 0}%
            </button>
          );
        }
        return null;
      }
    },
    {
      key: 'stats',
      header: 'Penjualan Hari Ini',
      align: 'right',
      render: (_, branch) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">{formatCurrency(branch.stats.todaySales)}</div>
          <div className="text-xs text-gray-500">{branch.stats.lowStockItems} item stok rendah</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '120px',
      render: (_, branch) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); window.location.href = `/hq/branches/${branch.id}`; }}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Monitor Realtime"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedBranch(branch); setShowViewModal(true); }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(branch); }}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedBranch(branch); setShowToggleConfirm(true); }}
            className={`p-2 rounded-lg ${branch.isActive ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}
            title={branch.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          >
            <Power className="w-4 h-4" />
          </button>
          {branch.type !== 'main' && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedBranch(branch); setShowDeleteConfirm(true); }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Cabang</h1>
            <p className="text-gray-500">Kelola semua cabang, gudang, dan kiosk</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Cabang
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cabang</p>
                <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Online</p>
                <p className="text-2xl font-bold text-green-600">{branches.filter(b => b.status === 'online').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{branches.filter(b => b.status === 'warning').length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Offline</p>
                <p className="text-2xl font-bold text-red-600">{branches.filter(b => b.status === 'offline').length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={branches}
          loading={loading}
          searchPlaceholder="Cari cabang..."
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize
          }}
          actions={{
            onRefresh: fetchBranches
          }}
          onRowClick={(branch) => { setSelectedBranch(branch); setShowViewModal(true); }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
        title={showCreateModal ? 'Tambah Cabang Baru' : 'Edit Cabang'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={showCreateModal ? handleCreate : handleUpdate}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Cabang</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="BR-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Branch['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="branch">Cabang</option>
                <option value="warehouse">Gudang</option>
                <option value="kiosk">Kiosk</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Cabang</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Cabang Bandung"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedBranch(null); }}
        title={selectedBranch?.name || 'Detail Cabang'}
        subtitle={selectedBranch?.code}
        size="xl"
        footer={
          <div className="flex justify-between">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tutup
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/hq/branches/${selectedBranch?.id}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" />
                Halaman Detail
              </button>
              <button
                onClick={() => { setShowViewModal(false); openEditModal(selectedBranch!); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        }
      >
        {selectedBranch && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Informasi Umum</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="font-medium">{selectedBranch.address}, {selectedBranch.city}, {selectedBranch.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telepon</p>
                      <p className="font-medium">{selectedBranch.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedBranch.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="font-medium">{selectedBranch.manager?.name || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Status & Konfigurasi</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={selectedBranch.status} />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Tipe</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedBranch.type)}`}>
                      {getTypeLabel(selectedBranch.type)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Price Tier</span>
                    <span className="font-medium">{selectedBranch.priceTierName || 'Harga Standar'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Sync Terakhir</span>
                    <span className="text-sm">{new Date(selectedBranch.lastSync).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600">Penjualan Hari Ini</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(selectedBranch.stats?.todaySales || 0)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600">Penjualan Bulan Ini</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(selectedBranch.stats?.monthSales || 0)}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Jumlah Karyawan</p>
                <p className="text-xl font-bold text-purple-900">{selectedBranch.stats?.employeeCount || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600">Stok Rendah</p>
                <p className="text-xl font-bold text-orange-900">{selectedBranch.stats?.lowStockItems || 0}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Aksi Cepat</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    window.location.href = `/hq/reports/sales?branch=${selectedBranch?.id}`;
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  Lihat Laporan
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    window.location.href = `/hq/reports/inventory?branch=${selectedBranch?.id}`;
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  Kelola Stok
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    window.location.href = `/hq/users?branch=${selectedBranch?.id}`;
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Kelola Karyawan
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    window.location.href = `/hq/branches/settings?branch=${selectedBranch?.id}`;
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedBranch(null); }}
        onConfirm={handleDelete}
        title="Hapus Cabang"
        message={`Apakah Anda yakin ingin menghapus cabang "${selectedBranch?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={actionLoading}
      />

      {/* Toggle Active Confirm */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        onClose={() => { setShowToggleConfirm(false); setSelectedBranch(null); }}
        onConfirm={handleToggleActive}
        title={selectedBranch?.isActive ? 'Nonaktifkan Cabang' : 'Aktifkan Cabang'}
        message={selectedBranch?.isActive 
          ? `Apakah Anda yakin ingin menonaktifkan cabang "${selectedBranch?.name}"? Cabang tidak akan dapat melakukan transaksi.`
          : `Apakah Anda yakin ingin mengaktifkan kembali cabang "${selectedBranch?.name}"?`
        }
        confirmText={selectedBranch?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        variant={selectedBranch?.isActive ? 'warning' : 'info'}
        loading={actionLoading}
      />
    </HQLayout>
  );
}
