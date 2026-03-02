import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse } from '../../../../lib/api/response';

const sequelize = require('../../../../lib/sequelize');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'GET only'));

  const action = (req.query.action as string) || 'analytics';

  try {
    switch (action) {
      case 'analytics': return getAnalytics(req, res);
      case 'oee-dashboard': return getOEEDashboard(req, res);
      case 'production-summary': return getProductionSummary(req, res);
      case 'cost-analysis': return getCostAnalysis(req, res);
      case 'quality-analytics': return getQualityAnalytics(req, res);
      case 'machine-utilization': return getMachineUtilization(req, res);
      case 'waste-analysis': return getWasteAnalysis(req, res);
      case 'capacity-planning': return getCapacityPlanning(req, res);
      case 'kpi-scorecard': return getKPIScorecard(req, res);
      default:
        return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown action: ${action}`));
    }
  } catch (error: any) {
    console.error(`[MFG Enhanced] Error (${action}):`, error.message);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
}

// Comprehensive Analytics
async function getAnalytics(req: NextApiRequest, res: NextApiResponse) {
  const period = (req.query.period as string) || '30d';
  const interval = period === '7d' ? '7 days' : period === '90d' ? '90 days' : '30 days';

  const [production] = await sequelize.query(`
    SELECT 
      COUNT(*) as total_wo,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
      COALESCE(SUM(planned_quantity), 0) as total_planned,
      COALESCE(SUM(actual_quantity), 0) as total_produced,
      COALESCE(SUM(rejected_quantity), 0) as total_rejected,
      COALESCE(SUM(estimated_cost), 0) as total_estimated_cost,
      COALESCE(SUM(actual_cost), 0) as total_actual_cost,
      COALESCE(AVG(yield_percentage) FILTER (WHERE status = 'completed'), 0) as avg_yield,
      COALESCE(AVG(EXTRACT(EPOCH FROM (actual_end - actual_start)) / 3600) FILTER (WHERE status = 'completed'), 0) as avg_production_hours
    FROM mfg_work_orders
    WHERE created_at >= NOW() - :interval::INTERVAL
  `, { replacements: { interval } });

  const [trendData] = await sequelize.query(`
    SELECT 
      TO_CHAR(DATE_TRUNC('day', actual_end), 'YYYY-MM-DD') as date,
      COUNT(*) as orders_completed,
      COALESCE(SUM(actual_quantity), 0) as quantity_produced,
      COALESCE(SUM(actual_cost), 0) as total_cost,
      COALESCE(AVG(yield_percentage), 0) as avg_yield
    FROM mfg_work_orders
    WHERE status = 'completed' AND actual_end >= NOW() - :interval::INTERVAL
    GROUP BY DATE_TRUNC('day', actual_end)
    ORDER BY date
  `, { replacements: { interval } });

  const [topProducts] = await sequelize.query(`
    SELECT p.name as product_name, p.sku,
      COUNT(*) as wo_count,
      COALESCE(SUM(wo.actual_quantity), 0) as total_produced,
      COALESCE(AVG(wo.yield_percentage), 0) as avg_yield,
      COALESCE(SUM(wo.actual_cost), 0) as total_cost
    FROM mfg_work_orders wo
    JOIN products p ON wo.product_id = p.id
    WHERE wo.status = 'completed' AND wo.actual_end >= NOW() - :interval::INTERVAL
    GROUP BY p.id, p.name, p.sku
    ORDER BY total_produced DESC
    LIMIT 10
  `, { replacements: { interval } });

  const [workCenterLoad] = await sequelize.query(`
    SELECT wc.name, wc.code,
      COUNT(*) FILTER (WHERE wo.status = 'in_progress') as active_orders,
      COUNT(*) FILTER (WHERE wo.status = 'planned' OR wo.status = 'released') as queued_orders,
      COALESCE(SUM(wo.actual_quantity) FILTER (WHERE wo.status = 'completed'), 0) as total_output
    FROM mfg_work_centers wc
    LEFT JOIN mfg_work_orders wo ON wo.work_center_id = wc.id AND wo.created_at >= NOW() - :interval::INTERVAL
    WHERE wc.status = 'active'
    GROUP BY wc.id, wc.name, wc.code
    ORDER BY active_orders DESC
  `, { replacements: { interval } });

  return res.status(200).json(successResponse({
    production: production[0] || {},
    trend: trendData,
    topProducts,
    workCenterLoad
  }));
}

// OEE Dashboard
async function getOEEDashboard(req: NextApiRequest, res: NextApiResponse) {
  const [oeeByWorkCenter] = await sequelize.query(`
    SELECT wc.name as work_center, wc.code,
      COALESCE(AVG(sp.oee_availability), 0) as avg_availability,
      COALESCE(AVG(sp.oee_performance), 0) as avg_performance,
      COALESCE(AVG(sp.oee_quality), 0) as avg_quality,
      COALESCE(AVG(sp.oee_overall), 0) as avg_oee,
      COALESCE(SUM(sp.actual_output), 0) as total_output,
      COALESCE(SUM(sp.reject_count), 0) as total_rejects,
      COALESCE(SUM(sp.downtime_minutes), 0) as total_downtime
    FROM mfg_work_centers wc
    LEFT JOIN mfg_shift_productions sp ON sp.work_center_id = wc.id AND sp.shift_date >= NOW() - INTERVAL '30 days'
    WHERE wc.status = 'active'
    GROUP BY wc.id, wc.name, wc.code
    ORDER BY avg_oee DESC
  `);

  const [oeeByShift] = await sequelize.query(`
    SELECT shift_name,
      COALESCE(AVG(oee_availability), 0) as avg_availability,
      COALESCE(AVG(oee_performance), 0) as avg_performance,
      COALESCE(AVG(oee_quality), 0) as avg_quality,
      COALESCE(AVG(oee_overall), 0) as avg_oee,
      COUNT(*) as shift_count
    FROM mfg_shift_productions
    WHERE shift_date >= NOW() - INTERVAL '30 days'
    GROUP BY shift_name
    ORDER BY avg_oee DESC
  `);

  const [oeeTrend] = await sequelize.query(`
    SELECT TO_CHAR(shift_date, 'YYYY-MM-DD') as date,
      COALESCE(AVG(oee_overall), 0) as oee,
      COALESCE(AVG(oee_availability), 0) as availability,
      COALESCE(AVG(oee_performance), 0) as performance,
      COALESCE(AVG(oee_quality), 0) as quality
    FROM mfg_shift_productions
    WHERE shift_date >= NOW() - INTERVAL '30 days'
    GROUP BY shift_date
    ORDER BY date
  `);

  const [overallOEE] = await sequelize.query(`
    SELECT 
      COALESCE(AVG(oee_availability), 0) as availability,
      COALESCE(AVG(oee_performance), 0) as performance,
      COALESCE(AVG(oee_quality), 0) as quality,
      COALESCE(AVG(oee_overall), 0) as overall
    FROM mfg_shift_productions
    WHERE shift_date >= NOW() - INTERVAL '30 days'
  `);

  return res.status(200).json(successResponse({
    overall: overallOEE[0] || { availability: 0, performance: 0, quality: 0, overall: 0 },
    byWorkCenter: oeeByWorkCenter,
    byShift: oeeByShift,
    trend: oeeTrend
  }));
}

// Production Summary
async function getProductionSummary(req: NextApiRequest, res: NextApiResponse) {
  const [byStatus] = await sequelize.query(`
    SELECT status, COUNT(*) as count, COALESCE(SUM(planned_quantity), 0) as planned_qty, COALESCE(SUM(actual_quantity), 0) as actual_qty
    FROM mfg_work_orders GROUP BY status ORDER BY count DESC
  `);

  const [byPriority] = await sequelize.query(`
    SELECT priority, COUNT(*) as count FROM mfg_work_orders WHERE status NOT IN ('completed', 'cancelled') GROUP BY priority
  `);

  const [byWorkCenter] = await sequelize.query(`
    SELECT wc.name, COUNT(*) as active_wo, COALESCE(SUM(wo.planned_quantity), 0) as total_qty
    FROM mfg_work_orders wo JOIN mfg_work_centers wc ON wo.work_center_id = wc.id
    WHERE wo.status IN ('in_progress', 'planned', 'released') GROUP BY wc.name ORDER BY active_wo DESC
  `);

  const [upcoming] = await sequelize.query(`
    SELECT wo.*, p.name as product_name, wc.name as work_center_name
    FROM mfg_work_orders wo
    LEFT JOIN products p ON wo.product_id = p.id
    LEFT JOIN mfg_work_centers wc ON wo.work_center_id = wc.id
    WHERE wo.status IN ('planned', 'released') AND wo.planned_start >= NOW()
    ORDER BY wo.planned_start ASC LIMIT 15
  `);

  return res.status(200).json(successResponse({ byStatus, byPriority, byWorkCenter, upcoming }));
}

// Cost Analysis
async function getCostAnalysis(req: NextApiRequest, res: NextApiResponse) {
  const [costByType] = await sequelize.query(`
    SELECT cost_type,
      COALESCE(SUM(planned_amount), 0) as total_planned,
      COALESCE(SUM(actual_amount), 0) as total_actual,
      COALESCE(SUM(variance), 0) as total_variance
    FROM mfg_production_costs
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY cost_type ORDER BY total_actual DESC
  `);

  const [costByProduct] = await sequelize.query(`
    SELECT p.name as product_name,
      COALESCE(SUM(pc.actual_amount), 0) as total_cost,
      COUNT(DISTINCT wo.id) as wo_count,
      COALESCE(SUM(wo.actual_quantity), 0) as total_qty,
      CASE WHEN SUM(wo.actual_quantity) > 0 THEN SUM(pc.actual_amount) / SUM(wo.actual_quantity) ELSE 0 END as unit_cost
    FROM mfg_production_costs pc
    JOIN mfg_work_orders wo ON pc.work_order_id = wo.id
    JOIN products p ON wo.product_id = p.id
    WHERE pc.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name ORDER BY total_cost DESC LIMIT 10
  `);

  const [costTrend] = await sequelize.query(`
    SELECT TO_CHAR(DATE_TRUNC('week', pc.created_at), 'YYYY-MM-DD') as week,
      COALESCE(SUM(pc.actual_amount), 0) as total_cost,
      cost_type
    FROM mfg_production_costs pc
    WHERE pc.created_at >= NOW() - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('week', pc.created_at), cost_type
    ORDER BY week
  `);

  const [varianceAnalysis] = await sequelize.query(`
    SELECT wo.wo_number, p.name as product_name,
      COALESCE(SUM(pc.planned_amount), 0) as planned,
      COALESCE(SUM(pc.actual_amount), 0) as actual,
      COALESCE(SUM(pc.variance), 0) as variance,
      CASE WHEN SUM(pc.planned_amount) > 0 THEN (SUM(pc.variance) / SUM(pc.planned_amount)) * 100 ELSE 0 END as variance_pct
    FROM mfg_production_costs pc
    JOIN mfg_work_orders wo ON pc.work_order_id = wo.id
    JOIN products p ON wo.product_id = p.id
    WHERE wo.status = 'completed' AND wo.completed_at >= NOW() - INTERVAL '30 days'
    GROUP BY wo.id, wo.wo_number, p.name
    HAVING ABS(SUM(pc.variance)) > 0
    ORDER BY ABS(SUM(pc.variance)) DESC LIMIT 10
  `);

  return res.status(200).json(successResponse({ costByType, costByProduct, costTrend, varianceAnalysis }));
}

// Quality Analytics
async function getQualityAnalytics(req: NextApiRequest, res: NextApiResponse) {
  const [overview] = await sequelize.query(`
    SELECT 
      COUNT(*) as total_inspections,
      COUNT(*) FILTER (WHERE overall_result = 'passed') as passed,
      COUNT(*) FILTER (WHERE overall_result = 'failed') as failed,
      COUNT(*) FILTER (WHERE overall_result = 'conditional') as conditional,
      COALESCE(AVG(defect_rate), 0) as avg_defect_rate,
      COALESCE(SUM(defects_found), 0) as total_defects
    FROM mfg_qc_inspections
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const [defectsByType] = await sequelize.query(`
    SELECT qi.inspection_type, COUNT(*) as count,
      COUNT(*) FILTER (WHERE qi.overall_result = 'failed') as failures,
      COALESCE(AVG(qi.defect_rate), 0) as avg_defect_rate
    FROM mfg_qc_inspections qi
    WHERE qi.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY qi.inspection_type
  `);

  const [topDefects] = await sequelize.query(`
    SELECT qr.parameter_name, COUNT(*) as fail_count, qr.severity
    FROM mfg_qc_results qr
    JOIN mfg_qc_inspections qi ON qr.inspection_id = qi.id
    WHERE qr.result = 'fail' AND qi.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY qr.parameter_name, qr.severity
    ORDER BY fail_count DESC LIMIT 10
  `);

  const [qualityTrend] = await sequelize.query(`
    SELECT TO_CHAR(DATE_TRUNC('day', inspection_date), 'YYYY-MM-DD') as date,
      COUNT(*) as inspections,
      COALESCE(AVG(defect_rate), 0) as defect_rate,
      COUNT(*) FILTER (WHERE overall_result = 'passed') as passed
    FROM mfg_qc_inspections
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', inspection_date)
    ORDER BY date
  `);

  return res.status(200).json(successResponse({ overview: overview[0], defectsByType, topDefects, qualityTrend }));
}

// Machine Utilization
async function getMachineUtilization(req: NextApiRequest, res: NextApiResponse) {
  const [machines] = await sequelize.query(`
    SELECT m.*, wc.name as work_center_name,
      (SELECT COUNT(*) FROM mfg_maintenance_records mr WHERE mr.machine_id = m.id AND mr.status = 'scheduled' AND mr.scheduled_date <= NOW() + INTERVAL '7 days') as upcoming_maintenance,
      (SELECT COALESCE(SUM(sp.actual_output), 0) FROM mfg_shift_productions sp WHERE sp.machine_id = m.id AND sp.shift_date >= NOW() - INTERVAL '30 days') as monthly_output,
      (SELECT COALESCE(SUM(sp.downtime_minutes), 0) FROM mfg_shift_productions sp WHERE sp.machine_id = m.id AND sp.shift_date >= NOW() - INTERVAL '30 days') as monthly_downtime,
      (SELECT COALESCE(AVG(sp.oee_overall), 0) FROM mfg_shift_productions sp WHERE sp.machine_id = m.id AND sp.shift_date >= NOW() - INTERVAL '30 days') as avg_oee
    FROM mfg_machines m
    LEFT JOIN mfg_work_centers wc ON m.work_center_id = wc.id
    ORDER BY m.machine_name
  `);

  const [statusBreakdown] = await sequelize.query(`
    SELECT status, COUNT(*) as count FROM mfg_machines GROUP BY status
  `);

  const [maintenanceDue] = await sequelize.query(`
    SELECT m.machine_name, m.machine_code, m.next_maintenance_date, m.operating_hours, m.maintenance_interval_hours,
      CASE WHEN m.next_maintenance_date <= NOW() THEN 'overdue'
           WHEN m.next_maintenance_date <= NOW() + INTERVAL '7 days' THEN 'upcoming'
           ELSE 'ok' END as maintenance_status
    FROM mfg_machines m
    WHERE m.status = 'operational' AND m.next_maintenance_date IS NOT NULL
    ORDER BY m.next_maintenance_date ASC LIMIT 10
  `);

  return res.status(200).json(successResponse({ machines, statusBreakdown, maintenanceDue }));
}

// Waste Analysis
async function getWasteAnalysis(req: NextApiRequest, res: NextApiResponse) {
  const [byType] = await sequelize.query(`
    SELECT waste_type, COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM(cost_impact), 0) as total_cost
    FROM mfg_waste_records WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY waste_type ORDER BY total_cost DESC
  `);

  const [byProduct] = await sequelize.query(`
    SELECT p.name, COALESCE(SUM(wr.quantity), 0) as total_waste, COALESCE(SUM(wr.cost_impact), 0) as cost_impact
    FROM mfg_waste_records wr JOIN products p ON wr.product_id = p.id
    WHERE wr.created_at >= NOW() - INTERVAL '30 days' GROUP BY p.name ORDER BY total_waste DESC LIMIT 10
  `);

  const [byWorkCenter] = await sequelize.query(`
    SELECT wc.name, COALESCE(SUM(wr.quantity), 0) as total_waste, COALESCE(SUM(wr.cost_impact), 0) as cost_impact
    FROM mfg_waste_records wr JOIN mfg_work_centers wc ON wr.work_center_id = wc.id
    WHERE wr.created_at >= NOW() - INTERVAL '30 days' GROUP BY wc.name ORDER BY total_waste DESC
  `);

  const [wasteTrend] = await sequelize.query(`
    SELECT TO_CHAR(DATE_TRUNC('day', recorded_at), 'YYYY-MM-DD') as date,
      COALESCE(SUM(quantity), 0) as total_waste, COALESCE(SUM(cost_impact), 0) as total_cost
    FROM mfg_waste_records WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', recorded_at) ORDER BY date
  `);

  const [totalCost] = await sequelize.query(`
    SELECT COALESCE(SUM(cost_impact), 0) as total FROM mfg_waste_records WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  return res.status(200).json(successResponse({ byType, byProduct, byWorkCenter, wasteTrend, totalCost: totalCost[0]?.total || 0 }));
}

// Capacity Planning
async function getCapacityPlanning(req: NextApiRequest, res: NextApiResponse) {
  const [workCenterCapacity] = await sequelize.query(`
    SELECT wc.name, wc.code, wc.capacity_per_hour, wc.shift_count, wc.efficiency_target,
      (wc.capacity_per_hour * 8 * wc.shift_count) as daily_capacity,
      (SELECT COALESCE(SUM(wo.planned_quantity), 0) FROM mfg_work_orders wo WHERE wo.work_center_id = wc.id AND wo.status IN ('planned', 'released', 'in_progress') AND wo.planned_start >= NOW() AND wo.planned_start < NOW() + INTERVAL '7 days') as next_week_load,
      (SELECT COUNT(*) FROM mfg_work_orders wo WHERE wo.work_center_id = wc.id AND wo.status IN ('planned', 'released', 'in_progress')) as active_orders
    FROM mfg_work_centers wc WHERE wc.status = 'active' ORDER BY wc.name
  `);

  const [materialRequirements] = await sequelize.query(`
    SELECT p.name as material_name, p.sku, SUM(wm.planned_quantity - wm.issued_quantity) as required_qty, wm.uom,
      (SELECT COALESCE(SUM(is2.quantity), 0) FROM inventory_stock is2 WHERE is2.product_id = p.id) as available_stock
    FROM mfg_wo_materials wm
    JOIN mfg_work_orders wo ON wm.work_order_id = wo.id
    JOIN products p ON wm.product_id = p.id
    WHERE wo.status IN ('planned', 'released') AND wm.status = 'pending'
    GROUP BY p.id, p.name, p.sku, wm.uom
    HAVING SUM(wm.planned_quantity - wm.issued_quantity) > 0
    ORDER BY required_qty DESC
  `);

  return res.status(200).json(successResponse({ workCenterCapacity, materialRequirements }));
}

// KPI Scorecard
async function getKPIScorecard(req: NextApiRequest, res: NextApiResponse) {
  const [productionKPI] = await sequelize.query(`
    SELECT 
      COALESCE(AVG(yield_percentage) FILTER (WHERE status = 'completed'), 0) as avg_yield,
      CASE WHEN COUNT(*) FILTER (WHERE status = 'completed') > 0 
        THEN COUNT(*) FILTER (WHERE status = 'completed' AND actual_end <= planned_end)::DECIMAL / COUNT(*) FILTER (WHERE status = 'completed') * 100 
        ELSE 0 END as on_time_completion,
      CASE WHEN SUM(planned_quantity) > 0 THEN (SUM(actual_quantity) / SUM(planned_quantity)) * 100 ELSE 0 END as plan_achievement,
      COALESCE(AVG(EXTRACT(EPOCH FROM (actual_end - actual_start)) / 3600) FILTER (WHERE status = 'completed'), 0) as avg_cycle_time_hours
    FROM mfg_work_orders WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const [qualityKPI] = await sequelize.query(`
    SELECT 
      COALESCE(AVG(defect_rate), 0) as avg_defect_rate,
      CASE WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE overall_result = 'passed')::DECIMAL / COUNT(*) * 100 ELSE 0 END as first_pass_yield,
      COALESCE(SUM(defects_found), 0) as total_defects
    FROM mfg_qc_inspections WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const [oeeKPI] = await sequelize.query(`
    SELECT 
      COALESCE(AVG(oee_availability), 0) as availability,
      COALESCE(AVG(oee_performance), 0) as performance,
      COALESCE(AVG(oee_quality), 0) as quality,
      COALESCE(AVG(oee_overall), 0) as overall_oee
    FROM mfg_shift_productions WHERE shift_date >= NOW() - INTERVAL '30 days'
  `);

  const [costKPI] = await sequelize.query(`
    SELECT 
      COALESCE(SUM(actual_amount), 0) as total_production_cost,
      COALESCE(SUM(variance), 0) as total_variance,
      CASE WHEN SUM(planned_amount) > 0 THEN (SUM(variance) / SUM(planned_amount)) * 100 ELSE 0 END as variance_percentage
    FROM mfg_production_costs WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const [wasteKPI] = await sequelize.query(`
    SELECT COALESCE(SUM(cost_impact), 0) as total_waste_cost, COUNT(*) as waste_incidents
    FROM mfg_waste_records WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  return res.status(200).json(successResponse({
    production: productionKPI[0] || {},
    quality: qualityKPI[0] || {},
    oee: oeeKPI[0] || {},
    cost: costKPI[0] || {},
    waste: wasteKPI[0] || {}
  }));
}
