import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { 
  getMockVehicleById, 
  updateMockVehicle, 
  mockVehicles 
} from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single vehicle
      const vehicle = getMockVehicleById(id as string);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      return res.status(200).json({
        success: true,
        data: vehicle
      });

    } else if (req.method === 'PUT') {
      // Update vehicle
      const updates = req.body;

      const updatedVehicle = updateMockVehicle(id as string, updates);

      if (!updatedVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // TODO: When database is ready, replace with:
      // const vehicle = await db.FleetVehicle.update(updates, { where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: updatedVehicle
      });

    } else if (req.method === 'DELETE') {
      // Delete vehicle
      const index = mockVehicles.findIndex(v => v.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      mockVehicles.splice(index, 1);

      // TODO: When database is ready, replace with:
      // await db.FleetVehicle.destroy({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Fleet vehicle detail API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
