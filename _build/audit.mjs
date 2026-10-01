/**
 * audit.mjs — kiểm tra site sau khi build, trước khi đẩy lên GitHub.
 * Kiểm: link .html còn sót · link gãy · H1 · title/description trùng · JSON-LD hợp lệ
 *       · canonical · alt ảnh · kích thước file.
 * Chạy:  node _build/audit.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join, posix } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['_build', '_data', '_includes', '_template-src', 'node_modules', '.git', 'docs']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const errors = [], warns = [];
const titles = new Map(), descs = new Map();

for (const f of files) {
  const rel = f.slice(ROOT.length + 1).replace(/\\/g, '/');
  const html = readFileSync(f, 'utf8');
  const isErrPage = rel === '404.html';

  // --- H1 ---
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) errors.push(`${rel}: có ${h1s.length} thẻ H1 (phải đúng 1)`);

  // --- title / description ---
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1].trim();
  if (!title) errors.push(`${rel}: thiếu <title>`);
  if (!desc && !isErrPage) errors.push(`${rel}: thiếu meta description`);
  if (title.length > 65) warns.push(`${rel}: title ${title.length} ký tự (nên ≤ 65) — "${title.slice(0, 60)}…"`);
  if (desc && (desc.length < 120 || desc.length > 170))
    warns.push(`${rel}: description ${desc.length} ký tự (nên 120–170)`);
  if (title) { if (titles.has(title)) errors.push(`TRÙNG TITLE: ${rel} ↔ ${titles.get(title)}`); else titles.set(title, rel); }
  if (desc) { if (descs.has(desc)) errors.push(`TRÙNG DESCRIPTION: ${rel} ↔ ${descs.get(desc)}`); else descs.set(desc, rel); }

  // --- canonical ---
  if (!isErrPage && !/<link rel="canonical" href="https:\/\//.test(html))
    errors.push(`${rel}: thiếu canonical tuyệt đối`);

  // --- JSON-LD ---
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { errors.push(`${rel}: JSON-LD lỗi cú pháp — ${e.message}`); }
  }

  // --- alt ảnh ---
  for (const m of html.matchAll(/<img\b[^>]*>/g))
    if (!/\balt=/.test(m[0])) errors.push(`${rel}: <img> thiếu alt — ${m[0].slice(0, 60)}`);

  // --- link ---
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;

    // YÊU CẦU: link nội bộ không được chứa .html
    if (/\.html(\?|#|$)/.test(href))
      errors.push(`${rel}: link còn .html — "${href}"`);

    // phân giải tương đối
    const clean = href.split(/[?#]/)[0];
    if (!clean) continue;
    let target;
    if (clean.startsWith('/')) target = resolve(ROOT, '.' + clean);
    else target = resolve(dirname(f), clean);
    // thư mục -> index.html
    const cand = clean.endsWith('/') || !/\.[a-z0-9]+$/i.test(clean) ? join(target, 'index.html') : target;
    if (!existsSync(cand)) errors.push(`${rel}: LINK GÃY "${href}" → ${cand.slice(ROOT.length + 1)}`);
  }

  // --- kích thước ---
  const kb = Buffer.byteLength(html) / 1024;
  if (kb > 120) warns.push(`${rel}: ${kb.toFixed(0)} KB — nặng, xem lại`);
}

// --- sitemap đối chiếu với file thật ---
if (existsSync(resolve(ROOT, 'sitemap.xml'))) {
  const sm = readFileSync(resolve(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map(m => m[1]);
  for (const loc of locs) {
    const p = resolve(ROOT, '.' + loc, 'index.html');
    if (!existsSync(p)) errors.push(`sitemap.xml: trỏ tới trang không tồn tại — ${loc}`);
  }
  const pages = files.filter(f => f.endsWith('index.html'))
    .map(f => '/' + f.slice(ROOT.length + 1).replace(/\\/g, '/').replace(/index\.html$/, ''));
  for (const pg of pages)
    if (!locs.includes(pg)) warns.push(`sitemap.xml: thiếu trang ${pg}`);
}

// --- hạ tầng GitHub Pages ---
for (const need of ['CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', '404.html'])
  if (!existsSync(resolve(ROOT, need))) errors.push(`thiếu file hạ tầng: ${need}`);

// --- in kết quả ---
console.log(`Đã kiểm ${files.length} trang HTML\n`);
if (errors.length) {
  console.log(`LỖI (${errors.length}) — phải sửa trước khi đẩy lên:`);
  errors.forEach(e => console.log('  ✗ ' + e));
} else console.log('LỖI: không có ✓');
if (warns.length) {
  console.log(`\nCẢNH BÁO (${warns.length}) — nên xem:`);
  warns.forEach(w => console.log('  ! ' + w));
} else console.log('CẢNH BÁO: không có ✓');
process.exit(errors.length ? 1 : 0);
