/**
 * process-images.mjs — chọn ảnh từ kho Nam Phong, xử lý và xuất vào images/.
 *
 * Nguồn: D:/AUTOMATION/projects/tinhocnamphong/hình kỹ thuật  (chủ shop chỉ định 02/10/2026)
 *
 * Việc script làm với mỗi ảnh:
 *   1. Tôn trọng EXIF orientation rồi XOÁ SẠCH metadata — ảnh gốc có GPS của
 *      các ca Nam Phong đi làm, để nguyên là lộ toạ độ không liên quan site này.
 *   2. Cắt theo tỉ lệ đã chọn cho từng vị trí dùng (hero 16:9, card 4:3, dọc 3:4).
 *   3. Xuất WebP (chính) + JPG (dự phòng cho trình duyệt cũ), 2 cỡ cho srcset.
 *   4. Ghi _data/images.json — nguồn sự thật: ảnh nào, dùng ở trang nào, alt ra sao.
 *
 * Ảnh CỐ Ý KHÔNG lấy (ghi rõ để lần sau khỏi chọn nhầm):
 *   #23 mặt tiền tiệm Nam Phong · #35 #36 #40 cổng Lái Thiêu, Bình Dương (sai địa bàn)
 *   #57 biển tên công ty khách · #5 #39 máy in bill (cụm của mucinht.com)
 *   tele 135631/135632 đống linh kiện bừa bộn
 *
 * Chạy:  node _build/process-images.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const require = createRequire(import.meta.url);

let sharp;
for (const p of ['minhtiengithub', 'audit-mucinht', 'chotot']) {
  const cand = resolve(ROOT, '..', p, 'node_modules', 'sharp');
  if (existsSync(cand)) { sharp = require(cand); break; }
}
if (!sharp) { console.error('Không tìm thấy sharp trong hub'); process.exit(1); }

const SRC = resolve(ROOT, '..', 'tinhocnamphong', 'hình kỹ thuật');
const OUT = resolve(ROOT, 'images');
const INDEX = JSON.parse(readFileSync(resolve(ROOT, '_img-src', 'sheet-index.json'), 'utf8'));

/** Danh sách chọn: số ô trên contact sheet → tên file đích, tỉ lệ, alt, trang dùng. */
const PICKS = [
  // --- trang chủ ---
  { n: 65, name: 'ky-thuat-lap-hop-muc', ratio: [16, 9], page: '/',
    alt: 'Kỹ thuật lắp hộp mực HP CF276A vào máy in sau khi nạp mực và vệ sinh buồng mực' },
  { n: 73, name: 've-sinh-hop-muc', ratio: [4, 3], page: '/',
    alt: 'Kỹ thuật vệ sinh hộp mực và trống trước khi nạp mực mới, trải giấy lót để không bay bụi mực' },
  { n: 7,  name: 'may-in-dang-in-thu', ratio: [4, 3], page: '/',
    alt: 'Máy in HP LaserJet Pro đang in thử sau khi nạp mực để kiểm tra độ đậm và vết lem' },

  // --- pillar nạp mực: 7 bước ---
  { n: 2,  name: 'hop-muc-thao-roi', ratio: [4, 3], page: '/nap-muc-may-in-tan-noi/',
    alt: 'Hộp mực tháo rời thành hai khoang cùng chai mực mới, đặt trên giấy lót' },
  { n: 71, name: 'hut-muc-thai', ratio: [4, 3], page: '/nap-muc-may-in-tan-noi/',
    alt: 'Mực thải trong hộp mực được đổ ra — phải hút sạch khoang này trước khi nạp mực mới' },
  { n: 42, name: 'trong-va-cum-hop-muc', ratio: [4, 3], page: '/nap-muc-may-in-tan-noi/',
    alt: 'Trống cảm quang màu xanh và cụm hộp mực tháo rời đặt cạnh bản vẽ hướng dẫn' },
  { n: 45, name: 'dung-cu-nap-muc', ratio: [4, 3], page: '/nap-muc-may-in-tan-noi/',
    alt: 'Bộ dụng cụ nạp mực: hộp mực tháo rời, chai mực, tua vít, giấy lót' },

  // --- sửa máy in ---
  { n: 1,  name: 'lo-say-thao-ra', ratio: [4, 3], page: '/sua-may-in/',
    alt: 'Cụm lô sấy tháo khỏi máy in để kiểm tra khi bản in bị nhoè như bị ẩm' },
  { n: 38, name: 'cum-trong-banh-rang', ratio: [4, 3], page: '/sua-may-in/',
    alt: 'Kỹ thuật kiểm tra cụm trống và bánh răng của hộp mực' },
  { n: 60, name: 'ben-trong-may-in', ratio: [4, 3], page: '/sua-may-in/',
    alt: 'Bên trong máy in Fuji Xerox, kiểm tra đường giấy khi máy báo kẹt giấy liên tục' },
  { n: 70, name: 'gat-muc-ban', ratio: [16, 9], page: '/sua-may-in/',
    alt: 'Thanh gạt mực bám đầy mực cũ — nguyên nhân khiến bản in lem ở mép giấy' },

  // --- bảng giá: hộp mực theo hãng ---
  { n: 26, name: 'hop-muc-brother-tn2385', ratio: [4, 3], page: '/bang-gia/',
    alt: 'Hai hộp mực Brother TN-2385 chuẩn bị mang đi nạp cho khách' },
  { n: 58, name: 'hop-muc-hp', ratio: [4, 3], page: '/bang-gia/',
    alt: 'Hộp mực HP CE285A và CF283A đặt cạnh nhau để so sánh kích thước' },
  { n: 59, name: 'trong-cam-quang', ratio: [4, 3], page: '/bang-gia/',
    alt: 'Trống cảm quang màu xanh bên trong hộp mực — bộ phận quyết định bản in có sọc hay không' },
  { n: 76, name: 'kho-hop-muc', ratio: [16, 9], page: '/bang-gia/',
    alt: 'Hộp mực của khách xếp sẵn trong kho, mỗi hộp ghi tên để không lẫn' },

  // --- khu vực ---
  { n: 13, name: 'may-in-van-phong', ratio: [16, 9], page: '/khu-vuc/',
    alt: 'Máy in đặt trong văn phòng nhỏ — nhóm khách in đều mỗi ngày nên hết mực đúng chu kỳ' },
  { n: 3,  name: 'epson-he-binh', ratio: [4, 3], page: '/khu-vuc/',
    alt: 'Máy in phun mực Epson L3250 hệ bình — loại này bơm mực nước, khác hẳn máy laser' },

  // --- blog ---
  { n: 29, name: 'hop-muc-pantum-chip', ratio: [16, 9], page: '/kinh-nghiem/',
    alt: 'Hộp mực Pantum TL-410 nhìn rõ chip và trống — hai bộ phận quyết định khi nào phải thay hộp' },
  { n: 53, name: 'hop-muc-can-canh', ratio: [4, 3], page: '/kinh-nghiem/',
    alt: 'Hộp mực laser nhìn cận cảnh phần trống và lưỡi gạt' },
  { n: 67, name: 'cam-hop-muc-hp-59a', ratio: [3, 4], page: '/kinh-nghiem/',
    alt: 'Kỹ thuật cầm hộp mực HP 59A, đọc mã trên nhãn để lấy đúng loại mực' },
];

const SIZES = { hero: [1280, 720], card: [800, 600], tall: [600, 800] };

function targetSize(ratio) {
  const [w, h] = ratio;
  if (w === 16) return SIZES.hero;
  if (w === 3) return SIZES.tall;
  return SIZES.card;
}

mkdirSync(OUT, { recursive: true });
const manifest = [];
let ok = 0, fail = 0;

for (const pick of PICKS) {
  const srcName = INDEX[String(pick.n)];
  if (!srcName) { console.error(`#${pick.n}: không có trong sheet-index`); fail++; continue; }
  const srcPath = join(SRC, srcName);
  const [W, H] = targetSize(pick.ratio);

  try {
    const base = sharp(srcPath).rotate().resize(W, H, { fit: 'cover', position: 'centre' });

    // .withMetadata() KHÔNG được gọi => sharp bỏ hết EXIF, kể cả GPS.
    await base.clone().webp({ quality: 78 }).toFile(join(OUT, `${pick.name}.webp`));
    await base.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(join(OUT, `${pick.name}.jpg`));

    // bản nhỏ cho srcset (màn hình hẹp)
    const w2 = Math.round(W / 2), h2 = Math.round(H / 2);
    await sharp(srcPath).rotate().resize(w2, h2, { fit: 'cover', position: 'centre' })
      .webp({ quality: 74 }).toFile(join(OUT, `${pick.name}@small.webp`));

    manifest.push({
      name: pick.name, alt: pick.alt, page: pick.page,
      w: W, h: H, smallW: w2, smallH: h2,
      source: srcName, sheetNo: pick.n,
    });
    ok++;
  } catch (e) {
    console.error(`#${pick.n} (${srcName}): ${e.message.slice(0, 60)}`);
    fail++;
  }
}

writeFileSync(resolve(ROOT, '_data', 'images.json'), JSON.stringify({
  _meta: {
    generated: new Date().toISOString().slice(0, 10),
    source: 'tinhocnamphong/hình kỹ thuật (chủ shop chỉ định 02/10/2026)',
    note: 'Đã xoá sạch EXIF/GPS. Ảnh nào dùng ở đây phải được ghi vào sổ ANH-DA-DUNG.md bên Nam Phong để không dùng lại ở site khác.',
  },
  images: manifest,
}, null, 2), 'utf8');

console.log(`Đã xử lý ${ok} ảnh (${fail} lỗi) → images/`);
console.log('Mỗi ảnh có: .webp, .jpg, @small.webp — EXIF/GPS đã xoá sạch.');
console.log('Danh mục: _data/images.json');
