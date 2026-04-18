/**
 * Menyalin .env / .env.local dari akar repo ke apps/store-web/.env.local
 * agar backend store-web (port 3003) punya variabel DB & auth yang sama.
 *
 * Menyetel NEXTAUTH_URL=http://localhost:3003 jika belum ada di file tujuan.
 *
 * Run: node scripts/sync-store-web-env.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEST = path.join(ROOT, 'apps', 'store-web', '.env.local');

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function main() {
  const env = readIfExists(path.join(ROOT, '.env'));
  const envLocal = readIfExists(path.join(ROOT, '.env.local'));
  let merged = [env, envLocal].filter(Boolean).join('\n');
  if (!merged.trim()) {
    console.warn('Tidak ada .env atau .env.local di akar repo. Buat manual apps/store-web/.env.local');
    process.exit(0);
  }
  if (!/^NEXTAUTH_URL=/m.test(merged)) {
    merged += '\nNEXTAUTH_URL=http://localhost:3003\n';
  } else {
    merged = merged.replace(
      /^NEXTAUTH_URL=.*$/m,
      'NEXTAUTH_URL=http://localhost:3003'
    );
  }
  fs.writeFileSync(DEST, merged.trim() + '\n', 'utf8');
  console.log(`OK: ditulis ${path.relative(ROOT, DEST)} (NEXTAUTH_URL=3003)`);
}

main();
