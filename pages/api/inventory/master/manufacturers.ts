import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        return await getManufacturers(req, res);
      case 'POST':
        return await createManufacturer(req, res, session);
      case 'PUT':
        return await updateManufacturer(req, res, session);
      case 'DELETE':
        return await deleteManufacturer(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in manufacturers API:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getManufacturers(req: NextApiRequest, res: NextApiResponse) {
  const { search, is_active } = req.query;

  let sql = 'SELECT * FROM manufacturers WHERE 1=1';
  const params: unknown[] = [];
  let i = 1;

  if (search) {
    sql += ` AND (name ILIKE $${i} OR code ILIKE $${i} OR contact_person ILIKE $${i})`;
    params.push(`%${search}%`);
    i++;
  }
  if (is_active !== undefined) {
    sql += ` AND is_active = $${i}`;
    params.push(is_active === 'true');
    i++;
  }

  sql += ' ORDER BY name ASC';

  const result = await pool.query(sql, params);
  return res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length,
  });
}

async function createManufacturer(req: NextApiRequest, res: NextApiResponse, session: { user: { id: string } }) {
  const {
    code,
    name,
    description,
    contact_person,
    email,
    phone,
    address,
    city,
    province,
    country,
    website,
    is_active,
  } = req.body;

  if (!code || !name) {
    return res.status(400).json({ success: false, error: 'Code and name are required' });
  }

  const uid = Number(session.user.id) || 1;

  const result = await pool.query(
    `INSERT INTO manufacturers (
      code, name, description, contact_person, email, phone, address, city, province, country, website,
      is_active, created_by, updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, true), $13, $13)
    RETURNING *`,
    [
      code,
      name,
      description || null,
      contact_person || null,
      email || null,
      phone || null,
      address || null,
      city || null,
      province || null,
      country || null,
      website || null,
      is_active,
      uid,
    ]
  );

  return res.status(201).json({
    success: true,
    message: 'Manufacturer created',
    data: result.rows[0],
  });
}

async function updateManufacturer(req: NextApiRequest, res: NextApiResponse, session: { user: { id: string } }) {
  const { id, ...updateData } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID is required' });
  }

  const fields = Object.keys(updateData).filter((k) => updateData[k] !== undefined);
  if (fields.length === 0) {
    return res.status(400).json({ success: false, error: 'No fields to update' });
  }

  const uid = Number(session.user.id) || 1;
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map((field) => updateData[field]);
  values.push(uid, id);

  const result = await pool.query(
    `UPDATE manufacturers SET ${setClause}, updated_by = $${values.length - 1}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Manufacturer not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Manufacturer updated',
    data: result.rows[0],
  });
}

async function deleteManufacturer(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID is required' });
  }

  const result = await pool.query('DELETE FROM manufacturers WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Manufacturer not found' });
  }

  return res.status(200).json({ success: true, message: 'Manufacturer deleted' });
}
