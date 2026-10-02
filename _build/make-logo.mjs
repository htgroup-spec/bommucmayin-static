/**
 * make-logo.mjs — vẽ 3 hướng logo HT (SVG thuần, không dùng font ngoài).
 *
 * Chữ được dựng bằng path hình học nên không phụ thuộc máy có font gì,
 * và không dính bản quyền font.
 *
 * CỐ Ý TRÁNH: hình tròn gradient xanh + hai chữ thường nghiêng trắng —
 * đó là bộ nhận diện của HP, mà HT lại cùng ngành máy in nên rất dễ bị
 * coi là gây nhầm lẫn.
 *
 * Ra: images/logo-a.svg, logo-b.svg, logo-c.svg  (+ bản PNG để xem thử)
 * Chạy: node _build/make-logo.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'images');
mkdirSync(OUT, { recursive: true });

const CORAL = '#ff695f', CORAL_D = '#ef4e43', INK = '#2a2a2a', BLUE = '#03a4ed';

/* ---------------------------------------------------------------- hướng A
   Khối vuông bo góc màu mực + chữ HT khắc rỗng, gạch ngang chữ T kéo dài
   thành "vệt mực in". Chắc, dễ nhận ở cỡ favicon 16px. */
const A = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 72" role="img" aria-label="HT — bơm mực máy in">
  <rect x="0" y="4" width="64" height="64" rx="16" fill="${INK}"/>
  <!-- H -->
  <rect x="14" y="20" width="7"  height="32" fill="#fff"/>
  <rect x="31" y="20" width="7"  height="32" fill="#fff"/>
  <rect x="14" y="32" width="24" height="7"  fill="#fff"/>
  <!-- T -->
  <rect x="40" y="20" width="14" height="7"  fill="${CORAL}"/>
  <rect x="43" y="20" width="7"  height="32" fill="${CORAL}"/>
  <text x="78" y="36" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="23" font-weight="700" fill="${INK}" letter-spacing="-.3">Bơm Mực</text>
  <text x="78" y="58" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="23" font-weight="700" fill="${CORAL}" letter-spacing="-.3">Máy In HT</text>
</svg>`;

/* ---------------------------------------------------------------- hướng B
   Chữ H và T lồng nhau, nét dày đều, cắt một rãnh trắng chéo gợi tờ giấy
   vừa in ra. Không khung bao — hiện đại, hợp nền sáng. */
const B = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 72" role="img" aria-label="HT — bơm mực máy in">
  <defs>
    <clipPath id="cutB">
      <path d="M0 0 H72 V72 H0 Z M2 47 L70 39 L70 44 L2 52 Z" clip-rule="evenodd"/>
    </clipPath>
  </defs>
  <g clip-path="url(#cutB)">
    <rect x="4"  y="12" width="9"  height="48" fill="${INK}"/>
    <rect x="25" y="12" width="9"  height="48" fill="${INK}"/>
    <rect x="4"  y="31" width="30" height="9"  fill="${INK}"/>
    <rect x="38" y="12" width="30" height="9"  fill="${CORAL}"/>
    <rect x="48" y="12" width="9"  height="48" fill="${CORAL}"/>
  </g>
  <text x="84" y="34" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="22" font-weight="700" fill="${INK}">Bơm Mực Máy In</text>
  <text x="84" y="57" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="15" font-weight="600" fill="#8a8a8a" letter-spacing="2.4">KHU NAM TP.HCM</text>
</svg>`;

/* ---------------------------------------------------------------- hướng C
   Giọt mực: hình giọt bo tròn màu cam, trong lòng khoét chữ HT trắng.
   Gợi thẳng tới "mực", khác hẳn mọi logo hình tròn trong ngành. */
const C = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 76" role="img" aria-label="HT — bơm mực máy in">
  <defs>
    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CORAL}"/><stop offset="1" stop-color="${CORAL_D}"/>
    </linearGradient>
  </defs>
  <!-- giọt mực: đỉnh nhọn, đáy tròn -->
  <path d="M34 4 C34 4 60 32 60 46 a26 26 0 0 1-52 0 C8 32 34 4 34 4 Z" fill="url(#gC)"/>
  <!-- HT khoét trắng -->
  <rect x="17" y="34" width="5.5" height="24" fill="#fff"/>
  <rect x="30" y="34" width="5.5" height="24" fill="#fff"/>
  <rect x="17" y="43" width="18.5" height="5.5" fill="#fff"/>
  <rect x="38" y="34" width="14"  height="5.5" fill="#fff"/>
  <rect x="42" y="34" width="5.5" height="24" fill="#fff"/>
  <text x="74" y="36" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="24" font-weight="700" fill="${INK}">HT</text>
  <text x="114" y="36" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="24" font-weight="400" fill="${INK}">Bơm Mực</text>
  <text x="74" y="60" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="14" font-weight="600" fill="${BLUE}" letter-spacing="1.8">TẬN NƠI · KHU NAM</text>
</svg>`;

const variants = { 'logo-a': A, 'logo-b': B, 'logo-c': C };
for (const [name, svg] of Object.entries(variants)) {
  writeFileSync(join(OUT, name + '.svg'), svg.trim() + '\n', 'utf8');
}

// ---- dựng ảnh xem thử (nền sáng + nền tối, kèm cỡ favicon) ----
const require = createRequire(import.meta.url);
let sharp;
for (const p of ['minhtiengithub', 'audit-mucinht', 'chotot']) {
  const cand = resolve(ROOT, '..', p, 'node_modules', 'sharp');
  if (existsSync(cand)) { sharp = require(cand); break; }
}
if (sharp) {
  const rows = [];
  let y = 0;
  const W = 900, ROW = 150;
  for (const [name, svg] of Object.entries(variants)) {
    const light = await sharp(Buffer.from(svg)).resize({ height: 72 }).png().toBuffer();
    const small = await sharp(Buffer.from(svg)).resize({ height: 24 }).png().toBuffer();
    rows.push({ input: light, left: 40, top: y + 26 });
    rows.push({ input: small, left: 560, top: y + 50 });
    rows.push({
      input: Buffer.from(`<svg width="${W}" height="26"><rect width="${W}" height="26" fill="#f0f0f0"/><text x="8" y="19" font-family="monospace" font-size="15" fill="#333">${name}  —  trái: cỡ thật 72px   ·   phải: thu nhỏ còn 24px (cỡ trên điện thoại)</text></svg>`),
      left: 0, top: y,
    });
    y += ROW;
  }
  await sharp({ create: { width: W, height: y, channels: 3, background: '#ffffff' } })
    .composite(rows).jpeg({ quality: 88 }).toFile(join(ROOT, '_img-src', 'logo-thu.jpg'));
  console.log('Bản xem thử: _img-src/logo-thu.jpg');
}

console.log('Đã vẽ: images/logo-a.svg, logo-b.svg, logo-c.svg');
