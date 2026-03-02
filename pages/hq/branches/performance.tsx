import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Award,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Medal,
  Crown,
  BarChart3,
  Filter
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area
} from 'recharts';

interface BranchPerformance {
  id: string;
  code: string;
  name: string;
  city: string;
  manager: string;
  metrics: {
    salesTarget: number;
    salesActual: number;
    achievement: number;
    transactions: number;
    avgTicket: number;
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
    employeeCount: number;
    customerSatisfaction: number;
    stockTurnover: number;
  };
  growth: {
    sales: number;
    transactions: number;
    profit: number;
  };
  rank: number;
  trend: 'up' | 'down' | 'stable';
  monthlyData: { month: string; sales: number; target: number; profit: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BranchPerformancePage() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedBranch, setSelectedBranch] = useState<BranchPerformance | null>(null);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/branches/performance?period=${period}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.branches) setBranches(payload.branches);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPerformance();
  }, [period]);

  if (!mounted) {
    return null;
  }

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

  return (
    <HQLayout title="Performa Cabang" subtitle="Analisis kinerja seluruh cabang">
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
                {p === 'month' ? 'Bulan Ini' : p === 'quarter' ? 'Kuartal' : 'Tahun'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPerformance}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Total Penjualan</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalStats.totalSales)}</p>
            <p className="text-sm opacity-80 mt-1">Target: {formatCurrency(totalStats.totalTarget)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Avg Achievement</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.avgAchievement.toFixed(1)}%</p>
            <p className="text-sm opacity-80 mt-1">{totalStats.onTarget}/{branches.length} on target</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Total Cabang</span>
            </div>
            <p className="text-2xl font-bold">{branches.length}</p>
            <p className="text-sm opacity-80 mt-1">Aktif semua</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Total Transaksi</span>
            </div>
            <p className="text-2xl font-bold">{branches.reduce((s, b) => s + b.metrics.transactions, 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Avg Satisfaction</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.avgSatisfaction.toFixed(1)}/5.0</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Perbandingan Sales vs Target (Juta)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(0)} Jt`, '']} />
                  <Legend />
                  <Bar dataKey="sales" name="Aktual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="achievement" name="Achievement %" stroke="#10B981" strokeWidth={2} yAxisId={0} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Radar Performa (Top 5)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="branch" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 120]} tick={{ fontSize: 10 }} />
                  <Radar name="Sales" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="Profit" dataKey="profit" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Radar name="Satisfaction" dataKey="satisfaction" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Ranking Performa Cabang</h3>
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
                    <th className="text-center py-3 px-4 font-medium text-gray-500 w-16">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cabang</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Sales</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Achievement</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Growth</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Profit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Margin</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Satisfaction</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.sort((a, b) => a.rank - b.rank).map((branch) => (
                    <tr 
                      key={branch.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        branch.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''
                      }`}
                      onClick={() => setSelectedBranch(branch)}
                    >
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {getRankIcon(branch.rank)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{branch.name}</p>
                            <p className="text-sm text-gray-500">{branch.code} • {branch.manager}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(branch.metrics.salesActual)}</p>
                        <p className="text-xs text-gray-500">Target: {formatCurrency(branch.metrics.salesTarget)}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                branch.metrics.achievement >= 100 ? 'bg-green-500' : 
                                branch.metrics.achievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(branch.metrics.achievement, 100)}%` }}
                            />
                          </div>
                          <span className={`font-bold text-sm ${
                            branch.metrics.achievement >= 100 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {branch.metrics.achievement}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          branch.growth.sales >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {getTrendIcon(branch.trend, branch.growth.sales)}
                          {branch.growth.sales >= 0 ? '+' : ''}{branch.growth.sales}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-medium">
                        {formatCurrency(branch.metrics.netProfit)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                          {branch.metrics.netMargin}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{branch.metrics.customerSatisfaction}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {branch.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                        ) : branch.trend === 'down' ? (
                          <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedBranch?.name} - Trend 6 Bulan</h3>
                <p className="text-sm text-gray-500">Manager: {selectedBranch?.manager}</p>
              </div>
              <button
                onClick={() => setSelectedBranch(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Tutup
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={selectedBranch?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`Rp ${value} Jt`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
                  <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
