import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
  Sparkles,
  LayoutDashboard,
  HelpCircle,
} from 'lucide-react';
import { useBusinessType } from '@/contexts/BusinessTypeContext';
import { OpanelDotPattern, OpanelRestoMark } from '@/components/opanel/OpanelDecorations';
import {
  opanelSidebarConfig,
  filterSidebarConfig,
  findActiveMenuItem,
  MenuItem,
  MenuGroup,
  UserRole,
  ModuleCode,
} from '@/config/sidebar.config';

function canUseOpanel(role: string | undefined): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return ['owner', 'hq_admin', 'super_admin', 'superadmin'].includes(r);
}

type OpanelLayoutProps = {
  children: ReactNode;
  title?: string;
};

const OpanelLayout: React.FC<OpanelLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { businessType, hasModule, isLoading: configLoading, modules } = useBusinessType();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined;
  const sessionRole = session?.user ? (session.user as { role?: string }).role : undefined;
  const userName =
    (session?.user as { name?: string })?.name ||
    (session?.user as { email?: string })?.email?.split('@')[0] ||
    'Pemilik';

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/auth/login?callbackUrl=' + encodeURIComponent(router.asPath));
      return;
    }
    if (session && !canUseOpanel(sessionRole)) {
      router.replace('/dashboard');
    }
  }, [status, session, sessionRole, router]);

  const enabledModuleCodes = useMemo(() => {
    if (configLoading || !modules) return [];
    return modules.map((m) => m.code) as ModuleCode[];
  }, [modules, configLoading]);

  const filteredConfig = useMemo(() => {
    return filterSidebarConfig(
      opanelSidebarConfig,
      userRole,
      enabledModuleCodes.length > 0 ? enabledModuleCodes : undefined
    );
  }, [userRole, enabledModuleCodes]);

  useEffect(() => {
    const saved = localStorage.getItem('opanel-sidebar-collapsed');
    if (saved !== null) setSidebarCollapsed(saved === 'true');
  }, []);

  const toggleSidebarCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('opanel-sidebar-collapsed', String(next));
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const isFnB = businessType === 'fnb' || hasModule('kitchen');
  const outletDashboardHref = isFnB ? '/dashboard-fnb' : '/dashboard';

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href.startsWith('/opanel')) {
      return router.pathname === href || router.pathname.startsWith(href + '/');
    }
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const LogoIcon = opanelSidebarConfig.logo.icon;

  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const href = item.href || '#';
    const active = isActive(item.href);

    return (
      <Link
        key={item.id}
        href={href}
        className={`group/nav relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-2 transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-white shadow-inner ring-1 ring-white/10'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        } ${sidebarCollapsed ? 'lg:justify-center lg:px-0 lg:py-2.5' : ''}`}
        title={sidebarCollapsed ? item.name : ''}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
            aria-hidden
          />
        )}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            active
              ? 'bg-teal-500/30 text-amber-200'
              : 'bg-slate-800/80 text-slate-400 group-hover/nav:bg-slate-700 group-hover/nav:text-teal-300'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-[13px] font-medium tracking-wide ${sidebarCollapsed ? 'lg:hidden' : ''}`}
        >
          {item.name}
        </span>
        {sidebarCollapsed && (
          <div className="pointer-events-none invisible absolute left-full z-[60] ml-3 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 opacity-0 shadow-xl transition-all group-hover/nav:visible group-hover/nav:opacity-100">
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900" />
          </div>
        )}
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup, groupIndex: number) => (
    <div key={group.id} className="space-y-1">
      {!sidebarCollapsed && (
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          <h3 className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{group.title}</h3>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        </div>
      )}
      {sidebarCollapsed && groupIndex > 0 && (
        <div className="my-3 flex justify-center">
          <span className="h-8 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
        </div>
      )}
      <div className="space-y-0.5">{group.items.map((item) => renderMenuItem(item))}</div>
    </div>
  );

  if (status === 'loading' || (session && !canUseOpanel(sessionRole))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-slate-300">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-teal-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <OpanelRestoMark className="h-10 w-10 text-amber-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Panel pemilik</p>
          <p className="mt-1 text-xs text-slate-500">Memuat lingkungan aman…</p>
        </div>
      </div>
    );
  }

  const headerTitle =
    title ||
    findActiveMenuItem(filteredConfig.groups, router.pathname, router.query as Record<string, string | string[] | undefined>)
      ?.name ||
    'Panel pemilik';

  return (
    <div className="min-h-screen bg-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex transform flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[4px_0_24px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-[4.5rem]' : 'lg:w-72'} w-72`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent)] pointer-events-none" />

        <div className="relative flex h-[4.25rem] shrink-0 items-center justify-between border-b border-slate-800/80 px-4">
          <Link
            href="/opanel/dashboard"
            className={`flex min-w-0 items-center gap-3 transition-opacity hover:opacity-95 ${sidebarCollapsed ? 'lg:w-full lg:justify-center' : ''}`}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-emerald-600 to-slate-900 text-white shadow-lg ring-2 ring-amber-400/30">
              <LogoIcon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <div className="truncate text-sm font-bold tracking-tight text-white">{opanelSidebarConfig.logo.title}</div>
              {opanelSidebarConfig.logo.subtitle && (
                <div className="mt-0.5 flex items-center gap-1.5 truncate">
                  <Sparkles className="h-3 w-3 shrink-0 text-amber-400/90" />
                  <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-teal-300/90">
                    {opanelSidebarConfig.logo.subtitle}
                  </span>
                </div>
              )}
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="relative flex-1 space-y-8 overflow-y-auto overflow-x-hidden px-3 py-6"
          style={{ maxHeight: 'calc(100vh - 4.25rem - 7rem)' }}
        >
          {filteredConfig.groups.map((group, i) => renderMenuGroup(group, i))}
        </nav>

        <div
          className={`relative mt-auto border-t border-slate-800/80 bg-slate-950/80 p-3 backdrop-blur ${sidebarCollapsed ? 'lg:px-1' : ''}`}
        >
          <div className={`flex items-center gap-3 rounded-xl bg-slate-800/40 p-2 ring-1 ring-slate-700/50 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 text-xs font-bold text-white shadow-md">
              {initials}
            </div>
            <div className={`min-w-0 flex-1 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-slate-100">{userName}</p>
              <p className="truncate text-[11px] capitalize text-slate-500">{sessionRole?.replace(/_/g, ' ') || '—'}</p>
            </div>
          </div>
          <Link
            href="/opanel/dashboard"
            className={`mt-2 flex items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-medium text-slate-500 transition hover:bg-white/5 hover:text-teal-300 ${sidebarCollapsed ? 'lg:px-0' : ''}`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {!sidebarCollapsed && <span>Ringkasan</span>}
          </Link>
        </div>
      </aside>

      <button
        type="button"
        onClick={toggleSidebarCollapse}
        className={`fixed top-[4.5rem] z-50 hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition-all hover:scale-105 hover:border-teal-300 hover:text-teal-700 lg:flex ${
          sidebarCollapsed ? 'left-[3.35rem]' : 'left-[16.25rem]'
        }`}
        title={sidebarCollapsed ? 'Perluas menu' : 'Ciutkan menu'}
      >
        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className={`min-h-screen transition-[margin] duration-300 ${sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-72'}`}>
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <OpanelDotPattern />
            <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-teal-400/5 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl" />
          </div>

          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 shadow-sm backdrop-blur-md">
            <div className="flex h-[4.25rem] items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700 lg:hidden"
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/90">Bedagang</p>
                  <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{headerTitle}</h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={outletDashboardHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-900"
                >
                  <Store className="h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} />
                  <span className="hidden sm:inline">Ke outlet</span>
                </Link>
                <a
                  href="https://naincode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:inline-flex"
                  title="Bantuan"
                >
                  <HelpCircle className="h-5 w-5" />
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          </header>

          <main className="relative px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
};

export default OpanelLayout;
