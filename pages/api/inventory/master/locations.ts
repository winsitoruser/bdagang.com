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
        return await getLocations(req, res);
      case 'POST':
        return await createLocation(req, res, session);
      case 'PUT':
        return await updateLocation(req, res, session);
      case 'DELETE':
        return await deleteLocation(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in locations API:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getLocations(req: NextApiRequest, res: NextApiResponse) {
  const { search, warehouse_id, is_active } = req.query;

  let sql = `
    SELECT sl.*, w.name AS warehouse_name, w.code AS warehouse_code
    FROM storage_locations sl
    JOIN warehouses w ON w.id = sl.warehouse_id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  let i = 1;

  if (search) {
    sql += ` AND (sl.name ILIKE $${i} OR sl.code ILIKE $${i} OR sl.aisle ILIKE $${i} OR sl.rack ILIKE $${i})`;
    params.push(`%${search}%`);
    i++;
  }
  if (warehouse_id) {
    sql += ` AND sl.warehouse_id = $${i}`;
    params.push(Number(warehouse_id));
    i++;
  }
  if (is_active !== undefined) {
    sql += ` AND sl.is_active = $${i}`;
    params.push(is_active === 'true');
    i++;
  }

  sql += ' ORDER BY w.name ASC, sl.code ASC';

  const result = await pool.query(sql, params);
  return res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length,
  });
}

async function createLocation(req: NextApiRequest, res: NextApiResponse, session: { user: { id: string } }) {
  const {
    warehouse_id,
    code,
    name,
    aisle,
    rack,
    shelf,
    bin,
    description,
    capacity,
    capacity_unit,
    is_active,
  } = req.body;

  if (!warehouse_id || !code || !name) {
    return res.status(400).json({ success: false, error: 'warehouse_id, code, and name are required' });
  }

  const uid = Number(session.user.id) || 1;

  const result = await pool.query(
    `INSERT INTO storage_locations (
      warehouse_id, code, name, aisle, rack, shelf, bin, description,
      capacity, capacity_unit, is_active, created_by, updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, true), $12, $12)
    RETURNING *`,
    [
      warehouse_id,
      code,
      name,
      aisle || null,
      rack || null,
      shelf || null,
      bin || null,
      description || null,
      capacity ?? null,
      capacity_unit || null,
      is_active,
      uid,
    ]
  );

  return res.status(201).json({
    success: true,
    message: 'Lokasi penyimpanan dibuat',
    data: result.rows[0],
  });
}

async function updateLocation(req: NextApiRequest, res: NextApiResponse, session: { user: { id: string } }) {
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
    `UPDATE storage_locations SET ${setClause}, updated_by = $${values.length - 1}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Location not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Lokasi diperbarui',
    data: result.rows[0],
  });
}

async function deleteLocation(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID is required' });
  }

  const result = await pool.query('DELETE FROM storage_locations WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Location not found' });
  }

  return res.status(200).json({ success: true, message: 'Lokasi dihapus' });
}
