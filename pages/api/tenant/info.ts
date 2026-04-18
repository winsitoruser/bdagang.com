import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { userWhereFromSession } from '@/lib/session-user';

const db = require('@/models');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { User, Tenant, BusinessType } = db;

    const whereUser = userWhereFromSession(session);
    if (!whereUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({
      where: whereUser,
      include: [{
        model: Tenant,
        as: 'tenant',
        include: [{
          model: BusinessType,
          as: 'businessType'
        }]
      }]
    });

    if (!user || !user.tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.status(200).json({
      success: true,
      tenant: user.tenant
    });

  } catch (error: any) {
    console.error('Tenant info API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
