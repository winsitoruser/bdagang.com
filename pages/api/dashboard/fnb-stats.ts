import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { sequelize } from '@/lib/sequelizeClient';
import { QueryTypes } from 'sequelize';
import { getTenantId, getBranchId } from '@/lib/api/tenantScope';

/**
 * F&B Dashboard Stats — data tenant/cabang, tanpa angka acak.
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

    const tenantId = getTenantId(session);
    if (!tenantId) {
      return res.status(200).json({
        success: true,
        data: emptyStats(),
        source: 'no-tenant',
      });
    }

    const branchId = getBranchId(session);

    const safeQuery = async <T extends Record<string, unknown>>(
      query: string,
      replacements: Record<string, unknown>,
      defaultRow: T
    ): Promise<T> => {
      try {
        const [row] = (await sequelize.query(query, {
          replacements,
          type: QueryTypes.SELECT,
        })) as T[];
        return row && typeof row === 'object' ? row : defaultRow;
      } catch (e) {
        console.error('[fnb-stats] query:', e);
        return defaultRow;
      }
    };

    const branchClause = branchId
      ? 'AND (pt.branch_id = CAST(:branchId AS uuid) OR pt.branch_id IS NULL)'
      : '';

    const activeOrdersResult = await safeQuery<{ count: string }>(
      `
      SELECT COUNT(*)::text as count FROM kitchen_orders ko
      WHERE ko.tenant_id = CAST(:tenantId AS uuid)
        AND ko.status IN ('new', 'preparing')
        AND DATE(COALESCE(ko.received_at, ko.created_at)) = CURRENT_DATE
    `,
      { tenantId },
      { count: '0' }
    );

    const tablesResult = await safeQuery<{
      total: string;
      occupied: string;
      reserved: string;
      available: string;
    }>(
      `
      SELECT 
        COUNT(*)::text as total,
        COALESCE(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END), 0)::text as occupied,
        COALESCE(SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END), 0)::text as reserved,
        COALESCE(SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END), 0)::text as available
      FROM tables
      WHERE tenant_id = CAST(:tenantId AS uuid) AND is_active = true
    `,
      { tenantId },
      { total: '0', occupied: '0', reserved: '0', available: '0' }
    );

    const reservationsResult = await safeQuery<{ count: string }>(
      `
      SELECT COUNT(*)::text as count FROM reservations
      WHERE tenant_id = CAST(:tenantId AS uuid)
        AND reservation_date = CURRENT_DATE
        AND status NOT IN ('cancelled', 'no-show')
    `,
      { tenantId },
      { count: '0' }
    );

    const avgPrepTimeResult = await safeQuery<{ avg_time: string | null }>(
      `
      SELECT AVG(actual_prep_time)::text as avg_time FROM kitchen_orders ko
      WHERE ko.tenant_id = CAST(:tenantId AS uuid)
        AND ko.status IN ('ready', 'served')
        AND ko.actual_prep_time IS NOT NULL
        AND DATE(COALESCE(ko.received_at, ko.created_at)) = CURRENT_DATE
    `,
      { tenantId },
      { avg_time: null }
    );

    const salesResult = await safeQuery<{ total_sales: string; transaction_count: string }>(
      `
      SELECT 
        COALESCE(SUM(pt.total_amount), 0)::text as total_sales,
        COUNT(*)::text as transaction_count
      FROM pos_transactions pt
      WHERE pt.status IN ('closed', 'completed')
        AND DATE(pt.transaction_date) = CURRENT_DATE
        ${branchClause}
    `,
      branchId ? { branchId } : {},
      { total_sales: '0', transaction_count: '0' }
    );

    const completedOrdersResult = await safeQuery<{ count: string }>(
      `
      SELECT COUNT(*)::text as count FROM kitchen_orders ko
      WHERE ko.tenant_id = CAST(:tenantId AS uuid)
        AND ko.status IN ('ready', 'served')
        AND DATE(COALESCE(ko.received_at, ko.created_at)) = CURRENT_DATE
    `,
      { tenantId },
      { count: '0' }
    );

    const guestsResult = await safeQuery<{ reservation_guests: string }>(
      `
      SELECT COALESCE(SUM(guest_count), 0)::text as reservation_guests
      FROM reservations
      WHERE tenant_id = CAST(:tenantId AS uuid)
        AND reservation_date = CURRENT_DATE
        AND status IN ('confirmed', 'seated', 'completed')
    `,
      { tenantId },
      { reservation_guests: '0' }
    );

    const lowStockResult = await safeQuery<{ count: string }>(
      `
      SELECT COUNT(*)::text as count
      FROM kitchen_inventory_items
      WHERE tenant_id = CAST(:tenantId AS uuid)
        AND current_stock <= min_stock
    `,
      { tenantId },
      { count: '0' }
    );

    const yesterdaySalesResult = await safeQuery<{ total_sales: string }>(
      `
      SELECT COALESCE(SUM(pt.total_amount), 0)::text as total_sales
      FROM pos_transactions pt
      WHERE pt.status IN ('closed', 'completed')
        AND DATE(pt.transaction_date) = CURRENT_DATE - INTERVAL '1 day'
        ${branchClause}
    `,
      branchId ? { branchId } : {},
      { total_sales: '0' }
    );

    const todaySales = parseFloat(String(salesResult.total_sales)) || 0;
    const yesterdaySales = parseFloat(String(yesterdaySalesResult.total_sales)) || 0;
    const salesChange =
      yesterdaySales > 0
        ? parseFloat((((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1))
        : todaySales > 0
          ? 100
          : 0;

    const stats = {
      activeOrders: parseInt(String(activeOrdersResult.count), 10) || 0,
      tablesOccupied: parseInt(String(tablesResult.occupied), 10) || 0,
      tablesTotal: parseInt(String(tablesResult.total), 10) || 0,
      tablesReserved: parseInt(String(tablesResult.reserved), 10) || 0,
      tablesAvailable: parseInt(String(tablesResult.available), 10) || 0,
      todayReservations: parseInt(String(reservationsResult.count), 10) || 0,
      avgPrepTime: Math.round(parseFloat(String(avgPrepTimeResult.avg_time || '0')) || 0),
      todaySales,
      yesterdaySales,
      salesChange,
      completedOrders: parseInt(String(completedOrdersResult.count), 10) || 0,
      totalGuests: parseInt(String(guestsResult.reservation_guests), 10) || 0,
      lowStockItems: parseInt(String(lowStockResult.count), 10) || 0,
      transactionCount: parseInt(String(salesResult.transaction_count), 10) || 0,
    };

    return res.status(200).json({
      success: true,
      data: stats,
      source: 'database',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching F&B stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: message,
    });
  }
}

function emptyStats() {
  return {
    activeOrders: 0,
    tablesOccupied: 0,
    tablesTotal: 0,
    tablesReserved: 0,
    tablesAvailable: 0,
    todayReservations: 0,
    avgPrepTime: 0,
    todaySales: 0,
    yesterdaySales: 0,
    salesChange: 0,
    completedOrders: 0,
    totalGuests: 0,
    lowStockItems: 0,
    transactionCount: 0,
  };
}
