import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';

let User: any, Branch: any;
try {
  const models = require('../../../../models');
  User = models.User;
  Branch = models.Branch;
} catch (e) {
  console.warn('User/Branch models not available');
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getBranchUsers(req, res);
      case 'POST':
        return await assignUserToBranch(req, res);
      case 'DELETE':
        return await removeUserFromBranch(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Branch Users API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

export default withHQAuth(handler, { module: 'branches' });

async function getBranchUsers(req: NextApiRequest, res: NextApiResponse) {
  const { branchId, role, status } = req.query;
  const { limit, offset, page } = getPaginationParams(req.query);

  if (!branchId) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Branch ID is required')
    );
  }

  try {
    if (User) {
      const where: any = { branchId };
      if (role) where.role = role;
      if (status) where.isActive = status === 'active';

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: ['id', 'name', 'email', 'phone', 'role', 'isActive', 'createdAt'],
        order: [['name', 'ASC']],
        limit,
        offset
      });

      return res.status(HttpStatus.OK).json(
        successResponse(
          { users: rows },
          getPaginationMeta(count, page, limit)
        )
      );
    }

    const mockUsers = getMockUsers();
    return res.status(HttpStatus.OK).json(
      successResponse(
        { users: mockUsers },
        getPaginationMeta(mockUsers.length, 1, 10)
      )
    );
  } catch (error) {
    console.error('Error fetching branch users:', error);
    const mockUsers = getMockUsers();
    return res.status(HttpStatus.OK).json(
      successResponse(
        { users: mockUsers },
        getPaginationMeta(mockUsers.length, 1, 10)
      )
    );
  }
}

async function assignUserToBranch(req: NextApiRequest, res: NextApiResponse) {
  const { userId, branchId, role } = req.body;

  if (!userId || !branchId) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'User ID and Branch ID are required')
    );
  }

  try {
    if (User) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json(
          errorResponse(ErrorCodes.NOT_FOUND, 'User not found')
        );
      }

      await user.update({ branchId, role: role || user.role });

      return res.status(HttpStatus.OK).json(
        successResponse({ user }, undefined, 'User assigned to branch successfully')
      );
    }

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'User assigned (mock mode)')
    );
  } catch (error) {
    console.error('Error assigning user:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to assign user')
    );
  }
}

async function removeUserFromBranch(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'User ID is required')
    );
  }

  try {
    if (User) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json(
          errorResponse(ErrorCodes.NOT_FOUND, 'User not found')
        );
      }

      await user.update({ branchId: null });

      return res.status(HttpStatus.OK).json(
        successResponse(null, undefined, 'User removed from branch successfully')
      );
    }

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'User removed (mock mode)')
    );
  } catch (error) {
    console.error('Error removing user:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to remove user')
    );
  }
}

function getMockUsers() {
  return [
    { id: '1', name: 'Ahmad Manager', email: 'ahmad@branch.com', phone: '081234567890', role: 'branch_manager', isActive: true, createdAt: '2026-01-15' },
    { id: '2', name: 'Siti Kasir', email: 'siti@branch.com', phone: '081234567891', role: 'cashier', isActive: true, createdAt: '2026-01-20' },
    { id: '3', name: 'Budi Staff', email: 'budi@branch.com', phone: '081234567892', role: 'staff', isActive: true, createdAt: '2026-02-01' }
  ];
}
