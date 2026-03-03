import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import HQLayout from '@/components/hq/HQLayout';
import {
  CreditCard,
  Package,
  Users,
  Building2,
  ShoppingBag,
  Receipt,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Download,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  Warehouse,
  Star,
  Info,
  FileText,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface BillingData {
  tenant: {
    id: string;
    businessName: string;
    businessCode: string;
    businessEmail: string;
    status: string;
    kybStatus: string;
    businessStructure: string;
    isHq: boolean;
  };
  subscription: {
    id?: string;
    status: string;
    startedAt?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    trialEndsAt?: string;
    cancelAtPeriodEnd?: boolean;
    daysLeft?: number | null;
    plan: {
      id?: string;
      name: string;
      description?: string;
      price: number;
      currency: string;
      billingInterval: string;
      features?: Record<string, boolean>;
      maxUsers?: number;
      maxBranches?: number;
      maxProducts?: number;
      maxTransactions?: number;
    } | null;
  };
  usage: {
    current: { users: number; branches: number; products: number; transactions: number; employees: number; warehouses: number };
    limits: { maxUsers: number; maxBranches: number; maxProducts: number; maxTransactions: number };
    percentages: { users: number; branches: number; products: number; transactions: number };
  };
  modules: Array<{
    id: string;
    name: string;
    code: string;
    category: string;
    pricingTier: string;
    enabledAt: string;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
    currency: string;
    issuedDate: string;
    dueDate: string;
    paidDate: string | null;
  }>;
  billingHistory: Array<{
    id: string;
    periodStart: string;
    periodEnd: string;
    baseAmount: number;
    overageAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    dueDate: string;
  }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-blue-100 text-blue-700',
    past_due: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    draft: 'bg-gray-100 text-gray-600',
    overdue: 'bg-red-100 text-red-700',
    processing: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
  };
  return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: 'Aktif',
    trial: 'Trial',
    past_due: 'Jatuh Tempo',
    cancelled: 'Dibatalkan',
    expired: 'Kadaluarsa',
    paid: 'Lunas',
    pending: 'Menunggu',
    draft: 'Draft',
    overdue: 'Terlambat',
    processing: 'Diproses',
    failed: 'Gagal',
  };
  return map[status?.toLowerCase()] || status;
};

// ─── Components ─────────────────────────────────────────────────────────────

function UsageMeter({ label, icon: Icon, current, limit, percentage, color }: {
  label: string;
  icon: React.ElementType;
  current: number;
  limit: number;
  percentage: number;
  color: string;
}) {
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;
  const barColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : color;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isDanger ? 'bg-red-50' : isWarning ? 'bg-yellow-50' : 'bg-blue-50'}`}>
            <Icon className={`w-4.5 h-4.5 ${isDanger ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        {isDanger && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-gray-900">{current.toLocaleString('id-ID')}</span>
        <span className="text-sm text-gray-400">/ {limit === -1 ? '∞' : limit.toLocaleString('id-ID')}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-gray-400 text-right">{percentage}% terpakai</div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function BillingInfoPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'invoices' | 'modules'>('overview');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [authStatus, router]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hq/billing-info?action=overview');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Gagal memuat data billing');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchData();
    }
  }, [authStatus]);

  if (authStatus === 'loading' || loading) {
    return (
      <HQLayout title="Billing Information">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Memuat informasi billing...</p>
          </div>
        </div>
      </HQLayout>
    );
  }

  if (error) {
    return (
      <HQLayout title="Billing Information">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Coba Lagi
            </button>
          </div>
        </div>
      </HQLayout>
    );
  }

  if (!data) return null;

  const sub = data.subscription;
  const plan = sub?.plan;
  const usage = data.usage;

  const tabs = [
    { id: 'overview' as const, label: 'Ringkasan', icon: BarChart3 },
    { id: 'usage' as const, label: 'Pemakaian Layanan', icon: TrendingUp },
    { id: 'invoices' as const, label: 'Riwayat Invoice', icon: FileText },
    { id: 'modules' as const, label: 'Modul Aktif', icon: Package },
  ];

  return (
    <HQLayout title="Billing Information" subtitle="Informasi langganan, pemakaian layanan, dan riwayat pembayaran">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'usage' && <UsageTab usage={usage} />}
      {activeTab === 'invoices' && <InvoicesTab invoices={data.recentInvoices} billingHistory={data.billingHistory} />}
      {activeTab === 'modules' && <ModulesTab modules={data.modules} />}
    </HQLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════════════════════
function OverviewTab({ data }: { data: BillingData }) {
  const sub = data.subscription;
  const plan = sub?.plan;
  const usage = data.usage;

  return (
    <div className="space-y-6">
      {/* Subscription Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-blue-200" />
                <span className="text-blue-200 text-sm font-medium">Paket Langganan</span>
              </div>
              <h2 className="text-3xl font-bold">{plan?.name || 'Free Trial'}</h2>
              {plan?.description && <p className="text-blue-200 text-sm mt-1">{plan.description}</p>}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              sub.status === 'active' ? 'bg-green-400/20 text-green-200 border border-green-400/30' :
              sub.status === 'trial' ? 'bg-blue-400/20 text-blue-200 border border-blue-400/30' :
              'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30'
            }`}>
              {statusLabel(sub.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-blue-200 text-xs mb-0.5">Harga</p>
              <p className="text-xl font-bold">{formatRupiah(plan?.price || 0)}</p>
              <p className="text-blue-300 text-xs">/{plan?.billingInterval === 'yearly' ? 'tahun' : 'bulan'}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-0.5">Periode Aktif</p>
              <p className="text-sm font-semibold">{formatDate(sub.currentPeriodStart)}</p>
              <p className="text-blue-300 text-xs">s/d {formatDate(sub.currentPeriodEnd)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-0.5">Sisa Hari</p>
              <p className="text-xl font-bold">{sub.daysLeft ?? '-'}</p>
              <p className="text-blue-300 text-xs">hari tersisa</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-0.5">Bisnis</p>
              <p className="text-sm font-semibold truncate">{data.tenant.businessName || '-'}</p>
              <p className="text-blue-300 text-xs">{data.tenant.businessCode || ''}</p>
            </div>
          </div>

          {sub.cancelAtPeriodEnd && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-yellow-200">Langganan akan berakhir pada {formatDate(sub.currentPeriodEnd)}</span>
            </div>
          )}

          {sub.status === 'trial' && sub.trialEndsAt && (
            <div className="mt-4 bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200">Trial berakhir pada {formatDate(sub.trialEndsAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Modul Aktif</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.modules.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Receipt className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Invoice</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.recentInvoices.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Pengguna</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{usage.current.users} <span className="text-sm text-gray-400 font-normal">/ {usage.limits.maxUsers}</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <Building2 className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Cabang</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{usage.current.branches} <span className="text-sm text-gray-400 font-normal">/ {usage.limits.maxBranches}</span></p>
        </div>
      </div>

      {/* Usage Meters */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Pemakaian Layanan Bulan Ini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageMeter label="Pengguna" icon={Users} current={usage.current.users} limit={usage.limits.maxUsers} percentage={usage.percentages.users} color="bg-blue-500" />
          <UsageMeter label="Cabang" icon={Building2} current={usage.current.branches} limit={usage.limits.maxBranches} percentage={usage.percentages.branches} color="bg-indigo-500" />
          <UsageMeter label="Produk" icon={ShoppingBag} current={usage.current.products} limit={usage.limits.maxProducts} percentage={usage.percentages.products} color="bg-purple-500" />
          <UsageMeter label="Transaksi" icon={Receipt} current={usage.current.transactions} limit={usage.limits.maxTransactions} percentage={usage.percentages.transactions} color="bg-green-500" />
        </div>
      </div>

      {/* Recent Invoices */}
      {data.recentInvoices.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Invoice Terbaru
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Invoice</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Jatuh Tempo</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.invoiceNumber || inv.id.slice(0, 12)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(inv.issuedDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRupiah(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(inv.status)}`}>
                          {statusLabel(inv.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Plan Features */}
      {plan?.features && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Fitur Paket {plan.name}
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(plan.features).map(([feature, enabled]) => (
                <div key={feature} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${enabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                  {enabled ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm capitalize ${enabled ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: Usage
// ═══════════════════════════════════════════════════════════════════════════
function UsageTab({ usage }: { usage: BillingData['usage'] }) {
  const usageItems = [
    { label: 'Pengguna Aktif', icon: Users, current: usage.current.users, limit: usage.limits.maxUsers, percentage: usage.percentages.users, color: 'bg-blue-500', description: 'Jumlah user yang terdaftar pada tenant Anda' },
    { label: 'Cabang / Outlet', icon: Building2, current: usage.current.branches, limit: usage.limits.maxBranches, percentage: usage.percentages.branches, color: 'bg-indigo-500', description: 'Jumlah cabang yang telah dibuat' },
    { label: 'Produk', icon: ShoppingBag, current: usage.current.products, limit: usage.limits.maxProducts, percentage: usage.percentages.products, color: 'bg-purple-500', description: 'Total produk dalam katalog Anda' },
    { label: 'Transaksi Bulan Ini', icon: Receipt, current: usage.current.transactions, limit: usage.limits.maxTransactions, percentage: usage.percentages.transactions, color: 'bg-green-500', description: 'Jumlah transaksi POS bulan ini' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Pemakaian Layanan</p>
          <p className="text-sm text-blue-600 mt-0.5">Monitor penggunaan resource Anda berdasarkan paket langganan yang aktif. Jika mendekati batas, pertimbangkan upgrade paket.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {usageItems.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${
                item.percentage >= 95 ? 'bg-red-100' : item.percentage >= 80 ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <item.icon className={`w-5 h-5 ${
                  item.percentage >= 95 ? 'text-red-600' : item.percentage >= 80 ? 'text-yellow-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.label}</h4>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-3xl font-bold text-gray-900">{item.current.toLocaleString('id-ID')}</span>
                <span className="text-gray-400 ml-1">/ {item.limit === -1 ? 'Unlimited' : item.limit.toLocaleString('id-ID')}</span>
              </div>
              <span className={`text-sm font-bold ${
                item.percentage >= 95 ? 'text-red-600' : item.percentage >= 80 ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {item.percentage}%
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  item.percentage >= 95 ? 'bg-red-500' : item.percentage >= 80 ? 'bg-yellow-500' : item.color
                }`}
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>

            {item.percentage >= 80 && (
              <div className={`mt-3 flex items-center gap-2 text-xs ${item.percentage >= 95 ? 'text-red-600' : 'text-yellow-600'}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {item.percentage >= 95 ? 'Batas hampir tercapai! Segera upgrade.' : 'Mendekati batas penggunaan.'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional resource info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Resource Tambahan</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Karyawan</p>
              <p className="text-lg font-bold text-gray-900">{usage.current.employees}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Warehouse className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Gudang</p>
              <p className="text-lg font-bold text-gray-900">{usage.current.warehouses}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Status KYB</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{(usage as any)?.kybStatus || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: Invoices
// ═══════════════════════════════════════════════════════════════════════════
function InvoicesTab({ invoices, billingHistory }: { invoices: BillingData['recentInvoices']; billingHistory: BillingData['billingHistory'] }) {
  return (
    <div className="space-y-6">
      {/* Invoice Table */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Daftar Invoice
        </h3>
        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada invoice</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">No. Invoice</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal Terbit</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Jatuh Tempo</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal Bayar</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Jumlah</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-blue-600">{inv.invoiceNumber || inv.id.slice(0, 12)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(inv.issuedDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.paidDate ? formatDate(inv.paidDate) : '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRupiah(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(inv.status)}`}>
                          {statusLabel(inv.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Billing Cycles */}
      {billingHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Riwayat Siklus Billing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billingHistory.map((bc) => (
              <div key={bc.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">{formatDate(bc.periodStart)} - {formatDate(bc.periodEnd)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(bc.status)}`}>
                    {statusLabel(bc.status)}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">{formatRupiah(bc.totalAmount)}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Base</span>
                    <span>{formatRupiah(bc.baseAmount)}</span>
                  </div>
                  {bc.overageAmount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Overage</span>
                      <span>+{formatRupiah(bc.overageAmount)}</span>
                    </div>
                  )}
                  {bc.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-{formatRupiah(bc.discountAmount)}</span>
                    </div>
                  )}
                  {bc.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Pajak</span>
                      <span>+{formatRupiah(bc.taxAmount)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Jatuh Tempo: {formatDate(bc.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: Modules
// ═══════════════════════════════════════════════════════════════════════════
function ModulesTab({ modules }: { modules: BillingData['modules'] }) {
  const basicModules = modules.filter(m => m.pricingTier === 'basic' || !m.pricingTier);
  const addOnModules = modules.filter(m => m.pricingTier === 'addon' || m.pricingTier === 'pro');

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Modul Aktif</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Anda memiliki <strong>{modules.length}</strong> modul yang aktif. Modul basic termasuk dalam paket Anda, sementara add-on dikenakan biaya tambahan.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{modules.length}</p>
          <p className="text-sm text-gray-500">Total Modul</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{basicModules.length}</p>
          <p className="text-sm text-gray-500">Basic (Gratis)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{addOnModules.length}</p>
          <p className="text-sm text-gray-500">Add-On (Pro)</p>
        </div>
      </div>

      {/* Basic Modules */}
      {basicModules.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Modul Basic
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Termasuk Paket</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {basicModules.map((mod) => (
              <div key={mod.id || mod.code} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{mod.name}</p>
                  <p className="text-xs text-gray-400">{mod.category || mod.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add-on Modules */}
      {addOnModules.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            Modul Add-On
            <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Pro</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {addOnModules.map((mod) => (
              <div key={mod.id || mod.code} className="bg-white rounded-xl border border-purple-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{mod.name}</p>
                  <p className="text-xs text-gray-400">{mod.category || mod.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modules.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada modul yang diaktifkan</p>
        </div>
      )}
    </div>
  );
}
