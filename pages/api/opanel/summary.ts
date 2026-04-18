import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const db = require('@/models');

function canAccessOpanel(role: string | undefined): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return ['owner', 'hq_admin', 'super_admin', 'superadmin'].includes(r);
}

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

    const tenantId = (session.user as { tenantId?: string }).tenantId;
    if (!tenantId) {
      return res.status(200).json({
        success: true,
        tenant: null,
        branches: [],
        branchCount: 0,
      });
    }

    const tenant = await db.Tenant.findByPk(tenantId, {
      include: [{ model: db.BusinessType, as: 'businessType', required: false }],
    });

    const branches = await db.Branch.findAll({
      where: { tenantId },
      attributes: ['id', 'name', 'code', 'type', 'city', 'phone'],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      tenant: tenant
        ? {
            id: tenant.id,
            businessName: tenant.businessName,
            setupCompleted: tenant.setupCompleted,
            businessType: tenant.businessType
              ? { code: tenant.businessType.code, name: tenant.businessType.name }
              : null,
          }
        : null,
      branches: branches.map((b: any) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        type: b.type,
        city: b.city,
        phone: b.phone,
      })),
      branchCount: branches.length,
    });
  } catch (e: any) {
    console.error('[opanel/summary]', e);
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
