import type { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';

let Transaction: any, Account: any, Branch: any;
try {
  const TransactionModel = require('../../../../models/finance/Transaction');
  const AccountModel = require('../../../../models/finance/Account');
  const models = require('../../../../models');
  
  Transaction = TransactionModel.default || TransactionModel;
  Account = AccountModel.default || AccountModel;
  Branch = models.Branch;
} catch (e) {
  console.warn('Finance models not available:', e);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getTransactions(req, res);
      case 'POST':
        return await createTransaction(req, res);
      case 'PUT':
        return await updateTransaction(req, res);
      case 'DELETE':
        return await deleteTransaction(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Finance Transactions API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getTransactions(req: NextApiRequest, res: NextApiResponse) {
  if (!Transaction) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Transaction model not available')
    );
  }

  const { search, type, status, branchId, startDate, endDate } = req.query;
  const { limit, offset } = getPaginationParams(req.query);

  try {
    const where: any = {};
    
    if (search) {
      where[Op.or] = [
        { transactionNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'code', 'name'] },
        { model: Account, as: 'account', attributes: ['id', 'accountCode', 'accountName'] }
      ],
      order: [['transactionDate', 'DESC']],
      limit,
      offset
    });

    return res.status(HttpStatus.OK).json(
      successResponse(rows, getPaginationMeta(count, limit, offset))
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to fetch transactions')
    );
  }
}

async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
  if (!Transaction) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Transaction model not available')
    );
  }

  const {
    tenantId,
    branchId,
    transactionDate,
    type,
    category,
    accountId,
    debitAccountId,
    creditAccountId,
    amount,
    currency = 'IDR',
    description,
    reference,
    paymentMethod,
    createdBy
  } = req.body;

  if (!tenantId || !transactionDate || !type || !accountId || !amount || !description || !createdBy) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(
        ErrorCodes.MISSING_REQUIRED_FIELDS,
        'Missing required fields: tenantId, transactionDate, type, accountId, amount, description, createdBy'
      )
    );
  }

  try {
    // Generate transaction number
    const today = new Date();
    const prefix = type === 'income' ? 'INC' : type === 'expense' ? 'EXP' : 'TRF';
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Transaction.count({
      where: {
        transactionNumber: { [Op.like]: `${prefix}-${dateStr}%` }
      }
    });
    const transactionNumber = `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const transaction = await Transaction.create({
      tenantId,
      branchId,
      transactionNumber,
      transactionDate: new Date(transactionDate),
      type,
      category,
      accountId,
      debitAccountId,
      creditAccountId,
      amount: parseFloat(amount),
      currency,
      description,
      reference,
      status: 'draft',
      paymentMethod,
      createdBy
    });

    return res.status(HttpStatus.CREATED).json(
      successResponse(transaction, undefined, 'Transaction created successfully')
    );
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, error.message)
      );
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to create transaction')
    );
  }
}

async function updateTransaction(req: NextApiRequest, res: NextApiResponse) {
  if (!Transaction) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Transaction model not available')
    );
  }

  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Transaction ID is required')
    );
  }

  try {
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Transaction not found')
      );
    }

    // Don't allow updating completed transactions
    if (transaction.status === 'completed') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot update completed transaction')
      );
    }

    await transaction.update(updateData);

    return res.status(HttpStatus.OK).json(
      successResponse(transaction, undefined, 'Transaction updated successfully')
    );
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to update transaction')
    );
  }
}

async function deleteTransaction(req: NextApiRequest, res: NextApiResponse) {
  if (!Transaction) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Transaction model not available')
    );
  }

  const { id } = req.query;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Transaction ID is required')
    );
  }

  try {
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Transaction not found')
      );
    }

    // Don't allow deleting completed transactions
    if (transaction.status === 'completed') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot delete completed transaction')
      );
    }

    await transaction.update({ status: 'cancelled' });

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'Transaction cancelled successfully')
    );
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to delete transaction')
    );
  }
}
