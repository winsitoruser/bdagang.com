/**
 * Cetak kredensial login untuk lingkungan pengembangan lokal.
 * Akun super admin dibuat oleh seeder: seeders/20260213-create-master-account.js
 *
 * Jalankan: npm run dev:credentials
 * Buat akun di DB: npm run db:seed:master
 */
const SUPERADMIN = {
  email: 'superadmin@bedagang.com',
  password: 'MasterAdmin2026!',
  role: 'super_admin',
};

console.log('');
console.log('BEDAGANG — kredensial lokal (development)');
console.log('==========================================');
console.log('');
console.log('Super admin (setelah seed master account):');
console.log('  Email:    ', SUPERADMIN.email);
console.log('  Password: ', SUPERADMIN.password);
console.log('  Role:     ', SUPERADMIN.role);
console.log('');
console.log('Login: http://localhost:3001/auth/login  (atau sesuai PORT / NEXTAUTH_URL)');
console.log('');
console.log('Jika user belum ada, jalankan:');
console.log('  npm run db:seed:master');
console.log('');
console.log('⚠️  Ganti password setelah login pertama di production.');
console.log('');
