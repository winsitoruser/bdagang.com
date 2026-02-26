import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { 
  getMockDriverById, 
  updateMockDriver, 
  mockDrivers 
} from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single driver
      const driver = getMockDriverById(id as string);
      
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      return res.status(200).json({
        success: true,
        data: driver
      });

    } else if (req.method === 'PUT') {
      // Update driver
      const updates = req.body;

      const updatedDriver = updateMockDriver(id as string, updates);

      if (!updatedDriver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      // TODO: When database is ready, replace with:
      // const driver = await db.FleetDriver.update(updates, { where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Driver updated successfully',
        data: updatedDriver
      });

    } else if (req.method === 'DELETE') {
      // Delete driver
      const index = mockDrivers.findIndex(d => d.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      mockDrivers.splice(index, 1);

      // TODO: When database is ready, replace with:
      // await db.FleetDriver.destroy({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Driver deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Fleet driver detail API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
