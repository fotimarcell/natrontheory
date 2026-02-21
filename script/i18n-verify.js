const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, 'translations');
if (!fs.existsSync(translationsDir)) {
  console.error('Translations directory not found:', translationsDir);
  process.exit(2);
}

const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));
if (!files.includes('en.json')) {
  console.error('Reference file en.json not found in translations directory');
  process.exit(2);
}

function flatten(obj, prefix = '') {
  const out = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flatten(v, key));
    } else {
      out.push(key);
    }
  }
  return out;
}

function loadJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse', filePath, e.message);
    return null;
  }
}

const en = loadJSON(path.join(translationsDir, 'en.json'));
const enKeys = new Set(flatten(en));

let report = '';
report += `Reference (en.json) keys: ${enKeys.size}\n\n`;

for (const file of files) {
  if (file === 'en.json') continue;
  const full = path.join(translationsDir, file);
  const json = loadJSON(full);
  if (!json) {
    report += `\n== ${file} ==\nERROR: could not parse file\n\n`;
    continue;
  }
  const keys = new Set(flatten(json));
  const missing = [...enKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !enKeys.has(k));
  report += `== ${file} ==\n`;
  report += `Missing: ${missing.length}\n`;
  if (missing.length) report += missing.join('\n') + '\n';
  report += `Extra: ${extra.length}\n`;
  if (extra.length) report += extra.join('\n') + '\n';
  report += '\n';
}

const outPath = path.join(translationsDir, 'verify-report.txt');
fs.writeFileSync(outPath, report, 'utf8');
console.log('Wrote report to', outPath);
console.log('Summary:\n', report.split('\n').slice(0,10).join('\n'));
