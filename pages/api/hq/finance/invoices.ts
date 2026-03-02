import type { NextApiRequest, NextApiResponse } from 'next';
const sequelize = require('../../../../lib/sequelize');
import { successResponse, errorResponse } from '../../../../lib/api/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': return await getInvoices(req, res);
      case 'POST': return await createInvoice(req, res);
      case 'PUT': return await updateInvoice(req, res);
      case 'DELETE': return await deleteInvoice(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', `Method ${req.method} Not Allowed`));
    }
  } catch (error: any) {
    console.error('Finance Invoices API Error:', error);
    return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message || 'Internal server error'));
  }
}

async function getInvoices(req: NextApiRequest, res: NextApiResponse) {
  const { search, status, branchId, startDate, endDate, type, page = '1', limit = '20' } = req.query;
  let where = 'WHERE 1=1';
  const replacements: any = {};

  if (search) { where += ' AND (fi.invoice_number ILIKE :search OR s.name ILIKE :search)'; replacements.search = `%${search}%`; }
  if (status && status !== 'all') { where += ' AND fi.status = :status'; replacements.status = status; }
  if (type && type !== 'all') { where += ' AND fi.type = :type'; replacements.type = type; }
  if (branchId && branchId !== 'all') { where += ' AND fi.branch_id = :branchId'; replacements.branchId = branchId; }
  if (startDate && endDate) { where += ' AND fi.issue_date BETWEEN :startDate AND :endDate'; replacements.startDate = startDate; replacements.endDate = endDate; }

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM finance_invoices fi LEFT JOIN suppliers s ON fi.supplier_id = s.id ${where}`, { replacements });
  const [rows] = await sequelize.query(`
    SELECT fi.*, b.name as branch_name,
      COALESCE(c.name, '') as customer_name, COALESCE(s.name, '') as supplier_name,
      (SELECT COALESCE(SUM(fii.total), 0) FROM finance_invoice_items fii WHERE fii.invoice_id = fi.id) as items_total,
      (SELECT COUNT(*) FROM finance_invoice_items fii WHERE fii.invoice_id = fi.id) as item_count
    FROM finance_invoices fi
    LEFT JOIN branches b ON fi.branch_id = b.id
    LEFT JOIN customers c ON fi.customer_id = c.id
    LEFT JOIN suppliers s ON fi.supplier_id = s.id
    ${where}
    ORDER BY fi.created_at DESC
    LIMIT :limit OFFSET :offset
  `, { replacements: { ...replacements, limit: parseInt(limit as string), offset } });

  return res.status(200).json(successResponse(rows, {
    total: parseInt(countResult[0]?.total || '0'),
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    totalPages: Math.ceil(parseInt(countResult[0]?.total || '0') / parseInt(limit as string))
  }));
}

async function createInvoice(req: NextApiRequest, res: NextApiResponse) {
  const { tenant_id, branch_id, type, customer_id, supplier_id, issue_date, due_date, subtotal, tax_amount, discount_amount, total_amount, notes, created_by, items } = req.body;
  if (!type || !issue_date || !total_amount) return res.status(400).json(errorResponse('VALIDATION', 'type, issue_date, total_amount required'));

  const t = await sequelize.transaction();
  try {
    const prefix = type === 'sales' ? 'INV' : type === 'purchase' ? 'PINV' : 'IBINV';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countRes] = await sequelize.query(`SELECT COUNT(*) as c FROM finance_invoices WHERE invoice_number LIKE '${prefix}-${dateStr}%'`, { transaction: t });
    const invoiceNumber = `${prefix}-${dateStr}-${String(parseInt(countRes[0]?.c || '0') + 1).padStart(4, '0')}`;

    const [inv] = await sequelize.query(`
      INSERT INTO finance_invoices (tenant_id, branch_id, invoice_number, type, customer_id, supplier_id, issue_date, due_date, subtotal, tax_amount, discount_amount, total_amount, paid_amount, status, notes, created_by)
      VALUES (:tenant_id, :branch_id, :invoice_number, :type, :customer_id, :supplier_id, :issue_date, :due_date, :subtotal, :tax_amount, :discount_amount, :total_amount, 0, 'draft', :notes, :created_by)
      RETURNING *
    `, { replacements: { tenant_id: tenant_id || null, branch_id: branch_id || null, invoice_number: invoiceNumber, type, customer_id: customer_id || null, supplier_id: supplier_id || null, issue_date, due_date: due_date || null, subtotal: subtotal || 0, tax_amount: tax_amount || 0, discount_amount: discount_amount || 0, total_amount, notes: notes || null, created_by: created_by || null }, transaction: t });

    if (items && items.length > 0) {
      for (const item of items) {
        await sequelize.query(`
          INSERT INTO finance_invoice_items (invoice_id, product_id, description, quantity, unit_price, discount, tax, total)
          VALUES (:invoice_id, :product_id, :description, :quantity, :unit_price, :discount, :tax, :total)
        `, { replacements: { invoice_id: inv[0].id, product_id: item.product_id || null, description: item.description || '', quantity: item.quantity || 1, unit_price: item.unit_price || 0, discount: item.discount || 0, tax: item.tax || 0, total: item.total || 0 }, transaction: t });
      }
    }

    await t.commit();
    return res.status(201).json(successResponse(inv[0], undefined, 'Invoice created'));
  } catch (error: any) {
    await t.rollback();
    throw error;
  }
}

async function updateInvoice(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('VALIDATION', 'ID required'));

  const { status, paid_amount, notes, due_date } = req.body;
  const sets: string[] = [];
  const replacements: any = { id };

  if (status) { sets.push('status = :status'); replacements.status = status; }
  if (paid_amount !== undefined) { sets.push('paid_amount = :paid_amount'); replacements.paid_amount = paid_amount; }
  if (notes !== undefined) { sets.push('notes = :notes'); replacements.notes = notes; }
  if (due_date) { sets.push('due_date = :due_date'); replacements.due_date = due_date; }
  sets.push('updated_at = NOW()');

  const [rows] = await sequelize.query(`UPDATE finance_invoices SET ${sets.join(', ')} WHERE id = :id RETURNING *`, { replacements });
  if (!rows[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'Invoice not found'));
  return res.status(200).json(successResponse(rows[0], undefined, 'Invoice updated'));
}

async function deleteInvoice(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json(errorResponse('VALIDATION', 'ID required'));

  const [rows] = await sequelize.query(`UPDATE finance_invoices SET status = 'cancelled', updated_at = NOW() WHERE id = :id AND status != 'paid' RETURNING *`, { replacements: { id } });
  if (!rows[0]) return res.status(404).json(errorResponse('NOT_FOUND', 'Invoice not found or already paid'));
  return res.status(200).json(successResponse(rows[0], undefined, 'Invoice cancelled'));
}
