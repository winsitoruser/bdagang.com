import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { Op } from 'sequelize';
import { getSessionBranchId, getSessionDataScope, getSessionTenantId } from '@/lib/session-scope';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const tenantId = getSessionTenantId(session);
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant tidak ditemukan pada sesi. Silakan login ulang.'
      });
    }

    const Employee = require('@/models/Employee');

    const { 
      search, 
      status = 'ACTIVE',
      limit = 50,
      offset = 0 
    } = req.query;

    const where: any = { tenantId };

    const branchId = getSessionBranchId(session);
    if (getSessionDataScope(session) === 'own_branch' && branchId) {
      where.branchId = branchId;
    }

    if (search) {
      const s = `%${search}%`;
      where[Op.or] = [
        { name: { [Op.like]: s } },
        { employeeId: { [Op.like]: s } },
        { email: { [Op.like]: s } }
      ];
    }

    if (status && String(status) !== 'all') {
      const st = typeof status === 'string' ? status.toUpperCase() : status;
      where.status = st;
    }

    try {
      const employees = await Employee.findAll({
        where,
        attributes: [
          'id',
          'employeeId',
          'name',
          'email',
          'phoneNumber',
          'position',
          'department',
          'status',
          'joinDate',
          'branchId',
          'tenantId'
        ],
        order: [['name', 'ASC']],
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      });

      const total = await Employee.count({ where });

      return res.status(200).json({
        success: true,
        data: employees,
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      });

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      return res.status(200).json({
        success: true,
        data: [],
        total: 0,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        warning: 'Database not ready'
      });
    }

  } catch (error: any) {
    console.error('Employees API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
