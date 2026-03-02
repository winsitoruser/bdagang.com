import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { toast } from 'react-hot-toast';
import { StatsCard } from '../../../components/hq/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Building2,
  ChevronDown,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
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
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface SalesData {
  branchId: string;
  branchName: string;
  branchCode: string;
  totalSales: number;
  totalTransactions: number;
  avgTicketSize: number;
  grossProfit: number;
  grossMargin: number;
  growth: number;
}

interface DailySales {
  date: string;
  sales: number;
  transactions: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function SalesReport() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    avgTicketSize: 0,
    totalProfit: 0,
    avgMargin: 0,
    salesGrowth: 0
  });

  const loadMockData = () => {
    const mockBranchSales: SalesData[] = [
      { branchId: '1', branchName: 'Cabang Pusat Jakarta', branchCode: 'HQ-001', totalSales: 145000000, totalTransactions: 486, avgTicketSize: 298354, grossProfit: 43500000, grossMargin: 30, growth: 8.5 },
      { branchId: '2', branchName: 'Cabang Bandung', branchCode: 'BR-002', totalSales: 98000000, totalTransactions: 312, avgTicketSize: 314103, grossProfit: 27440000, grossMargin: 28, growth: 5.2 },
      { branchId: '3', branchName: 'Cabang Surabaya', branchCode: 'BR-003', totalSales: 87000000, totalTransactions: 278, avgTicketSize: 313669, grossProfit: 23490000, grossMargin: 27, growth: -2.1 },
      { branchId: '4', branchName: 'Cabang Medan', branchCode: 'BR-004', totalSales: 68000000, totalTransactions: 215, avgTicketSize: 316279, grossProfit: 17680000, grossMargin: 26, growth: 3.8 },
      { branchId: '5', branchName: 'Kiosk Mall TA', branchCode: 'KS-001', totalSales: 28000000, totalTransactions: 142, avgTicketSize: 197183, grossProfit: 8400000, grossMargin: 30, growth: 12.5 }
    ];

    const mockDailySales: DailySales[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 20000000) + 10000000,
      transactions: Math.floor(Math.random() * 100) + 50
    }));

    setSalesData(mockBranchSales);
    setDailySales(mockDailySales);
    
    const totalSales = mockBranchSales.reduce((sum, b) => sum + b.totalSales, 0);
    const totalTransactions = mockBranchSales.reduce((sum, b) => sum + b.totalTransactions, 0);
    const totalProfit = mockBranchSales.reduce((sum, b) => sum + b.grossProfit, 0);
    
    setSummary({
      totalSales,
      totalTransactions,
      avgTicketSize: totalSales / totalTransactions,
      totalProfit,
      avgMargin: (totalProfit / totalSales) * 100,
      salesGrowth: 7.5
    });
  };

  const processSalesData = (data: any) => {
    if (data.branchData) {
      setSalesData(data.branchData.map((b: any) => ({
        branchId: b.branchId,
        branchName: b.branchName,
        branchCode: b.branchCode,
        totalSales: b.totalSales,
        totalTransactions: b.totalTransactions,
        avgTicketSize: b.avgTicketSize,
        grossProfit: b.grossProfit,
        grossMargin: b.grossMargin,
        growth: 0
      })));
    }
    if (data.summary) {
      setSummary({
        totalSales: data.summary.totalSales,
        totalTransactions: data.summary.totalTransactions,
        avgTicketSize: data.summary.avgTicketSize,
        totalProfit: data.summary.totalGrossProfit,
        avgMargin: data.summary.avgGrossMargin,
        salesGrowth: data.summary.salesGrowth
      });
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/consolidated?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        processSalesData(data.data);
      } else {
        loadMockData();
      }
    } catch (error) {
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadMockData();
    fetchSalesData();
  }, [period, branchFilter]);

  if (!mounted) {
    return (
      <HQLayout>
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      </HQLayout>
    );
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvContent = [
        ['Cabang', 'Kode', 'Total Penjualan', 'Transaksi', 'Avg Ticket', 'Gross Profit', 'Margin %', 'Growth %'].join(','),
        ...salesData.map(d => [
          d.branchName,
          d.branchCode,
          d.totalSales,
          d.totalTransactions,
          d.avgTicketSize.toFixed(0),
          d.grossProfit,
          d.grossMargin.toFixed(1),
          d.growth.toFixed(1)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export laporan penjualan berhasil');
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const chartData = salesData.map(d => ({
    name: d.branchName.replace('Cabang ', '').replace('Kiosk ', ''),
    sales: d.totalSales / 1000000,
    profit: d.grossProfit / 1000000,
    transactions: d.totalTransactions
  }));

  const pieData = salesData.map(d => ({
    name: d.branchName.replace('Cabang ', '').replace('Kiosk ', ''),
    value: d.totalSales
  }));

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
            <p className="text-gray-500">Analisis penjualan konsolidasi semua cabang</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Cabang</option>
              {salesData.map(b => (
                <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
              ))}
            </select>
            <button
              onClick={() => fetchSalesData()}
              disabled={loading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Penjualan</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalSales)}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${summary.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.salesGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(summary.salesGrowth).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transaksi</p>
                <p className="text-xl font-bold text-gray-900">{summary.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Ticket Size</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.avgTicketSize)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalProfit)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Margin</p>
                <p className="text-xl font-bold text-gray-900">{summary.avgMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <PieChart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cabang Aktif</p>
                <p className="text-xl font-bold text-gray-900">{salesData.length}</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Building2 className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Sales by Branch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan per Cabang</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}Jt`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(1)} Jt`, 'Penjualan']} />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Penjualan</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Trend */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Penjualan Harian</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Penjualan']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long' })}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Branch Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detail per Cabang</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Penjualan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Ticket</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Profit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.map((branch) => (
                <tr key={branch.branchId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{branch.branchName}</div>
                        <div className="text-sm text-gray-500">{branch.branchCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(branch.totalSales)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{branch.totalTransactions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(branch.avgTicketSize)}</td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">{formatCurrency(branch.grossProfit)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{branch.grossMargin.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1 ${branch.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {branch.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(branch.growth).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-medium">
              <tr>
                <td className="px-6 py-4 text-gray-900">Total</td>
                <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(summary.totalSales)}</td>
                <td className="px-6 py-4 text-right text-gray-900">{summary.totalTransactions.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(summary.avgTicketSize)}</td>
                <td className="px-6 py-4 text-right text-green-600">{formatCurrency(summary.totalProfit)}</td>
                <td className="px-6 py-4 text-right text-gray-900">{summary.avgMargin.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1 ${summary.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.salesGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(summary.salesGrowth).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </HQLayout>
  );
}
