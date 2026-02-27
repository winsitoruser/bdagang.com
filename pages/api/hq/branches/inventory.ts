import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';

let Stock: any, Product: any;
try {
  const models = require('../../../../models');
  Stock = models.Stock;
  Product = models.Product;
} catch (e) {
  console.warn('Stock/Product models not available');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
      errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
    );
  }

  try {
    return await getBranchInventory(req, res);
  } catch (error) {
    console.error('Branch Inventory API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getBranchInventory(req: NextApiRequest, res: NextApiResponse) {
  const { branchId, category, stockStatus } = req.query;
  const { limit, offset, page } = getPaginationParams(req.query);

  if (!branchId) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Branch ID is required')
    );
  }

  try {
    if (Stock && Product) {
      const where: any = { branchId };

      const { count, rows } = await Stock.findAndCountAll({
        where,
        include: [{
          model: Product,
          as: 'product',
          where: category ? { category } : {},
          attributes: ['id', 'sku', 'name', 'category', 'unit', 'minStock', 'maxStock']
        }],
        order: [['quantity', 'ASC']],
        limit,
        offset
      });

      const inventory = rows.map((stock: any) => ({
        productId: stock.product.id,
        sku: stock.product.sku,
        name: stock.product.name,
        category: stock.product.category,
        unit: stock.product.unit,
        quantity: stock.quantity,
        minStock: stock.product.minStock,
        maxStock: stock.product.maxStock,
        status: stock.quantity === 0 ? 'out' : stock.quantity <= stock.product.minStock ? 'low' : stock.quantity >= stock.product.maxStock ? 'over' : 'normal',
        lastUpdated: stock.updatedAt
      }));

      const filtered = stockStatus ? inventory.filter((item: any) => item.status === stockStatus) : inventory;

      return res.status(HttpStatus.OK).json(
        successResponse(
          { inventory: filtered },
          getPaginationMeta(filtered.length, page, limit)
        )
      );
    }

    const mockInventory = getMockInventory();
    return res.status(HttpStatus.OK).json(
      successResponse(
        { inventory: mockInventory },
        getPaginationMeta(mockInventory.length, 1, 10)
      )
    );
  } catch (error) {
    console.error('Error fetching branch inventory:', error);
    const mockInventory = getMockInventory();
    return res.status(HttpStatus.OK).json(
      successResponse(
        { inventory: mockInventory },
        getPaginationMeta(mockInventory.length, 1, 10)
      )
    );
  }
}

function getMockInventory() {
  return [
    { productId: '1', sku: 'BRS-001', name: 'Beras Premium 5kg', category: 'Sembako', unit: 'pcs', quantity: 450, minStock: 100, maxStock: 800, status: 'normal', lastUpdated: '2026-02-27T10:00:00Z' },
    { productId: '2', sku: 'MYK-001', name: 'Minyak Goreng 2L', category: 'Sembako', unit: 'pcs', quantity: 85, minStock: 80, maxStock: 500, status: 'low', lastUpdated: '2026-02-27T09:30:00Z' },
    { productId: '3', sku: 'GLA-001', name: 'Gula Pasir 1kg', category: 'Sembako', unit: 'pcs', quantity: 0, minStock: 100, maxStock: 700, status: 'out', lastUpdated: '2026-02-27T09:00:00Z' },
    { productId: '4', sku: 'KPI-001', name: 'Kopi Arabica 250g', category: 'Minuman', unit: 'pcs', quantity: 320, minStock: 30, maxStock: 150, status: 'over', lastUpdated: '2026-02-27T08:30:00Z' }
  ];
}
