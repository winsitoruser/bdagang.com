import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

let sequelize: any;
try { sequelize = require('../../../../lib/sequelize'); } catch (e) {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { action, employeeId } = req.query;

    if (req.method === 'GET') {
      if (action === 'list') return getEmployeeList(req, res, session);
      if (action === 'detail' && employeeId) return getEmployeeDetail(req, res, session, String(employeeId));
      if (action === 'families' && employeeId) return getSubData(req, res, 'employee_families', String(employeeId));
      if (action === 'educations' && employeeId) return getSubData(req, res, 'employee_educations', String(employeeId));
      if (action === 'certifications' && employeeId) return getSubData(req, res, 'employee_certifications', String(employeeId));
      if (action === 'skills' && employeeId) return getSubData(req, res, 'employee_skills', String(employeeId));
      if (action === 'experiences' && employeeId) return getSubData(req, res, 'employee_work_experiences', String(employeeId));
      if (action === 'documents' && employeeId) return getSubData(req, res, 'employee_documents', String(employeeId));
      if (action === 'contracts' && employeeId) return getSubData(req, res, 'employee_contracts', String(employeeId));
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      if (action === 'family') return upsertSubData(req, res, session, 'employee_families');
      if (action === 'education') return upsertSubData(req, res, session, 'employee_educations');
      if (action === 'certification') return upsertSubData(req, res, session, 'employee_certifications');
      if (action === 'skill') return upsertSubData(req, res, session, 'employee_skills');
      if (action === 'experience') return upsertSubData(req, res, session, 'employee_work_experiences');
      if (action === 'document') return upsertSubData(req, res, session, 'employee_documents');
      if (action === 'contract') return upsertSubData(req, res, session, 'employee_contracts');
      if (action === 'update-personal') return updatePersonal(req, res, session);
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'DELETE') {
      if (action === 'family') return deleteSubData(req, res, 'employee_families');
      if (action === 'education') return deleteSubData(req, res, 'employee_educations');
      if (action === 'certification') return deleteSubData(req, res, 'employee_certifications');
      if (action === 'skill') return deleteSubData(req, res, 'employee_skills');
      if (action === 'experience') return deleteSubData(req, res, 'employee_work_experiences');
      if (action === 'document') return deleteSubData(req, res, 'employee_documents');
      if (action === 'contract') return deleteSubData(req, res, 'employee_contracts');
      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Employee Profile API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// ===== GET: Employee List =====
async function getEmployeeList(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (!sequelize) return res.json({ success: true, data: [] });
  const { search, department, status, page = '1', limit = '20' } = req.query;
  const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));

  let where = "WHERE 1=1";
  const replacements: any = {};

  if (search) {
    where += " AND (e.name ILIKE :search OR e.employee_id ILIKE :search OR e.email ILIKE :search)";
    replacements.search = `%${search}%`;
  }
  if (department) {
    where += " AND e.department = :department";
    replacements.department = department;
  }
  if (status) {
    where += " AND e.status = :status";
    replacements.status = status;
  }

  const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM employees e ${where}`, { replacements });
  const total = parseInt(countResult[0].total);

  const [employees] = await sequelize.query(`
    SELECT e.id, e.employee_id, e.name, e.email, e.phone_number, e.position, e.department,
      e.status, e.join_date, e.contract_type, e.contract_end, e.photo_url, e.gender,
      e.branch_id, b.name as branch_name,
      jg.code as grade_code, jg.name as grade_name
    FROM employees e
    LEFT JOIN branches b ON e.branch_id = b.id
    LEFT JOIN job_grades jg ON e.job_grade_id = jg.id
    ${where}
    ORDER BY e.name ASC
    LIMIT :limit OFFSET :offset
  `, { replacements: { ...replacements, limit: parseInt(String(limit)), offset } });

  return res.json({ success: true, data: employees, total, page: parseInt(String(page)), limit: parseInt(String(limit)) });
}

// ===== GET: Employee Detail with all sub-data =====
async function getEmployeeDetail(req: NextApiRequest, res: NextApiResponse, session: any, empId: string) {
  if (!sequelize) return res.json({ success: true, data: null });

  const [employees] = await sequelize.query(`
    SELECT e.*, b.name as branch_name,
      jg.code as grade_code, jg.name as grade_name, jg.level as grade_level,
      os.name as org_name, os.code as org_code,
      sup.name as supervisor_name, sup.employee_id as supervisor_code
    FROM employees e
    LEFT JOIN branches b ON e.branch_id = b.id
    LEFT JOIN job_grades jg ON e.job_grade_id = jg.id
    LEFT JOIN org_structures os ON e.org_structure_id = os.id
    LEFT JOIN employees sup ON e.supervisor_id::integer = sup.id
    WHERE e.id = :empId
  `, { replacements: { empId } });

  if (!employees[0]) return res.status(404).json({ success: false, error: 'Employee not found' });

  const emp = employees[0];

  // Fetch all sub-data in parallel
  const [families] = await sequelize.query(`SELECT * FROM employee_families WHERE employee_id = :empId ORDER BY relationship, name`, { replacements: { empId } });
  const [educations] = await sequelize.query(`SELECT * FROM employee_educations WHERE employee_id = :empId ORDER BY end_year DESC NULLS LAST`, { replacements: { empId } });
  const [certifications] = await sequelize.query(`SELECT * FROM employee_certifications WHERE employee_id = :empId ORDER BY expiry_date DESC NULLS LAST`, { replacements: { empId } });
  const [skills] = await sequelize.query(`SELECT * FROM employee_skills WHERE employee_id = :empId ORDER BY category, name`, { replacements: { empId } });
  const [experiences] = await sequelize.query(`SELECT * FROM employee_work_experiences WHERE employee_id = :empId ORDER BY start_date DESC NULLS LAST`, { replacements: { empId } });
  const [documents] = await sequelize.query(`SELECT * FROM employee_documents WHERE employee_id = :empId ORDER BY created_at DESC`, { replacements: { empId } });
  const [contracts] = await sequelize.query(`SELECT * FROM employee_contracts WHERE employee_id = :empId ORDER BY start_date DESC`, { replacements: { empId } });

  return res.json({
    success: true,
    data: {
      ...emp,
      families: families || [],
      educations: educations || [],
      certifications: certifications || [],
      skills: skills || [],
      experiences: experiences || [],
      documents: documents || [],
      contracts: contracts || []
    }
  });
}

// ===== GET: Sub-data for a specific table =====
async function getSubData(req: NextApiRequest, res: NextApiResponse, table: string, empId: string) {
  if (!sequelize) return res.json({ success: true, data: [] });
  const allowed = ['employee_families', 'employee_educations', 'employee_certifications', 'employee_skills', 'employee_work_experiences', 'employee_documents', 'employee_contracts'];
  if (!allowed.includes(table)) return res.status(400).json({ error: 'Invalid table' });

  const [rows] = await sequelize.query(`SELECT * FROM ${table} WHERE employee_id = :empId ORDER BY created_at DESC`, { replacements: { empId } });
  return res.json({ success: true, data: rows || [] });
}

// ===== POST: Upsert sub-data =====
async function upsertSubData(req: NextApiRequest, res: NextApiResponse, session: any, table: string) {
  if (!sequelize) return res.json({ success: true, message: 'Mock save' });
  const data = req.body;
  const tenantId = (session.user as any).tenantId;

  if (!data.employee_id) return res.status(400).json({ error: 'employee_id required' });

  // Build columns and values from data
  const id = data.id;
  delete data.created_at;
  delete data.updated_at;

  if (id) {
    // Update
    const setClauses: string[] = [];
    const replacements: any = { id };
    Object.keys(data).forEach(key => {
      if (key === 'id') return;
      setClauses.push(`${key} = :${key}`);
      replacements[key] = data[key];
    });
    setClauses.push('updated_at = NOW()');

    await sequelize.query(`UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = :id`, { replacements });
    return res.json({ success: true, message: 'Updated' });
  } else {
    // Insert
    data.tenant_id = tenantId;
    const cols = Object.keys(data);
    const vals = cols.map(c => `:${c}`);
    const replacements: any = {};
    cols.forEach(c => { replacements[c] = data[c]; });

    const [result] = await sequelize.query(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`,
      { replacements }
    );
    return res.json({ success: true, data: result[0] || result, message: 'Created' });
  }
}

// ===== DELETE: Sub-data =====
async function deleteSubData(req: NextApiRequest, res: NextApiResponse, table: string) {
  if (!sequelize) return res.json({ success: true });
  const { id } = req.body || req.query;
  if (!id) return res.status(400).json({ error: 'id required' });
  await sequelize.query(`DELETE FROM ${table} WHERE id = :id`, { replacements: { id } });
  return res.json({ success: true, message: 'Deleted' });
}

// ===== POST: Update personal info on employees table =====
async function updatePersonal(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (!sequelize) return res.json({ success: true });
  const data = req.body;
  if (!data.id) return res.status(400).json({ error: 'Employee id required' });

  const allowedFields = [
    'name', 'email', 'phone_number', 'address', 'date_of_birth', 'place_of_birth',
    'national_id', 'religion', 'marital_status', 'gender', 'blood_type', 'nationality',
    'identity_type', 'identity_expiry', 'tax_id', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan',
    'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
    'biography', 'photo_url', 'position', 'department', 'work_location', 'branch_id',
    'contract_type', 'contract_start', 'contract_end', 'contract_number',
    'job_grade_id', 'org_structure_id', 'supervisor_id', 'salary_grade', 'specialization', 'license_number'
  ];

  const setClauses: string[] = [];
  const replacements: any = { id: data.id };

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = :${field}`);
      replacements[field] = data[field] === '' ? null : data[field];
    }
  });

  if (setClauses.length === 0) return res.status(400).json({ error: 'No fields to update' });
  setClauses.push('updated_at = NOW()');

  await sequelize.query(`UPDATE employees SET ${setClauses.join(', ')} WHERE id = :id`, { replacements });
  return res.json({ success: true, message: 'Updated' });
}
