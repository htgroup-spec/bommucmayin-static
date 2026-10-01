/**
 * extract-keywords.mjs
 * Gom từ khóa THẬT (Google Ads API) từ các file VIP_*.csv đã chạy trong hub
 * về một file _data/keywords.json để generator neo nội dung theo số liệu.
 *
 * Nguồn (không sinh số mới, chỉ đọc lại):
 *   projects/minhtiengithub/VIP_ban-do-nhu-cau-hcm_2026-09-28.csv   (geo TP.HCM)
 *   projects/minhtiengithub/VIP_khu-nam-5-quan_2026-09-28.csv
 *   projects/minhtiengithub/VIP_khu-nam-longtail_2026-09-28.csv
 *   projects/tinhocnamphong/_data/keyword-research/VIP_muc-in-hcm_2026-07-29.csv
 *
 * Chạy:  node _build/extract-keywords.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HUB = resolve(HERE, '..', '..');

const SOURCES = [
  'minhtiengithub/VIP_ban-do-nhu-cau-hcm_2026-09-28.csv',
  'minhtiengithub/VIP_khu-nam-5-quan_2026-09-28.csv',
  'minhtiengithub/VIP_khu-nam-longtail_2026-09-28.csv',
  'tinhocnamphong/_data/keyword-research/VIP_muc-in-hcm_2026-07-29.csv',
];

/** Parse CSV có dấu ngoặc kép, trả về mảng object theo header. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift().map(h => h.trim());
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const deaccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

// ---- đọc & gộp, giữ volume lớn nhất khi trùng key ----
const all = new Map();
const stats = [];
for (const rel of SOURCES) {
  const p = resolve(HUB, rel);
  if (!existsSync(p)) { stats.push(`${rel}: KHÔNG TÌM THẤY`); continue; }
  const rows = parseCsv(readFileSync(p, 'utf8'));
  let n = 0;
  for (const r of rows) {
    const kw = r.keyword;
    if (!kw) continue;
    const vol = parseInt(r.volume || '0', 10) || 0;
    const key = deaccent(kw).replace(/\s+/g, ' ');
    const prev = all.get(key);
    const rec = {
      kw, vol,
      comp: r.competition || '',
      ci: r.compIndex === '' ? null : Number(r.compIndex),
      cpcLow: r.cpcLow ? Number(r.cpcLow) : null,
      cpcHigh: r.cpcHigh ? Number(r.cpcHigh) : null,
      cluster: r.cluster || '',
      intent: r.intent || '',
      src: rel.split('/').pop(),
    };
    if (!prev || rec.vol > prev.vol) all.set(key, rec);
    n++;
  }
  stats.push(`${rel}: ${n} dòng`);
}

// Nhiễu phải loại trước khi gán khu vực:
//  - "cho thuê xe máy quận 7" (50+30 lượt) — Google kéo về vì cùng chứa "quận 7",
//    khách hoàn toàn khác ngành.
//  - "trường thịnh", "itdolozi" — tên đối thủ, không nhắm trực tiếp được.
const NOISE = [
  { re: /cho thue xe may|thue xe may/, why: 'thuê xe máy — sai ngành' },
  { re: /truong thinh|itdolozi|manh tai|tan viet sinh|song hy|lyvystar/, why: 'tên thương hiệu đối thủ' },
];

// ---- phân loại theo khu vực đích ----
const AREAS = {
  'quan-4':      { label: 'Quận 4',      re: /\bquan 4\b/ },
  'quan-5':      { label: 'Quận 5',      re: /\bquan 5\b/ },
  'quan-6':      { label: 'Quận 6',      re: /\bquan 6\b/ },
  'quan-7':      { label: 'Quận 7',      re: /\bquan 7\b/ },
  'quan-8':      { label: 'Quận 8',      re: /\bquan 8\b/ },
  'binh-chanh':  { label: 'Bình Chánh',  re: /binh chanh/ },
  'nha-be':      { label: 'Nhà Bè',      re: /nha be/ },
  'phu-my-hung': { label: 'Phú Mỹ Hưng', re: /phu my hung/ },
};

// cụm tổng (không gắn địa danh) — dùng cho trang chủ & trang trụ dịch vụ
const GENERIC = [
  /^(nap|bom|do|thay) muc( may)?( in)?$/, /^(nap|bom|thay) muc in$/,
  /muc in tan noi/, /muc may in tan noi/, /muc may in tai nha/, /muc may in gan day/,
  /muc may in gia re/, /muc in gan day/,
  /^sua may in/, /sua may in tan noi/, /sua may in gan day/, /dich vu sua may in/,
  /drum may in/, /hop muc may in/, /^muc in$/, /^muc may in$/,
];
// Bất kỳ dấu hiệu địa danh nào — kể cả quận/huyện KHÔNG thuộc địa bàn đích.
// Nếu không loại, "sửa máy in quận phú nhuận" (720) sẽ lọt vào cụm tổng và làm
// trang chủ nhắm sai chỗ.
const PLACE = /\b(quan|huyen|phuong|xa|tp|tphcm|thanh pho)\b|thu duc|phu nhuan|binh thanh|tan binh|tan phu|go vap|binh tan|hoc mon|cu chi|can gio|binh chanh|nha be|phu my hung|ha noi|da nang|binh duong|di an|thuan an|bien hoa|long an|tien giang/;
const hasArea = k => PLACE.test(k) || Object.values(AREAS).some(a => a.re.test(k));

const out = { _meta: {
  generated: new Date().toISOString().slice(0, 10),
  note: 'Số liệu THẬT từ Google Ads KeywordPlanIdeaService, geo TP.HCM. Không ước lượng, không sinh thêm.',
  sources: stats,
}, areas: {}, generic: [], all: [] };

const isNoise = k => NOISE.some(n => n.re.test(k));
out.dropped = [...all.entries()].filter(([k]) => isNoise(k))
  .map(([k, v]) => ({ kw: v.kw, vol: v.vol, why: NOISE.find(n => n.re.test(k)).why }))
  .filter(r => r.vol > 0).sort((x, y) => y.vol - x.vol);

for (const [slug, a] of Object.entries(AREAS)) {
  const list = [...all.entries()].filter(([k]) => a.re.test(k) && !isNoise(k)).map(([, v]) => v)
    .sort((x, y) => y.vol - x.vol);
  out.areas[slug] = {
    label: a.label,
    total: list.reduce((s, r) => s + r.vol, 0),
    withVolume: list.filter(r => r.vol > 0).length,
    zero: list.filter(r => r.vol === 0).length,
    keywords: list.filter(r => r.vol > 0),
    zeroKeywords: list.filter(r => r.vol === 0).map(r => r.kw),
  };
}

out.generic = [...all.entries()]
  .filter(([k]) => !hasArea(k) && !isNoise(k) && GENERIC.some(re => re.test(k)))
  .map(([, v]) => v).filter(r => r.vol > 0)
  .sort((x, y) => y.vol - x.vol);

out.all = [...all.values()].filter(r => r.vol > 0).sort((x, y) => y.vol - x.vol);

writeFileSync(resolve(HERE, '..', '_data', 'keywords.json'), JSON.stringify(out, null, 2), 'utf8');

// ---- báo cáo ra console ----
console.log('Nguồn:'); stats.forEach(s => console.log('  ' + s));
console.log(`\nTổng từ khóa có lượt: ${out.all.length}\n`);
console.log('KHU VỰC ĐÍCH'.padEnd(16), 'lượt/th'.padStart(8), 'có lượt'.padStart(9), 'bằng 0'.padStart(8));
for (const [slug, a] of Object.entries(out.areas))
  console.log(a.label.padEnd(16), String(a.total).padStart(8), String(a.withVolume).padStart(9), String(a.zero).padStart(8));
const areaTotal = Object.values(out.areas).reduce((s, a) => s + a.total, 0);
console.log('—'.repeat(45)); console.log('TỔNG 7 QUẬN + PMH'.padEnd(16), String(areaTotal).padStart(8));
console.log('\nCỤM TỔNG (không gắn địa danh) — top 18:');
out.generic.slice(0, 18).forEach(r =>
  console.log('  ' + r.kw.padEnd(32) + String(r.vol).padStart(6) + '  ' + (r.comp || '-').padEnd(5) + ' ci=' + (r.ci ?? '-')));
console.log('\nTổng cụm tổng: ' + out.generic.reduce((s, r) => s + r.vol, 0) + ' lượt/tháng');
