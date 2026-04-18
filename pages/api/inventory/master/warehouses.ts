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
      case 'GET': {
        const { search, is_active } = req.query;
        let sql = 'SELECT * FROM warehouses WHERE 1=1';
        const params: unknown[] = [];
        let i = 1;
        if (search) {
          sql += ` AND (name ILIKE $${i} OR code ILIKE $${i} OR city ILIKE $${i})`;
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
        return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
      }

      case 'POST':
        const { code, name, description, address, city, province, manager_name, phone, email, is_main } = req.body;
        if (!code || !name) {
          return res.status(400).json({ success: false, error: 'Code and name are required' });
        }
        const insertResult = await pool.query(
          `INSERT INTO warehouses (code, name, description, address, city, province, manager_name, phone, email, is_main, created_by, updated_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11) RETURNING *`,
          [code, name, description, address, city, province, manager_name, phone, email, is_main || false, (session.user as any)?.id || 1]
        );
        return res.status(201).json({ success: true, data: insertResult.rows[0] });

      case 'PUT':
        const { id, ...updateData } = req.body;
        const fields = Object.keys(updateData).filter(k => updateData[k] !== undefined);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = [...fields.map(f => updateData[f]), id];
        const updateResult = await pool.query(`UPDATE warehouses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`, values);
        return res.status(200).json({ success: true, data: updateResult.rows[0] });

      case 'DELETE':
        const { id: deleteId } = req.query;
        await pool.query('DELETE FROM warehouses WHERE id = $1', [deleteId]);
        return res.status(200).json({ success: true, message: 'Warehouse deleted' });

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
