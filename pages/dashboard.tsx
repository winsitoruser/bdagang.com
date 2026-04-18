import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  FaArrowUp,
  FaArrowDown,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaMoneyBillWave,
  FaWarehouse,
  FaReceipt,
  FaClock,
  FaChartBar,
  FaChartPie,
  FaExclamationTriangle,
  FaBell,
  FaStar,
  FaTicketAlt,
  FaUtensils,
  FaCalendar,
} from 'react-icons/fa';
import { ChefHat, UtensilsCrossed, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useBusinessType } from '@/contexts/BusinessTypeContext';
import { cn } from '@/lib/utils';

const PERIODS = [
  { id: 'today' as const, label: 'Hari ini' },
  { id: 'week' as const, label: 'Minggu ini' },
  { id: 'month' as const, label: 'Bulan ini' },
];

const CATEGORY_COLORS = ['bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/80', className)} aria-hidden />;
}

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { businessType, hasModule, isLoading: isLoadingBusinessType } = useBusinessType();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [salesPeriod, setSalesPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);

  const isFnB = businessType === 'fnb' || hasModule('kitchen');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && !isLoadingBusinessType) {
      if (isFnB) {
        router.push('/dashboard-fnb');
      }
    }
  }, [session, status, router, isFnB, isLoadingBusinessType, businessType]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchKitchenOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/kitchen/orders?status=new&limit=6');
      const data = await response.json();
      if (data.success) {
        setKitchenOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      setKitchenOrders([]);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/stats?period=${salesPeriod}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [salesPeriod]);

  useEffect(() => {
    if (session) {
      void fetchDashboardData();
      if (isFnB) {
        void fetchKitchenOrders();
      }
    }
  }, [session, salesPeriod, isFnB, fetchDashboardData, fetchKitchenOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatSalesAmount = (amount: number) => {
    if (!amount || isNaN(amount) || amount === 0) {
      return 'Rp 0';
    }
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)} Jt`;
    }
    return formatCurrency(amount);
  };

  const stats = useMemo(() => {
    const ph = loading && !dashboardData;
    const d = dashboardData;
    return [
      {
        title: 'Penjualan (hari ini)',
        value: ph ? '—' : formatCurrency(d?.mainStats?.sales || 0),
        change: ph ? '—' : `${d?.changes?.sales >= 0 ? '+' : ''}${d?.changes?.sales?.toFixed(1) || 0}%`,
        changeText: 'vs kemarin',
        isPositive: (d?.changes?.sales || 0) >= 0,
        icon: FaMoneyBillWave,
        gradient: 'from-emerald-500 to-teal-600',
        ring: 'ring-emerald-500/20',
      },
      {
        title: 'Transaksi (hari ini)',
        value: ph ? '—' : String(d?.mainStats?.transactions || 0),
        change: ph ? '—' : `${d?.changes?.transactions >= 0 ? '+' : ''}${d?.changes?.transactions?.toFixed(1) || 0}%`,
        changeText: 'vs kemarin',
        isPositive: (d?.changes?.transactions || 0) >= 0,
        icon: FaShoppingCart,
        gradient: 'from-sky-500 to-blue-600',
        ring: 'ring-sky-500/20',
      },
      {
        title: 'Unit terjual',
        value: ph ? '—' : String(d?.mainStats?.items || 0),
        change: ph ? '—' : `${d?.changes?.items >= 0 ? '+' : ''}${d?.changes?.items?.toFixed(1) || 0}%`,
        changeText: 'vs kemarin',
        isPositive: (d?.changes?.items || 0) >= 0,
        icon: FaBoxOpen,
        gradient: 'from-violet-500 to-indigo-600',
        ring: 'ring-violet-500/20',
      },
      {
        title: 'Pelanggan aktif (bulan ini)',
        value: ph ? '—' : String(d?.mainStats?.customers || 0),
        change: '—',
        changeText: 'basis data',
        isPositive: true,
        icon: FaUsers,
        gradient: 'from-amber-500 to-orange-600',
        ring: 'ring-amber-500/20',
      },
    ];
  }, [loading, dashboardData]);

  const quickStats = [
    {
      label: 'Rata-rata nilai transaksi',
      value: loading && !dashboardData ? '—' : formatCurrency(dashboardData?.quickStats?.avgTransaction || 0),
      icon: FaReceipt,
    },
    {
      label: 'SKU stok menipis',
      value: loading && !dashboardData ? '—' : `${dashboardData?.quickStats?.lowStock || 0} item`,
      icon: FaWarehouse,
      alert: (dashboardData?.quickStats?.lowStock || 0) > 0,
    },
    {
      label: 'Pesanan tertunda',
      value: loading && !dashboardData ? '—' : String(dashboardData?.quickStats?.pendingOrders || 0),
      icon: FaClock,
    },
  ];

  const topProducts =
    loading && !dashboardData
      ? []
      : (dashboardData?.topProducts || []).map((p: any) => ({
    name: p.name,
    sold: p.sold,
    revenue: formatCurrency(p.revenue),
    trend: p.trend,
  }));

  const recentTransactions =
    loading && !dashboardData
      ? []
      : (dashboardData?.recentTransactions || []).map((t: any) => ({
        id: t.id,
        time: t.time,
        customer: t.customer,
        amount: formatCurrency(t.amount),
        status: t.status,
      }));

  const alerts = loading && !dashboardData ? [] : dashboardData?.alerts || [];

  const colors = [
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
  ];
  const salesData =
    loading && !dashboardData
      ? []
      : (dashboardData?.salesByCashier || []).map((s: any, idx: number) => ({
        cashier: s.cashier,
        sales: s.sales,
        transactions: s.transactions,
        color: colors[idx % colors.length],
      }));

  const maxSales = salesData.length > 0 ? Math.max(...salesData.map((d: any) => d.sales || 0)) : 0;
  const totalSalesCashier = salesData.reduce((sum: number, d: any) => sum + (d.sales || 0), 0);
  const totalTransactionsCashier = salesData.reduce((sum: number, d: any) => sum + (d.transactions || 0), 0);

  const categoryData = useMemo(() => {
    if (loading && !dashboardData) return [];
    return (dashboardData?.categoryData || []).map((c: any, idx: number) => ({
      name: c.name,
      value: c.value,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
  }, [loading, dashboardData]);

  const topCategory = useMemo(() => {
    if (!categoryData.length) return null;
    return categoryData.reduce((best: any, cur: any) => (cur.value > best.value ? cur : best), categoryData[0]);
  }, [categoryData]);

  const showKpiSkeleton = loading && !dashboardData;

  const periodLabel =
    salesPeriod === 'today' ? 'hari ini' : salesPeriod === 'week' ? 'minggu ini' : 'bulan ini';

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600" aria-hidden />
          <p className="text-sm font-medium text-slate-600">Memuat sesi…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | BEDAGANG</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        {/* Welcome */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 text-white shadow-xl shadow-slate-900/20 md:p-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100">
                Ringkasan operasional
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Halo,{' '}
                <span className="bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
                  {session?.user?.name || 'Pengguna'}
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300">
                Pantau performa penjualan, kasir, dan stok dalam satu layar. Data penjualan utama di bawah
                mengacu pada <span className="font-semibold text-white">hari berjalan</span>; grafik kasir
                mengikuti periode yang Anda pilih.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 disabled:opacity-50"
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
                  Muat ulang data
                </button>
                <Link
                  href="/reports"
                  className="text-sm font-semibold text-sky-200 underline-offset-4 hover:text-white hover:underline"
                >
                  Buka laporan lengkap
                </Link>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-right backdrop-blur-md">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Waktu lokal</p>
              <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {currentTime.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-4 w-4 text-sky-100" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                    <p className="flex items-center gap-2 truncate text-lg font-bold tabular-nums">
                      {stat.value}
                      {stat.alert && <FaExclamationTriangle className="h-4 w-4 shrink-0 text-amber-300" />}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* KPI skeleton / grid */}
        {showKpiSkeleton ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200/80 shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="group border border-slate-200/90 bg-white/90 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-4',
                          stat.gradient,
                          stat.ring,
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {stat.change !== '—' && (
                        <div
                          className={cn(
                            'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold',
                            stat.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                          )}
                        >
                          {stat.isPositive ? (
                            <FaArrowUp className="h-3 w-3" />
                          ) : (
                            <FaArrowDown className="h-3 w-3" />
                          )}
                          {stat.change}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.title}</h3>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{stat.changeText}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {alerts.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {alerts.map((alert: any, idx: number) => (
              <Card
                key={idx}
                className={cn(
                  'border-l-4 shadow-sm',
                  alert.type === 'warning'
                    ? 'border-l-amber-500 bg-amber-50/50 border-slate-200/80'
                    : 'border-l-sky-500 bg-sky-50/50 border-slate-200/80',
                )}
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <FaBell
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0',
                        alert.type === 'warning' ? 'text-amber-600' : 'text-sky-600',
                      )}
                    />
                    <p className="text-sm font-semibold leading-snug text-slate-900">{alert.message}</p>
                  </div>
                  <Link href={alert.link}>
                    <span
                      className={cn(
                        'inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white transition sm:w-auto',
                        alert.type === 'warning'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-sky-600 hover:bg-sky-700',
                      )}
                    >
                      {alert.action}
                    </span>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border border-slate-200/90 shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <FaChartBar className="h-5 w-5 text-sky-600" />
                  Penjualan per kasir
                </CardTitle>
                <CardDescription>
                  Agregat transaksi selesai untuk periode: <strong>{periodLabel}</strong>
                </CardDescription>
              </div>
              <div className="flex shrink-0 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSalesPeriod(p.id)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
                      salesPeriod === p.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading && !dashboardData && salesData.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : salesData.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">Belum ada data kasir untuk periode ini</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Transaksi yang statusnya selesai akan muncul di sini setelah ada penjualan.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {salesData.map((data: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex w-full items-center gap-3 sm:w-52 shrink-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{data.cashier}</p>
                            <p className="text-xs text-slate-500">{data.transactions} transaksi</p>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn(
                                  'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r shadow-sm transition-all duration-500',
                                  data.color,
                                )}
                                style={{
                                  width: `${maxSales ? Math.max(8, (data.sales / maxSales) * 100) : 0}%`,
                                }}
                              />
                            </div>
                            <div className="w-28 shrink-0 text-right sm:w-32">
                              <p className="text-sm font-bold tabular-nums text-slate-900">
                                {formatSalesAmount(data.sales)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {totalSalesCashier
                                  ? `${((data.sales / totalSalesCashier) * 100).toFixed(1)}%`
                                  : '0%'}{' '}
                                dari total
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total penjualan</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                        {formatSalesAmount(totalSalesCashier)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total transaksi</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-sky-600">{totalTransactionsCashier}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rata-rata / kasir</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">
                        {salesData.length > 0 ? formatSalesAmount(totalSalesCashier / salesData.length) : '—'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <FaChartPie className="h-5 w-5 text-violet-600" />
                Distribusi kategori
              </CardTitle>
              <CardDescription>Proporsi penjualan per kategori (agregat)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {categoryData.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
                  Tidak ada data kategori.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {categoryData.map((cat: any, idx: number) => (
                      <div key={idx}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', cat.color)} />
                            <span className="truncate text-sm font-medium text-slate-700">{cat.name}</span>
                          </div>
                          <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">{cat.value}%</span>
                        </div>
                        <Progress value={cat.value} className="h-2 bg-slate-100" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4 text-center">
                      <p className="text-xs font-medium text-slate-500">Kategori terbesar</p>
                      <p className="mt-1 truncate text-base font-bold text-sky-700">{topCategory?.name ?? '—'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4 text-center">
                      <p className="text-xs font-medium text-slate-500">Jumlah grup</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{categoryData.length}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border border-slate-200/90 shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <FaReceipt className="h-5 w-5 text-emerald-600" />
                  Produk terlaris (hari ini)
                </CardTitle>
                <CardDescription>Empat SKU dengan nilai penjualan tertinggi</CardDescription>
              </div>
              <Link
                href="/reports"
                className="text-sm font-semibold text-sky-600 hover:text-sky-800"
              >
                Laporan →
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {topProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
                  Belum ada penjualan produk hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-sky-200/60 hover:bg-sky-50/30"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold text-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.sold} unit terjual</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold tabular-nums text-slate-900">{product.revenue}</p>
                        <p className="text-xs font-medium text-emerald-600">{product.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">Aksi cepat</CardTitle>
              <CardDescription>
                {isFnB ? 'Pintasan operasional dapur & meja' : 'Modul yang paling sering dipakai'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isFnB ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <QuickTile href="/kitchen/display" title="Kitchen display" subtitle="KDS" from="from-orange-500" to="to-red-600" icon={<UtensilsCrossed className="h-5 w-5 text-white" />} />
                  <QuickTile href="/kitchen/orders" title="Antrian" subtitle="Pesanan" from="from-violet-500" to="to-purple-600" icon={<ClipboardList className="h-5 w-5 text-white" />} />
                  <QuickTile href="/tables" title="Meja" subtitle="Denah" from="from-teal-500" to="to-teal-600" icon={<FaUtensils className="h-5 w-5 text-white" />} />
                  <QuickTile href="/reservations" title="Reservasi" subtitle="Booking" from="from-indigo-500" to="to-indigo-600" icon={<FaCalendar className="h-5 w-5 text-white" />} />
                  <QuickTile href="/kitchen/recipes" title="Resep" subtitle="Menu" from="from-emerald-500" to="to-teal-600" icon={<ChefHat className="h-5 w-5 text-white" />} />
                  <QuickTile href="/pos/cashier" title="Kasir" subtitle="POS" from="from-sky-500" to="to-blue-600" icon={<FaShoppingCart className="h-5 w-5 text-white" />} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <QuickTile href="/pos/cashier" title="Kasir" subtitle="Transaksi" from="from-sky-500" to="to-blue-600" icon={<FaShoppingCart className="h-5 w-5 text-white" />} />
                  <QuickTile href="/inventory" title="Stok" subtitle="Inventori" from="from-emerald-500" to="to-emerald-600" icon={<FaBoxOpen className="h-5 w-5 text-white" />} />
                  <QuickTile href="/reports" title="Laporan" subtitle="Analitik" from="from-violet-500" to="to-purple-600" icon={<FaChartBar className="h-5 w-5 text-white" />} />
                  <QuickTile href="/customers" title="Pelanggan" subtitle="CRM" from="from-amber-500" to="to-orange-600" icon={<FaUsers className="h-5 w-5 text-white" />} />
                  <QuickTile href="/promo-voucher" title="Promo" subtitle="Voucher" from="from-rose-500" to="to-pink-600" icon={<FaTicketAlt className="h-5 w-5 text-white" />} />
                  <QuickTile href="/loyalty-program" title="Loyalty" subtitle="Member" from="from-yellow-500" to="to-amber-600" icon={<FaStar className="h-5 w-5 text-white" />} />
                  <QuickTile href="/tables" title="Meja" subtitle="F&B" from="from-teal-500" to="to-teal-600" icon={<FaUtensils className="h-5 w-5 text-white" />} />
                  <QuickTile href="/reservations" title="Reservasi" subtitle="Booking" from="from-indigo-500" to="to-indigo-600" icon={<FaCalendar className="h-5 w-5 text-white" />} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isFnB && kitchenOrders.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                  Pesanan dapur baru
                </h2>
                <p className="text-sm text-slate-600">Perlu segera diproses di tampilan dapur</p>
              </div>
              <Link
                href="/kitchen/display"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-orange-600 hover:to-red-700"
              >
                Buka KDS
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kitchenOrders.slice(0, 6).map((order: any) => (
                <Card
                  key={order.id}
                  className="border-2 border-orange-200/90 shadow-sm transition hover:border-orange-400 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                          <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{order.order_number}</p>
                          <p className="truncate text-xs text-slate-500">
                            {order.table_number ? `Meja ${order.table_number}` : order.customer_name || 'Takeaway'}
                          </p>
                        </div>
                      </div>
                      {order.priority === 'urgent' && (
                        <Badge className="shrink-0 bg-red-600 text-white hover:bg-red-600">Urgent</Badge>
                      )}
                    </div>

                    <div className="mb-3 space-y-2">
                      {order.items?.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="rounded-lg bg-slate-50 p-2 text-sm text-slate-800">
                          <span className="font-semibold">{item.quantity}×</span> {item.name}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-slate-500">+{order.items.length - 2} item lainnya</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center text-xs text-slate-600">
                        <FaClock className="mr-1 h-3 w-3" />
                        <span>{order.estimated_time || 15} menit</span>
                      </div>
                      <Link href="/kitchen/display" className="text-xs font-semibold text-orange-600 hover:text-orange-800">
                        Detail →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Card className="border border-slate-200/90 shadow-sm">
          <CardHeader className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <FaReceipt className="h-5 w-5 text-sky-600" />
                Transaksi terbaru
              </CardTitle>
              <CardDescription>Empat transaksi terakhir hari ini</CardDescription>
            </div>
            <Link href="/pos/transactions" className="text-sm font-semibold text-sky-600 hover:text-sky-800">
              Semua transaksi →
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {recentTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
                Belum ada transaksi selesai hari ini.
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((trx: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-sky-200/80 hover:bg-sky-50/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                        <FaShoppingCart className="h-5 w-5 text-sky-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{trx.id}</p>
                        <p className="text-sm text-slate-500">{trx.customer}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="font-bold tabular-nums text-slate-900">{trx.amount}</p>
                        <p className="text-xs text-slate-500">{trx.time}</p>
                      </div>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        Sukses
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

function QuickTile({
  href,
  title,
  subtitle,
  from,
  to,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  from: string;
  to: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="group block min-h-[5.5rem] overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={cn(
          'relative flex h-full flex-col justify-between bg-gradient-to-br p-3.5 text-white',
          from,
          to,
        )}
      >
        <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 transition group-hover:bg-white/15" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="rounded-lg bg-white/20 p-2 ring-1 ring-white/20">{icon}</div>
        </div>
        <div className="relative mt-2">
          <p className="text-sm font-bold leading-tight">{title}</p>
          <p className="text-[11px] font-medium text-white/85">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

export default Dashboard;
