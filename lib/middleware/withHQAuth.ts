import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';

/**
 * HQ API Authentication Middleware
 * Wraps any HQ API handler with session authentication.
 * Rejects unauthenticated requests with 401.
 * Injects session into req for downstream use.
 * 
 * Usage:
 *   export default withHQAuth(handler);
 *   // or with module guard:
 *   export default withHQAuth(handler, { module: 'finance_pro' });
 *   // or with role restriction:
 *   export default withHQAuth(handler, { roles: ['owner', 'hq_admin', 'finance_staff'] });
 */

interface HQAuthOptions {
  module?: string | string[];
  roles?: string[];
}

export function withHQAuth(
  handler: NextApiHandler,
  options?: HQAuthOptions
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      // Inject session into request for downstream handlers
      (req as any).session = session;

      const userRole = ((session.user as any).role || '').toLowerCase();
      const tenantId = (session.user as any).tenantId;

      // Role check (super_admin and owner always pass)
      if (options?.roles && userRole !== 'super_admin' && userRole !== 'owner') {
        const allowed = options.roles.map(r => r.toLowerCase());
        if (!allowed.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: 'FORBIDDEN',
            message: 'Insufficient permissions'
          });
        }
      }

      // Module check (super_admin and owner bypass)
      if (options?.module && userRole !== 'super_admin' && userRole !== 'owner') {
        if (!tenantId) {
          return res.status(403).json({
            success: false,
            error: 'NO_TENANT',
            message: 'No tenant associated with this user'
          });
        }

        try {
          const db = require('../../models');
          const codes = Array.isArray(options.module) ? options.module : [options.module];
          const enabled = await db.TenantModule.findAll({
            where: { tenantId, isEnabled: true },
            include: [{
              model: db.Module,
              as: 'module',
              where: { code: codes, isActive: true }
            }]
          });
          if (enabled.length === 0) {
            return res.status(403).json({
              success: false,
              error: 'MODULE_NOT_ENABLED',
              message: `Required module not enabled for your business`,
              requiredModules: codes
            });
          }
        } catch (e) {
          // If models aren't available, allow access (dev fallback)
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('HQ Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Authentication service error'
      });
    }
  };
}

export default withHQAuth;
