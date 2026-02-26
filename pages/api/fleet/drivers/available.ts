import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getAvailableDrivers, mockDrivers } from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { branch, licenseType } = req.query;

    // Get available drivers (status: active, availability: available)
    let drivers = getAvailableDrivers();

    // Apply filters
    if (branch && branch !== 'all') {
      drivers = drivers.filter(d => d.assignedBranchId === branch);
    }
    if (licenseType && licenseType !== 'all') {
      drivers = drivers.filter(d => d.licenseType === licenseType);
    }

    // Format for dropdown
    const formattedDrivers = drivers.map(driver => ({
      id: driver.id,
      driverNumber: driver.driverNumber,
      fullName: driver.fullName,
      phone: driver.phone,
      licenseType: driver.licenseType,
      licenseNumber: driver.licenseNumber,
      totalDeliveries: driver.totalDeliveries,
      onTimeDeliveries: driver.onTimeDeliveries,
      safetyScore: driver.safetyScore,
      customerRating: driver.customerRating,
      assignedBranchId: driver.assignedBranchId
    }));

    // TODO: When database is ready, replace with:
    // const drivers = await db.FleetDriver.findAll({
    //   where: {
    //     status: 'active',
    //     availability_status: 'available',
    //     ...(branch && { assigned_branch_id: branch }),
    //     ...(licenseType && { license_type: licenseType })
    //   },
    //   attributes: ['id', 'driver_number', 'full_name', 'phone', 'license_type', 
    //                'license_number', 'total_deliveries', 'on_time_deliveries', 
    //                'safety_score', 'customer_rating']
    // });

    return res.status(200).json({
      success: true,
      data: formattedDrivers,
      count: formattedDrivers.length
    });

  } catch (error: any) {
    console.error('Available drivers API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
