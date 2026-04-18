/**
 * Generates thin re-export pages under apps/store-web/pages from root pages/
 * so the store app is a separate project while sharing one source of truth.
 *
 * Run: node scripts/generate-store-web-reexports.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STORE_PAGES = path.join(ROOT, 'apps', 'store-web', 'pages');

/** Diisi manual di apps/store-web/pages (jangan ditimpa generator). */
const MANUAL_PAGES = new Set(['finance/invoices.tsx']);

/** Halaman yang tidak di-mirror (sumber rusak / modul hilang). */
const EXCLUDE = new Set([
  'pos/transaksi.tsx',
  'pos/settings-old.tsx',
  /** Mengimpor middleware server (sequelize) ke bundle klien. */
  'finance/transfers-with-auth.tsx',
  'finance/transfers.tsx',
  /** Sumber: tidak ada default export / impor modul rusak. */
  'inventory/products/new-step5.tsx',
  'finance/ledger.tsx',
  'settings/hardware.tsx',
  'finance/settings-api-integration.tsx',
]);

/** Paths under pages/ (relative, use /). Single-file routes at pages root listed separately. */
const MODULE_PREFIXES = [
  'customers',
  'inventory',
  'pos',
  'settings',
  'reports',
  'finance',
  'kitchen',
  'tables',
  'employees',
  'reservations',
];

/** Root pages files (no subfolder) to mirror in store-web/pages */
const ROOT_PAGE_FILES = [
  'promo-voucher.tsx',
  'loyalty-program.tsx',
];

/** Files that export data fetching helpers (extend re-export list). */
const EXTRA_EXPORTS = {
  'pos/discounts.tsx': ['getServerSideProps'],
};

function collectTsxFiles(dir, baseRel = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = baseRel ? `${baseRel}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsxFiles(full, rel));
    } else if (name.endsWith('.tsx')) {
      out.push(rel.replace(/\\/g, '/'));
    }
  }
  return out;
}

function shouldInclude(relFromPages) {
  const norm = relFromPages.replace(/\\/g, '/');
  if (EXCLUDE.has(norm)) return false;
  for (const p of MODULE_PREFIXES) {
    if (norm === p || norm.startsWith(`${p}/`)) return true;
  }
  return false;
}

function upPrefix(relFromPages) {
  const norm = relFromPages.replace(/\\/g, '/');
  const dir = path.posix.dirname(norm);
  const dirParts = dir === '.' ? [] : dir.split('/').filter(Boolean);
  const levels = 3 + dirParts.length;
  return '../'.repeat(levels);
}

function buildReexport(relFromPages) {
  const norm = relFromPages.replace(/\\/g, '/');
  const target = norm.replace(/\.tsx$/, '');
  const up = upPrefix(norm);
  const fromPath = `${up}pages/${target}`;
  const extras = EXTRA_EXPORTS[norm] || [];
  const exports = ['default', ...extras];
  return `export { ${exports.join(', ')} } from '${fromPath}';\n`;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeIfChanged(filePath, content) {
  ensureDir(filePath);
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) return;
  fs.writeFileSync(filePath, content, 'utf8');
}

function main() {
  const pagesDir = path.join(ROOT, 'pages');
  const all = collectTsxFiles(pagesDir);
  const filtered = all.filter(shouldInclude);

  for (const rel of filtered) {
    const norm = rel.replace(/\\/g, '/');
    if (MANUAL_PAGES.has(norm)) continue;
    const outFile = path.join(STORE_PAGES, rel);
    writeIfChanged(outFile, buildReexport(rel));
  }

  for (const file of ROOT_PAGE_FILES) {
    const src = path.join(pagesDir, file);
    if (!fs.existsSync(src)) {
      console.warn(`[skip] missing root page: pages/${file}`);
      continue;
    }
    const outFile = path.join(STORE_PAGES, file);
    const up = '../'.repeat(3);
    const base = file.replace(/\.tsx$/, '');
    writeIfChanged(outFile, `export { default } from '${up}pages/${base}';\n`);
  }

  const reservationRedirect = `import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/reservations', permanent: false },
});

export default function ReservationAlias() {
  return null;
}
`;
  writeIfChanged(path.join(STORE_PAGES, 'reservation.tsx'), reservationRedirect);

  console.log(
    `Wrote ${filtered.length} module re-exports + root files + reservation alias → ${path.relative(ROOT, STORE_PAGES)}`
  );
}

main();
