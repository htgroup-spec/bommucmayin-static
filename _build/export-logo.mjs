/**
 * export-logo.mjs — xuất bộ nhận diện từ LOGO CHÍNH THỨC của chủ shop.
 *
 * Nguồn: _img-src/logo-moi-2026.png (chủ shop gửi 03/10/2026) — vòng tròn
 * khuyết hai tông xanh dương + xám đá, chữ lồng HT ở giữa, nền trắng.
 *
 * Xuất:
 *   images/logo-ht.png        logo nền trong suốt, cao 96px — dùng ở header
 *   images/logo-ht@2x.png     bản 2x cho màn hình retina
 *   images/logo-ht-sang.png   bản sáng (xanh → trắng, xám đá → xám nhạt) cho footer tối
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
const HOTLINE = '0986 704 260';
const SRC = join(ROOT, '_img-src', 'logo-moi-2026.png');

if (!existsSync(SRC)) {
  console.error('Thiếu _img-src/logo-moi-2026.png — chép logo gốc của chủ shop vào đó trước');
  process.exit(1);
}

/**
 * Bóc nền trắng thành alpha.
 *  - ruột nét (alpha ≥ .85) giữ nguyên màu gốc, ép đặc hoàn toàn → màu không bị nhạt đi
 *  - viền răng cưa thì gỡ phần trắng đã trộn vào (un-premultiply) → không còn quầng trắng
 *    khi đặt logo lên nền tối
 */
async function knockoutWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = 1 - Math.min(r, g, b) / 255;
    if (a >= 0.85) {
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255;
    } else if (a <= 0.004) {
      out[i + 3] = 0;
    } else {
      const un = v => Math.max(0, Math.min(255, Math.round((v - 255 * (1 - a)) / a)));
      out[i] = un(r); out[i + 1] = un(g); out[i + 2] = un(b);
      out[i + 3] = Math.round(a * 255);
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toBuffer();
}

/** Bản sáng cho nền tối: nét xanh → trắng, nét xám đá → xám xanh nhạt. */
async function toLight(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    const r = out[i], b = out[i + 2];
    const xanh = b - r > 45;                      // nét xanh dương
    const [nr, ng, nb] = xanh ? [255, 255, 255] : [0x9f, 0xad, 0xbd];
    out[i] = nr; out[i + 1] = ng; out[i + 2] = nb;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toBuffer();
}

// logo nền trong suốt, cắt sát mép rồi chừa 2% lề cho thoáng
const base = await sharp(await knockoutWhite(SRC))
  .trim({ threshold: 2 })
  .extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const lite = await toLight(base);

// --- logo header ---
await sharp(base).resize({ height: 96 }).png({ compressionLevel: 9 }).toFile(join(OUT, 'logo-ht.png'));
await sharp(base).resize({ height: 192 }).png({ compressionLevel: 9 }).toFile(join(OUT, 'logo-ht@2x.png'));

// --- bản sáng cho footer nền tối ---
await sharp(lite).resize({ height: 96 }).png({ compressionLevel: 9 }).toFile(join(OUT, 'logo-ht-sang.png'));

// --- favicon 32px: cả vòng tròn lẫn chữ sẽ nát ở 16px, nên chỉ lấy chữ lồng HT
//     (vùng trong lòng vòng tròn) đặt trên ô navy — đọc được cả ở tab nhỏ nhất ---
{
  const { data, info } = await sharp(base).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, cx = W / 2, cy = H / 2, R = W * 0.26;
  let minx = W, miny = H, maxx = 0, maxy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.hypot(x - cx, y - cy) > R) continue;         // bỏ phần vòng tròn bao ngoài
    if (data[(y * W + x) * 4 + 3] < 128) continue;
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
  }
  const chu = await sharp(base)
    .extract({ left: minx, top: miny, width: maxx - minx + 1, height: maxy - miny + 1 })
    .ensureAlpha()
    .toBuffer();
  // đổi chữ sang trắng, giữ nguyên alpha
  const { data: cd, info: ci } = await sharp(chu).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < cd.length; i += 4) { cd[i] = 255; cd[i + 1] = 255; cd[i + 2] = 255; }
  const chuTrang = await sharp(cd, { raw: { width: ci.width, height: ci.height, channels: 4 } })
    .resize({ width: Math.round(32 * 0.78) }).png().toBuffer();
  const cm = await sharp(chuTrang).metadata();
  const o = Buffer.from(`<svg width="32" height="32"><rect width="32" height="32" rx="7" fill="${NAVY}"/></svg>`);
  await sharp(o)
    .composite([{ input: chuTrang, left: Math.round((32 - cm.width) / 2), top: Math.round((32 - cm.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, 'favicon-32.png'));
}

// --- apple-touch 180px: đủ lớn để hiện trọn logo trên ô bo góc trắng ---
{
  const pad = Math.round(180 * 0.08);
  const mark = await sharp(base).resize({ height: 180 - pad * 2 }).png().toBuffer();
  const m = await sharp(mark).metadata();
  const bg = Buffer.from('<svg width="180" height="180"><rect width="180" height="180" rx="40" fill="#ffffff"/></svg>');
  await sharp(bg)
    .composite([{ input: mark, left: Math.round((180 - m.width) / 2), top: Math.round((180 - m.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, 'apple-touch.png'));
}

// --- ảnh chia sẻ mặc định 1200×630 ---
{
  const mark = await sharp(base).resize({ height: 190 }).png().toBuffer();
  const mm = await sharp(mark).metadata();
  const bg = Buffer.from(`<svg width="1200" height="630">
    <rect width="1200" height="630" fill="#ffffff"/>
    <rect y="596" width="1200" height="34" fill="${CORAL}"/>
    <text x="100" y="360" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="62" font-weight="700" fill="${INK}">Bơm mực máy in tận nơi</text>
    <text x="100" y="436" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="40" font-weight="600" fill="${NAVY}">Quận 8 · 7 · 6 · 5 · 4 · Bình Chánh · Nhà Bè</text>
    <text x="100" y="510" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="34" font-weight="600" fill="${CORAL}">Laser A4 từ 80.000đ · Gọi ${HOTLINE}</text>
  </svg>`);
  await sharp(bg).composite([{ input: mark, left: 100, top: 90 }])
    .png({ compressionLevel: 9 }).toFile(join(OUT, 'og-default.png'));
}

// --- biểu trưng cho Hồ sơ Google Doanh nghiệp: 640×640, nền trắng, JPG ---
{
  const gbpDir = join(ROOT, '_img-src', 'gbp-upload');
  if (existsSync(gbpDir)) {
    const mark = await sharp(base).resize({ height: Math.round(640 * 0.82) }).png().toBuffer();
    const m = await sharp(mark).metadata();
    await sharp({ create: { width: 640, height: 640, channels: 3, background: '#ffffff' } })
      .composite([{ input: mark, left: Math.round((640 - m.width) / 2), top: Math.round((640 - m.height) / 2) }])
      .jpeg({ quality: 92 })
      .toFile(join(gbpDir, '01-bieu-trung-logo.jpg'));
    console.log('Đã xuất thêm: _img-src/gbp-upload/01-bieu-trung-logo.jpg (ảnh biểu trưng để tải lên Hồ sơ Google)');
  }
}

console.log('Đã xuất: logo-ht.png, logo-ht@2x.png, logo-ht-sang.png, favicon-32.png, apple-touch.png, og-default.png');
