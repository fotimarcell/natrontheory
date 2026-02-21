const fs = require('fs');
const path = require('path');

// Files to scan (workspace root HTML files + some subfolders)
const htmlFiles = [
  'index.html',
  'recipe_potassium.html',
  'proba.html',
  'geopolymer_calculator.html',
  'draft_kaolin.html',
  'draft_dragging.html',
  'domino1_granite.html',
  'domino2_scoopmarks.html',
  'domino3_waterglass.html',
  'domino4_fakegranite.html',
  'domino5_nubs.html',
  'case_splittrap.html',
  'carvings.html',
  path.join('natrontheory_book','image.html'),
  path.join('natrontheory_book','video.html'),
  path.join('mondostone','index.html')
];

const translationsDir = path.join(__dirname, 'translations');
const languages = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json',''));

function ensureNamespace(obj, ns){
  if (!obj[ns]) obj[ns] = {};
}

function slugify(text){
  return text.toLowerCase()
    .replace(/<[^>]*>/g,'')
    .replace(/&[^;]+;/g,'')
    .replace(/[^a-z0-9\s-]/g,'')
    .trim()
    .replace(/\s+/g,'_')
    .slice(0,60);
}

// Collect candidates using multiple heuristics: .padder blocks, titles, h1-h3, .title, p
function extractCandidates(content){
  const candidates = [];
  const padderRegex = /<div[^>]*class=["']?padder["']?[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = padderRegex.exec(content)) !== null) candidates.push(m[1].trim());

  const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) candidates.push(titleMatch[1].trim());

  const hRegex = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  while ((m = hRegex.exec(content)) !== null) candidates.push(m[2].trim());

  const titleClass = /<[^>]*class=["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/[a-zA-Z0-9]+>/gi;
  while ((m = titleClass.exec(content)) !== null) candidates.push(m[1].trim());

  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let count = 0;
  while ((m = pRegex.exec(content)) !== null && count < 6) { candidates.push(m[1].trim()); count++; }

  const seen = new Set();
  return candidates.map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s && !seen.has(s) && (seen.add(s), true));
}

htmlFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const basename = path.basename(file, '.html');
  const candidates = extractCandidates(content);

  if (candidates.length === 0) return;

  languages.forEach(lang => {
    const langPath = path.join(translationsDir, `${lang}.json`);
    let obj = {};
    try { obj = JSON.parse(fs.readFileSync(langPath,'utf8')); } catch(e){ console.error('Failed load', langPath, e); return; }
    ensureNamespace(obj, basename);

    candidates.forEach((inner, idx) => {
      const short = inner.replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,'').trim().split(/\s+/).slice(0,8).join(' ');
      const slug = slugify(short) || `section_${idx+1}`;
      const key = slug;
      if (!obj[basename][key]) {
        const value = (lang === 'en') ? inner : inner;
        obj[basename][key] = value;
        console.log(`Wrote ${basename}.${key} -> ${lang}.json`);
      }
    });

    fs.writeFileSync(langPath, JSON.stringify(obj, null, 2), 'utf8');
  });

});

console.log('Extraction complete. Review translations files in script/translations/ and add nicer keys or translations as needed.');
