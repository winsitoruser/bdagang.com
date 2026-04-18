import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getSessionTenantId } from '@/lib/session-scope';

const Customer = require('../../../models/Customer');
const PosTransaction = require('../../../models/PosTransaction');
const { Op } = require('sequelize');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const tenantId = getSessionTenantId(session);
  if (!tenantId) {
    return res.status(400).json({
      error: 'tenant_required',
      message: 'Tenant tidak ditemukan pada sesi. Silakan login ulang.'
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tenantWhere = { tenantId };

    // Get overall statistics
    const totalCustomers = await Customer.count({ where: tenantWhere });
    const activeCustomers = await Customer.count({ where: { ...tenantWhere, status: 'active' } });
    const vipCustomers = await Customer.count({ where: { ...tenantWhere, type: 'vip' } });
    const memberCustomers = await Customer.count({ where: { ...tenantWhere, type: 'member' } });

    // Get average lifetime value
    const avgStats = await Customer.findAll({
      where: tenantWhere,
      attributes: [
        [Customer.sequelize.fn('AVG', Customer.sequelize.col('totalSpent')), 'avgLifetimeValue'],
        [Customer.sequelize.fn('AVG', Customer.sequelize.col('totalPurchases')), 'avgPurchases'],
        [Customer.sequelize.fn('SUM', Customer.sequelize.col('totalSpent')), 'totalRevenue']
      ],
      raw: true
    });

    // Get new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await Customer.count({
      where: {
        tenantId,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Get customers by membership level
    const customersByLevel = await Customer.findAll({
      where: tenantWhere,
      attributes: [
        'membershipLevel',
        [Customer.sequelize.fn('COUNT', Customer.sequelize.col('id')), 'count']
      ],
      group: ['membershipLevel'],
      raw: true
    });

    // Get top customers by spending
    const topCustomers = await Customer.findAll({
      where: { ...tenantWhere, isActive: true },
      order: [['totalSpent', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'phone', 'email', 'totalSpent', 'totalPurchases', 'membershipLevel']
    });

    // Get recent customers
    const recentCustomers = await Customer.findAll({
      where: { ...tenantWhere, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'phone', 'email', 'createdAt', 'type', 'status']
    });

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          activeCustomers,
          vipCustomers,
          memberCustomers,
          newCustomersThisMonth,
          avgLifetimeValue: parseFloat(avgStats[0]?.avgLifetimeValue || 0),
          avgPurchases: parseFloat(avgStats[0]?.avgPurchases || 0),
          totalRevenue: parseFloat(avgStats[0]?.totalRevenue || 0)
        },
        customersByLevel: customersByLevel.map((item: any) => ({
          level: item.membershipLevel,
          count: parseInt(item.count)
        })),
        topCustomers,
        recentCustomers
      }
    });

  } catch (error: any) {
    console.error('Customer Stats API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
