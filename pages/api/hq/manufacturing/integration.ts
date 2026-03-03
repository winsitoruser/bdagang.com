import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse } from '../../../../lib/api/response';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';

const sequelize = require('../../../../lib/sequelize');

/**
 * Manufacturing Integration API
 * Cross-module integrations: Inventory, Procurement, HRIS, Finance
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'GET/POST only'));
  }

  const action = req.query.action as string;

  try {
    switch (action) {
      // Inventory Integration
      case 'check-material-availability':
        return checkMaterialAvailability(req, res);
      case 'consume-materials':
        return consumeMaterials(req, res);
      case 'receive-finished-goods':
        return receiveFinishedGoods(req, res);

      // Procurement Integration
      case 'generate-purchase-requisition':
        return generatePurchaseRequisition(req, res);
      case 'material-shortage':
        return getMaterialShortage(req, res);

      // HRIS Integration
      case 'available-operators':
        return getAvailableOperators(req, res);
      case 'operator-productivity':
        return getOperatorProductivity(req, res);

      // Finance Integration
      case 'production-cost-summary':
        return getProductionCostSummary(req, res);
      case 'cogs-calculation':
        return getCOGSCalculation(req, res);

      // Cross-module Dashboard
      case 'integrated-dashboard':
        return getIntegratedDashboard(req, res);

      default:
        return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown action: ${action}`));
    }
  } catch (error: any) {
    console.error(`[MFG Integration] Error (${action}):`, error.message);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
}

export default withHQAuth(handler);

// Check material availability for a work order
async function checkMaterialAvailability(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, bom_id } = req.query;
  
  let materialQuery = '';
  const replacements: any = {};

  if (work_order_id) {
    materialQuery = `
      SELECT wm.product_id, p.name as product_name, p.sku,
        wm.planned_quantity as required_qty, wm.uom,
        COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0) as available_stock,
        CASE WHEN COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0) >= wm.planned_quantity
          THEN 'sufficient' ELSE 'insufficient' END as status,
        GREATEST(wm.planned_quantity - COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0), 0) as shortage
      FROM mfg_wo_materials wm
      JOIN products p ON wm.product_id = p.id
      WHERE wm.work_order_id = :work_order_id
      ORDER BY p.name
    `;
    replacements.work_order_id = work_order_id;
  } else if (bom_id) {
    materialQuery = `
      SELECT bi.product_id, p.name as product_name, p.sku,
        bi.quantity as required_qty, bi.uom,
        COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = bi.product_id), 0) as available_stock,
        CASE WHEN COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = bi.product_id), 0) >= bi.quantity
          THEN 'sufficient' ELSE 'insufficient' END as status,
        GREATEST(bi.quantity - COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = bi.product_id), 0), 0) as shortage
      FROM mfg_bom_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.bom_id = :bom_id
      ORDER BY p.name
    `;
    replacements.bom_id = bom_id;
  } else {
    return res.status(400).json(errorResponse('MISSING_PARAM', 'work_order_id or bom_id required'));
  }

  const [materials] = await sequelize.query(materialQuery, { replacements });
  const allSufficient = materials.every((m: any) => m.status === 'sufficient');

  return res.status(200).json(successResponse({
    materials,
    allSufficient,
    shortageCount: materials.filter((m: any) => m.status === 'insufficient').length
  }));
}

// Consume materials from inventory (backflush)
async function consumeMaterials(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'POST only'));

  const { work_order_id } = req.body;
  if (!work_order_id) return res.status(400).json(errorResponse('MISSING_ID', 'Work Order ID required'));

  const t = await sequelize.transaction();
  try {
    const [materials] = await sequelize.query(`
      SELECT wm.*, p.name as product_name
      FROM mfg_wo_materials wm
      JOIN products p ON wm.product_id = p.id
      WHERE wm.work_order_id = :wo_id AND wm.status != 'consumed'
    `, { replacements: { wo_id: work_order_id }, transaction: t });

    let consumed = 0;
    for (const mat of materials) {
      const qtyToConsume = parseFloat(mat.planned_quantity) - parseFloat(mat.consumed_quantity || 0);
      if (qtyToConsume <= 0) continue;

      // Deduct from stock
      await sequelize.query(`
        UPDATE inventory_stock SET quantity = GREATEST(quantity - :qty, 0), updated_at = NOW()
        WHERE product_id = :product_id
      `, { replacements: { qty: qtyToConsume, product_id: mat.product_id }, transaction: t });

      // Record stock movement
      await sequelize.query(`
        INSERT INTO stock_movements (tenant_id, product_id, movement_type, quantity, reference_type, reference_id, notes, movement_date, created_at)
        SELECT t.id, :product_id, 'out', :qty, 'manufacturing', :wo_id, :notes, NOW(), NOW()
        FROM tenants t LIMIT 1
      `, { replacements: { product_id: mat.product_id, qty: qtyToConsume, wo_id: work_order_id, notes: `MFG consumption for WO ${work_order_id}` }, transaction: t });

      // Update WO material status
      await sequelize.query(`
        UPDATE mfg_wo_materials SET consumed_quantity = planned_quantity, status = 'consumed', updated_at = NOW()
        WHERE id = :id
      `, { replacements: { id: mat.id }, transaction: t });

      consumed++;
    }

    await t.commit();
    return res.status(200).json(successResponse({ consumed }, undefined, `${consumed} materials consumed from inventory`));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Receive finished goods into inventory
async function receiveFinishedGoods(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'POST only'));

  const { work_order_id, quantity, warehouse_id } = req.body;
  if (!work_order_id || !quantity) return res.status(400).json(errorResponse('MISSING_PARAM', 'Work Order ID and quantity required'));

  const t = await sequelize.transaction();
  try {
    const [wo] = await sequelize.query(`SELECT product_id, wo_number FROM mfg_work_orders WHERE id = :id`, { replacements: { id: work_order_id }, transaction: t });
    if (!wo[0]) throw new Error('Work Order not found');

    // Add to stock
    await sequelize.query(`
      INSERT INTO inventory_stock (product_id, warehouse_id, quantity, created_at, updated_at)
      VALUES (:product_id, :warehouse_id, :qty, NOW(), NOW())
      ON CONFLICT (product_id, warehouse_id) DO UPDATE SET quantity = inventory_stock.quantity + :qty, updated_at = NOW()
    `, { replacements: { product_id: wo[0].product_id, warehouse_id: warehouse_id || 1, qty: quantity }, transaction: t });

    // Record stock movement
    await sequelize.query(`
      INSERT INTO stock_movements (tenant_id, product_id, movement_type, quantity, reference_type, reference_id, notes, movement_date, created_at)
      SELECT t.id, :product_id, 'in', :qty, 'manufacturing', :wo_id, :notes, NOW(), NOW()
      FROM tenants t LIMIT 1
    `, { replacements: { product_id: wo[0].product_id, qty: quantity, wo_id: work_order_id, notes: `MFG output from WO ${wo[0].wo_number}` }, transaction: t });

    await t.commit();
    return res.status(200).json(successResponse({ product_id: wo[0].product_id, quantity }, undefined, 'Finished goods received into inventory'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Generate purchase requisition for material shortages
async function generatePurchaseRequisition(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'POST only'));

  const { work_order_ids } = req.body;
  if (!work_order_ids || !work_order_ids.length) return res.status(400).json(errorResponse('MISSING_PARAM', 'Work Order IDs required'));

  const [shortages] = await sequelize.query(`
    SELECT wm.product_id, p.name as product_name, p.sku,
      SUM(wm.planned_quantity - wm.issued_quantity) as required_qty, wm.uom,
      COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0) as available_stock,
      GREATEST(SUM(wm.planned_quantity - wm.issued_quantity) - COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0), 0) as shortage_qty
    FROM mfg_wo_materials wm
    JOIN products p ON wm.product_id = p.id
    WHERE wm.work_order_id = ANY(:wo_ids) AND wm.status = 'pending'
    GROUP BY wm.product_id, p.name, p.sku, wm.uom
    HAVING SUM(wm.planned_quantity - wm.issued_quantity) > COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0)
  `, { replacements: { wo_ids: work_order_ids } });

  return res.status(200).json(successResponse({
    shortages,
    totalItems: shortages.length,
    message: shortages.length > 0 ? `${shortages.length} materials need procurement` : 'All materials available'
  }));
}

// Get material shortage across all planned WOs
async function getMaterialShortage(req: NextApiRequest, res: NextApiResponse) {
  const [shortages] = await sequelize.query(`
    SELECT wm.product_id, p.name as product_name, p.sku,
      SUM(wm.planned_quantity - wm.issued_quantity) as total_required,
      COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0) as available_stock,
      GREATEST(SUM(wm.planned_quantity - wm.issued_quantity) - COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0), 0) as shortage,
      COUNT(DISTINCT wm.work_order_id) as affected_wo_count
    FROM mfg_wo_materials wm
    JOIN mfg_work_orders wo ON wm.work_order_id = wo.id
    JOIN products p ON wm.product_id = p.id
    WHERE wo.status IN ('planned', 'released') AND wm.status = 'pending'
    GROUP BY wm.product_id, p.name, p.sku
    HAVING SUM(wm.planned_quantity - wm.issued_quantity) > COALESCE((SELECT SUM(s.quantity) FROM inventory_stock s WHERE s.product_id = wm.product_id), 0)
    ORDER BY shortage DESC
  `);

  return res.status(200).json(successResponse(shortages));
}

// Get available operators from HRIS
async function getAvailableOperators(req: NextApiRequest, res: NextApiResponse) {
  const { branch_id, date } = req.query;
  let where = "WHERE e.status = 'active'";
  const replacements: any = {};

  if (branch_id) { where += ' AND e.branch_id = :branch_id'; replacements.branch_id = branch_id; }

  const [operators] = await sequelize.query(`
    SELECT e.id, e.employee_code, e.name, e.position, e.department,
      (SELECT COUNT(*) FROM mfg_wo_operations wop WHERE wop.operator_id = e.id AND wop.status = 'in_progress') as active_operations,
      (SELECT COALESCE(AVG(sp.oee_overall), 0) FROM mfg_shift_productions sp WHERE sp.operator_id = e.id AND sp.shift_date >= NOW() - INTERVAL '30 days') as avg_oee
    FROM employees e
    ${where}
    ORDER BY e.name
  `, { replacements });

  return res.status(200).json(successResponse(operators));
}

// Get operator productivity from shift production data
async function getOperatorProductivity(req: NextApiRequest, res: NextApiResponse) {
  const [productivity] = await sequelize.query(`
    SELECT e.id, e.name, e.position,
      COUNT(*) as total_shifts,
      COALESCE(SUM(sp.actual_output), 0) as total_output,
      COALESCE(SUM(sp.good_output), 0) as good_output,
      COALESCE(SUM(sp.reject_count), 0) as total_rejects,
      COALESCE(AVG(sp.oee_overall), 0) as avg_oee,
      COALESCE(AVG(sp.oee_quality), 0) as avg_quality,
      COALESCE(SUM(sp.downtime_minutes), 0) as total_downtime
    FROM employees e
    JOIN mfg_shift_productions sp ON sp.operator_id = e.id
    WHERE sp.shift_date >= NOW() - INTERVAL '30 days'
    GROUP BY e.id, e.name, e.position
    ORDER BY avg_oee DESC
  `);

  return res.status(200).json(successResponse(productivity));
}

// Production cost summary for finance
async function getProductionCostSummary(req: NextApiRequest, res: NextApiResponse) {
  const period = (req.query.period as string) || '30d';
  const interval = period === '7d' ? '7 days' : period === '90d' ? '90 days' : '30 days';

  const [summary] = await sequelize.query(`
    SELECT 
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'material'), 0) as material_cost,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'labor'), 0) as labor_cost,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'overhead'), 0) as overhead_cost,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'machine'), 0) as machine_cost,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'energy'), 0) as energy_cost,
      COALESCE(SUM(pc.actual_amount), 0) as total_cost,
      COALESCE(SUM(pc.planned_amount), 0) as total_planned,
      COALESCE(SUM(pc.variance), 0) as total_variance,
      COUNT(DISTINCT pc.work_order_id) as wo_count
    FROM mfg_production_costs pc
    WHERE pc.created_at >= NOW() - :interval::INTERVAL
  `, { replacements: { interval } });

  const [costByProduct] = await sequelize.query(`
    SELECT p.name, p.sku,
      SUM(wo.actual_quantity) as total_produced,
      SUM(pc.actual_amount) as total_cost,
      CASE WHEN SUM(wo.actual_quantity) > 0 THEN SUM(pc.actual_amount) / SUM(wo.actual_quantity) ELSE 0 END as unit_cost
    FROM mfg_production_costs pc
    JOIN mfg_work_orders wo ON pc.work_order_id = wo.id
    JOIN products p ON wo.product_id = p.id
    WHERE pc.created_at >= NOW() - :interval::INTERVAL AND wo.status = 'completed'
    GROUP BY p.id, p.name, p.sku
    ORDER BY total_cost DESC LIMIT 20
  `, { replacements: { interval } });

  return res.status(200).json(successResponse({ summary: summary[0], costByProduct }));
}

// COGS calculation
async function getCOGSCalculation(req: NextApiRequest, res: NextApiResponse) {
  const { product_id, period } = req.query;
  const interval = period === '7d' ? '7 days' : period === '90d' ? '90 days' : '30 days';

  let where = 'WHERE wo.status = \'completed\' AND wo.completed_at >= NOW() - :interval::INTERVAL';
  const replacements: any = { interval };

  if (product_id) { where += ' AND wo.product_id = :product_id'; replacements.product_id = product_id; }

  const [cogs] = await sequelize.query(`
    SELECT p.name as product_name, p.sku,
      SUM(wo.actual_quantity) as total_produced,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'material'), 0) as material_cogs,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type = 'labor'), 0) as labor_cogs,
      COALESCE(SUM(pc.actual_amount) FILTER (WHERE pc.cost_type IN ('overhead','machine','energy')), 0) as overhead_cogs,
      COALESCE(SUM(pc.actual_amount), 0) as total_cogs,
      CASE WHEN SUM(wo.actual_quantity) > 0 THEN SUM(pc.actual_amount) / SUM(wo.actual_quantity) ELSE 0 END as cogs_per_unit
    FROM mfg_work_orders wo
    JOIN products p ON wo.product_id = p.id
    LEFT JOIN mfg_production_costs pc ON pc.work_order_id = wo.id
    ${where}
    GROUP BY p.id, p.name, p.sku
    ORDER BY total_cogs DESC
  `, { replacements });

  return res.status(200).json(successResponse(cogs));
}

// Integrated dashboard combining all modules
async function getIntegratedDashboard(req: NextApiRequest, res: NextApiResponse) {
  const [productionStatus] = await sequelize.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'in_progress') as active_wo,
      COUNT(*) FILTER (WHERE status = 'planned' OR status = 'released') as pending_wo,
      COALESCE(SUM(actual_quantity) FILTER (WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '7 days'), 0) as weekly_output
    FROM mfg_work_orders
  `);

  const [inventoryImpact] = await sequelize.query(`
    SELECT 
      (SELECT COUNT(*) FROM mfg_wo_materials wm JOIN mfg_work_orders wo ON wm.work_order_id = wo.id WHERE wo.status IN ('planned','released') AND wm.status = 'pending') as pending_material_issues,
      (SELECT COALESCE(SUM(wm.planned_quantity * wm.cost_per_unit), 0) FROM mfg_wo_materials wm JOIN mfg_work_orders wo ON wm.work_order_id = wo.id WHERE wo.status IN ('planned','released') AND wm.status = 'pending') as pending_material_value
  `);

  const [qualityStatus] = await sequelize.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending') as pending_inspections,
      COALESCE(AVG(defect_rate) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as weekly_defect_rate
    FROM mfg_qc_inspections
  `);

  const [maintenanceStatus] = await sequelize.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'scheduled' AND scheduled_date <= NOW()) as overdue_maintenance,
      COUNT(*) FILTER (WHERE status = 'scheduled' AND scheduled_date <= NOW() + INTERVAL '7 days') as upcoming_maintenance
    FROM mfg_maintenance_records
  `);

  return res.status(200).json(successResponse({
    production: productionStatus[0],
    inventory: inventoryImpact[0],
    quality: qualityStatus[0],
    maintenance: maintenanceStatus[0]
  }));
}
