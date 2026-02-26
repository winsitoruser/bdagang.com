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

    const { id } = req.query;

    if (req.method === 'GET') {
      const transaction = mockFuelTransactions.find(t => t.id === id);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      return res.status(200).json({
        success: true,
        data: transaction
      });

    } else if (req.method === 'PUT') {
      const index = mockFuelTransactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      mockFuelTransactions[index] = {
        ...mockFuelTransactions[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: mockFuelTransactions[index]
      });

    } else if (req.method === 'DELETE') {
      const index = mockFuelTransactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      mockFuelTransactions.splice(index, 1);

      return res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Fuel API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
