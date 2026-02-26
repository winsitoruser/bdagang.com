import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { mockRoutes } from '@/lib/mockData/fleetAdvanced';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { status, type } = req.query;

      let routes = [...mockRoutes];

      if (status && status !== 'all') {
        routes = routes.filter(r => r.status === status);
      }
      if (type && type !== 'all') {
        routes = routes.filter(r => r.routeType === type);
      }

      return res.status(200).json({
        success: true,
        data: routes,
        count: routes.length
      });

    } else if (req.method === 'POST') {
      const newRoute = {
        id: `route-${Date.now()}`,
        ...req.body,
        status: 'active'
      };

      mockRoutes.push(newRoute);

      return res.status(201).json({
        success: true,
        message: 'Route created successfully',
        data: newRoute
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Routes API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
