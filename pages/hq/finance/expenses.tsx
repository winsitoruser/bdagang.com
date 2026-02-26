import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import TransactionFormModal from '../../../components/hq/finance/TransactionFormModal';
import Link from 'next/link';
import {
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  ShoppingCart,
  Users,
  Zap,
  Truck,
  Megaphone,
  Wrench,
  Filter,
  Search,
  ChevronLeft,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ExpenseSummary {
  totalExpenses: number;
  previousExpenses: number;
  growth: number;
  cogs: number;
  payroll: number;
  utilities: number;
  marketing: number;
  logistics: number;
  maintenance: number;
  other: number;
  pendingApprovals: number;
  budgetUsed: number;
  budgetTotal: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  amount: number;
  budget: number;
  percentage: number;
  trend: number;
  color: string;
}

interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  category: string;
  branch: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  approver: string;
  vendor: string;
}

interface BranchExpense {
  id: string;
  name: string;
  code: string;
  totalExpenses: number;
  cogs: number;
  payroll: number;
  utilities: number;
  other: number;
  budgetUsed: number;
}

const mockSummary: ExpenseSummary = {
  totalExpenses: 2884000000,
  previousExpenses: 2650000000,
  growth: 8.8,
  cogs: 1586200000,
  payroll: 721000000,
  utilities: 230720000,
  marketing: 201880000,
  logistics: 86520000,
  maintenance: 57680000,
  other: 0,
  pendingApprovals: 12,
  budgetUsed: 85,
  budgetTotal: 3400000000
};

const mockCategories: ExpenseCategory[] = [
  { id: '1', name: 'Cost of Goods Sold', icon: 'shopping-cart', amount: 1586200000, budget: 1800000000, percentage: 55, trend: 5.2, color: '#3B82F6' },
  { id: '2', name: 'Payroll & Benefits', icon: 'users', amount: 721000000, budget: 850000000, percentage: 25, trend: 8.5, color: '#10B981' },
  { id: '3', name: 'Utilities', icon: 'zap', amount: 230720000, budget: 280000000, percentage: 8, trend: 12.3, color: '#F59E0B' },
  { id: '4', name: 'Marketing', icon: 'megaphone', amount: 201880000, budget: 250000000, percentage: 7, trend: -5.2, color: '#EF4444' },
  { id: '5', name: 'Logistics', icon: 'truck', amount: 86520000, budget: 120000000, percentage: 3, trend: 3.1, color: '#8B5CF6' },
  { id: '6', name: 'Maintenance', icon: 'wrench', amount: 57680000, budget: 100000000, percentage: 2, trend: -2.8, color: '#EC4899' }
];

const mockExpenses: ExpenseItem[] = [
  { id: '1', date: '2026-02-22', description: 'Pembelian Bahan Baku - PT Sukses Makmur', category: 'COGS', branch: 'HQ-001', amount: 45000000, status: 'approved', approver: 'Ahmad Wijaya', vendor: 'PT Sukses Makmur' },
  { id: '2', date: '2026-02-22', description: 'Gaji Karyawan Februari 2026', category: 'Payroll', branch: 'ALL', amount: 150000000, status: 'approved', approver: 'Finance Manager', vendor: '-' },
  { id: '3', date: '2026-02-21', description: 'Tagihan Listrik Cabang Jakarta', category: 'Utilities', branch: 'HQ-001', amount: 12500000, status: 'pending', approver: '-', vendor: 'PLN' },
  { id: '4', date: '2026-02-21', description: 'Facebook Ads Campaign', category: 'Marketing', branch: 'ALL', amount: 25000000, status: 'approved', approver: 'Marketing Dir', vendor: 'Meta' },
  { id: '5', date: '2026-02-20', description: 'Pengiriman Stok ke Cabang', category: 'Logistics', branch: 'BR-002', amount: 8500000, status: 'approved', approver: 'Ops Manager', vendor: 'JNE Express' },
  { id: '6', date: '2026-02-20', description: 'Perbaikan AC Kitchen', category: 'Maintenance', branch: 'BR-003', amount: 3500000, status: 'pending', approver: '-', vendor: 'CV Sejuk Abadi' },
  { id: '7', date: '2026-02-19', description: 'Pembelian Kemasan', category: 'COGS', branch: 'HQ-001', amount: 18000000, status: 'approved', approver: 'Procurement', vendor: 'PT Packaging Indo' },
  { id: '8', date: '2026-02-19', description: 'Internet & Telepon', category: 'Utilities', branch: 'ALL', amount: 5500000, status: 'approved', approver: 'IT Manager', vendor: 'Telkom' }
];

const mockBranchExpenses: BranchExpense[] = [
  { id: '1', name: 'Cabang Pusat Jakarta', code: 'HQ-001', totalExpenses: 875000000, cogs: 481250000, payroll: 218750000, utilities: 70000000, other: 105000000, budgetUsed: 82 },
  { id: '2', name: 'Cabang Bandung', code: 'BR-002', totalExpenses: 644000000, cogs: 354200000, payroll: 161000000, utilities: 51520000, other: 77280000, budgetUsed: 78 },
  { id: '3', name: 'Cabang Surabaya', code: 'BR-003', totalExpenses: 546000000, cogs: 300300000, payroll: 136500000, utilities: 43680000, other: 65520000, budgetUsed: 85 },
  { id: '4', name: 'Cabang Medan', code: 'BR-004', totalExpenses: 455000000, cogs: 250250000, payroll: 113750000, utilities: 36400000, other: 54600000, budgetUsed: 88 },
  { id: '5', name: 'Cabang Yogyakarta', code: 'BR-005', totalExpenses: 364000000, cogs: 200200000, payroll: 91000000, utilities: 29120000, other: 43680000, budgetUsed: 92 }
];

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}Jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const getCategoryIcon = (icon: string) => {
  switch (icon) {
    case 'shopping-cart': return ShoppingCart;
    case 'users': return Users;
    case 'zap': return Zap;
    case 'megaphone': return Megaphone;
    case 'truck': return Truck;
    case 'wrench': return Wrench;
    default: return FileText;
  }
};

export default function ExpenseManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [summary, setSummary] = useState<ExpenseSummary>(mockSummary);
  const [categories, setCategories] = useState<ExpenseCategory[]>(mockCategories);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const [branchExpenses, setBranchExpenses] = useState<BranchExpense[]>(mockBranchExpenses);
  const [viewMode, setViewMode] = useState<'list' | 'category' | 'branch'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  // Fetch branches and accounts for modal
  useEffect(() => {
    const fetchBranchesAndAccounts = async () => {
      try {
        const [branchRes, accountRes] = await Promise.all([
          fetch('/api/hq/branches?limit=100'),
          fetch('/api/hq/finance/accounts?limit=100')
        ]);
        
        if (branchRes.ok) {
          const branchData = await branchRes.json();
          setBranches(branchData.branches || []);
        }
        
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setAccounts(accountData.accounts || []);
        }
      } catch (error) {
        console.error('Error fetching branches/accounts:', error);
      }
    };
    
    if (mounted) {
      fetchBranchesAndAccounts();
    }
  }, [mounted]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch expense transactions (type=expense)
      const response = await fetch(`/api/hq/finance/transactions?type=expense&limit=100&offset=0`);
      if (response.ok) {
        const result = await response.json();
        const transactions = result.data || [];
        
        // Calculate summary from transactions
        const totalExpenses = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
        
        // Group by category
        const categoryMap: { [key: string]: number } = {};
        transactions.forEach((t: any) => {
          const cat = t.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(t.amount);
        });
        
        // Update summary
        setSummary({
          ...mockSummary,
          totalExpenses,
          cogs: categoryMap['COGS'] || 0,
          payroll: categoryMap['Payroll'] || 0,
          utilities: categoryMap['Utilities'] || 0,
          marketing: categoryMap['Marketing'] || 0,
          logistics: categoryMap['Logistics'] || 0,
          maintenance: categoryMap['Maintenance'] || 0,
          other: categoryMap['Other'] || 0
        });
        
        // Map transactions to expenses
        const mappedExpenses = transactions.map((t: any) => ({
          id: t.id,
          date: t.transactionDate,
          description: t.description,
          category: t.category,
          branch: t.branch?.code || 'N/A',
          amount: parseFloat(t.amount),
          status: t.status === 'completed' ? 'approved' : t.status === 'pending' ? 'pending' : 'rejected',
          approver: t.approvedBy || '-',
          vendor: t.reference || '-'
        }));
        
        setExpenses(mappedExpenses);
      } else {
        // Fallback to mock data
        setSummary(mockSummary);
        setExpenses(mockExpenses);
      }
    } catch (error) {
      console.error('Error fetching expense data:', error);
      setSummary(mockSummary);
      setExpenses(mockExpenses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [period]);

  if (!mounted) return null;

  const expenseTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ['#EF4444'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000) } }
  };

  const expenseTrendSeries = [{ name: 'Expenses', data: [2200, 2350, 2480, 2650, 2750, 2884] }];

  const categoryPieOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: categories.map(c => c.name),
    colors: categories.map(c => c.color),
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` }
  };

  const categoryPieSeries = categories.map(c => c.percentage);

  const monthlyCompareOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, stacked: true },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
    xaxis: { categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000) } },
    legend: { position: 'top' }
  };

  const monthlyCompareSeries = [
    { name: 'COGS', data: [1200, 1280, 1350, 1450, 1520, 1586] },
    { name: 'Payroll', data: [650, 665, 680, 695, 708, 721] },
    { name: 'Utilities', data: [180, 190, 200, 210, 220, 231] },
    { name: 'Marketing', data: [150, 165, 180, 195, 198, 202] },
    { name: 'Logistics', data: [60, 65, 70, 75, 80, 87] },
    { name: 'Maintenance', data: [40, 45, 50, 52, 55, 58] }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />Approved</span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" />Pending</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><AlertTriangle className="w-3 h-3" />Rejected</span>;
      default:
        return null;
    }
  };

  const filteredExpenses = filterStatus === 'all' 
    ? expenses 
    : expenses.filter(e => e.status === filterStatus);

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
              <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
              <p className="text-gray-500">Kelola dan monitor pengeluaran perusahaan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
            
            {/* Transaction Form Modal */}
            <TransactionFormModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSubmit={async (data) => {
                try {
                  const response = await fetch('/api/hq/finance/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...data,
                      type: 'expense',
                      tenantId: 'default-tenant',
                      createdBy: 'current-user'
                    })
                  });
                  
                  if (response.ok) {
                    setShowAddModal(false);
                    fetchData();
                  }
                } catch (error) {
                  console.error('Error creating expense:', error);
                }
              }}
              transaction={null}
              branches={branches}
              accounts={accounts}
            />
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <span className={`flex items-center text-sm px-2 py-1 rounded-full ${summary.growth <= 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                {summary.growth <= 0 ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                {Math.abs(summary.growth)}%
              </span>
            </div>
            <p className="text-red-100 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
            <p className="text-red-200 text-xs mt-1">vs {formatCurrency(summary.previousExpenses)} prev</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">COGS</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.cogs)}</p>
            <p className="text-xs text-gray-500 mt-1">{((summary.cogs / summary.totalExpenses) * 100).toFixed(1)}% of total</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Payroll</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.payroll)}</p>
            <p className="text-xs text-gray-500 mt-1">{((summary.payroll / summary.totalExpenses) * 100).toFixed(1)}% of total</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              {summary.pendingApprovals > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  {summary.pendingApprovals} pending
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">Budget Used</p>
            <p className="text-2xl font-bold text-gray-900">{summary.budgetUsed}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${summary.budgetUsed > 90 ? 'bg-red-500' : summary.budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                style={{ width: `${summary.budgetUsed}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <div key={cat.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <span className={`flex items-center text-xs ${cat.trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {cat.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(cat.trend)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{cat.name}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(cat.amount)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="h-1.5 rounded-full" style={{ width: `${(cat.amount / cat.budget) * 100}%`, backgroundColor: cat.color }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{((cat.amount / cat.budget) * 100).toFixed(0)}% of budget</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Expense Trend</h3>
            <Chart options={expenseTrendOptions} series={expenseTrendSeries} type="area" height={280} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Expense by Category</h3>
            <Chart options={categoryPieOptions} series={categoryPieSeries} type="donut" height={280} />
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Expense Comparison by Category</h3>
          <Chart options={monthlyCompareOptions} series={monthlyCompareSeries} type="bar" height={320} />
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Expenses
                </button>
                <button
                  onClick={() => setViewMode('branch')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'branch' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Building2 className="w-4 h-4" />
                  By Branch
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-600">{expense.date}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.vendor}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{expense.category}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{expense.branch}</td>
                      <td className="px-5 py-4 text-right font-medium text-red-600">{formatCurrency(expense.amount)}</td>
                      <td className="px-5 py-4 text-center">{getStatusBadge(expense.status)}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded">
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded">
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'branch' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Expenses</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">COGS</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payroll</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilities</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Other</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Budget Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branchExpenses.map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{branch.name}</p>
                        <p className="text-xs text-gray-500">{branch.code}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-red-600">{formatCurrency(branch.totalExpenses)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.cogs)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.payroll)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.utilities)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.other)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${branch.budgetUsed > 90 ? 'bg-red-500' : branch.budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${branch.budgetUsed}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{branch.budgetUsed}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </HQLayout>
  );
}
