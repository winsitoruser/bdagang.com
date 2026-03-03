import { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { withHQAuth } from '../../../../lib/middleware/withHQAuth';
import { getTenantContext } from '../../../../lib/middleware/tenantIsolation';
import { logAudit } from '../../../../lib/audit/auditLogger';
import { validateBody, V, sanitizeBody } from '../../../../lib/middleware/withValidation';
import { checkLimit, RateLimitTier } from '../../../../lib/middleware/rateLimit';
import { 
  mockDrivers, 
  createMockDriver,
  getAvailableDrivers,
  MockDriver 
} from '../../../../lib/mockData/fleet';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return getDrivers(req, res);
      case 'POST':
        return createDriver(req, res);
      case 'PUT':
        return updateDriver(req, res);
      case 'DELETE':
        return deleteDriver(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Fleet Drivers API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

export default withHQAuth(handler, { module: 'fleet' });

async function getDrivers(req: NextApiRequest, res: NextApiResponse) {
  const { status, availability, branch, search } = req.query;

  let drivers = [...mockDrivers];

  // Apply filters
  if (status && status !== 'all') {
    drivers = drivers.filter(d => d.status === status);
  }
  if (availability && availability !== 'all') {
    drivers = drivers.filter(d => d.availabilityStatus === availability);
  }
  if (branch && branch !== 'all') {
    drivers = drivers.filter(d => d.assignedBranchId === branch);
  }
  if (search) {
    const searchStr = (search as string).toLowerCase();
    drivers = drivers.filter(d => 
      d.fullName.toLowerCase().includes(searchStr) ||
      d.licenseNumber.toLowerCase().includes(searchStr) ||
      d.phone?.toLowerCase().includes(searchStr)
    );
  }

  // Get stats
  const stats = {
    total: mockDrivers.length,
    active: mockDrivers.filter(d => d.status === 'active').length,
    available: mockDrivers.filter(d => d.availabilityStatus === 'available').length,
    onDuty: mockDrivers.filter(d => d.availabilityStatus === 'on_duty').length,
    onLeave: mockDrivers.filter(d => d.availabilityStatus === 'on_leave').length
  };

  return res.status(HttpStatus.OK).json(
    successResponse({ drivers, stats })
  );
}

async function createDriver(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  sanitizeBody(req);
  const errors = validateBody(req, {
    fullName: V.required().string().minLength(2).maxLength(100),
    licenseNumber: V.required().string().minLength(3),
    licenseType: V.required().oneOf(['A', 'B1', 'B2', 'C', 'D']),
  });
  if (errors) return res.status(HttpStatus.BAD_REQUEST).json(errors);

  const ctx = getTenantContext(req);
  const {
    fullName,
    phone,
    email,
    address,
    dateOfBirth,
    licenseNumber,
    licenseType,
    licenseIssueDate,
    licenseExpiryDate,
    employmentType,
    hireDate,
    assignedBranchId,
    notes
  } = req.body;

  // Check duplicate license
  const existing = mockDrivers.find(d => d.licenseNumber === licenseNumber);
  if (existing) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'Driver with this license number already exists')
    );
  }

  const newDriver = createMockDriver({
    fullName,
    phone,
    email,
    address,
    dateOfBirth,
    licenseNumber,
    licenseType,
    licenseIssueDate,
    licenseExpiryDate,
    employmentType,
    hireDate,
    assignedBranchId,
    notes
  });

  // TODO: When database is ready, replace with:
  // const driver = await db.FleetDriver.create({...});

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'create', entityType: 'fleet_driver', entityId: newDriver.id, newValues: { fullName, licenseNumber, licenseType }, req });

  return res.status(HttpStatus.CREATED).json(
    successResponse(newDriver, undefined, 'Driver created successfully')
  );
}

async function updateDriver(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  sanitizeBody(req);
  const ctx = getTenantContext(req);
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Driver ID is required')
    );
  }

  const driverIndex = mockDrivers.findIndex(d => d.id === id);
  if (driverIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Driver not found')
    );
  }

  const oldValues = { ...mockDrivers[driverIndex] };
  Object.assign(mockDrivers[driverIndex], updates);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'update', entityType: 'fleet_driver', entityId: id, oldValues, newValues: updates, req });

  return res.status(HttpStatus.OK).json(
    successResponse(mockDrivers[driverIndex], undefined, 'Driver updated successfully')
  );
}

async function deleteDriver(req: NextApiRequest, res: NextApiResponse) {
  if (!checkLimit(req, res, RateLimitTier.SENSITIVE)) return;
  const ctx = getTenantContext(req);
  const { id } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Driver ID is required')
    );
  }

  const driverIndex = mockDrivers.findIndex(d => d.id === id);
  if (driverIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Driver not found')
    );
  }

  const deleted = mockDrivers[driverIndex];
  mockDrivers.splice(driverIndex, 1);

  await logAudit({ tenantId: ctx.tenantId as string, userId: ctx.userId, userName: ctx.userName, action: 'delete', entityType: 'fleet_driver', entityId: id, oldValues: deleted, req });

  return res.status(HttpStatus.OK).json(
    successResponse(null, undefined, 'Driver deleted successfully')
  );
}
