import type { NextApiRequest, NextApiResponse } from 'next';

const sequelize = (() => { try { return require('../../../../lib/sequelize'); } catch { return null; } })();

function ok(res: NextApiResponse, data: any) { return res.status(200).json({ success: true, data }); }
function err(res: NextApiResponse, code: number, msg: string) { return res.status(code).json({ success: false, error: msg }); }

async function q(sql: string, replacements: Record<string, any> = {}) {
  if (!sequelize) return [];
  try { const [rows] = await sequelize.query(sql, { replacements }); return rows as any[]; }
  catch (e: any) { console.warn('[branches/integrated] SQL error:', e.message); return []; }
}

// ─── Tenant helper ───
async function getTenantId(req: NextApiRequest, res: NextApiResponse): Promise<string> {
  try {
    const { getServerSession } = require('next-auth');
    const { authOptions } = require('../../../../lib/auth');
    const session = await getServerSession(req, res, authOptions);
    return (session?.user as any)?.tenantId || 'default';
  } catch { return 'default'; }
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return err(res, 405, 'GET only');
  const { action } = req.query;
  if (!action) return err(res, 400, 'Missing action');
  const tid = await getTenantId(req, res);

  try {
    switch (action) {
      case 'dashboard-integrated': return await dashboardIntegrated(req, res, tid);
      case 'branch-summary': return await branchSummary(req, res, tid);
      case 'branch-pos': return await branchPos(req, res, tid);
      case 'branch-inventory': return await branchInventory(req, res, tid);
      case 'branch-finance': return await branchFinance(req, res, tid);
      case 'branch-hris': return await branchHris(req, res, tid);
      case 'branch-procurement': return await branchProcurement(req, res, tid);
      case 'branch-customers': return await branchCustomers(req, res, tid);
      case 'cross-module-ranking': return await crossModuleRanking(req, res, tid);
      case 'branch-comparison': return await branchComparison(req, res, tid);
      default: return err(res, 400, `Unknown action: ${action}`);
    }
  } catch (e: any) {
    console.error(`[branches/integrated] ${action}:`, e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
}

// ═══════════════════════════════════════════════════════════════
// 1. INTEGRATED DASHBOARD — aggregates ALL modules per branch
// ═══════════════════════════════════════════════════════════════
async function dashboardIntegrated(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Branch base data
  const branches = await q(`
    SELECT b.id, b.code, b.name, b.type, b.city, b.province, b.is_active, b.phone, b.email,
      b.sync_status, b.last_sync_at, b.created_at,
      u.name as manager_name, u.email as manager_email
    FROM branches b
    LEFT JOIN users u ON b.manager_id = u.id
    WHERE b.tenant_id = :tid
    ORDER BY b.name
  `, { tid });

  // POS: sales per branch today + month
  const posSales = await q(`
    SELECT branch_id,
      COALESCE(SUM(CASE WHEN created_at >= :today THEN total ELSE 0 END), 0) as today_sales,
      COALESCE(SUM(CASE WHEN created_at >= :month THEN total ELSE 0 END), 0) as month_sales,
      COUNT(CASE WHEN created_at >= :today THEN 1 END) as today_tx,
      COUNT(CASE WHEN created_at >= :month THEN 1 END) as month_tx
    FROM pos_transactions
    WHERE tenant_id = :tid AND status = 'completed' AND created_at >= :month
    GROUP BY branch_id
  `, { tid, today: todayStart, month: monthStart });
  const salesMap = new Map(posSales.map((s: any) => [s.branch_id, s]));

  // Inventory: low stock count, total stock value per branch
  const invData = await q(`
    SELECT branch_id,
      COUNT(CASE WHEN quantity <= COALESCE(min_stock, 10) THEN 1 END) as low_stock,
      COUNT(*) as total_products,
      COALESCE(SUM(quantity * COALESCE(cost_price, 0)), 0) as stock_value
    FROM products
    WHERE tenant_id = :tid AND is_active = true
    GROUP BY branch_id
  `, { tid });
  const invMap = new Map(invData.map((i: any) => [i.branch_id, i]));

  // HRIS: employee count per branch
  const hrisData = await q(`
    SELECT branch_id,
      COUNT(*) as total_employees,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees
    FROM employees
    WHERE tenant_id = :tid
    GROUP BY branch_id
  `, { tid });
  const hrisMap = new Map(hrisData.map((h: any) => [h.branch_id, h]));

  // Users assigned to branches
  const userData = await q(`
    SELECT branch_id, COUNT(*) as user_count
    FROM users WHERE tenant_id = :tid AND branch_id IS NOT NULL AND is_active = true
    GROUP BY branch_id
  `, { tid });
  const userMap = new Map(userData.map((u: any) => [u.branch_id, u]));

  // Procurement: POs per branch
  const poData = await q(`
    SELECT department as branch_name,
      COUNT(*) as total_po,
      COALESCE(SUM(total_amount), 0) as total_po_value,
      COUNT(CASE WHEN status = 'approved' OR status = 'sent' THEN 1 END) as active_po
    FROM epr_purchase_orders
    WHERE tenant_id = :tid
    GROUP BY department
  `, { tid });

  // Finance: outstanding invoices
  const finData = await q(`
    SELECT vendor_name as branch_name,
      COUNT(*) as total_invoices,
      COALESCE(SUM(CASE WHEN status != 'paid' THEN total_amount ELSE 0 END), 0) as outstanding
    FROM epr_invoices WHERE tenant_id = :tid
    GROUP BY vendor_name
  `, { tid });

  // Aggregate totals
  let totalTodaySales = 0, totalMonthSales = 0, totalTodayTx = 0, totalLowStock = 0;
  let totalEmployees = 0, totalStockValue = 0;

  const enriched = branches.map((b: any) => {
    const s = salesMap.get(b.id) || { today_sales: 0, month_sales: 0, today_tx: 0, month_tx: 0 };
    const inv = invMap.get(b.id) || { low_stock: 0, total_products: 0, stock_value: 0 };
    const hr = hrisMap.get(b.id) || { total_employees: 0, active_employees: 0 };
    const usr = userMap.get(b.id) || { user_count: 0 };

    totalTodaySales += Number(s.today_sales);
    totalMonthSales += Number(s.month_sales);
    totalTodayTx += Number(s.today_tx);
    totalLowStock += Number(inv.low_stock);
    totalEmployees += Number(hr.total_employees || usr.user_count);
    totalStockValue += Number(inv.stock_value);

    return {
      ...b,
      pos: { todaySales: Number(s.today_sales), monthSales: Number(s.month_sales), todayTx: Number(s.today_tx), monthTx: Number(s.month_tx) },
      inventory: { lowStock: Number(inv.low_stock), totalProducts: Number(inv.total_products), stockValue: Number(inv.stock_value) },
      hris: { totalEmployees: Number(hr.total_employees || usr.user_count), activeEmployees: Number(hr.active_employees || usr.user_count) },
    };
  });

  // Summary stats
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b: any) => b.is_active).length;
  const onlineBranches = branches.filter((b: any) => b.sync_status === 'synced').length;

  return ok(res, {
    summary: {
      totalBranches, activeBranches, onlineBranches,
      totalTodaySales, totalMonthSales, totalTodayTx,
      totalLowStock, totalEmployees, totalStockValue,
    },
    branches: enriched,
    procurement: { purchaseOrders: poData },
    finance: { invoices: finData },
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. BRANCH SUMMARY — deep dive for a single branch
// ═══════════════════════════════════════════════════════════════
async function branchSummary(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  // Branch info
  const [branch] = await q(`
    SELECT b.*, u.name as manager_name, u.email as manager_email, u.phone as manager_phone
    FROM branches b LEFT JOIN users u ON b.manager_id = u.id
    WHERE b.id = :bid AND b.tenant_id = :tid
  `, { bid, tid });

  // POS
  const [posSummary] = await q(`
    SELECT
      COALESCE(SUM(CASE WHEN created_at >= :today THEN total ELSE 0 END), 0) as today_sales,
      COALESCE(SUM(CASE WHEN created_at >= :month THEN total ELSE 0 END), 0) as month_sales,
      COALESCE(SUM(CASE WHEN created_at >= :year THEN total ELSE 0 END), 0) as year_sales,
      COUNT(CASE WHEN created_at >= :today THEN 1 END) as today_tx,
      COUNT(CASE WHEN created_at >= :month THEN 1 END) as month_tx,
      COALESCE(AVG(CASE WHEN created_at >= :month THEN total END), 0) as avg_ticket
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed'
  `, { bid, tid, today: todayStart, month: monthStart, year: yearStart });

  // Daily sales trend (last 30 days)
  const dailySales = await q(`
    SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as sales, COUNT(*) as tx
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY date
  `, { bid, tid });

  // Payment methods breakdown
  const paymentMethods = await q(`
    SELECT COALESCE(payment_method, 'cash') as method, COUNT(*) as count, COALESCE(SUM(total), 0) as amount
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed' AND created_at >= :month
    GROUP BY payment_method ORDER BY amount DESC
  `, { bid, tid, month: monthStart });

  // Inventory
  const [invSummary] = await q(`
    SELECT COUNT(*) as total_products,
      COUNT(CASE WHEN quantity <= COALESCE(min_stock, 10) THEN 1 END) as low_stock,
      COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock,
      COALESCE(SUM(quantity * COALESCE(cost_price, 0)), 0) as stock_value,
      COALESCE(SUM(quantity), 0) as total_qty
    FROM products WHERE branch_id = :bid AND tenant_id = :tid AND is_active = true
  `, { bid, tid });

  // Top selling products
  const topProducts = await q(`
    SELECT p.name as product_name, SUM(ti.quantity) as qty_sold, SUM(ti.subtotal) as revenue
    FROM pos_transaction_items ti
    JOIN pos_transactions t ON ti.transaction_id = t.id
    JOIN products p ON ti.product_id = p.id
    WHERE t.branch_id = :bid AND t.tenant_id = :tid AND t.status = 'completed' AND t.created_at >= :month
    GROUP BY p.name ORDER BY revenue DESC LIMIT 10
  `, { bid, tid, month: monthStart });

  // Low stock items
  const lowStockItems = await q(`
    SELECT id, name, sku, quantity, COALESCE(min_stock, 10) as min_stock, cost_price
    FROM products
    WHERE branch_id = :bid AND tenant_id = :tid AND is_active = true AND quantity <= COALESCE(min_stock, 10)
    ORDER BY quantity ASC LIMIT 20
  `, { bid, tid });

  // HRIS / Employees
  const employees = await q(`
    SELECT id, name, email, role, department, status, created_at
    FROM employees WHERE branch_id = :bid AND tenant_id = :tid
    ORDER BY name LIMIT 50
  `, { bid, tid });

  // Also get users assigned to this branch
  const users = await q(`
    SELECT id, name, email, role, is_active, last_login_at
    FROM users WHERE branch_id = :bid AND tenant_id = :tid
    ORDER BY name LIMIT 50
  `, { bid, tid });

  // Recent attendance (last 7 days)
  const attendance = await q(`
    SELECT DATE(check_in) as date,
      COUNT(*) as total_checks,
      COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
      COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
      COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent
    FROM attendances
    WHERE branch_id = :bid AND tenant_id = :tid AND check_in >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(check_in) ORDER BY date DESC
  `, { bid, tid });

  // Finance: daily income from pos
  const monthlyRevenue = await q(`
    SELECT to_char(created_at, 'YYYY-MM') as month,
      COALESCE(SUM(total), 0) as revenue, COUNT(*) as transactions
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed' AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month ORDER BY month
  `, { bid, tid });

  // Stock transfers involving this branch
  const transfers = await q(`
    SELECT id, transfer_number, from_branch_id, to_branch_id, status, total_items, created_at
    FROM inventory_transfers
    WHERE (from_branch_id = :bid OR to_branch_id = :bid) AND tenant_id = :tid
    ORDER BY created_at DESC LIMIT 10
  `, { bid, tid });

  // Enabled modules
  const modules = await q(`
    SELECT module_code, module_name, is_enabled, enabled_at
    FROM branch_modules WHERE branch_id = :bid
    ORDER BY module_name
  `, { bid });

  return ok(res, {
    branch: branch || null,
    pos: { summary: posSummary || {}, dailySales, paymentMethods, topProducts },
    inventory: { summary: invSummary || {}, lowStockItems, transfers },
    hris: { employees, users, attendance, totalEmployees: (employees || []).length, totalUsers: (users || []).length },
    finance: { monthlyRevenue },
    modules: modules || [],
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. BRANCH POS — detailed POS data
// ═══════════════════════════════════════════════════════════════
async function branchPos(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId, period = 'month' } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;
  const interval = period === 'year' ? '12 months' : period === 'quarter' ? '3 months' : period === 'week' ? '7 days' : period === 'today' ? '1 day' : '1 month';

  const transactions = await q(`
    SELECT id, transaction_number, total, payment_method, status, cashier_name, created_at
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND created_at >= NOW() - INTERVAL '${interval}'
    ORDER BY created_at DESC LIMIT 100
  `, { bid, tid });

  const hourlyDistribution = await q(`
    SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*) as tx, COALESCE(SUM(total), 0) as sales
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed' AND created_at >= NOW() - INTERVAL '${interval}'
    GROUP BY hour ORDER BY hour
  `, { bid, tid });

  const categoryBreakdown = await q(`
    SELECT c.name as category, SUM(ti.subtotal) as revenue, SUM(ti.quantity) as qty
    FROM pos_transaction_items ti
    JOIN pos_transactions t ON ti.transaction_id = t.id
    LEFT JOIN products p ON ti.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE t.branch_id = :bid AND t.tenant_id = :tid AND t.status = 'completed' AND t.created_at >= NOW() - INTERVAL '${interval}'
    GROUP BY c.name ORDER BY revenue DESC
  `, { bid, tid });

  return ok(res, { transactions, hourlyDistribution, categoryBreakdown, period });
}

// ═══════════════════════════════════════════════════════════════
// 4. BRANCH INVENTORY — detailed inventory data
// ═══════════════════════════════════════════════════════════════
async function branchInventory(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;

  const products = await q(`
    SELECT p.id, p.name, p.sku, p.quantity, p.min_stock, p.cost_price, p.selling_price,
      c.name as category_name,
      (p.quantity * COALESCE(p.cost_price, 0)) as stock_value
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.branch_id = :bid AND p.tenant_id = :tid AND p.is_active = true
    ORDER BY p.name LIMIT 200
  `, { bid, tid });

  const categoryStock = await q(`
    SELECT c.name as category, COUNT(*) as product_count,
      COALESCE(SUM(p.quantity), 0) as total_qty,
      COALESCE(SUM(p.quantity * COALESCE(p.cost_price, 0)), 0) as stock_value,
      COUNT(CASE WHEN p.quantity <= COALESCE(p.min_stock, 10) THEN 1 END) as low_stock_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.branch_id = :bid AND p.tenant_id = :tid AND p.is_active = true
    GROUP BY c.name ORDER BY stock_value DESC
  `, { bid, tid });

  // Stock opnames
  const opnames = await q(`
    SELECT id, opname_number, status, total_items, total_difference, created_at
    FROM stock_opnames
    WHERE branch_id = :bid AND tenant_id = :tid
    ORDER BY created_at DESC LIMIT 10
  `, { bid, tid });

  // Recent transfers
  const transfers = await q(`
    SELECT t.id, t.transfer_number, t.status, t.total_items, t.created_at,
      fb.name as from_branch, tb.name as to_branch
    FROM inventory_transfers t
    LEFT JOIN branches fb ON t.from_branch_id = fb.id
    LEFT JOIN branches tb ON t.to_branch_id = tb.id
    WHERE (t.from_branch_id = :bid OR t.to_branch_id = :bid) AND t.tenant_id = :tid
    ORDER BY t.created_at DESC LIMIT 10
  `, { bid, tid });

  return ok(res, { products, categoryStock, opnames, transfers });
}

// ═══════════════════════════════════════════════════════════════
// 5. BRANCH FINANCE — P&L, revenue, expenses
// ═══════════════════════════════════════════════════════════════
async function branchFinance(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;

  // Monthly P&L from POS
  const monthlyPnl = await q(`
    SELECT to_char(created_at, 'YYYY-MM') as month,
      COALESCE(SUM(total), 0) as revenue,
      COALESCE(SUM(COALESCE(discount, 0)), 0) as discounts,
      COALESCE(SUM(COALESCE(tax, 0)), 0) as tax_collected,
      COUNT(*) as transactions
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed' AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month ORDER BY month
  `, { bid, tid });

  // Payment method breakdown this month
  const paymentBreakdown = await q(`
    SELECT COALESCE(payment_method, 'cash') as method,
      COUNT(*) as count, COALESCE(SUM(total), 0) as amount
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed'
      AND created_at >= date_trunc('month', NOW())
    GROUP BY payment_method ORDER BY amount DESC
  `, { bid, tid });

  // Inventory value (as asset)
  const [inventoryValue] = await q(`
    SELECT COALESCE(SUM(quantity * COALESCE(cost_price, 0)), 0) as cost_value,
      COALESCE(SUM(quantity * COALESCE(selling_price, 0)), 0) as retail_value
    FROM products WHERE branch_id = :bid AND tenant_id = :tid AND is_active = true
  `, { bid, tid });

  // Inter-branch invoices
  const interBranchInvoices = await q(`
    SELECT id, invoice_number, from_branch_id, to_branch_id, total_amount, status, created_at
    FROM inter_branch_invoices
    WHERE (from_branch_id = :bid OR to_branch_id = :bid) AND tenant_id = :tid
    ORDER BY created_at DESC LIMIT 10
  `, { bid, tid });

  // Payroll cost allocation
  const payrollCost = await q(`
    SELECT to_char(period_start, 'YYYY-MM') as month,
      COALESCE(SUM(allocated_amount), 0) as payroll_cost
    FROM payroll_branch_allocations
    WHERE branch_id = :bid
    GROUP BY month ORDER BY month DESC LIMIT 12
  `, { bid });

  return ok(res, { monthlyPnl, paymentBreakdown, inventoryValue: inventoryValue || {}, interBranchInvoices, payrollCost });
}

// ═══════════════════════════════════════════════════════════════
// 6. BRANCH HRIS — employees, attendance, performance
// ═══════════════════════════════════════════════════════════════
async function branchHris(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;

  const employees = await q(`
    SELECT e.id, e.name, e.email, e.phone, e.department, e.position, e.status,
      e.hire_date, e.employment_type
    FROM employees e
    WHERE e.branch_id = :bid AND e.tenant_id = :tid
    ORDER BY e.name
  `, { bid, tid });

  // Department breakdown
  const departments = await q(`
    SELECT department, COUNT(*) as count,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active
    FROM employees WHERE branch_id = :bid AND tenant_id = :tid
    GROUP BY department ORDER BY count DESC
  `, { bid, tid });

  // This month attendance summary
  const attendanceSummary = await q(`
    SELECT e.name as employee_name,
      COUNT(*) as total_days,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
      COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent
    FROM attendances a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.branch_id = :bid AND a.tenant_id = :tid AND a.check_in >= date_trunc('month', NOW())
    GROUP BY e.name ORDER BY e.name
  `, { bid, tid });

  // Shift schedules
  const shifts = await q(`
    SELECT s.id, s.shift_name, s.start_time, s.end_time, COUNT(sa.id) as assigned_count
    FROM shifts s
    LEFT JOIN shift_assignments sa ON s.id = sa.shift_id AND sa.branch_id = :bid
    WHERE s.tenant_id = :tid
    GROUP BY s.id, s.shift_name, s.start_time, s.end_time
  `, { bid, tid });

  return ok(res, { employees, departments, attendanceSummary, shifts });
}

// ═══════════════════════════════════════════════════════════════
// 7. BRANCH PROCUREMENT — POs, GRNs per branch
// ═══════════════════════════════════════════════════════════════
async function branchProcurement(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;

  // Get branch name for department matching
  const [branch] = await q(`SELECT name FROM branches WHERE id = :bid`, { bid });
  const branchName = branch?.name || '';

  // Purchase requisitions for this branch
  const requisitions = await q(`
    SELECT id, requisition_number, title, status, priority, total_amount, created_at
    FROM purchase_requisitions
    WHERE branch_id = :bid AND tenant_id = :tid
    ORDER BY created_at DESC LIMIT 20
  `, { bid, tid });

  // Procurement requests
  const procRequests = await q(`
    SELECT id, request_number, title, status, priority, estimated_budget, needed_date, created_at
    FROM epr_procurement_requests
    WHERE tenant_id = :tid AND (department = :branchName OR notes LIKE :branchPattern)
    ORDER BY created_at DESC LIMIT 20
  `, { tid, branchName, branchPattern: `%${branchName}%` });

  // Goods receipts for this branch
  const goodsReceipts = await q(`
    SELECT id, grn_number, po_number, vendor_name, status, receipt_date, inspection_status
    FROM epr_goods_receipts
    WHERE tenant_id = :tid AND (warehouse_location = :branchName OR notes LIKE :branchPattern)
    ORDER BY created_at DESC LIMIT 20
  `, { tid, branchName, branchPattern: `%${branchName}%` });

  return ok(res, { requisitions, procurementRequests: procRequests, goodsReceipts });
}

// ═══════════════════════════════════════════════════════════════
// 8. BRANCH CUSTOMERS — customer data per branch
// ═══════════════════════════════════════════════════════════════
async function branchCustomers(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchId } = req.query;
  if (!branchId) return err(res, 400, 'branchId required');
  const bid = branchId as string;

  const customerStats = await q(`
    SELECT COUNT(DISTINCT customer_id) as unique_customers,
      COUNT(*) as total_transactions,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(AVG(total), 0) as avg_ticket
    FROM pos_transactions
    WHERE branch_id = :bid AND tenant_id = :tid AND status = 'completed' AND customer_id IS NOT NULL
      AND created_at >= date_trunc('month', NOW())
  `, { bid, tid });

  // Top customers
  const topCustomers = await q(`
    SELECT c.name as customer_name, c.phone, c.email,
      COUNT(t.id) as visit_count, COALESCE(SUM(t.total), 0) as total_spend
    FROM pos_transactions t
    JOIN customers c ON t.customer_id = c.id
    WHERE t.branch_id = :bid AND t.tenant_id = :tid AND t.status = 'completed'
      AND t.created_at >= NOW() - INTERVAL '3 months'
    GROUP BY c.name, c.phone, c.email
    ORDER BY total_spend DESC LIMIT 20
  `, { bid, tid });

  return ok(res, { stats: customerStats?.[0] || {}, topCustomers });
}

// ═══════════════════════════════════════════════════════════════
// 9. CROSS-MODULE RANKING — rank branches by multiple KPIs
// ═══════════════════════════════════════════════════════════════
async function crossModuleRanking(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const ranking = await q(`
    SELECT b.id, b.code, b.name, b.type, b.city,
      COALESCE(pos.month_sales, 0) as month_sales,
      COALESCE(pos.month_tx, 0) as month_tx,
      COALESCE(pos.avg_ticket, 0) as avg_ticket,
      COALESCE(inv.low_stock, 0) as low_stock,
      COALESCE(inv.stock_value, 0) as stock_value,
      COALESCE(hr.employee_count, 0) as employee_count,
      CASE WHEN COALESCE(hr.employee_count, 0) > 0 THEN COALESCE(pos.month_sales, 0) / hr.employee_count ELSE 0 END as revenue_per_employee
    FROM branches b
    LEFT JOIN (
      SELECT branch_id, SUM(total) as month_sales, COUNT(*) as month_tx, AVG(total) as avg_ticket
      FROM pos_transactions WHERE tenant_id = :tid AND status = 'completed' AND created_at >= :month
      GROUP BY branch_id
    ) pos ON b.id = pos.branch_id
    LEFT JOIN (
      SELECT branch_id, COUNT(CASE WHEN quantity <= COALESCE(min_stock, 10) THEN 1 END) as low_stock,
        SUM(quantity * COALESCE(cost_price, 0)) as stock_value
      FROM products WHERE tenant_id = :tid AND is_active = true GROUP BY branch_id
    ) inv ON b.id = inv.branch_id
    LEFT JOIN (
      SELECT branch_id, COUNT(*) as employee_count FROM users WHERE tenant_id = :tid AND is_active = true AND branch_id IS NOT NULL GROUP BY branch_id
    ) hr ON b.id = hr.branch_id
    WHERE b.tenant_id = :tid AND b.is_active = true
    ORDER BY month_sales DESC
  `, { tid, month: monthStart });

  return ok(res, { ranking, period: 'month' });
}

// ═══════════════════════════════════════════════════════════════
// 10. BRANCH COMPARISON — compare 2-5 branches side by side
// ═══════════════════════════════════════════════════════════════
async function branchComparison(req: NextApiRequest, res: NextApiResponse, tid: string) {
  const { branchIds } = req.query;
  if (!branchIds) return err(res, 400, 'branchIds required (comma-separated)');
  const ids = (branchIds as string).split(',').slice(0, 5);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const comparison = await q(`
    SELECT b.id, b.code, b.name, b.type, b.city,
      COALESCE(pos.sales, 0) as month_sales,
      COALESCE(pos.tx, 0) as month_tx,
      COALESCE(pos.avg_ticket, 0) as avg_ticket,
      COALESCE(inv.total_products, 0) as total_products,
      COALESCE(inv.low_stock, 0) as low_stock,
      COALESCE(inv.stock_value, 0) as stock_value,
      COALESCE(hr.employee_count, 0) as employee_count
    FROM branches b
    LEFT JOIN (
      SELECT branch_id, SUM(total) as sales, COUNT(*) as tx, AVG(total) as avg_ticket
      FROM pos_transactions WHERE tenant_id = :tid AND status = 'completed' AND created_at >= :month GROUP BY branch_id
    ) pos ON b.id = pos.branch_id
    LEFT JOIN (
      SELECT branch_id, COUNT(*) as total_products,
        COUNT(CASE WHEN quantity <= COALESCE(min_stock, 10) THEN 1 END) as low_stock,
        SUM(quantity * COALESCE(cost_price, 0)) as stock_value
      FROM products WHERE tenant_id = :tid AND is_active = true GROUP BY branch_id
    ) inv ON b.id = inv.branch_id
    LEFT JOIN (
      SELECT branch_id, COUNT(*) as employee_count FROM users WHERE tenant_id = :tid AND is_active = true AND branch_id IS NOT NULL GROUP BY branch_id
    ) hr ON b.id = hr.branch_id
    WHERE b.id IN (:ids)
    ORDER BY b.name
  `, { tid, ids, month: monthStart });

  // Monthly trend per branch
  const monthlyTrend = await q(`
    SELECT b.name as branch_name, to_char(t.created_at, 'YYYY-MM') as month,
      COALESCE(SUM(t.total), 0) as sales, COUNT(*) as tx
    FROM pos_transactions t
    JOIN branches b ON t.branch_id = b.id
    WHERE b.id IN (:ids) AND t.tenant_id = :tid AND t.status = 'completed' AND t.created_at >= NOW() - INTERVAL '6 months'
    GROUP BY b.name, month ORDER BY month
  `, { ids, tid });

  return ok(res, { branches: comparison, monthlyTrend });
}
