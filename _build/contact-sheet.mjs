/**
 * contact-sheet.mjs — ghép ảnh trong kho Nam Phong thành vài tấm lưới để chọn nhanh,
 * thay vì mở từng tấm một.
 *
 * Nguồn: D:/AUTOMATION/projects/tinhocnamphong/hình kỹ thuật  (chủ shop chỉ định 02/10/2026)
 * Ra:    _img-src/sheet-01.jpg, sheet-02.jpg, …  kèm _img-src/sheet-index.json
 *        (ô số mấy ứng với file nào — để sau chọn theo số)
 *
 * Chạy:  node _build/contact-sheet.mjs
 */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT = resolve(ROOT, '_img-src');

// sharp chưa cài trong project này — mượn từ project anh em trong hub
const require = createRequire(import.meta.url);
let sharp;
for (const p of ['minhtiengithub', 'audit-mucinht', 'chotot']) {
  const cand = resolve(ROOT, '..', p, 'node_modules', 'sharp');
  if (existsSync(cand)) { sharp = require(cand); break; }
}
if (!sharp) { console.error('Không tìm thấy sharp trong hub'); process.exit(1); }

const SRC = resolve(ROOT, '..', 'tinhocnamphong', 'hình kỹ thuật');
const COLS = 4, ROWS = 4, CELL = 420, LABEL = 34;
const PER = COLS * ROWS;

const files = readdirSync(SRC)
  .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  .sort();

mkdirSync(OUT, { recursive: true });
const index = {};
let sheetNo = 0;

for (let i = 0; i < files.length; i += PER) {
  sheetNo++;
  const batch = files.slice(i, i + PER);
  const W = COLS * CELL, H = ROWS * (CELL + LABEL);
  const composites = [];

  for (let k = 0; k < batch.length; k++) {
    const n = i + k + 1;                       // số thứ tự toàn cục
    index[n] = batch[k];
    const col = k % COLS, row = Math.floor(k / COLS);
    const x = col * CELL, y = row * (CELL + LABEL);

    let buf;
    try {
      buf = await sharp(join(SRC, batch[k]))
        .rotate()                               // tôn trọng EXIF orientation
        .resize(CELL, CELL, { fit: 'cover' })
        .jpeg({ quality: 72 })
        .toBuffer();
    } catch (e) { console.error('bỏ qua ' + batch[k] + ': ' + e.message.slice(0, 50)); continue; }

    composites.push({ input: buf, left: x, top: y + LABEL });
    composites.push({
      input: Buffer.from(
        `<svg width="${CELL}" height="${LABEL}">
           <rect width="${CELL}" height="${LABEL}" fill="#111"/>
           <text x="8" y="24" font-family="monospace" font-size="20" fill="#fff">#${n}</text>
         </svg>`),
      left: x, top: y,
    });
  }

  await sharp({ create: { width: W, height: H, channels: 3, background: '#000' } })
    .composite(composites)
    .jpeg({ quality: 70 })
    .toFile(join(OUT, `sheet-${String(sheetNo).padStart(2, '0')}.jpg`));

  console.log(`sheet-${String(sheetNo).padStart(2, '0')}.jpg  —  ảnh #${i + 1} đến #${i + batch.length}`);
}

writeFileSync(join(OUT, 'sheet-index.json'), JSON.stringify(index, null, 1), 'utf8');
console.log(`\nTổng ${files.length} ảnh, ${sheetNo} tấm lưới. Bản đồ số→file: _img-src/sheet-index.json`);
