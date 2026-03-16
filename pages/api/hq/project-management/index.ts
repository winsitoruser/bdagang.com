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
    console.error(`[PJM API] Error (${action}):`, error.message);
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
    case 'projects': return getProjects(req, res);
    case 'project-detail': return getProjectDetail(req, res);
    case 'tasks': return getTasks(req, res);
    case 'task-detail': return getTaskDetail(req, res);
    case 'milestones': return getMilestones(req, res);
    case 'timesheets': return getTimesheets(req, res);
    case 'resources': return getResources(req, res);
    case 'risks': return getRisks(req, res);
    case 'budgets': return getBudgets(req, res);
    case 'documents': return getDocuments(req, res);
    case 'gantt': return getGanttData(req, res);
    case 'settings': return getSettings(req, res);
    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown GET action: ${action}`));
  }
}

// Dashboard
async function getDashboard(req: NextApiRequest, res: NextApiResponse) {
  const [projectStats] = await sequelize.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'planning') as planning,
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
      COALESCE(SUM(budget_amount), 0) as total_budget,
      COALESCE(SUM(actual_cost), 0) as total_actual_cost,
      COALESCE(AVG(progress_percent), 0) as avg_progress
    FROM pjm_projects
  `);

  const [taskStats] = await sequelize.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'todo') as todo,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'review') as review,
      COUNT(*) FILTER (WHERE status = 'done') as done,
      COUNT(*) FILTER (WHERE status = 'blocked') as blocked,
      COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('done', 'cancelled')) as overdue
    FROM pjm_tasks
  `);

  const [riskStats] = await sequelize.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'identified') as identified,
      COUNT(*) FILTER (WHERE status = 'mitigating') as mitigating,
      COUNT(*) FILTER (WHERE probability = 'high' OR probability = 'very_high') as high_risks
    FROM pjm_risks
  `);

  const [recentProjects] = await sequelize.query(`
    SELECT id, project_code, name, status, priority, progress_percent, start_date, end_date, 
           budget_amount, actual_cost, manager_name, total_tasks, completed_tasks
    FROM pjm_projects ORDER BY updated_at DESC LIMIT 10
  `);

  const [upcomingMilestones] = await sequelize.query(`
    SELECT m.id, m.name, m.status, m.due_date, p.name as project_name, p.project_code
    FROM pjm_milestones m JOIN pjm_projects p ON m.project_id = p.id
    WHERE m.status != 'completed' ORDER BY m.due_date ASC LIMIT 10
  `);

  return res.status(200).json(successResponse({
    projectStats: projectStats[0] || {},
    taskStats: taskStats[0] || {},
    riskStats: riskStats[0] || {},
    recentProjects,
    upcomingMilestones
  }));
}

// Projects
async function getProjects(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '20', status, priority, search } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  let where = 'WHERE 1=1';
  if (status && status !== 'all') where += ` AND p.status = '${status}'`;
  if (priority && priority !== 'all') where += ` AND p.priority = '${priority}'`;
  if (search) where += ` AND (p.name ILIKE '%${search}%' OR p.project_code ILIKE '%${search}%')`;

  const [rows] = await sequelize.query(`
    SELECT p.*, 
      (SELECT COUNT(*) FROM pjm_tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM pjm_tasks WHERE project_id = p.id AND status = 'done') as completed_task_count,
      (SELECT COUNT(*) FROM pjm_milestones WHERE project_id = p.id) as milestone_count,
      (SELECT COUNT(*) FROM pjm_resources WHERE project_id = p.id) as resource_count
    FROM pjm_projects p ${where} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}
  `);

  const [[{ count }]] = await sequelize.query(`SELECT COUNT(*) as count FROM pjm_projects p ${where}`);

  return res.status(200).json(successResponse({ rows, total: parseInt(count), page: parseInt(page as string), limit: parseInt(limit as string) }));
}

async function getProjectDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const [[project]] = await sequelize.query(`SELECT * FROM pjm_projects WHERE id = '${id}'`);
  if (!project) return res.status(404).json(errorResponse('NOT_FOUND', 'Project not found'));

  const [tasks] = await sequelize.query(`SELECT * FROM pjm_tasks WHERE project_id = '${id}' ORDER BY sort_order`);
  const [milestones] = await sequelize.query(`SELECT * FROM pjm_milestones WHERE project_id = '${id}' ORDER BY sort_order`);
  const [resources] = await sequelize.query(`SELECT * FROM pjm_resources WHERE project_id = '${id}'`);
  const [risks] = await sequelize.query(`SELECT * FROM pjm_risks WHERE project_id = '${id}'`);
  const [budgetItems] = await sequelize.query(`SELECT * FROM pjm_budgets WHERE project_id = '${id}'`);
  const [documents] = await sequelize.query(`SELECT * FROM pjm_documents WHERE project_id = '${id}'`);

  return res.status(200).json(successResponse({ ...project, tasks, milestones, resources, risks, budgetItems, documents }));
}

// Tasks
async function getTasks(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, status, assigneeId, search, page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND t.project_id = '${projectId}'`;
  if (status && status !== 'all') where += ` AND t.status = '${status}'`;
  if (assigneeId) where += ` AND t.assignee_id = ${assigneeId}`;
  if (search) where += ` AND t.name ILIKE '%${search}%'`;

  const [rows] = await sequelize.query(`
    SELECT t.*, p.name as project_name, p.project_code
    FROM pjm_tasks t JOIN pjm_projects p ON t.project_id = p.id
    ${where} ORDER BY t.sort_order ASC LIMIT ${limit} OFFSET ${offset}
  `);

  const [[{ count }]] = await sequelize.query(`SELECT COUNT(*) as count FROM pjm_tasks t ${where}`);

  return res.status(200).json(successResponse({ rows, total: parseInt(count) }));
}

async function getTaskDetail(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const [[task]] = await sequelize.query(`
    SELECT t.*, p.name as project_name, p.project_code
    FROM pjm_tasks t JOIN pjm_projects p ON t.project_id = p.id WHERE t.id = '${id}'
  `);
  if (!task) return res.status(404).json(errorResponse('NOT_FOUND', 'Task not found'));

  const [timesheets] = await sequelize.query(`SELECT * FROM pjm_timesheets WHERE task_id = '${id}' ORDER BY work_date DESC`);
  return res.status(200).json(successResponse({ ...task, timesheets }));
}

// Milestones
async function getMilestones(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND m.project_id = '${projectId}'`;

  const [rows] = await sequelize.query(`
    SELECT m.*, p.name as project_name, p.project_code,
      (SELECT COUNT(*) FROM pjm_tasks WHERE milestone_id = m.id) as task_count,
      (SELECT COUNT(*) FROM pjm_tasks WHERE milestone_id = m.id AND status = 'done') as done_count
    FROM pjm_milestones m JOIN pjm_projects p ON m.project_id = p.id
    ${where} ORDER BY m.sort_order
  `);

  return res.status(200).json(successResponse(rows));
}

// Timesheets
async function getTimesheets(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, employeeId, startDate, endDate, page = '1', limit = '50' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND ts.project_id = '${projectId}'`;
  if (employeeId) where += ` AND ts.employee_id = ${employeeId}`;
  if (startDate) where += ` AND ts.work_date >= '${startDate}'`;
  if (endDate) where += ` AND ts.work_date <= '${endDate}'`;

  const [rows] = await sequelize.query(`
    SELECT ts.*, p.name as project_name, t.name as task_name
    FROM pjm_timesheets ts
    JOIN pjm_projects p ON ts.project_id = p.id
    LEFT JOIN pjm_tasks t ON ts.task_id = t.id
    ${where} ORDER BY ts.work_date DESC LIMIT ${limit} OFFSET ${offset}
  `);

  const [[{ count, totalHours }]] = await sequelize.query(`
    SELECT COUNT(*) as count, COALESCE(SUM(hours_worked), 0) as "totalHours"
    FROM pjm_timesheets ts ${where}
  `);

  return res.status(200).json(successResponse({ rows, total: parseInt(count), totalHours: parseFloat(totalHours) }));
}

// Resources
async function getResources(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND r.project_id = '${projectId}'`;

  const [rows] = await sequelize.query(`
    SELECT r.*, p.name as project_name
    FROM pjm_resources r JOIN pjm_projects p ON r.project_id = p.id
    ${where} ORDER BY r.created_at DESC
  `);

  return res.status(200).json(successResponse(rows));
}

// Risks
async function getRisks(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, status } = req.query;
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND r.project_id = '${projectId}'`;
  if (status && status !== 'all') where += ` AND r.status = '${status}'`;

  const [rows] = await sequelize.query(`
    SELECT r.*, p.name as project_name
    FROM pjm_risks r JOIN pjm_projects p ON r.project_id = p.id
    ${where} ORDER BY r.risk_score DESC
  `);

  return res.status(200).json(successResponse(rows));
}

// Budgets
async function getBudgets(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND b.project_id = '${projectId}'`;

  const [rows] = await sequelize.query(`
    SELECT b.*, p.name as project_name
    FROM pjm_budgets b JOIN pjm_projects p ON b.project_id = p.id
    ${where} ORDER BY b.category
  `);

  const [[summary]] = await sequelize.query(`
    SELECT COALESCE(SUM(planned_amount), 0) as total_planned,
           COALESCE(SUM(actual_amount), 0) as total_actual,
           COALESCE(SUM(committed_amount), 0) as total_committed
    FROM pjm_budgets b ${where}
  `);

  return res.status(200).json(successResponse({ rows, summary }));
}

// Documents
async function getDocuments(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  let where = 'WHERE 1=1';
  if (projectId) where += ` AND d.project_id = '${projectId}'`;

  const [rows] = await sequelize.query(`
    SELECT d.*, p.name as project_name
    FROM pjm_documents d JOIN pjm_projects p ON d.project_id = p.id
    ${where} ORDER BY d.created_at DESC
  `);

  return res.status(200).json(successResponse(rows));
}

// Gantt
async function getGanttData(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json(errorResponse('MISSING_PARAM', 'projectId is required'));

  const [tasks] = await sequelize.query(`
    SELECT id, name, status, start_date, due_date, progress_percent, assignee_name, 
           parent_task_id, milestone_id, dependencies, priority
    FROM pjm_tasks WHERE project_id = '${projectId}' ORDER BY sort_order
  `);

  const [milestones] = await sequelize.query(`
    SELECT id, name, status, due_date, completed_date FROM pjm_milestones 
    WHERE project_id = '${projectId}' ORDER BY sort_order
  `);

  return res.status(200).json(successResponse({ tasks, milestones }));
}

// Settings
async function getSettings(req: NextApiRequest, res: NextApiResponse) {
  const [rows] = await sequelize.query(`SELECT * FROM pjm_settings ORDER BY setting_key`);
  return res.status(200).json(successResponse(rows));
}

// ==========================================
// POST HANDLERS
// ==========================================
async function handlePost(req: NextApiRequest, res: NextApiResponse, action: string) {
  const data = req.body;

  switch (action) {
    case 'projects': {
      const code = `PJM-${Date.now().toString(36).toUpperCase()}`;
      const [result] = await sequelize.query(`
        INSERT INTO pjm_projects (id, tenant_id, project_code, name, description, status, priority, category, project_type,
          client_name, client_contact, manager_name, start_date, end_date, budget_amount, currency, tags, notes, created_by)
        VALUES (gen_random_uuid(), :tenantId, :code, :name, :description, :status, :priority, :category, :projectType,
          :clientName, :clientContact, :managerName, :startDate, :endDate, :budgetAmount, :currency, :tags, :notes, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, code, name: data.name, description: data.description || null,
        status: data.status || 'planning', priority: data.priority || 'normal', category: data.category || null,
        projectType: data.projectType || 'internal', clientName: data.clientName || null, clientContact: data.clientContact || null,
        managerName: data.managerName || null, startDate: data.startDate || null, endDate: data.endDate || null,
        budgetAmount: data.budgetAmount || 0, currency: data.currency || 'IDR',
        tags: JSON.stringify(data.tags || []), notes: data.notes || null, createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    case 'tasks': {
      const taskCode = `T-${Date.now().toString(36).toUpperCase()}`;
      const [result] = await sequelize.query(`
        INSERT INTO pjm_tasks (id, tenant_id, project_id, parent_task_id, milestone_id, task_code, name, description,
          status, priority, task_type, assignee_name, start_date, due_date, estimated_hours, sort_order, labels, created_by)
        VALUES (gen_random_uuid(), :tenantId, :projectId, :parentTaskId, :milestoneId, :taskCode, :name, :description,
          :status, :priority, :taskType, :assigneeName, :startDate, :dueDate, :estimatedHours, :sortOrder, :labels, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, projectId: data.projectId, parentTaskId: data.parentTaskId || null,
        milestoneId: data.milestoneId || null, taskCode, name: data.name, description: data.description || null,
        status: data.status || 'todo', priority: data.priority || 'normal', taskType: data.taskType || 'task',
        assigneeName: data.assigneeName || null, startDate: data.startDate || null, dueDate: data.dueDate || null,
        estimatedHours: data.estimatedHours || 0, sortOrder: data.sortOrder || 0,
        labels: JSON.stringify(data.labels || []), createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    case 'milestones': {
      const [result] = await sequelize.query(`
        INSERT INTO pjm_milestones (id, tenant_id, project_id, name, description, status, due_date, deliverables, sort_order, created_by)
        VALUES (gen_random_uuid(), :tenantId, :projectId, :name, :description, :status, :dueDate, :deliverables, :sortOrder, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, projectId: data.projectId, name: data.name,
        description: data.description || null, status: data.status || 'pending', dueDate: data.dueDate || null,
        deliverables: JSON.stringify(data.deliverables || []), sortOrder: data.sortOrder || 0, createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    case 'timesheets': {
      const [result] = await sequelize.query(`
        INSERT INTO pjm_timesheets (id, tenant_id, project_id, task_id, employee_id, employee_name, work_date,
          hours_worked, overtime_hours, hourly_rate, total_cost, description, status, created_by)
        VALUES (gen_random_uuid(), :tenantId, :projectId, :taskId, :employeeId, :employeeName, :workDate,
          :hoursWorked, :overtimeHours, :hourlyRate, :totalCost, :description, :status, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, projectId: data.projectId, taskId: data.taskId || null,
        employeeId: data.employeeId, employeeName: data.employeeName || null, workDate: data.workDate,
        hoursWorked: data.hoursWorked, overtimeHours: data.overtimeHours || 0, hourlyRate: data.hourlyRate || 0,
        totalCost: (data.hoursWorked + (data.overtimeHours || 0)) * (data.hourlyRate || 0),
        description: data.description || null, status: data.status || 'draft', createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    case 'resources': {
      const [result] = await sequelize.query(`
        INSERT INTO pjm_resources (id, tenant_id, project_id, resource_type, resource_name, role, allocation_percent,
          start_date, end_date, cost_per_hour, status, notes, created_by)
        VALUES (gen_random_uuid(), :tenantId, :projectId, :resourceType, :resourceName, :role, :allocationPercent,
          :startDate, :endDate, :costPerHour, :status, :notes, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, projectId: data.projectId, resourceType: data.resourceType || 'human',
        resourceName: data.resourceName, role: data.role || null, allocationPercent: data.allocationPercent || 100,
        startDate: data.startDate || null, endDate: data.endDate || null, costPerHour: data.costPerHour || 0,
        status: data.status || 'active', notes: data.notes || null, createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    case 'risks': {
      const riskCode = `R-${Date.now().toString(36).toUpperCase()}`;
      const probScore: Record<string, number> = { low: 1, medium: 2, high: 3, very_high: 4 };
      const impScore: Record<string, number> = { low: 1, medium: 2, high: 3, very_high: 4 };
      const riskScore = (probScore[data.probability || 'medium'] || 2) * (impScore[data.impact || 'medium'] || 2);
      const [result] = await sequelize.query(`
        INSERT INTO pjm_risks (id, tenant_id, project_id, risk_code, title, description, category, probability, impact,
          risk_score, status, mitigation_plan, contingency_plan, owner_name, identified_date, created_by)
        VALUES (gen_random_uuid(), :tenantId, :projectId, :riskCode, :title, :description, :category, :probability, :impact,
          :riskScore, :status, :mitigationPlan, :contingencyPlan, :ownerName, CURRENT_DATE, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, projectId: data.projectId, riskCode, title: data.title,
        description: data.description || null, category: data.category || null, probability: data.probability || 'medium',
        impact: data.impact || 'medium', riskScore, status: data.status || 'identified',
        mitigationPlan: data.mitigationPlan || null, contingencyPlan: data.contingencyPlan || null,
        ownerName: data.ownerName || null, createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    case 'budgets': {
      const [result] = await sequelize.query(`
        INSERT INTO pjm_budgets (id, tenant_id, project_id, category, description, planned_amount, actual_amount,
          committed_amount, period, period_date, notes, created_by)
        VALUES (gen_random_uuid(), :tenantId, :projectId, :category, :description, :plannedAmount, :actualAmount,
          :committedAmount, :period, :periodDate, :notes, :createdBy)
        RETURNING *
      `, { replacements: { tenantId: data.tenantId || null, projectId: data.projectId, category: data.category,
        description: data.description || null, plannedAmount: data.plannedAmount || 0, actualAmount: data.actualAmount || 0,
        committedAmount: data.committedAmount || 0, period: data.period || null, periodDate: data.periodDate || null,
        notes: data.notes || null, createdBy: data.createdBy || null }});
      return res.status(201).json(successResponse(result[0]));
    }
    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown POST action: ${action}`));
  }
}

// ==========================================
// PUT HANDLERS
// ==========================================
async function handlePut(req: NextApiRequest, res: NextApiResponse, action: string) {
  const { id } = req.query;
  const data = req.body;

  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ID is required'));

  switch (action) {
    case 'projects': {
      const fields: string[] = [];
      const replacements: any = { id };
      const fieldMap: Record<string, string> = {
        name: 'name', description: 'description', status: 'status', priority: 'priority',
        category: 'category', projectType: 'project_type', clientName: 'client_name',
        managerName: 'manager_name', startDate: 'start_date', endDate: 'end_date',
        actualStartDate: 'actual_start_date', actualEndDate: 'actual_end_date',
        budgetAmount: 'budget_amount', actualCost: 'actual_cost', progressPercent: 'progress_percent',
        notes: 'notes'
      };
      for (const [key, col] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) { fields.push(`${col} = :${key}`); replacements[key] = data[key]; }
      }
      if (data.tags !== undefined) { fields.push(`tags = :tags`); replacements.tags = JSON.stringify(data.tags); }
      if (fields.length === 0) return res.status(400).json(errorResponse('NO_FIELDS', 'No fields to update'));
      fields.push('updated_at = NOW()');
      const [result] = await sequelize.query(`UPDATE pjm_projects SET ${fields.join(', ')} WHERE id = :id RETURNING *`, { replacements });
      return res.status(200).json(successResponse(result[0]));
    }
    case 'tasks': {
      const fields: string[] = [];
      const replacements: any = { id };
      const fieldMap: Record<string, string> = {
        name: 'name', description: 'description', status: 'status', priority: 'priority',
        taskType: 'task_type', assigneeName: 'assignee_name', startDate: 'start_date',
        dueDate: 'due_date', completedDate: 'completed_date', estimatedHours: 'estimated_hours',
        actualHours: 'actual_hours', progressPercent: 'progress_percent', sortOrder: 'sort_order',
        milestoneId: 'milestone_id'
      };
      for (const [key, col] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) { fields.push(`${col} = :${key}`); replacements[key] = data[key]; }
      }
      if (fields.length === 0) return res.status(400).json(errorResponse('NO_FIELDS', 'No fields to update'));
      fields.push('updated_at = NOW()');
      const [result] = await sequelize.query(`UPDATE pjm_tasks SET ${fields.join(', ')} WHERE id = :id RETURNING *`, { replacements });
      return res.status(200).json(successResponse(result[0]));
    }
    case 'milestones': {
      const fields: string[] = [];
      const replacements: any = { id };
      if (data.name !== undefined) { fields.push('name = :name'); replacements.name = data.name; }
      if (data.description !== undefined) { fields.push('description = :description'); replacements.description = data.description; }
      if (data.status !== undefined) { fields.push('status = :status'); replacements.status = data.status; }
      if (data.dueDate !== undefined) { fields.push('due_date = :dueDate'); replacements.dueDate = data.dueDate; }
      if (data.completedDate !== undefined) { fields.push('completed_date = :completedDate'); replacements.completedDate = data.completedDate; }
      if (fields.length === 0) return res.status(400).json(errorResponse('NO_FIELDS', 'No fields to update'));
      fields.push('updated_at = NOW()');
      const [result] = await sequelize.query(`UPDATE pjm_milestones SET ${fields.join(', ')} WHERE id = :id RETURNING *`, { replacements });
      return res.status(200).json(successResponse(result[0]));
    }
    case 'timesheets': {
      const fields: string[] = [];
      const replacements: any = { id };
      if (data.hoursWorked !== undefined) { fields.push('hours_worked = :hoursWorked'); replacements.hoursWorked = data.hoursWorked; }
      if (data.description !== undefined) { fields.push('description = :description'); replacements.description = data.description; }
      if (data.status !== undefined) { fields.push('status = :status'); replacements.status = data.status; }
      if (fields.length === 0) return res.status(400).json(errorResponse('NO_FIELDS', 'No fields to update'));
      fields.push('updated_at = NOW()');
      const [result] = await sequelize.query(`UPDATE pjm_timesheets SET ${fields.join(', ')} WHERE id = :id RETURNING *`, { replacements });
      return res.status(200).json(successResponse(result[0]));
    }
    case 'risks': {
      const fields: string[] = [];
      const replacements: any = { id };
      const fieldMap: Record<string, string> = {
        title: 'title', description: 'description', category: 'category', probability: 'probability',
        impact: 'impact', status: 'status', mitigationPlan: 'mitigation_plan', contingencyPlan: 'contingency_plan',
        ownerName: 'owner_name', resolvedDate: 'resolved_date'
      };
      for (const [key, col] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) { fields.push(`${col} = :${key}`); replacements[key] = data[key]; }
      }
      if (data.probability || data.impact) {
        const probScore: Record<string, number> = { low: 1, medium: 2, high: 3, very_high: 4 };
        const impScore: Record<string, number> = { low: 1, medium: 2, high: 3, very_high: 4 };
        const rs = (probScore[data.probability || 'medium'] || 2) * (impScore[data.impact || 'medium'] || 2);
        fields.push('risk_score = :riskScore'); replacements.riskScore = rs;
      }
      if (fields.length === 0) return res.status(400).json(errorResponse('NO_FIELDS', 'No fields to update'));
      fields.push('updated_at = NOW()');
      const [result] = await sequelize.query(`UPDATE pjm_risks SET ${fields.join(', ')} WHERE id = :id RETURNING *`, { replacements });
      return res.status(200).json(successResponse(result[0]));
    }
    default:
      return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown PUT action: ${action}`));
  }
}

// ==========================================
// DELETE HANDLERS
// ==========================================
async function handleDelete(req: NextApiRequest, res: NextApiResponse, action: string) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('MISSING_ID', 'ID is required'));

  const tableMap: Record<string, string> = {
    projects: 'pjm_projects', tasks: 'pjm_tasks', milestones: 'pjm_milestones',
    timesheets: 'pjm_timesheets', resources: 'pjm_resources', risks: 'pjm_risks',
    budgets: 'pjm_budgets', documents: 'pjm_documents'
  };

  const table = tableMap[action];
  if (!table) return res.status(400).json(errorResponse('INVALID_ACTION', `Unknown DELETE action: ${action}`));

  await sequelize.query(`DELETE FROM ${table} WHERE id = :id`, { replacements: { id } });
  return res.status(200).json(successResponse({ deleted: true }));
}
