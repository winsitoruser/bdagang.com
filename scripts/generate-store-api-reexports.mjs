/**
 * Mirrors pages/api → apps/store-web/pages/api (re-export).
 * Store-web menjadi backend sendiri di port 3003 tanpa proxy ke 3001.
 *
 * Run: node scripts/generate-store-api-reexports.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STORE_API = path.join(ROOT, 'apps', 'store-web', 'pages', 'api');

const CONFIG_EXPORTS = new Set(
  [
    'driver/upload.ts',
    'hq/hris/project-documents.ts',
    'webhooks/food-delivery.ts',
    'inventory/documents/upload.ts',
    'hq/hris/upload-claim.ts',
    'upload.js',
    'hq/marketplace/webhook.ts',
    'onboarding/documents.ts',
    'hq/hris/attendance/device-sync.ts',
    'inventory/returns/upload-document.ts',
    'hq/sfa/import-export.ts',
    'hq/documents/index.ts',
    'inventory/receipts/upload-document.ts',
    'webhooks/payment/[provider].ts',
  ].map((p) => p.replace(/\\/g, '/'))
);

function collectApiFiles(dir, baseRel = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = baseRel ? `${baseRel}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      out.push(...collectApiFiles(full, rel));
    } else if (name.endsWith('.ts') || name.endsWith('.js')) {
      out.push(rel.replace(/\\/g, '/'));
    }
  }
  return out;
}

function toForward(p) {
  return p.split(path.sep).join('/');
}

function buildReexport(rel) {
  const norm = rel.replace(/\\/g, '/');
  const genFile = path.join(STORE_API, rel);
  const srcBase = path.join(ROOT, 'pages', 'api', rel).replace(/\.(ts|js)$/, '');
  let relImport = path.relative(path.dirname(genFile), srcBase);
  relImport = toForward(relImport);
  if (!relImport.startsWith('.')) {
    relImport = `./${relImport}`;
  }

  let s = `export { default } from '${relImport}';\n`;
  if (CONFIG_EXPORTS.has(norm)) {
    s += `export { config } from '${relImport}';\n`;
  }
  return s;
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
  const apiDir = path.join(ROOT, 'pages', 'api');
  const all = collectApiFiles(apiDir);

  for (const rel of all) {
    const outFile = path.join(STORE_API, rel);
    writeIfChanged(outFile, buildReexport(rel));
  }

  console.log(`Wrote ${all.length} API re-exports → ${path.relative(ROOT, STORE_API)}`);
}

main();
