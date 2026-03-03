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
  ArrowUpRight, ArrowDownRight, Gauge, Award, Zap, Bell, ChevronRight,
  Target, Calendar, Store, DollarSign, Layers
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Legend
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

const emptyDashboard: DashboardData = {
  total: 0, active: 0, inactive: 0,
  byType: {},
  byCity: [],
  byProvince: [],
  avgHealthScore: 0, criticalBranches: 0,
  syncStatus: { synced: 0, pending: 0, failed: 0, never: 0 }
};

export default function BranchManagement() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
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
        const branchList = data.data?.branches || data.branches || [];
        setBranches(branchList);
        setTotal(data.data?.pagination?.total || data.total || branchList.length);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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
        {/* Header with Nav & Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-600" />
                Manajemen Cabang
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{INDUSTRY_OPTIONS.find(i => i.value === industry)?.label} — {dashboard.total} cabang terdaftar</p>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4 bg-gray-100 rounded-lg p-1">
              <button onClick={() => window.location.href='/hq/branches'} className="px-3 py-1.5 bg-white shadow rounded-md text-sm font-medium text-blue-600">Daftar</button>
              <button onClick={() => window.location.href='/hq/branches/performance'} className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">Performa</button>
              <button onClick={() => window.location.href='/hq/branches/settings'} className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">Pengaturan</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600">
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600">
              <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} /> Export
            </button>
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
              <Plus className="w-4 h-4" /> Tambah Cabang
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{dashboard.active} aktif</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboard.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Cabang</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg"><Wifi className="w-5 h-5 text-green-600" /></div>
              {branches.length > 0 && <span className="text-xs font-medium text-green-600">{Math.round(branches.filter(b => b.status === 'online').length / branches.length * 100)}%</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900">{branches.filter(b => b.status === 'online').length}</p>
            <p className="text-xs text-gray-500 mt-1">Online</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{branches.filter(b => b.status === 'warning').length + branches.filter(b => b.status === 'offline').length}</p>
            <p className="text-xs text-gray-500 mt-1">Perlu Perhatian</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Heart className="w-5 h-5 text-purple-600" /></div>
              {dashboard.criticalBranches > 0 && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{dashboard.criticalBranches} kritis</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboard.avgHealthScore}<span className="text-sm font-normal text-gray-400">/100</span></p>
            <p className="text-xs text-gray-500 mt-1">Rata-rata Health</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-teal-100 rounded-lg"><Activity className="w-5 h-5 text-teal-600" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboard.syncStatus.synced}<span className="text-sm font-normal text-gray-400">/{dashboard.total}</span></p>
            <p className="text-xs text-gray-500 mt-1">Tersinkronisasi</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(branches.reduce((s, b) => s + (b.stats?.todaySales || 0), 0))}</p>
            <p className="text-xs text-gray-500 mt-1">Total Penjualan Hari Ini</p>
          </div>
        </div>

        {/* Alerts: Branches Needing Attention */}
        {(() => {
          const needsAttention = branches.filter(b => b.status === 'offline' || b.status === 'warning' || (b.healthScore !== undefined && b.healthScore < 60));
          if (needsAttention.length === 0) return null;
          return (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-900">Perlu Perhatian ({needsAttention.length} cabang)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {needsAttention.slice(0, 6).map(b => (
                  <div key={b.id} onClick={() => window.location.href = `/hq/branches/${b.id}`} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100 cursor-pointer hover:shadow-sm transition-shadow">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${b.status === 'offline' ? 'bg-red-100' : b.status === 'warning' ? 'bg-yellow-100' : 'bg-orange-100'}`}>
                      {b.status === 'offline' ? <WifiOff className="w-5 h-5 text-red-500" /> : b.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : <Heart className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.code} • {b.city}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={b.status} />
                      {b.healthScore !== undefined && b.healthScore < 60 && (
                        <p className="text-xs text-red-600 font-bold mt-0.5">Health: {b.healthScore}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Distribusi Tipe</h3>
              <Layers className="w-4 h-4 text-gray-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={typeChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {typeChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Distribusi Kota</h3>
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.byCity.map(([city, count]) => ({ city, count }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip /><Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Status Sync</h3>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={syncChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {syncChartData.map((_, i) => <Cell key={i} fill={['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'][i]} />)}
                </Pie><Tooltip /></PieChart>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-3 flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : branches.map(branch => (
              <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                {/* Card Header with Status Strip */}
                <div className={`h-1.5 ${branch.status === 'online' ? 'bg-green-500' : branch.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${branch.status === 'online' ? 'bg-green-50 ring-2 ring-green-200' : branch.status === 'warning' ? 'bg-yellow-50 ring-2 ring-yellow-200' : 'bg-red-50 ring-2 ring-red-200'}`}>
                        <Building2 className={`w-5 h-5 ${branch.status === 'online' ? 'text-green-600' : branch.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{branch.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 font-mono">{branch.code}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getTypeColor(branch.type)}`}>{getTypeLabel(branch.type)}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={branch.status} />
                  </div>
                  <div className="space-y-1.5 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{branch.city}, {branch.province}</span></div>
                    <div className="flex items-center gap-2 text-gray-500"><User className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{branch.manager?.name || 'Belum ditugaskan'}</span></div>
                  </div>
                  {/* KPI Grid */}
                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Penjualan</p>
                      <p className="font-bold text-sm text-gray-900 mt-0.5">{formatCurrency(branch.stats?.todaySales || 0)}</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Karyawan</p>
                      <p className="font-bold text-sm text-gray-900 mt-0.5">{branch.stats?.employeeCount || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Stok Alert</p>
                      <p className={`font-bold text-sm mt-0.5 ${(branch.stats?.lowStockItems || 0) > 5 ? 'text-red-600' : 'text-gray-900'}`}>{branch.stats?.lowStockItems || 0}</p>
                    </div>
                  </div>
                  {/* Health Bar */}
                  {branch.healthScore !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 font-medium">Health Score</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getHealthBg(branch.healthScore)} ${getHealthColor(branch.healthScore)}`}>{branch.healthGrade} ({branch.healthScore})</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${branch.healthScore >= 80 ? 'bg-green-500' : branch.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${branch.healthScore}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                {/* Card Footer */}
                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button onClick={() => { setSelectedBranch(branch); setShowViewModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Detail</button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => window.location.href = `/hq/branches/${branch.id}`} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Monitor"><TrendingUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openEditModal(branch)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setSelectedBranch(branch); setShowToggleConfirm(true); }} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Toggle"><Power className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'health' && (
          <div className="space-y-4">
            {/* Health Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Sehat (80+)</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{branches.filter(b => (b.healthScore || 0) >= 80).length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Perlu Monitor (60-79)</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{branches.filter(b => (b.healthScore || 0) >= 60 && (b.healthScore || 0) < 80).length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Kritis (&lt;60)</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{branches.filter(b => (b.healthScore || 0) < 60).length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg"><Gauge className="w-5 h-5 text-blue-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Rata-rata Score</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{branches.length > 0 ? Math.round(branches.reduce((s, b) => s + (b.healthScore || 0), 0) / branches.length) : 0}</p>
              </div>
            </div>
            {/* Health Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500" /> Health Score Dashboard</h3>
                <span className="text-xs text-gray-400">Diurutkan dari terendah</span>
              </div>
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
                      <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                      <p className="text-sm text-gray-500">{branch.code} • {branch.city} • {getTypeLabel(branch.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Penjualan</p>
                      <p className="text-sm font-semibold">{formatCurrency(branch.stats?.todaySales || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Sync</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${branch.syncStatus === 'synced' ? 'bg-green-100 text-green-700' : branch.syncStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{branch.syncStatus || 'never'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Status</p>
                      <StatusBadge status={branch.status} />
                    </div>
                    <div className="w-36">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Score</span>
                        <span className={`text-sm font-bold ${getHealthColor(branch.healthScore || 0)}`}>{branch.healthScore || 0}/100</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${(branch.healthScore || 0) >= 80 ? 'bg-green-500' : (branch.healthScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${branch.healthScore || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
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
            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Tutup</button>
            <div className="flex gap-2">
              <button onClick={() => window.open(`/hq/branches/${selectedBranch?.id}`, '_blank')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <ExternalLink className="w-4 h-4" /> Monitor Realtime
              </button>
              <button onClick={() => { setShowViewModal(false); openEditModal(selectedBranch!); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Edit className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>
        }
      >
        {selectedBranch && (
          <div className="space-y-5">
            {/* Branch Header Banner */}
            <div className={`rounded-xl p-5 ${selectedBranch.status === 'online' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : selectedBranch.status === 'warning' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedBranch.status === 'online' ? 'bg-green-100' : selectedBranch.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    <Building2 className={`w-7 h-7 ${selectedBranch.status === 'online' ? 'text-green-600' : selectedBranch.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedBranch.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-gray-500 font-mono">{selectedBranch.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(selectedBranch.type)}`}>{getTypeLabel(selectedBranch.type)}</span>
                      <StatusBadge status={selectedBranch.status} />
                    </div>
                  </div>
                </div>
                {selectedBranch.healthScore !== undefined && (
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getHealthBg(selectedBranch.healthScore)} ring-4 ${selectedBranch.healthScore >= 80 ? 'ring-green-200' : selectedBranch.healthScore >= 60 ? 'ring-yellow-200' : 'ring-red-200'}`}>
                      <div>
                        <p className={`text-xl font-bold ${getHealthColor(selectedBranch.healthScore)}`}>{selectedBranch.healthGrade}</p>
                        <p className="text-[10px] text-gray-500">{selectedBranch.healthScore}/100</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <DollarSign className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-900">{formatCurrency(selectedBranch.stats?.todaySales || 0)}</p>
                <p className="text-[11px] text-blue-600 font-medium">Penjualan Hari Ini</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-900">{formatCurrency(selectedBranch.stats?.monthSales || 0)}</p>
                <p className="text-[11px] text-green-600 font-medium">Penjualan Bulan Ini</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-900">{selectedBranch.stats?.employeeCount || 0}</p>
                <p className="text-[11px] text-purple-600 font-medium">Jumlah Karyawan</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${(selectedBranch.stats?.lowStockItems || 0) > 5 ? 'bg-red-50' : 'bg-orange-50'}`}>
                <Package className={`w-5 h-5 mx-auto mb-1 ${(selectedBranch.stats?.lowStockItems || 0) > 5 ? 'text-red-500' : 'text-orange-500'}`} />
                <p className={`text-lg font-bold ${(selectedBranch.stats?.lowStockItems || 0) > 5 ? 'text-red-900' : 'text-orange-900'}`}>{selectedBranch.stats?.lowStockItems || 0}</p>
                <p className={`text-[11px] font-medium ${(selectedBranch.stats?.lowStockItems || 0) > 5 ? 'text-red-600' : 'text-orange-600'}`}>Stok Rendah</p>
              </div>
            </div>

            {/* Info Columns */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> Informasi Lokasi</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3"><span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">Alamat</span><p className="text-sm font-medium text-gray-700">{selectedBranch.address}</p></div>
                  <div className="flex items-start gap-3"><span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">Kota</span><p className="text-sm font-medium text-gray-700">{selectedBranch.city}, {selectedBranch.province}</p></div>
                  <div className="flex items-start gap-3"><span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">Telepon</span><p className="text-sm font-medium text-gray-700">{selectedBranch.phone}</p></div>
                  <div className="flex items-start gap-3"><span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">Email</span><p className="text-sm font-medium text-gray-700">{selectedBranch.email}</p></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-500" /> Konfigurasi</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Manager</span><span className="text-sm font-medium text-gray-700">{selectedBranch.manager?.name || '-'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Price Tier</span><span className="text-sm font-medium text-gray-700">{selectedBranch.priceTierName || 'Standar'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Sync Terakhir</span><span className="text-sm font-medium text-gray-700">{new Date(selectedBranch.lastSync).toLocaleString('id-ID')}</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-gray-400">Sync Status</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedBranch.syncStatus === 'synced' ? 'bg-green-100 text-green-700' : selectedBranch.syncStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedBranch.syncStatus || 'never'}</span></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Aksi Cepat</h4>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => { setShowViewModal(false); window.location.href = `/hq/branches/${selectedBranch?.id}`; }} className="flex flex-col items-center gap-1.5 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Monitor</span>
                </button>
                <button onClick={() => { setShowViewModal(false); window.location.href = `/hq/reports/sales?branch=${selectedBranch?.id}`; }} className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Laporan</span>
                </button>
                <button onClick={() => { setShowViewModal(false); window.location.href = `/hq/reports/inventory?branch=${selectedBranch?.id}`; }} className="flex flex-col items-center gap-1.5 p-3 bg-green-50 hover:bg-green-100 rounded-xl text-center transition-colors">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Stok</span>
                </button>
                <button onClick={() => { setShowViewModal(false); window.location.href = `/hq/users?branch=${selectedBranch?.id}`; }} className="flex flex-col items-center gap-1.5 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-center transition-colors">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">Karyawan</span>
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
