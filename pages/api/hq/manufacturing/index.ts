import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse } from '../../../../lib/api/response';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';

const sequelize = require('../../../../lib/sequelize');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const action = (req.query.action as string) || 'dashboard';

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, action);
      case 'POST':
        return handlePost(req, res, action);
      case 'PUT':
        return handlePut(req, res, action);
      case 'DELETE':
        return handleDelete(req, res, action);
      default:
        return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'));
    }
  } catch (error: any) {
    console.error(`[MFG API] Error (${action}):`, error.message);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
}

export default withHQAuth(handler);

// ==========================================
// GET HANDLERS
// ==========================================
async function handleGet(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    case 'dashboard': return getDashboard(req, res);
    case 'work-centers': return getWorkCenters(req, res);
    case 'bom': return getBOM(req, res);
    case 'bom-detail': return getBOMDetail(req, res);
    case 'routings': return getRoutings(req, res);
    case 'routing-detail': return getRoutingDetail(req, res);
    case 'work-orders': return getWorkOrders(req, res);
    case 'work-order-detail': return getWorkOrderDetail(req, res);
    case 'qc-templates': return getQCTemplates(req, res);
    case 'qc-inspections': return getQCInspections(req, res);
    case 'machines': return getMachines(req, res);
    case 'maintenance': return getMaintenanceRecords(req, res);
    case 'production-plans': return getProductionPlans(req, res);
    case 'waste': return getWasteRecords(req, res);
    case 'costs': return getProductionCosts(req, res);
    case 'shift-production': return getShiftProduction(req, res);
    case 'settings': return getSettings(req, res);
    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown GET action: ${action}`));
  }
}

// Dashboard
async function getDashboard(req: NextApiRequest, res: NextApiResponse) {
  const [woStats] = await sequelize.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'draft') as draft,
      COUNT(*) FILTER (WHERE status = 'planned') as planned,
      COUNT(*) FILTER (WHERE status = 'released') as released,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
      COUNT(*) as total,
      COALESCE(SUM(actual_quantity), 0) as total_produced,
      COALESCE(SUM(rejected_quantity), 0) as total_rejected,
      COALESCE(SUM(actual_cost), 0) as total_cost
    FROM mfg_work_orders
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const [machineStats] = await sequelize.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'operational') as operational,
      COUNT(*) FILTER (WHERE status = 'maintenance') as in_maintenance,
      COUNT(*) FILTER (WHERE status = 'breakdown') as breakdown
    FROM mfg_machines
  `);

  const [qcStats] = await sequelize.query(`
    SELECT 
      COUNT(*) as total_inspections,
      COUNT(*) FILTER (WHERE overall_result = 'passed') as passed,
      COUNT(*) FILTER (WHERE overall_result = 'failed') as failed,
      COALESCE(AVG(defect_rate), 0) as avg_defect_rate
    FROM mfg_qc_inspections
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const [maintenanceAlerts] = await sequelize.query(`
    SELECT COUNT(*) as overdue
    FROM mfg_maintenance_records
    WHERE status IN ('scheduled', 'overdue') AND scheduled_date <= NOW()
  `);

  const [recentWOs] = await sequelize.query(`
    SELECT wo.*, p.name as product_name, wc.name as work_center_name
    FROM mfg_work_orders wo
    LEFT JOIN products p ON wo.product_id = p.id
    LEFT JOIN mfg_work_centers wc ON wo.work_center_id = wc.id
    ORDER BY wo.created_at DESC LIMIT 10
  `);

  const [productionTrend] = await sequelize.query(`
    SELECT 
      TO_CHAR(DATE_TRUNC('day', actual_end), 'YYYY-MM-DD') as date,
      COUNT(*) as completed_orders,
      COALESCE(SUM(actual_quantity), 0) as total_quantity,
      COALESCE(SUM(actual_cost), 0) as total_cost
    FROM mfg_work_orders
    WHERE status = 'completed' AND actual_end >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', actual_end)
    ORDER BY date
  `);

  return res.status(200).json(successResponse({
    workOrders: woStats[0] || {},
    machines: machineStats[0] || {},
    quality: qcStats[0] || {},
    maintenanceAlerts: maintenanceAlerts[0]?.overdue || 0,
    recentWorkOrders: recentWOs,
    productionTrend
  }));
}

// Work Centers
async function getWorkCenters(req: NextApiRequest, res: NextApiResponse) {
  const { status, search } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (status && status !== 'all') { where += ' AND wc.status = :status'; replacements.status = status; }
  if (search) { where += ' AND (wc.name ILIKE :search OR wc.code ILIKE :search)'; replacements.search = `%${search}%`; }

  const [rows] = await sequelize.query(`
    SELECT wc.*, b.name as branch_name, e.name as manager_name,
      (SELECT COUNT(*) FROM mfg_machines m WHERE m.work_center_id = wc.id) as machine_count,
      (SELECT COUNT(*) FROM mfg_work_orders wo WHERE wo.work_center_id = wc.id AND wo.status = 'in_progress') as active_orders
    FROM mfg_work_centers wc
    LEFT JOIN branches b ON wc.branch_id = b.id
    LEFT JOIN employees e ON wc.manager_id = e.id
    ${where}
    ORDER BY wc.name
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// BOM List
async function getBOM(req: NextApiRequest, res: NextApiResponse) {
  const { status, search, product_id } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (status && status !== 'all') { where += ' AND b.status = :status'; replacements.status = status; }
  if (search) { where += ' AND (b.bom_name ILIKE :search OR b.bom_code ILIKE :search)'; replacements.search = `%${search}%`; }
  if (product_id) { where += ' AND b.product_id = :product_id'; replacements.product_id = product_id; }

  const [rows] = await sequelize.query(`
    SELECT b.*, p.name as product_name, p.sku as product_sku,
      e.name as created_by_name,
      (SELECT COUNT(*) FROM mfg_bom_items bi WHERE bi.bom_id = b.id) as item_count,
      (SELECT COALESCE(SUM(bi.quantity * bi.cost_per_unit), 0) FROM mfg_bom_items bi WHERE bi.bom_id = b.id) as total_material_cost
    FROM mfg_bom b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN employees e ON b.created_by = e.id
    ${where}
    ORDER BY b.updated_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// BOM Detail
async function getBOMDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'BOM ID required'));

  const [bom] = await sequelize.query(`
    SELECT b.*, p.name as product_name, p.sku as product_sku,
      e1.name as created_by_name, e2.name as approved_by_name,
      r.routing_name, r.routing_code
    FROM mfg_bom b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN employees e1 ON b.created_by = e1.id
    LEFT JOIN employees e2 ON b.approved_by = e2.id
    LEFT JOIN mfg_routings r ON b.routing_id = r.id
    WHERE b.id = :id
  `, { replacements: { id } });

  if (!bom[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'BOM not found'));

  const [items] = await sequelize.query(`
    SELECT bi.*, p.name as product_name, p.sku as product_sku,
      sb.bom_name as sub_bom_name
    FROM mfg_bom_items bi
    LEFT JOIN products p ON bi.product_id = p.id
    LEFT JOIN mfg_bom sb ON bi.sub_bom_id = sb.id
    WHERE bi.bom_id = :id
    ORDER BY bi.sort_order
  `, { replacements: { id } });

  return res.status(200).json(successResponse({ ...bom[0], items }));
}

// Routings
async function getRoutings(req: NextApiRequest, res: NextApiResponse) {
  const { status, search } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (status && status !== 'all') { where += ' AND r.status = :status'; replacements.status = status; }
  if (search) { where += ' AND (r.routing_name ILIKE :search OR r.routing_code ILIKE :search)'; replacements.search = `%${search}%`; }

  const [rows] = await sequelize.query(`
    SELECT r.*, p.name as product_name,
      (SELECT COUNT(*) FROM mfg_routing_operations ro WHERE ro.routing_id = r.id) as operation_count
    FROM mfg_routings r
    LEFT JOIN products p ON r.product_id = p.id
    ${where}
    ORDER BY r.updated_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Routing Detail
async function getRoutingDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Routing ID required'));

  const [routing] = await sequelize.query(`SELECT r.*, p.name as product_name FROM mfg_routings r LEFT JOIN products p ON r.product_id = p.id WHERE r.id = :id`, { replacements: { id } });
  if (!routing[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'Routing not found'));

  const [operations] = await sequelize.query(`
    SELECT ro.*, wc.name as work_center_name
    FROM mfg_routing_operations ro
    LEFT JOIN mfg_work_centers wc ON ro.work_center_id = wc.id
    WHERE ro.routing_id = :id ORDER BY ro.operation_number
  `, { replacements: { id } });

  return res.status(200).json(successResponse({ ...routing[0], operations }));
}

// Work Orders
async function getWorkOrders(req: NextApiRequest, res: NextApiResponse) {
  const { status, priority, search, branch_id, page = '1', limit = '20' } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (status && status !== 'all') { where += ' AND wo.status = :status'; replacements.status = status; }
  if (priority && priority !== 'all') { where += ' AND wo.priority = :priority'; replacements.priority = priority; }
  if (search) { where += ' AND (wo.wo_number ILIKE :search OR p.name ILIKE :search)'; replacements.search = `%${search}%`; }
  if (branch_id) { where += ' AND wo.branch_id = :branch_id'; replacements.branch_id = branch_id; }

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM mfg_work_orders wo LEFT JOIN products p ON wo.product_id = p.id ${where}`, { replacements });

  const [rows] = await sequelize.query(`
    SELECT wo.*, p.name as product_name, p.sku as product_sku,
      wc.name as work_center_name, br.name as branch_name,
      e1.name as assigned_to_name, e2.name as created_by_name,
      bom.bom_name,
      (SELECT COUNT(*) FROM mfg_wo_materials wm WHERE wm.work_order_id = wo.id) as material_count,
      (SELECT COUNT(*) FROM mfg_wo_operations wop WHERE wop.work_order_id = wo.id) as operation_count
    FROM mfg_work_orders wo
    LEFT JOIN products p ON wo.product_id = p.id
    LEFT JOIN mfg_work_centers wc ON wo.work_center_id = wc.id
    LEFT JOIN branches br ON wo.branch_id = br.id
    LEFT JOIN employees e1 ON wo.assigned_to = e1.id
    LEFT JOIN employees e2 ON wo.created_by = e2.id
    LEFT JOIN mfg_bom bom ON wo.bom_id = bom.id
    ${where}
    ORDER BY wo.created_at DESC
    LIMIT :limit OFFSET :offset
  `, { replacements: { ...replacements, limit: parseInt(limit as string), offset } });

  return res.status(200).json(successResponse(rows, {
    total: parseInt(countResult[0]?.total || '0'),
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    totalPages: Math.ceil(parseInt(countResult[0]?.total || '0') / parseInt(limit as string))
  }));
}

// Work Order Detail
async function getWorkOrderDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Work Order ID required'));

  const [wo] = await sequelize.query(`
    SELECT wo.*, p.name as product_name, p.sku as product_sku,
      wc.name as work_center_name, br.name as branch_name,
      e1.name as assigned_to_name, e2.name as created_by_name,
      e3.name as approved_by_name, e4.name as completed_by_name,
      bom.bom_name, bom.bom_code, rt.routing_name
    FROM mfg_work_orders wo
    LEFT JOIN products p ON wo.product_id = p.id
    LEFT JOIN mfg_work_centers wc ON wo.work_center_id = wc.id
    LEFT JOIN branches br ON wo.branch_id = br.id
    LEFT JOIN employees e1 ON wo.assigned_to = e1.id
    LEFT JOIN employees e2 ON wo.created_by = e2.id
    LEFT JOIN employees e3 ON wo.approved_by = e3.id
    LEFT JOIN employees e4 ON wo.completed_by = e4.id
    LEFT JOIN mfg_bom bom ON wo.bom_id = bom.id
    LEFT JOIN mfg_routings rt ON wo.routing_id = rt.id
    WHERE wo.id = :id
  `, { replacements: { id } });

  if (!wo[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'Work Order not found'));

  const [materials] = await sequelize.query(`
    SELECT wm.*, p.name as product_name, p.sku as product_sku, w.name as warehouse_name
    FROM mfg_wo_materials wm
    LEFT JOIN products p ON wm.product_id = p.id
    LEFT JOIN warehouses w ON wm.warehouse_id = w.id
    WHERE wm.work_order_id = :id ORDER BY wm.created_at
  `, { replacements: { id } });

  const [operations] = await sequelize.query(`
    SELECT wop.*, wc.name as work_center_name, e.name as operator_name
    FROM mfg_wo_operations wop
    LEFT JOIN mfg_work_centers wc ON wop.work_center_id = wc.id
    LEFT JOIN employees e ON wop.operator_id = e.id
    WHERE wop.work_order_id = :id ORDER BY wop.operation_number
  `, { replacements: { id } });

  const [outputs] = await sequelize.query(`
    SELECT woo.*, p.name as product_name, w.name as warehouse_name
    FROM mfg_wo_outputs woo
    LEFT JOIN products p ON woo.product_id = p.id
    LEFT JOIN warehouses w ON woo.warehouse_id = w.id
    WHERE woo.work_order_id = :id ORDER BY woo.created_at
  `, { replacements: { id } });

  const [costs] = await sequelize.query(`SELECT * FROM mfg_production_costs WHERE work_order_id = :id ORDER BY cost_type`, { replacements: { id } });

  const [waste] = await sequelize.query(`
    SELECT wr.*, p.name as product_name FROM mfg_waste_records wr
    LEFT JOIN products p ON wr.product_id = p.id WHERE wr.work_order_id = :id
  `, { replacements: { id } });

  return res.status(200).json(successResponse({ ...wo[0], materials, operations, outputs, costs, waste }));
}

// QC Templates
async function getQCTemplates(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`
    SELECT qt.*, (SELECT COUNT(*) FROM mfg_qc_inspections qi WHERE qi.template_id = qt.id) as usage_count
    FROM mfg_qc_templates qt ORDER BY qt.template_name
  `);
  return res.status(200).json(successResponse(rows));
}

// QC Inspections
async function getQCInspections(req: NextApiRequest, res: NextApiResponse) {
  const { status, type, work_order_id } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (status && status !== 'all') { where += ' AND qi.status = :status'; replacements.status = status; }
  if (type && type !== 'all') { where += ' AND qi.inspection_type = :type'; replacements.type = type; }
  if (work_order_id) { where += ' AND qi.work_order_id = :work_order_id'; replacements.work_order_id = work_order_id; }

  const [rows] = await sequelize.query(`
    SELECT qi.*, p.name as product_name, wo.wo_number, e.name as inspector_name,
      qt.template_name,
      (SELECT COUNT(*) FROM mfg_qc_results qr WHERE qr.inspection_id = qi.id) as result_count,
      (SELECT COUNT(*) FILTER (WHERE qr.result = 'fail') FROM mfg_qc_results qr WHERE qr.inspection_id = qi.id) as fail_count
    FROM mfg_qc_inspections qi
    LEFT JOIN products p ON qi.product_id = p.id
    LEFT JOIN mfg_work_orders wo ON qi.work_order_id = wo.id
    LEFT JOIN employees e ON qi.inspector_id = e.id
    LEFT JOIN mfg_qc_templates qt ON qi.template_id = qt.id
    ${where}
    ORDER BY qi.created_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Machines
async function getMachines(req: NextApiRequest, res: NextApiResponse) {
  const { status, search, work_center_id } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (status && status !== 'all') { where += ' AND m.status = :status'; replacements.status = status; }
  if (search) { where += ' AND (m.machine_name ILIKE :search OR m.machine_code ILIKE :search)'; replacements.search = `%${search}%`; }
  if (work_center_id) { where += ' AND m.work_center_id = :work_center_id'; replacements.work_center_id = work_center_id; }

  const [rows] = await sequelize.query(`
    SELECT m.*, wc.name as work_center_name, br.name as branch_name,
      (SELECT COUNT(*) FROM mfg_maintenance_records mr WHERE mr.machine_id = m.id AND mr.status = 'scheduled') as pending_maintenance,
      (SELECT MAX(completed_at) FROM mfg_maintenance_records mr WHERE mr.machine_id = m.id AND mr.status = 'completed') as last_maintenance
    FROM mfg_machines m
    LEFT JOIN mfg_work_centers wc ON m.work_center_id = wc.id
    LEFT JOIN branches br ON m.branch_id = br.id
    ${where}
    ORDER BY m.machine_name
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Maintenance Records
async function getMaintenanceRecords(req: NextApiRequest, res: NextApiResponse) {
  const { machine_id, status } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (machine_id) { where += ' AND mr.machine_id = :machine_id'; replacements.machine_id = machine_id; }
  if (status && status !== 'all') { where += ' AND mr.status = :status'; replacements.status = status; }

  const [rows] = await sequelize.query(`
    SELECT mr.*, m.machine_name, m.machine_code, e.name as performed_by_name
    FROM mfg_maintenance_records mr
    LEFT JOIN mfg_machines m ON mr.machine_id = m.id
    LEFT JOIN employees e ON mr.performed_by = e.id
    ${where}
    ORDER BY mr.scheduled_date DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Production Plans
async function getProductionPlans(req: NextApiRequest, res: NextApiResponse) {
  const { status } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (status && status !== 'all') { where += ' AND pp.status = :status'; replacements.status = status; }

  const [rows] = await sequelize.query(`
    SELECT pp.*, e.name as created_by_name,
      (SELECT COUNT(*) FROM mfg_production_plan_items pi WHERE pi.plan_id = pp.id) as item_count,
      (SELECT COUNT(*) FROM mfg_production_plan_items pi WHERE pi.plan_id = pp.id AND pi.work_order_id IS NOT NULL) as generated_wo_count
    FROM mfg_production_plans pp
    LEFT JOIN employees e ON pp.created_by = e.id
    ${where}
    ORDER BY pp.period_start DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Waste Records
async function getWasteRecords(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, waste_type } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (work_order_id) { where += ' AND wr.work_order_id = :work_order_id'; replacements.work_order_id = work_order_id; }
  if (waste_type && waste_type !== 'all') { where += ' AND wr.waste_type = :waste_type'; replacements.waste_type = waste_type; }

  const [rows] = await sequelize.query(`
    SELECT wr.*, p.name as product_name, wo.wo_number, e.name as recorded_by_name,
      wc.name as work_center_name
    FROM mfg_waste_records wr
    LEFT JOIN products p ON wr.product_id = p.id
    LEFT JOIN mfg_work_orders wo ON wr.work_order_id = wo.id
    LEFT JOIN employees e ON wr.recorded_by = e.id
    LEFT JOIN mfg_work_centers wc ON wr.work_center_id = wc.id
    ${where}
    ORDER BY wr.recorded_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Production Costs
async function getProductionCosts(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id } = req.query;
  if (!work_order_id) return res.status(400).json(errorResponse('MISSING_ID', 'Work Order ID required'));

  const [rows] = await sequelize.query(`SELECT * FROM mfg_production_costs WHERE work_order_id = :work_order_id ORDER BY cost_type`, { replacements: { work_order_id } });

  const [summary] = await sequelize.query(`
    SELECT cost_type, SUM(planned_amount) as planned, SUM(actual_amount) as actual, SUM(variance) as variance
    FROM mfg_production_costs WHERE work_order_id = :work_order_id GROUP BY cost_type
  `, { replacements: { work_order_id } });

  return res.status(200).json(successResponse({ items: rows, summary }));
}

// Shift Production
async function getShiftProduction(req: NextApiRequest, res: NextApiResponse) {
  const { date, work_center_id, work_order_id } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (date) { where += ' AND sp.shift_date = :date'; replacements.date = date; }
  if (work_center_id) { where += ' AND sp.work_center_id = :work_center_id'; replacements.work_center_id = work_center_id; }
  if (work_order_id) { where += ' AND sp.work_order_id = :work_order_id'; replacements.work_order_id = work_order_id; }

  const [rows] = await sequelize.query(`
    SELECT sp.*, wc.name as work_center_name, wo.wo_number, m.machine_name, e.name as operator_name
    FROM mfg_shift_productions sp
    LEFT JOIN mfg_work_centers wc ON sp.work_center_id = wc.id
    LEFT JOIN mfg_work_orders wo ON sp.work_order_id = wo.id
    LEFT JOIN mfg_machines m ON sp.machine_id = m.id
    LEFT JOIN employees e ON sp.operator_id = e.id
    ${where}
    ORDER BY sp.shift_date DESC, sp.shift_name
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

// Settings
async function getSettings(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`SELECT * FROM mfg_settings ORDER BY setting_key`);
  return res.status(200).json(successResponse(rows));
}

// ==========================================
// POST HANDLERS
// ==========================================
async function handlePost(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    case 'work-center': return createWorkCenter(req, res);
    case 'bom': return createBOM(req, res);
    case 'routing': return createRouting(req, res);
    case 'work-order': return createWorkOrder(req, res);
    case 'wo-start': return startWorkOrder(req, res);
    case 'wo-complete': return completeWorkOrder(req, res);
    case 'wo-issue-material': return issueMaterial(req, res);
    case 'wo-record-output': return recordOutput(req, res);
    case 'qc-template': return createQCTemplate(req, res);
    case 'qc-inspection': return createQCInspection(req, res);
    case 'qc-complete': return completeQCInspection(req, res);
    case 'machine': return createMachine(req, res);
    case 'maintenance': return createMaintenance(req, res);
    case 'production-plan': return createProductionPlan(req, res);
    case 'generate-wo-from-plan': return generateWOFromPlan(req, res);
    case 'waste': return recordWaste(req, res);
    case 'shift-production': return recordShiftProduction(req, res);
    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown POST action: ${action}`));
  }
}

// Create Work Center
async function createWorkCenter(req: NextApiRequest, res: NextApiResponse) {
  const { code, name, description, type, capacity_per_hour, operating_cost_per_hour, setup_time_minutes, location, branch_id, manager_id, efficiency_target } = req.body;
  if (!code || !name) return res.status(400).json(errorResponse('VALIDATION', 'Code and name required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_work_centers (tenant_id, code, name, description, type, capacity_per_hour, operating_cost_per_hour, setup_time_minutes, location, branch_id, manager_id, efficiency_target)
    SELECT t.id, :code, :name, :description, :type, :capacity, :cost, :setup, :location, :branch_id, :manager_id, :efficiency
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { code, name, description: description || null, type: type || 'production', capacity: capacity_per_hour || 0, cost: operating_cost_per_hour || 0, setup: setup_time_minutes || 0, location: location || null, branch_id: branch_id || null, manager_id: manager_id || null, efficiency: efficiency_target || 85 } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Work center created'));
}

// Create BOM
async function createBOM(req: NextApiRequest, res: NextApiResponse) {
  const { product_id, bom_code, bom_name, bom_type, base_quantity, base_uom, yield_percentage, routing_id, notes, items } = req.body;
  if (!product_id || !bom_code || !bom_name) return res.status(400).json(errorResponse('VALIDATION', 'Product, code, and name required'));

  const t = await sequelize.transaction();
  try {
    const [bom] = await sequelize.query(`
      INSERT INTO mfg_bom (tenant_id, product_id, bom_code, bom_name, bom_type, base_quantity, base_uom, yield_percentage, routing_id, notes)
      SELECT ten.id, :product_id, :bom_code, :bom_name, :bom_type, :base_qty, :base_uom, :yield, :routing_id, :notes
      FROM tenants ten LIMIT 1
      RETURNING *
    `, { replacements: { product_id, bom_code, bom_name, bom_type: bom_type || 'standard', base_qty: base_quantity || 1, base_uom: base_uom || 'pcs', yield: yield_percentage || 100, routing_id: routing_id || null, notes: notes || null }, transaction: t });

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await sequelize.query(`
          INSERT INTO mfg_bom_items (bom_id, item_type, product_id, quantity, uom, waste_percentage, scrap_percentage, is_critical, cost_per_unit, lead_time_days, notes, sort_order)
          VALUES (:bom_id, :item_type, :product_id, :quantity, :uom, :waste, :scrap, :critical, :cost, :lead_time, :notes, :sort)
        `, { replacements: { bom_id: bom[0].id, item_type: item.item_type || 'raw_material', product_id: item.product_id, quantity: item.quantity, uom: item.uom || 'pcs', waste: item.waste_percentage || 0, scrap: item.scrap_percentage || 0, critical: item.is_critical || false, cost: item.cost_per_unit || 0, lead_time: item.lead_time_days || 0, notes: item.notes || null, sort: i }, transaction: t });
      }
    }

    await t.commit();
    return res.status(201).json(successResponse(bom[0], undefined, 'BOM created'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Create Routing
async function createRouting(req: NextApiRequest, res: NextApiResponse) {
  const { product_id, routing_code, routing_name, notes, operations } = req.body;
  if (!routing_code || !routing_name) return res.status(400).json(errorResponse('VALIDATION', 'Code and name required'));

  const t = await sequelize.transaction();
  try {
    let totalTime = 0;
    let totalCost = 0;
    if (operations) {
      operations.forEach((op: any) => { totalTime += (op.setup_time_minutes || 0) + (op.run_time_per_unit || 0); totalCost += op.cost_per_unit || 0; });
    }

    const [routing] = await sequelize.query(`
      INSERT INTO mfg_routings (tenant_id, product_id, routing_code, routing_name, total_time_minutes, total_cost, notes)
      SELECT ten.id, :product_id, :code, :name, :total_time, :total_cost, :notes
      FROM tenants ten LIMIT 1
      RETURNING *
    `, { replacements: { product_id: product_id || null, code: routing_code, name: routing_name, total_time: totalTime, total_cost: totalCost, notes: notes || null }, transaction: t });

    if (operations && operations.length > 0) {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        await sequelize.query(`
          INSERT INTO mfg_routing_operations (routing_id, operation_number, operation_name, work_center_id, setup_time_minutes, run_time_per_unit, description, quality_check_required, tools_required, skill_required, cost_per_unit, sort_order)
          VALUES (:routing_id, :num, :name, :wc_id, :setup, :run_time, :desc, :qc, :tools, :skill, :cost, :sort)
        `, { replacements: { routing_id: routing[0].id, num: op.operation_number || (i + 1), name: op.operation_name, wc_id: op.work_center_id || null, setup: op.setup_time_minutes || 0, run_time: op.run_time_per_unit || 0, desc: op.description || null, qc: op.quality_check_required || false, tools: JSON.stringify(op.tools_required || []), skill: op.skill_required || null, cost: op.cost_per_unit || 0, sort: i }, transaction: t });
      }
    }

    await t.commit();
    return res.status(201).json(successResponse(routing[0], undefined, 'Routing created'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Create Work Order
async function createWorkOrder(req: NextApiRequest, res: NextApiResponse) {
  const { product_id, bom_id, routing_id, planned_quantity, uom, priority, planned_start, planned_end, work_center_id, assigned_to, branch_id, source_type, source_id, notes } = req.body;
  if (!product_id || !planned_quantity) return res.status(400).json(errorResponse('VALIDATION', 'Product and quantity required'));

  const t = await sequelize.transaction();
  try {
    // Generate WO number
    const [seqResult] = await sequelize.query(`
      SELECT COUNT(*) + 1 as seq FROM mfg_work_orders WHERE created_at >= DATE_TRUNC('month', NOW())
    `, { transaction: t });
    const seq = String(seqResult[0]?.seq || 1).padStart(4, '0');
    const now = new Date();
    const woNumber = `WO-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${seq}`;

    const [wo] = await sequelize.query(`
      INSERT INTO mfg_work_orders (tenant_id, wo_number, product_id, bom_id, routing_id, planned_quantity, uom, priority, planned_start, planned_end, work_center_id, assigned_to, branch_id, source_type, source_id, notes)
      SELECT ten.id, :wo_number, :product_id, :bom_id, :routing_id, :qty, :uom, :priority, :start, :end, :wc_id, :assigned, :branch, :source_type, :source_id, :notes
      FROM tenants ten LIMIT 1
      RETURNING *
    `, { replacements: { wo_number: woNumber, product_id, bom_id: bom_id || null, routing_id: routing_id || null, qty: planned_quantity, uom: uom || 'pcs', priority: priority || 'normal', start: planned_start || null, end: planned_end || null, wc_id: work_center_id || null, assigned: assigned_to || null, branch: branch_id || null, source_type: source_type || 'manual', source_id: source_id || null, notes: notes || null }, transaction: t });

    // Auto-populate materials from BOM
    if (bom_id) {
      await sequelize.query(`
        INSERT INTO mfg_wo_materials (work_order_id, product_id, bom_item_id, planned_quantity, uom, cost_per_unit)
        SELECT :wo_id, bi.product_id, bi.id, bi.quantity * :qty_ratio, bi.uom, bi.cost_per_unit
        FROM mfg_bom_items bi WHERE bi.bom_id = :bom_id
      `, { replacements: { wo_id: wo[0].id, qty_ratio: planned_quantity, bom_id }, transaction: t });
    }

    // Auto-populate operations from routing
    if (routing_id) {
      await sequelize.query(`
        INSERT INTO mfg_wo_operations (work_order_id, routing_operation_id, operation_number, operation_name, work_center_id)
        SELECT :wo_id, ro.id, ro.operation_number, ro.operation_name, ro.work_center_id
        FROM mfg_routing_operations ro WHERE ro.routing_id = :routing_id ORDER BY ro.operation_number
      `, { replacements: { wo_id: wo[0].id, routing_id }, transaction: t });
    }

    await t.commit();
    return res.status(201).json(successResponse(wo[0], undefined, 'Work Order created'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Start Work Order
async function startWorkOrder(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Work Order ID required'));

  await sequelize.query(`UPDATE mfg_work_orders SET status = 'in_progress', actual_start = NOW(), updated_at = NOW() WHERE id = :id AND status IN ('planned', 'released')`, { replacements: { id } });
  return res.status(200).json(successResponse({ id }, undefined, 'Work Order started'));
}

// Complete Work Order
async function completeWorkOrder(req: NextApiRequest, res: NextApiResponse) {
  const { id, actual_quantity, rejected_quantity } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Work Order ID required'));

  const t = await sequelize.transaction();
  try {
    const [woData] = await sequelize.query(`SELECT planned_quantity FROM mfg_work_orders WHERE id = :id`, { replacements: { id }, transaction: t });
    const planned = parseFloat(woData[0]?.planned_quantity || 0);
    const actual = parseFloat(actual_quantity || 0);
    const yieldPct = planned > 0 ? (actual / planned) * 100 : 0;

    await sequelize.query(`
      UPDATE mfg_work_orders 
      SET status = 'completed', actual_quantity = :actual, rejected_quantity = :rejected, 
          actual_end = NOW(), yield_percentage = :yield, completed_at = NOW(), updated_at = NOW()
      WHERE id = :id AND status = 'in_progress'
    `, { replacements: { id, actual: actual_quantity || 0, rejected: rejected_quantity || 0, yield: yieldPct }, transaction: t });

    // Calculate actual costs
    const [materialCost] = await sequelize.query(`SELECT COALESCE(SUM(consumed_quantity * cost_per_unit), 0) as total FROM mfg_wo_materials WHERE work_order_id = :id`, { replacements: { id }, transaction: t });
    
    await sequelize.query(`UPDATE mfg_work_orders SET actual_cost = :cost, updated_at = NOW() WHERE id = :id`, { replacements: { id, cost: materialCost[0]?.total || 0 }, transaction: t });

    await t.commit();
    return res.status(200).json(successResponse({ id }, undefined, 'Work Order completed'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Issue Material
async function issueMaterial(req: NextApiRequest, res: NextApiResponse) {
  const { id, issued_quantity } = req.body;
  if (!id || !issued_quantity) return res.status(400).json(errorResponse('VALIDATION', 'Material ID and quantity required'));

  await sequelize.query(`
    UPDATE mfg_wo_materials 
    SET issued_quantity = issued_quantity + :qty, status = CASE WHEN issued_quantity + :qty >= planned_quantity THEN 'issued' ELSE 'partial' END,
        issued_at = NOW(), updated_at = NOW()
    WHERE id = :id
  `, { replacements: { id, qty: issued_quantity } });

  return res.status(200).json(successResponse({ id }, undefined, 'Material issued'));
}

// Record Output
async function recordOutput(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, product_id, quantity, quality_status, warehouse_id, batch_number, lot_number, expiry_date } = req.body;
  if (!work_order_id || !quantity) return res.status(400).json(errorResponse('VALIDATION', 'Work Order and quantity required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_wo_outputs (work_order_id, product_id, quantity, quality_status, warehouse_id, batch_number, lot_number, expiry_date, received_at)
    VALUES (:wo_id, :product_id, :qty, :quality, :warehouse, :batch, :lot, :expiry, NOW())
    RETURNING *
  `, { replacements: { wo_id: work_order_id, product_id: product_id || null, qty: quantity, quality: quality_status || 'pending', warehouse: warehouse_id || null, batch: batch_number || null, lot: lot_number || null, expiry: expiry_date || null } });

  // Update WO actual quantity
  await sequelize.query(`
    UPDATE mfg_work_orders SET actual_quantity = (SELECT COALESCE(SUM(quantity), 0) FROM mfg_wo_outputs WHERE work_order_id = :wo_id AND quality_status != 'scrap'), updated_at = NOW() WHERE id = :wo_id
  `, { replacements: { wo_id: work_order_id } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Output recorded'));
}

// Create QC Template
async function createQCTemplate(req: NextApiRequest, res: NextApiResponse) {
  const { template_code, template_name, inspection_type, product_category, parameters, sampling_method, description } = req.body;
  if (!template_code || !template_name) return res.status(400).json(errorResponse('VALIDATION', 'Code and name required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_qc_templates (tenant_id, template_code, template_name, inspection_type, product_category, parameters, sampling_method, description)
    SELECT t.id, :code, :name, :type, :category, :params, :sampling, :desc
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { code: template_code, name: template_name, type: inspection_type || 'in_process', category: product_category || null, params: JSON.stringify(parameters || []), sampling: sampling_method || 'random', desc: description || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'QC Template created'));
}

// Create QC Inspection
async function createQCInspection(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, product_id, template_id, inspection_type, inspector_id, sample_size, batch_number } = req.body;

  const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_qc_inspections WHERE created_at >= DATE_TRUNC('month', NOW())`);
  const seq = String(seqResult[0]?.seq || 1).padStart(4, '0');
  const now = new Date();
  const inspNo = `QCI-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${seq}`;

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_qc_inspections (tenant_id, inspection_number, work_order_id, product_id, template_id, inspection_type, inspector_id, sample_size, batch_number)
    SELECT t.id, :num, :wo_id, :product_id, :template_id, :type, :inspector, :sample, :batch
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { num: inspNo, wo_id: work_order_id || null, product_id: product_id || null, template_id: template_id || null, type: inspection_type || 'in_process', inspector: inspector_id || null, sample: sample_size || 1, batch: batch_number || null } });

  // Auto-populate results from template parameters
  if (template_id) {
    const [tmpl] = await sequelize.query(`SELECT parameters FROM mfg_qc_templates WHERE id = :id`, { replacements: { id: template_id } });
    if (tmpl[0]?.parameters) {
      const params = typeof tmpl[0].parameters === 'string' ? JSON.parse(tmpl[0].parameters) : tmpl[0].parameters;
      for (const p of params) {
        await sequelize.query(`
          INSERT INTO mfg_qc_results (inspection_id, parameter_name, parameter_type, expected_value, uom, min_value, max_value, severity)
          VALUES (:insp_id, :name, :type, :expected, :uom, :min, :max, :severity)
        `, { replacements: { insp_id: rows[0].id, name: p.name, type: p.type || 'numeric', expected: p.expected || null, uom: p.uom || null, min: p.min || null, max: p.max || null, severity: p.severity || 'minor' } });
      }
    }
  }

  return res.status(201).json(successResponse(rows[0], undefined, 'QC Inspection created'));
}

// Complete QC Inspection
async function completeQCInspection(req: NextApiRequest, res: NextApiResponse) {
  const { id, results, overall_result, disposition, corrective_action, notes } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Inspection ID required'));

  const t = await sequelize.transaction();
  try {
    // Update individual results
    if (results && results.length > 0) {
      for (const r of results) {
        await sequelize.query(`
          UPDATE mfg_qc_results SET actual_value = :actual, result = :result, notes = :notes, updated_at = NOW()
          WHERE id = :id
        `, { replacements: { id: r.id, actual: r.actual_value, result: r.result, notes: r.notes || null }, transaction: t });
      }
    }

    // Calculate defects
    const [defectCount] = await sequelize.query(`SELECT COUNT(*) FILTER (WHERE result = 'fail') as fails, COUNT(*) as total FROM mfg_qc_results WHERE inspection_id = :id`, { replacements: { id }, transaction: t });
    const defects = parseInt(defectCount[0]?.fails || 0);
    const total = parseInt(defectCount[0]?.total || 1);
    const defectRate = total > 0 ? (defects / total) * 100 : 0;

    await sequelize.query(`
      UPDATE mfg_qc_inspections 
      SET status = 'completed', overall_result = :result, defects_found = :defects, defect_rate = :rate,
          disposition = :disposition, corrective_action = :corrective, notes = :notes, completed_at = NOW(), updated_at = NOW()
      WHERE id = :id
    `, { replacements: { id, result: overall_result || (defects === 0 ? 'passed' : 'failed'), defects, rate: defectRate, disposition: disposition || (defects === 0 ? 'accept' : 'hold'), corrective: corrective_action || null, notes: notes || null }, transaction: t });

    await t.commit();
    return res.status(200).json(successResponse({ id, defects, defectRate }, undefined, 'QC Inspection completed'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Create Machine
async function createMachine(req: NextApiRequest, res: NextApiResponse) {
  const { machine_code, machine_name, type, manufacturer, model, serial_number, purchase_date, warranty_expiry, location, work_center_id, branch_id, maintenance_interval_hours, cost_per_hour, purchase_cost, power_consumption_kw, specifications, notes } = req.body;
  if (!machine_code || !machine_name) return res.status(400).json(errorResponse('VALIDATION', 'Code and name required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_machines (tenant_id, machine_code, machine_name, type, manufacturer, model, serial_number, purchase_date, warranty_expiry, location, work_center_id, branch_id, maintenance_interval_hours, cost_per_hour, purchase_cost, power_consumption_kw, specifications, notes)
    SELECT t.id, :code, :name, :type, :manufacturer, :model, :serial, :purchase_date, :warranty, :location, :wc_id, :branch, :maint_interval, :cost_hr, :purchase_cost, :power, :specs, :notes
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { code: machine_code, name: machine_name, type: type || null, manufacturer: manufacturer || null, model: model || null, serial: serial_number || null, purchase_date: purchase_date || null, warranty: warranty_expiry || null, location: location || null, wc_id: work_center_id || null, branch: branch_id || null, maint_interval: maintenance_interval_hours || 500, cost_hr: cost_per_hour || 0, purchase_cost: purchase_cost || 0, power: power_consumption_kw || 0, specs: JSON.stringify(specifications || {}), notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Machine created'));
}

// Create Maintenance
async function createMaintenance(req: NextApiRequest, res: NextApiResponse) {
  const { machine_id, maintenance_type, description, scheduled_date, priority, vendor_name, notes } = req.body;
  if (!machine_id || !description) return res.status(400).json(errorResponse('VALIDATION', 'Machine and description required'));

  const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_maintenance_records WHERE created_at >= DATE_TRUNC('month', NOW())`);
  const seq = String(seqResult[0]?.seq || 1).padStart(4, '0');
  const now = new Date();
  const maintNo = `MNT-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${seq}`;

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_maintenance_records (machine_id, tenant_id, maintenance_type, maintenance_number, description, scheduled_date, priority, vendor_name, notes)
    SELECT :machine_id, t.id, :type, :num, :desc, :date, :priority, :vendor, :notes
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { machine_id, type: maintenance_type || 'preventive', num: maintNo, desc: description, date: scheduled_date || null, priority: priority || 'normal', vendor: vendor_name || null, notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Maintenance scheduled'));
}

// Create Production Plan
async function createProductionPlan(req: NextApiRequest, res: NextApiResponse) {
  const { plan_code, plan_name, plan_type, period_start, period_end, notes, items } = req.body;
  if (!plan_code || !plan_name || !period_start || !period_end) return res.status(400).json(errorResponse('VALIDATION', 'Plan code, name, period required'));

  const t = await sequelize.transaction();
  try {
    let totalQty = 0;
    if (items) items.forEach((i: any) => { totalQty += parseFloat(i.planned_quantity || 0); });

    const [plan] = await sequelize.query(`
      INSERT INTO mfg_production_plans (tenant_id, plan_code, plan_name, plan_type, period_start, period_end, total_planned_qty, notes)
      SELECT ten.id, :code, :name, :type, :start, :end, :total_qty, :notes
      FROM tenants ten LIMIT 1
      RETURNING *
    `, { replacements: { code: plan_code, name: plan_name, type: plan_type || 'weekly', start: period_start, end: period_end, total_qty: totalQty, notes: notes || null }, transaction: t });

    if (items && items.length > 0) {
      for (const item of items) {
        await sequelize.query(`
          INSERT INTO mfg_production_plan_items (plan_id, product_id, bom_id, planned_quantity, scheduled_date, work_center_id, priority, notes)
          VALUES (:plan_id, :product_id, :bom_id, :qty, :date, :wc_id, :priority, :notes)
        `, { replacements: { plan_id: plan[0].id, product_id: item.product_id, bom_id: item.bom_id || null, qty: item.planned_quantity, date: item.scheduled_date || null, wc_id: item.work_center_id || null, priority: item.priority || 'normal', notes: item.notes || null }, transaction: t });
      }
    }

    await t.commit();
    return res.status(201).json(successResponse(plan[0], undefined, 'Production plan created'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Generate Work Orders from Plan
async function generateWOFromPlan(req: NextApiRequest, res: NextApiResponse) {
  const { plan_id } = req.body;
  if (!plan_id) return res.status(400).json(errorResponse('MISSING_ID', 'Plan ID required'));

  const t = await sequelize.transaction();
  try {
    const [items] = await sequelize.query(`
      SELECT pi.*, p.name as product_name, b.id as active_bom_id, b.routing_id
      FROM mfg_production_plan_items pi
      LEFT JOIN products p ON pi.product_id = p.id
      LEFT JOIN mfg_bom b ON pi.bom_id = b.id OR (b.product_id = pi.product_id AND b.status = 'active')
      WHERE pi.plan_id = :plan_id AND pi.work_order_id IS NULL
    `, { replacements: { plan_id }, transaction: t });

    const created: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_work_orders WHERE created_at >= DATE_TRUNC('month', NOW())`, { transaction: t });
      const seq = String(parseInt(seqResult[0]?.seq || 1) + i).padStart(4, '0');
      const now = new Date();
      const woNumber = `WO-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${seq}`;

      const [wo] = await sequelize.query(`
        INSERT INTO mfg_work_orders (tenant_id, wo_number, product_id, bom_id, routing_id, planned_quantity, planned_start, work_center_id, priority, source_type, source_id, status)
        SELECT ten.id, :wo_number, :product_id, :bom_id, :routing_id, :qty, :date, :wc_id, :priority, 'mrp', :plan_id, 'planned'
        FROM tenants ten LIMIT 1
        RETURNING id
      `, { replacements: { wo_number: woNumber, product_id: item.product_id, bom_id: item.active_bom_id || item.bom_id || null, routing_id: item.routing_id || null, qty: item.planned_quantity, date: item.scheduled_date || null, wc_id: item.work_center_id || null, priority: item.priority || 'normal', plan_id }, transaction: t });

      await sequelize.query(`UPDATE mfg_production_plan_items SET work_order_id = :wo_id, status = 'generated' WHERE id = :item_id`, { replacements: { wo_id: wo[0].id, item_id: item.id }, transaction: t });
      created.push(wo[0].id);
    }

    await sequelize.query(`UPDATE mfg_production_plans SET status = 'in_progress', updated_at = NOW() WHERE id = :plan_id`, { replacements: { plan_id }, transaction: t });

    await t.commit();
    return res.status(200).json(successResponse({ generated: created.length, workOrderIds: created }, undefined, `${created.length} Work Orders generated`));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

// Record Waste
async function recordWaste(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, product_id, waste_type, quantity, uom, reason, category, cost_impact, disposal_method, work_center_id, operation_id } = req.body;
  if (!quantity || !waste_type) return res.status(400).json(errorResponse('VALIDATION', 'Quantity and waste type required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_waste_records (tenant_id, work_order_id, product_id, waste_type, quantity, uom, reason, category, cost_impact, disposal_method, work_center_id, operation_id)
    SELECT t.id, :wo_id, :product_id, :type, :qty, :uom, :reason, :category, :cost, :disposal, :wc_id, :op_id
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { wo_id: work_order_id || null, product_id: product_id || null, type: waste_type, qty: quantity, uom: uom || 'pcs', reason: reason || null, category: category || null, cost: cost_impact || 0, disposal: disposal_method || null, wc_id: work_center_id || null, op_id: operation_id || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Waste recorded'));
}

// Record Shift Production
async function recordShiftProduction(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, work_center_id, machine_id, shift_date, shift_name, operator_id, start_time, end_time, planned_output, actual_output, good_output, reject_count, downtime_minutes, downtime_reason, notes } = req.body;
  if (!shift_date || !shift_name) return res.status(400).json(errorResponse('VALIDATION', 'Shift date and name required'));

  // Calculate OEE
  const totalMinutes = start_time && end_time ? (new Date(end_time).getTime() - new Date(start_time).getTime()) / 60000 : 480;
  const availableMinutes = totalMinutes - (downtime_minutes || 0);
  const availability = totalMinutes > 0 ? (availableMinutes / totalMinutes) * 100 : 0;
  const performance = planned_output > 0 ? ((actual_output || 0) / planned_output) * 100 : 0;
  const quality = actual_output > 0 ? ((good_output || actual_output || 0) / (actual_output || 1)) * 100 : 0;
  const oee = (availability * performance * quality) / 10000;

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_shift_productions (tenant_id, work_order_id, work_center_id, machine_id, shift_date, shift_name, operator_id, start_time, end_time, planned_output, actual_output, good_output, reject_count, downtime_minutes, downtime_reason, oee_availability, oee_performance, oee_quality, oee_overall, notes)
    SELECT t.id, :wo_id, :wc_id, :machine_id, :date, :shift, :operator, :start, :end, :planned, :actual, :good, :reject, :downtime, :reason, :avail, :perf, :qual, :oee, :notes
    FROM tenants t LIMIT 1
    RETURNING *
  `, { replacements: { wo_id: work_order_id || null, wc_id: work_center_id || null, machine_id: machine_id || null, date: shift_date, shift: shift_name, operator: operator_id || null, start: start_time || null, end: end_time || null, planned: planned_output || 0, actual: actual_output || 0, good: good_output || actual_output || 0, reject: reject_count || 0, downtime: downtime_minutes || 0, reason: downtime_reason || null, avail: availability, perf: performance, qual: quality, oee, notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Shift production recorded'));
}

// ==========================================
// PUT HANDLERS
// ==========================================
async function handlePut(req: NextApiRequest, res: NextApiResponse, action: string) {
  const { id, ...updates } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ID required'));

  const tableMap: Record<string, string> = {
    'work-center': 'mfg_work_centers',
    'bom': 'mfg_bom',
    'routing': 'mfg_routings',
    'work-order': 'mfg_work_orders',
    'qc-template': 'mfg_qc_templates',
    'machine': 'mfg_machines',
    'maintenance': 'mfg_maintenance_records',
    'production-plan': 'mfg_production_plans',
    'settings': 'mfg_settings',
  };

  const table = tableMap[action];
  if (!table) return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown PUT action: ${action}`));

  const allowedFields: Record<string, string[]> = {
    'mfg_work_centers': ['name', 'description', 'type', 'capacity_per_hour', 'operating_cost_per_hour', 'setup_time_minutes', 'status', 'location', 'branch_id', 'manager_id', 'efficiency_target'],
    'mfg_bom': ['bom_name', 'status', 'bom_type', 'effective_date', 'expiry_date', 'base_quantity', 'base_uom', 'yield_percentage', 'routing_id', 'notes', 'approved_by'],
    'mfg_routings': ['routing_name', 'status', 'total_time_minutes', 'notes'],
    'mfg_work_orders': ['status', 'priority', 'planned_start', 'planned_end', 'work_center_id', 'assigned_to', 'notes', 'approved_by'],
    'mfg_qc_templates': ['template_name', 'inspection_type', 'product_category', 'parameters', 'sampling_method', 'description', 'status'],
    'mfg_machines': ['machine_name', 'type', 'manufacturer', 'model', 'status', 'location', 'work_center_id', 'maintenance_interval_hours', 'cost_per_hour', 'operating_hours', 'notes'],
    'mfg_maintenance_records': ['status', 'started_at', 'completed_at', 'performed_by', 'cost', 'parts_used', 'parts_cost', 'labor_cost', 'downtime_hours', 'root_cause', 'findings', 'recommendations', 'notes'],
    'mfg_production_plans': ['plan_name', 'status', 'notes', 'approved_by'],
    'mfg_settings': ['setting_value'],
  };

  const fields = allowedFields[table] || [];
  const setClauses: string[] = [];
  const replacements: any = { id };

  for (const key of Object.keys(updates)) {
    if (fields.includes(key)) {
      setClauses.push(`${key} = :${key}`);
      replacements[key] = typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key];
    }
  }

  if (setClauses.length === 0) return res.status(400).json(errorResponse('NO_UPDATES', 'No valid fields to update'));

  setClauses.push('updated_at = NOW()');

  // Handle special status transitions
  if (updates.status === 'active' && action === 'bom') {
    setClauses.push('approved_at = NOW()');
  }
  if (updates.status === 'completed' && action === 'maintenance') {
    await sequelize.query(`
      UPDATE mfg_machines SET last_maintenance_date = NOW(), next_maintenance_date = NOW() + (maintenance_interval_hours || ' hours')::INTERVAL, operating_hours = 0, updated_at = NOW()
      WHERE id = (SELECT machine_id FROM mfg_maintenance_records WHERE id = :id)
    `, { replacements: { id } });
  }

  await sequelize.query(`UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = :id`, { replacements });
  return res.status(200).json(successResponse({ id }, undefined, 'Updated successfully'));
}

// ==========================================
// DELETE HANDLERS
// ==========================================
async function handleDelete(req: NextApiRequest, res: NextApiResponse, action: string) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ID required'));

  const tableMap: Record<string, string> = {
    'work-center': 'mfg_work_centers',
    'bom': 'mfg_bom',
    'routing': 'mfg_routings',
    'work-order': 'mfg_work_orders',
    'qc-template': 'mfg_qc_templates',
    'qc-inspection': 'mfg_qc_inspections',
    'machine': 'mfg_machines',
    'maintenance': 'mfg_maintenance_records',
    'production-plan': 'mfg_production_plans',
    'waste': 'mfg_waste_records',
  };

  const table = tableMap[action];
  if (!table) return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown DELETE action: ${action}`));

  await sequelize.query(`DELETE FROM ${table} WHERE id = :id`, { replacements: { id } });
  return res.status(200).json(successResponse({ id }, undefined, 'Deleted successfully'));
}
