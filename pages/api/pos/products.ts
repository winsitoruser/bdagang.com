import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const db = require('@/models');
const { Op } = require('sequelize');
const sequelize = require('@/lib/sequelize');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      return await getProducts(req, res, session);
    } else if (req.method === 'POST') {
      return await createProduct(req, res, session);
    } else if (req.method === 'PUT') {
      return await updateProduct(req, res, session);
    } else if (req.method === 'PATCH') {
      return await adjustStock(req, res, session);
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('POS Products API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { search = '', category = '' } = req.query;
  const { Product, Stock } = db;
  const tenantId = (session.user as any)?.tenantId;

  // Build where clause
  const whereClause: any = { is_active: true };

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } },
      { barcode: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Category filter - resolve ID from name if needed
  let categoryFilterId: number | null = null;
  if (category && category !== 'Semua') {
    const catId = parseInt(category as string);
    if (!isNaN(catId)) {
      categoryFilterId = catId;
    } else {
      // Try to find category by name
      try {
        const [catRows] = await sequelize.query(
          `SELECT id FROM product_categories WHERE name ILIKE :name AND is_active = true LIMIT 1`,
          { replacements: { name: category } }
        );
        if (catRows && (catRows as any[]).length > 0) {
          categoryFilterId = (catRows as any[])[0].id;
        }
      } catch { /* ignore */ }
    }
    if (categoryFilterId) {
      whereClause.category_id = categoryFilterId;
    }
  }

  // Fetch products with stock data via proper association
  const products = await Product.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'sku', 'barcode', 'sell_price', 'unit', 'category_id', 'description'],
    include: [{
      model: Stock,
      as: 'stock_data',
      attributes: ['quantity'],
      required: false
    }],
    order: [['name', 'ASC']],
    limit: 500
  });

  // Fetch product categories from the actual product_categories table
  let categoriesData: any[] = [];
  try {
    let catQuery = `SELECT id, name, code, icon, color FROM product_categories WHERE is_active = true`;
    const catParams: any = {};
    if (tenantId) {
      catQuery += ` AND tenant_id = :tenantId`;
      catParams.tenantId = tenantId;
    }
    catQuery += ` ORDER BY sort_order, name`;
    const [rows] = await sequelize.query(catQuery, { replacements: catParams });
    categoriesData = rows || [];
  } catch (e: any) {
    // Fallback: extract unique category_ids from products and build simple list
    console.warn('product_categories table query failed, using fallback:', e.message);
    const uniqueCatIds = [...new Set(products.map((p: any) => p.category_id).filter(Boolean))];
    categoriesData = uniqueCatIds.map((id: any) => ({ id, name: `Kategori ${id}` }));
  }

  // Build category lookup
  const categoryMap = new Map<number, string>();
  categoriesData.forEach((c: any) => categoryMap.set(Number(c.id), c.name));

  // Categories for frontend filter
  const categories = ['Semua', ...categoriesData.map((c: any) => ({ id: c.id, name: c.name }))];

  // Map products with resolved stock and category name
  const mappedProducts = products.map((p: any) => {
    const stockData = p.stock_data || [];
    const totalStock = stockData.reduce((sum: number, s: any) => sum + parseFloat(s.quantity || 0), 0);

    return {
      id: p.id.toString(),
      name: p.name,
      sku: p.sku || '',
      barcode: p.barcode || '',
      description: p.description || '',
      category: categoryMap.get(Number(p.category_id)) || 'Umum',
      categoryId: p.category_id,
      price: parseFloat(p.sell_price) || 0,
      stock: totalStock,
      unit: p.unit || 'pcs'
    };
  });

  return res.status(200).json({
    success: true,
    products: mappedProducts,
    categories,
    total: mappedProducts.length
  });
}

async function createProduct(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { Product, Stock } = db;
  const { name, sku, barcode, sell_price, buy_price, unit, category_id, description, stock } = req.body;

  if (!name || sell_price === undefined) {
    return res.status(400).json({ success: false, error: 'Nama dan harga jual wajib diisi' });
  }

  const t = await sequelize.transaction();
  try {
    const product = await Product.create({
      name,
      sku: sku || `SKU-${Date.now()}`,
      barcode: barcode || null,
      sell_price: parseFloat(sell_price),
      buy_price: buy_price ? parseFloat(buy_price) : 0,
      unit: unit || 'pcs',
      category_id: category_id || null,
      description: description || '',
      is_active: true,
      tenant_id: (session.user as any)?.tenantId || null,
    }, { transaction: t });

    if (stock !== undefined && stock !== null) {
      await Stock.create({
        product_id: product.id,
        quantity: parseInt(stock) || 0,
        branch_id: (session.user as any)?.branchId || null,
        tenant_id: (session.user as any)?.tenantId || null,
      }, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      product: { id: product.id, name: product.name }
    });
  } catch (err: any) {
    await t.rollback();
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal menambah produk' });
  }
}

async function updateProduct(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { Product } = db;
  const { id, name, sku, barcode, sell_price, buy_price, unit, category_id, description } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Product ID wajib diisi' });
  }

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (sku !== undefined) updates.sku = sku;
    if (barcode !== undefined) updates.barcode = barcode;
    if (sell_price !== undefined) updates.sell_price = parseFloat(sell_price);
    if (buy_price !== undefined) updates.buy_price = parseFloat(buy_price);
    if (unit !== undefined) updates.unit = unit;
    if (category_id !== undefined) updates.category_id = category_id;
    if (description !== undefined) updates.description = description;

    await product.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil diperbarui',
      product: { id: product.id, name: product.name }
    });
  } catch (err: any) {
    console.error('Update product error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal memperbarui produk' });
  }
}

async function adjustStock(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { Stock } = db;
  const { product_id, quantity, type } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({ success: false, error: 'Product ID dan quantity wajib diisi' });
  }

  try {
    const branchId = (session.user as any)?.branchId || null;
    const tenantId = (session.user as any)?.tenantId || null;

    let stockRecord = await Stock.findOne({
      where: { product_id, ...(branchId ? { branch_id: branchId } : {}) }
    });

    if (!stockRecord) {
      stockRecord = await Stock.create({
        product_id,
        quantity: type === 'set' ? parseInt(quantity) : parseInt(quantity),
        branch_id: branchId,
        tenant_id: tenantId,
      });
    } else {
      const currentQty = parseInt(stockRecord.quantity) || 0;
      let newQty: number;

      if (type === 'set') {
        newQty = parseInt(quantity);
      } else if (type === 'subtract') {
        newQty = Math.max(0, currentQty - parseInt(quantity));
      } else {
        newQty = currentQty + parseInt(quantity);
      }

      await stockRecord.update({ quantity: newQty });
    }

    return res.status(200).json({
      success: true,
      message: 'Stok berhasil diperbarui',
      stock: { product_id, quantity: stockRecord.quantity }
    });
  } catch (err: any) {
    console.error('Adjust stock error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal memperbarui stok' });
  }
}
