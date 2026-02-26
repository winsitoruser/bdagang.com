import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { mockCostRecords, getTotalCostByCategory } from '@/lib/mockData/fleetPhase2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { category, vehicleId, driverId, startDate, endDate } = req.query;

      let costs = [...mockCostRecords];

      if (category && category !== 'all') {
        costs = costs.filter(c => c.costCategory === category);
      }
      if (vehicleId) {
        costs = costs.filter(c => c.vehicleId === vehicleId);
      }
      if (driverId) {
        costs = costs.filter(c => c.driverId === driverId);
      }
      if (startDate) {
        costs = costs.filter(c => c.costDate >= startDate);
      }
      if (endDate) {
        costs = costs.filter(c => c.costDate <= endDate);
      }

      const totalAmount = costs.reduce((sum, c) => sum + c.amount, 0);

      const byCategory = {
        fuel: getTotalCostByCategory('fuel'),
        maintenance: getTotalCostByCategory('maintenance'),
        salary: getTotalCostByCategory('salary'),
        insurance: getTotalCostByCategory('insurance'),
        depreciation: getTotalCostByCategory('depreciation'),
        registration: getTotalCostByCategory('registration'),
        parking: getTotalCostByCategory('parking'),
        fines: getTotalCostByCategory('fines'),
        other: getTotalCostByCategory('other')
      };

      return res.status(200).json({
        success: true,
        data: costs,
        summary: {
          totalAmount,
          count: costs.length,
          byCategory
        }
      });

    } else if (req.method === 'POST') {
      const newCost = {
        id: `cost-${Date.now()}`,
        ...req.body,
        currency: 'IDR'
      };

      mockCostRecords.push(newCost);

      return res.status(201).json({
        success: true,
        message: 'Cost record created successfully',
        data: newCost
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Costs API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
