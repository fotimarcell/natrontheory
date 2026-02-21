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
      if (full === TRANS_DIR) continue;
      out.push(...findHtmlFiles(full));
    } else if (e.isFile() && full.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function backup(p) {
  if (fs.existsSync(p)) {
    const bak = p + '.bak';
    if (!fs.existsSync(bak)) fs.copyFileSync(p, bak);
  }
}

function setNested(obj, parts, value) {
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function parseDataI18nBlocks(html) {
  const results = [];
  // match tags with data-i18n (simple, matches opening and closing tag with same tag name)
  const re = /<([a-zA-Z0-9:-]+)([^>]*?)\sdata-i18n\s*=\s*"([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[3].trim();
    const inner = m[5].trim();
    if (key) results.push({ key, inner });
  }
  return results;
}

function main() {
  ensureDir(TRANS_DIR);
  backup(OUT_PATH);

  const files = findHtmlFiles(ROOT);
  const en = {};
  const warnings = [];
  let counts = 0;

  for (const f of files) {
    const page = path.basename(f, '.html');
    const html = fs.readFileSync(f, 'utf8');
    const blocks = parseDataI18nBlocks(html);
    for (const b of blocks) {
      counts += 1;
      const parts = b.key.split('.');
      // keep first part as page if present, otherwise use file page
      if (parts.length === 1) parts.unshift(page);
      // check existing value
      let cur = en;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      const last = parts[parts.length - 1];
      if (Object.prototype.hasOwnProperty.call(cur, last)) {
        if (cur[last] !== b.inner) {
          warnings.push({ key: b.key, file: f, existing: cur[last], found: b.inner });
        }
        // keep existing
      } else {
        cur[last] = b.inner;
      }
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8');
  const report = { filesScanned: files.length, totalFound: counts, warnings };
  fs.writeFileSync(path.join(TRANS_DIR, 'regenerate-datai18n-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Scanned ${files.length} HTML files — collected ${counts} data-i18n entries into ${OUT_PATH}`);
  if (warnings.length) console.log(`Warnings: ${warnings.length} conflicting entries (see report).`);
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

main();
