const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANS_DIR = path.join(ROOT, 'script', 'translations');
const OUT_PATH = path.join(TRANS_DIR, 'en.json');

function findHtmlFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip translations folder
      if (full === TRANS_DIR) continue;
      out.push(...findHtmlFiles(full));
    } else if (e.isFile() && full.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function extractI18nKeysAndValues(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // Only match elements where the value is not empty or whitespace
  const regex = /data-i18n\s*=\s*"([^"]+)"[^>]*>([^<]*)/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(src)) !== null) {
    const key = m[1].trim();
    const value = m[2].replace(/\s+/g, ' ').trim();
    // Only include if value is not empty and not just whitespace
    if (key && value && value !== '' && !/^\s*$/.test(value)) {
      matches.push({ key, value });
    }
  }
  return matches;
}

function slugify(text, maxLen = 60) {
  const s = text.toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}0-9\s-]+/gu, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return s.slice(0, maxLen);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function main() {
  ensureDir(TRANS_DIR);
  // backup existing en.json if present
  if (fs.existsSync(OUT_PATH)) {
    const bak = OUT_PATH + '.bak';
    if (!fs.existsSync(bak)) fs.copyFileSync(OUT_PATH, bak);
  }

  const files = findHtmlFiles(ROOT);
  let total = 0;
  const en = {};
  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const page = path.basename(f, '.html');
    const pairs = extractI18nKeysAndValues(f);
    if (!pairs.length) continue;
    en[page] = en[page] || {};
    for (const { key, value } of pairs) {
      if (!en[page][key]) {
        en[page][key] = value;
        total += 1;
      }
    }
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8');
  // write small report
  fs.writeFileSync(path.join(TRANS_DIR, 'regenerate-report.json'), JSON.stringify({ filesScanned: files.length, totalKeys: total }, null, 2), 'utf8');
  console.log(`Scanned ${files.length} HTML files — generated ${total} keys in ${OUT_PATH}`);

  // write en.json
  fs.writeFileSync(OUT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8');
  // write small report
  const report = { filesScanned: files.length, totalKeys: total };
  fs.writeFileSync(path.join(TRANS_DIR, 'regenerate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Scanned ${files.length} HTML files — generated ${total} keys in ${OUT_PATH}`);
}

main();
