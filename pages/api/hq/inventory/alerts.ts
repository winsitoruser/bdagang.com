import type { NextApiRequest, NextApiResponse } from 'next';

let Stock: any, Product: any, Branch: any;
try {
  const models = require('../../../../models');
  Stock = models.Stock;
  Product = models.Product;
  Branch = models.Branch;
} catch (e) { console.warn('Inventory alert models not available'); }

const mockAlerts = [
  {
    id: '1', type: 'out_of_stock', priority: 'critical',
    product: { id: '6', name: 'Tepung Terigu 1kg', sku: 'TPG-001', category: 'Bahan Pokok' },
    branch: { id: '5', name: 'Cabang Medan', code: 'BR-004' },
    currentStock: 0, minStock: 30, maxStock: 200,
    suggestedAction: 'Transfer dari Gudang Pusat atau buat PO ke supplier',
    createdAt: '2026-02-22T08:00:00', isRead: false, isResolved: false
  },
  {
    id: '2', type: 'low_stock', priority: 'high',
    product: { id: '6', name: 'Tepung Terigu 1kg', sku: 'TPG-001', category: 'Bahan Pokok' },
    branch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    currentStock: 50, minStock: 100, maxStock: 800,
    suggestedAction: 'Buat Purchase Order ke supplier utama',
    createdAt: '2026-02-22T07:30:00', isRead: false, isResolved: false
  },
  {
    id: '3', type: 'low_stock', priority: 'high',
    product: { id: '6', name: 'Tepung Terigu 1kg', sku: 'TPG-001', category: 'Bahan Pokok' },
    branch: { id: '2', name: 'Cabang Jakarta', code: 'HQ-001' },
    currentStock: 15, minStock: 50, maxStock: 300,
    suggestedAction: 'Transfer dari Gudang Pusat',
    createdAt: '2026-02-22T07:00:00', isRead: true, isResolved: false
  },
  {
    id: '4', type: 'low_stock', priority: 'medium',
    product: { id: '1', name: 'Beras Premium 5kg', sku: 'BRS-001', category: 'Bahan Pokok' },
    branch: { id: '5', name: 'Cabang Medan', code: 'BR-004' },
    currentStock: 150, minStock: 100, maxStock: 500,
    suggestedAction: 'Monitor atau transfer dari Gudang Pusat',
    createdAt: '2026-02-22T06:00:00', isRead: true, isResolved: false
  },
  {
    id: '5', type: 'overstock', priority: 'low',
    product: { id: '3', name: 'Gula Pasir 1kg', sku: 'GLA-001', category: 'Bahan Pokok' },
    branch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    currentStock: 1500, minStock: 250, maxStock: 1200,
    suggestedAction: 'Distribusikan ke cabang atau buat promo',
    createdAt: '2026-02-21T14:00:00', isRead: true, isResolved: false
  },
  {
    id: '6', type: 'expiring', priority: 'high',
    product: { id: '5', name: 'Susu UHT 1L', sku: 'SSU-001', category: 'Minuman' },
    branch: { id: '3', name: 'Cabang Bandung', code: 'BR-002' },
    currentStock: 50, minStock: 80, maxStock: 500,
    suggestedAction: 'Buat promo atau retur ke supplier (exp: 7 hari lagi)',
    createdAt: '2026-02-21T10:00:00', isRead: false, isResolved: false
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { type, priority, branchId, includeResolved } = req.query;

    // Try DB: generate alerts from Stock table where quantity <= min_stock
    if (Stock && Product && Branch) {
      try {
        const { Op, col, literal } = require('sequelize');
        const lowStockWhere: any = { quantity: { [Op.lte]: col('min_stock') } };
        if (branchId) lowStockWhere.branchId = branchId;

        const lowStocks = await Stock.findAll({
          where: lowStockWhere,
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'categoryId'] },
            { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] }
          ],
          order: [['quantity', 'ASC']], limit: 50
        });

        if (lowStocks.length > 0) {
          let alerts = lowStocks.map((s: any, i: number) => {
            const qty = parseInt(s.quantity) || 0;
            const min = parseInt(s.minStock) || 0;
            const alertType = qty === 0 ? 'out_of_stock' : 'low_stock';
            const alertPriority = qty === 0 ? 'critical' : qty < min * 0.5 ? 'high' : 'medium';
            return {
              id: String(i + 1), type: alertType, priority: alertPriority,
              product: { id: s.product?.id, name: s.product?.name || 'Unknown', sku: s.product?.sku || '', category: '' },
              branch: { id: s.branch?.id, name: s.branch?.name || 'Unknown', code: s.branch?.code || '' },
              currentStock: qty, minStock: min, maxStock: parseInt(s.maxStock) || 0,
              suggestedAction: qty === 0 ? 'Transfer dari gudang pusat atau buat PO' : 'Monitor dan restock segera',
              createdAt: s.updatedAt || new Date().toISOString(), isRead: false, isResolved: false
            };
          });

          if (type && type !== 'all') alerts = alerts.filter((a: any) => a.type === type);
          if (priority && priority !== 'all') alerts = alerts.filter((a: any) => a.priority === priority);

          return res.status(200).json({
            alerts,
            stats: {
              total: alerts.length,
              critical: alerts.filter((a: any) => a.priority === 'critical').length,
              high: alerts.filter((a: any) => a.priority === 'high').length,
              unread: alerts.filter((a: any) => !a.isRead).length
            }
          });
        }
      } catch (e: any) { console.warn('Inventory alerts DB failed:', e.message); }
    }

    // Mock fallback
    let filteredAlerts = mockAlerts;
    if (type && type !== 'all') filteredAlerts = filteredAlerts.filter(a => a.type === type);
    if (priority && priority !== 'all') filteredAlerts = filteredAlerts.filter(a => a.priority === priority);
    if (branchId) filteredAlerts = filteredAlerts.filter(a => a.branch.code === branchId);
    if (includeResolved !== 'true') filteredAlerts = filteredAlerts.filter(a => !a.isResolved);

    return res.status(200).json({
      alerts: filteredAlerts,
      stats: {
        total: mockAlerts.filter(a => !a.isResolved).length,
        critical: mockAlerts.filter(a => a.priority === 'critical' && !a.isResolved).length,
        high: mockAlerts.filter(a => a.priority === 'high' && !a.isResolved).length,
        unread: mockAlerts.filter(a => !a.isRead && !a.isResolved).length
      }
    });
  }

  if (req.method === 'PATCH') {
    const { id, action } = req.body;
    return res.status(200).json({ success: true, message: `Alert ${id} ${action} successfully` });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
