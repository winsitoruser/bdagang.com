import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        return getMarketplaceDashboard(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Marketplace API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getMarketplaceDashboard(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    success: true,
    data: {
      channels: [
        { id: 'tokopedia', name: 'Tokopedia', icon: '🟢', status: 'not_connected', productsSync: 0, ordersToday: 0, color: '#42b549' },
        { id: 'shopee', name: 'Shopee', icon: '🟠', status: 'not_connected', productsSync: 0, ordersToday: 0, color: '#ee4d2d' },
        { id: 'lazada', name: 'Lazada', icon: '🔵', status: 'not_connected', productsSync: 0, ordersToday: 0, color: '#0f146d' },
        { id: 'bukalapak', name: 'Bukalapak', icon: '🔴', status: 'not_connected', productsSync: 0, ordersToday: 0, color: '#e31e52' },
        { id: 'tiktok_shop', name: 'TikTok Shop', icon: '⚫', status: 'not_connected', productsSync: 0, ordersToday: 0, color: '#000000' },
      ],
      stats: {
        totalChannels: 0,
        connectedChannels: 0,
        totalProductsSynced: 0,
        totalOrdersToday: 0,
        totalRevenue: 0,
        pendingOrders: 0
      },
      recentOrders: [],
      syncHistory: [],
      setupSteps: [
        { step: 1, title: 'Pilih marketplace yang ingin dihubungkan', completed: false },
        { step: 2, title: 'Otorisasi akun marketplace', completed: false },
        { step: 3, title: 'Mapping kategori produk', completed: false },
        { step: 4, title: 'Sync produk ke marketplace', completed: false },
        { step: 5, title: 'Konfigurasi auto-sync order & stok', completed: false },
      ]
    }
  });
}
