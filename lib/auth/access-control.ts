/**
 * Client-side utility functions for access control
 * This file is safe to import in client components
 */

/**
 * Check if user has access to a specific module
 * Client-side version - simplified role-based check
 */
export function checkAccess(user: any, moduleCode: string): boolean {
  if (!user) return false;
  
  // Super admin has access to everything
  if (user.role === 'super_admin') return true;
  
  // Role-based module access
  const roleModuleAccess: Record<string, string[]> = {
    admin: ['finance', 'inventory', 'pos', 'purchasing', 'hr', 'reports'],
    manager: ['finance', 'inventory', 'pos', 'purchasing', 'hr', 'reports'],
    cashier: ['pos'],
    warehouse: ['inventory', 'purchasing'],
    accountant: ['finance', 'reports'],
  };
  
  const allowedModules = roleModuleAccess[user.role] || [];
  return allowedModules.includes(moduleCode);
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPathByRole(role: string): string {
  const redirectPaths: Record<string, string> = {
    super_admin: '/admin',
    admin: '/dashboard',
    manager: '/dashboard',
    cashier: '/pos/transaksi',
    warehouse: '/inventory',
    accountant: '/finance',
  };
  
  return redirectPaths[role] || '/dashboard';
}
