import type { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';
import { getPaginationParams, getPaginationMeta } from '../../../../lib/api/pagination';

let Product: any, Stock: any, Branch: any;
try {
  const ProductModel = require('../../../../models/inventory/Product');
  const StockModel = require('../../../../models/inventory/Stock');
  const models = require('../../../../models');
  
  Product = ProductModel.default || ProductModel;
  Stock = StockModel.default || StockModel;
  Branch = models.Branch;
} catch (e) {
  console.warn('Inventory models not available:', e);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getProducts(req, res);
      case 'POST':
        return await createProduct(req, res);
      case 'PUT':
        return await updateProduct(req, res);
      case 'DELETE':
        return await deleteProduct(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(
          errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`)
        );
    }
  } catch (error) {
    console.error('Inventory Products API Error:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  if (!Product) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Product model not available')
    );
  }

  const { search, category, isActive } = req.query;
  const { limit, offset } = getPaginationParams(req.query);

  try {
    const where: any = {};
    
    if (search) {
      where[Op.or] = [
        { sku: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    });

    // Get stock levels for each product
    if (Stock) {
      const productsWithStock = await Promise.all(rows.map(async (product: any) => {
        const stocks = await Stock.findAll({
          where: { productId: product.id },
          include: [{ model: Branch, as: 'branch', attributes: ['id', 'code', 'name'] }]
        });

        const totalStock = stocks.reduce((sum: number, s: any) => sum + s.quantity, 0);
        const totalValue = stocks.reduce((sum: number, s: any) => sum + parseFloat(s.totalValue), 0);

        return {
          ...product.toJSON(),
          totalStock,
          totalValue,
          stockByBranch: stocks.map((s: any) => ({
            branchId: s.branchId,
            branchCode: s.branch?.code,
            branchName: s.branch?.name,
            quantity: s.quantity,
            availableQuantity: s.availableQuantity,
            status: s.status
          }))
        };
      }));

      return res.status(HttpStatus.OK).json(
        successResponse(productsWithStock, getPaginationMeta(count, limit, offset))
      );
    }

    return res.status(HttpStatus.OK).json(
      successResponse(rows, getPaginationMeta(count, limit, offset))
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to fetch products')
    );
  }
}

async function createProduct(req: NextApiRequest, res: NextApiResponse) {
  if (!Product) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Product model not available')
    );
  }

  const {
    tenantId,
    sku,
    name,
    description,
    category,
    subCategory,
    unit,
    barcode,
    costPrice,
    sellingPrice,
    taxRate,
    minStockLevel,
    maxStockLevel,
    reorderPoint,
    reorderQuantity,
    createdBy
  } = req.body;

  if (!tenantId || !sku || !name || !category || !unit || !costPrice || !sellingPrice || !createdBy) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(
        ErrorCodes.MISSING_REQUIRED_FIELDS,
        'Missing required fields: tenantId, sku, name, category, unit, costPrice, sellingPrice, createdBy'
      )
    );
  }

  try {
    const product = await Product.create({
      tenantId,
      sku,
      name,
      description,
      category,
      subCategory,
      unit,
      barcode,
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      taxRate: taxRate ? parseFloat(taxRate) : 0,
      isActive: true,
      trackInventory: true,
      minStockLevel: minStockLevel ? parseInt(minStockLevel) : null,
      maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : null,
      reorderPoint: reorderPoint ? parseInt(reorderPoint) : null,
      reorderQuantity: reorderQuantity ? parseInt(reorderQuantity) : null,
      createdBy
    });

    return res.status(HttpStatus.CREATED).json(
      successResponse(product, undefined, 'Product created successfully')
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpStatus.CONFLICT).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'SKU or barcode already exists')
      );
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, error.message)
      );
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to create product')
    );
  }
}

async function updateProduct(req: NextApiRequest, res: NextApiResponse) {
  if (!Product) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Product model not available')
    );
  }

  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Product ID is required')
    );
  }

  try {
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Product not found')
      );
    }

    await product.update(updateData);

    return res.status(HttpStatus.OK).json(
      successResponse(product, undefined, 'Product updated successfully')
    );
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpStatus.CONFLICT).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'SKU or barcode already exists')
      );
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to update product')
    );
  }
}

async function deleteProduct(req: NextApiRequest, res: NextApiResponse) {
  if (!Product) {
    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      errorResponse(ErrorCodes.MODEL_NOT_AVAILABLE, 'Product model not available')
    );
  }

  const { id } = req.query;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'Product ID is required')
    );
  }

  try {
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'Product not found')
      );
    }

    // Soft delete by setting isActive to false
    await product.update({ isActive: false });

    return res.status(HttpStatus.OK).json(
      successResponse(null, undefined, 'Product deactivated successfully')
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to delete product')
    );
  }
}
