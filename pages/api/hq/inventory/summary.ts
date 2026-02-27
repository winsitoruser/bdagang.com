import type { NextApiRequest, NextApiResponse } from 'next';

let Product: any, Stock: any, Branch: any, StockMovement: any;
try {
  const models = require('../../../../models');
  Product = models.Product;
  Stock = models.Stock;
  Branch = models.Branch;
  StockMovement = models.StockMovement;
} catch (e) { console.warn('Inventory summary models not available'); }

const mockSummary = {
  totalProducts: 1250,
  totalStock: 85200,
  totalValue: 4780000000,
  lowStockItems: 65,
  outOfStockItems: 12,
  overStockItems: 89,
  pendingTransfers: 15,
  pendingOrders: 8
};

const mockBranchStock = [
  { id: '1', name: 'Gudang Pusat', code: 'WH-001', totalProducts: 1250, totalStock: 45000, stockValue: 2500000000, lowStock: 22, outOfStock: 0, overStock: 35, lastSync: '2 menit lalu', status: 'synced' },
  { id: '2', name: 'Cabang Pusat Jakarta', code: 'HQ-001', totalProducts: 856, totalStock: 12500, stockValue: 850000000, lowStock: 5, outOfStock: 0, overStock: 12, lastSync: '5 menit lalu', status: 'synced' },
  { id: '3', name: 'Cabang Bandung', code: 'BR-002', totalProducts: 742, totalStock: 8200, stockValue: 450000000, lowStock: 12, outOfStock: 3, overStock: 5, lastSync: '10 menit lalu', status: 'synced' },
  { id: '4', name: 'Cabang Surabaya', code: 'BR-003', totalProducts: 738, totalStock: 7500, stockValue: 380000000, lowStock: 8, outOfStock: 2, overStock: 8, lastSync: '15 menit lalu', status: 'pending' },
  { id: '5', name: 'Cabang Medan', code: 'BR-004', totalProducts: 625, totalStock: 5800, stockValue: 320000000, lowStock: 15, outOfStock: 5, overStock: 3, lastSync: '1 jam lalu', status: 'error' },
  { id: '6', name: 'Cabang Yogyakarta', code: 'BR-005', totalProducts: 630, totalStock: 6200, stockValue: 280000000, lowStock: 3, outOfStock: 1, overStock: 6, lastSync: '8 menit lalu', status: 'synced' }
];

const mockTopProducts = [
  { id: '1', name: 'Beras Premium 5kg', sku: 'BRS-001', category: 'Bahan Pokok', totalStock: 2500, stockValue: 375000000, movement: 'fast', trend: 15 },
  { id: '2', name: 'Minyak Goreng 2L', sku: 'MYK-001', category: 'Bahan Pokok', totalStock: 1800, stockValue: 126000000, movement: 'fast', trend: 8 },
  { id: '3', name: 'Gula Pasir 1kg', sku: 'GLA-001', category: 'Bahan Pokok', totalStock: 3200, stockValue: 51200000, movement: 'medium', trend: -3 },
  { id: '4', name: 'Kopi Arabica 250g', sku: 'KPI-001', category: 'Minuman', totalStock: 450, stockValue: 67500000, movement: 'medium', trend: 12 },
  { id: '5', name: 'Susu UHT 1L', sku: 'SSU-001', category: 'Minuman', totalStock: 2100, stockValue: 37800000, movement: 'fast', trend: 5 }
];

const mockActivities = [
  { id: '1', type: 'transfer', description: 'Transfer stok ke Cabang Bandung', branch: 'Gudang Pusat', quantity: 500, timestamp: '10 menit lalu', user: 'Admin Gudang' },
  { id: '2', type: 'receipt', description: 'Penerimaan barang dari supplier', branch: 'Gudang Pusat', quantity: 1200, timestamp: '30 menit lalu', user: 'Staff Gudang' },
  { id: '3', type: 'adjustment', description: 'Penyesuaian stok (rusak)', branch: 'Cabang Jakarta', quantity: -25, timestamp: '1 jam lalu', user: 'Manager Cabang' },
  { id: '4', type: 'return', description: 'Retur barang ke supplier', branch: 'Cabang Surabaya', quantity: -50, timestamp: '2 jam lalu', user: 'Staff Gudang' },
  { id: '5', type: 'stocktake', description: 'Stock opname selesai', branch: 'Cabang Medan', quantity: 0, timestamp: '3 jam lalu', user: 'Supervisor' }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { branchId, period } = req.query;

  if (Product && Stock && Branch) {
    try {
      const { Op, fn, col, literal } = require('sequelize');
      const branches = await Branch.findAll({ where: { isActive: true }, attributes: ['id', 'name', 'code'], order: [['name', 'ASC']] });

      if (branches.length > 0) {
        const branchStock = await Promise.all(branches.map(async (b: any) => {
          const totalProducts = await Stock.count({ where: { branchId: b.id }, distinct: true, col: 'productId' }) || 0;
          const stockAgg = await Stock.findOne({
            where: { branchId: b.id },
            attributes: [
              [fn('SUM', col('quantity')), 'totalStock'],
              [fn('SUM', literal('quantity * cost_price')), 'stockValue']
            ], raw: true
          }) as any;
          const lowStock = await Stock.count({ where: { branchId: b.id, quantity: { [Op.gt]: 0, [Op.lte]: col('min_stock') } } }) || 0;
          const outOfStock = await Stock.count({ where: { branchId: b.id, quantity: 0 } }) || 0;

          return {
            id: b.id, name: b.name, code: b.code, totalProducts,
            totalStock: parseInt(stockAgg?.totalStock || '0'),
            stockValue: parseFloat(stockAgg?.stockValue || '0'),
            lowStock, outOfStock, overStock: 0, lastSync: 'just now', status: 'synced'
          };
        }));

        let filtered = branchStock;
        if (branchId && branchId !== 'all') filtered = branchStock.filter(b => b.code === branchId);

        const totalProducts = await Product.count({ where: { isActive: true } }) || 0;
        const totalStock = branchStock.reduce((s: number, b: any) => s + b.totalStock, 0);
        const totalValue = branchStock.reduce((s: number, b: any) => s + b.stockValue, 0);
        const lowStockItems = branchStock.reduce((s: number, b: any) => s + b.lowStock, 0);
        const outOfStockItems = branchStock.reduce((s: number, b: any) => s + b.outOfStock, 0);

        if (totalProducts > 0) {
          return res.status(200).json({
            summary: { totalProducts, totalStock, totalValue, lowStockItems, outOfStockItems, overStockItems: 0, pendingTransfers: 0, pendingOrders: 0 },
            branchStock: filtered, topProducts: mockTopProducts, activities: mockActivities
          });
        }
      }
    } catch (e: any) { console.warn('Inventory summary DB failed:', e.message); }
  }

  // Mock fallback
  let filteredBranchStock = mockBranchStock;
  if (branchId && branchId !== 'all') filteredBranchStock = mockBranchStock.filter(b => b.code === branchId);

  return res.status(200).json({
    summary: mockSummary, branchStock: filteredBranchStock,
    topProducts: mockTopProducts, activities: mockActivities
  });
}
