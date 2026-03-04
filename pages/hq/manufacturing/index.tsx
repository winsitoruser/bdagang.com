import React, { useState, useEffect, useCallback } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Modal from '../../../components/hq/ui/Modal';
import { toast } from 'react-hot-toast';
import {
  Factory, Plus, RefreshCw, Search, Eye, Edit, Trash2, Download, Filter,
  Settings, CheckCircle, XCircle, Clock, AlertTriangle, Package, Truck,
  BarChart3, TrendingUp, TrendingDown, ArrowUpRight, Wrench, Zap,
  Play, Pause, Square, ChevronRight, Layers, Target, Activity, Shield,
  FileText, Loader2, Save, Calendar, Building2, Users, DollarSign,
  PieChart as PieChartIcon, Gauge, ClipboardList, AlertCircle, Archive
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TabType = 'dashboard' | 'work-orders' | 'bom' | 'routings' | 'work-centers' | 'machines' | 'quality' | 'planning' | 'waste' | 'oee' | 'costs' | 'maintenance' | 'plm' | 'cogm' | 'subcontracting' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  planned: 'bg-blue-100 text-blue-700',
  released: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  on_hold: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-700',
  operational: 'bg-green-100 text-green-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  breakdown: 'bg-red-100 text-red-700',
  idle: 'bg-gray-100 text-gray-700',
  decommissioned: 'bg-gray-200 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-700',
  passed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  conditional: 'bg-orange-100 text-orange-700',
  scheduled: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
  critical: 'bg-red-200 text-red-800',
};

const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const formatNumber = (n: number) => new Intl.NumberFormat('id-ID').format(n);
const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function ManufacturingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);

  // Dashboard data
  const [dashboard, setDashboard] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Lists
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [routings, setRoutings] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [qcInspections, setQcInspections] = useState<any[]>([]);
  const [qcTemplates, setQcTemplates] = useState<any[]>([]);
  const [productionPlans, setProductionPlans] = useState<any[]>([]);
  const [wasteRecords, setWasteRecords] = useState<any[]>([]);
  const [oeeData, setOeeData] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [settings, setSettings] = useState<any[]>([]);

  // Advanced data
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [plmProducts, setPlmProducts] = useState<any[]>([]);
  const [designChanges, setDesignChanges] = useState<any[]>([]);
  const [cogmData, setCogmData] = useState<any>(null);
  const [subcontracts, setSubcontracts] = useState<any[]>([]);
  const [controlPoints, setControlPoints] = useState<any[]>([]);
  const [coaList, setCoaList] = useState<any[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [woPage, setWoPage] = useState(1);
  const [woTotal, setWoTotal] = useState(0);

  // Products for dropdowns
  const [products, setProducts] = useState<any[]>([]);

  const api = useCallback(async (action: string, method = 'GET', body?: any, apiType: 'base' | 'enhanced' | 'advanced' | 'integration' = 'base') => {
    const baseMap = { base: '/api/hq/manufacturing', enhanced: '/api/hq/manufacturing/enhanced', advanced: '/api/hq/manufacturing/advanced', integration: '/api/hq/manufacturing/integration' };
    const base = baseMap[apiType];
    const url = `${base}?action=${action}`;
    const opts: any = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`API ${action} returned non-JSON response (${res.status})`);
    }
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'API Error');
    return json.data;
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, anl] = await Promise.all([
        api('dashboard'),
        api('analytics', 'GET', null, 'enhanced')
      ]);
      setDashboard(dash);
      setAnalytics(anl);
    } catch (e: any) { console.error('Dashboard fetch error:', e); }
    setLoading(false);
  }, [api]);

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = `work-orders&page=${woPage}&limit=20${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`;
      const res = await fetch(`/api/hq/manufacturing?action=${params}`);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) { console.warn('WO API returned non-JSON:', res.status); setLoading(false); return; }
      const json = await res.json();
      setWorkOrders(json.data || []);
      setWoTotal(json.meta?.total || 0);
    } catch (e: any) { console.error(e); }
    setLoading(false);
  }, [woPage, statusFilter, searchTerm]);

  const fetchTabData = useCallback(async (tab: TabType) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'dashboard': await fetchDashboard(); break;
        case 'work-orders': await fetchWorkOrders(); break;
        case 'bom': setBoms(await api('bom')); break;
        case 'routings': setRoutings(await api('routings')); break;
        case 'work-centers': setWorkCenters(await api('work-centers')); break;
        case 'machines': setMachines(await api('machines')); break;
        case 'quality': {
          const [insp, tmpl] = await Promise.all([api('qc-inspections'), api('qc-templates')]);
          setQcInspections(insp); setQcTemplates(tmpl);
          break;
        }
        case 'planning': setProductionPlans(await api('production-plans')); break;
        case 'waste': setWasteRecords(await api('waste')); break;
        case 'oee': setOeeData(await api('oee-dashboard', 'GET', null, 'enhanced')); break;
        case 'costs': setCostData(await api('cost-analysis', 'GET', null, 'enhanced')); break;
        case 'maintenance': setMaintenanceData(await api('maintenance-dashboard', 'GET', null, 'advanced')); break;
        case 'plm': {
          const [prods, changes] = await Promise.all([api('plm-products', 'GET', null, 'advanced'), api('plm-design-changes', 'GET', null, 'advanced')]);
          setPlmProducts(prods); setDesignChanges(changes);
          break;
        }
        case 'cogm': setCogmData(await api('cogm-dashboard', 'GET', null, 'advanced')); break;
        case 'subcontracting': setSubcontracts(await api('subcontracts', 'GET', null, 'advanced')); break;
        case 'settings': setSettings(await api('settings')); break;
      }
    } catch (e: any) { console.error(`Fetch ${tab} error:`, e); }
    setLoading(false);
  }, [api, fetchDashboard, fetchWorkOrders]);

  useEffect(() => { setMounted(true); fetchDashboard(); fetchProducts(); }, []);
  useEffect(() => { if (mounted) fetchTabData(activeTab); }, [activeTab]);
  useEffect(() => { if (mounted && activeTab === 'work-orders') fetchWorkOrders(); }, [woPage, statusFilter]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/hq/products?limit=200');
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) { console.warn('Products API returned non-JSON'); return; }
      const json = await res.json();
      setProducts(json.data?.products || json.data || []);
    } catch (e) { console.error(e); }
  };

  // Work Order Actions
  const handleWOAction = async (action: string, id: string, extra?: any) => {
    try {
      await api(action, 'POST', { id, ...extra });
      toast.success(`Work Order ${action.replace('wo-', '')} berhasil`);
      fetchWorkOrders();
    } catch (e: any) { toast.error(e.message); }
  };

  // Create Work Order
  const [woForm, setWoForm] = useState({ product_id: '', bom_id: '', planned_quantity: '', priority: 'normal', planned_start: '', planned_end: '', work_center_id: '', notes: '' });

  const handleCreateWO = async () => {
    if (!woForm.product_id || !woForm.planned_quantity) { toast.error('Produk dan jumlah harus diisi'); return; }
    setSaving(true);
    try {
      await api('work-order', 'POST', { ...woForm, planned_quantity: parseFloat(woForm.planned_quantity) });
      toast.success('Work Order berhasil dibuat');
      setShowCreateModal(false);
      fetchWorkOrders();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  // Export CSV
  const handleExport = () => {
    const data = activeTab === 'work-orders' ? workOrders : activeTab === 'bom' ? boms : activeTab === 'machines' ? machines : [];
    if (data.length === 0) { toast.error('Tidak ada data untuk di-export'); return; }
    const headers = Object.keys(data[0]).filter(k => !k.includes('id') || k === 'id').join(',');
    const rows = data.map(r => Object.values(r).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `manufacturing-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export berhasil');
  };

  if (!mounted) return null;

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'work-orders', label: 'Work Orders', icon: ClipboardList },
    { key: 'bom', label: 'Bill of Materials', icon: Layers },
    { key: 'routings', label: 'Routing', icon: Activity },
    { key: 'work-centers', label: 'Work Centers', icon: Building2 },
    { key: 'machines', label: 'Mesin', icon: Settings },
    { key: 'quality', label: 'Quality Control', icon: Shield },
    { key: 'planning', label: 'Production Plan', icon: Calendar },
    { key: 'oee', label: 'OEE', icon: Gauge },
    { key: 'costs', label: 'Costing', icon: DollarSign },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench },
    { key: 'plm', label: 'PLM', icon: Layers },
    { key: 'cogm', label: 'COGM', icon: DollarSign },
    { key: 'subcontracting', label: 'Subkontrak', icon: Truck },
    { key: 'waste', label: 'Waste', icon: AlertTriangle },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <HQLayout title="Manufacturing Management" subtitle="Kelola produksi, BOM, quality control, dan analitik manufaktur">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.key ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64" />
            </div>
            {['work-orders', 'bom', 'machines', 'quality'].includes(activeTab) && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">Semua Status</option>
                {activeTab === 'work-orders' && <>
                  <option value="draft">Draft</option><option value="planned">Planned</option><option value="released">Released</option>
                  <option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="on_hold">On Hold</option>
                </>}
                {activeTab === 'bom' && <><option value="draft">Draft</option><option value="active">Active</option><option value="expired">Expired</option></>}
                {activeTab === 'machines' && <><option value="operational">Operational</option><option value="maintenance">Maintenance</option><option value="breakdown">Breakdown</option></>}
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchTabData(activeTab)} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export
            </button>
            {['work-orders', 'bom', 'routings', 'work-centers', 'machines', 'quality', 'planning'].includes(activeTab) && (
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                <Plus className="w-4 h-4" /> Buat Baru
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab dashboard={dashboard} analytics={analytics} />}
            {activeTab === 'work-orders' && <WorkOrdersTab workOrders={workOrders} total={woTotal} page={woPage} setPage={setWoPage} onAction={handleWOAction} onView={(wo: any) => { setSelectedItem(wo); setShowDetailModal(true); }} />}
            {activeTab === 'bom' && <BOMTab boms={boms} />}
            {activeTab === 'routings' && <RoutingsTab routings={routings} />}
            {activeTab === 'work-centers' && <WorkCentersTab workCenters={workCenters} />}
            {activeTab === 'machines' && <MachinesTab machines={machines} />}
            {activeTab === 'quality' && <QualityTab inspections={qcInspections} templates={qcTemplates} />}
            {activeTab === 'planning' && <PlanningTab plans={productionPlans} />}
            {activeTab === 'oee' && <OEETab data={oeeData} />}
            {activeTab === 'costs' && <CostsTab data={costData} />}
            {activeTab === 'maintenance' && <MaintenanceTab data={maintenanceData} api={api} onRefresh={() => fetchTabData('maintenance')} />}
            {activeTab === 'plm' && <PLMTab products={plmProducts} designChanges={designChanges} api={api} onRefresh={() => fetchTabData('plm')} />}
            {activeTab === 'cogm' && <COGMTab data={cogmData} api={api} onRefresh={() => fetchTabData('cogm')} />}
            {activeTab === 'subcontracting' && <SubcontractingTab subcontracts={subcontracts} api={api} onRefresh={() => fetchTabData('subcontracting')} />}
            {activeTab === 'waste' && <WasteTab records={wasteRecords} />}
            {activeTab === 'settings' && <SettingsTab settings={settings} />}
          </>
        )}

        {/* Create Work Order Modal */}
        <Modal isOpen={showCreateModal && activeTab === 'work-orders'} onClose={() => setShowCreateModal(false)} title="Buat Work Order Baru" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk *</label>
                <select value={woForm.product_id} onChange={e => setWoForm({ ...woForm, product_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Pilih Produk</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Produksi *</label>
                <input type="number" value={woForm.planned_quantity} onChange={e => setWoForm({ ...woForm, planned_quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select value={woForm.priority} onChange={e => setWoForm({ ...woForm, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option><option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Center</label>
                <select value={woForm.work_center_id} onChange={e => setWoForm({ ...woForm, work_center_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Pilih Work Center</option>
                  {workCenters.map((wc: any) => <option key={wc.id} value={wc.id}>{wc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned Start</label>
                <input type="datetime-local" value={woForm.planned_start} onChange={e => setWoForm({ ...woForm, planned_start: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned End</label>
                <input type="datetime-local" value={woForm.planned_end} onChange={e => setWoForm({ ...woForm, planned_end: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea value={woForm.notes} onChange={e => setWoForm({ ...woForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm">Batal</button>
              <button onClick={handleCreateWO} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null); }} title={`Detail: ${selectedItem?.wo_number || selectedItem?.bom_code || ''}`} size="xl">
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(selectedItem).filter(([k]) => !k.includes('_id') && k !== 'id' && typeof selectedItem[k] !== 'object').slice(0, 12).map(([k, v]: [string, any]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-500">{k.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm font-medium">{typeof v === 'number' ? (v > 100000 ? formatCurrency(v) : formatNumber(v)) : v || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </HQLayout>
  );
}

// ==========================================
// DASHBOARD TAB
// ==========================================
function DashboardTab({ dashboard, analytics }: { dashboard: any; analytics: any }) {
  if (!dashboard) return <div className="text-center text-gray-500 py-8">Loading dashboard data...</div>;

  const wo = dashboard.workOrders || {};
  const mch = dashboard.machines || {};
  const qc = dashboard.quality || {};

  const stats = [
    { label: 'Total Work Orders (30d)', value: wo.total || 0, icon: ClipboardList, bg: 'bg-purple-50 border-purple-200', iconCls: 'text-purple-600', valCls: 'text-purple-700', sub: `${wo.in_progress || 0} aktif` },
    { label: 'Total Produksi', value: formatNumber(parseFloat(wo.total_produced || 0)), icon: Package, bg: 'bg-blue-50 border-blue-200', iconCls: 'text-blue-600', valCls: 'text-blue-700', sub: `Reject: ${formatNumber(parseFloat(wo.total_rejected || 0))}` },
    { label: 'Mesin Operational', value: `${mch.operational || 0}/${mch.total || 0}`, icon: Settings, bg: 'bg-green-50 border-green-200', iconCls: 'text-green-600', valCls: 'text-green-700', sub: `${mch.in_maintenance || 0} maintenance` },
    { label: 'QC Pass Rate', value: `${qc.total_inspections > 0 ? ((parseFloat(qc.passed || 0) / parseFloat(qc.total_inspections || 1)) * 100).toFixed(1) : 0}%`, icon: Shield, bg: 'bg-emerald-50 border-emerald-200', iconCls: 'text-emerald-600', valCls: 'text-emerald-700', sub: `${qc.failed || 0} gagal` },
    { label: 'Maintenance Alerts', value: dashboard.maintenanceAlerts || 0, icon: AlertTriangle, bg: 'bg-red-50 border-red-200', iconCls: 'text-red-600', valCls: 'text-red-700', sub: 'Perlu tindakan' },
    { label: 'Total Cost (30d)', value: formatCurrency(parseFloat(wo.total_cost || 0)), icon: DollarSign, bg: 'bg-amber-50 border-amber-200', iconCls: 'text-amber-600', valCls: 'text-amber-700', sub: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-5 h-5 ${s.iconCls}`} />
              <span className="text-xs text-gray-600">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.valCls}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-gray-500 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Trend Produksi (30 Hari)</h3>
            {analytics.trend && analytics.trend.length > 0 ? (
              <Chart type="area" height={280} options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: analytics.trend.map((t: any) => t.date?.slice(5) || ''), labels: { style: { fontSize: '10px' } } },
                yaxis: { labels: { formatter: (v: number) => formatNumber(v) } },
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.1 } },
                colors: ['#7C3AED', '#10B981'],
                legend: { position: 'top' }
              }} series={[
                { name: 'Quantity', data: analytics.trend.map((t: any) => parseFloat(t.quantity_produced || 0)) },
                { name: 'Orders', data: analytics.trend.map((t: any) => parseInt(t.orders_completed || 0)) }
              ]} />
            ) : <p className="text-gray-400 text-center py-12">Belum ada data produksi</p>}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Produk Terproduksi</h3>
            <div className="space-y-3">
              {(analytics.topProducts || []).slice(0, 6).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{p.product_name}</p>
                      <p className="text-xs text-gray-500">{p.sku} · {p.wo_count} WO</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNumber(parseFloat(p.total_produced || 0))}</p>
                    <p className="text-xs text-gray-500">Yield: {parseFloat(p.avg_yield || 0).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {(!analytics.topProducts || analytics.topProducts.length === 0) && <p className="text-gray-400 text-center py-8">Belum ada data</p>}
            </div>
          </div>
        </div>
      )}

      {/* Work Center Load */}
      {analytics?.workCenterLoad && analytics.workCenterLoad.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Beban Work Center</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.workCenterLoad.map((wc: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-sm">{wc.name}</p>
                <p className="text-xs text-gray-500">{wc.code}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div><p className="text-lg font-bold text-purple-600">{wc.active_orders}</p><p className="text-xs text-gray-500">Aktif</p></div>
                  <div><p className="text-lg font-bold text-blue-600">{wc.queued_orders}</p><p className="text-xs text-gray-500">Antrian</p></div>
                  <div><p className="text-lg font-bold text-green-600">{formatNumber(parseFloat(wc.total_output || 0))}</p><p className="text-xs text-gray-500">Output</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Work Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Work Order Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left py-2 px-3">WO Number</th><th className="text-left py-2 px-3">Produk</th>
              <th className="text-left py-2 px-3">Status</th><th className="text-right py-2 px-3">Qty</th>
              <th className="text-left py-2 px-3">Work Center</th><th className="text-left py-2 px-3">Dibuat</th>
            </tr></thead>
            <tbody>
              {(dashboard.recentWorkOrders || []).map((wo: any) => (
                <tr key={wo.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{wo.wo_number}</td>
                  <td className="py-2 px-3">{wo.product_name || '-'}</td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[wo.status] || 'bg-gray-100'}`}>{wo.status}</span></td>
                  <td className="py-2 px-3 text-right">{formatNumber(parseFloat(wo.planned_quantity || 0))}</td>
                  <td className="py-2 px-3">{wo.work_center_name || '-'}</td>
                  <td className="py-2 px-3 text-gray-500">{formatDate(wo.created_at)}</td>
                </tr>
              ))}
              {(!dashboard.recentWorkOrders || dashboard.recentWorkOrders.length === 0) && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada work order</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// WORK ORDERS TAB
// ==========================================
function WorkOrdersTab({ workOrders, total, page, setPage, onAction, onView }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left py-3 px-4">WO Number</th><th className="text-left py-3 px-4">Produk</th>
            <th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Prioritas</th>
            <th className="text-right py-3 px-4">Planned</th><th className="text-right py-3 px-4">Actual</th>
            <th className="text-left py-3 px-4">Work Center</th><th className="text-left py-3 px-4">Start</th>
            <th className="text-center py-3 px-4">Aksi</th>
          </tr></thead>
          <tbody>
            {workOrders.map((wo: any) => (
              <tr key={wo.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-purple-600">{wo.wo_number}</td>
                <td className="py-3 px-4"><p className="font-medium">{wo.product_name}</p><p className="text-xs text-gray-500">{wo.product_sku}</p></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[wo.status]}`}>{wo.status}</span></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[wo.priority]}`}>{wo.priority}</span></td>
                <td className="py-3 px-4 text-right">{formatNumber(parseFloat(wo.planned_quantity))}</td>
                <td className="py-3 px-4 text-right">{formatNumber(parseFloat(wo.actual_quantity || 0))}</td>
                <td className="py-3 px-4">{wo.work_center_name || '-'}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(wo.planned_start)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onView(wo)} className="p-1 hover:bg-gray-100 rounded" title="Detail"><Eye className="w-4 h-4" /></button>
                    {(wo.status === 'planned' || wo.status === 'released') && (
                      <button onClick={() => onAction('wo-start', wo.id)} className="p-1 hover:bg-green-100 rounded text-green-600" title="Start"><Play className="w-4 h-4" /></button>
                    )}
                    {wo.status === 'in_progress' && (
                      <>
                        <button onClick={() => onAction('wo-pause', wo.id)} className="p-1 hover:bg-yellow-100 rounded text-yellow-600" title="Pause"><Pause className="w-4 h-4" /></button>
                        <button onClick={() => onAction('wo-auto-issue', null, { work_order_id: wo.id })} className="p-1 hover:bg-purple-100 rounded text-purple-600" title="Auto Issue Material"><Package className="w-4 h-4" /></button>
                        <button onClick={() => onAction('wo-complete', wo.id, { actual_quantity: wo.planned_quantity })} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Complete"><CheckCircle className="w-4 h-4" /></button>
                      </>
                    )}
                    {wo.status === 'on_hold' && (
                      <button onClick={() => onAction('wo-resume', wo.id)} className="p-1 hover:bg-green-100 rounded text-green-600" title="Resume"><Play className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {workOrders.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-gray-400">Belum ada Work Order</td></tr>}
          </tbody>
        </table>
      </div>
      {total > 20 && (
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-gray-500">Total: {total} work orders</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 text-sm">Page {page}</span>
            <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// BOM TAB
// ==========================================
function BOMTab({ boms }: { boms: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left py-3 px-4">BOM Code</th><th className="text-left py-3 px-4">Nama</th>
            <th className="text-left py-3 px-4">Produk</th><th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Tipe</th><th className="text-right py-3 px-4">Items</th>
            <th className="text-right py-3 px-4">Material Cost</th><th className="text-left py-3 px-4">Version</th>
          </tr></thead>
          <tbody>
            {boms.map((b: any) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-purple-600">{b.bom_code}</td>
                <td className="py-3 px-4">{b.bom_name}</td>
                <td className="py-3 px-4">{b.product_name || '-'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                <td className="py-3 px-4 capitalize">{b.bom_type}</td>
                <td className="py-3 px-4 text-right">{b.item_count}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(b.total_material_cost || 0))}</td>
                <td className="py-3 px-4">v{b.version}</td>
              </tr>
            ))}
            {boms.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada BOM</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// ROUTINGS TAB
// ==========================================
function RoutingsTab({ routings }: { routings: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left py-3 px-4">Code</th><th className="text-left py-3 px-4">Nama</th>
            <th className="text-left py-3 px-4">Produk</th><th className="text-left py-3 px-4">Status</th>
            <th className="text-right py-3 px-4">Operations</th><th className="text-right py-3 px-4">Total Time</th>
            <th className="text-right py-3 px-4">Total Cost</th>
          </tr></thead>
          <tbody>
            {routings.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-purple-600">{r.routing_code}</td>
                <td className="py-3 px-4">{r.routing_name}</td>
                <td className="py-3 px-4">{r.product_name || '-'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                <td className="py-3 px-4 text-right">{r.operation_count}</td>
                <td className="py-3 px-4 text-right">{r.total_time_minutes} min</td>
                <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(r.total_cost || 0))}</td>
              </tr>
            ))}
            {routings.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Belum ada Routing</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// WORK CENTERS TAB
// ==========================================
function WorkCentersTab({ workCenters }: { workCenters: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workCenters.map((wc: any) => (
        <div key={wc.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{wc.name}</h3>
              <p className="text-xs text-gray-500">{wc.code} · {wc.type}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[wc.status]}`}>{wc.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">Kapasitas/jam</p><p className="font-medium">{wc.capacity_per_hour}</p></div>
            <div><p className="text-gray-500 text-xs">Biaya/jam</p><p className="font-medium">{formatCurrency(parseFloat(wc.operating_cost_per_hour || 0))}</p></div>
            <div><p className="text-gray-500 text-xs">Mesin</p><p className="font-medium">{wc.machine_count || 0}</p></div>
            <div><p className="text-gray-500 text-xs">WO Aktif</p><p className="font-medium">{wc.active_orders || 0}</p></div>
          </div>
          {wc.location && <p className="text-xs text-gray-500 mt-3">📍 {wc.location}</p>}
        </div>
      ))}
      {workCenters.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">Belum ada Work Center</div>}
    </div>
  );
}

// ==========================================
// MACHINES TAB
// ==========================================
function MachinesTab({ machines }: { machines: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {machines.map((m: any) => (
        <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{m.machine_name}</h3>
              <p className="text-xs text-gray-500">{m.machine_code} · {m.type || 'General'}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[m.status]}`}>{m.status}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-3">
            <div><p className="text-gray-500 text-xs">Manufacturer</p><p className="font-medium">{m.manufacturer || '-'}</p></div>
            <div><p className="text-gray-500 text-xs">Model</p><p className="font-medium">{m.model || '-'}</p></div>
            <div><p className="text-gray-500 text-xs">Work Center</p><p className="font-medium">{m.work_center_name || '-'}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">Operating Hours</p><p className="font-medium">{formatNumber(parseFloat(m.operating_hours || 0))} h</p></div>
            <div><p className="text-gray-500 text-xs">Cost/Hour</p><p className="font-medium">{formatCurrency(parseFloat(m.cost_per_hour || 0))}</p></div>
            <div><p className="text-gray-500 text-xs">Maintenance</p>
              <p className={`font-medium ${(m.pending_maintenance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(m.pending_maintenance || 0) > 0 ? `${m.pending_maintenance} pending` : 'OK'}
              </p>
            </div>
          </div>
        </div>
      ))}
      {machines.length === 0 && <div className="col-span-2 text-center text-gray-400 py-12">Belum ada mesin terdaftar</div>}
    </div>
  );
}

// ==========================================
// QUALITY TAB
// ==========================================
function QualityTab({ inspections, templates }: { inspections: any[]; templates: any[] }) {
  const [qcView, setQcView] = useState<'inspections' | 'templates'>('inspections');
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setQcView('inspections')} className={`px-4 py-2 rounded-lg text-sm font-medium ${qcView === 'inspections' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>Inspeksi ({inspections.length})</button>
        <button onClick={() => setQcView('templates')} className={`px-4 py-2 rounded-lg text-sm font-medium ${qcView === 'templates' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>Template ({templates.length})</button>
      </div>

      {qcView === 'inspections' ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left py-3 px-4">No. Inspeksi</th><th className="text-left py-3 px-4">WO</th>
              <th className="text-left py-3 px-4">Produk</th><th className="text-left py-3 px-4">Tipe</th>
              <th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Hasil</th>
              <th className="text-right py-3 px-4">Defects</th><th className="text-left py-3 px-4">Inspector</th>
            </tr></thead>
            <tbody>
              {inspections.map((qi: any) => (
                <tr key={qi.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{qi.inspection_number}</td>
                  <td className="py-3 px-4">{qi.wo_number || '-'}</td>
                  <td className="py-3 px-4">{qi.product_name || '-'}</td>
                  <td className="py-3 px-4 capitalize">{qi.inspection_type?.replace('_', ' ')}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[qi.status]}`}>{qi.status}</span></td>
                  <td className="py-3 px-4">{qi.overall_result ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[qi.overall_result]}`}>{qi.overall_result}</span> : '-'}</td>
                  <td className="py-3 px-4 text-right">{qi.defects_found || 0}</td>
                  <td className="py-3 px-4">{qi.inspector_name || '-'}</td>
                </tr>
              ))}
              {inspections.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada inspeksi</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t: any) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{t.template_name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status]}`}>{t.status}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{t.template_code} · {t.inspection_type?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600">{t.description || 'No description'}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{(typeof t.parameters === 'string' ? JSON.parse(t.parameters) : t.parameters || []).length} parameter</span>
                <span>{t.usage_count || 0}x dipakai</span>
              </div>
            </div>
          ))}
          {templates.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">Belum ada template QC</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// PLANNING TAB
// ==========================================
function PlanningTab({ plans }: { plans: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b">
          <th className="text-left py-3 px-4">Plan Code</th><th className="text-left py-3 px-4">Nama</th>
          <th className="text-left py-3 px-4">Tipe</th><th className="text-left py-3 px-4">Periode</th>
          <th className="text-left py-3 px-4">Status</th><th className="text-right py-3 px-4">Items</th>
          <th className="text-right py-3 px-4">WO Generated</th>
        </tr></thead>
        <tbody>
          {plans.map((p: any) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-purple-600">{p.plan_code}</td>
              <td className="py-3 px-4">{p.plan_name}</td>
              <td className="py-3 px-4 capitalize">{p.plan_type}</td>
              <td className="py-3 px-4">{formatDate(p.period_start)} - {formatDate(p.period_end)}</td>
              <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span></td>
              <td className="py-3 px-4 text-right">{p.item_count || 0}</td>
              <td className="py-3 px-4 text-right">{p.generated_wo_count || 0}</td>
            </tr>
          ))}
          {plans.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Belum ada Production Plan</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// OEE TAB
// ==========================================
function OEETab({ data }: { data: any }) {
  if (!data) return <div className="text-center text-gray-400 py-12">Loading OEE data...</div>;

  const overall = data.overall || { availability: 0, performance: 0, quality: 0, overall: 0 };

  return (
    <div className="space-y-6">
      {/* Overall OEE */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'OEE Overall', value: parseFloat(overall.overall || 0).toFixed(1), valCls: 'text-purple-600', barCls: 'bg-purple-500', target: 85 },
          { label: 'Availability', value: parseFloat(overall.availability || 0).toFixed(1), valCls: 'text-blue-600', barCls: 'bg-blue-500', target: 90 },
          { label: 'Performance', value: parseFloat(overall.performance || 0).toFixed(1), valCls: 'text-green-600', barCls: 'bg-green-500', target: 95 },
          { label: 'Quality', value: parseFloat(overall.quality || 0).toFixed(1), valCls: 'text-emerald-600', barCls: 'bg-emerald-500', target: 99 },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">{m.label}</p>
            <p className={`text-4xl font-bold ${m.valCls}`}>{m.value}%</p>
            <p className="text-xs text-gray-400 mt-1">Target: {m.target}%</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className={`${m.barCls} h-2 rounded-full`} style={{ width: `${Math.min(parseFloat(m.value), 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* By Work Center */}
      {data.byWorkCenter && data.byWorkCenter.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">OEE per Work Center</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left py-2 px-3">Work Center</th><th className="text-right py-2 px-3">Availability</th>
              <th className="text-right py-2 px-3">Performance</th><th className="text-right py-2 px-3">Quality</th>
              <th className="text-right py-2 px-3">OEE</th><th className="text-right py-2 px-3">Output</th>
              <th className="text-right py-2 px-3">Downtime</th>
            </tr></thead>
            <tbody>
              {data.byWorkCenter.map((wc: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="py-2 px-3 font-medium">{wc.work_center}</td>
                  <td className="py-2 px-3 text-right">{parseFloat(wc.avg_availability || 0).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right">{parseFloat(wc.avg_performance || 0).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right">{parseFloat(wc.avg_quality || 0).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-bold">{parseFloat(wc.avg_oee || 0).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right">{formatNumber(parseFloat(wc.total_output || 0))}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(parseFloat(wc.total_downtime || 0))} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COSTS TAB
// ==========================================
function CostsTab({ data }: { data: any }) {
  if (!data) return <div className="text-center text-gray-400 py-12">Loading cost data...</div>;

  return (
    <div className="space-y-6">
      {/* Cost by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Biaya per Tipe</h3>
          <div className="space-y-3">
            {(data.costByType || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{c.cost_type}</p>
                  <p className="text-xs text-gray-500">Planned: {formatCurrency(parseFloat(c.total_planned || 0))}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(parseFloat(c.total_actual || 0))}</p>
                  <p className={`text-xs ${parseFloat(c.total_variance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Var: {formatCurrency(parseFloat(c.total_variance || 0))}
                  </p>
                </div>
              </div>
            ))}
            {(!data.costByType || data.costByType.length === 0) && <p className="text-center text-gray-400 py-4">Belum ada data biaya</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Biaya per Produk (Top 10)</h3>
          <div className="space-y-3">
            {(data.costByProduct || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.product_name}</p>
                  <p className="text-xs text-gray-500">{p.wo_count} WO · {formatNumber(parseFloat(p.total_qty || 0))} unit</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(parseFloat(p.total_cost || 0))}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(parseFloat(p.unit_cost || 0))}/unit</p>
                </div>
              </div>
            ))}
            {(!data.costByProduct || data.costByProduct.length === 0) && <p className="text-center text-gray-400 py-4">Belum ada data</p>}
          </div>
        </div>
      </div>

      {/* Variance Analysis */}
      {data.varianceAnalysis && data.varianceAnalysis.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Variance Analysis</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left py-2 px-3">WO Number</th><th className="text-left py-2 px-3">Produk</th>
              <th className="text-right py-2 px-3">Planned</th><th className="text-right py-2 px-3">Actual</th>
              <th className="text-right py-2 px-3">Variance</th><th className="text-right py-2 px-3">%</th>
            </tr></thead>
            <tbody>
              {data.varianceAnalysis.map((v: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="py-2 px-3 font-medium">{v.wo_number}</td>
                  <td className="py-2 px-3">{v.product_name}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(v.planned || 0))}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(v.actual || 0))}</td>
                  <td className={`py-2 px-3 text-right font-medium ${parseFloat(v.variance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(parseFloat(v.variance || 0))}</td>
                  <td className="py-2 px-3 text-right">{parseFloat(v.variance_pct || 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// WASTE TAB
// ==========================================
function WasteTab({ records }: { records: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b">
          <th className="text-left py-3 px-4">WO</th><th className="text-left py-3 px-4">Produk</th>
          <th className="text-left py-3 px-4">Tipe Waste</th><th className="text-right py-3 px-4">Qty</th>
          <th className="text-right py-3 px-4">Cost Impact</th><th className="text-left py-3 px-4">Reason</th>
          <th className="text-left py-3 px-4">Work Center</th><th className="text-left py-3 px-4">Tanggal</th>
        </tr></thead>
        <tbody>
          {records.map((r: any) => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{r.wo_number || '-'}</td>
              <td className="py-3 px-4">{r.product_name || '-'}</td>
              <td className="py-3 px-4"><span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs">{r.waste_type}</span></td>
              <td className="py-3 px-4 text-right">{formatNumber(parseFloat(r.quantity || 0))} {r.uom}</td>
              <td className="py-3 px-4 text-right text-red-600">{formatCurrency(parseFloat(r.cost_impact || 0))}</td>
              <td className="py-3 px-4 text-gray-500">{r.reason || '-'}</td>
              <td className="py-3 px-4">{r.work_center_name || '-'}</td>
              <td className="py-3 px-4 text-gray-500 text-xs">{formatDateTime(r.recorded_at)}</td>
            </tr>
          ))}
          {records.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada waste record</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// SETTINGS TAB
// ==========================================
function SettingsTab({ settings }: { settings: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {settings.map((s: any) => {
        const val = typeof s.setting_value === 'string' ? JSON.parse(s.setting_value) : s.setting_value;
        return (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 capitalize">{s.setting_key.replace(/_/g, ' ')}</h3>
            <p className="text-sm text-gray-500 mb-3">{s.description}</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(val, null, 2)}</pre>
            </div>
          </div>
        );
      })}
      {settings.length === 0 && <div className="col-span-2 text-center text-gray-400 py-12">Belum ada pengaturan</div>}
    </div>
  );
}

// ==========================================
// MAINTENANCE TAB
// ==========================================
function MaintenanceTab({ data, api, onRefresh }: { data: any; api: any; onRefresh: () => void }) {
  const [view, setView] = useState<'dashboard' | 'schedules' | 'calibrations' | 'health'>('dashboard');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [machineHealth, setMachineHealth] = useState<any[]>([]);

  const loadView = async (v: string) => {
    try {
      if (v === 'schedules' && schedules.length === 0) setSchedules(await api('maintenance-schedules', 'GET', null, 'advanced'));
      if (v === 'calibrations' && calibrations.length === 0) setCalibrations(await api('calibrations', 'GET', null, 'advanced'));
      if (v === 'health' && machineHealth.length === 0) setMachineHealth(await api('machine-health', 'GET', null, 'advanced'));
    } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    try {
      await api('generate-maintenance', 'POST', {}, 'advanced');
      alert('Maintenance records generated from schedules');
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  if (!data) return <div className="text-center text-gray-400 py-12">Loading maintenance data...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['dashboard', 'schedules', 'calibrations', 'health'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); loadView(v); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${view === v ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{v === 'health' ? 'Machine Health' : v}</button>
          ))}
        </div>
        <button onClick={handleGenerate} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"><Zap className="w-4 h-4" /> Auto-Generate</button>
      </div>

      {view === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overdue', value: data.overdue || 0, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Upcoming (7d)', value: data.upcoming || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Kalibrasi Due', value: data.calibrationsDue || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Biaya (30d)', value: formatCurrency(parseFloat(data.costSummary?.total_cost || 0)), color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-5`}>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>

          {data.machineBreakdown && data.machineBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Status Mesin</h3>
              <div className="flex gap-4">
                {data.machineBreakdown.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[m.status]?.includes('green') ? 'bg-green-500' : STATUS_COLORS[m.status]?.includes('red') ? 'bg-red-500' : STATUS_COLORS[m.status]?.includes('yellow') ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    <span className="text-sm capitalize">{m.status}: <strong>{m.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recentRecords && data.recentRecords.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Riwayat Maintenance Terbaru</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2 px-3">No.</th><th className="text-left py-2 px-3">Mesin</th><th className="text-left py-2 px-3">Tipe</th><th className="text-left py-2 px-3">Status</th><th className="text-right py-2 px-3">Downtime</th></tr></thead>
                <tbody>
                  {data.recentRecords.map((r: any) => (
                    <tr key={r.id} className="border-b"><td className="py-2 px-3 font-medium">{r.maintenance_number || '-'}</td><td className="py-2 px-3">{r.machine_name}</td><td className="py-2 px-3 capitalize">{r.maintenance_type}</td><td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span></td><td className="py-2 px-3 text-right">{r.downtime_hours || 0}h</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'schedules' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">Jadwal</th><th className="text-left py-3 px-4">Mesin</th><th className="text-left py-3 px-4">Tipe</th><th className="text-left py-3 px-4">Frekuensi</th><th className="text-left py-3 px-4">Next Due</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">PIC</th></tr></thead>
            <tbody>
              {schedules.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{s.schedule_name}</td>
                  <td className="py-3 px-4">{s.machine_name} <span className="text-xs text-gray-400">({s.machine_code})</span></td>
                  <td className="py-3 px-4 capitalize">{s.maintenance_type}</td>
                  <td className="py-3 px-4">{s.frequency_value} {s.frequency_type?.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-xs">{s.next_due_at ? formatDateTime(s.next_due_at) : '-'}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.due_status === 'overdue' ? 'bg-red-100 text-red-700' : s.due_status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{s.due_status}</span></td>
                  <td className="py-3 px-4">{s.assigned_to_name || '-'}</td>
                </tr>
              ))}
              {schedules.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Belum ada jadwal maintenance</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'calibrations' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">No. Kalibrasi</th><th className="text-left py-3 px-4">Mesin</th><th className="text-left py-3 px-4">Instrumen</th><th className="text-left py-3 px-4">Tipe</th><th className="text-left py-3 px-4">Jadwal</th><th className="text-left py-3 px-4">Next Due</th><th className="text-left py-3 px-4">Hasil</th><th className="text-left py-3 px-4">Status</th></tr></thead>
            <tbody>
              {calibrations.map((c: any) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{c.calibration_number}</td>
                  <td className="py-3 px-4">{c.machine_name}</td>
                  <td className="py-3 px-4">{c.instrument_name || '-'}</td>
                  <td className="py-3 px-4 capitalize">{c.calibration_type}</td>
                  <td className="py-3 px-4 text-xs">{formatDate(c.scheduled_date)}</td>
                  <td className="py-3 px-4 text-xs">{formatDate(c.next_due_date)}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.result === 'pass' ? 'bg-green-100 text-green-700' : c.result === 'fail' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{c.result}</span></td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
              {calibrations.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada data kalibrasi</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machineHealth.map((m: any) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-semibold text-gray-900">{m.machine_name}</h3><p className="text-xs text-gray-500">{m.machine_code} · {m.work_center_name || '-'}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[m.status]}`}>{m.status}</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Health Score</span><span className={`text-sm font-bold ${parseFloat(m.health_score) >= 80 ? 'text-green-600' : parseFloat(m.health_score) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{parseFloat(m.health_score || 100).toFixed(0)}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${parseFloat(m.health_score) >= 80 ? 'bg-green-500' : parseFloat(m.health_score) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(parseFloat(m.health_score || 100), 100)}%` }} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">MTBF</p><p className="font-medium">{parseFloat(m.mtbf_hours || 0).toFixed(0)}h</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">MTTR</p><p className="font-medium">{parseFloat(m.mttr_hours || 0).toFixed(0)}h</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Failures</p><p className="font-medium">{m.failure_count || 0}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Op Hours</p><p className="font-medium">{formatNumber(parseFloat(m.operating_hours || 0))}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Preventive</p><p className="font-medium text-green-600">{m.preventive_count || 0}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Corrective</p><p className="font-medium text-red-600">{m.corrective_count || 0}</p></div>
              </div>
              {(m.pending_calibrations || 0) > 0 && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {m.pending_calibrations} kalibrasi pending</p>}
            </div>
          ))}
          {machineHealth.length === 0 && <div className="col-span-2 text-center text-gray-400 py-12">Belum ada data mesin</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// PLM TAB - Product Lifecycle Management
// ==========================================
function PLMTab({ products, designChanges, api, onRefresh }: { products: any[]; designChanges: any[]; api: any; onRefresh: () => void }) {
  const [view, setView] = useState<'products' | 'changes' | 'documents'>('products');
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedPLM, setSelectedPLM] = useState<any>(null);

  const STAGES: Record<string, string> = { concept: 'bg-gray-100 text-gray-700', design: 'bg-blue-100 text-blue-700', prototype: 'bg-indigo-100 text-indigo-700', testing: 'bg-yellow-100 text-yellow-700', pre_production: 'bg-orange-100 text-orange-700', production: 'bg-green-100 text-green-700', maturity: 'bg-emerald-100 text-emerald-700', decline: 'bg-red-100 text-red-700', end_of_life: 'bg-gray-200 text-gray-500' };

  const loadDocs = async () => {
    try { if (docs.length === 0) setDocs(await api('plm-documents', 'GET', null, 'advanced')); } catch (e) { console.error(e); }
  };

  const handleApproveECO = async (id: string, action: string) => {
    try {
      await api('plm-approve-eco', 'POST', { id, action }, 'advanced');
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['products', 'changes', 'documents'] as const).map(v => (
          <button key={v} onClick={() => { setView(v); if (v === 'documents') loadDocs(); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${view === v ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
            {v === 'changes' ? `ECO (${designChanges.length})` : v === 'products' ? `Produk (${products.length})` : `Dokumen (${docs.length})`}
          </button>
        ))}
      </div>

      {view === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-semibold text-gray-900">{p.product_name || p.plm_code}</h3><p className="text-xs text-gray-500">{p.plm_code} · v{p.version}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGES[p.lifecycle_stage] || 'bg-gray-100'}`}>{p.lifecycle_stage?.replace('_', ' ')}</span>
              </div>
              {p.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Revisi</p><p className="font-bold">{p.revision}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Changes</p><p className="font-bold">{p.change_count || 0}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">Docs</p><p className="font-bold">{p.document_count || 0}</p></div>
              </div>
              {p.design_owner_name && <p className="text-xs text-gray-400 mt-3">Owner: {p.design_owner_name}</p>}
              {p.target_launch_date && <p className="text-xs text-gray-400">Target Launch: {formatDate(p.target_launch_date)}</p>}
            </div>
          ))}
          {products.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">Belum ada PLM product</div>}
        </div>
      )}

      {view === 'changes' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">ECO No.</th><th className="text-left py-3 px-4">Judul</th><th className="text-left py-3 px-4">Produk</th><th className="text-left py-3 px-4">Tipe</th><th className="text-left py-3 px-4">Prioritas</th><th className="text-left py-3 px-4">Status</th><th className="text-right py-3 px-4">Cost Impact</th><th className="text-center py-3 px-4">Aksi</th></tr></thead>
            <tbody>
              {designChanges.map((dc: any) => (
                <tr key={dc.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-purple-600">{dc.eco_number}</td>
                  <td className="py-3 px-4">{dc.title}</td>
                  <td className="py-3 px-4">{dc.product_name || dc.plm_code || '-'}</td>
                  <td className="py-3 px-4 capitalize">{dc.change_type}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[dc.priority]}`}>{dc.priority}</span></td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[dc.status]}`}>{dc.status}</span></td>
                  <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(dc.cost_impact || 0))}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {(dc.status === 'submitted' || dc.status === 'under_review') && (
                        <>
                          <button onClick={() => handleApproveECO(dc.id, 'approve')} className="p-1 hover:bg-green-100 rounded text-green-600" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleApproveECO(dc.id, 'reject')} className="p-1 hover:bg-red-100 rounded text-red-600" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {dc.status === 'approved' && <button onClick={() => handleApproveECO(dc.id, 'implement')} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Implement"><Play className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {designChanges.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada Engineering Change Order</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d: any) => {
            const typeIcons: Record<string, string> = { drawing: '📐', cad: '🏗️', specification: '📋', test_report: '🧪', certification: '📜', manual: '📖', photo: '📷', video: '🎥', sop: '📝', other: '📄' };
            return (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{typeIcons[d.document_type] || '📄'}</span>
                  <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 truncate">{d.title}</h3><p className="text-xs text-gray-500 capitalize">{d.document_type} · v{d.version}</p></div>
                </div>
                {d.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{d.description}</p>}
                {d.file_name && <p className="text-xs text-gray-400 truncate">{d.file_name}</p>}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>{d.uploaded_by_name || '-'}</span>
                  <span>{formatDate(d.created_at)}</span>
                </div>
              </div>
            );
          })}
          {docs.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">Belum ada dokumen teknis</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// COGM TAB - Cost of Goods Manufactured
// ==========================================
function COGMTab({ data, api, onRefresh }: { data: any; api: any; onRefresh: () => void }) {
  const [view, setView] = useState<'dashboard' | 'periods' | 'rates'>('dashboard');
  const [periods, setPeriods] = useState<any[]>([]);
  const [overheadRates, setOverheadRates] = useState<any[]>([]);
  const [laborRates, setLaborRates] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);

  const loadView = async (v: string) => {
    try {
      if (v === 'periods' && periods.length === 0) setPeriods(await api('cogm-periods', 'GET', null, 'advanced'));
      if (v === 'rates') {
        if (overheadRates.length === 0) setOverheadRates(await api('overhead-rates', 'GET', null, 'advanced'));
        if (laborRates.length === 0) setLaborRates(await api('labor-rates', 'GET', null, 'advanced'));
      }
    } catch (e) { console.error(e); }
  };

  const handleCalculate = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    setCalculating(true);
    try {
      await api('cogm-calculate', 'POST', { period_start: start, period_end: end, period_name: `COGM ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}` }, 'advanced');
      alert('COGM berhasil dihitung!');
      onRefresh();
    } catch (e: any) { alert(e.message); }
    setCalculating(false);
  };

  if (!data) return <div className="text-center text-gray-400 py-12">Loading COGM data...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['dashboard', 'periods', 'rates'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); loadView(v); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${view === v ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{v === 'rates' ? 'Cost Rates' : v}</button>
          ))}
        </div>
        <button onClick={handleCalculate} disabled={calculating} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"><DollarSign className="w-4 h-4" /> {calculating ? 'Calculating...' : 'Hitung COGM Bulan Ini'}</button>
      </div>

      {view === 'dashboard' && (
        <div className="space-y-6">
          {data.latestPeriod && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">COGM Terbaru: {data.latestPeriod.period_name || data.latestPeriod.period_code}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[data.latestPeriod.status]}`}>{data.latestPeriod.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Bahan Baku', value: formatCurrency(parseFloat(data.latestPeriod.total_material_cost || 0)), color: 'text-blue-600', icon: Package },
                  { label: 'Tenaga Kerja', value: formatCurrency(parseFloat(data.latestPeriod.total_labor_cost || 0)), color: 'text-green-600', icon: Users },
                  { label: 'Overhead', value: formatCurrency(parseFloat(data.latestPeriod.total_overhead_cost || 0)), color: 'text-orange-600', icon: Settings },
                  { label: 'Total COGM', value: formatCurrency(parseFloat(data.latestPeriod.total_cogm || 0)), color: 'text-purple-600', icon: DollarSign },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1"><s.icon className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-500">{s.label}</span></div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span>Total Unit: <strong>{formatNumber(parseFloat(data.latestPeriod.total_units_produced || 0))}</strong></span>
                <span>Rata-rata/unit: <strong>{formatCurrency(parseFloat(data.latestPeriod.avg_unit_cost || 0))}</strong></span>
              </div>
            </div>
          )}

          {data.items && data.items.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Profitabilitas per Produk</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2 px-3">Produk</th><th className="text-right py-2 px-3">Unit</th><th className="text-right py-2 px-3">Material</th><th className="text-right py-2 px-3">Labor</th><th className="text-right py-2 px-3">Overhead</th><th className="text-right py-2 px-3">COGM/unit</th><th className="text-right py-2 px-3">Harga Jual</th><th className="text-right py-2 px-3">Margin</th></tr></thead>
                <tbody>
                  {data.items.map((item: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{item.product_name || item.sku || '-'}</td>
                      <td className="py-2 px-3 text-right">{formatNumber(parseFloat(item.units_produced || 0))}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(item.material_cost || 0))}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(item.labor_cost || 0))}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(item.overhead_cost || 0))}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(parseFloat(item.unit_cogm || 0))}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(item.selling_price || 0))}</td>
                      <td className={`py-2 px-3 text-right font-bold ${parseFloat(item.margin_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{parseFloat(item.margin_percentage || 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.costTrend && data.costTrend.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tren Biaya COGM (12 Bulan Terakhir)</h3>
              <div className="space-y-2">
                {data.costTrend.map((ct: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{ct.period_code}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-blue-600">Material: {formatCurrency(parseFloat(ct.total_material_cost || 0))}</span>
                      <span className="text-green-600">Labor: {formatCurrency(parseFloat(ct.total_labor_cost || 0))}</span>
                      <span className="text-orange-600">Overhead: {formatCurrency(parseFloat(ct.total_overhead_cost || 0))}</span>
                      <span className="text-purple-600 font-bold">Total: {formatCurrency(parseFloat(ct.total_cogm || 0))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'periods' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">Periode</th><th className="text-left py-3 px-4">Nama</th><th className="text-right py-3 px-4">Material</th><th className="text-right py-3 px-4">Labor</th><th className="text-right py-3 px-4">Overhead</th><th className="text-right py-3 px-4">Total COGM</th><th className="text-right py-3 px-4">Unit</th><th className="text-left py-3 px-4">Status</th></tr></thead>
            <tbody>
              {periods.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-purple-600">{p.period_code}</td>
                  <td className="py-3 px-4">{p.period_name}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(p.total_material_cost || 0))}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(p.total_labor_cost || 0))}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(p.total_overhead_cost || 0))}</td>
                  <td className="py-3 px-4 text-right font-bold">{formatCurrency(parseFloat(p.total_cogm || 0))}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(parseFloat(p.total_units_produced || 0))}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span></td>
                </tr>
              ))}
              {periods.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada perhitungan COGM</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'rates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tarif Overhead</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.overheadRates || overheadRates).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-500 capitalize">{r.category} · {r.rate_type} · {r.period}</p></div>
                  <p className="font-bold text-purple-600">{formatCurrency(parseFloat(r.rate_value || 0))}</p>
                </div>
              ))}
              {(data.overheadRates || overheadRates).length === 0 && <p className="text-center text-gray-400 py-4 col-span-2">Belum ada tarif overhead</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tarif Tenaga Kerja</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.laborRates || laborRates).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-500">{r.skill_level || '-'} · {r.department || '-'} · OT: {r.overtime_multiplier}x</p></div>
                  <p className="font-bold text-green-600">{formatCurrency(parseFloat(r.rate_value || 0))}/{r.rate_type?.replace('per_', '')}</p>
                </div>
              ))}
              {(data.laborRates || laborRates).length === 0 && <p className="text-center text-gray-400 py-4 col-span-2">Belum ada tarif tenaga kerja</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUBCONTRACTING TAB
// ==========================================
function SubcontractingTab({ subcontracts, api, onRefresh }: { subcontracts: any[]; api: any; onRefresh: () => void }) {
  const handleSend = async (id: string) => {
    try {
      await api('subcontract-send', 'POST', { id }, 'advanced');
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  const handleReceive = async (id: string) => {
    const qty = prompt('Jumlah diterima:');
    if (!qty) return;
    const rejected = prompt('Jumlah ditolak (0 jika tidak ada):', '0');
    try {
      await api('subcontract-receive', 'POST', { id, received_quantity: parseFloat(qty), rejected_quantity: parseFloat(rejected || '0') }, 'advanced');
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  const SC_STATUS: Record<string, string> = { draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700', in_process: 'bg-yellow-100 text-yellow-700', partial_received: 'bg-orange-100 text-orange-700', received: 'bg-green-100 text-green-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b">
          <th className="text-left py-3 px-4">No. Subkontrak</th><th className="text-left py-3 px-4">Vendor</th>
          <th className="text-left py-3 px-4">Operasi</th><th className="text-left py-3 px-4">Produk</th>
          <th className="text-right py-3 px-4">Qty</th><th className="text-right py-3 px-4">Diterima</th>
          <th className="text-right py-3 px-4">Biaya</th><th className="text-left py-3 px-4">Status</th>
          <th className="text-left py-3 px-4">Return</th><th className="text-center py-3 px-4">Aksi</th>
        </tr></thead>
        <tbody>
          {subcontracts.map((sc: any) => (
            <tr key={sc.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-purple-600">{sc.subcontract_number}</td>
              <td className="py-3 px-4">{sc.vendor_name || sc.supplier_name || '-'}</td>
              <td className="py-3 px-4">{sc.operation_name}</td>
              <td className="py-3 px-4">{sc.product_name || '-'}</td>
              <td className="py-3 px-4 text-right">{formatNumber(parseFloat(sc.quantity || 0))} {sc.uom}</td>
              <td className="py-3 px-4 text-right">{formatNumber(parseFloat(sc.received_quantity || 0))}{sc.rejected_quantity > 0 ? <span className="text-red-500 text-xs ml-1">(-{sc.rejected_quantity})</span> : ''}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(sc.total_cost || 0))}</td>
              <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SC_STATUS[sc.status] || 'bg-gray-100'}`}>{sc.status?.replace('_', ' ')}</span></td>
              <td className="py-3 px-4 text-xs text-gray-500">{sc.expected_return_date ? formatDate(sc.expected_return_date) : '-'}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1">
                  {sc.status === 'draft' && <button onClick={() => handleSend(sc.id)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Kirim"><Truck className="w-4 h-4" /></button>}
                  {(sc.status === 'sent' || sc.status === 'in_process' || sc.status === 'partial_received') && <button onClick={() => handleReceive(sc.id)} className="p-1 hover:bg-green-100 rounded text-green-600" title="Terima"><CheckCircle className="w-4 h-4" /></button>}
                </div>
              </td>
            </tr>
          ))}
          {subcontracts.length === 0 && <tr><td colSpan={10} className="py-12 text-center text-gray-400">Belum ada subcontract / makloon</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
