#!/usr/bin/env node
/**
 * Data demo untuk Panel pemilik (Opanel): transaksi POS 14 hari, cabang, kasir,
 * produk + stok menipis, pelanggan member/VIP, paket berlangganan tenant.
 *
 * Penggunaan:
 *   node scripts/seed-opanel-demo-data.js
 *   TENANT_ID=<uuid-tenant> node scripts/seed-opanel-demo-data.js
 *
 * Tenant default: user pertama dengan role owner yang punya tenantId.
 */

const crypto = require('crypto');
const { Op, QueryTypes } = require('sequelize');
const { validate: uuidValidate, v5: uuidv5 } = require('uuid');
const db = require('../models');
const sequelize = db.sequelize;

const CASHIER_ID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

/** Nilai yang dikenali hook model PosTransaction → enum DB lowercase */
const PAYMENT_METHODS = ['Cash', 'QRIS', 'Card', 'Transfer', 'E-Wallet'];

function pick(arr, i) {
  return arr[i % arr.length];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function resolveTenantId() {
  const fromEnv = process.env.TENANT_ID;
  if (fromEnv && String(fromEnv).trim()) {
    const t = await db.Tenant.findByPk(String(fromEnv).trim());
    if (!t) throw new Error(`Tenant tidak ditemukan: ${fromEnv}`);
    return t.id;
  }
  let user = await db.User.findOne({
    where: { role: 'owner' },
    order: [['id', 'ASC']],
    attributes: ['id', 'tenantId', 'email', 'role'],
  });
  if (!user?.tenantId) {
    user = await db.User.findOne({
      where: { tenantId: { [Op.ne]: null } },
      order: [['id', 'ASC']],
      attributes: ['id', 'tenantId', 'email', 'role'],
    });
  }
  if (!user?.tenantId) {
    const t = await db.Tenant.findOne({ order: [['createdAt', 'ASC']] });
    if (t?.id) {
      console.log('⊙ Pakai tenant pertama di DB (tanpa user owner terdeteksi):', t.id);
      return t.id;
    }
    throw new Error(
      'Tidak ada TENANT_ID, user dengan tenantId, atau baris tenants. Set TENANT_ID=<uuid> lalu jalankan lagi.'
    );
  }
  console.log('⊙ Tenant dari user:', user.email, `(${user.role})`);
  return user.tenantId;
}

async function ensureBranch(tenantId) {
  let branch = await db.Branch.findOne({ where: { tenantId } });
  if (branch) return branch;
  const suffix = crypto.randomBytes(4).toString('hex');
  branch = await db.Branch.create({
    tenantId,
    code: `OP-${suffix}`,
    name: 'Outlet Demo Opanel',
    type: 'main',
    city: 'Jakarta',
    isActive: true,
  });
  console.log('✓ Cabang dibuat:', branch.code, branch.name);
  return branch;
}

/**
 * cashier_id di DB bertipe uuid (bukan integer employees.id).
 * Prioritas: transaksi cabang yang sama → cabang tenant → user tenant → UUID acak.
 */
async function ensurePosCashierUuid(tenantId, branchId) {
  const tid = String(tenantId);
  const bid = String(branchId);

  const sameBranch = await sequelize
    .query(`SELECT cashier_id::text AS cid FROM pos_transactions WHERE branch_id::text = :bid AND cashier_id IS NOT NULL LIMIT 1`, {
      replacements: { bid },
      type: QueryTypes.SELECT,
    })
    .catch(() => []);

  if (sameBranch[0]?.cid && uuidValidate(sameBranch[0].cid)) {
    console.log('⊙ Kasir (reuse cabang):', sameBranch[0].cid);
    return sameBranch[0].cid;
  }

  const tenantBranch = await sequelize
    .query(
      `SELECT pt.cashier_id::text AS cid FROM pos_transactions pt
       JOIN branches b ON b.id = pt.branch_id
       WHERE b.tenant_id::text = :tid AND pt.cashier_id IS NOT NULL LIMIT 1`,
      { replacements: { tid }, type: QueryTypes.SELECT }
    )
    .catch(() => []);

  if (tenantBranch[0]?.cid && uuidValidate(tenantBranch[0].cid)) {
    console.log('⊙ Kasir (reuse tenant):', tenantBranch[0].cid);
    return tenantBranch[0].cid;
  }

  const u = await db.User.findOne({
    where: { tenantId: tid },
    order: [['id', 'ASC']],
    attributes: ['id'],
  });
  if (u?.id != null) {
    const cid = uuidv5(String(u.id), CASHIER_ID_NAMESPACE);
    console.log('⊙ Kasir dari user tenant id → uuid v5:', u.id);
    return cid;
  }

  const rnd = crypto.randomUUID();
  console.warn('⊙ Kasir acak (tidak ada user tenant / transaksi):', rnd);
  return rnd;
}

async function seedPosTransactions(branchId, cashierId, tenantId) {
  const prefix = `OP-SEED-${String(tenantId).slice(0, 8)}`;
  const cntRow = await sequelize
    .query(`SELECT COUNT(*)::int AS n FROM pos_transactions WHERE transaction_number LIKE :pat`, {
      replacements: { pat: `${prefix}-%` },
      type: QueryTypes.SELECT,
    })
    .catch(() => [{ n: 0 }]);
  const existing = cntRow[0]?.n ?? 0;
  if (existing >= 40) {
    console.log('⊙ Transaksi demo sudah ada (≥40), lewati penambahan POS.');
    return;
  }

  let created = 0;
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let day = 0; day < 14; day++) {
    const base = new Date(today);
    base.setDate(base.getDate() - day);
    const nTx = randomInt(4, 10);
    for (let i = 0; i < nTx; i++) {
      const d = new Date(base);
      d.setHours(randomInt(9, 21), randomInt(0, 59), 0, 0);
      const total = randomInt(35_000, 420_000);
      const subtotal = total;
      const pm = pick(PAYMENT_METHODS, created + day + i);
      const txNo = `${prefix}-${day}-${i}-${crypto.randomBytes(3).toString('hex')}`;
      try {
        await db.PosTransaction.create({
          transactionNumber: txNo,
          cashierId,
          branchId,
          transactionDate: d,
          subtotal,
          discount: 0,
          tax: 0,
          serviceCharge: 0,
          total,
          paymentMethod: pm,
          paidAmount: total,
          changeAmount: 0,
          status: 'completed',
          customerName: 'Walk-in',
          wasHeld: false,
        });
        created++;
      } catch (e) {
        console.warn('  skip tx', txNo, e.message);
      }
    }
  }
  console.log(`✓ Transaksi POS demo ditambahkan: ${created} (14 hari terakhir)`);
}

async function seedProductsAndStock(tenantId) {
  const tag = String(tenantId).replace(/-/g, '').slice(0, 12);
  const specs = [
    { name: 'Demo Bahan Habis', sku: `OP-${tag}-LOW`, min: 30, reo: 25, qty: 4 },
    { name: 'Demo Reorder Urgent', sku: `OP-${tag}-REO`, min: 15, reo: 20, qty: 8 },
    { name: 'Demo Stok Aman', sku: `OP-${tag}-OK`, min: 5, reo: 5, qty: 120 },
  ];

  for (const s of specs) {
    let p = await db.Product.findOne({ where: { sku: s.sku } });
    if (!p) {
      p = await db.Product.create({
        name: s.name,
        sku: s.sku,
        unit: 'pcs',
        sell_price: 25000,
        minimum_stock: s.min,
        reorder_point: s.reo,
        is_active: true,
        is_trackable: true,
      });
      await db.Stock.create({
        product_id: p.id,
        quantity: s.qty,
        reserved_quantity: 0,
        available_quantity: s.qty,
      });
      console.log('✓ Produk + stok (baru):', s.sku);
    } else {
      await p.update({
        minimum_stock: s.min,
        reorder_point: s.reo,
        name: s.name,
      });
      const rows = await db.Stock.findAll({ where: { product_id: p.id }, limit: 1 });
      if (rows[0]) {
        await rows[0].update({
          quantity: s.qty,
          available_quantity: s.qty,
        });
      } else {
        await db.Stock.create({
          product_id: p.id,
          quantity: s.qty,
          reserved_quantity: 0,
          available_quantity: s.qty,
        });
      }
      console.log('✓ Produk stok diperbarui:', s.sku);
    }
  }
}

async function seedCustomers(tenantId) {
  const tid = String(tenantId);
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const types = ['member', 'vip', 'member', 'walk-in', 'member', 'member'];
  let n = 0;
  const base = Date.now();
  for (let i = 0; i < 6; i++) {
    const phone = `0899${crypto.randomInt(10000000, 99999999)}${i}`;
    const email = `opanel.member.${base}.${i}@demo.bedagang.local`;
    const dup = await sequelize
      .query(`SELECT 1 AS x FROM customers WHERE tenant_id::text = :tid AND phone = :phone LIMIT 1`, {
        replacements: { tid, phone },
        type: QueryTypes.SELECT,
      })
      .catch(() => []);
    if (dup.length) continue;

    const ctype = types[i];
    const tier = ctype === 'walk-in' ? null : pick(tiers, i);
    const memSql = tier == null ? 'NULL' : `CAST(:tier AS "enum_customers_membershipLevel")`;
    const repl = {
      tid,
      name: `Pelanggan Demo ${i + 1}`,
      phone,
      email,
      ctype,
      pts: randomInt(0, 5000),
    };
    if (tier != null) repl.tier = tier;

    try {
      await sequelize.query(
        `INSERT INTO customers (
          tenant_id, name, phone, email, type, status, points,
          "customerType", "membershipLevel", created_at, updated_at
        ) VALUES (
          CAST(:tid AS uuid), :name, :phone, :email,
          CAST(:ctype AS "enum_customers_type"),
          CAST('active' AS "enum_customers_status"),
          :pts,
          CAST('individual' AS "enum_customers_customerType"),
          ${memSql},
          NOW(), NOW()
        )`,
        { replacements: repl }
      );
      n++;
    } catch (e) {
      console.warn('  skip pelanggan', phone, e.message);
    }
  }
  if (n) console.log(`✓ Pelanggan demo: ${n} baris`);
  else console.log('⊙ Pelanggan demo sudah ada / dilewati');
}

async function updateTenantSubscription(tenantId) {
  const end = new Date();
  end.setDate(end.getDate() + 45);
  await db.Tenant.update(
    {
      subscriptionPlan: 'premium',
      subscriptionStart: new Date(),
      subscriptionEnd: end,
      status: 'active',
    },
    { where: { id: tenantId } }
  );
  console.log('✓ Tenant: paket premium, berakhir ~45 hari');
}

async function main() {
  console.log('Opanel — seed data demo\n');
  try {
    const tenantId = await resolveTenantId();
    console.log('Tenant:', tenantId);

    const branch = await ensureBranch(tenantId);
    const cashierId = await ensurePosCashierUuid(tenantId, branch.id);

    await seedPosTransactions(branch.id, cashierId, tenantId);
    await seedProductsAndStock(tenantId);
    await seedCustomers(tenantId);
    await updateTenantSubscription(tenantId);

    console.log('\nSelesai. Buka /opanel/dashboard dan segarkan data.');
    process.exit(0);
  } catch (e) {
    console.error('\nGagal:', e.message);
    if (e.errors) console.error(e.errors);
    process.exit(1);
  }
}

main();
