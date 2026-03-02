import React, { useState, useEffect, useCallback, useRef } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import DataTable, { Column } from '../../../components/hq/ui/DataTable';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui';
import { toast } from 'react-hot-toast';
import {
  Building2, Plus, MapPin, Phone, Mail, User, Edit, Trash2, Eye, Settings,
  TrendingUp, Package, Users, Clock, CheckCircle, XCircle, AlertTriangle,
  ExternalLink, Copy, Power, Download, Upload, RefreshCw, Search, Filter,
  BarChart3, Heart, Activity, Shield, Globe, Wifi, WifiOff, FileSpreadsheet,
  ArrowUpRight, ArrowDownRight, Gauge
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

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
  region?: string;
  manager: { id: string; name: string; email: string } | null;
  isActive: boolean;
  priceTierId: string | null;
  priceTierName: string | null;
  createdAt: string;
  lastSync: string;
  syncStatus?: string;
  status: 'online' | 'offline' | 'warning';
  stats: { todaySales: number; monthSales: number; employeeCount: number; lowStockItems: number };
  setupStatus?: 'pending' | 'in_progress' | 'completed' | 'skipped' | null;
  setupProgress?: number;
  healthScore?: number;
  healthGrade?: string;
}

interface DashboardData {
  total: number; active: number; inactive: number;
  byType: Record<string, number>;
  byCity: [string, number][];
  byProvince: [string, number][];
  avgHealthScore: number; criticalBranches: number;
  syncStatus: { synced: number; pending: number; failed: number; never: number };
}

const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'Umum / Multi-Industri' },
  { value: 'fnb', label: 'Food & Beverage' },
  { value: 'retail', label: 'Retail' },
  { value: 'logistics', label: 'Logistik & Distribusi' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'manufacturing', label: 'Manufaktur' },
  { value: 'it', label: 'IT & Technology' },
  { value: 'finance', label: 'Bank & Finance' },
  { value: 'workshop', label: 'Bengkel & Service' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'pharmacy', label: 'Farmasi & Kesehatan' },
  { value: 'rental', label: 'Rental & Penyewaan' },
  { value: 'property', label: 'Property & Real Estate' },
];

const PIE_COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const mockBranches: Branch[] = [
  { id: '1', code: 'HQ-001', name: 'Cabang Pusat Jakarta', type: 'main', address: 'Jl. Sudirman No. 123', city: 'Jakarta Selatan', province: 'DKI Jakarta', phone: '021-1234567', email: 'pusat@bedagang.com', manager: { id: '1', name: 'Ahmad Wijaya', email: 'ahmad@bedagang.com' }, isActive: true, priceTierId: null, priceTierName: 'Harga Standar', createdAt: '2024-01-01', lastSync: new Date().toISOString(), syncStatus: 'synced', status: 'online', stats: { todaySales: 45000000, monthSales: 1250000000, employeeCount: 25, lowStockItems: 5 }, healthScore: 95, healthGrade: 'A' },
  { id: '2', code: 'BR-002', name: 'Cabang Bandung', type: 'branch', address: 'Jl. Asia Afrika No. 45', city: 'Bandung', province: 'Jawa Barat', phone: '022-7654321', email: 'bandung@bedagang.com', manager: { id: '2', name: 'Siti Rahayu', email: 'siti@bedagang.com' }, isActive: true, priceTierId: '1', priceTierName: 'Harga Mall', createdAt: '2024-03-15', lastSync: new Date(Date.now() - 300000).toISOString(), syncStatus: 'synced', status: 'online', stats: { todaySales: 32000000, monthSales: 920000000, employeeCount: 18, lowStockItems: 12 }, healthScore: 82, healthGrade: 'B' },
  { id: '3', code: 'BR-003', name: 'Cabang Surabaya', type: 'branch', address: 'Jl. Tunjungan No. 78', city: 'Surabaya', province: 'Jawa Timur', phone: '031-8765432', email: 'surabaya@bedagang.com', manager: { id: '3', name: 'Budi Santoso', email: 'budi@bedagang.com' }, isActive: true, priceTierId: null, priceTierName: 'Harga Standar', createdAt: '2024-05-20', lastSync: new Date(Date.now() - 3600000).toISOString(), syncStatus: 'pending', status: 'warning', stats: { todaySales: 28500000, monthSales: 850000000, employeeCount: 15, lowStockItems: 8 }, healthScore: 68, healthGrade: 'C' },
  { id: '4', code: 'WH-001', name: 'Gudang Pusat Cikarang', type: 'warehouse', address: 'Kawasan Industri Jababeka Blok A5', city: 'Cikarang', province: 'Jawa Barat', phone: '021-89123456', email: 'gudang@bedagang.com', manager: { id: '4', name: 'Rudi Hermawan', email: 'rudi@bedagang.com' }, isActive: true, priceTierId: null, priceTierName: null, createdAt: '2024-01-01', lastSync: new Date().toISOString(), syncStatus: 'synced', status: 'online', stats: { todaySales: 0, monthSales: 0, employeeCount: 12, lowStockItems: 3 }, healthScore: 88, healthGrade: 'B' },
  { id: '5', code: 'KS-001', name: 'Kiosk Mall Taman Anggrek', type: 'kiosk', address: 'Mall Taman Anggrek Lt. 3', city: 'Jakarta Barat', province: 'DKI Jakarta', phone: '021-56781234', email: 'kiosk.ta@bedagang.com', manager: { id: '5', name: 'Dewi Kusuma', email: 'dewi@bedagang.com' }, isActive: true, priceTierId: '2', priceTierName: 'Harga Mall Premium', createdAt: '2024-08-01', lastSync: new Date(Date.now() - 7200000).toISOString(), syncStatus: 'failed', status: 'offline', stats: { todaySales: 8500000, monthSales: 280000000, employeeCount: 5, lowStockItems: 2 }, healthScore: 45, healthGrade: 'D' },
];

const mockDashboard: DashboardData = {
  total: 5, active: 4, inactive: 1,
  byType: { main: 1, branch: 2, warehouse: 1, kiosk: 1 },
  byCity: [['Jakarta Selatan', 1], ['Bandung', 1], ['Surabaya', 1], ['Cikarang', 1], ['Jakarta Barat', 1]],
  byProvince: [['DKI Jakarta', 2], ['Jawa Barat', 2], ['Jawa Timur', 1]],
  avgHealthScore: 76, criticalBranches: 1,
  syncStatus: { synced: 3, pending: 1, failed: 1, never: 0 }
};

export default function BranchManagement() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dashboard, setDashboard] = useState<DashboardData>(mockDashboard);
  const [industry, setIndustry] = useState('general');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'health'>('table');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    code: '', name: '', type: 'branch' as Branch['type'],
    address: '', city: '', province: '', region: '',
    phone: '', email: '', managerId: '', priceTierId: ''
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const response = await fetch(`/api/hq/branches?${params}`);
      if (response.ok) {
        const data = await response.json();
        const branchList = data.data?.branches || data.branches || mockBranches;
        setBranches(branchList);
        setTotal(data.data?.pagination?.total || data.total || branchList.length);
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

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/hq/branches/enhanced?action=dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setDashboard(json.data);
      }
    } catch { /* use mock */ }
  };

  useEffect(() => {
    setMounted(true);
    fetchBranches();
    fetchDashboard();
  }, [page, pageSize, typeFilter, statusFilter]);

  if (!mounted) return null;

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
      code: '', name: '', type: 'branch',
      address: '', city: '', province: '', region: '',
      phone: '', email: '', managerId: '', priceTierId: ''
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/hq/branches/enhanced?action=export');
      if (res.ok) {
        const json = await res.json();
        const rows = json.data?.rows || [];
        if (rows.length === 0) { toast.error('Tidak ada data untuk di-export'); return; }
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map((r: any) => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `branches-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success(`${rows.length} cabang berhasil di-export`);
      }
    } catch { toast.error('Gagal export data'); } finally { setExporting(false); }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast.error('File kosong atau format salah'); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setImportData(rows);
      setShowImportModal(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportExecute = async () => {
    if (importData.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch('/api/hq/branches/enhanced?action=import-execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importData })
      });
      if (res.ok) {
        const json = await res.json();
        const d = json.data;
        toast.success(`Import selesai: ${d?.created || 0} baru, ${d?.updated || 0} diperbarui, ${d?.errors || 0} error`);
        setImportPreview(d);
        setShowImportModal(false);
        fetchBranches();
        fetchDashboard();
      }
    } catch { toast.error('Gagal import data'); } finally { setImporting(false); }
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
      region: branch.region || '',
      phone: branch.phone,
      email: branch.email,
      managerId: branch.manager?.id || '',
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
            <div className="text-sm font-medium text-gray-900">{branch.manager?.name || '-'}</div>
            <div className="text-xs text-gray-500">{branch.manager?.email || ''}</div>
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

  const getHealthColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getHealthBg = (score: number) => score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';

  const typeChartData = Object.entries(dashboard.byType).map(([k, v]) => ({ name: getTypeLabel(k), value: v }));
  const syncChartData = [
    { name: 'Synced', value: dashboard.syncStatus.synced },
    { name: 'Pending', value: dashboard.syncStatus.pending },
    { name: 'Failed', value: dashboard.syncStatus.failed },
    { name: 'Never', value: dashboard.syncStatus.never },
  ].filter(d => d.value > 0);

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Cabang</h1>
            <p className="text-gray-500">Kelola cabang multi-industri — {INDUSTRY_OPTIONS.find(i => i.value === industry)?.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} /> Export CSV
            </button>
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="w-4 h-4" /> Tambah Cabang
            </button>
          </div>
        </div>

        {/* Enhanced Stats Row */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Total</span></div>
            <p className="text-2xl font-bold">{dashboard.total}</p>
            <p className="text-xs opacity-70">{dashboard.active} aktif • {dashboard.inactive} nonaktif</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Wifi className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Online</span></div>
            <p className="text-2xl font-bold">{branches.filter(b => b.status === 'online').length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Warning</span></div>
            <p className="text-2xl font-bold">{branches.filter(b => b.status === 'warning').length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><WifiOff className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Offline</span></div>
            <p className="text-2xl font-bold">{branches.filter(b => b.status === 'offline').length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Heart className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Health Score</span></div>
            <p className="text-2xl font-bold">{dashboard.avgHealthScore}/100</p>
            <p className="text-xs opacity-70">{dashboard.criticalBranches} kritis</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Activity className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Sync Status</span></div>
            <p className="text-2xl font-bold">{dashboard.syncStatus.synced}/{dashboard.total}</p>
            <p className="text-xs opacity-70">{dashboard.syncStatus.failed} gagal</p>
          </div>
        </div>

        {/* Mini Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Distribusi Tipe Cabang</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={typeChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {typeChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Distribusi Kota (Top {dashboard.byCity.length})</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.byCity.map(([city, count]) => ({ city, count }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip /><Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filter Bar & View Mode */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {[{ v: 'all', l: 'Semua' }, { v: 'main', l: 'Pusat' }, { v: 'branch', l: 'Cabang' }, { v: 'warehouse', l: 'Gudang' }, { v: 'kiosk', l: 'Kiosk' }].map(f => (
                  <button key={f.v} onClick={() => setTypeFilter(f.v)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === f.v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{f.l}</button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {[{ v: 'all', l: 'Status: Semua' }, { v: 'active', l: 'Aktif' }, { v: 'inactive', l: 'Nonaktif' }].map(f => (
                  <button key={f.v} onClick={() => setStatusFilter(f.v)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === f.v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{f.l}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {[{ v: 'table' as const, icon: BarChart3 }, { v: 'grid' as const, icon: Building2 }, { v: 'health' as const, icon: Heart }].map(m => (
                  <button key={m.v} onClick={() => setViewMode(m.v)} className={`p-2 rounded-md transition-colors ${viewMode === m.v ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title={m.v}>
                    <m.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <button onClick={() => { fetchBranches(); fetchDashboard(); }} disabled={loading} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content based on viewMode */}
        {viewMode === 'table' && (
          <DataTable
            columns={columns}
            data={branches}
            loading={loading}
            searchPlaceholder="Cari cabang..."
            pagination={{ page, pageSize, total, onPageChange: setPage, onPageSizeChange: setPageSize }}
            actions={{ onRefresh: fetchBranches }}
            onRowClick={(branch) => { setSelectedBranch(branch); setShowViewModal(true); }}
          />
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : branches.map(branch => (
              <div key={branch.id} onClick={() => { setSelectedBranch(branch); setShowViewModal(true); }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${branch.status === 'online' ? 'bg-green-100' : branch.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                      <Building2 className={`w-5 h-5 ${branch.status === 'online' ? 'text-green-600' : branch.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                      <p className="text-xs text-gray-500">{branch.code}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(branch.type)}`}>{getTypeLabel(branch.type)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-3.5 h-3.5" />{branch.city}, {branch.province}</div>
                  <div className="flex items-center gap-2 text-gray-500"><User className="w-3.5 h-3.5" />{branch.manager?.name || 'Belum ditugaskan'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div><p className="text-xs text-gray-400">Penjualan</p><p className="font-semibold text-sm">{formatCurrency(branch.stats?.todaySales || 0)}</p></div>
                  <div><p className="text-xs text-gray-400">Karyawan</p><p className="font-semibold text-sm">{branch.stats?.employeeCount || 0}</p></div>
                </div>
                {branch.healthScore !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Health Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${branch.healthScore >= 80 ? 'bg-green-500' : branch.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${branch.healthScore}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${getHealthColor(branch.healthScore)}`}>{branch.healthGrade}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'health' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Health Score Dashboard</h3></div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : [...branches].sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0)).map(branch => (
                <div key={branch.id} className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => { setSelectedBranch(branch); setShowViewModal(true); }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getHealthBg(branch.healthScore || 0)}`}>
                      <span className={`text-lg font-bold ${getHealthColor(branch.healthScore || 0)}`}>{branch.healthGrade || '?'}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{branch.name}</h4>
                      <p className="text-sm text-gray-500">{branch.code} • {branch.city} • {getTypeLabel(branch.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Sync</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${branch.syncStatus === 'synced' ? 'bg-green-100 text-green-700' : branch.syncStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{branch.syncStatus || 'never'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Status</p>
                      <StatusBadge status={branch.status} />
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Score</span>
                        <span className={`text-sm font-bold ${getHealthColor(branch.healthScore || 0)}`}>{branch.healthScore || 0}/100</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${(branch.healthScore || 0) >= 80 ? 'bg-green-500' : (branch.healthScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${branch.healthScore || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input type="text" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Jawa Barat" />
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

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportData([]); }}
        title="Import Data Cabang"
        subtitle={`${importData.length} baris ditemukan`}
        size="xl"
        footer={
          <div className="flex justify-between">
            <button onClick={() => { setShowImportModal(false); setImportData([]); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button onClick={handleImportExecute} disabled={importing || importData.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Upload className="w-4 h-4" />{importing ? 'Mengimport...' : `Import ${importData.length} Cabang`}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium">Format CSV yang didukung:</p>
            <p className="mt-1">Kolom: code, name, type, address, city, province, phone, email, region</p>
            <p className="mt-1">Cabang dengan kode yang sudah ada akan diperbarui, yang baru akan dibuat.</p>
          </div>
          {importData.length > 0 && (
            <div className="overflow-x-auto max-h-80 border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                    {Object.keys(importData[0]).slice(0, 7).map(key => (
                      <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      {Object.values(row).slice(0, 7).map((val: any, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{String(val || '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {importData.length > 50 && <p className="p-3 text-center text-sm text-gray-400">...dan {importData.length - 50} baris lainnya</p>}
            </div>
          )}
        </div>
      </Modal>
    </HQLayout>
  );
}
