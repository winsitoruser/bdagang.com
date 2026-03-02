import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import { toast } from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Building2, DollarSign, ShoppingCart, Users,
  Target, Award, RefreshCw, Download, Calendar, ArrowUpRight, ArrowDownRight,
  Star, Medal, Crown, BarChart3, Filter, Heart, Activity, Gauge, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ComposedChart, Area, PieChart, Pie, Cell, AreaChart
} from 'recharts';

interface IndustryKpi {
  key: string; label: string; unit: string; value: number;
  target?: number; achievement?: number | null;
}

interface BranchPerformance {
  id: string;
  code: string;
  name: string;
  type?: string;
  city: string;
  manager: string;
  healthScore?: number;
  healthGrade?: string;
  metrics: {
    salesTarget: number; salesActual: number; achievement: number;
    transactions: number; avgTicket: number;
    grossProfit: number; grossMargin: number;
    netProfit: number; netMargin: number;
    employeeCount: number; employeeProductivity?: number;
    customerSatisfaction: number; stockTurnover: number;
  };
  growth: { sales: number; transactions: number; profit: number };
  industryKpis?: IndustryKpi[];
  rank: number;
  trend: 'up' | 'down' | 'stable';
  monthlyData?: { month: string; sales: number; target: number; profit: number }[];
}

const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'Umum' }, { value: 'fnb', label: 'F&B' },
  { value: 'retail', label: 'Retail' }, { value: 'logistics', label: 'Logistik' },
  { value: 'hospitality', label: 'Hospitality' }, { value: 'manufacturing', label: 'Manufaktur' },
  { value: 'finance', label: 'Finance' }, { value: 'workshop', label: 'Bengkel' },
  { value: 'pharmacy', label: 'Farmasi' }, { value: 'distributor', label: 'Distributor' },
  { value: 'rental', label: 'Rental' }, { value: 'property', label: 'Property' },
];

const PIE_COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BranchPerformancePage() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'week'>('month');
  const [industry, setIndustry] = useState('general');
  const [selectedBranch, setSelectedBranch] = useState<BranchPerformance | null>(null);
  const [subTab, setSubTab] = useState<'overview' | 'kpi' | 'comparison'>('overview');
  const [exporting, setExporting] = useState(false);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      // Try enhanced API first
      const res = await fetch(`/api/hq/branches/enhanced?action=performance&period=${period}&industry=${industry}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.branches?.length > 0) {
          setBranches(json.data.branches);
          return;
        }
      }
      // Fallback to original API
      const response = await fetch(`/api/hq/branches/performance?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data.data?.branches || data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = branches.map(b => ({
        Rank: b.rank, Code: b.code, Name: b.name, City: b.city, Manager: b.manager,
        'Sales Actual': b.metrics.salesActual, 'Sales Target': b.metrics.salesTarget,
        'Achievement %': b.metrics.achievement, Transactions: b.metrics.transactions,
        'Avg Ticket': b.metrics.avgTicket, 'Gross Margin %': b.metrics.grossMargin,
        'Net Margin %': b.metrics.netMargin, Satisfaction: b.metrics.customerSatisfaction,
        'Sales Growth %': b.growth.sales, Trend: b.trend,
        'Health Score': b.healthScore || '', 'Health Grade': b.healthGrade || '',
      }));
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h]}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `branch-performance-${period}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Data performa berhasil di-export');
    } catch { toast.error('Gagal export'); } finally { setExporting(false); }
  };

  useEffect(() => {
    setMounted(true);
    fetchPerformance();
  }, [period, industry]);

  if (!mounted) return null;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string, growth: number) => {
    if (trend === 'up' || growth > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down' || growth < 0) {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const totalStats = {
    totalSales: branches.reduce((sum, b) => sum + b.metrics.salesActual, 0),
    totalTarget: branches.reduce((sum, b) => sum + b.metrics.salesTarget, 0),
    avgAchievement: branches.length > 0 
      ? branches.reduce((sum, b) => sum + b.metrics.achievement, 0) / branches.length 
      : 0,
    onTarget: branches.filter(b => b.metrics.achievement >= 100).length,
    avgSatisfaction: branches.length > 0 
      ? branches.reduce((sum, b) => sum + b.metrics.customerSatisfaction, 0) / branches.length 
      : 0
  };

  const comparisonData = branches.map(b => ({
    name: b.name.replace('Cabang ', ''),
    sales: b.metrics.salesActual / 1000000,
    target: b.metrics.salesTarget / 1000000,
    achievement: b.metrics.achievement
  }));

  const radarData = branches.slice(0, 5).map(b => ({
    branch: b.name.replace('Cabang ', ''),
    sales: b.metrics.achievement,
    profit: (b.metrics.netMargin / 25) * 100,
    satisfaction: (b.metrics.customerSatisfaction / 5) * 100,
    growth: Math.max(0, b.growth.sales + 50),
    efficiency: (b.metrics.stockTurnover / 15) * 100
  }));

  const getHealthColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getHealthBg = (s: number) => s >= 80 ? 'bg-green-100' : s >= 60 ? 'bg-yellow-100' : 'bg-red-100';

  // Achievement distribution for PieChart
  const achievementDist = [
    { name: 'Exceed (>110%)', value: branches.filter(b => b.metrics.achievement > 110).length },
    { name: 'On Target (100-110%)', value: branches.filter(b => b.metrics.achievement >= 100 && b.metrics.achievement <= 110).length },
    { name: 'Near (80-99%)', value: branches.filter(b => b.metrics.achievement >= 80 && b.metrics.achievement < 100).length },
    { name: 'Below (<80%)', value: branches.filter(b => b.metrics.achievement < 80).length },
  ].filter(d => d.value > 0);

  return (
    <HQLayout title="Performa Cabang" subtitle="Analisis kinerja multi-industri">
      <div className="space-y-6">
        {/* Header with Period + Industry + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
              {([{ v: 'week', l: 'Minggu' }, { v: 'month', l: 'Bulan' }, { v: 'quarter', l: 'Kuartal' }, { v: 'year', l: 'Tahun' }] as { v: typeof period; l: string }[]).map(p => (
                <button key={p.v} onClick={() => setPeriod(p.v)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${period === p.v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p.l}</button>
              ))}
            </div>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchPerformance} disabled={loading} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} /> Export
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {[{ v: 'overview' as const, l: 'Overview', icon: BarChart3 }, { v: 'kpi' as const, l: 'Industry KPI', icon: Gauge }, { v: 'comparison' as const, l: 'Comparison', icon: Activity }].map(t => (
            <button key={t.v} onClick={() => setSubTab(t.v)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${subTab === t.v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <t.icon className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Total Sales</span></div>
            <p className="text-xl font-bold">{formatCurrency(totalStats.totalSales)}</p>
            <p className="text-xs opacity-70">Target: {formatCurrency(totalStats.totalTarget)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Target className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Achievement</span></div>
            <p className="text-xl font-bold">{totalStats.avgAchievement.toFixed(1)}%</p>
            <p className="text-xs opacity-70">{totalStats.onTarget}/{branches.length} on target</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Cabang</span></div>
            <p className="text-xl font-bold">{branches.length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><ShoppingCart className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Transaksi</span></div>
            <p className="text-xl font-bold">{branches.reduce((s, b) => s + b.metrics.transactions, 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Star className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Satisfaction</span></div>
            <p className="text-xl font-bold">{totalStats.avgSatisfaction.toFixed(1)}/5</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2"><Heart className="w-5 h-5 opacity-80" /><span className="text-sm opacity-80">Avg Health</span></div>
            <p className="text-xl font-bold">{branches.length > 0 ? Math.round(branches.reduce((s, b) => s + (b.healthScore || 0), 0) / branches.length) : 0}</p>
          </div>
        </div>

        {/* ═══ Overview Sub-Tab ═══ */}
        {subTab === 'overview' && (<>
          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3">Sales vs Target (Juta)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(0)} Jt`, '']} /><Legend />
                    <Bar dataKey="sales" name="Aktual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="achievement" name="Achievement %" stroke="#10B981" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Achievement Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={achievementDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {achievementDist.map((_, i) => <Cell key={i} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][i]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Radar Performa (Top 5)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid /><PolarAngleAxis dataKey="branch" tick={{ fontSize: 11 }} /><PolarRadiusAxis angle={30} domain={[0, 120]} tick={{ fontSize: 10 }} />
                  <Radar name="Sales" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="Profit" dataKey="profit" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Radar name="Satisfaction" dataKey="satisfaction" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Ranking Performa Cabang</h3></div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-center py-3 px-3 font-medium text-gray-500 w-14">Rank</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Cabang</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Sales</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Achievement</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Growth</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Margin</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Satisfaction</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Health</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Trend</th>
                  </tr></thead>
                  <tbody>
                    {[...branches].sort((a, b) => a.rank - b.rank).map(branch => (
                      <tr key={branch.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${branch.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}`} onClick={() => setSelectedBranch(branch)}>
                        <td className="py-3 px-3 text-center">{getRankIcon(branch.rank)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg"><Building2 className="w-4 h-4 text-blue-600" /></div>
                            <div><p className="font-medium text-gray-900 text-sm">{branch.name}</p><p className="text-xs text-gray-500">{branch.code} • {branch.manager}</p></div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right"><p className="font-medium text-sm">{formatCurrency(branch.metrics.salesActual)}</p><p className="text-xs text-gray-400">T: {formatCurrency(branch.metrics.salesTarget)}</p></td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${branch.metrics.achievement >= 100 ? 'bg-green-500' : branch.metrics.achievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(branch.metrics.achievement, 100)}%` }} /></div>
                            <span className={`font-bold text-xs ${branch.metrics.achievement >= 100 ? 'text-green-600' : 'text-gray-600'}`}>{branch.metrics.achievement}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${branch.growth.sales >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {getTrendIcon(branch.trend, branch.growth.sales)}{branch.growth.sales >= 0 ? '+' : ''}{branch.growth.sales}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center"><span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">{branch.metrics.netMargin?.toFixed?.(0) || branch.metrics.netMargin}%</span></td>
                        <td className="py-3 px-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /><span className="text-sm font-medium">{typeof branch.metrics.customerSatisfaction === 'number' ? branch.metrics.customerSatisfaction.toFixed(1) : branch.metrics.customerSatisfaction}</span></div></td>
                        <td className="py-3 px-3 text-center">
                          {branch.healthScore ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getHealthBg(branch.healthScore)} ${getHealthColor(branch.healthScore)}`}>{branch.healthGrade}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {branch.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : branch.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500 mx-auto" /> : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Branch Detail Chart */}
          {selectedBranch && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedBranch.name} — Detail</h3>
                  <p className="text-sm text-gray-500">Manager: {selectedBranch.manager} • Health: <span className={`font-bold ${getHealthColor(selectedBranch.healthScore || 0)}`}>{selectedBranch.healthGrade || '?'} ({selectedBranch.healthScore || 0})</span></p>
                </div>
                <button onClick={() => setSelectedBranch(null)} className="text-sm text-gray-400 hover:text-gray-700">Tutup</button>
              </div>
              {selectedBranch.monthlyData && selectedBranch.monthlyData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={selectedBranch.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend />
                      <Area type="monotone" dataKey="sales" name="Sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                      <Line type="monotone" dataKey="target" name="Target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
                      <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-blue-600">Sales</p><p className="text-lg font-bold text-blue-900">{formatCurrency(selectedBranch.metrics.salesActual)}</p></div>
                  <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600">Achievement</p><p className="text-lg font-bold text-green-900">{selectedBranch.metrics.achievement}%</p></div>
                  <div className="bg-purple-50 rounded-lg p-3"><p className="text-xs text-purple-600">Margin</p><p className="text-lg font-bold text-purple-900">{selectedBranch.metrics.netMargin?.toFixed?.(1) || selectedBranch.metrics.netMargin}%</p></div>
                  <div className="bg-orange-50 rounded-lg p-3"><p className="text-xs text-orange-600">Growth</p><p className="text-lg font-bold text-orange-900">{selectedBranch.growth.sales >= 0 ? '+' : ''}{selectedBranch.growth.sales}%</p></div>
                </div>
              )}
            </div>
          )}
        </>)}

        {/* ═══ Industry KPI Sub-Tab ═══ */}
        {subTab === 'kpi' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700"><strong>Industry KPI — {INDUSTRY_OPTIONS.find(i => i.value === industry)?.label}</strong>: KPI di bawah ini disesuaikan dengan industri yang dipilih. Ubah industri di header untuk melihat KPI spesifik industri lain.</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : branches.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Tidak ada data</div>
            ) : (
              <div className="space-y-4">
                {branches.map(branch => (
                  <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                          <p className="text-xs text-gray-500">#{branch.rank} • {branch.code} • {branch.manager}</p>
                        </div>
                      </div>
                      {branch.healthScore !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getHealthBg(branch.healthScore)} ${getHealthColor(branch.healthScore)}`}>{branch.healthGrade} ({branch.healthScore})</span>
                      )}
                    </div>
                    {branch.industryKpis && branch.industryKpis.length > 0 ? (
                      <div className="grid grid-cols-5 gap-3">
                        {branch.industryKpis.map((kpi: IndustryKpi) => (
                          <div key={kpi.key} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                            <p className="text-lg font-bold text-gray-900">
                              {kpi.unit === 'currency' ? formatCurrency(kpi.value) : kpi.unit === '%' ? `${kpi.value.toFixed(1)}%` : kpi.unit === 'score' ? kpi.value.toFixed(1) : Math.round(kpi.value)}
                              {kpi.unit !== 'currency' && kpi.unit !== '%' && kpi.unit !== 'score' && <span className="text-xs text-gray-400 ml-1">{kpi.unit}</span>}
                            </p>
                            {kpi.target && (
                              <div className="mt-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">Target: {kpi.target}{kpi.unit === '%' ? '%' : ''}</span>
                                  {kpi.achievement !== null && kpi.achievement !== undefined && (
                                    <span className={`font-medium ${kpi.achievement >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>{Math.round(kpi.achievement)}%</span>
                                  )}
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                  <div className={`h-full rounded-full ${(kpi.achievement || 0) >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(kpi.achievement || 0, 100)}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Pilih industri spesifik untuk melihat KPI.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ Comparison Sub-Tab ═══ */}
        {subTab === 'comparison' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Growth Comparison */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Sales Growth Comparison (%)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branches.map(b => ({ name: b.name.replace('Cabang ', '').substring(0, 12), sales: b.growth.sales, tx: b.growth.transactions, profit: b.growth.profit }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip /><Legend />
                      <Bar dataKey="sales" name="Sales %" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="profit" name="Profit %" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Margin Comparison */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Margin & Efficiency</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branches.map(b => ({ name: b.name.replace('Cabang ', '').substring(0, 12), gross: b.metrics.grossMargin, net: b.metrics.netMargin, turnover: b.metrics.stockTurnover }))}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                      <Tooltip /><Legend />
                      <Bar dataKey="gross" name="Gross Margin %" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net Margin %" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Satisfaction & Health Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Performance Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="py-2 px-3 text-left font-medium text-gray-500">Cabang</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Achievement</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Growth</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Gross %</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Net %</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Satisfaction</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Turnover</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500">Health</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...branches].sort((a, b) => a.rank - b.rank).map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{b.name}</td>
                        <td className="py-2 px-3 text-center"><span className={`font-bold ${b.metrics.achievement >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>{b.metrics.achievement}%</span></td>
                        <td className="py-2 px-3 text-center"><span className={b.growth.sales >= 0 ? 'text-green-600' : 'text-red-600'}>{b.growth.sales >= 0 ? '+' : ''}{b.growth.sales}%</span></td>
                        <td className="py-2 px-3 text-center">{typeof b.metrics.grossMargin === 'number' ? b.metrics.grossMargin.toFixed(1) : b.metrics.grossMargin}%</td>
                        <td className="py-2 px-3 text-center">{typeof b.metrics.netMargin === 'number' ? b.metrics.netMargin.toFixed(1) : b.metrics.netMargin}%</td>
                        <td className="py-2 px-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{typeof b.metrics.customerSatisfaction === 'number' ? b.metrics.customerSatisfaction.toFixed(1) : b.metrics.customerSatisfaction}</div></td>
                        <td className="py-2 px-3 text-center">{typeof b.metrics.stockTurnover === 'number' ? b.metrics.stockTurnover.toFixed(1) : b.metrics.stockTurnover}x</td>
                        <td className="py-2 px-3 text-center">{b.healthScore ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getHealthBg(b.healthScore)} ${getHealthColor(b.healthScore)}`}>{b.healthGrade}</span> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
