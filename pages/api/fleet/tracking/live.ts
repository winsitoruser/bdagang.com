import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { mockGPSLocations } from '@/lib/mockData/fleetPhase2';
import { mockVehicles } from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get latest location for each vehicle
      const vehicleLocations = mockVehicles.map(vehicle => {
        const locations = mockGPSLocations.filter(l => l.vehicleId === vehicle.id);
        const latestLocation = locations.length > 0 
          ? locations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
          : null;

        return {
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          licensePlate: vehicle.licensePlate,
          location: latestLocation ? {
            latitude: latestLocation.latitude,
            longitude: latestLocation.longitude,
            speedKmh: latestLocation.speedKmh,
            heading: latestLocation.heading,
            timestamp: latestLocation.timestamp,
            isMoving: latestLocation.isMoving,
            isIdle: latestLocation.isIdle,
            idleDurationMinutes: latestLocation.idleDurationMinutes
          } : null
        };
      });

      return res.status(200).json({
        success: true,
        data: vehicleLocations.filter(v => v.location !== null),
        timestamp: new Date().toISOString()
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Live tracking API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
