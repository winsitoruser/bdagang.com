import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import TransactionFormModal from '../../../components/hq/finance/TransactionFormModal';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Banknote,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
  Clock,
  Target
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueData {
  totalRevenue: number;
  previousRevenue: number;
  growth: number;
  avgDailyRevenue: number;
  avgTicketSize: number;
  totalTransactions: number;
  cashSales: number;
  cardSales: number;
  digitalSales: number;
  onlineSales: number;
  offlineSales: number;
}

interface BranchRevenue {
  id: string;
  name: string;
  code: string;
  revenue: number;
  transactions: number;
  avgTicket: number;
  growth: number;
  contribution: number;
}

interface ProductRevenue {
  id: string;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
  avgPrice: number;
  growth: number;
}

interface HourlyRevenue {
  hour: string;
  revenue: number;
  transactions: number;
}

const mockRevenueData: RevenueData = {
  totalRevenue: 4120000000,
  previousRevenue: 3665000000,
  growth: 12.4,
  avgDailyRevenue: 137333333,
  avgTicketSize: 185000,
  totalTransactions: 22270,
  cashSales: 1580000000,
  cardSales: 1520000000,
  digitalSales: 1020000000,
  onlineSales: 1450000000,
  offlineSales: 2670000000
};

const mockBranchRevenue: BranchRevenue[] = [
  { id: '1', name: 'Cabang Pusat Jakarta', code: 'HQ-001', revenue: 1250000000, transactions: 6757, avgTicket: 185000, growth: 15.2, contribution: 30.3 },
  { id: '2', name: 'Cabang Bandung', code: 'BR-002', revenue: 920000000, transactions: 4973, avgTicket: 185000, growth: 12.8, contribution: 22.3 },
  { id: '3', name: 'Cabang Surabaya', code: 'BR-003', revenue: 780000000, transactions: 4216, avgTicket: 185000, growth: 8.5, contribution: 18.9 },
  { id: '4', name: 'Cabang Medan', code: 'BR-004', revenue: 650000000, transactions: 3514, avgTicket: 185000, growth: 5.2, contribution: 15.8 },
  { id: '5', name: 'Cabang Yogyakarta', code: 'BR-005', revenue: 520000000, transactions: 2811, avgTicket: 185000, growth: -2.3, contribution: 12.6 }
];

const mockProductRevenue: ProductRevenue[] = [
  { id: '1', name: 'Nasi Goreng Special', category: 'Main Course', revenue: 450000000, quantity: 12500, avgPrice: 36000, growth: 18.5 },
  { id: '2', name: 'Ayam Bakar Madu', category: 'Main Course', revenue: 380000000, quantity: 9500, avgPrice: 40000, growth: 12.3 },
  { id: '3', name: 'Es Teh Manis', category: 'Beverages', revenue: 320000000, quantity: 32000, avgPrice: 10000, growth: 8.7 },
  { id: '4', name: 'Sate Ayam', category: 'Appetizer', revenue: 280000000, quantity: 7000, avgPrice: 40000, growth: 15.2 },
  { id: '5', name: 'Mie Goreng Seafood', category: 'Main Course', revenue: 250000000, quantity: 6250, avgPrice: 40000, growth: 10.1 },
  { id: '6', name: 'Jus Alpukat', category: 'Beverages', revenue: 220000000, quantity: 11000, avgPrice: 20000, growth: 22.5 },
  { id: '7', name: 'Gado-Gado', category: 'Main Course', revenue: 180000000, quantity: 6000, avgPrice: 30000, growth: 5.8 },
  { id: '8', name: 'Es Kopi Susu', category: 'Beverages', revenue: 165000000, quantity: 8250, avgPrice: 20000, growth: 28.3 }
];

const mockHourlyRevenue: HourlyRevenue[] = [
  { hour: '08:00', revenue: 85000000, transactions: 459 },
  { hour: '09:00', revenue: 120000000, transactions: 649 },
  { hour: '10:00', revenue: 180000000, transactions: 973 },
  { hour: '11:00', revenue: 320000000, transactions: 1730 },
  { hour: '12:00', revenue: 520000000, transactions: 2811 },
  { hour: '13:00', revenue: 480000000, transactions: 2595 },
  { hour: '14:00', revenue: 280000000, transactions: 1514 },
  { hour: '15:00', revenue: 200000000, transactions: 1081 },
  { hour: '16:00', revenue: 220000000, transactions: 1189 },
  { hour: '17:00', revenue: 350000000, transactions: 1892 },
  { hour: '18:00', revenue: 520000000, transactions: 2811 },
  { hour: '19:00', revenue: 480000000, transactions: 2595 },
  { hour: '20:00', revenue: 320000000, transactions: 1730 },
  { hour: '21:00', revenue: 180000000, transactions: 973 }
];

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

export default function RevenueAnalysis() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [dateRange, setDateRange] = useState({ start: '2026-02-01', end: '2026-02-22' });
  const [revenueData, setRevenueData] = useState<RevenueData>(mockRevenueData);
  const [branchRevenue, setBranchRevenue] = useState<BranchRevenue[]>(mockBranchRevenue);
  const [productRevenue, setProductRevenue] = useState<ProductRevenue[]>(mockProductRevenue);
  const [hourlyRevenue, setHourlyRevenue] = useState<HourlyRevenue[]>(mockHourlyRevenue);
  const [viewMode, setViewMode] = useState<'branch' | 'product' | 'time'>('branch');
  const [showAddModal, setShowAddModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
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
      const response = await fetch(`/api/hq/finance/transactions?type=income&limit=100&offset=0`);
      if (response.ok) {
        const result = await response.json();
        const transactions = result.data || [];
        
        const totalRevenue = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
        const totalTransactions = transactions.length;
        const avgTicketSize = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        const categoryMap: { [key: string]: number } = {};
        transactions.forEach((t: any) => {
          const cat = t.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(t.amount);
        });
        
        const branchMap: { [key: string]: { revenue: number; count: number; name: string; code: string } } = {};
        transactions.forEach((t: any) => {
          const branchId = t.branchId || 'unknown';
          if (!branchMap[branchId]) {
            branchMap[branchId] = {
              revenue: 0,
              count: 0,
              name: t.branch?.name || 'Unknown',
              code: t.branch?.code || 'N/A'
            };
          }
          branchMap[branchId].revenue += parseFloat(t.amount);
          branchMap[branchId].count += 1;
        });
        
        const mappedBranches = Object.keys(branchMap).map((id, index) => ({
          id,
          name: branchMap[id].name,
          code: branchMap[id].code,
          revenue: branchMap[id].revenue,
          transactions: branchMap[id].count,
          avgTicket: branchMap[id].count > 0 ? branchMap[id].revenue / branchMap[id].count : 0,
          growth: 0,
          contribution: totalRevenue > 0 ? (branchMap[id].revenue / totalRevenue) * 100 : 0
        }));
        
        setRevenueData({
          ...mockRevenueData,
          totalRevenue,
          avgTicketSize,
          totalTransactions,
          cashSales: categoryMap['Cash Sales'] || 0,
          cardSales: categoryMap['Card Sales'] || 0,
          digitalSales: categoryMap['Digital Sales'] || 0
        });
        
        setBranchRevenue(mappedBranches.length > 0 ? mappedBranches : mockBranchRevenue);
      } else {
        setRevenueData(mockRevenueData);
        setBranchRevenue(mockBranchRevenue);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData(mockRevenueData);
      setBranchRevenue(mockBranchRevenue);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [period]);

  if (!mounted) return null;

  const revenueTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ['#3B82F6'],
    xaxis: { categories: ['1', '5', '10', '15', '20', '22'], title: { text: 'Day of Month' } },
    yaxis: { labels: { formatter: (val) => formatCurrency(val * 1000000) } },
    tooltip: { y: { formatter: (val) => formatFullCurrency(val * 1000000) } }
  };

  const revenueTrendSeries = [{ name: 'Revenue', data: [120, 180, 220, 195, 280, 320] }];

  const paymentMethodOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: ['Cash', 'Card', 'Digital Payment'],
    colors: ['#10B981', '#3B82F6', '#8B5CF6'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true }
  };

  const paymentMethodSeries = [
    Math.round(revenueData.cashSales / 1000000),
    Math.round(revenueData.cardSales / 1000000),
    Math.round(revenueData.digitalSales / 1000000)
  ];

  const channelOptions: ApexCharts.ApexOptions = {
    chart: { type: 'pie' },
    labels: ['Online', 'Offline'],
    colors: ['#F59E0B', '#6366F1'],
    legend: { position: 'bottom' }
  };

  const channelSeries = [
    Math.round(revenueData.onlineSales / 1000000),
    Math.round(revenueData.offlineSales / 1000000)
  ];

  const hourlyOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '70%' } },
    colors: ['#3B82F6'],
    xaxis: { categories: hourlyRevenue.map(h => h.hour) },
    yaxis: { labels: { formatter: (val) => formatCurrency(val) } },
    tooltip: { y: { formatter: (val) => formatFullCurrency(val) } }
  };

  const hourlySeries = [{ name: 'Revenue', data: hourlyRevenue.map(h => h.revenue) }];

  const branchCompareOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true } },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    xaxis: { labels: { formatter: (val) => formatCurrency(Number(val)) } },
    legend: { show: false }
  };

  const branchCompareSeries = [{
    name: 'Revenue',
    data: branchRevenue.map(b => ({ x: b.code, y: b.revenue }))
  }];

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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
              <p className="text-gray-500">Analisis pendapatan global dan per cabang</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              {['day', 'week', 'month', 'quarter', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === p ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className={`flex items-center text-sm px-2 py-1 rounded-full ${revenueData.growth >= 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                {revenueData.growth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {Math.abs(revenueData.growth)}%
              </span>
            </div>
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</p>
            <p className="text-blue-200 text-xs mt-1">vs {formatCurrency(revenueData.previousRevenue)} prev</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Avg Daily Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.avgDailyRevenue)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{revenueData.totalTransactions.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Avg Ticket Size</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.avgTicketSize)}</p>
          </div>
        </div>

        {/* Payment & Channel Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cash Sales</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueData.cashSales)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(revenueData.cashSales / revenueData.totalRevenue) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{((revenueData.cashSales / revenueData.totalRevenue) * 100).toFixed(1)}% of total</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Card Sales</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueData.cardSales)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(revenueData.cardSales / revenueData.totalRevenue) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{((revenueData.cardSales / revenueData.totalRevenue) * 100).toFixed(1)}% of total</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Digital Payment</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueData.digitalSales)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(revenueData.digitalSales / revenueData.totalRevenue) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{((revenueData.digitalSales / revenueData.totalRevenue) * 100).toFixed(1)}% of total</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <Chart options={revenueTrendOptions} series={revenueTrendSeries} type="area" height={280} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Hourly Revenue Distribution</h3>
            <Chart options={hourlyOptions} series={hourlySeries} type="bar" height={280} />
          </div>
        </div>

        {/* Payment & Channel Charts */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <Chart options={paymentMethodOptions} series={paymentMethodSeries} type="donut" height={250} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Sales Channel</h3>
            <Chart options={channelOptions} series={channelSeries} type="pie" height={250} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue by Branch</h3>
            <Chart options={branchCompareOptions} series={branchCompareSeries} type="bar" height={250} />
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-4 p-4">
              <button
                onClick={() => setViewMode('branch')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'branch' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Building2 className="w-4 h-4" />
                By Branch
              </button>
              <button
                onClick={() => setViewMode('product')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'product' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package className="w-4 h-4" />
                By Product
              </button>
              <button
                onClick={() => setViewMode('time')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${viewMode === 'time' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Clock className="w-4 h-4" />
                By Time
              </button>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'branch' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Ticket</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Growth</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branchRevenue.map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{branch.name}</p>
                          <p className="text-xs text-gray-500">{branch.code}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(branch.revenue)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{branch.transactions.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.avgTicket)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`flex items-center justify-center gap-1 ${branch.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {branch.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(branch.growth)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${branch.contribution}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-600">{branch.contribution}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'product' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productRevenue.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{product.category}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(product.revenue)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{product.quantity.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(product.avgPrice)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`flex items-center justify-center gap-1 ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(product.growth)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'time' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hour</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg per Tx</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hourlyRevenue.map((item) => (
                    <tr key={item.hour} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">{item.hour}</td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(item.revenue)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{item.transactions.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(Math.round(item.revenue / item.transactions))}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(item.revenue / Math.max(...hourlyRevenue.map(h => h.revenue))) * 100}%` }}
                            ></div>
                          </div>
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
