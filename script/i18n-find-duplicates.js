const fs = require('fs');
const path = require('path');
const translationsDir = path.join(__dirname, 'translations');
const enPath = path.join(translationsDir, 'en.json');
if (!fs.existsSync(enPath)) { console.error('en.json not found'); process.exit(1); }
const en = JSON.parse(fs.readFileSync(enPath,'utf8'));
function flatten(obj, prefix=''){
  const out = {};
  for(const k of Object.keys(obj)){
    const v = obj[k];
    const key = prefix? prefix + '.' + k : k;
    if(v && typeof v === 'object' && !Array.isArray(v)){
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = (v===null? '': String(v)).trim();
    }
  }
  return out;
}
const flat = flatten(en);
const groups = {};
for(const [k,v] of Object.entries(flat)){
  if(!groups[v]) groups[v]=[];
  groups[v].push(k);
}
const duplicates = Object.entries(groups).filter(([val,keys])=> keys.length>1);
const outLines = [];
outLines.push(`Total keys: ${Object.keys(flat).length}`);
outLines.push(`Duplicate groups: ${duplicates.length}`);
outLines.push('');
for(const [val, keys] of duplicates){
  outLines.push('---');
  outLines.push(`Keys: ${keys.join(', ')}`);
  outLines.push('Value:');
  outLines.push(val);
  outLines.push('');
}
const outPath = path.join(translationsDir,'duplicates-en.txt');
fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');
console.log('Wrote', outPath, `(${duplicates.length} duplicate groups)`);
