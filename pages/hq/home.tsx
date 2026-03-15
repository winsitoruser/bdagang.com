import React, { useState, useEffect, useCallback } from 'react';
import HQLayout from '../../components/hq/HQLayout';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Wallet, BarChart3,
  Building2, Truck, UserCheck, Settings, MessageCircle, Globe,
  Briefcase, Megaphone, Layers, Send, Shield,
  Clock, Bell, ChevronRight, RefreshCw, Activity, TrendingUp,
  CheckCircle, XCircle, Zap, Sparkles, Monitor, Search, Lock,
  ArrowRight, ExternalLink, Cpu, Server, AlertCircle, Hourglass
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/lib/i18n';

// ─── Module Registry ───
interface ModuleInfo {
  code: string;
  name: string;
  description: string;
  icon: any;
  href: string;
  gradient: string;
  iconColor: string;
  category: string;
}

const MODULE_REGISTRY: ModuleInfo[] = [
  { code: 'dashboard', name: 'Dasbor', description: 'Pusat kontrol & monitoring bisnis', icon: LayoutDashboard, href: '/hq/dashboard', gradient: 'from-indigo-500 to-indigo-600', iconColor: 'text-indigo-600', category: 'core' },
  { code: 'pos', name: 'Kasir (POS)', description: 'Sistem kasir & penjualan', icon: ShoppingCart, href: '/pos', gradient: 'from-blue-500 to-blue-600', iconColor: 'text-blue-600', category: 'core' },
  { code: 'branches', name: 'Cabang', description: 'Kelola & monitor cabang', icon: Building2, href: '/hq/branches', gradient: 'from-violet-500 to-violet-600', iconColor: 'text-violet-600', category: 'core' },
  { code: 'inventory', name: 'Inventaris', description: 'Stok, produk & gudang', icon: Package, href: '/hq/inventory', gradient: 'from-emerald-500 to-emerald-600', iconColor: 'text-emerald-600', category: 'core' },
  { code: 'products', name: 'Produk', description: 'Master data produk', icon: Layers, href: '/hq/products', gradient: 'from-teal-500 to-teal-600', iconColor: 'text-teal-600', category: 'operations' },
  { code: 'finance', name: 'Keuangan', description: 'Akuntansi & laporan', icon: Wallet, href: '/hq/finance', gradient: 'from-amber-500 to-amber-600', iconColor: 'text-amber-600', category: 'finance' },
  { code: 'hris', name: 'HRIS', description: 'SDM, payroll & KPI', icon: UserCheck, href: '/hq/hris', gradient: 'from-cyan-500 to-cyan-600', iconColor: 'text-cyan-600', category: 'hr' },
  { code: 'users', name: 'Pengguna', description: 'Akses & manajemen peran', icon: Users, href: '/hq/users', gradient: 'from-sky-500 to-sky-600', iconColor: 'text-sky-600', category: 'hr' },
  { code: 'crm', name: 'CRM & SFA', description: 'Pipeline & pelanggan 360', icon: Briefcase, href: '/hq/sfa', gradient: 'from-pink-500 to-pink-600', iconColor: 'text-pink-600', category: 'sales' },
  { code: 'marketing', name: 'Pemasaran', description: 'Kampanye & promosi', icon: Megaphone, href: '/hq/marketing', gradient: 'from-rose-500 to-rose-600', iconColor: 'text-rose-600', category: 'sales' },
  { code: 'fms', name: 'Armada', description: 'Kendaraan, pengemudi & GPS', icon: Truck, href: '/hq/fms', gradient: 'from-orange-500 to-orange-600', iconColor: 'text-orange-600', category: 'operations' },
  { code: 'tms', name: 'Transportasi', description: 'Pengiriman & logistik', icon: Send, href: '/hq/tms', gradient: 'from-lime-500 to-lime-600', iconColor: 'text-lime-600', category: 'operations' },
  { code: 'reports', name: 'Laporan', description: 'Analitik & KPI lintas modul', icon: BarChart3, href: '/hq/reports/consolidated', gradient: 'from-purple-500 to-purple-600', iconColor: 'text-purple-600', category: 'analytics' },
  { code: 'audit', name: 'Log Audit', description: 'Riwayat & keamanan', icon: Shield, href: '/hq/audit-logs', gradient: 'from-slate-500 to-slate-600', iconColor: 'text-slate-600', category: 'system' },
  { code: 'whatsapp', name: 'WhatsApp', description: 'Siaran & automasi', icon: MessageCircle, href: '/hq/whatsapp', gradient: 'from-green-500 to-green-600', iconColor: 'text-green-600', category: 'integration' },
  { code: 'marketplace', name: 'Marketplace', description: 'Tokopedia, Shopee, dll.', icon: Globe, href: '/hq/marketplace', gradient: 'from-blue-500 to-cyan-600', iconColor: 'text-blue-600', category: 'integration' },
  { code: 'settings', name: 'Pengaturan', description: 'Konfigurasi sistem', icon: Settings, href: '/hq/settings', gradient: 'from-gray-500 to-gray-600', iconColor: 'text-gray-600', category: 'system' },
];

const CATEGORY_ICONS: Record<string, any> = {
  core: Cpu,
  operations: Package,
  finance: Wallet,
  hr: Users,
  sales: Briefcase,
  analytics: BarChart3,
  integration: Globe,
  system: Settings,
};

const CATEGORY_KEYS: Record<string, string> = {
  core: 'home.coreSystem',
  operations: 'home.operations',
  finance: 'home.finance',
  hr: 'home.hrm',
  sales: 'home.salesMarketing',
  analytics: 'home.analytics',
  integration: 'home.integration',
  system: 'home.system',
};

const CATEGORY_ORDER = ['core', 'operations', 'finance', 'hr', 'sales', 'analytics', 'integration', 'system'];

interface ModuleStatus { code: string; isEnabled: boolean; isCore: boolean; }

interface SystemUpdate {
  id: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'announcement';
  title: string;
  description: string;
  date: string;
  version?: string;
}

interface SystemStats {
  totalBranches: number;
  onlineBranches: number;
  totalUsers: number;
  todaySales: number;
}

const MOCK_UPDATES: SystemUpdate[] = [
  { id: '1', type: 'feature', title: 'Smart Warehouse AI', description: 'AI forecasting & anomaly detection untuk gudang pintar.', date: '2026-03-02', version: '3.8.0' },
  { id: '2', type: 'improvement', title: 'Dashboard Cabang', description: 'Tampilan monitoring cabang real-time yang lebih profesional.', date: '2026-03-01', version: '3.7.5' },
  { id: '3', type: 'feature', title: 'CRM & Sales Force', description: 'Lead management, pipeline, customer 360° & AI workflow.', date: '2026-02-28', version: '3.7.0' },
  { id: '4', type: 'feature', title: 'Fleet Management', description: 'Kendaraan, driver, maintenance, GPS tracking & analytics.', date: '2026-02-25', version: '3.6.0' },
  { id: '5', type: 'bugfix', title: 'Perbaikan Sinkronisasi', description: 'Fix sinkronisasi data antar cabang & kalkulasi stok transfer.', date: '2026-02-18', version: '3.4.2' },
  { id: '6', type: 'announcement', title: 'Maintenance Window', description: 'Server maintenance: Minggu 09 Mar 2026, 02:00–04:00 WIB.', date: '2026-03-03' },
];

function UnifiedDashboardContent() {
  const router = useRouter();
  const { t, language: currentLang, formatCurrency } = useTranslation();
  const dateLocale = currentLang === 'ja' ? 'ja-JP' : currentLang === 'en' ? 'en-US' : 'id-ID';
  const [mounted, setMounted] = useState(false);
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [kybStatus, setKybStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch KYB / onboarding status
    try {
      const statusRes = await fetch('/api/onboarding/status');
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        const status = statusJson.data?.tenant?.kybStatus || statusJson.data?.statusInfo?.status || null;
        setKybStatus(status);
      }
    } catch {
      // Ignore - assume active if can't fetch
    }
    try {
      const modRes = await fetch('/api/hq/modules');
      if (modRes.ok) {
        const modJson = await modRes.json();
        const modules = modJson.data?.modules || modJson.modules || [];
        setModuleStatuses(modules.map((m: any) => ({ code: m.code, isEnabled: m.isEnabled, isCore: m.isCore })));
      }
    } catch {
      setModuleStatuses(MODULE_REGISTRY.map(m => ({ code: m.code, isEnabled: true, isCore: false })));
    }
    try {
      const dashRes = await fetch('/api/hq/dashboard?period=today');
      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        const payload = dashJson.data || dashJson;
        const branches = payload.branches || [];
        setSystemStats({
          totalBranches: branches.length,
          onlineBranches: branches.filter((b: any) => b.status === 'online').length,
          totalUsers: branches.reduce((s: number, b: any) => s + (b.employeeCount || 0), 0),
          todaySales: branches.reduce((s: number, b: any) => s + (b.todaySales || 0), 0),
        });
      }
    } catch {
      setSystemStats({ totalBranches: 12, onlineBranches: 10, totalUsers: 162, todaySales: 244500000 });
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  if (!mounted) return null;

  const isModuleEnabled = (code: string) => {
    const s = moduleStatuses.find(m => m.code === code);
    return s ? s.isEnabled : true;
  };

  const enabledCount = moduleStatuses.length > 0 ? moduleStatuses.filter(m => m.isEnabled).length : MODULE_REGISTRY.length;
  const disabledCount = moduleStatuses.length > 0 ? moduleStatuses.filter(m => !m.isEnabled).length : 0;

  const filteredModules = MODULE_REGISTRY.filter(m => {
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    return true;
  });

  const groupedModules: Record<string, ModuleInfo[]> = {};
  filteredModules.forEach(m => {
    if (!groupedModules[m.category]) groupedModules[m.category] = [];
    groupedModules[m.category].push(m);
  });


  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 11) return t('home.goodMorning');
    if (h < 15) return t('home.goodAfternoon');
    if (h < 18) return t('home.goodEvening');
    return t('home.goodNight');
  };

  const updateMeta = (type: string) => {
    const map: Record<string, { label: string; dot: string; icon: any }> = {
      feature: { label: t('home.newFeature'), dot: 'bg-blue-400', icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" /> },
      improvement: { label: t('home.improvement'), dot: 'bg-emerald-400', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
      bugfix: { label: t('home.bugfix'), dot: 'bg-amber-400', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
      announcement: { label: t('home.announcement'), dot: 'bg-violet-400', icon: <Bell className="w-3.5 h-3.5 text-violet-500" /> },
    };
    return map[type] || { label: type, dot: 'bg-gray-400', icon: null };
  };

  const activeCategories = CATEGORY_ORDER.filter(cat => groupedModules[cat]?.length > 0);
  const isUnderReview = kybStatus === 'in_review';

  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast(t('home.reviewToast'), {
      icon: '⏳',
      duration: 4000,
      style: { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontWeight: 500 },
    });
  };

  return (
      <div className="w-full">

        {/* ════════════════════════════════════════════════
            HERO BANNER
        ════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 mb-6 sm:mb-8">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-4 ${
                  isUnderReview
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-white/[0.08] border-white/[0.08] text-white/60'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isUnderReview ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {isUnderReview ? t('home.accountInactive') : `${t('home.systemOnline')} · v3.8.0`}
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-1">{getGreeting()}</h1>
                <p className="text-white/40 text-sm">
                  {currentTime.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-6 lg:gap-8">
                {[
                  { label: t('home.activeModules'), val: enabledCount, total: MODULE_REGISTRY.length },
                  { label: t('home.onlineBranches'), val: systemStats?.onlineBranches || 0, total: systemStats?.totalBranches || 0 },
                  { label: t('home.users'), val: systemStats?.totalUsers || 0, total: null },
                  { label: t('home.todaySales'), val: formatCurrency(systemStats?.todaySales || 0), total: null },
                ].map((s, i) => (
                  <div key={i} className="text-left sm:text-right">
                    <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">{s.label}</p>
                    <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                      {typeof s.val === 'number' ? s.val : s.val}
                      {s.total !== null && <span className="text-sm font-normal text-white/30">/{s.total}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access Bar */}
            <div className="flex items-center gap-2 mt-5 sm:mt-7 pt-4 sm:pt-6 border-t border-white/[0.06] overflow-x-auto pb-1 scrollbar-hide">
              {[
                { label: t('home.operationalDashboard'), href: '/hq/dashboard', icon: LayoutDashboard },
                { label: t('home.reports'), href: '/hq/reports/consolidated', icon: BarChart3 },
                { label: t('home.manageModules'), href: '/hq/settings/modules', icon: Package },
                { label: t('home.settings'), href: '/hq/settings', icon: Settings },
              ].map(q => (
                <button
                  key={q.href}
                  onClick={(e) => isUnderReview ? handleReviewClick(e) : router.push(q.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.06] text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    isUnderReview
                      ? 'bg-white/[0.04] text-white/30 cursor-not-allowed'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white'
                  }`}
                >
                  <q.icon className="w-3.5 h-3.5" />
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ REVIEW BANNER ═══ */}
        {isUnderReview && (
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/60 p-5 sm:p-6 mb-6 sm:mb-8">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Hourglass className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-amber-900">{t('home.accountUnderReview')}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 text-amber-800 rounded-full">{t('home.underReview')}</span>
                </div>
                <p className="text-sm text-amber-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.reviewDescription') }} />
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t('home.kybSubmitted')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('home.waitingVerification')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t('home.moduleActivation')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">

          {/* ── LEFT: Module Grid ── */}
          <div className="xl:col-span-8 space-y-6">

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('home.searchModules')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200/80 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 shadow-sm transition-all"
                />
              </div>
              <div className="flex items-center bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-3 text-xs font-medium transition-colors ${selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {t('home.all')}
                </button>
                {CATEGORY_ORDER.filter(c => MODULE_REGISTRY.some(m => m.category === c)).slice(0, 4).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(selectedCategory === c ? 'all' : c)}
                    className={`px-4 py-3 text-xs font-medium transition-colors border-l border-gray-100 ${selectedCategory === c ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                  >
                    {t(CATEGORY_KEYS[c])}
                  </button>
                ))}
                <select
                  value={['core','operations','finance','hr'].includes(selectedCategory) ? 'all' : selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-3 text-xs font-medium text-gray-500 bg-transparent border-l border-gray-100 focus:outline-none cursor-pointer hover:bg-gray-50"
                >
                  <option value="all">{t('home.others')}</option>
                  {CATEGORY_ORDER.filter(c => !['core','operations','finance','hr'].includes(c) && MODULE_REGISTRY.some(m => m.category === c)).map(c => (
                    <option key={c} value={c}>{t(CATEGORY_KEYS[c])}</option>
                  ))}
                </select>
              </div>
              <button onClick={fetchData} disabled={loading} className="p-3 bg-white border border-gray-200/80 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0 self-end sm:self-auto">
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Module Grid by Category */}
            {activeCategories.map(cat => {
              const CatIcon = CATEGORY_ICONS[cat];
              return (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    {CatIcon && <CatIcon className="w-4 h-4 text-gray-400" />}
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t(CATEGORY_KEYS[cat])}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {groupedModules[cat].map(mod => {
                      const enabled = isModuleEnabled(mod.code);
                      const Icon = mod.icon;
                      return (
                        <Link
                          key={mod.code}
                          href={!isUnderReview && enabled ? `/hq/modules/${mod.code}` : '#'}
                          onClick={(e) => {
                            if (isUnderReview) {
                              handleReviewClick(e);
                            } else if (!enabled) {
                              e.preventDefault();
                              toast.error(t('home.moduleNotActivated', { name: t(`modules.${mod.code}.name`) }));
                            }
                          }}
                          className={`group relative rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
                            isUnderReview
                              ? 'bg-white border border-gray-200/60 cursor-not-allowed'
                              : enabled
                                ? 'bg-white border border-gray-200/60 hover:border-gray-300/80 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 cursor-pointer'
                                : 'bg-gray-50 border border-gray-100 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {/* Gradient accent on hover */}
                          {!isUnderReview && enabled && (
                            <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                          )}

                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                              isUnderReview ? `bg-gradient-to-br ${mod.gradient} shadow-sm opacity-50` :
                              enabled ? `bg-gradient-to-br ${mod.gradient} shadow-sm` : 'bg-gray-200'
                            } ${!isUnderReview && enabled ? 'group-hover:scale-110 group-hover:shadow-md' : ''}`}>
                              <Icon className={`w-5 h-5 ${isUnderReview || enabled ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            {isUnderReview ? (
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                            ) : enabled ? (
                              <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-gray-300" />
                            )}
                          </div>

                          <h3 className={`text-sm font-semibold mb-1 ${isUnderReview ? 'text-gray-600' : enabled ? 'text-gray-900' : 'text-gray-400'}`}>{t(`modules.${mod.code}.name`)}</h3>
                          <p className={`text-xs leading-relaxed ${isUnderReview ? 'text-gray-400' : enabled ? 'text-gray-500' : 'text-gray-300'}`}>{t(`modules.${mod.code}.description`)}</p>

                          {isUnderReview ? (
                            <div className="flex items-center gap-1.5 mt-3">
                              <Hourglass className="w-3 h-3 text-amber-400" />
                              <span className="text-[11px] font-medium text-amber-500">{t('home.waitingReview')}</span>
                            </div>
                          ) : enabled ? (
                            <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="text-[11px] font-medium text-indigo-500">{t('home.viewDetails')}</span>
                              <ArrowRight className="w-3 h-3 text-indigo-400" />
                            </div>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredModules.length === 0 && (
              <div className="text-center py-24 rounded-2xl border-2 border-dashed border-gray-200">
                <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">{t('home.noModulesFound')}</p>
                <p className="text-xs text-gray-300 mt-1">{t('home.tryOtherKeywords')}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="xl:col-span-4 space-y-6">

            {/* System Status Card */}
            <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-sm">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{t('home.systemStatus')}</h3>
                      <p className="text-[11px] text-gray-400">{t('home.realtimeOverview')}</p>
                    </div>
                  </div>
                  {isUnderReview ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-amber-600">{t('home.underReview').toUpperCase()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-emerald-600">{t('home.healthy')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Module progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2.5">
                    <span className="text-gray-600 font-medium">{t('home.activeModulesLabel')}</span>
                    <span className="font-bold text-gray-900">{enabledCount}<span className="font-normal text-gray-400">/{MODULE_REGISTRY.length}</span></span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${(enabledCount / MODULE_REGISTRY.length) * 100}%` }} />
                  </div>
                </div>

                {/* Status boxes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-4">
                    <div className="absolute -right-2 -bottom-2 opacity-10">
                      <CheckCircle className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{enabledCount}</p>
                    <p className="text-xs text-emerald-600/70 font-medium mt-0.5">{t('home.activeModulesLabel')}</p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 p-4">
                    <div className="absolute -right-2 -bottom-2 opacity-10">
                      <XCircle className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-400">{disabledCount}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{t('home.inactive')}</p>
                  </div>
                </div>

                {/* System info rows */}
                <div className="space-y-0 divide-y divide-gray-100">
                  {[
                    { label: t('home.platform'), value: 'Bedagang ERP v3.8', color: 'text-gray-900' },
                    { label: t('home.uptime'), value: '99.9%', color: 'text-emerald-600' },
                    { label: t('home.onlineBranchesLabel'), value: `${systemStats?.onlineBranches || 0} / ${systemStats?.totalBranches || 0}`, color: 'text-gray-900' },
                    { label: t('home.totalUsers'), value: `${systemStats?.totalUsers || 0}`, color: 'text-gray-900' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ERP Updates */}
            <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{t('home.erpUpdates')}</h3>
                    <p className="text-[11px] text-gray-400">{t('home.latestFeatures')}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{MOCK_UPDATES.length}</span>
              </div>

              <div className="max-h-[460px] overflow-y-auto">
                {MOCK_UPDATES.map((u, idx) => {
                  const meta = updateMeta(u.type);
                  return (
                    <div key={u.id} className="group px-6 py-4 hover:bg-gray-50/70 transition-colors border-b border-gray-50 last:border-b-0">
                      <div className="flex gap-3">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} ring-4 ring-white`} />
                          {idx < MOCK_UPDATES.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{t(`updates.u${u.id}.title`)}</p>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{t(`updates.u${u.id}.description`)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gray-400">
                              {new Date(u.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {u.version && (
                              <span className="text-[10px] font-mono font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">v{u.version}</span>
                            )}
                            <span className="text-[10px] font-medium text-gray-400">{meta.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{t('home.shortcuts')}</h3>
              <div className="space-y-1">
                {[
                  { label: t('home.operationalDashboard'), desc: t('home.salesKpiAnalytics'), href: '/hq/dashboard', icon: LayoutDashboard },
                  { label: t('home.consolidatedReports'), desc: t('home.crossModuleReporting'), href: '/hq/reports/consolidated', icon: BarChart3 },
                  { label: t('home.manageModules'), desc: t('home.activateDeactivate'), href: '/hq/settings/modules', icon: Package },
                ].map(lnk => (
                  <Link
                    key={lnk.href}
                    href={isUnderReview ? '#' : lnk.href}
                    onClick={(e) => { if (isUnderReview) handleReviewClick(e); }}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isUnderReview ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-indigo-50 flex items-center justify-center flex-shrink-0 transition-colors">
                      <lnk.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{lnk.label}</p>
                      <p className="text-[11px] text-gray-400">{lnk.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function UnifiedDashboard() {
  return (
    <HQLayout>
      <UnifiedDashboardContent />
    </HQLayout>
  );
}
