import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  RefreshCw,
  Building2,
  Users,
  Package,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye
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

const mockConsolidatedData: ConsolidatedData = {
  period: 'Februari 2026',
  totalRevenue: 4120000000,
  totalTransactions: 12450,
  avgTicketSize: 330884,
  grossProfit: 1236000000,
  netProfit: 824000000,
  grossMargin: 30,
  netMargin: 20,
  totalBranches: 8,
  activeBranches: 7,
  totalEmployees: 127,
  activeEmployees: 105,
  stockValue: 4785000000,
  lowStockAlerts: 65
};

const mockBranchPerformance: BranchPerformance[] = [
  { branchId: '1', branchName: 'Cabang Pusat Jakarta', branchCode: 'HQ-001', revenue: 1250000000, transactions: 3890, avgTicket: 321337, profit: 250000000, margin: 20, growth: 8.5, rank: 1, target: 1200000000, achievement: 104 },
  { branchId: '2', branchName: 'Cabang Bandung', branchCode: 'BR-002', revenue: 920000000, transactions: 2450, avgTicket: 375510, profit: 184000000, margin: 20, growth: 5.2, rank: 2, target: 900000000, achievement: 102 },
  { branchId: '3', branchName: 'Cabang Surabaya', branchCode: 'BR-003', revenue: 780000000, transactions: 2180, avgTicket: 357798, profit: 156000000, margin: 20, growth: -2.1, rank: 3, target: 850000000, achievement: 92 },
  { branchId: '4', branchName: 'Cabang Medan', branchCode: 'BR-004', revenue: 650000000, transactions: 1820, avgTicket: 357143, profit: 130000000, margin: 20, growth: 3.8, rank: 4, target: 600000000, achievement: 108 },
  { branchId: '5', branchName: 'Cabang Yogyakarta', branchCode: 'BR-005', revenue: 520000000, transactions: 1560, avgTicket: 333333, profit: 104000000, margin: 20, growth: 6.5, rank: 5, target: 500000000, achievement: 104 }
];

const mockTrendData = [
  { month: 'Sep', revenue: 3200, target: 3000, transactions: 9800 },
  { month: 'Oct', revenue: 3450, target: 3200, transactions: 10200 },
  { month: 'Nov', revenue: 3680, target: 3400, transactions: 10800 },
  { month: 'Dec', revenue: 4200, target: 3800, transactions: 12500 },
  { month: 'Jan', revenue: 3900, target: 3600, transactions: 11800 },
  { month: 'Feb', revenue: 4120, target: 4000, transactions: 12450 }
];

const mockCategoryData = [
  { name: 'Sembako', value: 35, revenue: 1442000000 },
  { name: 'Minuman', value: 25, revenue: 1030000000 },
  { name: 'Makanan Ringan', value: 20, revenue: 824000000 },
  { name: 'Perawatan', value: 12, revenue: 494400000 },
  { name: 'Lainnya', value: 8, revenue: 329600000 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ConsolidatedReport() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/consolidated?period=${period}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        setData(payload.data || payload || mockConsolidatedData);
        setBranchPerformance(payload.branches || mockBranchPerformance);
      } else {
        setData(mockConsolidatedData);
        setBranchPerformance(mockBranchPerformance);
      }
    } catch (error) {
      setData(mockConsolidatedData);
      setBranchPerformance(mockBranchPerformance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [period]);

  if (!mounted) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const exportReport = () => {
    const reportData = {
      period: data?.period,
      generatedAt: new Date().toISOString(),
      summary: data,
      branchPerformance
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidated-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
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
                <ComposedChart data={mockTrendData}>
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
                    data={mockCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockCategoryData.map((entry, index) => (
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
      </div>
    </HQLayout>
  );
}
