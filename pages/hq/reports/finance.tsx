import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import {
  DollarSign,
  RefreshCw,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface FinanceData {
  branchId: string;
  branchName: string;
  branchCode: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  cashSales: number;
  cardSales: number;
  digitalSales: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function FinanceReport() {
  const [mounted, setMounted] = useState(false);
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/reports/finance?period=${period}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.financeData) setFinanceData(payload.financeData);
      }
    } catch (error) {
      console.error('Error fetching finance report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchFinanceData();
  }, [period]);

  if (!mounted) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const exportToCSV = () => {
    const headers = ['Cabang', 'Kode', 'Revenue', 'COGS', 'Gross Profit', 'OpEx', 'Net Profit', 'Gross Margin', 'Net Margin'];
    const rows = financeData.map(f => [
      f.branchName, f.branchCode, f.revenue, f.cogs, f.grossProfit, f.operatingExpenses, f.netProfit, `${f.grossMargin}%`, `${f.netMargin}%`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalStats = {
    revenue: financeData.reduce((sum, f) => sum + f.revenue, 0),
    grossProfit: financeData.reduce((sum, f) => sum + f.grossProfit, 0),
    netProfit: financeData.reduce((sum, f) => sum + f.netProfit, 0),
    expenses: financeData.reduce((sum, f) => sum + f.operatingExpenses, 0),
    cashSales: financeData.reduce((sum, f) => sum + f.cashSales, 0),
    cardSales: financeData.reduce((sum, f) => sum + f.cardSales, 0),
    digitalSales: financeData.reduce((sum, f) => sum + f.digitalSales, 0)
  };

  const avgGrossMargin = financeData.length > 0 
    ? financeData.reduce((sum, f) => sum + f.grossMargin, 0) / financeData.length 
    : 0;

  const avgNetMargin = financeData.length > 0 
    ? financeData.reduce((sum, f) => sum + f.netMargin, 0) / financeData.length 
    : 0;

  const profitByBranch = financeData.map(f => ({
    name: f.branchName.replace('Cabang ', ''),
    profit: f.netProfit / 1000000
  })).sort((a, b) => b.profit - a.profit);

  const paymentMethodData = [
    { name: 'Cash', value: totalStats.cashSales, color: '#10B981' },
    { name: 'Kartu', value: totalStats.cardSales, color: '#3B82F6' },
    { name: 'Digital', value: totalStats.digitalSales, color: '#8B5CF6' }
  ];

  return (
    <HQLayout title="Laporan Keuangan" subtitle="Analisis finansial seluruh cabang">
      <div className="space-y-6">
        {/* Period Filter */}
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
                {p === 'month' ? 'Bulan Ini' : p === 'quarter' ? 'Kuartal Ini' : 'Tahun Ini'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFinanceData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalStats.revenue)}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalStats.grossProfit)}</p>
                <p className="text-sm text-gray-500">Gross Profit</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalStats.netProfit)}</p>
                <p className="text-sm text-gray-500">Net Profit</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgGrossMargin.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Avg Gross Margin</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgNetMargin.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Avg Net Margin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Trend Revenue & Profit (Juta)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`Rp ${value} Jt`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Net Profit per Cabang (Juta)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitByBranch} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(0)} Jt`, 'Net Profit']} />
                <Bar dataKey="profit" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Detail Keuangan per Cabang</h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cabang</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">COGS</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Gross Profit</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">OpEx</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Net Profit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.map((finance) => (
                    <tr key={finance.branchId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{finance.branchName}</p>
                            <p className="text-sm text-gray-500">{finance.branchCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(finance.revenue)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(finance.cogs)}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(finance.grossProfit)}</td>
                      <td className="py-3 px-4 text-right text-red-600">{formatCurrency(finance.operatingExpenses)}</td>
                      <td className="py-3 px-4 text-right text-purple-600 font-bold">{formatCurrency(finance.netProfit)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {finance.grossMargin}%
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                            {finance.netMargin}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(totalStats.revenue)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(financeData.reduce((s, f) => s + f.cogs, 0))}</td>
                    <td className="py-3 px-4 text-right text-green-600">{formatCurrency(totalStats.grossProfit)}</td>
                    <td className="py-3 px-4 text-right text-red-600">{formatCurrency(totalStats.expenses)}</td>
                    <td className="py-3 px-4 text-right text-purple-600">{formatCurrency(totalStats.netProfit)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm">
                        Avg {avgNetMargin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
