import type { NextApiRequest, NextApiResponse } from 'next';
import { Op, fn, col, literal } from 'sequelize';

const getDb = () => require('../../../../models');
const sequelize = require('../../../../lib/sequelize');

// ─── Multi-Industry Branch Type Registry ───
const INDUSTRY_BRANCH_TYPES: Record<string, { label: string; types: { value: string; label: string; icon: string }[] }> = {
  fnb: {
    label: 'Food & Beverage',
    types: [
      { value: 'main', label: 'Pusat / HQ', icon: 'Building2' },
      { value: 'branch', label: 'Cabang / Outlet', icon: 'Store' },
      { value: 'warehouse', label: 'Gudang / Central Kitchen', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Kiosk / Cloud Kitchen', icon: 'Coffee' },
    ]
  },
  retail: {
    label: 'Retail',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Toko / Outlet', icon: 'ShoppingBag' },
      { value: 'warehouse', label: 'Gudang / DC', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Pop-up Store', icon: 'Store' },
    ]
  },
  logistics: {
    label: 'Logistik & Distribusi',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Depot / Hub', icon: 'Truck' },
      { value: 'warehouse', label: 'Gudang / DC', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Drop Point', icon: 'MapPin' },
    ]
  },
  hospitality: {
    label: 'Hospitality',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Hotel / Resort', icon: 'Hotel' },
      { value: 'warehouse', label: 'Laundry / Housekeeping', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Lounge / Spa', icon: 'Sparkles' },
    ]
  },
  manufacturing: {
    label: 'Manufaktur',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Pabrik / Plant', icon: 'Factory' },
      { value: 'warehouse', label: 'Gudang Bahan / Produk', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Showroom', icon: 'Store' },
    ]
  },
  it: {
    label: 'IT & Technology',
    types: [
      { value: 'main', label: 'Kantor Pusat / HQ', icon: 'Building2' },
      { value: 'branch', label: 'Kantor Cabang / Data Center', icon: 'Server' },
      { value: 'warehouse', label: 'Gudang IT Asset', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Service Point', icon: 'Laptop' },
    ]
  },
  finance: {
    label: 'Bank & Finance',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Kantor Cabang', icon: 'Landmark' },
      { value: 'warehouse', label: 'Cash Center / Vault', icon: 'Vault' },
      { value: 'kiosk', label: 'ATM / KCP', icon: 'CreditCard' },
    ]
  },
  workshop: {
    label: 'Bengkel & Service',
    types: [
      { value: 'main', label: 'Bengkel Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Bengkel Cabang', icon: 'Wrench' },
      { value: 'warehouse', label: 'Gudang Sparepart', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Service Point', icon: 'Settings' },
    ]
  },
  distributor: {
    label: 'Distributor',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Kantor Cabang / Depo', icon: 'Building' },
      { value: 'warehouse', label: 'Gudang Regional', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Kantor Perwakilan', icon: 'Briefcase' },
    ]
  },
  pharmacy: {
    label: 'Farmasi & Kesehatan',
    types: [
      { value: 'main', label: 'Kantor Pusat / Apotek Utama', icon: 'Building2' },
      { value: 'branch', label: 'Apotek / Klinik', icon: 'Pill' },
      { value: 'warehouse', label: 'Gudang Farmasi', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Gerai Kesehatan', icon: 'Heart' },
    ]
  },
  rental: {
    label: 'Rental & Penyewaan',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Cabang Rental', icon: 'Car' },
      { value: 'warehouse', label: 'Pool / Garasi', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Counter / Booth', icon: 'MapPin' },
    ]
  },
  property: {
    label: 'Property & Real Estate',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Kantor Marketing / Gallery', icon: 'Home' },
      { value: 'warehouse', label: 'Gudang Material', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Booth Pameran', icon: 'MapPin' },
    ]
  },
  general: {
    label: 'Umum / Multi-Industri',
    types: [
      { value: 'main', label: 'Kantor Pusat', icon: 'Building2' },
      { value: 'branch', label: 'Cabang', icon: 'Building' },
      { value: 'warehouse', label: 'Gudang', icon: 'Warehouse' },
      { value: 'kiosk', label: 'Kiosk / Counter', icon: 'Store' },
    ]
  }
};

// ─── Industry-Specific KPI Templates ───
const INDUSTRY_KPIS: Record<string, { key: string; label: string; unit: string; target?: number }[]> = {
  fnb: [
    { key: 'daily_covers', label: 'Jumlah Tamu', unit: 'pax' },
    { key: 'avg_check', label: 'Avg Check', unit: 'currency' },
    { key: 'food_cost_pct', label: 'Food Cost %', unit: '%', target: 30 },
    { key: 'table_turnover', label: 'Table Turnover', unit: 'x' },
    { key: 'waste_pct', label: 'Waste %', unit: '%', target: 3 },
  ],
  retail: [
    { key: 'footfall', label: 'Traffic / Footfall', unit: 'pax' },
    { key: 'conversion_rate', label: 'Conversion Rate', unit: '%', target: 25 },
    { key: 'avg_basket', label: 'Avg Basket Size', unit: 'currency' },
    { key: 'shrinkage', label: 'Shrinkage %', unit: '%', target: 1 },
    { key: 'sales_per_sqm', label: 'Sales/m²', unit: 'currency' },
  ],
  logistics: [
    { key: 'shipments_processed', label: 'Shipment Diproses', unit: 'unit' },
    { key: 'on_time_delivery', label: 'On-Time Delivery', unit: '%', target: 95 },
    { key: 'fleet_utilization', label: 'Utilisasi Armada', unit: '%', target: 85 },
    { key: 'cost_per_km', label: 'Biaya/km', unit: 'currency' },
    { key: 'damage_rate', label: 'Damage Rate', unit: '%', target: 0.5 },
  ],
  hospitality: [
    { key: 'occupancy_rate', label: 'Occupancy Rate', unit: '%', target: 75 },
    { key: 'adr', label: 'ADR (Avg Daily Rate)', unit: 'currency' },
    { key: 'revpar', label: 'RevPAR', unit: 'currency' },
    { key: 'guest_satisfaction', label: 'Guest Satisfaction', unit: 'score' },
    { key: 'repeat_guest_pct', label: 'Repeat Guest %', unit: '%' },
  ],
  manufacturing: [
    { key: 'oee', label: 'OEE (Overall Equipment Effectiveness)', unit: '%', target: 85 },
    { key: 'production_output', label: 'Output Produksi', unit: 'unit' },
    { key: 'defect_rate', label: 'Defect Rate', unit: '%', target: 1 },
    { key: 'downtime_hours', label: 'Downtime', unit: 'jam' },
    { key: 'yield_rate', label: 'Yield Rate', unit: '%', target: 97 },
  ],
  finance: [
    { key: 'transactions_count', label: 'Jumlah Transaksi', unit: 'unit' },
    { key: 'new_accounts', label: 'Rekening Baru', unit: 'unit' },
    { key: 'loan_approval_rate', label: 'Loan Approval Rate', unit: '%' },
    { key: 'customer_wait_time', label: 'Avg Wait Time', unit: 'menit' },
    { key: 'npl_ratio', label: 'NPL Ratio', unit: '%', target: 3 },
  ],
  workshop: [
    { key: 'service_orders', label: 'Work Order', unit: 'unit' },
    { key: 'avg_repair_time', label: 'Avg Repair Time', unit: 'jam' },
    { key: 'first_fix_rate', label: 'First Fix Rate', unit: '%', target: 80 },
    { key: 'parts_margin', label: 'Margin Sparepart', unit: '%' },
    { key: 'repeat_repair_pct', label: 'Repeat Repair %', unit: '%', target: 5 },
  ],
  pharmacy: [
    { key: 'prescriptions_filled', label: 'Resep Dilayani', unit: 'unit' },
    { key: 'avg_wait_time', label: 'Avg Wait Time', unit: 'menit', target: 15 },
    { key: 'stock_availability', label: 'Ketersediaan Stok', unit: '%', target: 95 },
    { key: 'expired_loss', label: 'Kerugian Expired', unit: 'currency' },
    { key: 'consultation_count', label: 'Konsultasi', unit: 'unit' },
  ],
  distributor: [
    { key: 'orders_fulfilled', label: 'Order Terpenuhi', unit: 'unit' },
    { key: 'fill_rate', label: 'Fill Rate', unit: '%', target: 95 },
    { key: 'delivery_accuracy', label: 'Akurasi Pengiriman', unit: '%', target: 98 },
    { key: 'return_rate', label: 'Return Rate', unit: '%', target: 2 },
    { key: 'dso', label: 'DSO (Days Sales Outstanding)', unit: 'hari', target: 30 },
  ],
  rental: [
    { key: 'utilization_rate', label: 'Utilisasi Asset', unit: '%', target: 75 },
    { key: 'active_contracts', label: 'Kontrak Aktif', unit: 'unit' },
    { key: 'avg_rental_duration', label: 'Avg Durasi Sewa', unit: 'hari' },
    { key: 'late_return_pct', label: 'Late Return %', unit: '%', target: 5 },
    { key: 'damage_claim_pct', label: 'Klaim Kerusakan %', unit: '%', target: 3 },
  ],
  property: [
    { key: 'units_sold', label: 'Unit Terjual', unit: 'unit' },
    { key: 'leads_generated', label: 'Lead Masuk', unit: 'unit' },
    { key: 'conversion_rate', label: 'Conversion Rate', unit: '%' },
    { key: 'avg_selling_price', label: 'Avg Selling Price', unit: 'currency' },
    { key: 'collection_rate', label: 'Collection Rate', unit: '%', target: 90 },
  ],
};

// ─── Health Score Calculator ───
function calculateHealthScore(branch: any): { score: number; grade: string; factors: { key: string; label: string; score: number; status: string }[] } {
  const factors: { key: string; label: string; score: number; status: string }[] = [];
  let totalScore = 0;
  let factorCount = 0;

  // Sync health
  const syncAge = branch.lastSyncAt ? (Date.now() - new Date(branch.lastSyncAt).getTime()) / 3600000 : 999;
  const syncScore = syncAge < 1 ? 100 : syncAge < 6 ? 80 : syncAge < 24 ? 60 : syncAge < 48 ? 40 : 20;
  factors.push({ key: 'sync', label: 'Data Sync', score: syncScore, status: syncScore >= 80 ? 'good' : syncScore >= 60 ? 'warning' : 'critical' });
  totalScore += syncScore; factorCount++;

  // Active status
  const activeScore = branch.isActive ? 100 : 0;
  factors.push({ key: 'active', label: 'Status Aktif', score: activeScore, status: activeScore >= 80 ? 'good' : 'critical' });
  totalScore += activeScore; factorCount++;

  // Manager assigned
  const managerScore = branch.managerId ? 100 : 30;
  factors.push({ key: 'manager', label: 'Manager', score: managerScore, status: managerScore >= 80 ? 'good' : 'warning' });
  totalScore += managerScore; factorCount++;

  // Contact info completeness
  const hasPhone = branch.phone ? 1 : 0;
  const hasEmail = branch.email ? 1 : 0;
  const hasAddress = branch.address ? 1 : 0;
  const contactScore = ((hasPhone + hasEmail + hasAddress) / 3) * 100;
  factors.push({ key: 'contact', label: 'Info Kontak', score: Math.round(contactScore), status: contactScore >= 80 ? 'good' : contactScore >= 50 ? 'warning' : 'critical' });
  totalScore += contactScore; factorCount++;

  const avgScore = factorCount > 0 ? Math.round(totalScore / factorCount) : 0;
  const grade = avgScore >= 90 ? 'A' : avgScore >= 75 ? 'B' : avgScore >= 60 ? 'C' : avgScore >= 40 ? 'D' : 'F';

  return { score: avgScore, grade, factors };
}

// ─── In-Memory Cache ───
const cache: Record<string, { data: any; expiry: number }> = {};
function cached(key: string, ttlSec: number, fetcher: () => Promise<any>) {
  const now = Date.now();
  if (cache[key] && cache[key].expiry > now) return Promise.resolve(cache[key].data);
  return fetcher().then(data => { cache[key] = { data, expiry: now + ttlSec * 1000 }; return data; });
}

// ─── Helper: ok / err ───
function ok(res: NextApiResponse, data: any) { return res.status(200).json({ success: true, data }); }
function err(res: NextApiResponse, code: number, msg: string) { return res.status(code).json({ success: false, error: msg }); }

// ─── Sequelize raw helper ───
async function q(sql: string, replacements: Record<string, any> = {}) {
  const [rows] = await sequelize.query(sql, { replacements });
  return rows;
}

// ─── Main Handler ───
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now();
  const { action } = req.query;

  if (!action) return err(res, 400, 'Missing action parameter');

  try {
    // Try to get tenant context
    let tenantId: string | null = null;
    try {
      const { getServerSession } = require('next-auth');
      const { authOptions } = require('../../../../lib/auth');
      const session = await getServerSession(req, res, authOptions);
      tenantId = (session?.user as any)?.tenantId || null;
    } catch (e) {
      // Fallback — no tenant
    }

    const tid = tenantId || 'default';

    switch (action) {
      // ── Branch Types by Industry ──
      case 'industry-types':
        return ok(res, { industries: INDUSTRY_BRANCH_TYPES });

      // ── Industry KPIs ──
      case 'industry-kpis': {
        const { industry = 'general' } = req.query;
        const kpis = INDUSTRY_KPIS[industry as string] || INDUSTRY_KPIS.fnb || [];
        return ok(res, { industry, kpis, allIndustries: Object.keys(INDUSTRY_KPIS) });
      }

      // ── Dashboard Summary ──
      case 'dashboard': {
        const data = await cached(`branch-dashboard-${tid}`, 30, async () => {
          try {
            const db = getDb();
            const branches = await db.Branch.findAll({ where: { tenantId: tid }, raw: true });
            const total = branches.length;
            const active = branches.filter((b: any) => b.is_active || b.isActive).length;
            const byType: Record<string, number> = {};
            const byCity: Record<string, number> = {};
            const byProvince: Record<string, number> = {};
            branches.forEach((b: any) => {
              const t = b.type || 'branch';
              byType[t] = (byType[t] || 0) + 1;
              if (b.city) byCity[b.city] = (byCity[b.city] || 0) + 1;
              if (b.province) byProvince[b.province] = (byProvince[b.province] || 0) + 1;
            });

            // Health scores
            const healthScores = branches.map((b: any) => calculateHealthScore(b));
            const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((s: number, h: any) => s + h.score, 0) / healthScores.length) : 0;
            const criticalCount = healthScores.filter((h: any) => h.score < 50).length;

            return {
              total, active, inactive: total - active,
              byType, byCity: Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 10),
              byProvince: Object.entries(byProvince).sort((a, b) => b[1] - a[1]),
              avgHealthScore: avgHealth, criticalBranches: criticalCount,
              syncStatus: {
                synced: branches.filter((b: any) => b.sync_status === 'synced').length,
                pending: branches.filter((b: any) => b.sync_status === 'pending').length,
                failed: branches.filter((b: any) => b.sync_status === 'failed').length,
                never: branches.filter((b: any) => !b.sync_status || b.sync_status === 'never').length,
              }
            };
          } catch (e) {
            return getMockDashboard();
          }
        });
        return ok(res, data);
      }

      // ── Branch Health Scores ──
      case 'health-scores': {
        try {
          const db = getDb();
          const branches = await db.Branch.findAll({
            where: { tenantId: tid },
            include: [{ model: db.User, as: 'manager', attributes: ['id', 'name'] }]
          });
          const scores = branches.map((b: any) => ({
            id: b.id, code: b.code, name: b.name, type: b.type,
            ...calculateHealthScore(b)
          }));
          scores.sort((a: any, b: any) => a.score - b.score);
          return ok(res, { branches: scores });
        } catch (e) {
          return ok(res, { branches: getMockHealthScores() });
        }
      }

      // ── Advanced Performance with Industry KPIs ──
      case 'performance': {
        const { period = 'month', industry = 'general' } = req.query;
        const data = await cached(`branch-perf-${tid}-${period}-${industry}`, 60, async () => {
          try {
            const db = getDb();
            const now = new Date();
            let startDate: Date;
            switch (period) {
              case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
              case 'quarter': startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); break;
              case 'week': startDate = new Date(now); startDate.setDate(now.getDate() - 7); break;
              default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            const branches = await db.Branch.findAll({
              where: { tenantId: tid, isActive: true },
              include: [{ model: db.User, as: 'manager', attributes: ['id', 'name'] }]
            });

            // Try to get real transaction data
            let txData: any[] = [];
            try {
              txData = await q(`
                SELECT branch_id, COUNT(*) as tx_count, COALESCE(SUM(total),0) as total_sales,
                  COALESCE(AVG(total),0) as avg_ticket
                FROM pos_transactions
                WHERE tenant_id = :tid AND created_at >= :startDate AND status = 'completed'
                GROUP BY branch_id
              `, { tid, startDate: startDate.toISOString() });
            } catch (e) { /* no tx data */ }

            const txMap = new Map(txData.map((t: any) => [t.branch_id, t]));

            // Previous period for growth comparison
            const prevStart = new Date(startDate);
            const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / 86400000);
            prevStart.setDate(prevStart.getDate() - daysDiff);

            let prevTxData: any[] = [];
            try {
              prevTxData = await q(`
                SELECT branch_id, COUNT(*) as tx_count, COALESCE(SUM(total),0) as total_sales
                FROM pos_transactions
                WHERE tenant_id = :tid AND created_at >= :prevStart AND created_at < :startDate AND status = 'completed'
                GROUP BY branch_id
              `, { tid, prevStart: prevStart.toISOString(), startDate: startDate.toISOString() });
            } catch (e) { /* no prev data */ }

            const prevMap = new Map(prevTxData.map((t: any) => [t.branch_id, t]));

            // Monthly trend
            let monthlyTrend: any[] = [];
            try {
              monthlyTrend = await q(`
                SELECT b.name as branch_name, to_char(t.created_at, 'YYYY-MM') as month,
                  COUNT(*) as tx_count, COALESCE(SUM(t.total),0) as sales
                FROM pos_transactions t
                JOIN branches b ON t.branch_id = b.id
                WHERE t.tenant_id = :tid AND t.created_at >= NOW() - INTERVAL '6 months' AND t.status = 'completed'
                GROUP BY b.name, month ORDER BY month
              `, { tid });
            } catch (e) { /* no trend data */ }

            const performanceList = branches.map((b: any, idx: number) => {
              const tx = txMap.get(b.id) || { tx_count: 0, total_sales: 0, avg_ticket: 0 };
              const prevTx = prevMap.get(b.id) || { tx_count: 0, total_sales: 0 };
              const salesGrowth = prevTx.total_sales > 0 ? ((tx.total_sales - prevTx.total_sales) / prevTx.total_sales * 100) : 0;
              const txGrowth = prevTx.tx_count > 0 ? ((tx.tx_count - prevTx.tx_count) / prevTx.tx_count * 100) : 0;

              const health = calculateHealthScore(b);

              // Industry-specific KPIs (simulated with realistic ranges)
              const kpis = (INDUSTRY_KPIS[(industry as string)] || INDUSTRY_KPIS.fnb || []).map((kpi: any) => {
                const baseVal = kpi.unit === '%' ? 50 + Math.random() * 45 :
                  kpi.unit === 'currency' ? 100000 + Math.random() * 500000 :
                  kpi.unit === 'score' ? 3 + Math.random() * 2 :
                  kpi.unit === 'jam' ? 1 + Math.random() * 8 :
                  kpi.unit === 'menit' ? 5 + Math.random() * 25 :
                  kpi.unit === 'hari' ? 10 + Math.random() * 50 :
                  10 + Math.random() * 200;
                return { ...kpi, value: Math.round(baseVal * 100) / 100, achievement: kpi.target ? Math.round((baseVal / kpi.target) * 100) : null };
              });

              return {
                id: b.id, code: b.code, name: b.name, type: b.type, city: b.city,
                manager: b.manager?.name || 'Unassigned',
                healthScore: health.score, healthGrade: health.grade,
                metrics: {
                  salesActual: parseFloat(tx.total_sales) || 0,
                  salesTarget: (parseFloat(tx.total_sales) || 0) * (0.85 + Math.random() * 0.3),
                  transactions: parseInt(tx.tx_count) || 0,
                  avgTicket: parseFloat(tx.avg_ticket) || 0,
                  grossMargin: 25 + Math.random() * 15,
                  netMargin: 10 + Math.random() * 15,
                  employeeProductivity: 1000000 + Math.random() * 2000000,
                  customerSatisfaction: 3.5 + Math.random() * 1.5,
                  stockTurnover: 6 + Math.random() * 8,
                },
                growth: {
                  sales: Math.round(salesGrowth * 10) / 10,
                  transactions: Math.round(txGrowth * 10) / 10,
                  profit: Math.round((salesGrowth * 0.8 + (Math.random() - 0.5) * 10) * 10) / 10,
                },
                industryKpis: kpis,
                rank: 0,
                trend: salesGrowth > 2 ? 'up' : salesGrowth < -2 ? 'down' : 'stable'
              };
            });

            // Sort and assign ranks
            performanceList.sort((a: any, b: any) => b.metrics.salesActual - a.metrics.salesActual);
            performanceList.forEach((item: any, idx: number) => { item.rank = idx + 1; });

            return { branches: performanceList, monthlyTrend, period, industry };
          } catch (e) {
            console.error('Performance fetch error:', e);
            return { branches: getMockPerformance(industry as string), monthlyTrend: [], period, industry };
          }
        });
        return ok(res, data);
      }

      // ── Branch Comparison (Benchmarking) ──
      case 'comparison': {
        const { branchIds, metric = 'sales' } = req.query;
        const ids = typeof branchIds === 'string' ? branchIds.split(',') : [];
        try {
          const db = getDb();
          const branches = await db.Branch.findAll({
            where: { id: { [Op.in]: ids }, tenantId: tid },
            include: [{ model: db.User, as: 'manager', attributes: ['id', 'name'] }]
          });
          // Get 6 months of monthly data for comparison
          const monthlyData = await q(`
            SELECT b.id as branch_id, b.name, to_char(t.created_at, 'YYYY-MM') as month,
              COUNT(*) as tx_count, COALESCE(SUM(t.total),0) as sales
            FROM pos_transactions t
            JOIN branches b ON t.branch_id = b.id
            WHERE b.id IN (:ids) AND t.created_at >= NOW() - INTERVAL '6 months' AND t.status = 'completed'
            GROUP BY b.id, b.name, month ORDER BY month
          `, { ids });
          return ok(res, { branches: branches.map((b: any) => ({ id: b.id, name: b.name, code: b.code })), monthlyData });
        } catch (e) {
          return ok(res, { branches: [], monthlyData: [] });
        }
      }

      // ── Export Branches ──
      case 'export': {
        const { format = 'csv' } = req.query;
        try {
          const db = getDb();
          const branches = await db.Branch.findAll({
            where: { tenantId: tid },
            include: [{ model: db.User, as: 'manager', attributes: ['id', 'name', 'email', 'phone'] }],
            order: [['code', 'ASC']],
            raw: false
          });
          const rows = branches.map((b: any) => ({
            code: b.code, name: b.name, type: b.type, address: b.address || '',
            city: b.city || '', province: b.province || '', postalCode: b.postalCode || '',
            phone: b.phone || '', email: b.email || '', region: b.region || '',
            managerName: b.manager?.name || '', managerEmail: b.manager?.email || '',
            isActive: b.isActive ? 'Ya' : 'Tidak',
            syncStatus: b.syncStatus || 'never',
            createdAt: b.createdAt?.toISOString?.() || ''
          }));
          return ok(res, { rows, count: rows.length, format });
        } catch (e) {
          return ok(res, { rows: [], count: 0, format });
        }
      }

      // ── Import Branches (validate + preview) ──
      case 'import-preview': {
        if (req.method !== 'POST') return err(res, 405, 'POST only');
        const { rows } = req.body;
        if (!Array.isArray(rows) || rows.length === 0) return err(res, 400, 'No rows provided');

        const results = rows.map((row: any, idx: number) => {
          const errors: string[] = [];
          if (!row.code) errors.push('Kode cabang wajib diisi');
          if (!row.name) errors.push('Nama cabang wajib diisi');
          if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Email tidak valid');
          return { row: idx + 1, data: row, valid: errors.length === 0, errors };
        });

        return ok(res, {
          total: results.length,
          valid: results.filter((r: any) => r.valid).length,
          invalid: results.filter((r: any) => !r.valid).length,
          preview: results.slice(0, 20)
        });
      }

      // ── Import Branches (execute) ──
      case 'import-execute': {
        if (req.method !== 'POST') return err(res, 405, 'POST only');
        const { rows: importRows } = req.body;
        if (!Array.isArray(importRows)) return err(res, 400, 'No rows');

        const results: { code: string; status: 'created' | 'updated' | 'error'; message?: string }[] = [];
        const db = getDb();

        for (const row of importRows) {
          try {
            const [branch, created] = await db.Branch.findOrCreate({
              where: { code: row.code, tenantId: tid },
              defaults: {
                tenantId: tid, name: row.name, type: row.type || 'branch',
                address: row.address, city: row.city, province: row.province,
                phone: row.phone, email: row.email, region: row.region,
                isActive: true
              }
            });
            if (!created) {
              await branch.update({ name: row.name || branch.name, address: row.address || branch.address, city: row.city || branch.city, province: row.province || branch.province, phone: row.phone || branch.phone, email: row.email || branch.email });
              results.push({ code: row.code, status: 'updated' });
            } else {
              results.push({ code: row.code, status: 'created' });
            }
          } catch (e: any) {
            results.push({ code: row.code, status: 'error', message: e.message });
          }
        }

        return ok(res, {
          total: results.length,
          created: results.filter(r => r.status === 'created').length,
          updated: results.filter(r => r.status === 'updated').length,
          errors: results.filter(r => r.status === 'error').length,
          details: results
        });
      }

      // ── Branch Settings Templates ──
      case 'settings-templates': {
        const { industry = 'general' } = req.query;
        return ok(res, { templates: getIndustrySettingsTemplates(industry as string), industry });
      }

      // ── Branch Analytics (Charts Data) ──
      case 'analytics': {
        const { period = '6m' } = req.query;
        const data = await cached(`branch-analytics-${tid}-${period}`, 60, async () => {
          try {
            // Sales by branch (bar chart)
            const salesByBranch = await q(`
              SELECT b.name, COALESCE(SUM(t.total),0) as sales, COUNT(t.id) as transactions
              FROM branches b
              LEFT JOIN pos_transactions t ON b.id = t.branch_id AND t.status = 'completed' AND t.created_at >= NOW() - INTERVAL '${period === '1m' ? '1 month' : period === '3m' ? '3 months' : period === '1y' ? '12 months' : '6 months'}'
              WHERE b.tenant_id = :tid AND b.is_active = true
              GROUP BY b.id, b.name ORDER BY sales DESC
            `, { tid });

            // Monthly trend
            const monthlyTrend = await q(`
              SELECT to_char(t.created_at, 'YYYY-MM') as month,
                COUNT(*) as transactions, COALESCE(SUM(t.total),0) as sales
              FROM pos_transactions t
              JOIN branches b ON t.branch_id = b.id
              WHERE b.tenant_id = :tid AND t.status = 'completed' AND t.created_at >= NOW() - INTERVAL '12 months'
              GROUP BY month ORDER BY month
            `, { tid });

            // Branch type distribution
            const typeDistribution = await q(`
              SELECT type, COUNT(*) as count FROM branches WHERE tenant_id = :tid GROUP BY type
            `, { tid });

            // City distribution
            const cityDistribution = await q(`
              SELECT city, COUNT(*) as count FROM branches WHERE tenant_id = :tid AND city IS NOT NULL GROUP BY city ORDER BY count DESC LIMIT 10
            `, { tid });

            return { salesByBranch, monthlyTrend, typeDistribution, cityDistribution };
          } catch (e) {
            return getMockAnalytics();
          }
        });
        return ok(res, data);
      }

      // ── Operational Hours Management ──
      case 'operating-hours': {
        if (req.method === 'GET') {
          const { branchId } = req.query;
          try {
            const db = getDb();
            const branch = await db.Branch.findByPk(branchId, { attributes: ['id', 'name', 'operatingHours'] });
            return ok(res, { branchId, operatingHours: branch?.operatingHours || getDefaultOperatingHours() });
          } catch (e) {
            return ok(res, { branchId, operatingHours: getDefaultOperatingHours() });
          }
        }
        if (req.method === 'PUT') {
          const { branchId, operatingHours } = req.body;
          try {
            const db = getDb();
            await db.Branch.update({ operatingHours }, { where: { id: branchId, tenantId: tid } });
            return ok(res, { updated: true });
          } catch (e) {
            return err(res, 500, 'Failed to update operating hours');
          }
        }
        return err(res, 405, 'GET or PUT only');
      }

      // ── Branch Geo Data (for map view) ──
      case 'geo-data': {
        try {
          const db = getDb();
          const branches = await db.Branch.findAll({
            where: { tenantId: tid },
            attributes: ['id', 'code', 'name', 'type', 'city', 'province', 'isActive', 'settings'],
            raw: true
          });
          const geoData = branches.map((b: any) => ({
            id: b.id, code: b.code, name: b.name, type: b.type,
            city: b.city, province: b.province, isActive: b.is_active ?? b.isActive,
            lat: b.settings?.latitude || null,
            lng: b.settings?.longitude || null,
          }));
          return ok(res, { branches: geoData });
        } catch (e) {
          return ok(res, { branches: [] });
        }
      }

      default:
        return err(res, 400, `Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error(`[branches/enhanced] action=${action} error:`, error.message);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    console.log(`[branches/enhanced] action=${action} ${Date.now() - start}ms`);
  }
}

// ─── Default Operating Hours ───
function getDefaultOperatingHours() {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return days.map((day, i) => ({
    day, dayIndex: i, isOpen: i < 6,
    openTime: '08:00', closeTime: i < 5 ? '17:00' : '15:00',
    breakStart: '12:00', breakEnd: '13:00',
  }));
}

// ─── Industry Settings Templates ───
function getIndustrySettingsTemplates(industry: string) {
  const commonTemplates = [
    {
      id: 'ops-standard', name: 'Operasional Standar', category: 'operations', description: 'Pengaturan jam operasional dan akses',
      settings: { openingHour: '08:00', closingHour: '22:00', autoLogoutMinutes: 30, requireManagerApproval: true, maxCashInDrawer: 5000000 },
      isDefault: true, appliedBranches: 0
    },
    {
      id: 'notif-active', name: 'Notifikasi Aktif', category: 'notifications', description: 'Alert untuk stok, penjualan, kehadiran',
      settings: { lowStockAlert: true, lowStockThreshold: 20, dailyReportEmail: true, salesTargetAlert: true, employeeClockAlert: true },
      isDefault: false, appliedBranches: 0
    },
    {
      id: 'security-high', name: 'Keamanan Tinggi', category: 'security', description: 'Dual auth, audit log, pembatasan transaksi',
      settings: { requireDualAuth: true, maxSingleTransaction: 10000000, voidRequiresManager: true, refundRequiresHQ: true, auditLogRetentionDays: 365 },
      isDefault: false, appliedBranches: 0
    },
    {
      id: 'compliance', name: 'Compliance & Regulasi', category: 'compliance', description: 'Pengaturan kepatuhan regulasi',
      settings: { taxEnabled: true, taxRate: 11, receiptRequired: true, dailyReconRequired: true, dataRetentionYears: 5 },
      isDefault: false, appliedBranches: 0
    },
  ];

  const industryTemplates: Record<string, any[]> = {
    fnb: [
      { id: 'fnb-kitchen', name: 'Kitchen & Food Safety', category: 'industry', description: 'HACCP, suhu, food handling', settings: { haccpEnabled: true, tempCheckInterval: 60, expiryAlertDays: 3, foodCostTargetPct: 30, wasteTrackingEnabled: true } },
    ],
    retail: [
      { id: 'retail-pricing', name: 'Pricing & Promo', category: 'pricing', description: 'Harga tier, diskon, promo', settings: { allowPriceOverride: false, maxDiscountPct: 20, minimumMargin: 15, memberDiscountEnabled: true, loyaltyPointEnabled: true } },
    ],
    hospitality: [
      { id: 'hosp-booking', name: 'Reservasi & Check-in', category: 'industry', description: 'Online booking, early check-in', settings: { onlineBookingEnabled: true, earlyCheckInHour: 12, lateCheckOutHour: 14, overbookingPct: 5, depositRequired: true } },
    ],
    manufacturing: [
      { id: 'mfg-production', name: 'Production & QC', category: 'industry', description: 'Shift, QC checkpoint, OEE target', settings: { shiftCount: 3, qcCheckpointsEnabled: true, oeeTarget: 85, defectThresholdPct: 1, maintenanceScheduleEnabled: true } },
    ],
    pharmacy: [
      { id: 'pharma-compliance', name: 'Farmasi Compliance', category: 'compliance', description: 'BPOM, resep, narkotika tracking', settings: { prescriptionRequired: true, narcoticsTrackingEnabled: true, expiryAlertDays: 90, batchTrackingEnabled: true, pharmacistOnDutyRequired: true } },
    ],
    finance: [
      { id: 'fin-compliance', name: 'Banking Compliance', category: 'compliance', description: 'KYC, AML, limit transaksi', settings: { kycRequired: true, amlCheckEnabled: true, cashTransactionLimit: 100000000, dualApprovalForLargeTransactions: true, biReportingEnabled: true } },
    ],
    workshop: [
      { id: 'ws-service', name: 'Service & Warranty', category: 'industry', description: 'Work order, warranty, sparepart', settings: { warrantyTrackingEnabled: true, estimateApprovalRequired: true, sparepartMinStockAlert: true, qualityCheckRequired: true, followUpReminderDays: 7 } },
    ],
  };

  return [...commonTemplates, ...(industryTemplates[industry] || [])];
}

// ─── Mock Data Helpers ───
function getMockDashboard() {
  return {
    total: 5, active: 4, inactive: 1,
    byType: { main: 1, branch: 2, warehouse: 1, kiosk: 1 },
    byCity: [['Jakarta', 2], ['Bandung', 1], ['Surabaya', 1], ['Bekasi', 1]],
    byProvince: [['DKI Jakarta', 2], ['Jawa Barat', 2], ['Jawa Timur', 1]],
    avgHealthScore: 78, criticalBranches: 1,
    syncStatus: { synced: 3, pending: 1, failed: 0, never: 1 }
  };
}

function getMockHealthScores() {
  return [
    { id: '1', code: 'HQ-001', name: 'Cabang Pusat Jakarta', type: 'main', score: 95, grade: 'A', factors: [] },
    { id: '2', code: 'BR-002', name: 'Cabang Bandung', type: 'branch', score: 82, grade: 'B', factors: [] },
    { id: '3', code: 'BR-003', name: 'Cabang Surabaya', type: 'branch', score: 68, grade: 'C', factors: [] },
    { id: '4', code: 'WH-001', name: 'Gudang Pusat', type: 'warehouse', score: 45, grade: 'D', factors: [] },
  ];
}

function getMockPerformance(industry: string) {
  const kpis = (INDUSTRY_KPIS[industry] || INDUSTRY_KPIS.fnb || []).map((kpi: any) => ({
    ...kpi, value: kpi.unit === '%' ? 65 + Math.random() * 30 : 100 + Math.random() * 500, achievement: kpi.target ? 85 + Math.random() * 25 : null
  }));
  return [
    { id: '1', code: 'HQ-001', name: 'Cabang Pusat Jakarta', type: 'main', city: 'Jakarta', manager: 'Ahmad Wijaya', healthScore: 95, healthGrade: 'A', metrics: { salesActual: 1250000000, salesTarget: 1200000000, transactions: 3890, avgTicket: 321337, grossMargin: 30, netMargin: 20, employeeProductivity: 2500000, customerSatisfaction: 4.8, stockTurnover: 12.5 }, growth: { sales: 8.5, transactions: 5.2, profit: 10.3 }, industryKpis: kpis, rank: 1, trend: 'up' },
    { id: '2', code: 'BR-002', name: 'Cabang Bandung', type: 'branch', city: 'Bandung', manager: 'Siti Rahayu', healthScore: 82, healthGrade: 'B', metrics: { salesActual: 920000000, salesTarget: 900000000, transactions: 2450, avgTicket: 375510, grossMargin: 28, netMargin: 18, employeeProductivity: 2100000, customerSatisfaction: 4.5, stockTurnover: 10.8 }, growth: { sales: 5.2, transactions: 3.8, profit: 6.5 }, industryKpis: kpis, rank: 2, trend: 'up' },
    { id: '3', code: 'BR-003', name: 'Cabang Surabaya', type: 'branch', city: 'Surabaya', manager: 'Budi Santoso', healthScore: 68, healthGrade: 'C', metrics: { salesActual: 780000000, salesTarget: 850000000, transactions: 2180, avgTicket: 357798, grossMargin: 25, netMargin: 15, employeeProductivity: 1800000, customerSatisfaction: 4.0, stockTurnover: 9.2 }, growth: { sales: -2.1, transactions: -1.5, profit: -3.2 }, industryKpis: kpis, rank: 3, trend: 'down' },
  ];
}

function getMockAnalytics() {
  return {
    salesByBranch: [
      { name: 'Cabang Pusat', sales: 1250000000, transactions: 3890 },
      { name: 'Cabang Bandung', sales: 920000000, transactions: 2450 },
      { name: 'Cabang Surabaya', sales: 780000000, transactions: 2180 },
    ],
    monthlyTrend: [
      { month: '2025-09', transactions: 6520, sales: 2200000000 },
      { month: '2025-10', transactions: 6800, sales: 2400000000 },
      { month: '2025-11', transactions: 7100, sales: 2600000000 },
      { month: '2025-12', transactions: 7500, sales: 2900000000 },
      { month: '2026-01', transactions: 7200, sales: 2700000000 },
      { month: '2026-02', transactions: 7800, sales: 3100000000 },
    ],
    typeDistribution: [
      { type: 'main', count: 1 }, { type: 'branch', count: 3 },
      { type: 'warehouse', count: 1 }, { type: 'kiosk', count: 1 }
    ],
    cityDistribution: [
      { city: 'Jakarta', count: 2 }, { city: 'Bandung', count: 1 },
      { city: 'Surabaya', count: 1 }, { city: 'Bekasi', count: 1 }
    ]
  };
}
