import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  Building2,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  hqSidebarConfig,
  filterSidebarConfig,
  findActiveMenuItem,
  getParentMenuItem,
  MenuItem,
  MenuGroup,
  UserRole,
  ModuleCode
} from '@/config/sidebar.config';

interface HQLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

function HQLayoutContent({ children, title, subtitle }: HQLayoutProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user role from session
  const userRole = (session?.user as any)?.role as UserRole | undefined;

  // Filter sidebar config based on role (modules can be added later)
  const filteredConfig = useMemo(() => {
    return filterSidebarConfig(hqSidebarConfig, userRole);
  }, [userRole]);

  useEffect(() => {
    setMounted(true);
    
    // Auto-expand some menus and find active menu's parent
    const activeItem = findActiveMenuItem(filteredConfig.groups, router.pathname);
    if (activeItem) {
      const parent = getParentMenuItem(filteredConfig.groups, activeItem.id);
      if (parent) {
        setExpandedMenus(prev => [...new Set([...prev, parent.id])]);
      }
    }
    
    // Load collapsed state
    const saved = localStorage.getItem('hq-sidebar-collapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
    
    fetchNotifications();
  }, [router.pathname, filteredConfig.groups]);

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

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(m => m !== menuId)
        : [...prev, menuId]
    );
  };

  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('hq-sidebar-collapsed', String(newState));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const renderNavItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const active = item.href ? isActive(item.href) : false;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isExpanded ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </div>
            {!sidebarCollapsed && (
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!sidebarCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href || '#'}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
          active 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
            : 'text-gray-600 hover:bg-gray-100'
        } ${sidebarCollapsed ? 'justify-center' : ''}`}
      >
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Icon className="w-5 h-5" />
          {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
        </div>
        {!sidebarCollapsed && item.badge !== undefined && (
          <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
            {item.badge}
          </span>
        )}
        {/* Collapsed tooltip */}
        {sidebarCollapsed && (
          <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        )}
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup) => (
    <div key={group.id} className="mb-4">
      {!sidebarCollapsed && (
        <div className="px-3 mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {group.title}
          </h3>
        </div>
      )}
      <div className="space-y-1">
        {group.items.map(item => renderNavItem(item))}
      </div>
    </div>
  );

  const LogoIcon = filteredConfig.logo.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href={filteredConfig.logo.href} className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="hidden lg:block">
                <h1 className="font-bold text-gray-900">{filteredConfig.logo.title}</h1>
                {filteredConfig.logo.subtitle && (
                  <p className="text-xs text-gray-500">{filteredConfig.logo.subtitle}</p>
                )}
              </div>
            )}
            <div className="lg:hidden">
              <h1 className="font-bold text-gray-900">{filteredConfig.logo.title}</h1>
              {filteredConfig.logo.subtitle && (
                <p className="text-xs text-gray-500">{filteredConfig.logo.subtitle}</p>
              )}
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-8rem)]">
          {filteredConfig.groups.map(group => renderMenuGroup(group))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 hidden lg:block">
                <p className="font-medium text-gray-900 truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || ''}</p>
              </div>
            )}
            <div className="flex-1 min-w-0 lg:hidden">
              <p className="font-medium text-gray-900 truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all ${
              sidebarCollapsed ? 'lg:justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="hidden lg:inline">Keluar</span>}
            <span className="lg:hidden">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Collapse Toggle Button - Desktop Only */}
      <button
        onClick={toggleSidebarCollapse}
        className={`hidden lg:flex fixed top-20 z-50 items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 ${
          sidebarCollapsed ? 'left-16' : 'left-60'
        }`}
        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 lg:ml-64 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
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
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{session?.user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{session?.user?.email || ''}</p>
                      {userRole && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {userRole.replace('_', ' ')}
                        </span>
                      )}
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
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
                      >
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
