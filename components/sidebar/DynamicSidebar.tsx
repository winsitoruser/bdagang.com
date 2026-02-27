import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import {
  SidebarConfig,
  MenuItem,
  MenuGroup,
  UserRole,
  ModuleCode,
  filterSidebarConfig,
  findActiveMenuItem,
  getParentMenuItem
} from '@/config/sidebar.config';

interface DynamicSidebarProps {
  config: SidebarConfig;
  enabledModules?: ModuleCode[];
  onLogout?: () => void;
  className?: string;
}

export default function DynamicSidebar({
  config,
  enabledModules = [],
  onLogout,
  className = ''
}: DynamicSidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Get user role from session
  const userRole = (session?.user as any)?.role as UserRole | undefined;

  // Filter config based on role and modules
  const filteredConfig = useMemo(() => {
    return filterSidebarConfig(config, userRole, enabledModules.length > 0 ? enabledModules : undefined);
  }, [config, userRole, enabledModules]);

  // Auto-expand parent of active menu item
  useEffect(() => {
    setMounted(true);
    
    // Find active item and expand its parent
    const activeItem = findActiveMenuItem(filteredConfig.groups, router.pathname);
    if (activeItem) {
      const parent = getParentMenuItem(filteredConfig.groups, activeItem.id);
      if (parent && !expandedMenus.includes(parent.id)) {
        setExpandedMenus(prev => [...prev, parent.id]);
      }
    }

    // Load collapsed state from localStorage
    const saved = localStorage.getItem(`sidebar-collapsed-${config.layout}`);
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, [router.pathname, filteredConfig.groups, config.layout]);

  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(`sidebar-collapsed-${config.layout}`, String(newState));
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(m => m !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId);

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isMenuExpanded(item.id);
    const active = isActive(item.href);
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
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </div>
            {!sidebarCollapsed && (
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>
          
          {/* Collapsed tooltip */}
          {sidebarCollapsed && (
            <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              {item.name}
            </div>
          )}
          
          {!sidebarCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
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
          <Icon className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
        </div>
        
        {!sidebarCollapsed && item.badge !== undefined && (
          <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
            {item.badge}
          </span>
        )}

        {/* Coming soon badge */}
        {!sidebarCollapsed && item.comingSoon && (
          <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
            Soon
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

  const renderMenuGroup = (group: MenuGroup) => {
    return (
      <div key={group.id} className="mb-4">
        {/* Group Title */}
        {!sidebarCollapsed && (
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
          </div>
        )}
        
        {/* Group Items */}
        <div className="space-y-1">
          {group.items.map(item => renderMenuItem(item))}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 w-64 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </aside>
    );
  }

  const LogoIcon = config.logo.icon;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 ${className}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href={config.logo.href} className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900">{config.logo.title}</h1>
                {config.logo.subtitle && (
                  <p className="text-xs text-gray-500">{config.logo.subtitle}</p>
                )}
              </div>
            )}
          </Link>
          
          {/* Mobile close button */}
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
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className={`mt-3 flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all group relative ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Keluar</span>}
              
              {/* Collapsed tooltip */}
              {sidebarCollapsed && (
                <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Keluar
                </div>
              )}
            </button>
          )}
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>
    </>
  );
}

// Hook for sidebar state
export function useSidebarState(layout: string) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`sidebar-collapsed-${layout}`);
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, [layout]);

  return { collapsed };
}
