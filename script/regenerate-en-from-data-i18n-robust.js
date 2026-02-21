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

function extractDataI18nEntries(html) {
  const entries = [];
  const attrRe = /data-i18n\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    const key = m[1].trim();
    const attrIndex = m.index;
    // find start of opening tag '<' before attrIndex
    const openTagStart = html.lastIndexOf('<', attrIndex);
    if (openTagStart === -1) continue;
    // capture tag name
    const tagNameMatch = /^<\s*([a-zA-Z0-9:-]+)/.exec(html.slice(openTagStart));
    const tag = tagNameMatch ? tagNameMatch[1] : null;
    // find end of opening tag
    const openTagEnd = html.indexOf('>', attrIndex);
    if (openTagEnd === -1) {
      entries.push({ key, inner: '', info: 'no-closing->' });
      continue;
    }
    // self-closing?
    const openTagContent = html.slice(openTagStart, openTagEnd + 1);
    if (/\/>\s*$/.test(openTagContent)) {
      entries.push({ key, inner: '' });
      continue;
    }
    // find corresponding closing tag </tag>
    let closeIdx = -1;
    if (tag) {
      const closing = `</${tag}>`;
      closeIdx = html.indexOf(closing, openTagEnd + 1);
    }
    let inner = '';
    if (closeIdx !== -1) {
      inner = html.slice(openTagEnd + 1, closeIdx).trim();
    } else {
      // fallback: take until next block-level marker or newline
      const nextTag = html.indexOf('<', openTagEnd + 1);
      if (nextTag !== -1) inner = html.slice(openTagEnd + 1, nextTag).trim();
      else inner = html.slice(openTagEnd + 1).trim();
    }
    entries.push({ key, inner });
  }
  return entries;
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

function main() {
  ensureDir(TRANS_DIR);
  backup(OUT_PATH);

  const files = findHtmlFiles(ROOT);
  const en = {};
  const warnings = [];
  let total = 0;

  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const page = path.basename(f, '.html');
    const entries = extractDataI18nEntries(html);
    for (const e of entries) {
      total += 1;
      const rawKey = e.key;
      const parts = rawKey.split('.');
      if (parts.length === 1) parts.unshift(page);
      // store
      let cur = en;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      const last = parts[parts.length - 1];
      const val = e.inner || '';
      if (Object.prototype.hasOwnProperty.call(cur, last)) {
        if (cur[last] !== val) warnings.push({ key: rawKey, file: f, existing: cur[last], found: val });
      } else {
        cur[last] = val;
      }
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8');
  const report = { filesScanned: files.length, totalFound: total, warnings };
  fs.writeFileSync(path.join(TRANS_DIR, 'regenerate-datai18n-robust-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Scanned ${files.length} HTML files — collected ${total} data-i18n entries into ${OUT_PATH}`);
  if (warnings.length) console.log(`Warnings: ${warnings.length} conflicting entries (see report).`);
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

main();
