import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { 
  mockVehicles, 
  createMockVehicle,
  getActiveVehicles,
  MockVehicle 
} from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get all vehicles with filters
      const { status, type, branch } = req.query;

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

      // Get stats
      const stats = {
        total: mockVehicles.length,
        active: mockVehicles.filter(v => v.status === 'active').length,
        maintenance: mockVehicles.filter(v => v.status === 'maintenance').length,
        onRoute: mockVehicles.filter(v => v.status === 'active' && v.assignedDriverId).length
      };

      return res.status(200).json({
        success: true,
        data: vehicles,
        stats
      });

    } else if (req.method === 'POST') {
      // Create new vehicle
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

      // Validation
      if (!licensePlate || !vehicleType) {
        return res.status(400).json({ 
          error: 'License plate and vehicle type are required' 
        });
      }

      // Check duplicate license plate
      const existing = mockVehicles.find(v => v.licensePlate === licensePlate);
      if (existing) {
        return res.status(400).json({ 
          error: 'Vehicle with this license plate already exists' 
        });
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

      return res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: newVehicle
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Fleet vehicles API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
