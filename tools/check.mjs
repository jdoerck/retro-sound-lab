// Syntax-checks every inline <script> and every engine (DSP) string in the project.
// Usage: node tools/check.mjs
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const files = [];
(function walk(d){ for (const f of readdirSync(d)) { const p = join(d, f);
  if (statSync(p).isDirectory()) { if (!['node_modules', '.git', 'tools'].includes(f)) walk(p); }
  else if (f.endsWith('.html')) files.push(p); } })(root);
let bad = 0;
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const errs = [];
  scripts.forEach((s, i) => { try { new Function(s); } catch (e) { errs.push(`script ${i}: ${e.message}`); } });
  for (const m of html.matchAll(/const DSP=`([\s\S]*?)`;/g)) {
    try { const cls = new Function(m[1] + ';return ' + (m[1].match(/class\s+(\w+)/) || [])[1])();
      if (typeof cls !== 'function') throw new Error('no engine class found'); }
    catch (e) { errs.push('engine: ' + e.message); }
  }
  const rel = f.slice(root.length);
  if (errs.length) { bad++; console.log('FAIL', rel, '\n  ' + errs.join('\n  ')); } else console.log('ok  ', rel);
}
console.log(bad ? `\n${bad} file(s) failed` : `\nAll ${files.length} files passed`);
process.exit(bad ? 1 : 0);
