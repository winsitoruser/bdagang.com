import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getSessionTenantId } from '@/lib/session-scope';
import { fetchOpanelWorkforceForTenant, getOpanelWorkforceEmpty } from '@/lib/opanel-workforce-server';

const db = require('@/models');

function canAccessOpanel(role: string | undefined): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return ['owner', 'hq_admin', 'super_admin', 'superadmin'].includes(r);
}

/**
 * GET /api/opanel/workforce
 * Agregasi jadwal shift (WIB), petugas dalam slot aktif, ringkasan per cabang, login 24 jam.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const role = (session.user as { role?: string }).role;
    if (!canAccessOpanel(role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const tenantId = getSessionTenantId(session);
    const data = tenantId ? await fetchOpanelWorkforceForTenant(db, tenantId) : getOpanelWorkforceEmpty();

    return res.status(200).json({
      success: true,
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        tenantId: tenantId || null,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    console.error('[api/opanel/workforce]', e);
    return res.status(500).json({ success: false, error: message });
  }
}
