import React, { ReactNode, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useBusinessType } from '@/contexts/BusinessTypeContext';
import { 
  LogOut,
  Store,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  branchSidebarConfig,
  filterSidebarConfig,
  findActiveMenuItem,
  getParentMenuItem,
  MenuItem,
  MenuGroup,
  UserRole,
  ModuleCode
} from '@/config/sidebar.config';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { hasModule, isLoading: configLoading, modules } = useBusinessType();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Get user role from session
  const userRole = (session?.user as any)?.role as UserRole | undefined;

  // Convert enabled modules to ModuleCode array
  const enabledModuleCodes = useMemo(() => {
    if (configLoading || !modules) return [];
    return modules.map((m) => m.code) as ModuleCode[];
  }, [modules, configLoading]);

  // Filter sidebar config based on role and modules
  const filteredConfig = useMemo(() => {
    return filterSidebarConfig(
      branchSidebarConfig, 
      userRole, 
      enabledModuleCodes.length > 0 ? enabledModuleCodes : undefined
    );
  }, [userRole, enabledModuleCodes]);

  // Auto-collapse sidebar for cashier page, otherwise load from localStorage
  React.useEffect(() => {
    const isCashierPage = router.pathname === '/pos/cashier';
    if (isCashierPage) {
      setSidebarCollapsed(true);
    } else {
      const saved = localStorage.getItem('branch-sidebar-collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    }
  }, [router.pathname]);

  // Save collapsed state to localStorage
  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('branch-sidebar-collapsed', String(newState));
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <Link
        key={item.id}
        href={item.href || '#'}
        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all group relative ${
          active
            ? 'bg-sky-50 text-sky-600 font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        } ${
          sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''
        }`}
        title={sidebarCollapsed ? item.name : ''}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${
          sidebarCollapsed ? 'lg:mx-auto' : ''
        }`} />
        <span className={`text-sm transition-all ${
          sidebarCollapsed ? 'lg:hidden' : ''
        }`}>{item.name}</span>
        
        {/* Tooltip for collapsed state */}
        {sidebarCollapsed && (
          <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        )}
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup, groupIndex: number) => (
    <div key={group.id}>
      {/* Section Header */}
      {!sidebarCollapsed && (
        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
        {group.items.map(item => renderMenuItem(item))}
      </div>
    </div>
  );

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
          style={{ maxHeight: 'calc(100vh - 64px)' }}
        >
          {filteredConfig.groups.map((group, groupIndex) => renderMenuGroup(group, groupIndex))}
        </nav>
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
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
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
                {findActiveMenuItem(filteredConfig.groups, router.pathname)?.name || 'Dashboard'}
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
