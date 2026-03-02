import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { toast } from 'react-hot-toast';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, Download,
  RefreshCw, Building2, Users, Package, Target, Award, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Eye, Layers, Activity, Zap, Truck, Heart, Shield,
  FileText, Star, CircleDot
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ConsolidatedData {
  period: string;
  totalRevenue: number;
  totalTransactions: number;
  avgTicketSize: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  totalBranches: number;
  activeBranches: number;
  totalEmployees: number;
  activeEmployees: number;
  stockValue: number;
  lowStockAlerts: number;
}

interface BranchPerformance {
  branchId: string;
  branchName: string;
  branchCode: string;
  revenue: number;
  transactions: number;
  avgTicket: number;
  profit: number;
  margin: number;
  growth: number;
  rank: number;
  target: number;
  achievement: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ConsolidatedReport() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Enhanced state
  const [subTab, setSubTab] = useState<'overview' | 'cross-module' | 'trends' | 'executive' | 'health'>('overview');
  const [crossModuleKPIs, setCrossModuleKPIs] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [moduleHealth, setModuleHealth] = useState<any[]>([]);
  const [chartTrendData, setChartTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consolidatedRes, kpiRes] = await Promise.all([
        fetch(`/api/admin/reports/consolidated?period=${period}`),
        fetch('/api/hq/reports/enhanced?action=cross-module-kpis')
      ]);
      if (consolidatedRes.ok) {
        const result = await consolidatedRes.json();
        setData(result.data || null);
        setBranchPerformance(result.branches || []);
      }
      if (kpiRes.ok) {
        const kd = await kpiRes.json();
        setCrossModuleKPIs(kd.data || null);
      }
    } catch (error) {
      console.error('Error fetching consolidated data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await fetch('/api/hq/reports/enhanced?action=trend-analysis');
      if (res.ok) { const d = await res.json(); setTrendData(d.data || null); }
    } catch (e) { console.error('Trend fetch error:', e); }
  };

  const fetchExecutive = async () => {
    try {
      const res = await fetch('/api/hq/reports/enhanced?action=executive-summary');
      if (res.ok) { const d = await res.json(); setExecutiveSummary(d.data || null); }
    } catch (e) { console.error('Executive fetch error:', e); }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/hq/reports/enhanced?action=module-health');
      if (res.ok) { const d = await res.json(); setModuleHealth(d.data || []); }
    } catch (e) { console.error('Health fetch error:', e); }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [period]);

  useEffect(() => {
    if (subTab === 'trends' && !trendData) fetchTrends();
    else if (subTab === 'executive' && !executiveSummary) fetchExecutive();
    else if (subTab === 'health' && moduleHealth.length === 0) fetchHealth();
  }, [subTab]);

  if (!mounted) {
    return (
      <HQLayout title="Laporan Konsolidasi" subtitle="Laporan gabungan seluruh cabang">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </HQLayout>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const exportReport = () => {
    const header = 'Rank,Branch,Code,Revenue,Transactions,AvgTicket,Profit,Margin,Growth,Achievement';
    const rows = branchPerformance.map(b => `${b.rank},${b.branchName},${b.branchCode},${b.revenue},${b.transactions},${b.avgTicket},${b.profit},${b.margin},${b.growth},${b.achievement}`);
    const csv = `${header}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidated-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export laporan konsolidasi berhasil');
  };

  const radarData = branchPerformance.slice(0, 5).map(b => ({
    branch: b.branchName.replace('Cabang ', ''),
    revenue: (b.revenue / 1000000000) * 100,
    transactions: (b.transactions / 50) ,
    margin: b.margin * 5,
    growth: Math.max(0, b.growth * 10),
    achievement: b.achievement
  }));

  if (loading || !data) {
    return (
      <HQLayout title="Laporan Konsolidasi" subtitle="Laporan gabungan seluruh cabang">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </HQLayout>
    );
  }

  return (
    <HQLayout title="Laporan Konsolidasi" subtitle={`Periode: ${data.period}`}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            {(['month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === 'month' ? 'Bulan Ini' : p === 'quarter' ? 'Kuartal' : 'Tahun'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {([
            { v: 'overview' as const, l: 'Overview', icon: Eye },
            { v: 'cross-module' as const, l: 'Cross-Module KPIs', icon: Layers },
            { v: 'trends' as const, l: 'Trend Analysis', icon: Activity },
            { v: 'executive' as const, l: 'Executive Summary', icon: Star },
            { v: 'health' as const, l: 'Module Health', icon: Heart },
          ]).map(t => (
            <button key={t.v} onClick={() => setSubTab(t.v)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${subTab === t.v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <t.icon className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>

        {subTab === 'overview' && (<>
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                +8.5%
              </span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p>
            <p className="text-blue-100 mt-1">Total Revenue</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{data.netMargin}%</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(data.netProfit)}</p>
            <p className="text-green-100 mt-1">Net Profit</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                +5.2%
              </span>
            </div>
            <p className="text-3xl font-bold">{data.totalTransactions.toLocaleString()}</p>
            <p className="text-purple-100 mt-1">Total Transaksi</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(data.avgTicketSize)}</p>
            <p className="text-orange-100 mt-1">Avg Ticket Size</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Cabang Aktif</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.activeBranches}/{data.totalBranches}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Karyawan</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.activeEmployees}/{data.totalEmployees}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-sm">Nilai Stok</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(data.stockValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Gross Margin</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{data.grossMargin}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Net Margin</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{data.netMargin}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{data.lowStockAlerts}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Trend Revenue vs Target (Juta)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`Rp ${value} Jt`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Distribusi Penjualan per Kategori</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string, props: any) => [
                    `${value}% - ${formatCurrency(props.payload.revenue)}`, 'Kontribusi'
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Branch Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Performa Cabang</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-center py-3 px-4 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Cabang</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Transaksi</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Avg Ticket</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Profit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Growth</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Achievement</th>
                </tr>
              </thead>
              <tbody>
                {branchPerformance.map((branch, index) => (
                  <tr key={branch.branchId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">
                      {index < 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-gray-500">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{branch.branchName}</p>
                          <p className="text-sm text-gray-500">{branch.branchCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(branch.revenue)}</td>
                    <td className="py-3 px-4 text-center">{branch.transactions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(branch.avgTicket)}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(branch.profit)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        branch.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(branch.growth)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${branch.achievement >= 100 ? 'bg-green-500' : branch.achievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(branch.achievement, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${branch.achievement >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                          {branch.achievement}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Ringkasan Eksekutif</h3>
              <p className="text-blue-100">
                Total revenue {data.period} mencapai {formatCurrency(data.totalRevenue)} dengan {data.totalTransactions.toLocaleString()} transaksi. 
                Net profit margin {data.netMargin}% dengan {branchPerformance.filter(b => b.achievement >= 100).length} dari {branchPerformance.length} cabang mencapai target.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{branchPerformance.filter(b => b.achievement >= 100).length}</p>
                <p className="text-sm text-blue-200">Cabang On Target</p>
              </div>
              <div className="w-px h-12 bg-white/30" />
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(branchPerformance.reduce((s, b) => s + b.achievement, 0) / branchPerformance.length)}%</p>
                <p className="text-sm text-blue-200">Avg Achievement</p>
              </div>
            </div>
          </div>
        </div>
        </>)}

        {/* ─── Cross-Module KPIs Tab ─── */}
        {subTab === 'cross-module' && crossModuleKPIs && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-indigo-700"><strong>Cross-Module KPIs</strong>: Ringkasan KPI dari seluruh modul ERP dalam satu tampilan.</p>
            </div>

            {/* Sales KPIs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Sales</h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Revenue MTD</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(crossModuleKPIs.sales.revenueMTD)}</p>
                  <p className={`text-xs ${crossModuleKPIs.sales.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{crossModuleKPIs.sales.revenueGrowth >= 0 ? '+' : ''}{crossModuleKPIs.sales.revenueGrowth}% MoM</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Transactions</p>
                  <p className="text-xl font-bold text-gray-900">{crossModuleKPIs.sales.totalTransactions.toLocaleString()}</p>
                  <p className={`text-xs ${crossModuleKPIs.sales.transactionsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{crossModuleKPIs.sales.transactionsGrowth >= 0 ? '+' : ''}{crossModuleKPIs.sales.transactionsGrowth}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Avg Ticket</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(crossModuleKPIs.sales.avgTicketSize)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Conversion</p>
                  <p className="text-xl font-bold text-blue-600">{crossModuleKPIs.sales.conversionRate}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Returns Rate</p>
                  <p className="text-xl font-bold text-orange-600">{crossModuleKPIs.sales.returnsRate}%</p>
                </div>
              </div>
            </div>

            {/* Finance KPIs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Finance</h3>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Gross Profit', value: formatCurrency(crossModuleKPIs.finance.grossProfit), sub: `${crossModuleKPIs.finance.grossMargin}% margin` },
                  { label: 'Net Profit', value: formatCurrency(crossModuleKPIs.finance.netProfit), sub: `${crossModuleKPIs.finance.netMargin}% margin` },
                  { label: 'OpEx', value: formatCurrency(crossModuleKPIs.finance.operatingExpenses), sub: `${crossModuleKPIs.finance.expenseRatio}% ratio` },
                  { label: 'Cash Flow', value: formatCurrency(crossModuleKPIs.finance.cashFlow), sub: `+${crossModuleKPIs.finance.cashFlowGrowth}%` },
                  { label: 'AR / AP', value: `${formatCurrency(crossModuleKPIs.finance.accountsReceivable)}`, sub: `AP: ${formatCurrency(crossModuleKPIs.finance.accountsPayable)}` },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">{k.label}</p>
                    <p className="text-lg font-bold text-gray-900">{k.value}</p>
                    <p className="text-xs text-gray-400">{k.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory KPIs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Inventory</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Stock Value', value: formatCurrency(crossModuleKPIs.inventory.totalStockValue), color: 'text-gray-900' },
                  { label: 'Turnover', value: `${crossModuleKPIs.inventory.stockTurnover}x`, color: 'text-blue-600' },
                  { label: 'Fill Rate', value: `${crossModuleKPIs.inventory.fillRate}%`, color: 'text-green-600' },
                  { label: 'Days on Hand', value: `${crossModuleKPIs.inventory.daysOnHand}`, color: 'text-purple-600' },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">{k.label}</p>
                    <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div><p className="text-sm font-medium text-yellow-800">{crossModuleKPIs.inventory.lowStockAlerts} Low Stock</p></div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div><p className="text-sm font-medium text-red-800">{crossModuleKPIs.inventory.outOfStock} Out of Stock</p></div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-500" />
                  <div><p className="text-sm font-medium text-gray-700">{crossModuleKPIs.inventory.deadStock} Dead Stock</p></div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  <div><p className="text-sm font-medium text-orange-800">{crossModuleKPIs.inventory.shrinkageRate}% Shrinkage</p></div>
                </div>
              </div>
            </div>

            {/* Procurement KPIs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Procurement</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total POs', value: crossModuleKPIs.procurement.totalPOs, sub: `${crossModuleKPIs.procurement.activePOs} active` },
                  { label: 'Total Spend', value: formatCurrency(crossModuleKPIs.procurement.totalSpend), sub: `MTD: ${formatCurrency(crossModuleKPIs.procurement.spendMTD)}` },
                  { label: 'On-Time Delivery', value: `${crossModuleKPIs.procurement.onTimeDelivery}%`, sub: `${crossModuleKPIs.procurement.activeSuppliers} suppliers` },
                  { label: 'Avg Lead Time', value: `${crossModuleKPIs.procurement.avgLeadTime} hari`, sub: `Fulfillment: ${crossModuleKPIs.procurement.fulfillmentRate}%` },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">{k.label}</p>
                    <p className="text-xl font-bold text-gray-900">{k.value}</p>
                    <p className="text-xs text-gray-400">{k.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* HR & Branches */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> HR</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Employees', value: `${crossModuleKPIs.hr.activeEmployees}/${crossModuleKPIs.hr.totalEmployees}` },
                    { label: 'Attendance', value: `${crossModuleKPIs.hr.attendanceRate}%` },
                    { label: 'Turnover', value: `${crossModuleKPIs.hr.turnoverRate}%` },
                  ].map(k => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">{k.label}</p>
                      <p className="text-lg font-bold text-gray-900">{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> Branches</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active', value: `${crossModuleKPIs.branches.activeBranches}/${crossModuleKPIs.branches.totalBranches}` },
                    { label: 'On Target', value: `${crossModuleKPIs.branches.onTargetBranches}` },
                    { label: 'Avg Achievement', value: `${crossModuleKPIs.branches.avgAchievement}%` },
                  ].map(k => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">{k.label}</p>
                      <p className="text-lg font-bold text-gray-900">{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => {
              const lines: string[] = ['Module,Metric,Value'];
              if (crossModuleKPIs) {
                for (const [mod, metrics] of Object.entries(crossModuleKPIs)) {
                  for (const [key, val] of Object.entries(metrics as Record<string, any>)) {
                    lines.push(`${mod},${key},${val}`);
                  }
                }
              }
              const csv = lines.join('\n');
              const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'cross-module-kpis.csv'; a.click(); URL.revokeObjectURL(url);
              toast.success('Export Cross-Module KPIs berhasil');
            }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Download className="w-4 h-4" /> Export KPIs
            </button>
          </div>
        )}

        {/* ─── Trend Analysis Tab ─── */}
        {subTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700"><strong>Trend Analysis</strong>: Analisis tren 6 bulan terakhir dari seluruh modul.</p>
            </div>
            {trendData ? (
              <>
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Revenue, Profit & Expenses Trend (Juta)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData.revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => [`${value} Jt`, '']} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="target" name="Target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Inventory Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Inventory Health Trend</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData.inventoryTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="stockValue" name="Stock Value (Jt)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="turnover" name="Turnover" stroke="#F59E0B" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Procurement Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Procurement Spend & On-Time Rate</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData.procurementTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" domain={[80, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="spend" name="Spend (Jt)" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="onTimeRate" name="On-Time %" stroke="#EF4444" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* HR Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">HR: Headcount, Attendance & Productivity</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData.hrTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="headcount" name="Headcount" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="productivity" name="Productivity" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Loading trend data...</div>
            )}
          </div>
        )}

        {/* ─── Executive Summary Tab ─── */}
        {subTab === 'executive' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-700"><strong>Executive Summary</strong>: Ringkasan eksekutif, highlights, rekomendasi, dan scorecard per modul.</p>
            </div>
            {executiveSummary ? (
              <>
                {/* Scorecard */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Module Scorecard</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Overall Score:</span>
                      <span className={`text-2xl font-bold ${executiveSummary.scorecard.overallScore >= 85 ? 'text-green-600' : executiveSummary.scorecard.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {executiveSummary.scorecard.overallScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-4">
                    {executiveSummary.scorecard.modules.map((m: any) => (
                      <div key={m.name} className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-lg font-bold text-white ${
                          m.score >= 85 ? 'bg-green-500' : m.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {m.score}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-2">{m.name}</p>
                        <p className={`text-xs ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                          {m.trend === 'up' ? '↑ Improving' : m.trend === 'down' ? '↓ Declining' : '→ Stable'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Module Performance Radar</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={executiveSummary.scorecard.modules.map((m: any) => ({ module: m.name, score: m.score }))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="module" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Highlights */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Highlights</h3>
                  <div className="space-y-3">
                    {executiveSummary.highlights.map((h: any, i: number) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                        h.type === 'positive' ? 'bg-green-50 border border-green-200' :
                        h.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        {h.type === 'positive' ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" /> :
                         h.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" /> :
                         <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{h.module}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.impact === 'high' ? 'bg-red-100 text-red-700' : h.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{h.impact}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{h.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Rekomendasi Aksi</h3>
                  <div className="space-y-3">
                    {executiveSummary.recommendations.map((r: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          r.priority === 'high' ? 'bg-red-100 text-red-700' :
                          r.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{r.priority.toUpperCase()}</span>
                        <div>
                          <p className="text-sm text-gray-700">{r.action}</p>
                          <p className="text-xs text-gray-400 mt-1">Module: {r.module}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Loading executive summary...</div>
            )}
          </div>
        )}

        {/* ─── Module Health Tab ─── */}
        {subTab === 'health' && (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-sm text-teal-700"><strong>Module Health</strong>: Status uptime, latency, dan error rate setiap modul sistem.</p>
            </div>
            {moduleHealth.length > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Modules</p>
                    <p className="text-2xl font-bold text-gray-900">{moduleHealth.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Healthy</p>
                    <p className="text-2xl font-bold text-green-600">{moduleHealth.filter(m => m.status === 'healthy').length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Avg Uptime</p>
                    <p className="text-2xl font-bold text-blue-600">{(moduleHealth.reduce((s, m) => s + m.uptime, 0) / moduleHealth.length).toFixed(2)}%</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Avg Latency</p>
                    <p className="text-2xl font-bold text-purple-600">{Math.round(moduleHealth.reduce((s, m) => s + m.latency, 0) / moduleHealth.length)}ms</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Uptime</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Latency</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Last Incident</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {moduleHealth.map((m: any) => (
                          <tr key={m.module} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{m.module}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                m.status === 'healthy' ? 'bg-green-100 text-green-700' :
                                m.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                <CircleDot className="w-3 h-3" />
                                {m.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-medium ${m.uptime >= 99.8 ? 'text-green-600' : m.uptime >= 99.5 ? 'text-yellow-600' : 'text-red-600'}`}>{m.uptime}%</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-medium ${m.latency <= 120 ? 'text-green-600' : m.latency <= 160 ? 'text-yellow-600' : 'text-red-600'}`}>{m.latency}ms</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-medium ${m.errorRate <= 0.5 ? 'text-green-600' : m.errorRate <= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>{m.errorRate}%</span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-500">{m.lastIncident || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Uptime bar chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Uptime by Module</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleHealth} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[99, 100]} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="module" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip />
                        <Bar dataKey="uptime" name="Uptime %" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Loading module health data...</div>
            )}
          </div>
        )}
      </div>
    </HQLayout>
  );
}
