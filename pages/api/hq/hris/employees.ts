import type { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';
import { validateRequiredFields } from '../../../../lib/api/validation';

let User: any, Branch: any;
try {
  const models = require('../../../../models');
  User = models.User;
  Branch = models.Branch;
} catch (e) {
  console.warn('HRIS models not available:', e);
  User = null;
  Branch = null;
}

let triggerHRISWebhook: any;
try {
  const webhooks = require('./webhooks');
  triggerHRISWebhook = webhooks.triggerHRISWebhook;
} catch (e) {
  console.warn('HRIS webhooks not available:', e);
  triggerHRISWebhook = null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getEmployees(req, res);
      case 'POST':
        return await createEmployee(req, res);
      case 'PUT':
        return await updateEmployee(req, res);
      case 'DELETE':
        return await deleteEmployee(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('HRIS Employees API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getEmployees(req: NextApiRequest, res: NextApiResponse) {
  if (!User) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'User model not available')
    );
  }

  const { search, department, status, branchId } = req.query;
  const { limit, offset } = getPaginationParams(req.query);

  try {
    const where: any = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (department && department !== 'all') {
      where.department = department;
    }
    
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }
    
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'code', 'name', 'city'] }
      ],
      order: [['name', 'ASC']],
      limit,
      offset
    });

    const employees = rows.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      position: user.role || 'Staff',
      department: user.department || 'Operations',
      branchId: user.branch?.id,
      branchName: user.branch?.name || 'HQ',
      joinDate: user.createdAt,
      status: user.isActive ? 'active' : 'inactive',
      avatar: user.avatar,
      performance: {
        score: Math.floor(Math.random() * 30) + 70,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        kpiAchievement: Math.floor(Math.random() * 30) + 80,
        attendance: Math.floor(Math.random() * 10) + 90,
        rating: (Math.random() * 2 + 3).toFixed(1)
      },
      manager: user.managerId || null
    }));

    return res.status(HttpStatus.OK).json(
      successResponse(employees, getPaginationMeta(count, limit, offset))
    );
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to fetch employees')
    );
  }
}

async function createEmployee(req: NextApiRequest, res: NextApiResponse) {
  if (!User) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'User model not available')
    );
  }

  const { name, email, phone, position, department, branchId, branchName, tenantId } = req.body;

  const validation = validateRequiredFields(req.body, ['name', 'email', 'tenantId']);
  if (!validation.isValid) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(
        ErrorCodes.MISSING_REQUIRED_FIELDS,
        `Missing required fields: ${validation.missingFields.join(', ')}`
      )
    );
  }

  try {
    const user = await User.create({
      tenantId,
      name,
      email,
      phone,
      role: position || 'STAFF',
      department: department || 'Operations',
      branchId,
      isActive: true,
      password: 'default123' // Should be hashed in production
    });

    // Trigger webhook for new employee
    if (triggerHRISWebhook) {
      try {
        await triggerHRISWebhook(
          'employee.created',
          user.get('id') as string,
          name,
          { email, phone, position, department, branchId },
          branchId,
          branchName
        );
      } catch (webhookError) {
        console.warn('Webhook trigger failed:', webhookError);
      }
    }

    return res.status(HttpStatus.CREATED).json(
      successResponse(user, undefined, 'Employee created successfully')
    );
  } catch (error: any) {
    console.error('Error creating employee:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpStatus.CONFLICT).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'Email already exists')
      );
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, error.message)
      );
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to create employee')
    );
  }
}

async function updateEmployee(req: NextApiRequest, res: NextApiResponse) {
  if (!User) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'User model not available')
    );
  }

  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Employee ID is required')
    );
  }

  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Employee not found')
      );
    }

    // Don't allow updating password through this endpoint
    delete updateData.password;

    await user.update(updateData);

    return res.status(HttpStatus.OK).json(
      successResponse(user, undefined, 'Employee updated successfully')
    );
  } catch (error: any) {
    console.error('Error updating employee:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpStatus.CONFLICT).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'Email already exists')
      );
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to update employee')
    );
  }
}

async function deleteEmployee(req: NextApiRequest, res: NextApiResponse) {
  if (!User) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'User model not available')
    );
  }

  const { id } = req.query;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Employee ID is required')
    );
  }

  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Employee not found')
      );
    }

    // Soft delete by setting isActive to false
    await user.update({ isActive: false });

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'Employee deactivated successfully')
    );
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to delete employee')
    );
  }
}
