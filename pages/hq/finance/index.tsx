import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  DollarSign, TrendingUp, TrendingDown, Building2, CreditCard, Wallet,
  PieChart as PieChartIcon, BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
  RefreshCw, Download, FileText, Receipt, Banknote, CircleDollarSign,
  ArrowRightLeft, Calculator, Target, AlertTriangle, CheckCircle, Clock,
  ChevronRight, Filter, Search, Activity, Heart, Layers, Zap, Shield,
  Globe, Star
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'Umum' }, { value: 'fnb', label: 'F&B' },
  { value: 'retail', label: 'Retail' }, { value: 'logistics', label: 'Logistik' },
  { value: 'hospitality', label: 'Hospitality' }, { value: 'manufacturing', label: 'Manufaktur' },
  { value: 'finance', label: 'Finance' }, { value: 'workshop', label: 'Bengkel' },
  { value: 'pharmacy', label: 'Farmasi' }, { value: 'distributor', label: 'Distributor' },
  { value: 'rental', label: 'Rental' }, { value: 'property', label: 'Property' },
];

interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  ebitda?: number;
  ebitdaMargin?: number;
  cashOnHand: number;
  accountsReceivable: number;
  accountsPayable: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyGrowth: number;
  yearlyGrowth: number;
  operatingCashFlow?: number;
  freeCashFlow?: number;
  workingCapital?: number;
  currentRatio?: number;
  quickRatio?: number;
  debtToEquity?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
}

interface FinancialHealth {
  score: number;
  grade: string;
  factors: { name: string; score: number; max: number; detail: string }[];
}

interface IndustryKPI {
  key: string;
  label: string;
  unit: string;
  target: number;
  actual: number;
  previousPeriod: number;
  trend: number;
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
  const [industry, setIndustry] = useState('general');
  const [subTab, setSubTab] = useState<'overview' | 'ratios' | 'comparison' | 'forecast'>('overview');
  const [summary, setSummary] = useState<FinanceSummary>(defaultFinSummary);
  const [branchFinance, setBranchFinance] = useState<BranchFinance[]>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [allBranches, setAllBranches] = useState<{id: string, name: string, code: string}[]>([]);
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [industryKpis, setIndustryKpis] = useState<IndustryKPI[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [trendData, setTrendData] = useState<any>(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [cashFlowForecast, setCashFlowForecast] = useState<any[]>([]);

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
      // Try enhanced API first
      const enhRes = await fetch(`/api/hq/finance/enhanced?action=dashboard&period=${period}&industry=${industry}${branchParam}`);
      if (enhRes.ok) {
        const json = await enhRes.json();
        if (json.success && json.data) {
          setSummary(json.data.summary || defaultFinSummary);
          setBranchFinance(json.data.branches || []);
          setTransactions(json.data.transactions || []);
          setHealth(json.data.health || null);
          // Also fetch ratios
          try {
            const ratRes = await fetch(`/api/hq/finance/enhanced?action=ratios&industry=${industry}`);
            if (ratRes.ok) { const rj = await ratRes.json(); if (rj.success) setIndustryKpis(rj.data.ratios || []); }
          } catch {}
          // Also fetch forecast
          try {
            const fcRes = await fetch(`/api/hq/finance/enhanced?action=forecast`);
            if (fcRes.ok) { const fj = await fcRes.json(); if (fj.success) setForecast(fj.data.forecast || []); }
          } catch {}
          // Also fetch trend data
          try {
            const trRes = await fetch(`/api/hq/finance/enhanced?action=trend&period=${period}`);
            if (trRes.ok) { const tj = await trRes.json(); if (tj.success) setTrendData(tj.data.trend || null); }
          } catch {}
          // Also fetch expense breakdown
          try {
            const ebRes = await fetch(`/api/hq/finance/enhanced?action=expense-breakdown`);
            if (ebRes.ok) { const ej = await ebRes.json(); if (ej.success) setExpenseBreakdown(ej.data.expenses || []); }
          } catch {}
          // Also fetch cash flow forecast
          try {
            const cfRes = await fetch(`/api/hq/finance/enhanced?action=cash-flow-forecast`);
            if (cfRes.ok) { const cfj = await cfRes.json(); if (cfj.success) setCashFlowForecast(cfj.data.cashFlow || []); }
          } catch {}
          setLoading(false);
          return;
        }
      }
      // Fallback to original API
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/hq/finance/enhanced?action=export&period=${period}&industry=${industry}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.csv) {
          const blob = new Blob([json.data.csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = json.data.filename || 'finance-export.csv'; a.click();
          URL.revokeObjectURL(url);
          toast.success('Export berhasil');
        }
      }
    } catch { toast.error('Export gagal'); }
    setExporting(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchBranches();
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [period, selectedBranch, industry]);

  if (!mounted) return null;

  const getHealthColor = (score: number) => score >= 85 ? 'text-green-600' : score >= 70 ? 'text-blue-600' : score >= 55 ? 'text-yellow-600' : 'text-red-600';
  const getHealthBg = (score: number) => score >= 85 ? 'bg-green-100' : score >= 70 ? 'bg-blue-100' : score >= 55 ? 'bg-yellow-100' : 'bg-red-100';

  const revenueLabels = trendData?.labels || ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const revenueChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ['#3B82F6', '#10B981'],
    xaxis: { categories: revenueLabels, labels: { style: { colors: '#64748b' } } },
    yaxis: { labels: { formatter: (val) => formatCurrency(val), style: { colors: '#64748b' } } },
    tooltip: { y: { formatter: (val) => formatFullCurrency(val) } },
    legend: { position: 'top' }
  };

  const revenueChartSeries = trendData ? [
    { name: 'Revenue', data: trendData.revenue },
    { name: 'Profit', data: trendData.profit }
  ] : [
    { name: 'Revenue', data: [3200000000, 3450000000, 3680000000, 4200000000, 3900000000, 4120000000] },
    { name: 'Profit', data: [640000000, 690000000, 736000000, 840000000, 780000000, 824000000] }
  ];

  const expLabels = expenseBreakdown.length > 0 ? expenseBreakdown.map(e => e.category) : ['COGS', 'Payroll', 'Utilities', 'Marketing', 'Other'];
  const expenseChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: expLabels,
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` }
  };

  const expenseChartSeries = expenseBreakdown.length > 0
    ? expenseBreakdown.map(e => e.percentage)
    : [55, 25, 8, 7, 5];

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

  const cfLabels = cashFlowForecast.length > 0 ? cashFlowForecast.slice(0, 4).map(c => c.label) : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const cashFlowOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    colors: ['#10B981', '#EF4444'],
    xaxis: { categories: cfLabels },
    yaxis: { labels: { formatter: (val) => formatCurrency(Math.abs(val)) } },
    legend: { position: 'top' }
  };

  const cashFlowSeries = cashFlowForecast.length > 0 ? [
    { name: 'Cash In', data: cashFlowForecast.slice(0, 4).map(c => c.inflow) },
    { name: 'Cash Out', data: cashFlowForecast.slice(0, 4).map(c => -c.outflow) }
  ] : [
    { name: 'Cash In', data: [850000000, 920000000, 780000000, 1050000000] },
    { name: 'Cash Out', data: [-650000000, -720000000, -580000000, -820000000] }
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
            <p className="text-gray-500">Overview keuangan multi-industri dengan KPI & rasio</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">Semua Cabang</option>
              {(allBranches.length > 0 ? allBranches : branchFinance).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="day">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="quarter">Kuartal Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {([
            { v: 'overview' as const, l: 'Overview', icon: Layers },
            { v: 'ratios' as const, l: 'Industry KPIs', icon: Activity },
            { v: 'comparison' as const, l: 'Branch Comparison', icon: Building2 },
            { v: 'forecast' as const, l: 'Forecast', icon: Target },
          ]).map(t => (
            <button key={t.v} onClick={() => setSubTab(t.v)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${subTab === t.v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <t.icon className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-8 gap-3">
          {quickLinks.map((link, idx) => (
            <Link key={idx} href={link.href}>
              <div className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`w-9 h-9 ${link.color} rounded-lg flex items-center justify-center mb-1.5`}>
                  <link.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ═══ OVERVIEW SUB-TAB ═══ */}
        {subTab === 'overview' && (<>
        {/* Main Metrics */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-7 h-7 opacity-80" />
              <span className="flex items-center text-xs bg-white/20 px-2 py-0.5 rounded-full"><ArrowUpRight className="w-3 h-3 mr-0.5" />{summary.monthlyGrowth}%</span>
            </div>
            <p className="text-blue-100 text-xs">Total Revenue</p>
            <p className="text-xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-blue-200 text-[10px] mt-0.5">YoY: +{summary.yearlyGrowth}%</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-7 h-7 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{summary.netMargin}%</span>
            </div>
            <p className="text-green-100 text-xs">Net Profit</p>
            <p className="text-xl font-bold">{formatCurrency(summary.netProfit)}</p>
            <p className="text-green-200 text-[10px] mt-0.5">Gross: {formatCurrency(summary.grossProfit)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-7 h-7 opacity-80" />
              <CheckCircle className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-purple-100 text-xs">Cash on Hand</p>
            <p className="text-xl font-bold">{formatCurrency(summary.cashOnHand)}</p>
            <p className="text-purple-200 text-[10px] mt-0.5">FCF: {formatCurrency(summary.freeCashFlow || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-7 h-7 opacity-80" />
              {summary.overdueInvoices > 0 && <span className="flex items-center text-xs bg-red-500 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3 mr-0.5" />{summary.overdueInvoices}</span>}
            </div>
            <p className="text-orange-100 text-xs">Pending Invoices</p>
            <p className="text-xl font-bold">{summary.pendingInvoices}</p>
            <p className="text-orange-200 text-[10px] mt-0.5">{summary.overdueInvoices} overdue</p>
          </div>
          {health && (
            <div className={`rounded-xl p-4 border-2 ${health.score >= 85 ? 'border-green-300 bg-green-50' : health.score >= 70 ? 'border-blue-300 bg-blue-50' : health.score >= 55 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <Heart className={`w-7 h-7 ${getHealthColor(health.score)}`} />
                <span className={`text-2xl font-black ${getHealthColor(health.score)}`}>{health.grade}</span>
              </div>
              <p className="text-xs text-gray-500">Financial Health</p>
              <p className={`text-xl font-bold ${getHealthColor(health.score)}`}>{health.score}/100</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full ${health.score >= 85 ? 'bg-green-500' : health.score >= 70 ? 'bg-blue-500' : health.score >= 55 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${health.score}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-8 gap-3">
          {[
            { label: 'Expenses', value: formatCurrency(summary.totalExpenses), icon: TrendingDown, bg: 'bg-red-100', ic: 'text-red-600' },
            { label: 'A/R (Piutang)', value: formatCurrency(summary.accountsReceivable), icon: ArrowUpRight, bg: 'bg-green-100', ic: 'text-green-600' },
            { label: 'A/P (Hutang)', value: formatCurrency(summary.accountsPayable), icon: ArrowDownRight, bg: 'bg-red-100', ic: 'text-red-600' },
            { label: 'Gross Margin', value: `${summary.grossMargin}%`, icon: PieChartIcon, bg: 'bg-blue-100', ic: 'text-blue-600' },
            { label: 'Net Margin', value: `${summary.netMargin}%`, icon: BarChart3, bg: 'bg-purple-100', ic: 'text-purple-600' },
            { label: 'EBITDA', value: formatCurrency(summary.ebitda || 0), icon: Zap, bg: 'bg-teal-100', ic: 'text-teal-600' },
            { label: 'Current Ratio', value: `${summary.currentRatio || 0}x`, icon: Shield, bg: 'bg-indigo-100', ic: 'text-indigo-600' },
            { label: 'ROE', value: `${summary.returnOnEquity || 0}%`, icon: Star, bg: 'bg-yellow-100', ic: 'text-yellow-600' },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}><Icon className={`w-4 h-4 ${m.ic}`} /></div>
                  <div>
                    <p className="text-[10px] text-gray-500">{m.label}</p>
                    <p className="text-sm font-bold text-gray-900">{m.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Revenue & Profit Trend</h3>
              <Link href="/hq/finance/revenue" className="text-sm text-blue-600 hover:underline flex items-center">Detail <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Chart options={revenueChartOptions} series={revenueChartSeries} type="area" height={260} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Expense Breakdown</h3>
              <Link href="/hq/finance/expenses" className="text-sm text-blue-600 hover:underline flex items-center">Detail <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Chart options={expenseChartOptions} series={expenseChartSeries} type="donut" height={260} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Revenue by Branch</h3>
              <Link href="/hq/branches" className="text-sm text-blue-600 hover:underline flex items-center">All Branches <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Chart options={branchChartOptions} series={branchChartSeries} type="bar" height={260} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Weekly Cash Flow</h3>
              <Link href="/hq/finance/cash-flow" className="text-sm text-blue-600 hover:underline flex items-center">Detail <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Chart options={cashFlowOptions} series={cashFlowSeries} type="bar" height={260} />
          </div>
        </div>

        {/* Health Score Breakdown */}
        {health && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Financial Health Score Breakdown</h3>
            <div className="grid grid-cols-5 gap-4">
              {health.factors.map(f => (
                <div key={f.name} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={f.score / f.max >= 0.7 ? '#10B981' : f.score / f.max >= 0.5 ? '#F59E0B' : '#EF4444'} strokeWidth="3" strokeDasharray={`${(f.score / f.max) * 100}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{f.score}/{f.max}</div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
              <Link href="/hq/finance/transactions" className="text-sm text-blue-600 hover:underline flex items-center">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getTypeColor(tx.type)}`}>
                    {tx.type === 'income' && <ArrowUpRight className="w-4 h-4" />}
                    {tx.type === 'expense' && <ArrowDownRight className="w-4 h-4" />}
                    {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.date} · {tx.branch} · {tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.type === 'expense' ? 'text-red-600' : tx.type === 'income' ? 'text-green-600' : 'text-blue-600'}`}>
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-xs ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>)}

        {/* ═══ INDUSTRY KPIs SUB-TAB ═══ */}
        {subTab === 'ratios' && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-indigo-700"><strong>Industry KPIs ({INDUSTRY_OPTIONS.find(i => i.value === industry)?.label})</strong>: Rasio dan indikator keuangan spesifik industri untuk mengukur kinerja operasional dan finansial.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {industryKpis.map(kpi => {
                const pct = Math.min(100, Math.max(0, (kpi.actual / kpi.target) * 100));
                const isGood = kpi.key.includes('Cost') || kpi.key.includes('shrinkage') || kpi.key.includes('npl') || kpi.key.includes('claim') || kpi.key.includes('comeback') || kpi.key.includes('default') || kpi.key.includes('Expiry')
                  ? kpi.actual <= kpi.target
                  : kpi.actual >= kpi.target;
                return (
                  <div key={kpi.key} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{kpi.label}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isGood ? 'On Target' : 'Below Target'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900">{kpi.actual}{kpi.unit === '%' ? '%' : kpi.unit === 'x' ? 'x' : kpi.unit === 'days' ? ' hari' : ''}</span>
                      {kpi.unit === 'Rp' && <span className="text-lg font-bold text-gray-900">{formatCurrency(kpi.actual)}</span>}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full ${isGood ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Target: {kpi.target}{kpi.unit === '%' ? '%' : kpi.unit === 'x' ? 'x' : ''}</span>
                      <span className={`flex items-center gap-0.5 ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(kpi.trend)}% vs prev
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ BRANCH COMPARISON SUB-TAB ═══ */}
        {subTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Branch Financial Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Growth</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Health</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {branchFinance.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><p className="font-medium text-gray-900 text-sm">{branch.name}</p><p className="text-xs text-gray-500">{branch.code}</p></td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(branch.revenue)}</td>
                        <td className="px-4 py-3 text-right text-sm text-red-600">{formatCurrency(branch.expenses)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-green-600">{formatCurrency(branch.profit)}</td>
                        <td className="px-4 py-3 text-center text-sm">{branch.margin}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`flex items-center justify-center gap-0.5 text-sm ${branch.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {branch.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(branch.growth)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(branch as any).healthScore && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getHealthBg((branch as any).healthScore)} ${getHealthColor((branch as any).healthScore)}`}>
                              {(branch as any).healthScore}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(branch.status)}`}>{branch.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Branch Revenue Comparison Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Branch Revenue Comparison</h3>
              <Chart options={branchChartOptions} series={branchChartSeries} type="bar" height={300} />
            </div>
          </div>
        )}

        {/* ═══ FORECAST SUB-TAB ═══ */}
        {subTab === 'forecast' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-700"><strong>Financial Forecast</strong>: Proyeksi revenue, expenses, dan profit berdasarkan tren historis dan data aktual.</p>
            </div>
            {forecast.length > 0 ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Revenue Forecast vs Actual</h3>
                  <Chart
                    options={{
                      chart: { type: 'area', toolbar: { show: false } },
                      stroke: { curve: 'smooth', width: [2, 2], dashArray: [0, 5] },
                      colors: ['#3B82F6', '#93C5FD'],
                      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } },
                      xaxis: { categories: forecast.map(f => f.month) },
                      yaxis: { labels: { formatter: (v: number) => formatCurrency(v) } },
                      tooltip: { y: { formatter: (v: number) => formatFullCurrency(v) } },
                      legend: { position: 'top' },
                    }}
                    series={[
                      { name: 'Actual', data: forecast.map(f => f.actualRevenue || 0) },
                      { name: 'Projected', data: forecast.map(f => f.projectedRevenue) },
                    ]}
                    type="area"
                    height={300}
                  />
                </div>
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Monthly Forecast Table</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Proj. Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Proj. Profit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual Profit</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {forecast.map((f, i) => (
                          <tr key={i} className={`hover:bg-gray-50 ${f.isForecast ? 'bg-amber-50/50' : ''}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{f.month}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(f.projectedRevenue)}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{f.actualRevenue ? formatCurrency(f.actualRevenue) : '-'}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(f.projectedProfit)}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-green-600">{f.actualProfit ? formatCurrency(f.actualProfit) : '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.isForecast ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {f.isForecast ? 'Forecast' : 'Actual'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Loading forecast data...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </HQLayout>
  );
}
