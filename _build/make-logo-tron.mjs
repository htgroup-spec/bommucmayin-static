/**
 * make-logo-tron.mjs — 3 bản logo HT dạng HUY HIỆU TRÒN.
 *
 * Vì sao có file này: chủ shop thích dáng huy hiệu tròn của logo HP.
 * Hình tròn là dạng chung, không ai độc quyền. Thứ KHÔNG được mượn là tổ hợp
 * riêng của HP: quả cầu xanh bóng gradient + hai chữ THƯỜNG nghiêng màu trắng.
 *
 * Nên 3 bản dưới đây cố ý khác ở đúng những điểm đó:
 *   - chữ IN HOA, dựng bằng path hình học, không nghiêng
 *   - màu cam san hô / đen mực, không phải xanh HP
 *   - nền phẳng hoặc viền, không phải quả cầu bóng đổ highlight
 *
 * Ra: images/logo-d.svg, logo-e.svg, logo-f.svg
 * Chạy: node _build/make-logo-tron.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'images');
mkdirSync(OUT, { recursive: true });

const CORAL = '#ff695f', INK = '#2a2a2a', BLUE = '#03a4ed';

/** Chữ HT in hoa dựng bằng rect — đặt gọn trong ô 44×30 tính từ (x,y). */
const HT = (x, y, c1, c2, s = 1) => {
  const r = (a, b, w, h, f) =>
    `<rect x="${(x + a * s).toFixed(1)}" y="${(y + b * s).toFixed(1)}" width="${(w * s).toFixed(1)}" height="${(h * s).toFixed(1)}" fill="${f}"/>`;
  return [
    r(0, 0, 6, 30, c1), r(15, 0, 6, 30, c1), r(0, 12, 21, 6, c1),   // H
    r(25, 0, 19, 6, c2), r(31.5, 0, 6, 30, c2),                       // T
  ].join('');
};

/* -------- D: đĩa tròn cam đặc, HT trắng ở giữa. Phẳng, không gradient. */
const D = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268 76" role="img" aria-label="HT — bơm mực máy in">
  <circle cx="36" cy="38" r="32" fill="${CORAL}"/>
  ${HT(14, 23, '#fff', '#fff')}
  <text x="82" y="36" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="23" font-weight="700" fill="${INK}">Bơm Mực Máy In</text>
  <text x="82" y="58" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="13" font-weight="600" fill="#8a8a8a" letter-spacing="2.2">TẬN NƠI · KHU NAM</text>
</svg>`;

/* -------- E: vòng tròn viền dày màu mực, HT đen, nét ngang chữ T màu cam.
   Nền rỗng nên đặt lên ảnh hay nền màu đều sạch. */
const E = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268 76" role="img" aria-label="HT — bơm mực máy in">
  <circle cx="36" cy="38" r="29" fill="none" stroke="${INK}" stroke-width="5"/>
  ${HT(14, 23, INK, CORAL)}
  <text x="82" y="36" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="23" font-weight="700" fill="${INK}">Bơm Mực Máy In</text>
  <text x="82" y="58" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="13" font-weight="600" fill="${BLUE}" letter-spacing="2.2">TẬN NƠI · KHU NAM</text>
</svg>`;

/* -------- F: đĩa tròn đen, HT trắng, một lát cắt cam ở đáy gợi mực đọng. */
const F = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268 76" role="img" aria-label="HT — bơm mực máy in">
  <defs>
    <clipPath id="cF"><circle cx="36" cy="38" r="32"/></clipPath>
  </defs>
  <g clip-path="url(#cF)">
    <circle cx="36" cy="38" r="32" fill="${INK}"/>
    <path d="M4 56 Q36 47 68 56 L68 70 L4 70 Z" fill="${CORAL}"/>
  </g>
  ${HT(14, 20, '#fff', '#fff')}
  <text x="82" y="36" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="23" font-weight="700" fill="${INK}">Bơm Mực Máy In</text>
  <text x="82" y="58" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="13" font-weight="600" fill="#8a8a8a" letter-spacing="2.2">TẬN NƠI · KHU NAM</text>
</svg>`;

const variants = { 'logo-d': D, 'logo-e': E, 'logo-f': F };
for (const [n, svg] of Object.entries(variants)) writeFileSync(join(OUT, n + '.svg'), svg.trim() + '\n', 'utf8');

// ---- bản xem thử: cỡ thật · thu nhỏ 24px · chỉ riêng huy hiệu trên nền tối ----
const require = createRequire(import.meta.url);
let sharp;
for (const p of ['minhtiengithub', 'audit-mucinht', 'chotot']) {
  const c = resolve(ROOT, '..', p, 'node_modules', 'sharp');
  if (existsSync(c)) { sharp = require(c); break; }
}
if (sharp) {
  const W = 940, ROW = 150, comp = []; let y = 0;
  for (const [n, svg] of Object.entries(variants)) {
    const big = await sharp(Buffer.from(svg)).resize({ height: 76 }).png().toBuffer();
    const sm = await sharp(Buffer.from(svg)).resize({ height: 24 }).png().toBuffer();
    // chỉ huy hiệu, cỡ lớn — kiểm tra khi dùng làm ảnh đại diện Zalo/Maps
    const badgeSvg = svg.replace(/<text[\s\S]*?<\/text>/g, '').replace('viewBox="0 0 268 76"', 'viewBox="0 0 72 76"');
    const badge = await sharp(Buffer.from(badgeSvg)).resize({ height: 76 }).png().toBuffer();
    comp.push({ input: Buffer.from(`<svg width="${W}" height="26"><rect width="${W}" height="26" fill="#f0f0f0"/><text x="8" y="19" font-family="monospace" font-size="15" fill="#333">${n}   —   cỡ thật  ·  thu nhỏ 24px  ·  chỉ huy hiệu (ảnh đại diện Zalo)</text></svg>`), left: 0, top: y });
    comp.push({ input: big, left: 30, top: y + 34 });
    comp.push({ input: sm, left: 440, top: y + 60 });
    comp.push({ input: badge, left: 600, top: y + 34 });
    y += ROW;
  }
  await sharp({ create: { width: W, height: y, channels: 3, background: '#ffffff' } })
    .composite(comp).jpeg({ quality: 88 }).toFile(join(ROOT, '_img-src', 'logo-tron.jpg'));
  console.log('Xem thử: _img-src/logo-tron.jpg');
}
console.log('Đã vẽ: images/logo-d.svg, logo-e.svg, logo-f.svg');
