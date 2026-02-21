const fs = require('fs');
const path = require('path');

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
const enPath = path.join(translationsDir, 'en.json');
if (!fs.existsSync(enPath)) { console.error('en.json not found'); process.exit(1); }
const en = JSON.parse(fs.readFileSync(enPath,'utf8'));

function escapeRegex(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
}

function tryInsert(content, tag, key, val, basename){
  const re = new RegExp(`(<${tag}[^>]*>)([\\s\\S]*?)(${escapeRegex(val)})([\\s\\S]*?<\\/${tag}>)`, 'i');
  if (!re.test(content)) return {changed:false, content};
  content = content.replace(re, (m, open, before, match, after)=>{
    // if opening tag already has data-i18n, skip
    if (/data-i18n=["']/.test(open)) return m;
    const attr = ` data-i18n="${basename}.${key}"`;
    const openingWithAttr = open.replace(/^(<\w+)([^>]*>)/, `$1${attr}$2`);
    return openingWithAttr + before + match + after;
  });
  return {changed:true, content};
}

function tryInsertClassElement(content, className, key, val, basename){
  const re = new RegExp(`(<[a-zA-Z0-9]+[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>)([\\s\\S]*?)(${escapeRegex(val)})([\\s\\S]*?<\\/[a-zA-Z0-9]+>)`, 'i');
  if (!re.test(content)) return {changed:false, content};
  content = content.replace(re, (m, open, before, match, after)=>{
    if (/data-i18n=["']/.test(open)) return m;
    const attr = ` data-i18n="${basename}.${key}"`;
    const openingWithAttr = open.replace(/^(<\w+)([^>]*>)/, `$1${attr}$2`);
    return openingWithAttr + before + match + after;
  });
  return {changed:true, content};
}

const report = [];

htmlFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  const basename = path.basename(file, '.html');
  const section = en[basename];
  if (!section) return;
  // Sort keys by descending value length to match larger blocks first
  const keys = Object.keys(section).sort((a,b)=> (section[b].length||0)-(section[a].length||0));
  let changedAny = false;
  keys.forEach(key => {
    const val = section[key];
    if (!val || typeof val !== 'string') return;
    // try tags: title, h1-h3, p
    ['title','h1','h2','h3','p'].forEach(tag=>{
      const res = tryInsert(content, tag, key, val, basename);
      if (res.changed) { content = res.content; changedAny = true; }
    });
    // try div.padder
    const resPad = tryInsertClassElement(content, 'padder', key, val, basename);
    if (resPad.changed) { content = resPad.content; changedAny = true; }
    // try elements with class title
    const resTitleClass = tryInsertClassElement(content, 'title', key, val, basename);
    if (resTitleClass.changed) { content = resTitleClass.content; changedAny = true; }
  });

  if (changedAny){
    fs.copyFileSync(fullPath, fullPath + '.bak');
    fs.writeFileSync(fullPath, content, 'utf8');
    report.push(`${file}: updated`);
  } else {
    report.push(`${file}: no matches`);
  }
});

console.log('Apply keys report:\n' + report.join('\n'));

process.exit(0);
