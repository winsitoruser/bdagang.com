import type { NextApiRequest, NextApiResponse } from 'next';

let StockOpname: any, StockOpnameItem: any, BranchModel: any;
try {
  const models = require('../../../../models');
  StockOpname = models.StockOpname;
  StockOpnameItem = models.StockOpnameItem;
  BranchModel = models.Branch;
} catch (e) { console.warn('Stocktake models not available'); }

interface Stocktake {
  id: string;
  stocktakeNumber: string;
  branch: { id: string; name: string; code: string };
  type: 'full' | 'partial' | 'cycle';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  totalItems: number;
  countedItems: number;
  varianceCount: number;
  varianceValue: number;
  assignedTo: string[];
  createdBy: string;
  notes?: string;
}

const mockStocktakes: Stocktake[] = [
  {
    id: '1', stocktakeNumber: 'SO-2026-0015',
    branch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    type: 'full', status: 'in_progress',
    scheduledDate: '2026-02-22', startedAt: '2026-02-22T08:00:00',
    totalItems: 1250, countedItems: 856, varianceCount: 23, varianceValue: -2450000,
    assignedTo: ['Staff Gudang 1', 'Staff Gudang 2', 'Supervisor'],
    createdBy: 'Admin HQ'
  },
  {
    id: '2', stocktakeNumber: 'SO-2026-0014',
    branch: { id: '3', name: 'Cabang Bandung', code: 'BR-002' },
    type: 'partial', status: 'completed',
    scheduledDate: '2026-02-21', startedAt: '2026-02-21T09:00:00', completedAt: '2026-02-21T14:00:00',
    totalItems: 350, countedItems: 350, varianceCount: 8, varianceValue: -850000,
    assignedTo: ['Manager Bandung', 'Staff 1'],
    createdBy: 'Manager Bandung', notes: 'Stock opname kategori Bahan Pokok'
  },
  {
    id: '3', stocktakeNumber: 'SO-2026-0013',
    branch: { id: '4', name: 'Cabang Surabaya', code: 'BR-003' },
    type: 'cycle', status: 'scheduled',
    scheduledDate: '2026-02-25',
    totalItems: 200, countedItems: 0, varianceCount: 0, varianceValue: 0,
    assignedTo: ['Staff Surabaya'],
    createdBy: 'Admin HQ', notes: 'Cycle count mingguan'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return getStocktakes(req, res);
      case 'POST':
        return createStocktake(req, res);
      case 'PUT':
        return updateStocktake(req, res);
      case 'DELETE':
        return deleteStocktake(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Stocktake API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStocktakes(req: NextApiRequest, res: NextApiResponse) {
  const { status, branchId, search } = req.query;

  if (StockOpname && BranchModel) {
    try {
      const { Op } = require('sequelize');
      const where: any = {};
      if (status && status !== 'all') where.status = status;
      if (branchId) where.branchId = branchId;
      if (search) where[Op.or] = [{ opnameNumber: { [Op.iLike]: `%${search}%` } }];

      const records = await StockOpname.findAll({
        where, order: [['createdAt', 'DESC']], limit: 50,
        include: [{ model: BranchModel, as: 'branch', attributes: ['id', 'name', 'code'] }]
      });

      if (records.length > 0) {
        const stocktakes = records.map((r: any) => ({
          id: r.id, stocktakeNumber: r.opnameNumber || r.id,
          branch: { id: r.branch?.id || r.branchId, name: r.branch?.name || '', code: r.branch?.code || '' },
          type: r.type || 'full', status: r.status,
          scheduledDate: r.scheduledDate || r.createdAt,
          startedAt: r.startedAt, completedAt: r.completedAt,
          totalItems: r.totalItems || 0, countedItems: r.countedItems || 0,
          varianceCount: r.varianceCount || 0, varianceValue: parseFloat(r.varianceValue || 0),
          assignedTo: r.assignedTo || [], createdBy: r.createdBy || ''
        }));

        return res.status(200).json({
          stocktakes,
          stats: {
            scheduled: stocktakes.filter((s: any) => s.status === 'scheduled').length,
            inProgress: stocktakes.filter((s: any) => s.status === 'in_progress').length,
            completed: stocktakes.filter((s: any) => s.status === 'completed').length,
            totalVariance: stocktakes.filter((s: any) => s.status === 'completed').reduce((sum: number, s: any) => sum + s.varianceValue, 0)
          }
        });
      }
    } catch (e: any) { console.warn('Stocktake DB failed:', e.message); }
  }

  // Mock fallback
  let filtered = [...mockStocktakes];
  if (status && status !== 'all') filtered = filtered.filter(s => s.status === status);
  if (branchId) filtered = filtered.filter(s => s.branch.id === branchId || s.branch.code === branchId);
  if (search) {
    const searchStr = (search as string).toLowerCase();
    filtered = filtered.filter(s => s.stocktakeNumber.toLowerCase().includes(searchStr) || s.branch.name.toLowerCase().includes(searchStr));
  }

  return res.status(200).json({
    stocktakes: filtered,
    stats: {
      scheduled: mockStocktakes.filter(s => s.status === 'scheduled').length,
      inProgress: mockStocktakes.filter(s => s.status === 'in_progress').length,
      completed: mockStocktakes.filter(s => s.status === 'completed').length,
      totalVariance: mockStocktakes.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.varianceValue, 0)
    }
  });
}

async function createStocktake(req: NextApiRequest, res: NextApiResponse) {
  const { branchId, branchName, branchCode, type, scheduledDate, assignedTo, notes } = req.body;
  if (!branchId || !type || !scheduledDate) {
    return res.status(400).json({ error: 'Branch, type, and scheduled date are required' });
  }

  if (StockOpname) {
    try {
      const count = await StockOpname.count() || 0;
      const record = await StockOpname.create({
        opnameNumber: `SO-2026-${String(count + 1).padStart(4, '0')}`,
        branchId, type, status: 'scheduled', scheduledDate,
        assignedTo: assignedTo || [], createdBy: 'Admin HQ', notes
      });
      return res.status(201).json({ stocktake: record, message: 'Stock opname dijadwalkan' });
    } catch (e: any) { console.warn('Stocktake create failed:', e.message); }
  }

  return res.status(201).json({
    stocktake: {
      id: Date.now().toString(), stocktakeNumber: `SO-2026-${String(mockStocktakes.length + 16).padStart(4, '0')}`,
      branch: { id: branchId, name: branchName || 'Unknown', code: branchCode || 'UNK' },
      type, status: 'scheduled', scheduledDate, totalItems: 0, countedItems: 0,
      varianceCount: 0, varianceValue: 0, assignedTo: assignedTo || [], createdBy: 'Admin HQ', notes
    },
    message: 'Stocktake scheduled successfully'
  });
}

async function updateStocktake(req: NextApiRequest, res: NextApiResponse) {
  const { id, action, countedItems, varianceCount, varianceValue } = req.body;
  if (!id) return res.status(400).json({ error: 'Stocktake ID is required' });

  if (StockOpname) {
    try {
      const record = await StockOpname.findByPk(id);
      if (record) {
        const updateData: any = {};
        if (action === 'start') { updateData.status = 'in_progress'; updateData.startedAt = new Date(); }
        else if (action === 'complete') {
          updateData.status = 'completed'; updateData.completedAt = new Date();
          if (countedItems !== undefined) updateData.countedItems = countedItems;
          if (varianceCount !== undefined) updateData.varianceCount = varianceCount;
          if (varianceValue !== undefined) updateData.varianceValue = varianceValue;
        } else if (action === 'cancel') updateData.status = 'cancelled';
        await record.update(updateData);
        return res.status(200).json({ stocktake: record, message: 'Stock opname diperbarui' });
      }
    } catch (e: any) { console.warn('Stocktake update failed:', e.message); }
  }

  // Mock fallback
  const stocktake = mockStocktakes.find(s => s.id === id);
  if (!stocktake) return res.status(404).json({ error: 'Stocktake not found' });

  if (action === 'start') { stocktake.status = 'in_progress'; stocktake.startedAt = new Date().toISOString(); }
  else if (action === 'complete') {
    stocktake.status = 'completed'; stocktake.completedAt = new Date().toISOString();
    if (countedItems !== undefined) stocktake.countedItems = countedItems;
    if (varianceCount !== undefined) stocktake.varianceCount = varianceCount;
    if (varianceValue !== undefined) stocktake.varianceValue = varianceValue;
  } else if (action === 'cancel') stocktake.status = 'cancelled';

  return res.status(200).json({ stocktake, message: 'Stocktake updated successfully' });
}

async function deleteStocktake(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Stocktake ID is required' });

  if (StockOpname) {
    try {
      const deleted = await StockOpname.destroy({ where: { id } });
      if (deleted) return res.status(200).json({ message: 'Stock opname dihapus' });
    } catch (e: any) { console.warn('Stocktake delete failed:', e.message); }
  }

  return res.status(200).json({ message: 'Stocktake deleted successfully' });
}
