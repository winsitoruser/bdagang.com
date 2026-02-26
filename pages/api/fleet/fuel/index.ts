import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { mockFuelTransactions } from '@/lib/mockData/fleetAdvanced';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { vehicleId, driverId, startDate, endDate, fuelType } = req.query;

      let transactions = [...mockFuelTransactions];

      if (vehicleId) {
        transactions = transactions.filter(t => t.vehicleId === vehicleId);
      }
      if (driverId) {
        transactions = transactions.filter(t => t.driverId === driverId);
      }
      if (startDate) {
        transactions = transactions.filter(t => t.transactionDate >= startDate);
      }
      if (endDate) {
        transactions = transactions.filter(t => t.transactionDate <= endDate);
      }
      if (fuelType && fuelType !== 'all') {
        transactions = transactions.filter(t => t.fuelType === fuelType);
      }

      const totalCost = transactions.reduce((sum, t) => sum + t.totalCost, 0);
      const totalLiters = transactions.reduce((sum, t) => sum + t.quantityLiters, 0);
      const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

      return res.status(200).json({
        success: true,
        data: transactions,
        summary: {
          totalTransactions: transactions.length,
          totalCost,
          totalLiters,
          avgPricePerLiter
        }
      });

    } else if (req.method === 'POST') {
      const newTransaction = {
        id: `fuel-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString()
      };

      mockFuelTransactions.push(newTransaction);

      return res.status(201).json({
        success: true,
        message: 'Fuel transaction created successfully',
        data: newTransaction
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Fuel API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
