#!/usr/bin/env node
/**
 * page-dates.mjs — ngày cập nhật THẬT của từng trang, đọc từ lịch sử git.
 *
 * Vì sao có file này: 21 trang cùng đóng dấu ngày build thì vừa sai vừa lộ là
 * máy sinh một lượt. Repo này public trên GitHub nên git log phơi ngày sửa
 * thật — dấu ngày bịa đối chiếu được trong vài giây. Nên ngày hiển thị lấy
 * thẳng từ git, không bịa, không rải ngẫu nhiên.
 *
 * Chỉ bump ngày khi KHỐI NỘI DUNG của riêng trang đó đổi. Đổi hotline, logo,
 * menu hay schema ở mọi trang thì không trang nào "trẻ lại" — đúng nghĩa
 * substantive update mà Google dùng để quyết có tin dấu ngày hay không.
 *
 * Nội dung đã sửa mà chưa commit thì tính là HÔM NAY, vì chạy xong là commit.
 * Quy trình: sửa _data/ -> page-dates.mjs -> generate.mjs -> audit.mjs -> commit.
 *
 * Chạy: node _build/page-dates.mjs
 * Ra:   _data/page-dates.json   (sinh ra, đừng sửa tay)
 */

import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
const diskJson = f => JSON.parse(readFileSync(resolve(ROOT, f), 'utf8'));
const showJson = (h, f) => { try { return JSON.parse(git('show', `${h}:${f}`)); } catch { return null; } };
/* Dấu vân tay nội dung: bỏ ghi chú (_note...) và chính mấy field ngày trước khi so.
   Sửa một dòng ghi chú trong _data, hay gỡ field ngày hardcode, KHÔNG phải là sửa nội
   dung — tính vào thì ngày nhảy sai và dấu ngày mất giá trị. */
const DROP = /^(_|datePublished$|dateModified$|lastReviewed$)/;
function clean(v) {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).filter(([k]) => !DROP.test(k)).map(([k, x]) => [k, clean(x)]));
  }
  return v;
}
const key = v => JSON.stringify(v === undefined ? null : clean(v));

// commit đã động vào file, mới -> cũ
function commits(file) {
  const out = git('log', '--format=%H %cI', '--', file).trim();
  if (!out) return [];
  return out.split('\n').map(l => {
    const [h, iso] = l.trim().split(' ');
    return { h, date: iso.slice(0, 10) };
  });
}

// ---------- cách lấy đúng khối nội dung của một trang ----------
const atKey     = k    => j => j && j[k];
const areaBySlug= slug => j => (Array.isArray(j) ? j : []).find(a => a.slug === slug);
const postBySlug= slug => j => j && j.blog && (j.blog.posts || []).find(p => p.slug === slug);
const adsBySlug = k    => j => j && j.pages && j.pages[k];
const siteKeys  = ks   => j => j && Object.fromEntries(ks.map(k => [k, j[k]]));

/* Nguồn thứ hai lấy từ site.json cho những trang mà khối dùng chung CHÍNH LÀ
   nội dung chính của trang đó — bảng giá, quy trình, FAQ. Không khai bừa:
   khai thừa thì một lần sửa giá bump ngày cả site, hết ý nghĩa. */
const PAGES = diskJson('_data/pages.json');
const AREAS = diskJson('_data/areas.json');
let   ADS   = null;
try { ADS = diskJson('_data/ads-pages.json'); } catch { /* chưa có thì bỏ qua */ }

const entries = [
  { url: '/',                        src: [['_data/pages.json', atKey('home')],         ['_data/site.json', siteKeys(['whyUs', 'steps', 'faq'])]] },
  { url: '/nap-muc-may-in-tan-noi/', src: [['_data/pages.json', atKey('nap-muc')],      ['_data/site.json', siteKeys(['faq'])]] },
  { url: '/sua-may-in/',             src: [['_data/pages.json', atKey('sua-may-in')]] },
  { url: '/bang-gia/',               src: [['_data/pages.json', atKey('bang-gia')],     ['_data/site.json', siteKeys(['pricing', 'pricingNotes', 'faq'])]] },
  { url: '/quy-trinh-bao-hanh/',     src: [['_data/pages.json', atKey('quy-trinh')],    ['_data/site.json', siteKeys(['steps'])]] },
  { url: '/ve-chung-toi/',           src: [['_data/pages.json', atKey('ve-chung-toi')]] },
  { url: '/lien-he/',                src: [['_data/pages.json', atKey('lien-he')]] },
  { url: '/cau-hoi-thuong-gap/',     src: [['_data/pages.json', atKey('faq-page')],     ['_data/site.json', siteKeys(['faq'])]] },
  { url: '/khu-vuc/',                src: [['_data/pages.json', atKey('khu-vuc')],      ['_data/areas.json', j => (Array.isArray(j) ? j : []).map(a => a.label)]] },
  { url: '/kinh-nghiem/',            src: [['_data/pages.json', j => j && j.blog && { title: j.blog.title, lead: j.blog.lead, posts: (j.blog.posts || []).map(p => p.title) }]] },
  ...AREAS.map(a => ({ url: `/khu-vuc/${a.slug}/`, src: [['_data/areas.json', areaBySlug(a.slug)]] })),
  ...(PAGES.blog?.posts || []).map(p => ({ url: `/kinh-nghiem/${p.slug}/`, src: [['_data/pages.json', postBySlug(p.slug)]] })),
  ...(ADS ? Object.keys(ADS.pages || {}).map(k => ({ url: `/${ADS.pages[k].slug}/`, src: [['_data/ads-pages.json', adsBySlug(k)]] })) : []),
];

// ---------- đọc ngày từ git ----------
function hist(file, pick) {
  return commits(file).map(c => ({ date: c.date, val: pick(showJson(c.h, file)) }));
}

function lastChange(file, pick) {
  const h = hist(file, pick);
  if (!h.length) return { modified: TODAY, first: TODAY };
  const first = [...h].reverse().find(x => x.val != null);
  // sửa rồi chưa commit -> hôm nay
  if (key(pick(diskJson(file))) !== key(h[0].val)) {
    return { modified: TODAY, first: first ? first.date : TODAY };
  }
  for (let i = 0; i < h.length; i++) {
    const prev = h[i + 1] ? h[i + 1].val : null;
    if (key(h[i].val) !== key(prev)) return { modified: h[i].date, first: first ? first.date : h[i].date };
  }
  return { modified: h[h.length - 1].date, first: first ? first.date : h[h.length - 1].date };
}

const out = {};
for (const e of entries) {
  let modified = null, published = null;
  for (let i = 0; i < e.src.length; i++) {
    const [file, pick] = e.src[i];
    const r = lastChange(file, pick);
    if (!modified || r.modified > modified) modified = r.modified;
    if (i === 0) published = r.first;            // ngày lên trang lấy từ nguồn chính
  }
  if (modified < published) modified = published;
  out[e.url] = { published, modified };
  process.stdout.write(`${modified}  ${e.url}\n`);
}

/* Không đóng dấu thời điểm chạy vào file: chạy lại mà ngày không đổi thì file phải y
   nguyên, nếu không cứ 1-2 ngày chạy lại là đẻ một diff rác. Ngày chạy đã nằm trong git. */
const OUT = resolve(ROOT, '_data/page-dates.json');
const body = JSON.stringify({
  _note: 'SINH RA bởi _build/page-dates.mjs từ lịch sử git — đừng sửa tay. Ngày chỉ nhảy khi khối nội dung của riêng trang đó đổi.',
  pages: out,
}, null, 2) + '\n';
const same = existsSync(OUT) && readFileSync(OUT, 'utf8') === body;
if (!same) writeFileSync(OUT, body, 'utf8');

const spread = [...new Set(Object.values(out).map(d => d.modified))].sort();
console.log(`\n${Object.keys(out).length} trang, ${spread.length} mốc ngày: ${spread.join(' · ')}`);
console.log(same ? '-> _data/page-dates.json không đổi' : '-> _data/page-dates.json đã ghi lại');
