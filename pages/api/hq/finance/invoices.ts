import type { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';

let Invoice: any, Branch: any;
try {
  const InvoiceModel = require('../../../../models/finance/Invoice');
  const models = require('../../../../models');
  
  Invoice = InvoiceModel.default || InvoiceModel;
  Branch = models.Branch;
} catch (e) {
  console.warn('Finance Invoice models not available:', e);
  Invoice = null;
  Branch = null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getInvoices(req, res);
      case 'POST':
        return await createInvoice(req, res);
      case 'PUT':
        return await updateInvoice(req, res);
      case 'DELETE':
        return await deleteInvoice(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Finance Invoices API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getInvoices(req: NextApiRequest, res: NextApiResponse) {
  if (!Invoice) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Invoice model not available')
    );
  }

  const { search, status, branchId, startDate, endDate } = req.query;
  const { limit, offset } = getPaginationParams(req.query);

  try {
    const where: any = {};
    
    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    if (startDate && endDate) {
      where.invoiceDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'code', 'name'] }
      ],
      order: [['invoiceDate', 'DESC']],
      limit,
      offset
    });

    return res.status(HttpStatus.OK).json(
      successResponse(rows, getPaginationMeta(count, limit, offset))
    );
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to fetch invoices')
    );
  }
}

async function createInvoice(req: NextApiRequest, res: NextApiResponse) {
  if (!Invoice) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Invoice model not available')
    );
  }

  const {
    tenantId,
    branchId,
    invoiceDate,
    dueDate,
    type,
    customerName,
    customerEmail,
    customerPhone,
    totalAmount,
    taxAmount,
    discountAmount,
    items,
    createdBy
  } = req.body;

  if (!tenantId || !invoiceDate || !type || !customerName || !totalAmount || !createdBy) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(
        ErrorCodes.MISSING_REQUIRED_FIELDS,
        'Missing required fields: tenantId, invoiceDate, type, customerName, totalAmount, createdBy'
      )
    );
  }

  try {
    // Generate invoice number
    const today = new Date();
    const prefix = type === 'sales' ? 'INV' : type === 'purchase' ? 'PINV' : 'IBINV';
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Invoice.count({
      where: {
        invoiceNumber: { [Op.like]: `${prefix}-${dateStr}%` }
      }
    });
    const invoiceNumber = `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      tenantId,
      branchId,
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      type,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: parseFloat(totalAmount),
      taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
      outstandingAmount: parseFloat(totalAmount),
      status: 'draft',
      items: items || [],
      createdBy
    });

    return res.status(HttpStatus.CREATED).json(
      successResponse(invoice, undefined, 'Invoice created successfully')
    );
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, error.message)
      );
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to create invoice')
    );
  }
}

async function updateInvoice(req: NextApiRequest, res: NextApiResponse) {
  if (!Invoice) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Invoice model not available')
    );
  }

  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invoice ID is required')
    );
  }

  try {
    const invoice = await Invoice.findByPk(id);
    
    if (!invoice) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Invoice not found')
      );
    }

    // Don't allow updating paid invoices
    if (invoice.status === 'paid') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot update paid invoice')
      );
    }

    await invoice.update(updateData);

    return res.status(HttpStatus.OK).json(
      successResponse(invoice, undefined, 'Invoice updated successfully')
    );
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to update invoice')
    );
  }
}

async function deleteInvoice(req: NextApiRequest, res: NextApiResponse) {
  if (!Invoice) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Invoice model not available')
    );
  }

  const { id } = req.query;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invoice ID is required')
    );
  }

  try {
    const invoice = await Invoice.findByPk(id);
    
    if (!invoice) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Invoice not found')
      );
    }

    // Don't allow deleting paid invoices
    if (invoice.status === 'paid') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot delete paid invoice')
      );
    }

    await invoice.update({ status: 'cancelled' });

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'Invoice cancelled successfully')
    );
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to delete invoice')
    );
  }
}
