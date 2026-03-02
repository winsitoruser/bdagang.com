import type { NextApiRequest, NextApiResponse } from 'next';
import { successResponse, errorResponse, ErrorCodes, HttpStatus } from '../../../../lib/api/response';

const sequelize = require('../../../../lib/sequelize');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': return await getPricing(req, res);
      case 'POST': return await createPriceTier(req, res);
      case 'PUT': return await updatePricing(req, res);
      case 'DELETE': return await deletePriceTier(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json(errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, `Method ${req.method} Not Allowed`));
    }
  } catch (error: any) {
    console.error('Inventory Pricing API Error:', error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, error.message));
  }
}

async function getPricing(req: NextApiRequest, res: NextApiResponse) {
  const { type, search, category } = req.query;

  // Check if product_price_tiers table exists
  let hasTierTable = false;
  try {
    await sequelize.query("SELECT 1 FROM product_price_tiers LIMIT 1");
    hasTierTable = true;
  } catch (e) { /* table doesn't exist yet */ }

  if (type === 'tiers' && hasTierTable) {
    let where = '';
    const params: any = {};
    if (search) { where = 'WHERE name ILIKE :search OR code ILIKE :search'; params.search = `%${search}%`; }
    const [tiers] = await sequelize.query(`SELECT * FROM product_price_tiers ${where} ORDER BY sort_order, name`, { replacements: params });
    return res.status(HttpStatus.OK).json(successResponse({ priceTiers: tiers.map((t: any) => ({
      id: String(t.id), code: t.code, name: t.name, description: t.description || '',
      multiplier: parseFloat(t.multiplier) || 1, markupPercent: parseFloat(t.markup_percent) || 0,
      region: t.region || 'Nasional', appliedBranches: 0, productCount: 0,
      isActive: t.is_active, createdAt: t.created_at
    })) }));
  }

  if (type === 'products') {
    let where = 'WHERE p.is_active=true';
    const params: any = {};
    if (search) { where += ' AND (p.name ILIKE :search OR p.sku ILIKE :search)'; params.search = `%${search}%`; }
    if (category && category !== 'Semua Kategori' && category !== 'all') { where += ' AND pc.name=:cat'; params.cat = category; }

    const [products] = await sequelize.query(`
      SELECT p.id, p.name, p.sku, p.buy_price, p.sell_price, pc.name as category
      FROM products p LEFT JOIN product_categories pc ON pc.id=p.category_id
      ${where} ORDER BY p.name LIMIT 50
    `, { replacements: params });

    return res.status(HttpStatus.OK).json(successResponse({
      productPrices: products.map((p: any) => {
        const buy = parseFloat(p.buy_price) || 0;
        const sell = parseFloat(p.sell_price) || 0;
        const margin = sell > 0 ? ((sell - buy) / sell * 100) : 0;
        return {
          id: String(p.id), productId: String(p.id), productName: p.name, sku: p.sku,
          category: p.category || '-', basePrice: sell, costPrice: buy,
          margin: Math.round(margin * 100) / 100,
          tierPrices: [{ tierId: '1', tierName: 'Standar', price: sell }],
          isLocked: false, lockedBy: null
        };
      })
    }));
  }

  // Return both
  let priceTiers: any[] = [];
  if (hasTierTable) {
    const [tiers] = await sequelize.query("SELECT * FROM product_price_tiers ORDER BY sort_order, name");
    priceTiers = tiers.map((t: any) => ({
      id: String(t.id), code: t.code, name: t.name, description: t.description || '',
      multiplier: parseFloat(t.multiplier) || 1, markupPercent: parseFloat(t.markup_percent) || 0,
      region: t.region || 'Nasional', appliedBranches: 0, productCount: 0,
      isActive: t.is_active, createdAt: t.created_at
    }));
  }

  const [products] = await sequelize.query(`
    SELECT p.id, p.name, p.sku, p.buy_price, p.sell_price, pc.name as category
    FROM products p LEFT JOIN product_categories pc ON pc.id=p.category_id
    WHERE p.is_active=true ORDER BY p.name LIMIT 50
  `);

  return res.status(HttpStatus.OK).json(successResponse({
    priceTiers,
    productPrices: products.map((p: any) => {
      const buy = parseFloat(p.buy_price) || 0;
      const sell = parseFloat(p.sell_price) || 0;
      return {
        id: String(p.id), productId: String(p.id), productName: p.name, sku: p.sku,
        category: p.category || '-', basePrice: sell, costPrice: buy,
        margin: sell > 0 ? Math.round((sell - buy) / sell * 10000) / 100 : 0,
        tierPrices: [{ tierId: '1', tierName: 'Standar', price: sell }],
        isLocked: false, lockedBy: null
      };
    })
  }));
}

async function createPriceTier(req: NextApiRequest, res: NextApiResponse) {
  const { code, name, description, multiplier, markupPercent, region } = req.body;
  if (!code || !name) return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Code and name required'));

  try {
    const [result] = await sequelize.query(`
      INSERT INTO product_price_tiers (tenant_id, code, name, description, multiplier, markup_percent, region, is_active)
      VALUES ((SELECT tenant_id FROM products LIMIT 1), :code, :name, :desc, :mult, :markup, :region, true) RETURNING id
    `, { replacements: { code: code.toUpperCase(), name, desc: description || null, mult: multiplier || 1.0, markup: markupPercent || 0, region: region || 'Nasional' } });
    return res.status(HttpStatus.CREATED).json(successResponse({ id: result[0].id }, undefined, 'Price tier created'));
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return res.status(HttpStatus.OK).json(successResponse({ mock: true }, undefined, 'Price tier table not yet created'));
    }
    throw e;
  }
}

async function updatePricing(req: NextApiRequest, res: NextApiResponse) {
  const { id, productId, basePrice, costPrice } = req.body;

  if (productId) {
    const sets: string[] = [];
    const params: any = { id: productId };
    if (basePrice !== undefined) { sets.push('sell_price=:basePrice'); params.basePrice = basePrice; }
    if (costPrice !== undefined) { sets.push('buy_price=:costPrice'); params.costPrice = costPrice; }
    if (sets.length > 0) {
      // Track price change
      const [old] = await sequelize.query("SELECT buy_price, sell_price FROM products WHERE id=:id", { replacements: { id: productId } });
      if (old.length > 0) {
        await sequelize.query(`INSERT INTO product_cost_history (product_id, old_buy_price, new_buy_price, old_sell_price, new_sell_price, reason) VALUES (:id, :ob, :nb, :os, :ns, 'Price update')`,
          { replacements: { id: productId, ob: old[0].buy_price, nb: costPrice ?? old[0].buy_price, os: old[0].sell_price, ns: basePrice ?? old[0].sell_price } });
      }
      sets.push("updated_at=NOW()");
      await sequelize.query(`UPDATE products SET ${sets.join(', ')} WHERE id=:id`, { replacements: params });
    }
    return res.status(HttpStatus.OK).json(successResponse({ productId }, undefined, 'Product pricing updated'));
  }

  if (id) {
    try {
      const fields = req.body;
      const sets: string[] = [];
      const params: any = { id };
      const map: Record<string, string> = { name: 'name', description: 'description', multiplier: 'multiplier', markupPercent: 'markup_percent', region: 'region', isActive: 'is_active' };
      for (const [k, col] of Object.entries(map)) {
        if (fields[k] !== undefined) { sets.push(`${col}=:${k}`); params[k] = fields[k]; }
      }
      if (sets.length > 0) {
        sets.push("updated_at=NOW()");
        await sequelize.query(`UPDATE product_price_tiers SET ${sets.join(', ')} WHERE id=:id`, { replacements: params });
      }
    } catch (e) { /* table may not exist */ }
    return res.status(HttpStatus.OK).json(successResponse({ id }, undefined, 'Price tier updated'));
  }

  return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid request'));
}

async function deletePriceTier(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id || req.body?.id;
  if (!id) return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(ErrorCodes.MISSING_REQUIRED_FIELDS, 'Tier ID required'));

  try {
    const [tier] = await sequelize.query("SELECT code FROM product_price_tiers WHERE id=:id", { replacements: { id } });
    if (tier.length > 0 && tier[0].code === 'STD') {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot delete standard tier'));
    }
    await sequelize.query("DELETE FROM product_price_tiers WHERE id=:id", { replacements: { id } });
  } catch (e) { /* table may not exist */ }
  return res.status(HttpStatus.OK).json(successResponse(null, undefined, 'Price tier deleted'));
}
