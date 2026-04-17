import React, { useState, useEffect, useCallback } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { useTranslation } from '@/lib/i18n';
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

const MOCK_MFG_DASHBOARD = {
  totalWorkOrders: 45, activeWorkOrders: 12, completedThisMonth: 28, overdueOrders: 3,
  productionOutput: 18500, defectRate: 1.8, oeeScore: 82.5, avgCycleTime: 4.2,
  topProducts: [
    { name: 'Kopi Arabica Blend 250g', produced: 3200, target: 3500 },
    { name: 'Kopi Robusta Premium 500g', produced: 2800, target: 3000 },
    { name: 'Teh Herbal Mix 100g', produced: 1500, target: 1500 },
  ],
  workCenterUtilization: [
    { name: 'Roasting Line A', utilization: 88 }, { name: 'Packaging Line 1', utilization: 76 },
    { name: 'Grinding Station', utilization: 92 }, { name: 'QC Lab', utilization: 65 },
  ],
};

const MOCK_MFG_ANALYTICS = {
  productionTrend: [
    { month: 'Jan', output: 15200, target: 16000 }, { month: 'Feb', output: 16800, target: 16000 },
    { month: 'Mar', output: 18500, target: 17000 },
  ],
  qualityTrend: [{ month: 'Jan', defectRate: 2.1 }, { month: 'Feb', defectRate: 1.9 }, { month: 'Mar', defectRate: 1.8 }],
  costBreakdown: { materials: 65, labor: 20, overhead: 10, other: 5 },
};

const MOCK_WORK_ORDERS = [
  { id: 'wo1', wo_number: 'WO-2026-045', product_name: 'Kopi Arabica Blend 250g', quantity: 500, status: 'in_progress', priority: 'high', start_date: '2026-03-10', due_date: '2026-03-15', progress: 68 },
  { id: 'wo2', wo_number: 'WO-2026-044', product_name: 'Kopi Robusta Premium 500g', quantity: 300, status: 'planned', priority: 'normal', start_date: '2026-03-14', due_date: '2026-03-18', progress: 0 },
  { id: 'wo3', wo_number: 'WO-2026-043', product_name: 'Teh Herbal Mix 100g', quantity: 1000, status: 'completed', priority: 'normal', start_date: '2026-03-05', due_date: '2026-03-09', progress: 100 },
  { id: 'wo4', wo_number: 'WO-2026-042', product_name: 'Sirup Vanila 750ml', quantity: 200, status: 'in_progress', priority: 'urgent', start_date: '2026-03-11', due_date: '2026-03-13', progress: 45 },
];

export default function ManufacturingPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);

  // Dashboard data
  const [dashboard, setDashboard] = useState<any>(MOCK_MFG_DASHBOARD);
  const [analytics, setAnalytics] = useState<any>(MOCK_MFG_ANALYTICS);

  // Lists
  const [workOrders, setWorkOrders] = useState<any[]>(MOCK_WORK_ORDERS);
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
    } catch (e: any) {
      console.error('Dashboard fetch error:', e);
      setDashboard(MOCK_MFG_DASHBOARD);
      setAnalytics(MOCK_MFG_ANALYTICS);
    }
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
    } catch (e: any) {
      console.error(`Fetch ${tab} error:`, e);
      if (tab === 'dashboard') { setDashboard(MOCK_MFG_DASHBOARD); setAnalytics(MOCK_MFG_ANALYTICS); }
      if (tab === 'work-orders') setWorkOrders(MOCK_WORK_ORDERS);
    }
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
      toast.success(t('mfgUi.toast.woActionOk').replace('{{a}}', action.replace('wo-', '')));
      fetchWorkOrders();
    } catch (e: any) { toast.error(e.message); }
  };

  // Create Work Order
  const [woForm, setWoForm] = useState({ product_id: '', bom_id: '', planned_quantity: '', priority: 'normal', planned_start: '', planned_end: '', work_center_id: '', notes: '' });

  const handleCreateWO = async () => {
    if (!woForm.product_id || !woForm.planned_quantity) { toast.error(t('mfgUi.toast.fillRequired')); return; }
    setSaving(true);
    try {
      await api('work-order', 'POST', { ...woForm, planned_quantity: parseFloat(woForm.planned_quantity) });
      toast.success(t('mfgUi.toast.createOk'));
      setShowCreateModal(false);
      fetchWorkOrders();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  // Export CSV
  const handleExport = () => {
    const data = activeTab === 'work-orders' ? workOrders : activeTab === 'bom' ? boms : activeTab === 'machines' ? machines : [];
    if (data.length === 0) { toast.error(t('mfgUi.toast.noExport')); return; }
    const headers = Object.keys(data[0]).filter(k => !k.includes('id') || k === 'id').join(',');
    const rows = data.map(r => Object.values(r).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `manufacturing-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('mfgUi.toast.exportOk'));
  };

  if (!mounted) return null;

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'dashboard', label: t('mfgUi.tabs.dashboard'), icon: BarChart3 },
    { key: 'work-orders', label: t('mfgUi.tabs.workOrders'), icon: ClipboardList },
    { key: 'bom', label: t('mfgUi.tabs.bom'), icon: Layers },
    { key: 'routings', label: t('mfgUi.tabs.routings'), icon: Activity },
    { key: 'work-centers', label: t('mfgUi.tabs.workCenters'), icon: Building2 },
    { key: 'machines', label: t('mfgUi.tabs.machines'), icon: Settings },
    { key: 'quality', label: t('mfgUi.tabs.quality'), icon: Shield },
    { key: 'planning', label: t('mfgUi.tabs.planning'), icon: Calendar },
    { key: 'oee', label: t('mfgUi.tabs.oee'), icon: Gauge },
    { key: 'costs', label: t('mfgUi.tabs.costs'), icon: DollarSign },
    { key: 'maintenance', label: t('mfgUi.tabs.maintenance'), icon: Wrench },
    { key: 'plm', label: t('mfgUi.tabs.plm'), icon: Layers },
    { key: 'cogm', label: t('mfgUi.tabs.cogm'), icon: DollarSign },
    { key: 'subcontracting', label: t('mfgUi.tabs.subcontracting'), icon: Truck },
    { key: 'waste', label: t('mfgUi.tabs.waste'), icon: AlertTriangle },
    { key: 'settings', label: t('mfgUi.tabs.settings'), icon: Settings },
  ];

  return (
    <HQLayout title={t('mfgUi.layout.title')} subtitle={t('mfgUi.layout.subtitle')}>
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
              <input type="text" placeholder={t('mfgUi.toolbar.search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64" />
            </div>
            {['work-orders', 'bom', 'machines', 'quality'].includes(activeTab) && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">{t('mfgUi.toolbar.allStatus')}</option>
                {activeTab === 'work-orders' && <>
                  <option value="draft">{t('mfgUi.woStatus.draft')}</option><option value="planned">{t('mfgUi.woStatus.planned')}</option><option value="released">{t('mfgUi.woStatus.released')}</option>
                  <option value="in_progress">{t('mfgUi.woStatus.in_progress')}</option><option value="completed">{t('mfgUi.woStatus.completed')}</option><option value="on_hold">{t('mfgUi.woStatus.on_hold')}</option>
                </>}
                {activeTab === 'bom' && <><option value="draft">{t('mfgUi.bomStatus.draft')}</option><option value="active">{t('mfgUi.bomStatus.active')}</option><option value="expired">{t('mfgUi.bomStatus.expired')}</option></>}
                {activeTab === 'machines' && <><option value="operational">{t('mfgUi.machineStatus.operational')}</option><option value="maintenance">{t('mfgUi.machineStatus.maintenance')}</option><option value="breakdown">{t('mfgUi.machineStatus.breakdown')}</option></>}
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchTabData(activeTab)} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('mfgUi.toolbar.refresh')}
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <Download className="w-4 h-4" /> {t('mfgUi.toolbar.export')}
            </button>
            {['work-orders', 'bom', 'routings', 'work-centers', 'machines', 'quality', 'planning'].includes(activeTab) && (
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                <Plus className="w-4 h-4" /> {t('mfgUi.toolbar.create')}
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
        <Modal isOpen={showCreateModal && activeTab === 'work-orders'} onClose={() => setShowCreateModal(false)} title={t('mfgUi.modal.createWo')} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.product')} *</label>
                <select value={woForm.product_id} onChange={e => setWoForm({ ...woForm, product_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">{t('mfgUi.modal.selectProduct')}</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.qty')} *</label>
                <input type="number" value={woForm.planned_quantity} onChange={e => setWoForm({ ...woForm, planned_quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.priority')}</label>
                <select value={woForm.priority} onChange={e => setWoForm({ ...woForm, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="low">{t('mfgUi.priority.low')}</option><option value="normal">{t('mfgUi.priority.normal')}</option><option value="high">{t('mfgUi.priority.high')}</option><option value="urgent">{t('mfgUi.priority.urgent')}</option><option value="critical">{t('mfgUi.priority.critical')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.workCenter')}</label>
                <select value={woForm.work_center_id} onChange={e => setWoForm({ ...woForm, work_center_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">{t('mfgUi.modal.selectWc')}</option>
                  {workCenters.map((wc: any) => <option key={wc.id} value={wc.id}>{wc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.plannedStart')}</label>
                <input type="datetime-local" value={woForm.planned_start} onChange={e => setWoForm({ ...woForm, planned_start: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.plannedEnd')}</label>
                <input type="datetime-local" value={woForm.planned_end} onChange={e => setWoForm({ ...woForm, planned_end: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('mfgUi.modal.notes')}</label>
              <textarea value={woForm.notes} onChange={e => setWoForm({ ...woForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm">{t('mfgUi.modal.cancel')}</button>
              <button onClick={handleCreateWO} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t('mfgUi.modal.save')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null); }} title={`${t('mfgUi.detail')}: ${selectedItem?.wo_number || selectedItem?.bom_code || ''}`} size="xl">
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
  const { t } = useTranslation();
  if (!dashboard) return <div className="text-center text-gray-500 py-8">{t('mfgUi.dashboard.loading')}</div>;

  const wo = dashboard.workOrders || {};
  const mch = dashboard.machines || {};
  const qc = dashboard.quality || {};

  const stats = [
    { label: t('mfgUi.dashboard.wo30'), value: wo.total || 0, icon: ClipboardList, bg: 'bg-purple-50 border-purple-200', iconCls: 'text-purple-600', valCls: 'text-purple-700', sub: `${wo.in_progress || 0} ${t('mfgUi.dashboard.active')}` },
    { label: t('mfgUi.dashboard.totalProd'), value: formatNumber(parseFloat(wo.total_produced || 0)), icon: Package, bg: 'bg-blue-50 border-blue-200', iconCls: 'text-blue-600', valCls: 'text-blue-700', sub: `${t('mfgUi.dashboard.reject')}: ${formatNumber(parseFloat(wo.total_rejected || 0))}` },
    { label: t('mfgUi.dashboard.machines'), value: `${mch.operational || 0}/${mch.total || 0}`, icon: Settings, bg: 'bg-green-50 border-green-200', iconCls: 'text-green-600', valCls: 'text-green-700', sub: `${mch.in_maintenance || 0} ${t('mfgUi.dashboard.maint')}` },
    { label: t('mfgUi.dashboard.qcPass'), value: `${qc.total_inspections > 0 ? ((parseFloat(qc.passed || 0) / parseFloat(qc.total_inspections || 1)) * 100).toFixed(1) : 0}%`, icon: Shield, bg: 'bg-emerald-50 border-emerald-200', iconCls: 'text-emerald-600', valCls: 'text-emerald-700', sub: `${qc.failed || 0} ${t('mfgUi.dashboard.failed')}` },
    { label: t('mfgUi.dashboard.maintAlert'), value: dashboard.maintenanceAlerts || 0, icon: AlertTriangle, bg: 'bg-red-50 border-red-200', iconCls: 'text-red-600', valCls: 'text-red-700', sub: t('mfgUi.dashboard.needAction') },
    { label: t('mfgUi.dashboard.totalCost'), value: formatCurrency(parseFloat(wo.total_cost || 0)), icon: DollarSign, bg: 'bg-amber-50 border-amber-200', iconCls: 'text-amber-600', valCls: 'text-amber-700', sub: '' },
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
            <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.dashboard.trendTitle')}</h3>
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
                { name: t('mfgUi.dashboard.qty'), data: analytics.trend.map((tr: any) => parseFloat(tr.quantity_produced || 0)) },
                { name: t('mfgUi.dashboard.orders'), data: analytics.trend.map((tr: any) => parseInt(tr.orders_completed || 0)) }
              ]} />
            ) : <p className="text-gray-400 text-center py-12">{t('mfgUi.dashboard.noProd')}</p>}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.dashboard.topProducts')}</h3>
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
                    <p className="text-xs text-gray-500">{t('mfgUi.dashboard.yield')}: {parseFloat(p.avg_yield || 0).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {(!analytics.topProducts || analytics.topProducts.length === 0) && <p className="text-gray-400 text-center py-8">{t('mfgUi.costs.noData')}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Work Center Load */}
      {analytics?.workCenterLoad && analytics.workCenterLoad.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.dashboard.wcLoad')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.workCenterLoad.map((wc: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-sm">{wc.name}</p>
                <p className="text-xs text-gray-500">{wc.code}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div><p className="text-lg font-bold text-purple-600">{wc.active_orders}</p><p className="text-xs text-gray-500">{t('mfgUi.dashboard.active')}</p></div>
                  <div><p className="text-lg font-bold text-blue-600">{wc.queued_orders}</p><p className="text-xs text-gray-500">{t('mfgUi.dashboard.queue')}</p></div>
                  <div><p className="text-lg font-bold text-green-600">{formatNumber(parseFloat(wc.total_output || 0))}</p><p className="text-xs text-gray-500">{t('mfgUi.dashboard.output')}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Work Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.dashboard.recentWo')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left py-2 px-3">{t('mfgUi.dashboard.colWo')}</th><th className="text-left py-2 px-3">{t('mfgUi.dashboard.colProduct')}</th>
              <th className="text-left py-2 px-3">{t('mfgUi.dashboard.colStatus')}</th><th className="text-right py-2 px-3">{t('mfgUi.dashboard.colQty')}</th>
              <th className="text-left py-2 px-3">{t('mfgUi.dashboard.colWc')}</th><th className="text-left py-2 px-3">{t('mfgUi.dashboard.colCreated')}</th>
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
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('mfgUi.dashboard.emptyWo')}</td></tr>
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
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left py-3 px-4">{t('mfgUi.wo.colWo')}</th><th className="text-left py-3 px-4">{t('mfgUi.wo.colProduct')}</th>
            <th className="text-left py-3 px-4">{t('mfgUi.wo.colStatus')}</th><th className="text-left py-3 px-4">{t('mfgUi.wo.colPri')}</th>
            <th className="text-right py-3 px-4">{t('mfgUi.wo.colPlanned')}</th><th className="text-right py-3 px-4">{t('mfgUi.wo.colActual')}</th>
            <th className="text-left py-3 px-4">{t('mfgUi.wo.colWc')}</th><th className="text-left py-3 px-4">{t('mfgUi.wo.colStart')}</th>
            <th className="text-center py-3 px-4">{t('mfgUi.wo.colAction')}</th>
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
                    <button onClick={() => onView(wo)} className="p-1 hover:bg-gray-100 rounded" title={t('mfgUi.wo.titleDetail')}><Eye className="w-4 h-4" /></button>
                    {(wo.status === 'planned' || wo.status === 'released') && (
                      <button onClick={() => onAction('wo-start', wo.id)} className="p-1 hover:bg-green-100 rounded text-green-600" title={t('mfgUi.wo.titleStart')}><Play className="w-4 h-4" /></button>
                    )}
                    {wo.status === 'in_progress' && (
                      <>
                        <button onClick={() => onAction('wo-pause', wo.id)} className="p-1 hover:bg-yellow-100 rounded text-yellow-600" title={t('mfgUi.wo.titlePause')}><Pause className="w-4 h-4" /></button>
                        <button onClick={() => onAction('wo-auto-issue', null, { work_order_id: wo.id })} className="p-1 hover:bg-purple-100 rounded text-purple-600" title={t('mfgUi.wo.titleAuto')}><Package className="w-4 h-4" /></button>
                        <button onClick={() => onAction('wo-complete', wo.id, { actual_quantity: wo.planned_quantity })} className="p-1 hover:bg-blue-100 rounded text-blue-600" title={t('mfgUi.wo.titleComplete')}><CheckCircle className="w-4 h-4" /></button>
                      </>
                    )}
                    {wo.status === 'on_hold' && (
                      <button onClick={() => onAction('wo-resume', wo.id)} className="p-1 hover:bg-green-100 rounded text-green-600" title={t('mfgUi.wo.titleResume')}><Play className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {workOrders.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-gray-400">{t('mfgUi.wo.empty')}</td></tr>}
          </tbody>
        </table>
      </div>
      {total > 20 && (
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-gray-500">{t('mfgUi.wo.total').replace('{{n}}', String(total))}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">{t('mfgUi.wo.prev')}</button>
            <span className="px-3 py-1 text-sm">{t('mfgUi.wo.page')} {page}</span>
            <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="px-3 py-1 border rounded text-sm disabled:opacity-50">{t('mfgUi.wo.next')}</button>
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
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left py-3 px-4">{t('mfgUi.bom.code')}</th><th className="text-left py-3 px-4">{t('mfgUi.bom.name')}</th>
            <th className="text-left py-3 px-4">{t('mfgUi.bom.product')}</th><th className="text-left py-3 px-4">{t('mfgUi.bom.status')}</th>
            <th className="text-left py-3 px-4">{t('mfgUi.bom.type')}</th><th className="text-right py-3 px-4">{t('mfgUi.bom.items')}</th>
            <th className="text-right py-3 px-4">{t('mfgUi.bom.matCost')}</th><th className="text-left py-3 px-4">{t('mfgUi.bom.version')}</th>
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
            {boms.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">{t('mfgUi.bom.empty')}</td></tr>}
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
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left py-3 px-4">{t('mfgUi.routing.code')}</th><th className="text-left py-3 px-4">{t('mfgUi.routing.name')}</th>
            <th className="text-left py-3 px-4">{t('mfgUi.routing.product')}</th><th className="text-left py-3 px-4">{t('mfgUi.routing.status')}</th>
            <th className="text-right py-3 px-4">{t('mfgUi.routing.ops')}</th><th className="text-right py-3 px-4">{t('mfgUi.routing.time')}</th>
            <th className="text-right py-3 px-4">{t('mfgUi.routing.cost')}</th>
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
            {routings.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">{t('mfgUi.routing.empty')}</td></tr>}
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
  const { t } = useTranslation();
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
            <div><p className="text-gray-500 text-xs">{t('mfgUi.wc.capPerH')}</p><p className="font-medium">{wc.capacity_per_hour}</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.wc.costPerH')}</p><p className="font-medium">{formatCurrency(parseFloat(wc.operating_cost_per_hour || 0))}</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.wc.machines')}</p><p className="font-medium">{wc.machine_count || 0}</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.wc.woActive')}</p><p className="font-medium">{wc.active_orders || 0}</p></div>
          </div>
          {wc.location && <p className="text-xs text-gray-500 mt-3">📍 {wc.location}</p>}
        </div>
      ))}
      {workCenters.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">{t('mfgUi.wc.empty')}</div>}
    </div>
  );
}

// ==========================================
// MACHINES TAB
// ==========================================
function MachinesTab({ machines }: { machines: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {machines.map((m: any) => (
        <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{m.machine_name}</h3>
              <p className="text-xs text-gray-500">{m.machine_code} · {m.type || t('mfgUi.machines.general')}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[m.status]}`}>{m.status}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-3">
            <div><p className="text-gray-500 text-xs">{t('mfgUi.machines.manufacturer')}</p><p className="font-medium">{m.manufacturer || '-'}</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.machines.model')}</p><p className="font-medium">{m.model || '-'}</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.machines.workCenter')}</p><p className="font-medium">{m.work_center_name || '-'}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">{t('mfgUi.machines.opHours')}</p><p className="font-medium">{formatNumber(parseFloat(m.operating_hours || 0))} h</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.machines.costHour')}</p><p className="font-medium">{formatCurrency(parseFloat(m.cost_per_hour || 0))}</p></div>
            <div><p className="text-gray-500 text-xs">{t('mfgUi.machines.maint')}</p>
              <p className={`font-medium ${(m.pending_maintenance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(m.pending_maintenance || 0) > 0 ? `${m.pending_maintenance} ${t('mfgUi.machines.pending')}` : t('mfgUi.machines.ok')}
              </p>
            </div>
          </div>
        </div>
      ))}
      {machines.length === 0 && <div className="col-span-2 text-center text-gray-400 py-12">{t('mfgUi.machines.empty')}</div>}
    </div>
  );
}

// ==========================================
// QUALITY TAB
// ==========================================
function QualityTab({ inspections, templates }: { inspections: any[]; templates: any[] }) {
  const { t } = useTranslation();
  const [qcView, setQcView] = useState<'inspections' | 'templates'>('inspections');
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setQcView('inspections')} className={`px-4 py-2 rounded-lg text-sm font-medium ${qcView === 'inspections' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{t('mfgUi.qc.inspections')} ({inspections.length})</button>
        <button onClick={() => setQcView('templates')} className={`px-4 py-2 rounded-lg text-sm font-medium ${qcView === 'templates' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{t('mfgUi.qc.templates')} ({templates.length})</button>
      </div>

      {qcView === 'inspections' ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left py-3 px-4">{t('mfgUi.qc.colInsp')}</th><th className="text-left py-3 px-4">{t('mfgUi.qc.colWo')}</th>
              <th className="text-left py-3 px-4">{t('mfgUi.qc.colProduct')}</th><th className="text-left py-3 px-4">{t('mfgUi.qc.colType')}</th>
              <th className="text-left py-3 px-4">{t('mfgUi.qc.colStatus')}</th><th className="text-left py-3 px-4">{t('mfgUi.qc.colResult')}</th>
              <th className="text-right py-3 px-4">{t('mfgUi.qc.colDefects')}</th><th className="text-left py-3 px-4">{t('mfgUi.qc.colInspector')}</th>
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
              {inspections.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">{t('mfgUi.qc.emptyInsp')}</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tm: any) => (
            <div key={tm.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{tm.template_name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tm.status]}`}>{tm.status}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{tm.template_code} · {tm.inspection_type?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600">{tm.description || t('mfgUi.qc.noDesc')}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{(typeof tm.parameters === 'string' ? JSON.parse(tm.parameters) : tm.parameters || []).length} {t('mfgUi.qc.params')}</span>
                <span>{tm.usage_count || 0}x {t('mfgUi.qc.used')}</span>
              </div>
            </div>
          ))}
          {templates.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">{t('mfgUi.qc.emptyTpl')}</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// PLANNING TAB
// ==========================================
function PlanningTab({ plans }: { plans: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b">
          <th className="text-left py-3 px-4">{t('mfgUi.planning.code')}</th><th className="text-left py-3 px-4">{t('mfgUi.planning.name')}</th>
          <th className="text-left py-3 px-4">{t('mfgUi.planning.type')}</th><th className="text-left py-3 px-4">{t('mfgUi.planning.period')}</th>
          <th className="text-left py-3 px-4">{t('mfgUi.planning.status')}</th><th className="text-right py-3 px-4">{t('mfgUi.planning.items')}</th>
          <th className="text-right py-3 px-4">{t('mfgUi.planning.woGen')}</th>
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
          {plans.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">{t('mfgUi.planning.empty')}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// OEE TAB
// ==========================================
function OEETab({ data }: { data: any }) {
  const { t } = useTranslation();
  if (!data) return <div className="text-center text-gray-400 py-12">{t('mfgUi.oee.loading')}</div>;

  const overall = data.overall || { availability: 0, performance: 0, quality: 0, overall: 0 };

  return (
    <div className="space-y-6">
      {/* Overall OEE */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t('mfgUi.oee.overall'), value: parseFloat(overall.overall || 0).toFixed(1), valCls: 'text-purple-600', barCls: 'bg-purple-500', target: 85 },
          { label: t('mfgUi.oee.availability'), value: parseFloat(overall.availability || 0).toFixed(1), valCls: 'text-blue-600', barCls: 'bg-blue-500', target: 90 },
          { label: t('mfgUi.oee.performance'), value: parseFloat(overall.performance || 0).toFixed(1), valCls: 'text-green-600', barCls: 'bg-green-500', target: 95 },
          { label: t('mfgUi.oee.quality'), value: parseFloat(overall.quality || 0).toFixed(1), valCls: 'text-emerald-600', barCls: 'bg-emerald-500', target: 99 },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">{m.label}</p>
            <p className={`text-4xl font-bold ${m.valCls}`}>{m.value}%</p>
            <p className="text-xs text-gray-400 mt-1">{t('mfgUi.oee.target')}: {m.target}%</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className={`${m.barCls} h-2 rounded-full`} style={{ width: `${Math.min(parseFloat(m.value), 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* By Work Center */}
      {data.byWorkCenter && data.byWorkCenter.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.oee.perWc')}</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left py-2 px-3">{t('mfgUi.oee.wc')}</th><th className="text-right py-2 px-3">{t('mfgUi.oee.availability')}</th>
              <th className="text-right py-2 px-3">{t('mfgUi.oee.performance')}</th><th className="text-right py-2 px-3">{t('mfgUi.oee.quality')}</th>
              <th className="text-right py-2 px-3">OEE</th><th className="text-right py-2 px-3">{t('mfgUi.dashboard.output')}</th>
              <th className="text-right py-2 px-3">{t('mfgUi.oee.downtime')}</th>
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
  const { t } = useTranslation();
  if (!data) return <div className="text-center text-gray-400 py-12">{t('mfgUi.costs.loading')}</div>;

  return (
    <div className="space-y-6">
      {/* Cost by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.costs.byType')}</h3>
          <div className="space-y-3">
            {(data.costByType || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{c.cost_type}</p>
                  <p className="text-xs text-gray-500">{t('mfgUi.costs.planned')}: {formatCurrency(parseFloat(c.total_planned || 0))}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(parseFloat(c.total_actual || 0))}</p>
                  <p className={`text-xs ${parseFloat(c.total_variance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {t('mfgUi.costs.var')}: {formatCurrency(parseFloat(c.total_variance || 0))}
                  </p>
                </div>
              </div>
            ))}
            {(!data.costByType || data.costByType.length === 0) && <p className="text-center text-gray-400 py-4">{t('mfgUi.costs.noCost')}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.costs.byProduct')}</h3>
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
            {(!data.costByProduct || data.costByProduct.length === 0) && <p className="text-center text-gray-400 py-4">{t('mfgUi.costs.noData')}</p>}
          </div>
        </div>
      </div>

      {/* Variance Analysis */}
      {data.varianceAnalysis && data.varianceAnalysis.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.costs.variance')}</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left py-2 px-3">{t('mfgUi.wo.colWo')}</th><th className="text-left py-2 px-3">{t('mfgUi.dashboard.colProduct')}</th>
              <th className="text-right py-2 px-3">{t('mfgUi.costs.planned')}</th><th className="text-right py-2 px-3">{t('mfgUi.costs.actual')}</th>
              <th className="text-right py-2 px-3">{t('mfgUi.costs.var')}</th><th className="text-right py-2 px-3">{t('mfgUi.costs.pct')}</th>
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
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b">
          <th className="text-left py-3 px-4">{t('mfgUi.waste.colWo')}</th><th className="text-left py-3 px-4">{t('mfgUi.waste.colProduct')}</th>
          <th className="text-left py-3 px-4">{t('mfgUi.waste.colType')}</th><th className="text-right py-3 px-4">{t('mfgUi.waste.colQty')}</th>
          <th className="text-right py-3 px-4">{t('mfgUi.waste.colCost')}</th><th className="text-left py-3 px-4">{t('mfgUi.waste.colReason')}</th>
          <th className="text-left py-3 px-4">{t('mfgUi.waste.colWc')}</th><th className="text-left py-3 px-4">{t('mfgUi.waste.colDate')}</th>
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
          {records.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">{t('mfgUi.waste.empty')}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// SETTINGS TAB
// ==========================================
function SettingsTab({ settings }: { settings: any[] }) {
  const { t } = useTranslation();
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
      {settings.length === 0 && <div className="col-span-2 text-center text-gray-400 py-12">{t('mfgUi.settings.empty')}</div>}
    </div>
  );
}

// ==========================================
// MAINTENANCE TAB
// ==========================================
function MaintenanceTab({ data, api, onRefresh }: { data: any; api: any; onRefresh: () => void }) {
  const { t } = useTranslation();
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
      alert(t('mfgUi.maint.genOk'));
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  if (!data) return <div className="text-center text-gray-400 py-12">{t('mfgUi.maint.loading')}</div>;

  const maintViewLabel = (vk: string) =>
    vk === 'dashboard' ? t('mfgUi.maint.dashboard') : vk === 'schedules' ? t('mfgUi.maint.schedules') : vk === 'calibrations' ? t('mfgUi.maint.calibrations') : t('mfgUi.maint.health');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['dashboard', 'schedules', 'calibrations', 'health'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); loadView(v); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${view === v ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{maintViewLabel(v)}</button>
          ))}
        </div>
        <button onClick={handleGenerate} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"><Zap className="w-4 h-4" /> {t('mfgUi.maint.autoGen')}</button>
      </div>

      {view === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('mfgUi.maint.overdue'), value: data.overdue || 0, color: 'text-red-600', bg: 'bg-red-50' },
              { label: t('mfgUi.maint.upcoming7'), value: data.upcoming || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: t('mfgUi.maint.calDue'), value: data.calibrationsDue || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: t('mfgUi.maint.totalCost30'), value: formatCurrency(parseFloat(data.costSummary?.total_cost || 0)), color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-5`}>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>

          {data.machineBreakdown && data.machineBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.maint.machineStatus')}</h3>
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
              <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.maint.recent')}</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2 px-3">{t('mfgUi.maint.colNo')}</th><th className="text-left py-2 px-3">{t('mfgUi.maint.colMachine')}</th><th className="text-left py-2 px-3">{t('mfgUi.maint.colType')}</th><th className="text-left py-2 px-3">{t('mfgUi.maint.colStatus')}</th><th className="text-right py-2 px-3">{t('mfgUi.oee.downtime')}</th></tr></thead>
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
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">{t('mfgUi.maint.colSched')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colMachine')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colType')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colFreq')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colNext')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colStatus')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colPic')}</th></tr></thead>
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
              {schedules.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">{t('mfgUi.maint.emptySched')}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'calibrations' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">{t('mfgUi.maint.colCalNo')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colMachine')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colInstrument')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colType')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colSchedule')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colNext')}</th><th className="text-left py-3 px-4">{t('mfgUi.qc.colResult')}</th><th className="text-left py-3 px-4">{t('mfgUi.maint.colStatus')}</th></tr></thead>
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
              {calibrations.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">{t('mfgUi.maint.emptyCal')}</td></tr>}
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
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">{t('mfgUi.maint.healthScore')}</span><span className={`text-sm font-bold ${parseFloat(m.health_score) >= 80 ? 'text-green-600' : parseFloat(m.health_score) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{parseFloat(m.health_score || 100).toFixed(0)}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${parseFloat(m.health_score) >= 80 ? 'bg-green-500' : parseFloat(m.health_score) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(parseFloat(m.health_score || 100), 100)}%` }} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.maint.mtbf')}</p><p className="font-medium">{parseFloat(m.mtbf_hours || 0).toFixed(0)}h</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.maint.mttr')}</p><p className="font-medium">{parseFloat(m.mttr_hours || 0).toFixed(0)}h</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.maint.failures')}</p><p className="font-medium">{m.failure_count || 0}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.maint.opHours')}</p><p className="font-medium">{formatNumber(parseFloat(m.operating_hours || 0))}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.maint.preventive')}</p><p className="font-medium text-green-600">{m.preventive_count || 0}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.maint.corrective')}</p><p className="font-medium text-red-600">{m.corrective_count || 0}</p></div>
              </div>
              {(m.pending_calibrations || 0) > 0 && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {m.pending_calibrations} {t('mfgUi.maint.calPending')}</p>}
            </div>
          ))}
          {machineHealth.length === 0 && <div className="col-span-2 text-center text-gray-400 py-12">{t('mfgUi.maint.emptyMachine')}</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// PLM TAB - Product Lifecycle Management
// ==========================================
function PLMTab({ products, designChanges, api, onRefresh }: { products: any[]; designChanges: any[]; api: any; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [view, setView] = useState<'products' | 'changes' | 'documents'>('products');
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedPLM, setSelectedPLM] = useState<any>(null);

  const STAGES: Record<string, string> = { concept: 'bg-gray-100 text-gray-700', design: 'bg-blue-100 text-blue-700', prototype: 'bg-indigo-100 text-indigo-700', testing: 'bg-yellow-100 text-yellow-700', pre_production: 'bg-orange-100 text-orange-700', production: 'bg-green-100 text-green-700', maturity: 'bg-emerald-100 text-emerald-700', decline: 'bg-red-100 text-red-700', end_of_life: 'bg-gray-200 text-gray-500' };

  const loadDocs = async () => {
    try { if (docs.length === 0) setDocs(await api('plm-documents', 'GET', null, 'advanced')); } catch (e) { console.error(e); }
  };

  const plmStageLabel = (stage: string | undefined) => {
    if (!stage) return '';
    const k = `mfgUi.plm.stage.${stage}` as const;
    const tr = t(k);
    return tr === k ? stage.replace(/_/g, ' ') : tr;
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
            {v === 'changes' ? `${t('mfgUi.plm.eco')} (${designChanges.length})` : v === 'products' ? `${t('mfgUi.plm.products')} (${products.length})` : `${t('mfgUi.plm.documents')} (${docs.length})`}
          </button>
        ))}
      </div>

      {view === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-semibold text-gray-900">{p.product_name || p.plm_code}</h3><p className="text-xs text-gray-500">{p.plm_code} · v{p.version}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGES[p.lifecycle_stage] || 'bg-gray-100'}`}>{plmStageLabel(p.lifecycle_stage)}</span>
              </div>
              {p.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.plm.revision')}</p><p className="font-bold">{p.revision}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.plm.changes')}</p><p className="font-bold">{p.change_count || 0}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-gray-500">{t('mfgUi.plm.docs')}</p><p className="font-bold">{p.document_count || 0}</p></div>
              </div>
              {p.design_owner_name && <p className="text-xs text-gray-400 mt-3">{t('mfgUi.plm.owner')}: {p.design_owner_name}</p>}
              {p.target_launch_date && <p className="text-xs text-gray-400">{t('mfgUi.plm.targetLaunch')}: {formatDate(p.target_launch_date)}</p>}
            </div>
          ))}
          {products.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">{t('mfgUi.plm.emptyProd')}</div>}
        </div>
      )}

      {view === 'changes' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">{t('mfgUi.plm.colEco')}</th><th className="text-left py-3 px-4">{t('mfgUi.plm.colTitle')}</th><th className="text-left py-3 px-4">{t('mfgUi.plm.colProduct')}</th><th className="text-left py-3 px-4">{t('mfgUi.plm.colType')}</th><th className="text-left py-3 px-4">{t('mfgUi.plm.colPri')}</th><th className="text-left py-3 px-4">{t('mfgUi.plm.colStatus')}</th><th className="text-right py-3 px-4">{t('mfgUi.plm.colCost')}</th><th className="text-center py-3 px-4">{t('mfgUi.plm.colAction')}</th></tr></thead>
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
                          <button onClick={() => handleApproveECO(dc.id, 'approve')} className="p-1 hover:bg-green-100 rounded text-green-600" title={t('mfgUi.plm.approve')}><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleApproveECO(dc.id, 'reject')} className="p-1 hover:bg-red-100 rounded text-red-600" title={t('mfgUi.plm.reject')}><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {dc.status === 'approved' && <button onClick={() => handleApproveECO(dc.id, 'implement')} className="p-1 hover:bg-blue-100 rounded text-blue-600" title={t('mfgUi.plm.implement')}><Play className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {designChanges.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">{t('mfgUi.plm.emptyEco')}</td></tr>}
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
          {docs.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">{t('mfgUi.plm.emptyDoc')}</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// COGM TAB - Cost of Goods Manufactured
// ==========================================
function COGMTab({ data, api, onRefresh }: { data: any; api: any; onRefresh: () => void }) {
  const { t } = useTranslation();
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
      alert(t('mfgUi.cogm.calcOk'));
      onRefresh();
    } catch (e: any) { alert(e.message); }
    setCalculating(false);
  };

  if (!data) return <div className="text-center text-gray-400 py-12">{t('mfgUi.cogm.loading')}</div>;

  const cogmViewLabel = (vk: string) =>
    vk === 'dashboard' ? t('mfgUi.cogm.dashboard') : vk === 'periods' ? t('mfgUi.cogm.periods') : t('mfgUi.cogm.rates');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['dashboard', 'periods', 'rates'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); loadView(v); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${view === v ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{cogmViewLabel(v)}</button>
          ))}
        </div>
        <button onClick={handleCalculate} disabled={calculating} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"><DollarSign className="w-4 h-4" /> {calculating ? t('mfgUi.cogm.calculating') : t('mfgUi.cogm.calcMonth')}</button>
      </div>

      {view === 'dashboard' && (
        <div className="space-y-6">
          {data.latestPeriod && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('mfgUi.cogm.latest')}: {data.latestPeriod.period_name || data.latestPeriod.period_code}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[data.latestPeriod.status]}`}>{data.latestPeriod.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t('mfgUi.cogm.material'), value: formatCurrency(parseFloat(data.latestPeriod.total_material_cost || 0)), color: 'text-blue-600', icon: Package },
                  { label: t('mfgUi.cogm.labor'), value: formatCurrency(parseFloat(data.latestPeriod.total_labor_cost || 0)), color: 'text-green-600', icon: Users },
                  { label: t('mfgUi.cogm.overhead'), value: formatCurrency(parseFloat(data.latestPeriod.total_overhead_cost || 0)), color: 'text-orange-600', icon: Settings },
                  { label: t('mfgUi.cogm.total'), value: formatCurrency(parseFloat(data.latestPeriod.total_cogm || 0)), color: 'text-purple-600', icon: DollarSign },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1"><s.icon className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-500">{s.label}</span></div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span>{t('mfgUi.cogm.totalUnits')}: <strong>{formatNumber(parseFloat(data.latestPeriod.total_units_produced || 0))}</strong></span>
                <span>{t('mfgUi.cogm.avgUnit')}: <strong>{formatCurrency(parseFloat(data.latestPeriod.avg_unit_cost || 0))}</strong></span>
              </div>
            </div>
          )}

          {data.items && data.items.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.cogm.profitability')}</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2 px-3">{t('mfgUi.plm.colProduct')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.unit')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.colMat')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.colLab')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.colOh')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.cogmUnit')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.sellPrice')}</th><th className="text-right py-2 px-3">{t('mfgUi.cogm.margin')}</th></tr></thead>
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
              <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.cogm.trendTitle')}</h3>
              <div className="space-y-2">
                {data.costTrend.map((ct: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{ct.period_code}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-blue-600">{t('mfgUi.cogm.material')}: {formatCurrency(parseFloat(ct.total_material_cost || 0))}</span>
                      <span className="text-green-600">{t('mfgUi.cogm.labor')}: {formatCurrency(parseFloat(ct.total_labor_cost || 0))}</span>
                      <span className="text-orange-600">{t('mfgUi.cogm.overhead')}: {formatCurrency(parseFloat(ct.total_overhead_cost || 0))}</span>
                      <span className="text-purple-600 font-bold">{t('mfgUi.cogm.total')}: {formatCurrency(parseFloat(ct.total_cogm || 0))}</span>
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
            <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">{t('mfgUi.cogm.colPeriod')}</th><th className="text-left py-3 px-4">{t('mfgUi.cogm.colName')}</th><th className="text-right py-3 px-4">{t('mfgUi.cogm.colMat')}</th><th className="text-right py-3 px-4">{t('mfgUi.cogm.colLab')}</th><th className="text-right py-3 px-4">{t('mfgUi.cogm.colOh')}</th><th className="text-right py-3 px-4">{t('mfgUi.cogm.colTotal')}</th><th className="text-right py-3 px-4">{t('mfgUi.cogm.colUnit')}</th><th className="text-left py-3 px-4">{t('mfgUi.cogm.colStat')}</th></tr></thead>
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
              {periods.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">{t('mfgUi.cogm.emptyPeriod')}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'rates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.cogm.overheadRates')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.overheadRates || overheadRates).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-500 capitalize">{r.category} · {r.rate_type} · {r.period}</p></div>
                  <p className="font-bold text-purple-600">{formatCurrency(parseFloat(r.rate_value || 0))}</p>
                </div>
              ))}
              {(data.overheadRates || overheadRates).length === 0 && <p className="text-center text-gray-400 py-4 col-span-2">{t('mfgUi.cogm.emptyOh')}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('mfgUi.cogm.laborRates')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.laborRates || laborRates).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-500">{r.skill_level || '-'} · {r.department || '-'} · OT: {r.overtime_multiplier}x</p></div>
                  <p className="font-bold text-green-600">{formatCurrency(parseFloat(r.rate_value || 0))}/{r.rate_type?.replace('per_', '')}</p>
                </div>
              ))}
              {(data.laborRates || laborRates).length === 0 && <p className="text-center text-gray-400 py-4 col-span-2">{t('mfgUi.cogm.emptyLabor')}</p>}
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
  const { t } = useTranslation();
  const handleSend = async (id: string) => {
    try {
      await api('subcontract-send', 'POST', { id }, 'advanced');
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  const handleReceive = async (id: string) => {
    const qty = prompt(t('mfgUi.subcontract.promptQty'));
    if (!qty) return;
    const rejected = prompt(t('mfgUi.subcontract.promptRej'), '0');
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
          <th className="text-left py-3 px-4">{t('mfgUi.subcontract.colNo')}</th><th className="text-left py-3 px-4">{t('mfgUi.subcontract.colVendor')}</th>
          <th className="text-left py-3 px-4">{t('mfgUi.subcontract.colOp')}</th><th className="text-left py-3 px-4">{t('mfgUi.subcontract.colProduct')}</th>
          <th className="text-right py-3 px-4">{t('mfgUi.subcontract.colQty')}</th><th className="text-right py-3 px-4">{t('mfgUi.subcontract.colRecv')}</th>
          <th className="text-right py-3 px-4">{t('mfgUi.subcontract.colCost')}</th><th className="text-left py-3 px-4">{t('mfgUi.subcontract.colStatus')}</th>
          <th className="text-left py-3 px-4">{t('mfgUi.subcontract.colReturn')}</th><th className="text-center py-3 px-4">{t('mfgUi.subcontract.colAction')}</th>
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
                  {sc.status === 'draft' && <button onClick={() => handleSend(sc.id)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title={t('mfgUi.subcontract.send')}><Truck className="w-4 h-4" /></button>}
                  {(sc.status === 'sent' || sc.status === 'in_process' || sc.status === 'partial_received') && <button onClick={() => handleReceive(sc.id)} className="p-1 hover:bg-green-100 rounded text-green-600" title={t('mfgUi.subcontract.receive')}><CheckCircle className="w-4 h-4" /></button>}
                </div>
              </td>
            </tr>
          ))}
          {subcontracts.length === 0 && <tr><td colSpan={10} className="py-12 text-center text-gray-400">{t('mfgUi.subcontract.empty')}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
