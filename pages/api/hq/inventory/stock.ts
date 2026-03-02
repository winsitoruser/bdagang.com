import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';

const sequelize = require('../../../../lib/sequelize');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getStock(req, res);
      case 'PUT':
        return await updateStock(req, res);
      case 'POST':
        return await transferStock(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error: any) {
    console.error('Inventory Stock API Error:', error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, error.message)
    );
  }
}

async function getStock(req: NextApiRequest, res: NextApiResponse) {
  const { search, category, branch, stockFilter, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;

  let having = '';
  if (stockFilter === 'low') having = 'HAVING SUM(s.quantity) > 0 AND SUM(s.quantity) < p.minimum_stock';
  else if (stockFilter === 'out') having = 'HAVING COALESCE(SUM(s.quantity),0) = 0';
  else if (stockFilter === 'over') having = 'HAVING SUM(s.quantity) > p.maximum_stock';
  else if (stockFilter === 'normal') having = 'HAVING SUM(s.quantity) >= p.minimum_stock AND SUM(s.quantity) <= p.maximum_stock';

  let where = 'WHERE p.is_active=true';
  const params: any = {};
  if (search) { where += ` AND (p.name ILIKE :search OR p.sku ILIKE :search OR p.barcode ILIKE :search)`; params.search = `%${search}%`; }
  if (category && category !== 'Semua Kategori' && category !== 'all') { where += ` AND pc.name = :category`; params.category = category; }

  // Count
  const [countResult] = await sequelize.query(`
    SELECT COUNT(*) as total FROM (
      SELECT p.id FROM products p LEFT JOIN product_categories pc ON pc.id=p.category_id LEFT JOIN inventory_stock s ON s.product_id=p.id
      ${where} GROUP BY p.id, p.minimum_stock, p.maximum_stock ${having}
    ) sub
  `, { replacements: params });
  const total = parseInt(countResult[0].total);

  // Products with aggregated stock
  const [products] = await sequelize.query(`
    SELECT p.id, p.name, p.sku, p.barcode, p.unit, p.buy_price, p.minimum_stock, p.maximum_stock,
      pc.name as category, COALESCE(SUM(s.quantity),0)::int as total_stock,
      COALESCE(AVG(s.cost_price),0)::numeric(15,0) as avg_cost,
      COALESCE(SUM(s.quantity * s.cost_price),0)::numeric(15,0) as stock_value
    FROM products p
    LEFT JOIN product_categories pc ON pc.id=p.category_id
    LEFT JOIN inventory_stock s ON s.product_id=p.id
    ${where}
    GROUP BY p.id, p.name, p.sku, p.barcode, p.unit, p.buy_price, p.minimum_stock, p.maximum_stock, pc.name
    ${having}
    ORDER BY p.name LIMIT :limit OFFSET :offset
  `, { replacements: { ...params, limit: limitNum, offset } });

  // Warehouse breakdown per product
  const productIds = products.map((p: any) => p.id);
  let warehouseBreakdown: any[] = [];
  if (productIds.length > 0) {
    [warehouseBreakdown] = await sequelize.query(`
      SELECT s.product_id, w.id as warehouse_id, w.name as warehouse_name, w.code as warehouse_code,
        SUM(s.quantity)::int as stock, MAX(s.updated_at) as last_updated
      FROM inventory_stock s JOIN warehouses w ON w.id=s.warehouse_id
      WHERE s.product_id IN (:ids) GROUP BY s.product_id, w.id, w.name, w.code ORDER BY w.name
    `, { replacements: { ids: productIds } });
  }

  const result = products.map((p: any) => {
    const branches = warehouseBreakdown.filter((b: any) => b.product_id === p.id).map((b: any) => ({
      branchId: String(b.warehouse_id), branchName: b.warehouse_name, branchCode: b.warehouse_code,
      stock: b.stock, minStock: p.minimum_stock, maxStock: p.maximum_stock,
      status: b.stock === 0 ? 'out' : b.stock < p.minimum_stock ? 'low' : b.stock > p.maximum_stock ? 'over' : 'normal',
      lastUpdated: b.last_updated || new Date().toISOString()
    }));
    return {
      id: String(p.id), name: p.name, sku: p.sku, barcode: p.barcode || '', category: p.category || '-', unit: p.unit,
      totalStock: p.total_stock, minStock: p.minimum_stock, maxStock: p.maximum_stock,
      avgCost: parseFloat(p.avg_cost), stockValue: parseFloat(p.stock_value),
      movement: p.total_stock > p.maximum_stock * 0.7 ? 'fast' as const : p.total_stock > p.minimum_stock ? 'medium' as const : 'slow' as const,
      branches
    };
  });

  const stats = {
    totalProducts: total,
    totalStock: result.reduce((s: number, p: any) => s + p.totalStock, 0),
    totalValue: result.reduce((s: number, p: any) => s + p.stockValue, 0),
    lowStockCount: result.filter((p: any) => p.branches.some((b: any) => b.status === 'low')).length,
    outOfStockCount: result.filter((p: any) => p.branches.some((b: any) => b.status === 'out')).length
  };

  return res.status(HttpStatus.OK).json(
    successResponse(
      { products: result, stats },
      { pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } }
    )
  );
}

async function updateStock(req: NextApiRequest, res: NextApiResponse) {
  const { productId, branchId, adjustment, reason } = req.body;
  if (!productId || !branchId || adjustment === undefined) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Product ID, Branch ID, and adjustment are required')
    );
  }

  // Update inventory_stock
  const [existing] = await sequelize.query(
    "SELECT id, quantity FROM inventory_stock WHERE product_id=:pid AND warehouse_id=:whId LIMIT 1",
    { replacements: { pid: productId, whId: branchId } }
  );

  if (existing.length > 0) {
    const newQty = Math.max(0, parseFloat(existing[0].quantity) + parseFloat(adjustment));
    await sequelize.query(
      "UPDATE inventory_stock SET quantity=:qty, available_quantity=:qty, updated_at=NOW() WHERE id=:id",
      { replacements: { qty: newQty, id: existing[0].id } }
    );
  }

  // Record movement
  await sequelize.query(`
    INSERT INTO stock_movements (tenant_id, product_id, warehouse_id, movement_type, quantity, notes, performed_by_name, reference_type)
    VALUES ((SELECT tenant_id FROM products WHERE id=:pid), :pid, :whId, 'adjustment', :qty, :reason, 'Admin', 'manual')
  `, { replacements: { pid: productId, whId: branchId, qty: adjustment, reason: reason || 'Stock adjustment' } });

  return res.status(HttpStatus.OK).json(
    successResponse({ productId, branchId, adjustment, reason }, undefined, `Stock adjusted by ${adjustment}`)
  );
}

async function transferStock(req: NextApiRequest, res: NextApiResponse) {
  const { productId, fromBranch, toBranch, quantity, notes } = req.body;
  if (!productId || !fromBranch || !toBranch || !quantity) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'All transfer fields are required')
    );
  }

  const [seqResult] = await sequelize.query("SELECT COALESCE(MAX(id),0)+1 as next_id FROM stock_transfers");
  const tfNum = `TF-2026-${String(seqResult[0].next_id).padStart(4, '0')}`;

  const [result] = await sequelize.query(`
    INSERT INTO stock_transfers (tenant_id, transfer_number, from_warehouse_id, to_warehouse_id, status, total_items, total_quantity, notes, requested_by_name)
    VALUES ((SELECT tenant_id FROM warehouses LIMIT 1), :num, :from, :to, 'pending', 1, :qty, :notes, 'Admin')
    RETURNING id
  `, { replacements: { num: tfNum, from: fromBranch, to: toBranch, qty: quantity, notes: notes || null } });

  await sequelize.query(`
    INSERT INTO stock_transfer_items (transfer_id, product_id, requested_qty, unit_cost)
    VALUES (:tfId, :pid, :qty, (SELECT buy_price FROM products WHERE id=:pid))
  `, { replacements: { tfId: result[0].id, pid: productId, qty: quantity } });

  return res.status(HttpStatus.CREATED).json(
    successResponse({ id: result[0].id, transferNumber: tfNum, status: 'pending' }, undefined, 'Stock transfer created')
  );
}
