import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  FileText,
  Settings,
  ShoppingCart,
  TrendingUp,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Shield,
  ClipboardList,
  Truck,
  BarChart3,
  History,
  Globe,
  DollarSign,
  Layers,
  Store,
  UserCog,
  FileBarChart,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Target,
  CalendarCheck,
  Award,
  Wallet,
  Banknote,
  PiggyBank,
  Receipt,
  CreditCard,
  Calculator,
  ArrowRightLeft,
  FileSpreadsheet,
  Plug
} from 'lucide-react';

interface HQLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/hq/dashboard', icon: LayoutDashboard },
  { 
    name: 'Cabang', 
    icon: Building2,
    children: [
      { name: 'Daftar Cabang', href: '/hq/branches', icon: Store },
      { name: 'Performa Cabang', href: '/hq/branches/performance', icon: TrendingUp },
      { name: 'Pengaturan Cabang', href: '/hq/branches/settings', icon: Settings },
    ]
  },
  { 
    name: 'Inventory', 
    icon: Package,
    children: [
      { name: 'Dashboard', href: '/hq/inventory', icon: LayoutDashboard },
      { name: 'Stok Global', href: '/hq/inventory/stock', icon: Package },
      { name: 'Kategori Produk', href: '/hq/inventory/categories', icon: Layers },
      { name: 'Harga & Pricing', href: '/hq/inventory/pricing', icon: DollarSign },
      { name: 'Transfer Stok', href: '/hq/inventory/transfers', icon: ArrowRightLeft },
      { name: 'Alerts', href: '/hq/inventory/alerts', icon: AlertCircle },
      { name: 'Stock Opname', href: '/hq/inventory/stocktake', icon: ClipboardList },
      { name: 'Penerimaan Barang', href: '/hq/inventory/receipts', icon: FileText },
    ]
  },
  { 
    name: 'Supply Chain', 
    icon: Truck,
    children: [
      { name: 'Internal Requisition', href: '/hq/requisitions', icon: ClipboardList },
      { name: 'Purchase Order', href: '/hq/purchase-orders', icon: ShoppingCart },
      { name: 'Supplier', href: '/hq/suppliers', icon: Truck },
    ]
  },
  { 
    name: 'Produk & Menu', 
    icon: Package,
    children: [
      { name: 'Master Produk', href: '/hq/products', icon: Package },
    ]
  },
  { 
    name: 'Pengguna', 
    icon: Users,
    children: [
      { name: 'Semua Pengguna', href: '/hq/users', icon: Users },
      { name: 'Role & Akses', href: '/hq/users/roles', icon: Shield },
      { name: 'Branch Manager', href: '/hq/users/managers', icon: UserCog },
    ]
  },
  { 
    name: 'HRIS', 
    icon: UserCheck,
    children: [
      { name: 'Dashboard HRIS', href: '/hq/hris', icon: LayoutDashboard },
      { name: 'KPI Karyawan', href: '/hq/hris/kpi', icon: Target },
      { name: 'KPI Settings', href: '/hq/hris/kpi-settings', icon: Settings },
      { name: 'Kehadiran', href: '/hq/hris/attendance', icon: CalendarCheck },
      { name: 'Performance Review', href: '/hq/hris/performance', icon: Award },
    ]
  },
  { 
    name: 'Keuangan', 
    icon: Wallet,
    children: [
      { name: 'Dashboard Keuangan', href: '/hq/finance', icon: LayoutDashboard },
      { name: 'Analisis Revenue', href: '/hq/finance/revenue', icon: TrendingUp },
      { name: 'Pengeluaran', href: '/hq/finance/expenses', icon: CreditCard },
      { name: 'Laba Rugi', href: '/hq/finance/profit-loss', icon: FileSpreadsheet },
      { name: 'Arus Kas', href: '/hq/finance/cash-flow', icon: ArrowRightLeft },
      { name: 'Invoice', href: '/hq/finance/invoices', icon: FileText },
      { name: 'Piutang & Hutang', href: '/hq/finance/accounts', icon: Receipt },
      { name: 'Anggaran', href: '/hq/finance/budget', icon: PiggyBank },
      { name: 'Pajak', href: '/hq/finance/tax', icon: Calculator },
    ]
  },
  { 
    name: 'Laporan', 
    icon: BarChart3,
    children: [
      { name: 'Laporan Penjualan', href: '/hq/reports/sales', icon: TrendingUp },
      { name: 'Laporan Konsolidasi', href: '/hq/reports/consolidated', icon: FileBarChart },
      { name: 'Laporan Stok', href: '/hq/reports/inventory', icon: Package },
      { name: 'Laporan Keuangan', href: '/hq/reports/finance', icon: DollarSign },
    ]
  },
  { name: 'Audit Log', href: '/hq/audit-logs', icon: History },
  { 
    name: 'Pengaturan', 
    icon: Settings,
    children: [
      { name: 'Global Settings', href: '/hq/settings', icon: Globe },
      { name: 'Integrasi Pihak Ketiga', href: '/hq/settings/integrations', icon: Plug },
      { name: 'Pajak & Biaya', href: '/hq/settings/taxes', icon: FileText },
      { name: 'Notifikasi', href: '/hq/settings/notifications', icon: Bell },
    ]
  },
];

function HQLayoutContent({ children, title, subtitle }: HQLayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    setExpandedMenus(['Cabang', 'Produk & Menu', 'Supply Chain', 'Keuangan']);
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setNotifications([
      { id: 1, type: 'urgent', title: 'IR Urgent', message: 'Cabang Surabaya meminta stok darurat', time: '5 menit lalu' },
      { id: 2, type: 'warning', title: 'Stok Rendah', message: '3 cabang memiliki stok kritis', time: '15 menit lalu' },
      { id: 3, type: 'info', title: 'Laporan Harian', message: 'Laporan penjualan kemarin sudah siap', time: '1 jam lalu' },
    ]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/');

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isExpanded ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>
          {sidebarOpen && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href || '#'}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
          active 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">{item.name}</span>}
        </div>
        {sidebarOpen && item.badge && (
          <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/hq/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">Bedagang</h1>
                <p className="text-xs text-gray-500">HQ Platform</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navigation.map(item => renderNavItem(item))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              SA
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">Super Admin</p>
                <p className="text-xs text-gray-500">super@bedagang.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari cabang, produk, pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notif.type === 'urgent' ? 'bg-red-100' :
                              notif.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                              {notif.type === 'urgent' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                               notif.type === 'warning' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                               <CheckCircle className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                              <p className="text-sm text-gray-500 truncate">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 text-center">
                      <Link href="/hq/notifications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Lihat Semua Notifikasi
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    SA
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-900">Super Admin</p>
                      <p className="text-sm text-gray-500">super@bedagang.com</p>
                    </div>
                    <div className="p-2">
                      <Link href="/hq/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profil Saya</span>
                      </Link>
                      <Link href="/hq/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Pengaturan</span>
                      </Link>
                      <hr className="my-2" />
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => { setShowNotifications(false); setShowUserMenu(false); }}
        />
      )}
    </div>
  );
}

export default function HQLayout(props: HQLayoutProps) {
  return <HQLayoutContent {...props} />;
}
