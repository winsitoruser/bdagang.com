import { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';

// Mock routes data
const mockRoutes: any[] = [
  {
    id: 'route-1',
    routeName: 'Jakarta - Bandung',
    routeCode: 'JKT-BDG-01',
    origin: 'Jakarta',
    destination: 'Bandung',
    distance: 150,
    estimatedDuration: 180,
    status: 'active',
    vehicleId: 'veh-1',
    driverId: 'drv-1',
    stops: [
      { name: 'Rest Area KM 50', duration: 15 },
      { name: 'Toll Gate Cipularang', duration: 5 }
    ],
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'route-2',
    routeName: 'Jakarta - Surabaya',
    routeCode: 'JKT-SBY-01',
    origin: 'Jakarta',
    destination: 'Surabaya',
    distance: 800,
    estimatedDuration: 720,
    status: 'active',
    vehicleId: 'veh-2',
    driverId: 'drv-2',
    stops: [
      { name: 'Rest Area Cikampek', duration: 20 },
      { name: 'Rest Area Brebes', duration: 30 },
      { name: 'Rest Area Semarang', duration: 20 }
    ],
    createdAt: '2026-02-05T08:00:00Z'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return getRoutes(req, res);
      case 'POST':
        return createRoute(req, res);
      case 'PUT':
        return updateRoute(req, res);
      case 'DELETE':
        return deleteRoute(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Fleet Routes API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getRoutes(req: NextApiRequest, res: NextApiResponse) {
  const { status, vehicleId, driverId, origin, destination, search } = req.query;

  let routes = [...mockRoutes];

  // Apply filters
  if (status && status !== 'all') {
    routes = routes.filter(r => r.status === status);
  }
  if (vehicleId) {
    routes = routes.filter(r => r.vehicleId === vehicleId);
  }
  if (driverId) {
    routes = routes.filter(r => r.driverId === driverId);
  }
  if (origin) {
    routes = routes.filter(r => r.origin.toLowerCase().includes((origin as string).toLowerCase()));
  }
  if (destination) {
    routes = routes.filter(r => r.destination.toLowerCase().includes((destination as string).toLowerCase()));
  }
  if (search) {
    const searchStr = (search as string).toLowerCase();
    routes = routes.filter(r => 
      r.routeName?.toLowerCase().includes(searchStr) ||
      r.routeCode?.toLowerCase().includes(searchStr) ||
      r.origin?.toLowerCase().includes(searchStr) ||
      r.destination?.toLowerCase().includes(searchStr)
    );
  }

  // Calculate summary
  const totalDistance = routes.reduce((sum, r) => sum + (r.distance || 0), 0);
  const summary = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
    totalDistance,
    avgDistance: routes.length > 0 ? Math.round(totalDistance / routes.length) : 0
  };

  return res.status(HttpStatus.OK).json(
    successResponse({ routes, summary })
  );
}

async function createRoute(req: NextApiRequest, res: NextApiResponse) {
  const {
    routeName,
    routeCode,
    origin,
    destination,
    distance,
    estimatedDuration,
    vehicleId,
    driverId,
    stops,
    notes
  } = req.body;

  // Validation
  if (!routeName || !origin || !destination || !distance) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Route name, origin, destination, and distance are required')
    );
  }

  const newRoute = {
    id: `route-${Date.now()}`,
    routeName,
    routeCode: routeCode || `RT-${Date.now()}`,
    origin,
    destination,
    distance,
    estimatedDuration,
    status: 'active',
    vehicleId,
    driverId,
    stops: stops || [],
    notes,
    createdAt: new Date().toISOString()
  };

  mockRoutes.push(newRoute);

  return res.status(HttpStatus.CREATED).json(
    successResponse(newRoute, undefined, 'Route created successfully')
  );
}

async function updateRoute(req: NextApiRequest, res: NextApiResponse) {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Route ID is required')
    );
  }

  const routeIndex = mockRoutes.findIndex(r => r.id === id);
  if (routeIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Route not found')
    );
  }

  Object.assign(mockRoutes[routeIndex], updates);

  return res.status(HttpStatus.OK).json(
    successResponse(mockRoutes[routeIndex], undefined, 'Route updated successfully')
  );
}

async function deleteRoute(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Route ID is required')
    );
  }

  const routeIndex = mockRoutes.findIndex(r => r.id === id);
  if (routeIndex === -1) {
    return res.status(HttpStatus.NOT_FOUND).json(
      errorResponse(ErrorCodes.NOT_FOUND, 'Route not found')
    );
  }

  mockRoutes.splice(routeIndex, 1);

  return res.status(HttpStatus.OK).json(
    successResponse(null, undefined, 'Route deleted successfully')
  );
}
