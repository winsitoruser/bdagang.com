import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse } from '../../../../lib/api/response';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';

const sequelize = require('../../../../lib/sequelize');

/**
 * Manufacturing Advanced API
 * PLM, Maintenance Scheduling, COGM, Subcontracting, IoT, Barcode
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const action = (req.query.action as string) || '';

  try {
    switch (method) {
      case 'GET': return await handleGet(req, res, action);
      case 'POST': return await handlePost(req, res, action);
      case 'PUT': return await handlePut(req, res, action);
      case 'DELETE': return await handleDelete(req, res, action);
      default:
        return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'));
    }
  } catch (error: any) {
    console.error(`[MFG Advanced] Error (${action}):`, error.message);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
}

export default withHQAuth(handler);

// ==========================================
// GET
// ==========================================
async function handleGet(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    // PLM
    case 'plm-products': return getPLMProducts(req, res);
    case 'plm-product-detail': return getPLMProductDetail(req, res);
    case 'plm-design-changes': return getDesignChanges(req, res);
    case 'plm-documents': return getPLMDocuments(req, res);

    // Maintenance
    case 'maintenance-schedules': return getMaintenanceSchedules(req, res);
    case 'maintenance-dashboard': return getMaintenanceDashboard(req, res);
    case 'calibrations': return getCalibrations(req, res);
    case 'machine-health': return getMachineHealth(req, res);

    // COGM
    case 'cogm-periods': return getCOGMPeriods(req, res);
    case 'cogm-detail': return getCOGMDetail(req, res);
    case 'cogm-dashboard': return getCOGMDashboard(req, res);
    case 'overhead-rates': return getOverheadRates(req, res);
    case 'labor-rates': return getLaborRates(req, res);

    // Subcontracting
    case 'subcontracts': return getSubcontracts(req, res);
    case 'subcontract-detail': return getSubcontractDetail(req, res);

    // IoT
    case 'iot-devices': return getIoTDevices(req, res);
    case 'iot-readings': return getIoTReadings(req, res);
    case 'iot-dashboard': return getIoTDashboard(req, res);

    // Barcode
    case 'barcode-scans': return getBarcodeScans(req, res);

    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown GET action: ${action}`));
  }
}

// ==========================================
// POST
// ==========================================
async function handlePost(req: NextApiRequest, res: NextApiResponse, action: string) {
  switch (action) {
    // PLM
    case 'plm-product': return createPLMProduct(req, res);
    case 'plm-design-change': return createDesignChange(req, res);
    case 'plm-document': return createPLMDocument(req, res);
    case 'plm-approve-eco': return approveECO(req, res);

    // Maintenance
    case 'maintenance-schedule': return createMaintenanceSchedule(req, res);
    case 'calibration': return createCalibration(req, res);
    case 'generate-maintenance': return generateMaintenanceFromSchedule(req, res);

    // COGM
    case 'cogm-calculate': return calculateCOGM(req, res);
    case 'cogm-lock': return lockCOGMPeriod(req, res);
    case 'overhead-rate': return createOverheadRate(req, res);
    case 'labor-rate': return createLaborRate(req, res);

    // Subcontracting
    case 'subcontract': return createSubcontract(req, res);
    case 'subcontract-send': return sendSubcontract(req, res);
    case 'subcontract-receive': return receiveSubcontract(req, res);

    // IoT
    case 'iot-device': return createIoTDevice(req, res);
    case 'iot-reading': return recordIoTReading(req, res);

    // Barcode
    case 'barcode-scan': return recordBarcodeScan(req, res);

    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown POST action: ${action}`));
  }
}

// ==========================================
// PLM - Product Lifecycle Management
// ==========================================
async function getPLMProducts(req: NextApiRequest, res: NextApiResponse) {
  const { stage, search } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (stage && stage !== 'all') { where += ' AND plm.lifecycle_stage = :stage'; replacements.stage = stage; }
  if (search) { where += ' AND (plm.plm_code ILIKE :search OR p.name ILIKE :search)'; replacements.search = `%${search}%`; }

  const [rows] = await sequelize.query(`
    SELECT plm.*, p.name as product_name, p.sku as product_sku, e.name as design_owner_name,
      (SELECT COUNT(*) FROM mfg_plm_design_changes dc WHERE dc.plm_product_id = plm.id) as change_count,
      (SELECT COUNT(*) FROM mfg_plm_documents doc WHERE doc.plm_product_id = plm.id) as document_count
    FROM mfg_plm_products plm
    LEFT JOIN products p ON plm.product_id = p.id
    LEFT JOIN employees e ON plm.design_owner = e.id
    ${where}
    ORDER BY plm.updated_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function getPLMProductDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'PLM Product ID required'));

  const [plm] = await sequelize.query(`
    SELECT plm.*, p.name as product_name, p.sku, e.name as design_owner_name
    FROM mfg_plm_products plm LEFT JOIN products p ON plm.product_id = p.id LEFT JOIN employees e ON plm.design_owner = e.id
    WHERE plm.id = :id
  `, { replacements: { id } });
  if (!plm[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'PLM Product not found'));

  const [changes] = await sequelize.query(`
    SELECT dc.*, e1.name as requested_by_name, e2.name as approved_by_name
    FROM mfg_plm_design_changes dc LEFT JOIN employees e1 ON dc.requested_by = e1.id LEFT JOIN employees e2 ON dc.approved_by = e2.id
    WHERE dc.plm_product_id = :id ORDER BY dc.created_at DESC
  `, { replacements: { id } });

  const [docs] = await sequelize.query(`SELECT * FROM mfg_plm_documents WHERE plm_product_id = :id ORDER BY created_at DESC`, { replacements: { id } });

  return res.status(200).json(successResponse({ ...plm[0], designChanges: changes, documents: docs }));
}

async function getDesignChanges(req: NextApiRequest, res: NextApiResponse) {
  const { status, plm_product_id } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (status && status !== 'all') { where += ' AND dc.status = :status'; replacements.status = status; }
  if (plm_product_id) { where += ' AND dc.plm_product_id = :plm_id'; replacements.plm_id = plm_product_id; }

  const [rows] = await sequelize.query(`
    SELECT dc.*, plm.plm_code, p.name as product_name, e1.name as requested_by_name, e2.name as approved_by_name
    FROM mfg_plm_design_changes dc
    LEFT JOIN mfg_plm_products plm ON dc.plm_product_id = plm.id
    LEFT JOIN products p ON plm.product_id = p.id
    LEFT JOIN employees e1 ON dc.requested_by = e1.id
    LEFT JOIN employees e2 ON dc.approved_by = e2.id
    ${where} ORDER BY dc.created_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function getPLMDocuments(req: NextApiRequest, res: NextApiResponse) {
  const { plm_product_id, document_type } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (plm_product_id) { where += ' AND d.plm_product_id = :plm_id'; replacements.plm_id = plm_product_id; }
  if (document_type && document_type !== 'all') { where += ' AND d.document_type = :type'; replacements.type = document_type; }

  const [rows] = await sequelize.query(`
    SELECT d.*, e.name as uploaded_by_name FROM mfg_plm_documents d
    LEFT JOIN employees e ON d.uploaded_by = e.id ${where} ORDER BY d.created_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function createPLMProduct(req: NextApiRequest, res: NextApiResponse) {
  const { product_id, plm_code, lifecycle_stage, version, design_owner, team_members, target_launch_date, description, specifications, notes } = req.body;
  if (!plm_code) return res.status(400).json(errorResponse('VALIDATION', 'PLM code required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_plm_products (tenant_id, product_id, plm_code, lifecycle_stage, version, design_owner, team_members, target_launch_date, description, specifications, notes)
    SELECT t.id, :product_id, :code, :stage, :version, :owner, :team, :launch, :desc, :specs, :notes FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { product_id: product_id || null, code: plm_code, stage: lifecycle_stage || 'concept', version: version || '1.0', owner: design_owner || null, team: JSON.stringify(team_members || []), launch: target_launch_date || null, desc: description || null, specs: JSON.stringify(specifications || {}), notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'PLM product created'));
}

async function createDesignChange(req: NextApiRequest, res: NextApiResponse) {
  const { plm_product_id, title, change_type, priority, reason, description, impact_analysis, affected_boms, affected_routings, cost_impact } = req.body;
  if (!plm_product_id || !title) return res.status(400).json(errorResponse('VALIDATION', 'PLM product and title required'));

  const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_plm_design_changes WHERE created_at >= DATE_TRUNC('year', NOW())`);
  const seq = String(seqResult[0]?.seq || 1).padStart(4, '0');
  const ecoNo = `ECO-${new Date().getFullYear()}-${seq}`;

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_plm_design_changes (tenant_id, plm_product_id, eco_number, title, change_type, priority, reason, description, impact_analysis, affected_boms, affected_routings, cost_impact)
    SELECT t.id, :plm_id, :eco, :title, :type, :priority, :reason, :desc, :impact, :boms, :routings, :cost FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { plm_id: plm_product_id, eco: ecoNo, title, type: change_type || 'design', priority: priority || 'normal', reason: reason || null, desc: description || null, impact: impact_analysis || null, boms: JSON.stringify(affected_boms || []), routings: JSON.stringify(affected_routings || []), cost: cost_impact || 0 } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Engineering Change Order created'));
}

async function createPLMDocument(req: NextApiRequest, res: NextApiResponse) {
  const { plm_product_id, design_change_id, document_type, title, file_name, file_url, file_size, mime_type, version, description, tags } = req.body;
  if (!plm_product_id || !title) return res.status(400).json(errorResponse('VALIDATION', 'PLM product and title required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_plm_documents (plm_product_id, design_change_id, document_type, title, file_name, file_url, file_size, mime_type, version, description, tags)
    VALUES (:plm_id, :dc_id, :type, :title, :file_name, :file_url, :file_size, :mime, :version, :desc, :tags) RETURNING *
  `, { replacements: { plm_id: plm_product_id, dc_id: design_change_id || null, type: document_type || 'drawing', title, file_name: file_name || null, file_url: file_url || null, file_size: file_size || null, mime: mime_type || null, version: version || '1.0', desc: description || null, tags: JSON.stringify(tags || []) } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Document uploaded'));
}

async function approveECO(req: NextApiRequest, res: NextApiResponse) {
  const { id, action: ecoAction } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ECO ID required'));

  if (ecoAction === 'approve') {
    await sequelize.query(`UPDATE mfg_plm_design_changes SET status = 'approved', approved_at = NOW(), updated_at = NOW() WHERE id = :id AND status IN ('submitted','under_review')`, { replacements: { id } });
  } else if (ecoAction === 'reject') {
    await sequelize.query(`UPDATE mfg_plm_design_changes SET status = 'rejected', updated_at = NOW() WHERE id = :id AND status IN ('submitted','under_review')`, { replacements: { id } });
  } else if (ecoAction === 'implement') {
    await sequelize.query(`UPDATE mfg_plm_design_changes SET status = 'completed', implemented_at = NOW(), updated_at = NOW() WHERE id = :id AND status = 'approved'`, { replacements: { id } });
  }

  return res.status(200).json(successResponse({ id }, undefined, `ECO ${ecoAction}ed`));
}

// ==========================================
// MAINTENANCE SCHEDULING
// ==========================================
async function getMaintenanceSchedules(req: NextApiRequest, res: NextApiResponse) {
  const { machine_id } = req.query;
  let where = 'WHERE ms.is_active = true';
  const replacements: any = {};
  if (machine_id) { where += ' AND ms.machine_id = :machine_id'; replacements.machine_id = machine_id; }

  const [rows] = await sequelize.query(`
    SELECT ms.*, m.machine_name, m.machine_code, e.name as assigned_to_name,
      CASE WHEN ms.next_due_at <= NOW() THEN 'overdue'
           WHEN ms.next_due_at <= NOW() + INTERVAL '7 days' THEN 'upcoming'
           ELSE 'ok' END as due_status
    FROM mfg_maintenance_schedules ms
    LEFT JOIN mfg_machines m ON ms.machine_id = m.id
    LEFT JOIN employees e ON ms.assigned_to = e.id
    ${where} ORDER BY ms.next_due_at ASC NULLS LAST
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function getMaintenanceDashboard(req: NextApiRequest, res: NextApiResponse) {
  const [overdue] = await sequelize.query(`
    SELECT COUNT(*) as count FROM mfg_maintenance_schedules WHERE is_active = true AND next_due_at <= NOW()
  `);
  const [upcoming] = await sequelize.query(`
    SELECT COUNT(*) as count FROM mfg_maintenance_schedules WHERE is_active = true AND next_due_at > NOW() AND next_due_at <= NOW() + INTERVAL '7 days'
  `);
  const [recentRecords] = await sequelize.query(`
    SELECT mr.*, m.machine_name, m.machine_code FROM mfg_maintenance_records mr
    LEFT JOIN mfg_machines m ON mr.machine_id = m.id ORDER BY mr.created_at DESC LIMIT 10
  `);
  const [costSummary] = await sequelize.query(`
    SELECT COALESCE(SUM(cost + parts_cost + labor_cost), 0) as total_cost, COUNT(*) as total_records,
      COALESCE(SUM(downtime_hours), 0) as total_downtime
    FROM mfg_maintenance_records WHERE created_at >= NOW() - INTERVAL '30 days'
  `);
  const [calibrationsDue] = await sequelize.query(`
    SELECT COUNT(*) as count FROM mfg_calibration_records WHERE status IN ('scheduled','overdue') AND next_due_date <= NOW() + INTERVAL '14 days'
  `);
  const [machineBreakdown] = await sequelize.query(`
    SELECT m.status, COUNT(*) as count FROM mfg_machines m GROUP BY m.status
  `);

  return res.status(200).json(successResponse({
    overdue: parseInt(overdue[0]?.count || 0),
    upcoming: parseInt(upcoming[0]?.count || 0),
    recentRecords,
    costSummary: costSummary[0] || {},
    calibrationsDue: parseInt(calibrationsDue[0]?.count || 0),
    machineBreakdown
  }));
}

async function getCalibrations(req: NextApiRequest, res: NextApiResponse) {
  const { machine_id, status } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (machine_id) { where += ' AND cr.machine_id = :machine_id'; replacements.machine_id = machine_id; }
  if (status && status !== 'all') { where += ' AND cr.status = :status'; replacements.status = status; }

  const [rows] = await sequelize.query(`
    SELECT cr.*, m.machine_name, m.machine_code, e.name as performed_by_name
    FROM mfg_calibration_records cr
    LEFT JOIN mfg_machines m ON cr.machine_id = m.id
    LEFT JOIN employees e ON cr.performed_by = e.id
    ${where} ORDER BY cr.next_due_date ASC NULLS LAST
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function getMachineHealth(req: NextApiRequest, res: NextApiResponse) {
  const [machines] = await sequelize.query(`
    SELECT m.id, m.machine_name, m.machine_code, m.status, m.health_score, m.operating_hours,
      m.mtbf_hours, m.mttr_hours, m.failure_count, m.total_runs,
      m.last_maintenance_date, m.next_maintenance_date, m.last_sensor_reading, m.last_sensor_at,
      wc.name as work_center_name,
      (SELECT COUNT(*) FROM mfg_maintenance_records mr WHERE mr.machine_id = m.id AND mr.maintenance_type = 'corrective') as corrective_count,
      (SELECT COUNT(*) FROM mfg_maintenance_records mr WHERE mr.machine_id = m.id AND mr.maintenance_type = 'preventive') as preventive_count,
      (SELECT COUNT(*) FROM mfg_calibration_records cr WHERE cr.machine_id = m.id AND cr.status IN ('scheduled','overdue')) as pending_calibrations
    FROM mfg_machines m LEFT JOIN mfg_work_centers wc ON m.work_center_id = wc.id
    ORDER BY m.health_score ASC
  `);

  return res.status(200).json(successResponse(machines));
}

async function createMaintenanceSchedule(req: NextApiRequest, res: NextApiResponse) {
  const { machine_id, schedule_name, maintenance_type, description, frequency_type, frequency_value, alert_days_before, estimated_duration_hours, estimated_cost, parts_checklist, assigned_to } = req.body;
  if (!machine_id || !schedule_name || !frequency_value) return res.status(400).json(errorResponse('VALIDATION', 'Machine, name, and frequency required'));

  // Calculate next due date
  let nextDue = new Date();
  if (frequency_type === 'interval_days' || frequency_type === 'calendar_monthly') {
    nextDue.setDate(nextDue.getDate() + (frequency_type === 'calendar_monthly' ? 30 : frequency_value));
  } else if (frequency_type === 'calendar_weekly') {
    nextDue.setDate(nextDue.getDate() + (frequency_value * 7));
  }

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_maintenance_schedules (tenant_id, machine_id, schedule_name, maintenance_type, description, frequency_type, frequency_value, next_due_at, alert_days_before, estimated_duration_hours, estimated_cost, parts_checklist, assigned_to)
    SELECT t.id, :machine_id, :name, :type, :desc, :freq_type, :freq_val, :next_due, :alert, :duration, :cost, :parts, :assigned FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { machine_id, name: schedule_name, type: maintenance_type || 'preventive', desc: description || null, freq_type: frequency_type || 'interval_days', freq_val: frequency_value, next_due: nextDue.toISOString(), alert: alert_days_before || 7, duration: estimated_duration_hours || 1, cost: estimated_cost || 0, parts: JSON.stringify(parts_checklist || []), assigned: assigned_to || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Maintenance schedule created'));
}

async function createCalibration(req: NextApiRequest, res: NextApiResponse) {
  const { machine_id, instrument_name, calibration_type, standard_reference, scheduled_date, next_due_date, tolerance_min, tolerance_max, vendor_name, notes } = req.body;
  if (!machine_id) return res.status(400).json(errorResponse('VALIDATION', 'Machine ID required'));

  const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_calibration_records WHERE created_at >= DATE_TRUNC('year', NOW())`);
  const calNo = `CAL-${new Date().getFullYear()}-${String(seqResult[0]?.seq || 1).padStart(4, '0')}`;

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_calibration_records (tenant_id, machine_id, calibration_number, instrument_name, calibration_type, standard_reference, scheduled_date, next_due_date, tolerance_min, tolerance_max, vendor_name, notes)
    SELECT t.id, :machine_id, :num, :instrument, :type, :standard, :scheduled, :next_due, :tol_min, :tol_max, :vendor, :notes FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { machine_id, num: calNo, instrument: instrument_name || null, type: calibration_type || 'routine', standard: standard_reference || null, scheduled: scheduled_date || null, next_due: next_due_date || null, tol_min: tolerance_min || null, tol_max: tolerance_max || null, vendor: vendor_name || null, notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Calibration scheduled'));
}

async function generateMaintenanceFromSchedule(req: NextApiRequest, res: NextApiResponse) {
  const [schedules] = await sequelize.query(`
    SELECT ms.* FROM mfg_maintenance_schedules ms WHERE ms.is_active = true AND ms.next_due_at <= NOW() + INTERVAL '1 day'
  `);

  let generated = 0;
  for (const sched of schedules) {
    const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_maintenance_records WHERE created_at >= DATE_TRUNC('month', NOW())`);
    const now = new Date();
    const maintNo = `MNT-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(seqResult[0]?.seq || 1).padStart(4, '0')}`;

    await sequelize.query(`
      INSERT INTO mfg_maintenance_records (machine_id, tenant_id, maintenance_type, maintenance_number, description, scheduled_date, priority, status)
      VALUES (:machine_id, :tenant_id, :type, :num, :desc, :date, 'normal', 'scheduled')
    `, { replacements: { machine_id: sched.machine_id, tenant_id: sched.tenant_id, type: sched.maintenance_type, num: maintNo, desc: sched.description || sched.schedule_name, date: new Date().toISOString().slice(0, 10) } });

    // Update schedule next due
    let nextDue = new Date();
    if (sched.frequency_type === 'interval_days') nextDue.setDate(nextDue.getDate() + sched.frequency_value);
    else if (sched.frequency_type === 'calendar_weekly') nextDue.setDate(nextDue.getDate() + sched.frequency_value * 7);
    else if (sched.frequency_type === 'calendar_monthly') nextDue.setMonth(nextDue.getMonth() + sched.frequency_value);
    else nextDue.setDate(nextDue.getDate() + 30);

    await sequelize.query(`UPDATE mfg_maintenance_schedules SET last_performed_at = NOW(), next_due_at = :next, updated_at = NOW() WHERE id = :id`, { replacements: { id: sched.id, next: nextDue.toISOString() } });
    generated++;
  }

  return res.status(200).json(successResponse({ generated }, undefined, `${generated} maintenance records generated`));
}

// ==========================================
// COGM - Cost of Goods Manufactured
// ==========================================
async function getCOGMPeriods(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`
    SELECT cp.*, e1.name as calculated_by_name, e2.name as locked_by_name
    FROM mfg_cogm_periods cp
    LEFT JOIN employees e1 ON cp.calculated_by = e1.id
    LEFT JOIN employees e2 ON cp.locked_by = e2.id
    ORDER BY cp.period_start DESC
  `);
  return res.status(200).json(successResponse(rows));
}

async function getCOGMDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'COGM Period ID required'));

  const [period] = await sequelize.query(`SELECT * FROM mfg_cogm_periods WHERE id = :id`, { replacements: { id } });
  if (!period[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'COGM Period not found'));

  const [items] = await sequelize.query(`
    SELECT ci.*, p.name as product_name, p.sku FROM mfg_cogm_items ci
    LEFT JOIN products p ON ci.product_id = p.id WHERE ci.cogm_period_id = :id ORDER BY ci.total_cogm DESC
  `, { replacements: { id } });

  return res.status(200).json(successResponse({ ...period[0], items }));
}

async function getCOGMDashboard(req: NextApiRequest, res: NextApiResponse) {
  // Latest completed COGM
  const [latestPeriod] = await sequelize.query(`
    SELECT * FROM mfg_cogm_periods WHERE status IN ('completed','locked') ORDER BY period_end DESC LIMIT 1
  `);

  let items: any[] = [];
  if (latestPeriod[0]) {
    const [itemsResult] = await sequelize.query(`
      SELECT ci.*, p.name as product_name, p.sku FROM mfg_cogm_items ci
      LEFT JOIN products p ON ci.product_id = p.id WHERE ci.cogm_period_id = :id ORDER BY ci.total_cogm DESC LIMIT 20
    `, { replacements: { id: latestPeriod[0].id } });
    items = itemsResult;
  }

  // Cost trend
  const [costTrend] = await sequelize.query(`
    SELECT period_code, total_material_cost, total_labor_cost, total_overhead_cost, total_cogm, avg_unit_cost, total_units_produced
    FROM mfg_cogm_periods WHERE status IN ('completed','locked') ORDER BY period_start DESC LIMIT 12
  `);

  // Overhead rates
  const [overheads] = await sequelize.query(`SELECT * FROM mfg_overhead_rates WHERE is_active = true ORDER BY name`);
  const [labors] = await sequelize.query(`SELECT * FROM mfg_labor_rates WHERE is_active = true ORDER BY name`);

  return res.status(200).json(successResponse({
    latestPeriod: latestPeriod[0] || null,
    items,
    costTrend,
    overheadRates: overheads,
    laborRates: labors
  }));
}

async function getOverheadRates(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`
    SELECT r.*, wc.name as work_center_name FROM mfg_overhead_rates r
    LEFT JOIN mfg_work_centers wc ON r.work_center_id = wc.id ORDER BY r.name
  `);
  return res.status(200).json(successResponse(rows));
}

async function getLaborRates(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`
    SELECT r.*, wc.name as work_center_name FROM mfg_labor_rates r
    LEFT JOIN mfg_work_centers wc ON r.work_center_id = wc.id ORDER BY r.name
  `);
  return res.status(200).json(successResponse(rows));
}

async function calculateCOGM(req: NextApiRequest, res: NextApiResponse) {
  const { period_start, period_end, period_name, overhead_allocation_method } = req.body;
  if (!period_start || !period_end) return res.status(400).json(errorResponse('VALIDATION', 'Period start and end required'));

  const t = await sequelize.transaction();
  try {
    const periodCode = `COGM-${period_start.slice(0, 7).replace('-', '')}`;

    // Create/update period
    const [existing] = await sequelize.query(`SELECT id FROM mfg_cogm_periods WHERE period_code = :code`, { replacements: { code: periodCode }, transaction: t });

    let periodId: string;
    if (existing[0]) {
      periodId = existing[0].id;
      await sequelize.query(`DELETE FROM mfg_cogm_items WHERE cogm_period_id = :id`, { replacements: { id: periodId }, transaction: t });
      await sequelize.query(`UPDATE mfg_cogm_periods SET status = 'calculating', updated_at = NOW() WHERE id = :id`, { replacements: { id: periodId }, transaction: t });
    } else {
      const [newPeriod] = await sequelize.query(`
        INSERT INTO mfg_cogm_periods (tenant_id, period_code, period_name, period_start, period_end, status, overhead_allocation_method)
        SELECT t.id, :code, :name, :start, :end, 'calculating', :method FROM tenants t LIMIT 1 RETURNING id
      `, { replacements: { code: periodCode, name: period_name || `COGM ${period_start} - ${period_end}`, start: period_start, end: period_end, method: overhead_allocation_method || 'machine_hours' }, transaction: t });
      periodId = newPeriod[0].id;
    }

    // Get completed work orders in period
    const [workOrders] = await sequelize.query(`
      SELECT wo.id, wo.product_id, wo.actual_quantity, wo.actual_cost,
        COALESCE(SUM(CASE WHEN pc.cost_type = 'material' THEN pc.actual_amount ELSE 0 END), 0) as material_cost,
        COALESCE(SUM(CASE WHEN pc.cost_type = 'labor' THEN pc.actual_amount ELSE 0 END), 0) as labor_cost,
        COALESCE(SUM(CASE WHEN pc.cost_type IN ('overhead','machine','energy') THEN pc.actual_amount ELSE 0 END), 0) as overhead_cost,
        COALESCE(SUM(CASE WHEN pc.cost_type = 'packaging' THEN pc.actual_amount ELSE 0 END), 0) as packaging_cost,
        COALESCE(SUM(wop.total_work_seconds) / 3600.0, 0) as labor_hours,
        COALESCE(SUM(wop.run_time_actual) / 60.0, 0) as machine_hours
      FROM mfg_work_orders wo
      LEFT JOIN mfg_production_costs pc ON pc.work_order_id = wo.id
      LEFT JOIN mfg_wo_operations wop ON wop.work_order_id = wo.id
      WHERE wo.status = 'completed' AND wo.completed_at >= :start AND wo.completed_at <= :end
      GROUP BY wo.id, wo.product_id, wo.actual_quantity, wo.actual_cost
    `, { replacements: { start: period_start, end: period_end }, transaction: t });

    // Get waste costs
    const [wasteCosts] = await sequelize.query(`
      SELECT wo.product_id, COALESCE(SUM(wr.cost_impact), 0) as waste_cost
      FROM mfg_waste_records wr JOIN mfg_work_orders wo ON wr.work_order_id = wo.id
      WHERE wo.completed_at >= :start AND wo.completed_at <= :end
      GROUP BY wo.product_id
    `, { replacements: { start: period_start, end: period_end }, transaction: t });
    const wasteMap = new Map(wasteCosts.map((w: any) => [w.product_id, parseFloat(w.waste_cost)]));

    // Get overhead rates for allocation
    const [overheadRates] = await sequelize.query(`SELECT * FROM mfg_overhead_rates WHERE is_active = true`, { transaction: t });
    let totalFixedOverhead = 0;
    for (const rate of overheadRates) {
      if (rate.rate_type === 'fixed') totalFixedOverhead += parseFloat(rate.rate_value);
    }

    // Get labor rates
    const [laborRates] = await sequelize.query(`SELECT * FROM mfg_labor_rates WHERE is_active = true`, { transaction: t });
    const avgLaborRate = laborRates.length > 0 ? laborRates.reduce((s: number, r: any) => s + parseFloat(r.rate_value), 0) / laborRates.length : 25000;

    // Aggregate by product
    const productMap = new Map<number, any>();
    for (const wo of workOrders) {
      const pid = wo.product_id;
      if (!productMap.has(pid)) {
        productMap.set(pid, { product_id: pid, work_order_count: 0, units_produced: 0, material_cost: 0, labor_cost: 0, labor_hours: 0, overhead_cost: 0, machine_hours: 0, energy_cost: 0, packaging_cost: 0, waste_cost: 0 });
      }
      const p = productMap.get(pid)!;
      p.work_order_count++;
      p.units_produced += parseFloat(wo.actual_quantity || 0);
      p.material_cost += parseFloat(wo.material_cost || 0);
      p.labor_hours += parseFloat(wo.labor_hours || 0);
      p.machine_hours += parseFloat(wo.machine_hours || 0);
      p.packaging_cost += parseFloat(wo.packaging_cost || 0);
      // Calculate labor cost from hours × rate
      p.labor_cost += parseFloat(wo.labor_hours || 0) * avgLaborRate;
      p.overhead_cost += parseFloat(wo.overhead_cost || 0);
    }

    // Allocate fixed overhead proportionally
    const totalUnits = Array.from(productMap.values()).reduce((s, p) => s + p.units_produced, 0);
    let totalMaterialCost = 0, totalLaborCost = 0, totalOverheadCost = 0, totalCOGM = 0;

    for (const [pid, p] of productMap) {
      const allocationRatio = totalUnits > 0 ? p.units_produced / totalUnits : 0;
      const allocatedOverhead = totalFixedOverhead * allocationRatio;
      p.overhead_cost += allocatedOverhead;
      p.waste_cost = wasteMap.get(pid) || 0;
      p.total_cogm = p.material_cost + p.labor_cost + p.overhead_cost + p.energy_cost + p.packaging_cost + p.waste_cost;
      p.unit_cogm = p.units_produced > 0 ? p.total_cogm / p.units_produced : 0;

      // Get selling price
      const [priceData] = await sequelize.query(`SELECT selling_price FROM products WHERE id = :id`, { replacements: { id: pid }, transaction: t });
      p.selling_price = parseFloat(priceData[0]?.selling_price || 0);
      p.gross_margin = p.selling_price > 0 ? (p.selling_price - p.unit_cogm) * p.units_produced : 0;
      p.margin_percentage = p.selling_price > 0 ? ((p.selling_price - p.unit_cogm) / p.selling_price) * 100 : 0;

      await sequelize.query(`
        INSERT INTO mfg_cogm_items (cogm_period_id, product_id, work_order_count, units_produced, material_cost, labor_cost, labor_hours, overhead_cost, machine_hours, energy_cost, packaging_cost, waste_cost, total_cogm, unit_cogm, selling_price, gross_margin, margin_percentage)
        VALUES (:period_id, :pid, :wo_count, :units, :mat, :labor, :labor_h, :overhead, :machine_h, :energy, :pkg, :waste, :total, :unit, :sell, :margin, :margin_pct)
      `, { replacements: { period_id: periodId, pid, wo_count: p.work_order_count, units: p.units_produced, mat: p.material_cost, labor: p.labor_cost, labor_h: p.labor_hours, overhead: p.overhead_cost, machine_h: p.machine_hours, energy: p.energy_cost, pkg: p.packaging_cost, waste: p.waste_cost, total: p.total_cogm, unit: p.unit_cogm, sell: p.selling_price, margin: p.gross_margin, margin_pct: p.margin_percentage }, transaction: t });

      totalMaterialCost += p.material_cost;
      totalLaborCost += p.labor_cost;
      totalOverheadCost += p.overhead_cost;
      totalCOGM += p.total_cogm;
    }

    // Update period totals
    await sequelize.query(`
      UPDATE mfg_cogm_periods SET status = 'completed', total_material_cost = :mat, total_labor_cost = :labor, total_overhead_cost = :overhead, total_cogm = :total, total_units_produced = :units, avg_unit_cost = :avg, calculated_at = NOW(), updated_at = NOW()
      WHERE id = :id
    `, { replacements: { id: periodId, mat: totalMaterialCost, labor: totalLaborCost, overhead: totalOverheadCost, total: totalCOGM, units: totalUnits, avg: totalUnits > 0 ? totalCOGM / totalUnits : 0 }, transaction: t });

    await t.commit();
    return res.status(200).json(successResponse({ periodId, totalCOGM, totalUnits, productCount: productMap.size }, undefined, 'COGM calculated'));
  } catch (error: any) { await t.rollback(); throw error; }
}

async function lockCOGMPeriod(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'COGM Period ID required'));

  await sequelize.query(`UPDATE mfg_cogm_periods SET status = 'locked', locked_at = NOW(), updated_at = NOW() WHERE id = :id AND status = 'completed'`, { replacements: { id } });
  return res.status(200).json(successResponse({ id }, undefined, 'COGM period locked'));
}

async function createOverheadRate(req: NextApiRequest, res: NextApiResponse) {
  const { name, category, rate_type, rate_value, period, work_center_id, notes } = req.body;
  if (!name || !rate_value) return res.status(400).json(errorResponse('VALIDATION', 'Name and rate required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_overhead_rates (tenant_id, name, category, rate_type, rate_value, period, work_center_id, notes)
    SELECT t.id, :name, :category, :rate_type, :rate_value, :period, :wc_id, :notes FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { name, category: category || 'factory', rate_type: rate_type || 'fixed', rate_value, period: period || 'monthly', wc_id: work_center_id || null, notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Overhead rate created'));
}

async function createLaborRate(req: NextApiRequest, res: NextApiResponse) {
  const { name, rate_type, rate_value, overtime_multiplier, skill_level, department, work_center_id, notes } = req.body;
  if (!name || !rate_value) return res.status(400).json(errorResponse('VALIDATION', 'Name and rate required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_labor_rates (tenant_id, name, rate_type, rate_value, overtime_multiplier, skill_level, department, work_center_id, notes)
    SELECT t.id, :name, :type, :value, :ot, :skill, :dept, :wc_id, :notes FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { name, type: rate_type || 'per_hour', value: rate_value, ot: overtime_multiplier || 1.5, skill: skill_level || null, dept: department || null, wc_id: work_center_id || null, notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Labor rate created'));
}

// ==========================================
// SUBCONTRACTING
// ==========================================
async function getSubcontracts(req: NextApiRequest, res: NextApiResponse) {
  const { status, search } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (status && status !== 'all') { where += ' AND sc.status = :status'; replacements.status = status; }
  if (search) { where += ' AND (sc.subcontract_number ILIKE :search OR sc.vendor_name ILIKE :search)'; replacements.search = `%${search}%`; }

  const [rows] = await sequelize.query(`
    SELECT sc.*, p.name as product_name, wo.wo_number, s.name as supplier_name
    FROM mfg_subcontracts sc
    LEFT JOIN products p ON sc.product_id = p.id
    LEFT JOIN mfg_work_orders wo ON sc.work_order_id = wo.id
    LEFT JOIN suppliers s ON sc.vendor_id = s.id
    ${where} ORDER BY sc.created_at DESC
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function getSubcontractDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Subcontract ID required'));

  const [sc] = await sequelize.query(`
    SELECT sc.*, p.name as product_name, wo.wo_number, s.name as supplier_name, e.name as created_by_name
    FROM mfg_subcontracts sc
    LEFT JOIN products p ON sc.product_id = p.id
    LEFT JOIN mfg_work_orders wo ON sc.work_order_id = wo.id
    LEFT JOIN suppliers s ON sc.vendor_id = s.id
    LEFT JOIN employees e ON sc.created_by = e.id
    WHERE sc.id = :id
  `, { replacements: { id } });

  return res.status(200).json(successResponse(sc[0] || null));
}

async function createSubcontract(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, vendor_id, vendor_name, product_id, operation_name, quantity, uom, unit_cost, materials_sent, expected_return_date, qc_required, notes } = req.body;
  if (!quantity || !operation_name) return res.status(400).json(errorResponse('VALIDATION', 'Operation and quantity required'));

  const [seqResult] = await sequelize.query(`SELECT COUNT(*) + 1 as seq FROM mfg_subcontracts WHERE created_at >= DATE_TRUNC('month', NOW())`);
  const now = new Date();
  const scNo = `SC-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(seqResult[0]?.seq || 1).padStart(4, '0')}`;

  const totalCost = (parseFloat(String(unit_cost)) || 0) * (parseFloat(String(quantity)) || 0);

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_subcontracts (tenant_id, subcontract_number, work_order_id, vendor_id, vendor_name, product_id, operation_name, quantity, uom, unit_cost, total_cost, materials_sent, expected_return_date, qc_required, notes)
    SELECT t.id, :num, :wo_id, :vendor_id, :vendor_name, :product_id, :op, :qty, :uom, :unit_cost, :total, :materials, :return_date, :qc, :notes FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { num: scNo, wo_id: work_order_id || null, vendor_id: vendor_id || null, vendor_name: vendor_name || null, product_id: product_id || null, op: operation_name, qty: quantity, uom: uom || 'pcs', unit_cost: unit_cost || 0, total: totalCost, materials: JSON.stringify(materials_sent || []), return_date: expected_return_date || null, qc: qc_required !== false, notes: notes || null } });

  return res.status(201).json(successResponse(rows[0], undefined, 'Subcontract created'));
}

async function sendSubcontract(req: NextApiRequest, res: NextApiResponse) {
  const { id, materials_sent_date } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Subcontract ID required'));

  await sequelize.query(`UPDATE mfg_subcontracts SET status = 'sent', materials_sent_date = :date, updated_at = NOW() WHERE id = :id AND status = 'draft'`, { replacements: { id, date: materials_sent_date || new Date().toISOString().slice(0, 10) } });

  return res.status(200).json(successResponse({ id }, undefined, 'Materials sent to vendor'));
}

async function receiveSubcontract(req: NextApiRequest, res: NextApiResponse) {
  const { id, received_quantity, rejected_quantity } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'Subcontract ID required'));

  const received = parseFloat(String(received_quantity)) || 0;
  const rejected = parseFloat(String(rejected_quantity)) || 0;

  const [sc] = await sequelize.query(`SELECT quantity FROM mfg_subcontracts WHERE id = :id`, { replacements: { id } });
  const total = parseFloat(sc[0]?.quantity || 0);
  const newStatus = received >= total ? 'received' : 'partial_received';

  await sequelize.query(`
    UPDATE mfg_subcontracts SET status = :status, received_quantity = :received, rejected_quantity = :rejected, actual_return_date = NOW(), updated_at = NOW()
    WHERE id = :id AND status IN ('sent','in_process','partial_received')
  `, { replacements: { id, status: newStatus, received, rejected } });

  return res.status(200).json(successResponse({ id }, undefined, 'Subcontract goods received'));
}

// ==========================================
// IoT CONNECTOR
// ==========================================
async function getIoTDevices(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`
    SELECT d.*, m.machine_name, m.machine_code, wc.name as work_center_name
    FROM mfg_iot_devices d
    LEFT JOIN mfg_machines m ON d.machine_id = m.id
    LEFT JOIN mfg_work_centers wc ON d.work_center_id = wc.id
    ORDER BY d.device_name
  `);
  return res.status(200).json(successResponse(rows));
}

async function getIoTReadings(req: NextApiRequest, res: NextApiResponse) {
  const { device_id, hours = '24' } = req.query;
  if (!device_id) return res.status(400).json(errorResponse('MISSING_ID', 'Device ID required'));

  const [rows] = await sequelize.query(`
    SELECT * FROM mfg_iot_readings WHERE device_id = :device_id AND recorded_at >= NOW() - :hours::INTEGER * INTERVAL '1 hour'
    ORDER BY recorded_at DESC LIMIT 500
  `, { replacements: { device_id, hours } });

  return res.status(200).json(successResponse(rows));
}

async function getIoTDashboard(req: NextApiRequest, res: NextApiResponse) {
  const [devices] = await sequelize.query(`
    SELECT d.*, m.machine_name, m.machine_code,
      (SELECT COUNT(*) FROM mfg_iot_readings r WHERE r.device_id = d.id AND r.recorded_at >= NOW() - INTERVAL '1 hour') as readings_last_hour
    FROM mfg_iot_devices d LEFT JOIN mfg_machines m ON d.machine_id = m.id WHERE d.status = 'active'
  `);

  const [recentAlerts] = await sequelize.query(`
    SELECT r.*, d.device_name, d.device_type FROM mfg_iot_readings r
    JOIN mfg_iot_devices d ON r.device_id = d.id
    WHERE r.recorded_at >= NOW() - INTERVAL '24 hours'
    ORDER BY r.recorded_at DESC LIMIT 20
  `);

  return res.status(200).json(successResponse({ devices, recentAlerts }));
}

async function createIoTDevice(req: NextApiRequest, res: NextApiResponse) {
  const { device_code, device_name, device_type, machine_id, work_center_id, connection_type, connection_config, data_mapping, reading_interval_seconds, alert_rules } = req.body;
  if (!device_code || !device_name) return res.status(400).json(errorResponse('VALIDATION', 'Code and name required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_iot_devices (tenant_id, device_code, device_name, device_type, machine_id, work_center_id, connection_type, connection_config, data_mapping, reading_interval_seconds, alert_rules)
    SELECT t.id, :code, :name, :type, :machine_id, :wc_id, :conn, :config, :mapping, :interval, :alerts FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { code: device_code, name: device_name, type: device_type || 'sensor', machine_id: machine_id || null, wc_id: work_center_id || null, conn: connection_type || 'mqtt', config: JSON.stringify(connection_config || {}), mapping: JSON.stringify(data_mapping || {}), interval: reading_interval_seconds || 60, alerts: JSON.stringify(alert_rules || []) } });

  return res.status(201).json(successResponse(rows[0], undefined, 'IoT device registered'));
}

async function recordIoTReading(req: NextApiRequest, res: NextApiResponse) {
  const { device_id, reading_type, reading_value, reading_unit, reading_data, work_order_id } = req.body;
  if (!device_id || !reading_type) return res.status(400).json(errorResponse('VALIDATION', 'Device ID and reading type required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_iot_readings (device_id, reading_type, reading_value, reading_unit, reading_data, work_order_id)
    VALUES (:device_id, :type, :value, :unit, :data, :wo_id) RETURNING *
  `, { replacements: { device_id, type: reading_type, value: reading_value || null, unit: reading_unit || null, data: JSON.stringify(reading_data || {}), wo_id: work_order_id || null } });

  // Update device last reading
  await sequelize.query(`UPDATE mfg_iot_devices SET last_reading = :reading, last_reading_at = NOW(), is_online = true WHERE id = :id`, { replacements: { id: device_id, reading: JSON.stringify({ type: reading_type, value: reading_value, unit: reading_unit }) } });

  return res.status(201).json(successResponse(rows[0], undefined, 'IoT reading recorded'));
}

// ==========================================
// BARCODE / RFID
// ==========================================
async function getBarcodeScans(req: NextApiRequest, res: NextApiResponse) {
  const { work_order_id, scan_purpose, date } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};
  if (work_order_id) { where += ' AND bs.work_order_id = :wo_id'; replacements.wo_id = work_order_id; }
  if (scan_purpose && scan_purpose !== 'all') { where += ' AND bs.scan_purpose = :purpose'; replacements.purpose = scan_purpose; }
  if (date) { where += ' AND DATE(bs.scanned_at) = :date'; replacements.date = date; }

  const [rows] = await sequelize.query(`
    SELECT bs.*, p.name as product_name, wo.wo_number, wc.name as work_center_name, e.name as scanned_by_name
    FROM mfg_barcode_scans bs
    LEFT JOIN products p ON bs.product_id = p.id
    LEFT JOIN mfg_work_orders wo ON bs.work_order_id = wo.id
    LEFT JOIN mfg_work_centers wc ON bs.work_center_id = wc.id
    LEFT JOIN employees e ON bs.scanned_by = e.id
    ${where} ORDER BY bs.scanned_at DESC LIMIT 200
  `, { replacements });

  return res.status(200).json(successResponse(rows));
}

async function recordBarcodeScan(req: NextApiRequest, res: NextApiResponse) {
  const { barcode_value, scan_type, scan_purpose, product_id, work_order_id, work_center_id, warehouse_id, quantity, device_info, location, notes } = req.body;
  if (!barcode_value) return res.status(400).json(errorResponse('VALIDATION', 'Barcode value required'));

  const [rows] = await sequelize.query(`
    INSERT INTO mfg_barcode_scans (tenant_id, barcode_value, scan_type, scan_purpose, product_id, work_order_id, work_center_id, warehouse_id, quantity, device_info, location, notes)
    SELECT t.id, :barcode, :type, :purpose, :product_id, :wo_id, :wc_id, :wh_id, :qty, :device, :location, :notes FROM tenants t LIMIT 1 RETURNING *
  `, { replacements: { barcode: barcode_value, type: scan_type || 'barcode', purpose: scan_purpose || 'material_in', product_id: product_id || null, wo_id: work_order_id || null, wc_id: work_center_id || null, wh_id: warehouse_id || null, qty: quantity || 1, device: device_info || null, location: location || null, notes: notes || null } });

  // Auto-actions based on scan purpose
  if (scan_purpose === 'material_in' && product_id && warehouse_id) {
    await sequelize.query(`
      UPDATE inventory_stock SET quantity = quantity + :qty, updated_at = NOW()
      WHERE product_id = :pid AND warehouse_id = :wid
    `, { replacements: { qty: quantity || 1, pid: product_id, wid: warehouse_id } });
  } else if (scan_purpose === 'material_out' && product_id) {
    await sequelize.query(`
      UPDATE inventory_stock SET quantity = GREATEST(quantity - :qty, 0), updated_at = NOW()
      WHERE product_id = :pid
    `, { replacements: { qty: quantity || 1, pid: product_id } });
  }

  return res.status(201).json(successResponse(rows[0], undefined, 'Barcode scan recorded'));
}

// ==========================================
// PUT / DELETE
// ==========================================
async function handlePut(req: NextApiRequest, res: NextApiResponse, action: string) {
  const { id, ...updates } = req.body;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ID required'));

  const tableMap: Record<string, { table: string; fields: string[] }> = {
    'plm-product': { table: 'mfg_plm_products', fields: ['lifecycle_stage', 'version', 'revision', 'design_owner', 'team_members', 'target_launch_date', 'actual_launch_date', 'description', 'specifications', 'compliance_notes', 'notes', 'status'] },
    'plm-design-change': { table: 'mfg_plm_design_changes', fields: ['title', 'change_type', 'priority', 'reason', 'description', 'impact_analysis', 'status', 'cost_impact'] },
    'maintenance-schedule': { table: 'mfg_maintenance_schedules', fields: ['schedule_name', 'maintenance_type', 'description', 'frequency_type', 'frequency_value', 'alert_days_before', 'estimated_duration_hours', 'estimated_cost', 'parts_checklist', 'assigned_to', 'is_active'] },
    'calibration': { table: 'mfg_calibration_records', fields: ['calibration_type', 'performed_date', 'next_due_date', 'before_readings', 'after_readings', 'actual_deviation', 'result', 'certificate_number', 'cost', 'status', 'notes'] },
    'overhead-rate': { table: 'mfg_overhead_rates', fields: ['name', 'category', 'rate_type', 'rate_value', 'period', 'work_center_id', 'is_active', 'notes'] },
    'labor-rate': { table: 'mfg_labor_rates', fields: ['name', 'rate_type', 'rate_value', 'overtime_multiplier', 'skill_level', 'department', 'work_center_id', 'is_active', 'notes'] },
    'subcontract': { table: 'mfg_subcontracts', fields: ['status', 'vendor_name', 'operation_name', 'quantity', 'unit_cost', 'total_cost', 'expected_return_date', 'notes'] },
    'iot-device': { table: 'mfg_iot_devices', fields: ['device_name', 'device_type', 'machine_id', 'work_center_id', 'connection_type', 'connection_config', 'data_mapping', 'reading_interval_seconds', 'alert_rules', 'status'] },
  };

  const config = tableMap[action];
  if (!config) return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown PUT action: ${action}`));

  const setClauses: string[] = [];
  const replacements: any = { id };
  for (const key of Object.keys(updates)) {
    if (config.fields.includes(key)) {
      setClauses.push(`${key} = :${key}`);
      replacements[key] = typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key];
    }
  }
  if (setClauses.length === 0) return res.status(400).json(errorResponse('NO_UPDATES', 'No valid fields'));

  setClauses.push('updated_at = NOW()');
  await sequelize.query(`UPDATE ${config.table} SET ${setClauses.join(', ')} WHERE id = :id`, { replacements });
  return res.status(200).json(successResponse({ id }, undefined, 'Updated'));
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, action: string) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ID required'));

  const tableMap: Record<string, string> = {
    'plm-product': 'mfg_plm_products',
    'plm-design-change': 'mfg_plm_design_changes',
    'plm-document': 'mfg_plm_documents',
    'maintenance-schedule': 'mfg_maintenance_schedules',
    'calibration': 'mfg_calibration_records',
    'cogm-period': 'mfg_cogm_periods',
    'overhead-rate': 'mfg_overhead_rates',
    'labor-rate': 'mfg_labor_rates',
    'subcontract': 'mfg_subcontracts',
    'iot-device': 'mfg_iot_devices',
  };

  const table = tableMap[action];
  if (!table) return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown DELETE action: ${action}`));

  await sequelize.query(`DELETE FROM ${table} WHERE id = :id`, { replacements: { id } });
  return res.status(200).json(successResponse({ id }, undefined, 'Deleted'));
}
