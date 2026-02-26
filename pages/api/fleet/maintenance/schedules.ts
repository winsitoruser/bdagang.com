import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { mockMaintenanceSchedules } from '@/lib/mockData/fleetPhase2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { vehicleId, status } = req.query;

      let schedules = [...mockMaintenanceSchedules];

      if (vehicleId) {
        schedules = schedules.filter(s => s.vehicleId === vehicleId);
      }
      if (status && status !== 'all') {
        schedules = schedules.filter(s => s.status === status);
      }

      const stats = {
        total: schedules.length,
        active: schedules.filter(s => s.status === 'active').length,
        overdue: schedules.filter(s => s.status === 'overdue').length,
        completed: schedules.filter(s => s.status === 'completed').length
      };

      return res.status(200).json({
        success: true,
        data: schedules,
        stats
      });

    } else if (req.method === 'POST') {
      const newSchedule = {
        id: `sched-${Date.now()}`,
        ...req.body,
        status: 'active'
      };

      mockMaintenanceSchedules.push(newSchedule);

      return res.status(201).json({
        success: true,
        message: 'Maintenance schedule created successfully',
        data: newSchedule
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Maintenance schedules API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
