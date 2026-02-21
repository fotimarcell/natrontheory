const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const translationsDir = path.join(__dirname, 'translations');

function slugify(s) {
  return s.toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[“”"'`]/g, '')
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 60);
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch(e){ return {}; }
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

function findHtmlFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // skip node_modules, .vscode
      if (it === 'node_modules' || it === '.git' || it === '.vscode') continue;
      results.push(...findHtmlFiles(full));
    } else if (stat.isFile() && it.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function extractCandidates(html) {
  const candidates = [];
  // title tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) candidates.push(titleMatch[1].trim());
  // headers h1-h3
  const hMatches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi);
  if (hMatches) hMatches.forEach(m => candidates.push(m.replace(/<[^>]+>/g,'').trim()));
  // divs with class title, fofofotitle, mainszoveg, padder
  const classRegex = /<div[^>]*class=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/div>/gi;
  let cm;
  while ((cm = classRegex.exec(html)) !== null) {
    const classes = cm[1].split(/\s+/);
    const inner = cm[2].replace(/<script[\s\S]*?<\/script>/gi,'').trim();
    if (!inner) continue;
    if (classes.includes('title') || classes.includes('fofofotitle') || classes.includes('mainszoveg') || classes.includes('padder') || classes.includes('szurkecsik')) {
      const text = inner.replace(/<[^>]+>/g,'').trim();
      if (text) candidates.push(text);
    }
  }
  // paragraphs
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (pMatches) pMatches.forEach(m => candidates.push(m.replace(/<[^>]+>/g,'').trim()));

  // keep unique, non-empty
  const cleaned = [];
  for (const c of candidates) {
    const s = c.replace(/\s+/g,' ').trim();
    if (s && !cleaned.includes(s)) cleaned.push(s);
  }
  return cleaned.slice(0, 50);
}

function main() {
  if (!fs.existsSync(translationsDir)) {
    console.error('translations dir not found:', translationsDir);
    process.exit(1);
  }
  const langFiles = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));
  const langs = langFiles.map(f => f.replace('.json',''));
  const langPaths = {};
  langs.forEach(l => langPaths[l] = path.join(translationsDir, l + '.json'));

  const htmlFiles = findHtmlFiles(root).filter(p => !p.includes('node_modules'));
  const summary = { added: 0, skipped: 0 };

  for (const htmlPath of htmlFiles) {
    const rel = path.relative(root, htmlPath).replace(/\\/g,'/');
    const basename = path.basename(htmlPath, '.html').replace(/[^a-z0-9_]/gi,'_');
    const html = fs.readFileSync(htmlPath,'utf8');
    const candidates = extractCandidates(html);
    if (candidates.length === 0) continue;

    // load each language JSON
    const langObjs = {};
    langs.forEach(l => langObjs[l] = readJSON(langPaths[l]));

    if (!langObjs['en']) langObjs['en'] = {};
    if (!langObjs['en'][basename]) langObjs['en'][basename] = {};

    let counter = 1;
    for (const cand of candidates) {
      // generate a human-friendly key from first 6 words
      const short = cand.split('\n')[0].split(' ').slice(0,6).join(' ');
      let keyBase = slugify(short);
      if (!keyBase) keyBase = `${basename}_text_${counter}`;
      let key = keyBase;
      let suffix = 1;
      while (Object.values(langObjs['en'][basename] || {}).some((v,idx)=> false) && (langObjs['en'][basename] && Object.prototype.hasOwnProperty.call(langObjs['en'][basename], key))) {
        key = `${keyBase}_${suffix++}`;
      }

      // if missing in en, add
      if (!langObjs['en'][basename][key]) {
        langObjs['en'][basename][key] = cand;
        summary.added++;
      } else {
        summary.skipped++;
      }

      // For other languages: add placeholder if missing
      for (const l of langs) {
        if (l === 'en') continue;
        if (!langObjs[l]) langObjs[l] = {};
        if (!langObjs[l][basename]) langObjs[l][basename] = {};
        if (!Object.prototype.hasOwnProperty.call(langObjs[l][basename], key)) {
          langObjs[l][basename][key] = langObjs['en'][basename][key];
        }
      }

      counter++;
    }

    // write back each language file
    for (const l of langs) {
      writeJSON(langPaths[l], langObjs[l]);
    }

    console.log(`Processed ${rel}: added ${summary.added} keys so far.`);
  }

  console.log('Done. Summary:', summary);
}

main();
