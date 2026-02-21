const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dupPath = path.join(root, 'script', 'translations', 'duplicates-en.txt');
const enPath = path.join(root, 'script', 'translations', 'en.json');

function readDupFile() {
  const txt = fs.readFileSync(dupPath, 'utf8');
  const sections = txt.split('\n---\n').filter(Boolean);
  const groups = [];
  for (const sec of sections) {
    const m = sec.match(/Keys:\s*(.+)\n/);
    if (!m) continue;
    const keys = m[1].split(',').map(s => s.trim()).filter(Boolean);
    if (keys.length > 1) groups.push(keys);
  }
  return groups;
}

function backupFile(filePath) {
  const bak = filePath + '.bak';
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(filePath, bak);
  }
}

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (e.isFile() && full.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function replaceInFiles(files, from, to) {
  const changed = [];
  const re = new RegExp('data-i18n="' + from.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '"', 'g');
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    if (!re.test(txt)) continue;
    const newtxt = txt.replace(re, 'data-i18n="' + to + '"');
    backupFile(f);
    fs.writeFileSync(f, newtxt, 'utf8');
    changed.push(f);
  }
  return changed;
}

function main() {
  if (!fs.existsSync(dupPath)) {
    console.error('duplicates-en.txt not found at', dupPath);
    process.exit(1);
  }
  const groups = readDupFile();
  if (groups.length === 0) {
    console.log('No duplicate groups found.');
    return;
  }

  const en = loadJSON(enPath);
  const htmlFiles = findHtmlFiles(root);

  const report = [];

  for (const keys of groups) {
    const canonical = keys[0];
    const toRemove = keys.slice(1);
    const moved = [];
    for (const k of toRemove) {
      if (Object.prototype.hasOwnProperty.call(en, k)) {
        // if canonical missing, ensure it exists (it should)
        if (!Object.prototype.hasOwnProperty.call(en, canonical)) {
          en[canonical] = en[k];
        }
        delete en[k];
        moved.push(k);
      }
      // replace usages in HTML
      const changed = replaceInFiles(htmlFiles, k, canonical);
      report.push({ from: k, to: canonical, files: changed });
    }
    console.log(`Group canonical=${canonical} removed=${toRemove.length} items`);
  }

  backupFile(enPath);
  writeJSON(enPath, en);
  console.log('Wrote updated en.json and backed up original as en.json.bak');

  const out = path.join(root, 'script', 'translations', 'dedupe-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  console.log('Wrote report to', out);
}

main();
