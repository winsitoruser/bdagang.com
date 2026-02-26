import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { mockRouteAssignments } from '@/lib/mockData/fleetPhase2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { status, vehicleId, driverId, date } = req.query;

      let assignments = [...mockRouteAssignments];

      if (status && status !== 'all') {
        assignments = assignments.filter(a => a.status === status);
      }
      if (vehicleId) {
        assignments = assignments.filter(a => a.vehicleId === vehicleId);
      }
      if (driverId) {
        assignments = assignments.filter(a => a.driverId === driverId);
      }
      if (date) {
        assignments = assignments.filter(a => a.scheduledDate === date);
      }

      return res.status(200).json({
        success: true,
        data: assignments,
        count: assignments.length
      });

    } else if (req.method === 'POST') {
      const newAssignment = {
        id: `assign-${Date.now()}`,
        ...req.body,
        status: 'scheduled',
        actualStartTime: null,
        actualEndTime: null,
        totalDistanceKm: null,
        fuelConsumedLiters: null
      };

      mockRouteAssignments.push(newAssignment);

      return res.status(201).json({
        success: true,
        message: 'Route assignment created successfully',
        data: newAssignment
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Route assignments API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
