import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getSessionTenantId } from '@/lib/session-scope';
import { Op } from 'sequelize';
import { fetchOpanelWorkforceForTenant, getOpanelWorkforceEmpty } from '@/lib/opanel-workforce-server';

const db = require('@/models');

function canAccessOpanel(role: string | undefined): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return ['owner', 'hq_admin', 'super_admin', 'superadmin'].includes(r);
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fillDailySeries(
  start: Date,
  days: number,
  byDay: Record<string, { sales: number; transactions: number }>
) {
  const out: { date: string; label: string; sales: number; transactions: number }[] = [];
  const fmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = dayKey(d);
    const row = byDay[key] || { sales: 0, transactions: 0 };
    out.push({
      date: key,
      label: fmt.format(d),
      sales: row.sales,
      transactions: row.transactions,
    });
  }
  return out;
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

    const tenantId = getSessionTenantId(session);
    const workforceEmpty = getOpanelWorkforceEmpty();

    const empty = {
      success: true,
      dailySales: [] as ReturnType<typeof fillDailySeries>,
      lowStock: [] as any[],
      needPurchase: [] as any[],
      employees: { total: 0, active: 0, byStatus: [] as { status: string; count: number }[], roster: [] as any[] },
      workforce: workforceEmpty,
      subscription: null as any,
      membership: { membersAndVip: 0, totalCustomers: 0, byTier: [] as { tier: string; count: number }[] },
      todaySales: { total: 0, transactions: 0, paymentMix: [] as { method: string; count: number; amount: number }[] },
    };

    if (!tenantId) {
      return res.status(200).json(empty);
    }

    const { Branch, Tenant, Employee, PosTransaction, Product, Stock, Customer } = db;

    const branches = await Branch.findAll({
      where: { tenantId },
      attributes: ['id', 'name', 'code'],
    });
    const branchIds = branches.map((b: any) => b.id);

    const workforce = await fetchOpanelWorkforceForTenant(db, tenantId, branches);

    const start14 = new Date();
    start14.setDate(start14.getDate() - 13);
    start14.setHours(0, 0, 0, 0);

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    let dailySales = empty.dailySales;
    let todaySales = empty.todaySales;

    try {
      const where14: any = {
        status: 'closed',
        transactionDate: { [Op.gte]: start14 },
      };
      if (branchIds.length > 0) {
        where14.branchId = { [Op.in]: branchIds };
      } else {
        where14.id = { [Op.eq]: null };
      }

      const txs14 = await PosTransaction.findAll({
        where: where14,
        attributes: ['transactionDate', 'total'],
        raw: true,
      });

      const byDay: Record<string, { sales: number; transactions: number }> = {};
      for (const t of txs14) {
        const key = dayKey(new Date((t as any).transactionDate));
        if (!byDay[key]) byDay[key] = { sales: 0, transactions: 0 };
        byDay[key].sales += parseFloat(String((t as any).total || 0));
        byDay[key].transactions += 1;
      }
      dailySales = fillDailySeries(start14, 14, byDay);

      const whereToday: any = {
        status: 'closed',
        transactionDate: { [Op.between]: [startToday, endToday] },
      };
      if (branchIds.length > 0) {
        whereToday.branchId = { [Op.in]: branchIds };
      } else {
        whereToday.id = { [Op.eq]: null };
      }

      const txsToday = await PosTransaction.findAll({
        where: whereToday,
        attributes: ['paymentMethod', 'total'],
        raw: true,
      });

      const mix: Record<string, { count: number; amount: number }> = {};
      let tTotal = 0;
      for (const t of txsToday) {
        const m = String((t as any).paymentMethod || 'Lainnya');
        if (!mix[m]) mix[m] = { count: 0, amount: 0 };
        mix[m].count += 1;
        const amt = parseFloat(String((t as any).total || 0));
        mix[m].amount += amt;
        tTotal += amt;
      }
      todaySales = {
        total: tTotal,
        transactions: txsToday.length,
        paymentMix: Object.entries(mix).map(([method, v]) => ({
          method,
          count: v.count,
          amount: v.amount,
        })),
      };
    } catch (e) {
      console.warn('[opanel/dashboard-insights] sales block', e);
    }

    let lowStock: any[] = [];
    let needPurchase: any[] = [];

    try {
      const products = await Product.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'sku', 'minimum_stock', 'reorder_point'],
        include: [
          {
            model: Stock,
            as: 'stock_data',
            attributes: ['quantity'],
            required: false,
          },
        ],
        limit: 400,
      });

      const scored = products.map((p: any) => {
        const rows = p.stock_data || [];
        const qty = rows.reduce((s: number, st: any) => s + parseFloat(String(st.quantity ?? 0)), 0);
        const minS = Math.max(parseFloat(String(p.minimum_stock ?? 0)) || 0, 0);
        const reo = Math.max(parseFloat(String(p.reorder_point ?? 0)) || 0, 0);
        const threshold = minS > 0 ? minS : reo > 0 ? reo : 5;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: qty,
          minimum_stock: minS,
          reorder_point: reo,
          threshold,
        };
      });

      lowStock = scored
        .filter((x) => x.quantity <= x.threshold)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 12)
        .map((x) => ({
          ...x,
          urgency: x.quantity <= 0 ? 'habis' : x.quantity <= x.reorder_point && x.reorder_point > 0 ? 'reorder' : 'menipis',
        }));

      needPurchase = scored
        .filter((x) => x.quantity <= 0 || (x.reorder_point > 0 && x.quantity <= x.reorder_point))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 10)
        .map((x) => ({
          id: x.id,
          name: x.name,
          sku: x.sku,
          quantity: x.quantity,
          suggestedQty: Math.max(x.reorder_point || 0, x.threshold || 0, 10),
        }));
    } catch (e) {
      console.warn('[opanel/dashboard-insights] stock block', e);
    }

    let employees = empty.employees;
    try {
      const total = await Employee.count({ where: { tenantId } });
      const active = await Employee.count({ where: { tenantId, status: 'ACTIVE' } });
      const statusRows = await Employee.findAll({
        where: { tenantId },
        attributes: ['status'],
        raw: true,
      });
      const statusMap: Record<string, number> = {};
      for (const r of statusRows as { status?: string }[]) {
        const s = String(r.status || 'UNKNOWN');
        statusMap[s] = (statusMap[s] || 0) + 1;
      }
      const roster = await Employee.findAll({
        where: { tenantId },
        attributes: ['id', 'name', 'position', 'department', 'status', 'employeeId'],
        order: [['name', 'ASC']],
        limit: 8,
      });
      employees = {
        total,
        active,
        byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
        roster: roster.map((e: any) => ({
          id: e.id,
          name: e.name,
          position: e.position,
          department: e.department,
          status: e.status,
          employeeId: e.employeeId,
        })),
      };
    } catch (e) {
      console.warn('[opanel/dashboard-insights] employees block', e);
    }

    let subscription: any = null;
    try {
      const tenant = await Tenant.findByPk(tenantId, {
        attributes: [
          'subscriptionPlan',
          'subscriptionStart',
          'subscriptionEnd',
          'status',
          'maxUsers',
          'maxBranches',
          'businessName',
        ],
      });
      if (tenant) {
        const end = tenant.subscriptionEnd ? new Date(tenant.subscriptionEnd) : null;
        const now = new Date();
        const daysRemaining =
          end != null && !Number.isNaN(end.getTime()) ? Math.ceil((end.getTime() - now.getTime()) / (86400000)) : null;
        subscription = {
          plan: tenant.subscriptionPlan || 'basic',
          status: tenant.status || 'trial',
          start: tenant.subscriptionStart,
          end: tenant.subscriptionEnd,
          maxUsers: tenant.maxUsers ?? 5,
          maxBranches: tenant.maxBranches ?? 1,
          businessName: tenant.businessName,
          daysRemaining,
        };
      }
    } catch (e) {
      console.warn('[opanel/dashboard-insights] subscription block', e);
    }

    let membership = empty.membership;
    try {
      const membersAndVip = await Customer.count({
        where: { tenantId, type: { [Op.in]: ['member', 'vip'] } },
      });
      const totalCustomers = await Customer.count({ where: { tenantId } });
      const tierRows = await Customer.findAll({
        where: { tenantId, membershipLevel: { [Op.ne]: null } },
        attributes: ['membershipLevel'],
        raw: true,
      });
      const tierMap: Record<string, number> = {};
      for (const r of tierRows as { membershipLevel?: string }[]) {
        const t = String(r.membershipLevel || '—');
        tierMap[t] = (tierMap[t] || 0) + 1;
      }
      membership = {
        membersAndVip,
        totalCustomers,
        byTier: Object.entries(tierMap).map(([tier, count]) => ({ tier, count })),
      };
    } catch (e) {
      console.warn('[opanel/dashboard-insights] membership block', e);
    }

    return res.status(200).json({
      success: true,
      dailySales,
      lowStock,
      needPurchase,
      employees,
      workforce,
      subscription,
      membership,
      todaySales,
      branchCount: branchIds.length,
    });
  } catch (e: any) {
    console.error('[opanel/dashboard-insights]', e);
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
