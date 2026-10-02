/**
 * recolor-mono.mjs — lấy chữ lồng "ht" trong logo mucinht.com và đổi tone màu.
 *
 * Nguồn: audit-mucinht/data/brand/logo.png — logo của chính chủ shop, nên dùng
 * lại hoàn toàn hợp lệ (khác hẳn chuyện mượn nhận diện của hãng khác).
 *
 * Cách làm: đọc pixel thô, pixel nào gần màu TÍM gốc thì thay bằng màu 1,
 * gần màu CAM gốc thì thay bằng màu 2, nền giữ trong suốt. Giữ nguyên biên
 * mềm (anti-alias) bằng cách pha theo độ gần màu, nếu không chữ sẽ bị răng cưa.
 *
 * Ra: images/mono-<tên tone>.png + _img-src/mono-tone.jpg để xem thử
 * Chạy: node _build/recolor-mono.mjs
 */
import { mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let sharp;
for (const p of ['minhtiengithub', 'audit-mucinht', 'chotot']) {
  const c = resolve(ROOT, '..', p, 'node_modules', 'sharp');
  if (existsSync(c)) { sharp = require(c); break; }
}
if (!sharp) { console.error('thiếu sharp'); process.exit(1); }

const SRC = resolve(ROOT, '..', 'audit-mucinht', 'data', 'brand', 'logo.png');
const OUT = join(ROOT, 'images');
mkdirSync(OUT, { recursive: true });
mkdirSync(join(ROOT, '_img-src'), { recursive: true });

const PURPLE = [60, 60, 140];   // chữ h gốc
const ORANGE = [245, 134, 52];  // chữ t gốc

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Các tone thử. c1 = thay cho tím (chữ h), c2 = thay cho cam (chữ t). */
const TONES = {
  'cam-muc':    { c1: '#2a2a2a', c2: '#ff695f', ten: 'Đen mực + cam san hô (đúng tone site)' },
  'cam-dam':    { c1: '#ef4e43', c2: '#ffa08a', ten: 'Cam đậm + cam nhạt (một tông)' },
  'xanh-cam':   { c1: '#14457f', c2: '#ff695f', ten: 'Xanh navy + cam san hô' },
  'xanh-duong': { c1: '#03a4ed', c2: '#2a2a2a', ten: 'Xanh dương + đen mực' },
  'xanh-la':    { c1: '#0f766e', c2: '#f59e0b', ten: 'Xanh ngọc + hổ phách' },
};

// Cắt vùng chữ lồng (phần trái của logo). Chữ "mucinht.com" nằm ở góc trên-phải
// và KHÔNG chạm vào nét nào của chữ lồng, nên xoá hẳn góc đó bằng một ô trong suốt
// là sạch — không phải đoán đường cắt.
const meta = await sharp(SRC).metadata();
const cropW = Math.round(meta.width * 0.245);   // tới sát trước chữ "HƯNG"
const wipeX = Math.round(cropW * 0.60);        // từ đây sang phải là chữ "mu"
const wipeY = Math.round(meta.height * 0.25); // chỉ phần trên, dưới là nét cam của chữ t

// Cắt trước ra buffer rồi mới khoét — gộp extract + composite trong một pipeline
// làm sharp so kích thước sai và báo lỗi.
const cropped = await sharp(SRC)
  .extract({ left: 0, top: 0, width: cropW, height: meta.height })
  .ensureAlpha()
  .png()
  .toBuffer();

// Phải khoét ở một pipeline RIÊNG: sharp chạy trim/resize TRƯỚC composite, nên
// gộp chung thì ô khoét to hơn ảnh đã thu nhỏ và sharp báo lỗi kích thước.
const wiped = await sharp(cropped)
  .composite([{
    input: {
      create: {
        width: cropW - wipeX, height: wipeY, channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    },
    left: wipeX, top: 0, blend: 'dest-out',
  }])
  .png()
  .toBuffer();

const monoBuf = await sharp(wiped)
  .trim({ threshold: 10 })
  .resize({ height: 420 })
  .png()
  .toBuffer();

const { data, info } = await sharp(monoBuf).raw().toBuffer({ resolveWithObject: true });
const made = [];

for (const [key, tone] of Object.entries(TONES)) {
  const c1 = hex(tone.c1), c2 = hex(tone.c2);
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3];
    if (a < 8) continue;                                // nền trong suốt, bỏ qua
    const px = [out[i], out[i + 1], out[i + 2]];
    const dP = dist(px, PURPLE), dO = dist(px, ORANGE);
    const target = dP <= dO ? c1 : c2;
    // pixel càng gần màu gốc thì thay càng mạnh — giữ biên mềm
    const d = Math.min(dP, dO);
    const k = Math.max(0, Math.min(1, 1 - d / 150));
    out[i]     = Math.round(px[0] * (1 - k) + target[0] * k);
    out[i + 1] = Math.round(px[1] * (1 - k) + target[1] * k);
    out[i + 2] = Math.round(px[2] * (1 - k) + target[2] * k);
  }

  const file = join(OUT, `mono-${key}.png`);
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 }).toFile(file);
  made.push({ key, file, ten: tone.ten });
}

// ---- bản xem thử: nền sáng + nền tối + thu nhỏ ----
const W = 980, ROW = 160, comp = []; let y = 0;
for (const m of made) {
  const big = await sharp(m.file).resize({ height: 86 }).png().toBuffer();
  const sm  = await sharp(m.file).resize({ height: 28 }).png().toBuffer();
  comp.push({ input: Buffer.from(`<svg width="${W}" height="28"><rect width="${W}" height="28" fill="#f0f0f0"/><text x="8" y="20" font-family="monospace" font-size="15" fill="#333">${m.key}  —  ${m.ten}</text></svg>`), left: 0, top: y });
  comp.push({ input: Buffer.from(`<svg width="300" height="110"><rect width="300" height="110" fill="#1e1e1e"/></svg>`), left: 520, top: y + 34 });
  comp.push({ input: big, left: 40,  top: y + 44 });
  comp.push({ input: sm,  left: 300, top: y + 70 });
  comp.push({ input: big, left: 560, top: y + 46 });
  y += ROW;
}
await sharp({ create: { width: W, height: y, channels: 3, background: '#ffffff' } })
  .composite(comp).jpeg({ quality: 88 }).toFile(join(ROOT, '_img-src', 'mono-tone.jpg'));

console.log(`Đã tạo ${made.length} tone → images/mono-*.png`);
console.log('Xem thử (nền sáng · thu nhỏ · nền tối): _img-src/mono-tone.jpg');
