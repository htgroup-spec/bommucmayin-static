/**
 * export-logo.mjs — xuất bộ logo chính thức từ tone đã chốt (navy + cam san hô).
 *
 * Nguồn chữ lồng: logo mucinht.com của chủ shop (xem recolor-mono.mjs).
 * Tone chốt 02/10/2026: h = navy #14457f, t = cam san hô #ff695f.
 *
 * Xuất:
 *   images/logo-ht.png        chữ lồng, nền trong suốt, cao 96px — dùng ở header
 *   images/logo-ht@2x.png     bản 2x cho màn hình retina
 *   images/logo-ht-sang.png   bản sáng (h đổi sang trắng) — dùng trên footer tối
 *   images/favicon-32.png     favicon
 *   images/apple-touch.png    biểu tượng khi lưu ra màn hình chính điện thoại
 *   images/og-default.png     ảnh chia sẻ mặc định 1200×630 khi dán link
 *
 * Chạy: node _build/export-logo.mjs
 */
import { mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'images');
mkdirSync(OUT, { recursive: true });

const require = createRequire(import.meta.url);
let sharp;
for (const p of ['minhtiengithub', 'audit-mucinht', 'chotot']) {
  const c = resolve(ROOT, '..', p, 'node_modules', 'sharp');
  if (existsSync(c)) { sharp = require(c); break; }
}
if (!sharp) { console.error('thiếu sharp'); process.exit(1); }

const NAVY = '#14457f', CORAL = '#ff695f', INK = '#2a2a2a';
const SRC = join(OUT, 'mono-xanh-cam.png');   // do recolor-mono.mjs tạo

if (!existsSync(SRC)) {
  console.error('Chưa có images/mono-xanh-cam.png — chạy node _build/recolor-mono.mjs trước');
  process.exit(1);
}

// --- chữ lồng dùng ở header ---
await sharp(SRC).resize({ height: 96 }).png({ compressionLevel: 9 }).toFile(join(OUT, 'logo-ht.png'));
await sharp(SRC).resize({ height: 192 }).png({ compressionLevel: 9 }).toFile(join(OUT, 'logo-ht@2x.png'));

// --- bản sáng cho footer nền tối: đổi nét navy thành trắng, giữ nét cam ---
{
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  const navy = [0x14, 0x45, 0x7f];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] < 8) continue;
    const px = [out[i], out[i + 1], out[i + 2]];
    const d = dist(px, navy);
    if (d < 120) {                       // pixel thuộc nét navy → kéo về trắng
      const k = 1 - d / 120;
      out[i]     = Math.round(px[0] * (1 - k) + 255 * k);
      out[i + 1] = Math.round(px[1] * (1 - k) + 255 * k);
      out[i + 2] = Math.round(px[2] * (1 - k) + 255 * k);
    }
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ height: 96 }).png({ compressionLevel: 9 }).toFile(join(OUT, 'logo-ht-sang.png'));
}

// --- favicon: chữ lồng đặt trong ô bo góc navy cho rõ ở 16–32px ---
for (const size of [32, 180]) {
  const pad = Math.round(size * 0.18);
  const mono = await sharp(SRC).resize({ height: size - pad * 2 }).png().toBuffer();
  const m = await sharp(mono).metadata();
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#ffffff"/></svg>`);
  await sharp(bg)
    .composite([{ input: mono, left: Math.round((size - m.width) / 2), top: pad }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, size === 32 ? 'favicon-32.png' : 'apple-touch.png'));
}

// --- ảnh chia sẻ mặc định 1200×630 ---
{
  const mono = await sharp(SRC).resize({ height: 150 }).png().toBuffer();
  const mm = await sharp(mono).metadata();
  const bg = Buffer.from(`<svg width="1200" height="630">
    <rect width="1200" height="630" fill="#ffffff"/>
    <rect y="596" width="1200" height="34" fill="${CORAL}"/>
    <text x="100" y="360" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="62" font-weight="700" fill="${INK}">Bơm mực máy in tận nơi</text>
    <text x="100" y="436" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="40" font-weight="600" fill="${NAVY}">Quận 8 · 7 · 6 · 5 · 4 · Bình Chánh · Nhà Bè</text>
    <text x="100" y="510" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="34" font-weight="600" fill="${CORAL}">Laser A4 từ 80.000đ · Gọi 0703 525 478</text>
  </svg>`);
  await sharp(bg).composite([{ input: mono, left: 100, top: 110 }])
    .png({ compressionLevel: 9 }).toFile(join(OUT, 'og-default.png'));
}

console.log('Đã xuất: logo-ht.png, logo-ht@2x.png, logo-ht-sang.png, favicon-32.png, apple-touch.png, og-default.png');
