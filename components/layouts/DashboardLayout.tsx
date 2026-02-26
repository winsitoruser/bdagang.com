import React, { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useBusinessType } from '@/contexts/BusinessTypeContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Store,
  BarChart3,
  Menu,
  X,
  Wallet,
  Ticket,
  Award,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Utensils,
  Calendar,
  DollarSign,
  ChefHat
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { hasModule, isLoading: configLoading } = useBusinessType();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Auto-collapse sidebar for cashier page, otherwise load from localStorage
  React.useEffect(() => {
    const isCashierPage = router.pathname === '/pos/cashier';
    if (isCashierPage) {
      setSidebarCollapsed(true);
    } else {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    }
  }, [router.pathname]);

  // Save collapsed state to localStorage
  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  // Define grouped menu structure
  const menuGroups = [
    {
      title: 'OUTLET',
      items: [
        { code: 'dashboard', icon: LayoutDashboard, label: 'Dasbor', href: '/dashboard' },
        { code: 'pos', icon: ShoppingCart, label: 'Kasir', href: '/pos' },
        { code: 'inventory', icon: Package, label: 'Inventori', href: '/inventory' },
        { code: 'customers', icon: Users, label: 'Pelanggan', href: '/customers' },
        { code: 'employees', icon: CalendarDays, label: 'Jadwal & Shift', href: '/employees/schedules' },
        { code: 'loyalty', icon: Award, label: 'Program Loyalitas', href: '/loyalty-program' },
      ]
    },
    {
      title: 'OPERASIONAL',
      items: [
        { code: 'tables', icon: Utensils, label: 'Manajemen Meja', href: '/tables' },
        { code: 'reservations', icon: Calendar, label: 'Reservasi', href: '/reservations' },
        { code: 'kitchen', icon: ChefHat, label: 'Management Kitchen', href: '/kitchen' },
        { code: 'promo', icon: Ticket, label: 'Promo & Voucher', href: '/promo-voucher' },
      ]
    },
    {
      title: 'BACKOFFICE',
      items: [
        { code: 'finance', icon: Wallet, label: 'Keuangan', href: '/finance' },
        { code: 'reports', icon: BarChart3, label: 'Laporan', href: '/reports' },
        { code: 'settings', icon: Settings, label: 'Pengaturan', href: '/settings' },
      ]
    }
  ];

  // Filter menu groups based on enabled modules
  // IMPORTANT: Show ALL menus for owner role (full access)
  const userRole = session?.user?.role;
  const isOwnerOrSuperAdmin = userRole === 'owner' || userRole === 'super_admin';
  
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: configLoading
      ? group.items // Show all during loading
      : isOwnerOrSuperAdmin
        ? group.items // Owner and super_admin see ALL menus
        : group.items.filter(item => hasModule(item.code)) // Others filtered by modules
  })).filter(group => group.items.length > 0); // Remove empty groups

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <Link href="/dashboard" className={`flex items-center space-x-2 transition-all ${
            sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''
          }`}>
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600 transition-all ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>
              BEDAGANG
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: 'calc(100vh - 64px - 120px)' }}
        >
          {filteredMenuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Section Header */}
              {!sidebarCollapsed && (
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
              )}
              
              {/* Divider for collapsed state */}
              {sidebarCollapsed && groupIndex > 0 && (
                <div className="my-2 border-t border-gray-200"></div>
              )}
              
              {/* Menu Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group relative ${
                        isActive
                          ? 'bg-sky-50 text-sky-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${
                        sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${
                        sidebarCollapsed ? 'lg:mx-auto' : ''
                      }`} />
                      <span className={`transition-all ${
                        sidebarCollapsed ? 'lg:hidden' : ''
                      }`}>{item.label}</span>
                      
                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info & Logout - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className={`flex items-center space-x-3 mb-3 ${
            sidebarCollapsed ? 'lg:justify-center' : ''
          }`}>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className={`flex-1 min-w-0 transition-all ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all group relative ${
              sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`w-4 h-4 flex-shrink-0 ${
              sidebarCollapsed ? 'lg:mx-auto' : ''
            }`} />
            <span className={`transition-all ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>Keluar</span>
            
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Keluar
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
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
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold text-gray-900">
                {filteredMenuGroups.flatMap(g => g.items).find(item => item.href === router.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
