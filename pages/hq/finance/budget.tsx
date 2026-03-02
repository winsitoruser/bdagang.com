import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Link from 'next/link';
import {
  Target,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  ChevronLeft,
  Plus,
  Edit,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number;
  onTrackCategories: number;
  overBudgetCategories: number;
  underBudgetCategories: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  remaining: number;
  utilization: number;
  status: 'on_track' | 'warning' | 'over_budget' | 'under_budget';
  variance: number;
  lastMonth: number;
}

interface BranchBudget {
  id: string;
  name: string;
  code: string;
  totalBudget: number;
  spent: number;
  utilization: number;
  status: 'on_track' | 'warning' | 'over_budget';
}

const mockSummary: BudgetSummary = {
  totalBudget: 3400000000,
  totalSpent: 2884000000,
  totalRemaining: 516000000,
  utilizationRate: 85,
  onTrackCategories: 4,
  overBudgetCategories: 1,
  underBudgetCategories: 2
};

const mockCategories: BudgetCategory[] = [
  { id: '1', name: 'Cost of Goods Sold', budget: 1800000000, spent: 1586200000, remaining: 213800000, utilization: 88, status: 'on_track', variance: -213800000, lastMonth: 1520000000 },
  { id: '2', name: 'Payroll & Benefits', budget: 850000000, spent: 721000000, remaining: 129000000, utilization: 85, status: 'on_track', variance: -129000000, lastMonth: 695000000 },
  { id: '3', name: 'Utilities', budget: 280000000, spent: 230720000, remaining: 49280000, utilization: 82, status: 'on_track', variance: -49280000, lastMonth: 210000000 },
  { id: '4', name: 'Marketing', budget: 250000000, spent: 201880000, remaining: 48120000, utilization: 81, status: 'under_budget', variance: -48120000, lastMonth: 195000000 },
  { id: '5', name: 'Logistics', budget: 120000000, spent: 86520000, remaining: 33480000, utilization: 72, status: 'under_budget', variance: -33480000, lastMonth: 80000000 },
  { id: '6', name: 'Maintenance', budget: 100000000, spent: 57680000, remaining: 42320000, utilization: 58, status: 'under_budget', variance: -42320000, lastMonth: 52000000 }
];

const mockBranchBudgets: BranchBudget[] = [
  { id: '1', name: 'Cabang Pusat Jakarta', code: 'HQ-001', totalBudget: 1100000000, spent: 875000000, utilization: 80, status: 'on_track' },
  { id: '2', name: 'Cabang Bandung', code: 'BR-002', totalBudget: 800000000, spent: 644000000, utilization: 81, status: 'on_track' },
  { id: '3', name: 'Cabang Surabaya', code: 'BR-003', totalBudget: 650000000, spent: 546000000, utilization: 84, status: 'on_track' },
  { id: '4', name: 'Cabang Medan', code: 'BR-004', totalBudget: 500000000, spent: 455000000, utilization: 91, status: 'warning' },
  { id: '5', name: 'Cabang Yogyakarta', code: 'BR-005', totalBudget: 350000000, spent: 364000000, utilization: 104, status: 'over_budget' }
];

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}Jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export default function BudgetManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [summary, setSummary] = useState<BudgetSummary>(mockSummary);
  const [categories, setCategories] = useState<BudgetCategory[]>(mockCategories);
  const [branchBudgets, setBranchBudgets] = useState<BranchBudget[]>(mockBranchBudgets);
  const [viewMode, setViewMode] = useState<'category' | 'branch' | 'trend'>('category');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: 0,
    period: 'month' as 'month' | 'quarter' | 'year',
    branch: 'all',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/finance/budget?period=${period}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.summary) {
          setSummary({
            totalBudget: payload.summary.totalBudget || mockSummary.totalBudget,
            totalSpent: payload.summary.totalActual || mockSummary.totalSpent,
            totalRemaining: (payload.summary.totalBudget || 0) - (payload.summary.totalActual || 0),
            utilizationRate: payload.summary.totalBudget > 0 ? Math.round((payload.summary.totalActual / payload.summary.totalBudget) * 100) : 0,
            onTrackCategories: mockSummary.onTrackCategories,
            overBudgetCategories: mockSummary.overBudgetCategories,
            underBudgetCategories: mockSummary.underBudgetCategories
          });
        }
        if (payload.budgets && payload.budgets.length > 0) {
          const activeBudget = payload.budgets.find((b: any) => b.status === 'active') || payload.budgets[0];
          if (activeBudget?.branches?.length > 0) {
            setBranchBudgets(activeBudget.branches.map((b: any) => ({
              id: b.branchId || b.id, name: b.branchName, code: b.branchCode,
              totalBudget: b.totalBudget, spent: b.totalActual,
              utilization: b.totalBudget > 0 ? Math.round((b.totalActual / b.totalBudget) * 100) : 0,
              status: b.status || 'on_track'
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [period]);

  if (!mounted) return null;

  const budgetVsActualOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '70%' } },
    colors: ['#3B82F6', '#10B981'],
    xaxis: { labels: { formatter: (val) => formatCurrency(Number(val)) } },
    legend: { position: 'top' },
    dataLabels: { enabled: false }
  };

  const budgetVsActualSeries = [
    { name: 'Budget', data: categories.map(c => ({ x: c.name.substring(0, 15), y: c.budget })) },
    { name: 'Actual', data: categories.map(c => ({ x: c.name.substring(0, 15), y: c.spent })) }
  ];

  const monthlyTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: [2, 2, 0], dashArray: [5, 0, 0] },
    colors: ['#3B82F6', '#10B981', '#EF4444'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000) } },
    legend: { position: 'top' }
  };

  const monthlyTrendSeries = [
    { name: 'Budget', data: [2800, 2900, 3000, 3100, 3200, 3400], type: 'line' },
    { name: 'Actual', data: [2650, 2750, 2850, 2950, 2800, 2884], type: 'line' },
    { name: 'Variance', data: [150, 150, 150, 150, 400, 516], type: 'column' }
  ];

  const utilizationGaugeOptions: ApexCharts.ApexOptions = {
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: true, fontSize: '14px', color: '#64748b' },
          value: { show: true, fontSize: '24px', fontWeight: 'bold', color: '#1e293b', formatter: (val) => `${val}%` }
        },
        track: { background: '#e2e8f0' }
      }
    },
    colors: [summary.utilizationRate > 90 ? '#EF4444' : summary.utilizationRate > 75 ? '#F59E0B' : '#10B981'],
    labels: ['Utilization']
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />On Track</span>;
      case 'warning':
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" />Warning</span>;
      case 'over_budget':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><AlertTriangle className="w-3 h-3" />Over Budget</span>;
      case 'under_budget':
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"><TrendingDown className="w-3 h-3" />Under Budget</span>;
      default:
        return null;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'bg-red-500';
    if (utilization > 90) return 'bg-yellow-500';
    if (utilization > 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq/finance" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
              <p className="text-gray-500">Perencanaan dan monitoring anggaran</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="month">Bulan Ini</option>
              <option value="quarter">Kuartal Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Budget
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 opacity-80" />
              <p className="text-blue-100 text-sm">Total Budget</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
            <p className="text-blue-200 text-xs mt-1">Fiscal Period: Feb 2026</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.utilizationRate}% utilized</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalRemaining)}</p>
            <p className="text-xs text-gray-500 mt-1">{100 - summary.utilizationRate}% available</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Category Status</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" /> {summary.onTrackCategories}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {summary.overBudgetCategories}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 text-sm">
                    <TrendingDown className="w-4 h-4" /> {summary.underBudgetCategories}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Budget vs Actual by Category</h3>
            <Chart options={budgetVsActualOptions} series={budgetVsActualSeries} type="bar" height={300} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Overall Utilization</h3>
            <Chart options={utilizationGaugeOptions} series={[summary.utilizationRate]} type="radialBar" height={280} />
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setViewMode('category')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'category' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            By Category
          </button>
          <button
            onClick={() => setViewMode('branch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'branch' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Building2 className="w-4 h-4" />
            By Branch
          </button>
          <button
            onClick={() => setViewMode('trend')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'trend' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <TrendingUp className="w-4 h-4" />
            Trend
          </button>
        </div>

        {viewMode === 'category' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Utilization</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(cat.budget)}</td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(cat.spent)}</td>
                    <td className="px-5 py-4 text-right text-green-600">{formatCurrency(cat.remaining)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${getUtilizationColor(cat.utilization)}`} style={{ width: `${Math.min(cat.utilization, 100)}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{cat.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(cat.status)}</td>
                    <td className="px-5 py-4 text-center">
                      <button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'branch' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Budget</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Utilization</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branchBudgets.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{branch.name}</p>
                      <p className="text-xs text-gray-500">{branch.code}</p>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.totalBudget)}</td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(branch.spent)}</td>
                    <td className="px-5 py-4 text-right text-green-600">{formatCurrency(branch.totalBudget - branch.spent)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${getUtilizationColor(branch.utilization)}`} style={{ width: `${Math.min(branch.utilization, 100)}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{branch.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(branch.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'trend' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Budget vs Actual Trend</h3>
            <Chart options={monthlyTrendOptions} series={monthlyTrendSeries} type="line" height={350} />
          </div>
        )}

        {/* Create Budget Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create New Budget</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Category</option>
                    <option value="COGS">Cost of Goods Sold</option>
                    <option value="Payroll">Payroll & Benefits</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount (Rp) *</label>
                    <input
                      type="number"
                      value={newBudget.amount}
                      onChange={(e) => setNewBudget({ ...newBudget, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
                    <select
                      value={newBudget.period}
                      onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Yearly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select
                    value={newBudget.branch}
                    onChange={(e) => setNewBudget({ ...newBudget, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Branches</option>
                    <option value="HQ-001">Cabang Pusat Jakarta</option>
                    <option value="BR-002">Cabang Bandung</option>
                    <option value="BR-003">Cabang Surabaya</option>
                    <option value="BR-004">Cabang Medan</option>
                    <option value="BR-005">Cabang Yogyakarta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newBudget.notes}
                    onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Budget notes or description"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newCat: BudgetCategory = {
                      id: String(categories.length + 1),
                      name: newBudget.category,
                      budget: newBudget.amount,
                      spent: 0,
                      remaining: newBudget.amount,
                      utilization: 0,
                      status: 'on_track',
                      variance: -newBudget.amount,
                      lastMonth: 0
                    };
                    setCategories([...categories, newCat]);
                    setShowCreateModal(false);
                    setNewBudget({ category: '', amount: 0, period: 'month', branch: 'all', notes: '' });
                  }}
                  disabled={!newBudget.category || newBudget.amount <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Budget
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
