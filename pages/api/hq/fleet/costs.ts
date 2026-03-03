import { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';
import { getTenantContext } from '../../../../lib/middleware/tenantIsolation';
import { logAudit } from '../../../../lib/audit/auditLogger';
import { validateBody, V, sanitizeBody } from '../../../../lib/middleware/withValidation';
import { checkLimit, RateLimitTier } from '../../../../lib/middleware/rateLimit';

// Mock cost data
const mockCosts: any[] = [
  {
    id: 'cost-1',
    vehicleId: 'veh-1',
    vehicleLicensePlate: 'B 1234 ABC',
    costType: 'fuel',
    amount: 2500000,
    date: '2026-02-01',
    description: 'Biaya bahan bakar Februari',
    category: 'operational'
  },
  {
    id: 'cost-2',
    vehicleId: 'veh-1',
    vehicleLicensePlate: 'B 1234 ABC',
    costType: 'maintenance',
    amount: 500000,
    date: '2026-02-15',
    description: 'Service rutin',
    category: 'maintenance'
  },
  {
    id: 'cost-3',
    vehicleId: 'veh-2',
    vehicleLicensePlate: 'B 5678 DEF',
    costType: 'insurance',
    amount: 3000000,
    date: '2026-02-01',
    description: 'Asuransi tahunan',
    category: 'fixed'
  }
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return getCosts(req, res);
      case 'POST':
        return createCost(req, res);
      case 'PUT':
        return updateCost(req, res);
      case 'DELETE':
        return deleteCost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Fleet Costs API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

export default withHQAuth(handler, { module: 'fleet' });

async function getCosts(req: NextApiRequest, res: NextApiResponse) {
  const { vehicleId, costType, category, startDate, endDate, search } = req.query;

  let costs = [...mockCosts];

  // Apply filters
  if (vehicleId) {
    costs = costs.filter(c => c.vehicleId === vehicleId);
  }
  if (costType && costType !== 'all') {
    costs = costs.filter(c => c.costType === costType);
  }
  if (category && category !== 'all') {
    costs = costs.filter(c => c.category === category);
  }
  if (startDate) {
    costs = costs.filter(c => c.date >= startDate);
  }
  if (endDate) {
    costs = costs.filter(c => c.date <= endDate);
  }
  if (search) {
    const searchStr = (search as string).toLowerCase();
    costs = costs.filter(c => 
      c.vehicleLicensePlate?.toLowerCase().includes(searchStr) ||
      c.description?.toLowerCase().includes(searchStr)
    );
  }

  // Calculate summary
  const totalCost = costs.reduce((sum, c) => sum + (c.amount || 0), 0);
  const summary = {
    totalCosts: costs.length,
    totalAmount: totalCost,
    byType: {
      fuel: costs.filter(c => c.costType === 'fuel').reduce((sum, c) => sum + c.amount, 0),
      maintenance: costs.filter(c => c.costType === 'maintenance').reduce((sum, c) => sum + c.amount, 0),
      insurance: costs.filter(c => c.costType === 'insurance').reduce((sum, c) => sum + c.amount, 0),
      other: costs.filter(c => c.costType === 'other').reduce((sum, c) => sum + c.amount, 0)
    },
    byCategory: {
      operational: costs.filter(c => c.category === 'operational').reduce((sum, c) => sum + c.amount, 0),
      maintenance: costs.filter(c => c.category === 'maintenance').reduce((sum, c) => sum + c.amount, 0),
      fixed: costs.filter(c => c.category === 'fixed').reduce((sum, c) => sum + c.amount, 0)
    }
  };

  return res.status(HttpStatus.OK).json(
    successResponse({ costs, summary })
  );
}

async function createCost(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  sanitizeBody(req);
  const errors = validateBody(req, {
    vehicleId: V.required().string(),
    costType: V.required().oneOf(['fuel', 'maintenance', 'insurance', 'toll', 'parking', 'other']),
    amount: V.required().number().min(0),
    date: V.required().date(),
  });
  if (errors) return res.status(HttpStatus.BAD_REQUEST).json(errors);

  const ctx = getTenantContext(req);
  const {
    vehicleId,
    costType,
    amount,
    date,
    description,
    category
  } = req.body;

  const newCost = {
    id: `cost-${Date.now()}`,
    vehicleId,
    costType,
    amount,
    date,
    description,
    category: category || 'operational',
    createdAt: new Date().toISOString()
  };

  mockCosts.push(newCost);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'create', entityType: 'fleet_cost', entityId: newCost.id, newValues: { vehicleId, costType, amount }, req });

  return res.status(HttpStatus.CREATED).json(
    successResponse(newCost, undefined, 'Cost record created successfully')
  );
}

async function updateCost(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  sanitizeBody(req);
  const ctx = getTenantContext(req);
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Cost ID is required')
    );
  }

  const costIndex = mockCosts.findIndex(c => c.id === id);
  if (costIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Cost record not found')
    );
  }

  const oldValues = { ...mockCosts[costIndex] };
  Object.assign(mockCosts[costIndex], updates);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'update', entityType: 'fleet_cost', entityId: id, oldValues, newValues: updates, req });

  return res.status(HttpStatus.OK).json(
    successResponse(mockCosts[costIndex], undefined, 'Cost record updated successfully')
  );
}

async function deleteCost(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  const ctx = getTenantContext(req);
  const { id } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Cost ID is required')
    );
  }

  const costIndex = mockCosts.findIndex(c => c.id === id);
  if (costIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Cost record not found')
    );
  }

  const deleted = mockCosts[costIndex];
  mockCosts.splice(costIndex, 1);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'delete', entityType: 'fleet_cost', entityId: id, oldValues: deleted, req });

  return res.status(HttpStatus.OK).json(
    successResponse(null, undefined, 'Cost record deleted successfully')
  );
}
