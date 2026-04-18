/**
 * Membuat atau memperbarui akun super admin lokal (password di-hash dengan bcryptjs
 * sama seperti pages/api/auth/[...nextauth].ts).
 *
 * Pakai jika login gagal: user belum ada di DB, atau hash password tidak cocok.
 *
 *   node scripts/ensure-master-admin.js
 *
 * Override email/password:
 *   DEV_SUPERADMIN_EMAIL=a@b.com DEV_SUPERADMIN_PASSWORD='Secret1!' node scripts/ensure-master-admin.js
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.development' });
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');

const EMAIL = (process.env.DEV_SUPERADMIN_EMAIL || 'superadmin@bedagang.com').trim().toLowerCase();
const PASSWORD = process.env.DEV_SUPERADMIN_PASSWORD || 'MasterAdmin2026!';

async function main() {
  await db.sequelize.authenticate();
  console.log('DB:', db.sequelize.config.database, '@', db.sequelize.config.host);

  const hash = await bcrypt.hash(PASSWORD, 10);

  let user = await db.User.findOne({
    where: { email: { [Op.iLike]: EMAIL } },
  });

  if (!user) {
    user = await db.User.create({
      name: 'Super Administrator',
      email: EMAIL,
      phone: '+62-MASTER-ADMIN',
      businessName: 'System Administrator',
      password: hash,
      role: 'super_admin',
      tenantId: null,
      isActive: true,
    });
    console.log('✅ Akun super admin dibuat.');
  } else {
    await user.update({
      password: hash,
      isActive: true,
      role: 'super_admin',
    });
    console.log('✅ Password super admin diperbarui (hash diselaraskan dengan bcryptjs).');
  }

  const ok = await bcrypt.compare(PASSWORD, user.password);
  console.log('Verifikasi bcrypt.compare:', ok ? 'OK' : 'GAGAL');
  console.log('');
  console.log('Login dengan:');
  console.log('  Email:   ', EMAIL);
  console.log('  Password:', PASSWORD);
  console.log('');
  await db.sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
