import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import BranchSelector from '@/components/settings/BranchSelector';
import { useBranches } from '@/hooks/useBranches';
import { 
  ShoppingCart, Receipt, BarChart3, History, Clock, Users, 
  Package, TrendingUp, TrendingDown, DollarSign, Boxes,
  ArrowRight, CreditCard, ChevronRight, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Brush
} from 'recharts';

const PosPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { branches, selectedBranch, setSelectedBranch } = useBranches();
  const MOCK_POS_DASH = { todaySales: 18500000, todayTransactions: 85, avgTransaction: 217647, topProducts: [{ name: 'Paracetamol 500mg', qty: 28, revenue: 420000 }, { name: 'Vitamin C', qty: 22, revenue: 110000 }], salesTrend: [{ date: '2026-03-09', amount: 15200000 }, { date: '2026-03-10', amount: 16800000 }, { date: '2026-03-11', amount: 14500000 }, { date: '2026-03-12', amount: 17200000 }, { date: '2026-03-13', amount: 19100000 }, { date: '2026-03-14', amount: 16900000 }, { date: '2026-03-15', amount: 18500000 }], paymentMethods: { cash: 8500000, qris: 5200000, transfer: 3100000, card: 1700000 } };
  const [dashboardData, setDashboardData] = useState<any>(MOCK_POS_DASH);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('7d');

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [selectedPeriod, selectedBranch]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period: selectedPeriod });
      if (selectedBranch) {
        params.append('branchId', selectedBranch.id);
      }
      const response = await fetch(`/api/pos/dashboard-stats?${params}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(MOCK_POS_DASH);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat POS...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const features = [
    {
      title: "Kasir",
      description: "Proses transaksi penjualan",
      icon: CreditCard,
      color: "bg-success",
      href: "/pos/cashier",
      primary: true
    },
    {
      title: "Transaksi",
      description: "Lihat semua transaksi",
      icon: ShoppingCart,
      color: "bg-primary",
      href: "/pos/transactions",
    },
    {
      title: "Struk & Invoice",
      description: "Kelola struk penjualan",
      icon: Receipt,
      color: "bg-info",
      href: "/pos/receipts",
    },
    {
      title: "Laporan",
      description: "Analisis penjualan",
      icon: BarChart3,
      color: "bg-warning",
      href: "/pos/reports",
    },
    {
      title: "Shift",
      description: "Kelola shift kasir",
      icon: Clock,
      color: "bg-danger",
      href: "/pos/shifts",
    },
    {
      title: "Pelanggan",
      description: "Data pelanggan",
      icon: Users,
      color: "bg-secondary",
      href: "/customers",
    },
    {
      title: "Stok",
      description: "Kelola inventory",
      icon: Boxes,
      color: "bg-dark",
      href: "/inventory",
    },
    {
      title: "Riwayat",
      description: "Riwayat transaksi",
      icon: History,
      color: "bg-primary",
      href: "/pos/history",
    },
  ];

  const colorMap: Record<string, string> = {
    'bg-success': 'bg-green-500',
    'bg-primary': 'bg-blue-500',
    'bg-info': 'bg-cyan-500',
    'bg-warning': 'bg-yellow-500',
    'bg-danger': 'bg-red-500',
    'bg-secondary': 'bg-gray-500',
    'bg-dark': 'bg-gray-800',
  };


  return (
    <DashboardLayout>
      <Head>
        <title>Point of Sale (POS) | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header Card - Professional & Elegant */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Kasir</h1>
                <p className="text-blue-100 mt-1">Kelola transaksi penjualan dengan mudah dan cepat</p>
              </div>
            </div>
            <Link 
              href="/pos/cashier"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <CreditCard className="w-5 h-5" />
              Buka Kasir
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Branch Selector */}
        {branches.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onSelect={setSelectedBranch}
            />
          </div>
        )}

        {/* Stats Cards - Bootstrap Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Transaksi Hari Ini */}
          <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : dashboardData?.today?.transactions || 0}
                </p>
                {dashboardData?.changes?.transactions !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${
                    dashboardData?.changes?.transactions > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardData?.changes?.transactions > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(dashboardData?.changes?.transactions || 0)}%
                  </span>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Penjualan */}
          <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Penjualan</p>
                <p className="text-xl font-bold text-gray-800">
                  {loading ? '...' : formatCurrency(dashboardData?.today?.sales || 0)}
                </p>
                {dashboardData?.changes?.sales !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${
                    dashboardData?.changes?.sales > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardData?.changes?.sales > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(dashboardData?.changes?.sales || 0)}%
                  </span>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Produk Terjual */}
          <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Produk Terjual</p>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? '...' : dashboardData?.today?.items || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Rata-rata Transaksi */}
          <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Rata-rata Transaksi</p>
                <p className="text-xl font-bold text-gray-800">
                  {loading ? '...' : formatCurrency(dashboardData?.today?.avgTransaction || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Bootstrap Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales Trend Chart - Area Chart with Recharts */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="text-lg font-semibold text-gray-800">Trend Penjualan</h5>
                  <p className="text-sm text-gray-500">
                    {selectedPeriod === '7d' && '7 hari terakhir'}
                    {selectedPeriod === '30d' && '30 hari terakhir'}
                    {selectedPeriod === '3m' && '3 bulan terakhir'}
                    {selectedPeriod === '6m' && '6 bulan terakhir'}
                    {selectedPeriod === '1y' && '1 tahun terakhir'}
                  </p>
                </div>
              </div>
              
              {/* Period Filter */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { value: '7d' as const, label: '7 Hari' },
                  { value: '30d' as const, label: '30 Hari' },
                  { value: '3m' as const, label: '3 Bulan' },
                  { value: '6m' as const, label: '6 Bulan' },
                  { value: '1y' as const, label: '1 Tahun' }
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedPeriod === period.value
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : dashboardData?.salesTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData.salesTrend.map((item: any) => ({
                      ...item,
                      date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                      salesFormatted: item.sales
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Jt`}
                      width={45}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Penjualan']}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      fill="url(#colorSales)" 
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                    {dashboardData.salesTrend.length > 14 && (
                      <Brush 
                        dataKey="date" 
                        height={30} 
                        stroke="#3B82F6"
                        fill="#F3F4F6"
                        travellerWidth={8}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Calendar className="w-12 h-12 mb-2 text-gray-300" />
                  <p>Tidak ada data penjualan</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="text-lg font-semibold text-gray-800">Metode Pembayaran</h5>
                <p className="text-sm text-gray-500">30 hari terakhir</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : dashboardData?.paymentMethods ? (
                dashboardData.paymentMethods.map((item: any, index: number) => {
                  const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
                  const totalAmount = dashboardData.paymentMethods.reduce((sum: number, p: any) => sum + p.total, 0);
                  const percentage = totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(0) : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.method}</span>
                        <span className="font-medium text-gray-800">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${colors[index % colors.length]} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">Tidak ada data</div>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid - Bootstrap Style */}
        <div>
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Menu POS</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow text-center ${
                    feature.primary ? 'ring-2 ring-green-500 ring-offset-1' : ''
                  }`}
                >
                  <div className={`w-12 h-12 ${colorMap[feature.color]} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h6 className="font-semibold text-gray-800 text-sm">{feature.title}</h6>
                  <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top Products - Bootstrap Style */}
        {dashboardData?.topProducts?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-800">Produk Terlaris</h5>
              <span className="text-sm text-gray-500">7 hari terakhir</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">#</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Produk</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Qty</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Penjualan</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topProducts.map((product: any, index: number) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                          'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-800">{product.name}</td>
                      <td className="py-3 px-3 text-right text-gray-600">{product.quantity}</td>
                      <td className="py-3 px-3 text-right font-semibold text-green-600">{formatCurrency(product.sales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PosPage;
