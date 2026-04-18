/**
 * Lists pages/api route files grouped by first path segment (domain).
 * Usage: node scripts/inventory-api-routes.js
 */
const fs = require('fs');
const path = require('path');

const apiRoot = path.join(__dirname, '..', 'pages', 'api');

function walk(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = path.join(base, e.name);
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...walk(full, rel));
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) {
      files.push(rel.replace(/\\/g, '/'));
    }
  }
  return files;
}

function main() {
  if (!fs.existsSync(apiRoot)) {
    console.error('pages/api not found');
    process.exit(1);
  }
  const files = walk(apiRoot);
  const bySegment = new Map();
  for (const f of files) {
    const seg = f.split('/')[0] || '(root)';
    bySegment.set(seg, (bySegment.get(seg) || 0) + 1);
  }
  const sorted = [...bySegment.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`Total API route files: ${files.length}\n`);
  console.log('By first segment:\n');
  for (const [seg, n] of sorted) {
    console.log(`  ${seg.padEnd(24)} ${n}`);
  }
}

main();
