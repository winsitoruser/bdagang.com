/**
 * Membuat akun owner baru lengkap dengan Tenant ID, KYB draft, dan modul default aktif.
 * Alur ini setara dengan POST /api/auth/register + aktivasi modul tenant.
 *
 * Usage:
 *   node scripts/create-verified-tenant-account.js
 *   TENANT_TEST_EMAIL=owner@toko.test TENANT_TEST_PASSWORD=Rahasia1! node scripts/create-verified-tenant-account.js
 */

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { Op } = require('sequelize');
const db = require('../models');

const EMAIL =
  process.env.TENANT_TEST_EMAIL || 'verified.owner@bedagang.local';
const PASSWORD = process.env.TENANT_TEST_PASSWORD || 'VerifiedTenant2026!';
const BUSINESS_NAME = process.env.TENANT_TEST_BUSINESS || 'Toko Verified QA';
const OWNER_NAME = process.env.TENANT_TEST_OWNER_NAME || 'Owner Verified';

/** Modul sidebar cabang (sesuai seed modules umum) */
const PREFERRED_MODULE_CODES = [
  'dashboard',
  'pos',
  'inventory',
  'products',
  'customers',
  'employees',
  'loyalty',
  'tables',
  'reservations',
  'promo',
  'finance',
  'reports',
  'settings',
  'kitchen',
  'hpp',
  'suppliers'
];

/**
 * Upsert modul tenant dengan SQL mentah agar kompatibel dengan skema DB
 * (beberapa lingkungan tidak punya semua kolom yang ada di model Sequelize).
 */
async function enableModulesForTenant(tenantId) {
  const found = await db.Module.findAll({
    where: { code: { [Op.in]: PREFERRED_MODULE_CODES }, isActive: true }
  });
  const modules = found.length
    ? found
    : await db.Module.findAll({ where: { isActive: true }, limit: 40 });

  const qi = db.sequelize.getQueryInterface();
  const desc = await qi.describeTable('tenant_modules').catch(() => ({}));
  const has = (col) => Object.prototype.hasOwnProperty.call(desc, col);
  const idType = desc.id ? String(desc.id.type || '').toLowerCase() : '';
  const idIsUuid = idType.includes('uuid');

  let n = 0;
  for (const mod of modules) {
    const [existing] = await db.sequelize.query(
      `SELECT id FROM tenant_modules WHERE tenant_id = :tid AND module_id = :mid LIMIT 1`,
      { replacements: { tid: tenantId, mid: mod.id } }
    );
    const rows = Array.isArray(existing) ? existing : [];

    if (rows.length > 0) {
      let updateSql = `UPDATE tenant_modules SET is_enabled = true`;
      if (has('enabled_at')) updateSql += `, enabled_at = COALESCE(enabled_at, NOW())`;
      if (has('updated_at')) updateSql += `, updated_at = NOW()`;
      updateSql += ` WHERE tenant_id = :tid AND module_id = :mid`;
      await db.sequelize.query(updateSql, {
        replacements: { tid: tenantId, mid: mod.id }
      });
    } else {
      const colList = ['tenant_id', 'module_id'];
      const valList = [':tid', ':mid'];
      const rep = { tid: tenantId, mid: mod.id };

      if (idIsUuid) {
        const id = randomUUID();
        colList.unshift('id');
        valList.unshift(':id');
        rep.id = id;
      }

      if (has('is_enabled')) {
        colList.push('is_enabled');
        valList.push('TRUE');
      }
      if (has('enabled_at')) {
        colList.push('enabled_at');
        valList.push('NOW()');
      }
      if (has('created_at')) {
        colList.push('created_at');
        valList.push('NOW()');
      }
      if (has('updated_at')) {
        colList.push('updated_at');
        valList.push('NOW()');
      }

      await db.sequelize.query(
        `INSERT INTO tenant_modules (${colList.join(', ')}) VALUES (${valList.join(', ')})`,
        { replacements: rep }
      );
    }
    n += 1;
  }
  return n;
}

async function main() {
  await db.sequelize.authenticate();

  const existingUser = await db.User.findOne({ where: { email: EMAIL } });
  if (existingUser) {
    const tid = existingUser.tenantId || existingUser.tenant_id;
    console.log('\nℹ️  Pengguna dengan email ini sudah ada — memperbarui modul tenant saja.\n');
    console.log('   Email      :', EMAIL);
    console.log('   User ID    :', existingUser.id);
    console.log('   Tenant ID  :', tid || '(tidak ada)');
    if (tid) {
      const count = await enableModulesForTenant(tid);
      console.log('   Modul aktif:', count);
    }
    console.log(
      '\n   Jika akun ini dibuat dengan skrip ini (email default), password-nya:',
      PASSWORD
    );
    console.log('   Login: http://localhost:3001/auth/login\n');
    await db.sequelize.close();
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  let businessTypeId = null;
  const bt =
    (await db.BusinessType.findOne({ where: { code: 'fnb' } })) ||
    (await db.BusinessType.findOne());
  if (bt) businessTypeId = bt.id;

  const bName = BUSINESS_NAME;
  const baseCode = bName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);
  const uniqueSuffix = Date.now().toString(36).toUpperCase().slice(-4);
  const tenantCode = `${baseCode || 'TNT'}-${uniqueSuffix}`;

  const tenant = await db.Tenant.create({
    businessName: bName,
    name: bName,
    code: tenantCode,
    businessTypeId,
    status: 'trial',
    kybStatus: 'pending_kyb',
    setupCompleted: false,
    onboardingStep: 0,
    isActive: true
  });

  const user = await db.User.create({
    name: OWNER_NAME,
    email: EMAIL,
    phone: '08100000001',
    businessName: bName,
    password: hashedPassword,
    tenantId: tenant.id,
    role: 'owner',
    isActive: true
  });

  await db.KybApplication.create({
    tenantId: tenant.id,
    userId: user.id,
    businessName: bName,
    businessCategory: bt ? bt.name : null,
    status: 'draft',
    currentStep: 1,
    completionPercentage: 0
  });

  const moduleCount = await enableModulesForTenant(tenant.id);

  console.log('\n' + '='.repeat(64));
  console.log('✅ Akun tenant baru berhasil dibuat');
  console.log('='.repeat(64));
  console.log('\n   Email        :', EMAIL);
  console.log('   Password     :', PASSWORD);
  console.log('   Nama         :', OWNER_NAME);
  console.log('   Bisnis       :', bName);
  console.log('\n   Tenant ID    :', tenant.id);
  console.log('   Kode tenant  :', tenantCode);
  console.log('   User ID      :', user.id);
  console.log('   Modul aktif  :', moduleCount);
  console.log('\n   Buka: http://localhost:3001/auth/login');
  console.log('\n   API terproteksi (pelanggan, jadwal, POS) memakai tenantId dari JWT.');
  console.log('='.repeat(64) + '\n');

  await db.sequelize.close();
}

main().catch((err) => {
  console.error('\n❌ Gagal:', err.message);
  if (err.message && err.message.includes('relation')) {
    console.error('   Jalankan migrasi: npm run db:migrate\n');
  }
  process.exit(1);
});
