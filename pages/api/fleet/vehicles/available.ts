import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getActiveVehicles, mockVehicles } from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { branch, vehicleType, minCapacity } = req.query;

    // Get active vehicles (status: active, not assigned to current shipment)
    let vehicles = getActiveVehicles();

    // Filter out vehicles already on route (would have assignedDriverId)
    // In real implementation, check current_shipment_id
    vehicles = vehicles.filter(v => !v.assignedDriverId || v.status === 'active');

    // Apply filters
    if (branch && branch !== 'all') {
      vehicles = vehicles.filter(v => v.assignedBranchId === branch);
    }
    if (vehicleType && vehicleType !== 'all') {
      vehicles = vehicles.filter(v => v.vehicleType === vehicleType);
    }
    if (minCapacity) {
      const capacity = parseFloat(minCapacity as string);
      vehicles = vehicles.filter(v => v.maxWeightKg >= capacity);
    }

    // Format for dropdown
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      maxWeightKg: vehicle.maxWeightKg,
      maxVolumeM3: vehicle.maxVolumeM3,
      fuelTankCapacity: vehicle.fuelTankCapacity,
      currentOdometerKm: vehicle.currentOdometerKm,
      currentLocation: vehicle.currentLocation,
      assignedBranchId: vehicle.assignedBranchId
    }));

    // TODO: When database is ready, replace with:
    // const vehicles = await db.FleetVehicle.findAll({
    //   where: {
    //     status: 'active',
    //     current_shipment_id: null,
    //     ...(branch && { assigned_branch_id: branch }),
    //     ...(vehicleType && { vehicle_type: vehicleType }),
    //     ...(minCapacity && { max_weight_kg: { [Op.gte]: minCapacity } })
    //   },
    //   attributes: ['id', 'vehicle_number', 'license_plate', 'vehicle_type',
    //                'brand', 'model', 'max_weight_kg', 'max_volume_m3',
    //                'fuel_tank_capacity', 'current_odometer_km', 'current_location']
    // });

    return res.status(200).json({
      success: true,
      data: formattedVehicles,
      count: formattedVehicles.length
    });

  } catch (error: any) {
    console.error('Available vehicles API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
