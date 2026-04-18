import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Users,
  Package,
  AlertTriangle,
  ChefHat,
  Utensils,
  Calendar,
  ArrowRight,
  Loader2,
  Building2,
  BarChart3,
  Settings,
  PieChart,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Crown,
  UserCircle2,
  ShoppingCart,
  Briefcase,
} from 'lucide-react';
import { useBusinessType } from '@/contexts/BusinessTypeContext';
import { OpanelHeroOrbs, OpanelRestoMark, OpanelWaveDivider } from '@/components/opanel/OpanelDecorations';
import type { OpanelInsightsPayload } from '@/components/opanel/OpanelDashboardCharts';
import OpanelWorkforcePanel from '@/components/opanel/OpanelWorkforcePanel';
import type { OpanelWorkforceInsight } from '@/types/opanel-workforce';

const OpanelDashboardCharts = dynamic(() => import('@/components/opanel/OpanelDashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  ),
});

type SummaryRes = {
  success: boolean;
  tenant: {
    businessName?: string;
    setupCompleted?: boolean;
    businessType?: { code?: string; name?: string } | null;
  } | null;
  branchCount: number;
  branches: { id: string; name: string; code: string; city?: string }[];
};

type StatsData = {
  mainStats: { sales: number; transactions: number; items: number; customers: number };
  changes: { sales: number; transactions: number; items: number };
  quickStats: { avgTransaction: number; lowStock: number; pendingOrders: number };
  alerts: { type: string; message: string; action?: string; link?: string }[];
};

type InsightsData = OpanelInsightsPayload & {
  lowStock: {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    minimum_stock: number;
    reorder_point: number;
    urgency: string;
  }[];
  needPurchase: { id: number; name: string; sku: string; quantity: number; suggestedQty: number }[];
  employees: {
    total: number;
    active: number;
    byStatus: { status: string; count: number }[];
    roster: { id: string; name: string; position?: string; department?: string; status?: string; employeeId?: string }[];
  };
  subscription: {
    plan: string;
    status: string;
    start?: Date | string | null;
    end?: Date | string | null;
    maxUsers: number;
    maxBranches: number;
    businessName?: string;
    daysRemaining: number | null;
  } | null;
  membership: { membersAndVip: number; totalCustomers: number; byTier: { tier: string; count: number }[] };
  workforce?: OpanelWorkforceInsight | null;
};

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

function StatCard({
  label,
  value,
  sub,
  trend,
  trendUp,
  icon: Icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  accent: 'teal' | 'violet' | 'amber' | 'rose';
}) {
  const rings = {
    teal: 'from-teal-500/20 to-emerald-600/10 text-teal-600 ring-teal-500/20',
    violet: 'from-violet-500/20 to-purple-600/10 text-violet-600 ring-violet-500/20',
    amber: 'from-amber-500/25 to-orange-600/10 text-amber-600 ring-amber-500/25',
    rose: 'from-rose-500/20 to-pink-600/10 text-rose-600 ring-rose-500/20',
  };
  const blurOrb = {
    teal: 'from-teal-400/30 to-emerald-500/20',
    violet: 'from-violet-400/30 to-purple-500/20',
    amber: 'from-amber-400/30 to-orange-500/20',
    rose: 'from-rose-400/30 to-pink-500/20',
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:shadow-md hover:ring-teal-500/15">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-50 blur-2xl ${blurOrb[accent]}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
          {trend !== undefined && (
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ${rings[accent]}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

export default function OwnerRestaurantDashboard() {
  const { businessType, hasModule } = useBusinessType();
  const isFnB = businessType === 'fnb' || hasModule('kitchen');
  const outletHref = isFnB ? '/dashboard-fnb' : '/dashboard';

  const [summary, setSummary] = useState<SummaryRes | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [sRes, dRes, iRes] = await Promise.all([
        fetch('/api/opanel/summary'),
        fetch('/api/dashboard/stats?period=today'),
        fetch('/api/opanel/dashboard-insights'),
      ]);
      const sJson = await sRes.json();
      const dJson = await dRes.json();
      const iJson = await iRes.json();
      if (!sRes.ok || !sJson.success) {
        setErr(sJson.error || 'Gagal memuat ringkasan bisnis');
      } else {
        setSummary(sJson);
      }
      if (dRes.ok && dJson.success && dJson.data) {
        setStats(dJson.data);
      }
      if (iRes.ok && iJson.success) {
        setInsights(iJson as InsightsData);
      }
    } catch {
      setErr('Koneksi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 rounded-3xl border border-slate-200/80 bg-white/80 py-24 shadow-sm backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-teal-400/30 blur-xl" />
          <Loader2 className="relative h-12 w-12 animate-spin text-teal-600" strokeWidth={2} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">Menyiapkan ringkasan</p>
          <p className="mt-1 text-xs text-slate-500">Statistik outlet & cabang Anda</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-2 w-10 animate-pulse rounded-full bg-slate-200"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const name = summary?.tenant?.businessName || 'Bisnis Anda';
  const btLabel = summary?.tenant?.businessType?.name || 'Restoran & F&B';
  const main = stats?.mainStats;
  const ch = stats?.changes;

  const actions = [
    { label: 'Kasir & penjualan', href: '/pos', icon: Receipt, desc: 'Transaksi & struk', grad: 'from-sky-500 to-blue-600' },
    { label: 'Meja & layanan', href: '/tables', icon: Utensils, desc: 'Floor plan', grad: 'from-violet-500 to-purple-600' },
    { label: 'Dapur', href: '/kitchen', icon: ChefHat, desc: 'Antrian masak', grad: 'from-orange-500 to-red-600' },
    { label: 'Reservasi', href: '/reservations', icon: Calendar, desc: 'Booking tamu', grad: 'from-teal-500 to-emerald-600' },
  ];

  const shortcuts = [
    { label: 'Laporan', href: '/reports', icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Keuangan', href: '/finance', icon: PieChart, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Inventori', href: '/inventory', icon: Package, color: 'text-amber-700 bg-amber-50' },
    { label: 'Pelanggan', href: '/customers', icon: Users, color: 'text-rose-600 bg-rose-50' },
    { label: 'Pengaturan', href: '/settings', icon: Settings, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {err && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white px-4 py-3 text-sm text-rose-900 shadow-sm">
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            {err}
          </span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow transition hover:bg-rose-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Muat ulang
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-violet-950 to-teal-900 p-8 text-white shadow-2xl shadow-slate-900/25 sm:p-10">
        <OpanelHeroOrbs className="absolute right-0 top-0 h-64 w-96 opacity-100" />
        <div className="pointer-events-none absolute -left-8 bottom-0 opacity-[0.07]">
          <OpanelRestoMark className="h-48 w-48 text-white" />
        </div>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Panel pemilik
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              <span className="font-semibold text-white">{btLabel}</span> — pantau performa hari ini, cabang, dan akses
              operasional dalam satu layar yang dirancang untuk keputusan cepat.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={outletHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-violet-950 shadow-lg transition hover:bg-teal-50"
              >
                Buka dasbor outlet
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/opanel/business"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <ShieldCheck className="h-4 w-4 text-teal-300" />
                Profil bisnis
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 lg:flex-col lg:items-stretch">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Performa hari ini</p>
              <p className="mt-1 text-2xl font-bold text-white">{formatRp(main?.sales ?? 0)}</p>
              <p className="mt-1 text-xs text-slate-400">{main?.transactions ?? 0} transaksi</p>
            </div>
          </div>
        </div>
        <OpanelWaveDivider className="h-10 text-slate-50 sm:h-12" />
      </section>

      {/* KPI */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Indikator utama</h3>
            <p className="mt-1 text-lg font-bold text-slate-900">Ringkasan outlet</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Segarkan
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Penjualan hari ini"
            value={formatRp(main?.sales ?? 0)}
            trend={ch ? `${ch.sales >= 0 ? '+' : ''}${ch.sales.toFixed(1)}% vs kemarin` : undefined}
            trendUp={ch ? ch.sales >= 0 : true}
            icon={Wallet}
            accent="teal"
          />
          <StatCard
            label="Transaksi"
            value={main?.transactions ?? 0}
            trend={ch ? `${ch.transactions >= 0 ? '+' : ''}${ch.transactions.toFixed(1)}% vs kemarin` : undefined}
            trendUp={ch ? ch.transactions >= 0 : true}
            icon={Receipt}
            accent="violet"
          />
          <StatCard
            label="Item terjual"
            value={main?.items ?? 0}
            sub="Total qty hari ini"
            icon={Package}
            accent="amber"
          />
          <StatCard
            label="Pelanggan (bulan)"
            value={main?.customers ?? 0}
            sub={`Rata transaksi ${formatRp(stats?.quickStats?.avgTransaction ?? 0)}`}
            icon={Users}
            accent="rose"
          />
        </div>
      </section>

      {/* Shortcuts strip */}
      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Akses bisnis</p>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((s) => {
            const I = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-teal-200 hover:bg-white hover:shadow-md"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                  <I className="h-4 w-4" strokeWidth={2} />
                </span>
                {s.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Grafik penjualan & transaksi */}
      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Analitik penjualan</h3>
          <p className="mt-1 text-lg font-bold text-slate-900">Grafik & komposisi pembayaran</p>
        </div>
        <OpanelDashboardCharts
          insights={
            insights
              ? {
                  dailySales: insights.dailySales,
                  todaySales: insights.todaySales,
                }
              : null
          }
        />
      </section>

      {/* Tim, jadwal shift & login per cabang */}
      {insights?.workforce && <OpanelWorkforcePanel workforce={insights.workforce} variant="dashboard" />}

      {/* Berlangganan SaaS + keanggotaan pelanggan */}
      {insights && (
        <section className="grid gap-4 lg:grid-cols-2">
          {insights.subscription ? (
            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 p-6 text-white shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <CreditCard className="h-6 w-6 text-teal-300" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Berlangganan Bedagang</p>
                    <p className="text-xl font-bold capitalize">{insights.subscription.plan || 'Basic'}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Status: <span className="font-semibold text-white">{insights.subscription.status}</span>
                    </p>
                  </div>
                </div>
                {insights.subscription.daysRemaining != null && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      insights.subscription.daysRemaining <= 7
                        ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                        : 'bg-white/10 text-teal-200'
                    }`}
                  >
                    {insights.subscription.daysRemaining < 0
                      ? 'Berakhir'
                      : `${insights.subscription.daysRemaining} hari lagi`}
                  </span>
                )}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <dt className="text-slate-400">Maks. pengguna</dt>
                  <dd className="mt-0.5 font-bold">{insights.subscription.maxUsers}</dd>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <dt className="text-slate-400">Maks. cabang</dt>
                  <dd className="mt-0.5 font-bold">{insights.subscription.maxBranches}</dd>
                </div>
                {insights.subscription.end && (
                  <div className="col-span-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                    <dt className="text-slate-400">Berlangganan hingga</dt>
                    <dd className="mt-0.5 font-semibold">
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'long',
                      }).format(new Date(insights.subscription.end as string))}
                    </dd>
                  </div>
                )}
              </dl>
              <Link
                href="/settings"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-200 hover:text-white"
              >
                Kelola paket & faktur <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Paket berlangganan</p>
              <p className="mt-2 text-xs leading-relaxed">
                Data paket akan tampil setelah tenant terhubung ke informasi langganan di database.
              </p>
            </div>
          )}
          <div
            className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ${
              !insights.subscription ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Crown className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">Keanggotaan pelanggan</p>
                <p className="text-xl font-bold text-slate-900">Program loyalitas</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Member & VIP</p>
                <p className="text-2xl font-bold text-slate-900">{insights?.membership?.membersAndVip ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Total pelanggan</p>
                <p className="text-2xl font-bold text-slate-900">{insights?.membership?.totalCustomers ?? 0}</p>
              </div>
            </div>
            {(insights?.membership?.byTier?.length ?? 0) > 0 && (
              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {insights!.membership.byTier.map((t) => (
                  <li key={t.tier} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{t.tier}</span>
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-800">
                      {t.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/loyalty-program"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:underline"
            >
              Kelola tier & reward <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Stok menipis & perlu pembelian */}
      {insights && (insights.lowStock.length > 0 || insights.needPurchase.length > 0) && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Package className="h-5 w-5 text-amber-600" />
                Stok menipis / akan habis
              </h3>
              <Link href="/inventory" className="text-xs font-bold text-teal-700 hover:underline">
                Inventori
              </Link>
            </div>
            {insights.lowStock.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada SKU di bawah ambang minimum.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {insights.lowStock.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.sku}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-slate-900">{Number(row.quantity).toFixed(0)} stok</p>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          row.urgency === 'habis'
                            ? 'text-rose-600'
                            : row.urgency === 'reorder'
                              ? 'text-amber-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {row.urgency === 'habis' ? 'Habis' : row.urgency === 'reorder' ? 'Reorder' : 'Menipis'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <ShoppingCart className="h-5 w-5 text-teal-600" />
                Disarankan dibeli
              </h3>
              <Link href="/inventory/receive" className="text-xs font-bold text-teal-700 hover:underline">
                Penerimaan
              </Link>
            </div>
            {insights.needPurchase.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada item prioritas pembelian.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {insights.needPurchase.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.sku}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <p className="font-bold text-teal-900">Qty: {Number(row.quantity).toFixed(0)}</p>
                      <p className="text-slate-600">Saran order ~{row.suggestedQty}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Karyawan */}
      {insights && insights.employees.total > 0 && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Briefcase className="h-5 w-5 text-violet-600" />
                Karyawan
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {insights.employees.active} aktif dari {insights.employees.total} total terdaftar
              </p>
            </div>
            <Link
              href="/employees/schedules"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Jadwal & shift
            </Link>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {insights.employees.byStatus.map((s) => (
              <span
                key={s.status}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {s.status}
                <span className="rounded-full bg-violet-100 px-1.5 py-0 text-[10px] text-violet-900">{s.count}</span>
              </span>
            ))}
          </div>
          <ul className="divide-y divide-slate-100">
            {insights.employees.roster.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserCircle2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{e.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[e.position, e.department].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    String(e.status).toUpperCase() === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(summary?.branchCount ?? 0) > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/30 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md">
                  <Building2 className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">Cabang & outlet</h3>
                  <p className="text-sm text-slate-500">{summary?.branchCount} lokasi terdaftar</p>
                </div>
              </div>
              <Link
                href="/opanel/outlets"
                className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900"
              >
                Kelola
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <ul className="divide-y divide-slate-100">
            {(summary?.branches || []).slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.code}</p>
                </div>
                <span className="shrink-0 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800 ring-1 ring-teal-100">
                  Outlet
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats?.alerts && stats.alerts.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Perlu perhatian
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.alerts.map((a, i) => (
              <Link
                key={i}
                href={a.link || '/inventory'}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <span className="text-sm font-medium text-amber-950">{a.message}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-800 group-hover:underline">
                  {a.action || 'Buka'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Operasional cepat</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-25 blur-2xl transition group-hover:opacity-40 ${a.grad}`}
                />
                <div
                  className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${a.grad}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <p className="relative font-bold text-slate-900">{a.label}</p>
                <p className="relative mt-1 text-xs text-slate-500">{a.desc}</p>
                <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-700">
                  Buka modul
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
