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

function stripHtml(txt) {
  // remove script/style blocks
  txt = txt.replace(/<script[\s\S]*?<\/script>/gi, '\n');
  txt = txt.replace(/<style[\s\S]*?<\/style>/gi, '\n');
  // remove comments
  txt = txt.replace(/<!--([\s\S]*?)-->/g, '\n');
  // replace tags with newlines
  txt = txt.replace(/<[^>]+>/g, '\n');
  // decode basic entities
  txt = txt.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return txt;
}

function extractStringsFromFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const stripped = stripHtml(src);
  const lines = stripped.split(/\r?\n/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  // heuristics: keep lines with at least 1 char, avoid pure punctuation
  const candidates = lines.filter(l => /[A-Za-z0-9\p{L}]/u.test(l));
  return candidates;
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
  const en = {};
  let total = 0;

  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const page = path.basename(f, '.html');
    const strs = extractStringsFromFile(f);
    if (!strs.length) continue;
    en[page] = en[page] || {};
    const usedKeys = new Set(Object.keys(en[page]));
    for (const s of strs) {
      // avoid adding very short noise (single punctuation)
      if (s.length === 0) continue;
      // dedupe identical strings in the same page
      if (Object.values(en[page]).includes(s)) continue;
      let base = slugify(s).substring(0, 50) || 'text';
      // ensure key is not empty
      if (!base) base = 'text';
      let key = base;
      let i = 1;
      while (usedKeys.has(key)) {
        i += 1;
        key = `${base}_${i}`;
      }
      usedKeys.add(key);
      en[page][key] = s;
      total += 1;
    }
  }

  // write en.json
  fs.writeFileSync(OUT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8');
  // write small report
  const report = { filesScanned: files.length, totalKeys: total };
  fs.writeFileSync(path.join(TRANS_DIR, 'regenerate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Scanned ${files.length} HTML files — generated ${total} keys in ${OUT_PATH}`);
}

main();
