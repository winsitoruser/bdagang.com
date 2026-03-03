import { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';
import { getTenantContext } from '../../../../lib/middleware/tenantIsolation';
import { logAudit } from '../../../../lib/audit/auditLogger';
import { validateBody, V, sanitizeBody } from '../../../../lib/middleware/withValidation';
import { checkLimit, RateLimitTier } from '../../../../lib/middleware/rateLimit';
import { 
  mockVehicles, 
  createMockVehicle,
  MockVehicle 
} from '../../../../lib/mockData/fleet';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return getVehicles(req, res);
      case 'POST':
        return createVehicle(req, res);
      case 'PUT':
        return updateVehicle(req, res);
      case 'DELETE':
        return deleteVehicle(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Fleet Vehicles API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

export default withHQAuth(handler, { module: 'fleet' });

async function getVehicles(req: NextApiRequest, res: NextApiResponse) {
  const { status, type, branch, search } = req.query;

  let vehicles = [...mockVehicles];

  // Apply filters
  if (status && status !== 'all') {
    vehicles = vehicles.filter(v => v.status === status);
  }
  if (type && type !== 'all') {
    vehicles = vehicles.filter(v => v.vehicleType === type);
  }
  if (branch && branch !== 'all') {
    vehicles = vehicles.filter(v => v.assignedBranchId === branch);
  }
  if (search) {
    const searchStr = (search as string).toLowerCase();
    vehicles = vehicles.filter(v => 
      v.licensePlate.toLowerCase().includes(searchStr) ||
      v.brand?.toLowerCase().includes(searchStr) ||
      v.model?.toLowerCase().includes(searchStr)
    );
  }

  // Get stats
  const stats = {
    total: mockVehicles.length,
    active: mockVehicles.filter(v => v.status === 'active').length,
    maintenance: mockVehicles.filter(v => v.status === 'maintenance').length,
    onRoute: mockVehicles.filter(v => v.status === 'active' && v.assignedDriverId).length,
    inactive: mockVehicles.filter(v => v.status === 'inactive').length
  };

  return res.status(HttpStatus.OK).json(
    successResponse({ vehicles, stats })
  );
}

async function createVehicle(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  sanitizeBody(req);
  const errors = validateBody(req, {
    licensePlate: V.required().string().minLength(3).maxLength(20),
    vehicleType: V.required().oneOf(['truck', 'van', 'pickup', 'motorcycle', 'car', 'bus']),
  });
  if (errors) return res.status(HttpStatus.BAD_REQUEST).json(errors);

  const ctx = getTenantContext(req);
  const {
    licensePlate,
    vehicleType,
    brand,
    model,
    year,
    color,
    ownershipType,
    purchaseDate,
    purchasePrice,
    maxWeightKg,
    maxVolumeM3,
    fuelTankCapacity,
    registrationNumber,
    registrationExpiry,
    insurancePolicyNumber,
    insuranceProvider,
    insuranceExpiry,
    assignedBranchId,
    notes
  } = req.body;

  // Check duplicate license plate
  const existing = mockVehicles.find(v => v.licensePlate === licensePlate);
  if (existing) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'Vehicle with this license plate already exists')
    );
  }

  const newVehicle = createMockVehicle({
    licensePlate,
    vehicleType,
    brand,
    model,
    year,
    color,
    ownershipType,
    purchaseDate,
    purchasePrice,
    maxWeightKg,
    maxVolumeM3,
    fuelTankCapacity,
    registrationNumber,
    registrationExpiry,
    insurancePolicyNumber,
    insuranceProvider,
    insuranceExpiry,
    assignedBranchId,
    notes
  });

  // TODO: When database is ready, replace with:
  // const vehicle = await db.FleetVehicle.create({...});

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'create', entityType: 'fleet_vehicle', entityId: newVehicle.id, newValues: { licensePlate, vehicleType, brand, model }, req });

  return res.status(HttpStatus.CREATED).json(
    successResponse(newVehicle, undefined, 'Vehicle created successfully')
  );
}

async function updateVehicle(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  sanitizeBody(req);
  const ctx = getTenantContext(req);
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Vehicle ID is required')
    );
  }

  const vehicleIndex = mockVehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Vehicle not found')
    );
  }

  const oldValues = { ...mockVehicles[vehicleIndex] };
  Object.assign(mockVehicles[vehicleIndex], updates);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'update', entityType: 'fleet_vehicle', entityId: id, oldValues, newValues: updates, req });

  return res.status(HttpStatus.OK).json(
    successResponse(mockVehicles[vehicleIndex], undefined, 'Vehicle updated successfully')
  );
}

async function deleteVehicle(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  const ctx = getTenantContext(req);
  const { id } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Vehicle ID is required')
    );
  }

  const vehicleIndex = mockVehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Vehicle not found')
    );
  }

  const deleted = mockVehicles[vehicleIndex];
  mockVehicles.splice(vehicleIndex, 1);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'delete', entityType: 'fleet_vehicle', entityId: id, oldValues: deleted, req });

  return res.status(HttpStatus.OK).json(
    successResponse(null, undefined, 'Vehicle deleted successfully')
  );
}
