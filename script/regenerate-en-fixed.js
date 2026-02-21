const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANS_DIR = path.join(ROOT, 'script', 'translations');
const OUT_PATH = path.join(TRANS_DIR, 'en.json');

const BLOCK_TAGS = ['p','h1','h2','h3','h4','h5','h6','li','section','article','header','footer','nav','figcaption','blockquote','pre'];

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

function extractBlocks(html) {
  // remove script/style and comments entirely
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, '\n');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '\n');
  s = s.replace(/<!--([\s\S]*?)-->/g, '\n');

  // insert markers around block tags so their inner text becomes a single block
  for (const tag of BLOCK_TAGS) {
    const open = new RegExp(`<${tag}[^>]*>`, 'gi');
    const close = new RegExp(`<\/${tag}[^>]*>`, 'gi');
    s = s.replace(open, '\n@@BLOCK@@\n');
    s = s.replace(close, '\n@@BLOCK@@\n');
  }

  // remove remaining tags but keep content
  s = s.replace(/<[^>]+>/g, ' ');

  // split on block marker and collapse whitespace inside blocks
  const parts = s.split('@@BLOCK@@').map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  // filter out very short fragments
  return parts.filter(p => p.length > 2 && /[\p{L}0-9]/u.test(p));
}

function main() {
  ensureDir(TRANS_DIR);
  backup(OUT_PATH);

  const files = findHtmlFiles(ROOT);
  const en = {};
  let total = 0;

  for (const f of files) {
    const page = path.basename(f, '.html');
    const html = fs.readFileSync(f, 'utf8');
    const blocks = extractBlocks(html);
    if (!blocks.length) continue;
    en[page] = {};
    let idx = 1;
    const seen = new Set();
    for (const b of blocks) {
      if (seen.has(b)) continue;
      seen.add(b);
      const key = `text_${idx}`;
      en[page][key] = b;
      idx += 1;
      total += 1;
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(en, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(TRANS_DIR, 'regenerate-report.json'), JSON.stringify({ filesScanned: files.length, totalKeys: total }, null, 2), 'utf8');
  console.log(`Scanned ${files.length} HTML files — generated ${total} keys in ${OUT_PATH}`);
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

main();
