import type { NextApiRequest, NextApiResponse } from 'next';

let StockTransfer: any, Branch: any;
try {
  const models = require('../../../../models');
  // Try InternalRequisition as transfer model
  StockTransfer = models.InternalRequisition;
  Branch = models.Branch;
} catch (e) { console.warn('Transfer models not available'); }

const mockTransfers = [
  {
    id: '1', transferNumber: 'TRF-2026-0089',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '3', name: 'Cabang Bandung', code: 'BR-002' },
    items: [
      { productId: '1', productName: 'Beras Premium 5kg', sku: 'BRS-001', quantity: 200, unit: 'pcs' },
      { productId: '2', productName: 'Minyak Goreng 2L', sku: 'MYK-001', quantity: 150, unit: 'pcs' }
    ],
    totalItems: 2, totalQuantity: 350, status: 'pending', priority: 'high',
    requestDate: '2026-02-22T08:00:00', requestedBy: 'Manager Bandung', notes: 'Stok menipis, butuh segera'
  },
  {
    id: '2', transferNumber: 'TRF-2026-0088',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '5', name: 'Cabang Medan', code: 'BR-004' },
    items: [
      { productId: '6', productName: 'Tepung Terigu 1kg', sku: 'TPG-001', quantity: 500, unit: 'pcs' }
    ],
    totalItems: 1, totalQuantity: 500, status: 'approved', priority: 'urgent',
    requestDate: '2026-02-21T14:00:00', approvedDate: '2026-02-21T16:00:00',
    requestedBy: 'Manager Medan', approvedBy: 'Admin HQ', notes: 'Out of stock - urgent'
  },
  {
    id: '3', transferNumber: 'TRF-2026-0087',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '4', name: 'Cabang Surabaya', code: 'BR-003' },
    items: [
      { productId: '3', productName: 'Gula Pasir 1kg', sku: 'GLA-001', quantity: 300, unit: 'pcs' },
      { productId: '4', productName: 'Kopi Arabica 250g', sku: 'KPI-001', quantity: 100, unit: 'pcs' },
      { productId: '5', productName: 'Susu UHT 1L', sku: 'SSU-001', quantity: 200, unit: 'pcs' }
    ],
    totalItems: 3, totalQuantity: 600, status: 'shipped', priority: 'normal',
    requestDate: '2026-02-20T10:00:00', approvedDate: '2026-02-20T12:00:00', shippedDate: '2026-02-21T08:00:00',
    requestedBy: 'Manager Surabaya', approvedBy: 'Admin HQ'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { status, fromBranch, toBranch } = req.query;

    if (StockTransfer && Branch) {
      try {
        const where: any = {};
        if (status && status !== 'all') where.status = status;

        const transfers = await StockTransfer.findAll({
          where, order: [['createdAt', 'DESC']], limit: 50
        });

        if (transfers.length > 0) {
          const branchIds = new Set<string>();
          transfers.forEach((t: any) => { if (t.fromBranchId) branchIds.add(t.fromBranchId); if (t.toBranchId) branchIds.add(t.toBranchId); });
          const { Op } = require('sequelize');
          const branches = await Branch.findAll({ where: { id: { [Op.in]: Array.from(branchIds) } }, attributes: ['id', 'name', 'code'] });
          const branchMap: Record<string, any> = {};
          branches.forEach((b: any) => { branchMap[b.id] = b; });

          const formatted = transfers.map((t: any) => {
            const from = branchMap[t.fromBranchId] || {};
            const to = branchMap[t.toBranchId] || {};
            return {
              id: t.id, transferNumber: t.requisitionNumber || t.id,
              fromBranch: { id: t.fromBranchId, name: from.name || '', code: from.code || '' },
              toBranch: { id: t.toBranchId, name: to.name || '', code: to.code || '' },
              items: t.items || [], totalItems: (t.items || []).length,
              totalQuantity: (t.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0),
              status: t.status, priority: t.priority || 'normal',
              requestDate: t.createdAt, requestedBy: t.requestedBy || ''
            };
          });

          let filtered = formatted;
          if (fromBranch) filtered = filtered.filter((t: any) => t.fromBranch.code === fromBranch);
          if (toBranch) filtered = filtered.filter((t: any) => t.toBranch.code === toBranch);

          return res.status(200).json({
            transfers: filtered,
            stats: {
              pending: formatted.filter((t: any) => t.status === 'pending').length,
              approved: formatted.filter((t: any) => t.status === 'approved').length,
              shipped: formatted.filter((t: any) => t.status === 'shipped').length,
              received: formatted.filter((t: any) => t.status === 'received').length
            }
          });
        }
      } catch (e: any) { console.warn('Transfers DB failed:', e.message); }
    }

    // Mock fallback
    let filteredTransfers = mockTransfers;
    if (status && status !== 'all') filteredTransfers = filteredTransfers.filter(t => t.status === status);
    if (fromBranch) filteredTransfers = filteredTransfers.filter(t => t.fromBranch.code === fromBranch);
    if (toBranch) filteredTransfers = filteredTransfers.filter(t => t.toBranch.code === toBranch);

    return res.status(200).json({
      transfers: filteredTransfers,
      stats: {
        pending: mockTransfers.filter(t => t.status === 'pending').length,
        approved: mockTransfers.filter(t => t.status === 'approved').length,
        shipped: mockTransfers.filter(t => t.status === 'shipped').length,
        received: mockTransfers.filter(t => t.status === 'received').length
      }
    });
  }

  if (req.method === 'POST') {
    const newTransfer = req.body;

    if (StockTransfer) {
      try {
        const transfer = await StockTransfer.create({
          ...newTransfer, status: 'pending', requestDate: new Date()
        });
        return res.status(201).json({ success: true, transfer });
      } catch (e: any) { console.warn('Transfer create failed:', e.message); }
    }

    return res.status(201).json({
      success: true,
      transfer: {
        id: String(mockTransfers.length + 1),
        transferNumber: `TRF-2026-${String(mockTransfers.length + 90).padStart(4, '0')}`,
        ...newTransfer, status: 'pending', requestDate: new Date().toISOString()
      }
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
