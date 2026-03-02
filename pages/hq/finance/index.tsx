import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  FileText,
  Receipt,
  Banknote,
  CircleDollarSign,
  ArrowRightLeft,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  cashOnHand: number;
  accountsReceivable: number;
  accountsPayable: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyGrowth: number;
  yearlyGrowth: number;
}

interface BranchFinance {
  id: string;
  name: string;
  code: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  growth: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  branch: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

const defaultFinSummary: FinanceSummary = { totalRevenue: 0, totalExpenses: 0, grossProfit: 0, netProfit: 0, grossMargin: 0, netMargin: 0, cashOnHand: 0, accountsReceivable: 0, accountsPayable: 0, pendingInvoices: 0, overdueInvoices: 0, monthlyGrowth: 0, yearlyGrowth: 0 };

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}Jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatFullCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export default function HQFinanceDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [summary, setSummary] = useState<FinanceSummary>(defaultFinSummary);
  const [branchFinance, setBranchFinance] = useState<BranchFinance[]>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [allBranches, setAllBranches] = useState<{id: string, name: string, code: string}[]>([]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/hq/branches?limit=100');
      if (response.ok) {
        const json = await response.json();
        const bp = json.data || json;
        setAllBranches(bp.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const branchParam = selectedBranch !== 'all' ? `&branchId=${selectedBranch}` : '';
      const response = await fetch(`/api/hq/finance/summary?period=${period}${branchParam}`);
      if (response.ok) {
        const json2 = await response.json();
        const payload = json2.data || json2;
        if (payload.summary) setSummary(payload.summary);
        if (payload.branches) setBranchFinance(payload.branches);
        if (payload.transactions) setTransactions(payload.transactions);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBranches();
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [period, selectedBranch]);

  if (!mounted) return null;

  const revenueChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ['#3B82F6', '#10B981'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], labels: { style: { colors: '#64748b' } } },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000), style: { colors: '#64748b' } } },
    tooltip: { y: { formatter: (val) => formatFullCurrency(val * 1000000) } },
    legend: { position: 'top' }
  };

  const revenueChartSeries = [
    { name: 'Revenue', data: [3200, 3450, 3680, 4200, 3900, 4120] },
    { name: 'Profit', data: [640, 690, 736, 840, 780, 824] }
  ];

  const expenseChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: ['COGS', 'Payroll', 'Utilities', 'Marketing', 'Other'],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` }
  };

  const expenseChartSeries = [55, 25, 8, 7, 5];

  const branchChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    colors: ['#3B82F6'],
    xaxis: { labels: { formatter: (val) => formatCurrency(Number(val)) } },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    tooltip: { y: { formatter: (val) => formatFullCurrency(val) } }
  };

  const branchChartSeries = [{
    name: 'Revenue',
    data: branchFinance.map(b => ({ x: b.code, y: b.revenue }))
  }];

  const cashFlowOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    colors: ['#10B981', '#EF4444'],
    xaxis: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
    yaxis: { labels: { formatter: (val) => formatCurrency(Math.abs(val) * 1000000) } },
    legend: { position: 'top' }
  };

  const cashFlowSeries = [
    { name: 'Cash In', data: [850, 920, 780, 1050] },
    { name: 'Cash Out', data: [-650, -720, -580, -820] }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700';
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600 bg-green-50';
      case 'expense': return 'text-red-600 bg-red-50';
      case 'transfer': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const quickLinks = [
    { icon: TrendingUp, label: 'Revenue Analysis', href: '/hq/finance/revenue', color: 'bg-blue-500' },
    { icon: TrendingDown, label: 'Expense Management', href: '/hq/finance/expenses', color: 'bg-red-500' },
    { icon: FileText, label: 'Profit & Loss', href: '/hq/finance/profit-loss', color: 'bg-green-500' },
    { icon: ArrowRightLeft, label: 'Cash Flow', href: '/hq/finance/cash-flow', color: 'bg-purple-500' },
    { icon: Receipt, label: 'Invoices', href: '/hq/finance/invoices', color: 'bg-orange-500' },
    { icon: Banknote, label: 'Accounts', href: '/hq/finance/accounts', color: 'bg-cyan-500' },
    { icon: Calculator, label: 'Budget', href: '/hq/finance/budget', color: 'bg-indigo-500' },
    { icon: Target, label: 'Tax Reports', href: '/hq/finance/tax', color: 'bg-pink-500' }
  ];

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
            <p className="text-gray-500">Overview keuangan global perusahaan</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Cabang</option>
              {allBranches.length > 0 ? (
                allBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))
              ) : (
                branchFinance.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))
              )}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="quarter">Kuartal Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-8 gap-3">
          {quickLinks.map((link, idx) => (
            <Link key={idx} href={link.href}>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center mb-2`}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {summary.monthlyGrowth}%
              </span>
            </div>
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-blue-200 text-xs mt-1">YoY: +{summary.yearlyGrowth}%</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{summary.netMargin}%</span>
            </div>
            <p className="text-green-100 text-sm">Net Profit</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.netProfit)}</p>
            <p className="text-green-200 text-xs mt-1">Gross: {formatCurrency(summary.grossProfit)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Wallet className="w-8 h-8 opacity-80" />
              <CheckCircle className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-purple-100 text-sm">Cash on Hand</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.cashOnHand)}</p>
            <p className="text-purple-200 text-xs mt-1">Available balance</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Receipt className="w-8 h-8 opacity-80" />
              {summary.overdueInvoices > 0 && (
                <span className="flex items-center text-sm bg-red-500 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {summary.overdueInvoices}
                </span>
              )}
            </div>
            <p className="text-orange-100 text-sm">Pending Invoices</p>
            <p className="text-2xl font-bold">{summary.pendingInvoices}</p>
            <p className="text-orange-200 text-xs mt-1">{summary.overdueInvoices} overdue</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalExpenses)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">A/R (Piutang)</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.accountsReceivable)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">A/P (Hutang)</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.accountsPayable)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Gross Margin</p>
                <p className="text-lg font-bold text-gray-900">{summary.grossMargin}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Margin</p>
                <p className="text-lg font-bold text-gray-900">{summary.netMargin}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Branches</p>
                <p className="text-lg font-bold text-gray-900">{branchFinance.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Revenue & Profit Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Revenue & Profit Trend</h3>
              <Link href="/hq/finance/revenue" className="text-sm text-blue-600 hover:underline flex items-center">
                Detail <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Chart options={revenueChartOptions} series={revenueChartSeries} type="area" height={280} />
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Expense Breakdown</h3>
              <Link href="/hq/finance/expenses" className="text-sm text-blue-600 hover:underline flex items-center">
                Detail <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Chart options={expenseChartOptions} series={expenseChartSeries} type="donut" height={280} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Branch Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Revenue by Branch</h3>
              <Link href="/hq/branches" className="text-sm text-blue-600 hover:underline flex items-center">
                All Branches <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Chart options={branchChartOptions} series={branchChartSeries} type="bar" height={280} />
          </div>

          {/* Cash Flow */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Weekly Cash Flow</h3>
              <Link href="/hq/finance/cash-flow" className="text-sm text-blue-600 hover:underline flex items-center">
                Detail <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Chart options={cashFlowOptions} series={cashFlowSeries} type="bar" height={280} />
          </div>
        </div>

        {/* Branch Finance Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Branch Financial Performance</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search branch..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Growth</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branchFinance.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{branch.name}</p>
                        <p className="text-xs text-gray-500">{branch.code}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(branch.revenue)}</td>
                    <td className="px-5 py-4 text-right text-red-600">{formatCurrency(branch.expenses)}</td>
                    <td className="px-5 py-4 text-right font-medium text-green-600">{formatCurrency(branch.profit)}</td>
                    <td className="px-5 py-4 text-center">{branch.margin}%</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`flex items-center justify-center gap-1 ${branch.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {branch.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(branch.growth)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(branch.status)}`}>
                        {branch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
              <Link href="/hq/finance/transactions" className="text-sm text-blue-600 hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(tx.type)}`}>
                    {tx.type === 'income' && <ArrowUpRight className="w-5 h-5" />}
                    {tx.type === 'expense' && <ArrowDownRight className="w-5 h-5" />}
                    {tx.type === 'transfer' && <ArrowRightLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.date} • {tx.branch} • {tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${tx.type === 'expense' ? 'text-red-600' : tx.type === 'income' ? 'text-green-600' : 'text-blue-600'}`}>
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-xs ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
