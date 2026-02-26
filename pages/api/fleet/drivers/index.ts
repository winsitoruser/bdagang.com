import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { 
  mockDrivers, 
  createMockDriver,
  getAvailableDrivers,
  MockDriver 
} from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get all drivers with filters
      const { status, availability, branch } = req.query;

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

      // Get stats
      const stats = {
        total: mockDrivers.length,
        active: mockDrivers.filter(d => d.status === 'active').length,
        available: mockDrivers.filter(d => d.availabilityStatus === 'available').length,
        onDuty: mockDrivers.filter(d => d.availabilityStatus === 'on_duty').length
      };

      return res.status(200).json({
        success: true,
        data: drivers,
        stats
      });

    } else if (req.method === 'POST') {
      // Create new driver
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

      // Validation
      if (!fullName || !licenseNumber || !licenseType) {
        return res.status(400).json({ 
          error: 'Full name, license number, and license type are required' 
        });
      }

      // Check duplicate license
      const existing = mockDrivers.find(d => d.licenseNumber === licenseNumber);
      if (existing) {
        return res.status(400).json({ 
          error: 'Driver with this license number already exists' 
        });
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

      return res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: newDriver
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Fleet drivers API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
