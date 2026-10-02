/**
 * patch-diachi.mjs — sửa địa chỉ kho và mọi câu nói sai vị trí kho.
 *
 * Chủ shop xác nhận 02/10/2026: kho ở 5/19 Phạm Hùng thuộc **xã Bình Hưng**,
 * KHÔNG phải phường Chánh Hưng như Hồ sơ Google đang ghi.
 *
 * Từ 01/07/2025 TP.HCM bỏ cấp quận/huyện (Nghị quyết 1685/NQ-UBTVQH15),
 * phường–xã trực thuộc thành phố. Xã Bình Hưng mới = xã Bình Hưng cũ + xã
 * Phong Phú + một phần Phường 7 (Quận 8 cũ). Nên địa chỉ hành chính đúng là:
 *     5/19 Phạm Hùng, Xã Bình Hưng, TP. Hồ Chí Minh
 * (không ghi "huyện Bình Chánh" nữa).
 *
 * LƯU Ý về nội dung: tên quận cũ VẪN giữ trong bài, vì khách vẫn gõ
 * "nạp mực máy in quận 8" — số liệu Google Ads đo được là theo tên quận cũ.
 * Chỉ ĐỊA CHỈ hành chính dùng tên đơn vị mới.
 *
 * Chạy một lần: node _build/patch-diachi.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const p = f => resolve(ROOT, f);
let n = 0, miss = [];
const sub = (t, from, to, label) => {
  if (!t.includes(from)) { miss.push(label); return t; }
  n++; return t.split(from).join(to);
};

// ------------------------------------------------------------ areas.json
let a = readFileSync(p('_data/areas.json'), 'utf8');

a = sub(a,
  'Kho mực và kỹ thuật của chúng tôi đặt tại 5/19 Phạm Hùng — tức là nằm trong chính Quận 8. Khách ở đây gần như luôn được phục vụ trước các quận khác, thường 15–30 phút kể từ cuộc gọi. Đây là lợi thế duy nhất không thể sao chép bằng quảng cáo: khoảng cách thật.',
  'Kho mực và kỹ thuật của chúng tôi đặt tại 5/19 Phạm Hùng, xã Bình Hưng — ngay sát ranh Quận 8, cách khu Chánh Hưng và Phạm Thế Hiển vài phút chạy xe. Khách Quận 8 gần như luôn được phục vụ trước các quận khác, thường 15–30 phút kể từ cuộc gọi. Đây là lợi thế không thể sao chép bằng quảng cáo: khoảng cách thật.',
  'quan-8 intro');

a = sub(a,
  'Thường 15–30 phút vì kho đặt ngay trong quận, ở 5/19 Phạm Hùng. Giờ cao điểm hoặc vào sâu trong hẻm thì cộng thêm khoảng 10 phút.',
  'Thường 15–30 phút vì kho nằm ngay sát ranh quận, ở 5/19 Phạm Hùng (xã Bình Hưng). Giờ cao điểm hoặc vào sâu trong hẻm thì cộng thêm khoảng 10 phút.',
  'quan-8 faq eta');

a = sub(a, '"eta": "45 – 75 phút"', '"eta": "15 – 60 phút tuỳ xã"', 'binh-chanh eta');
a = sub(a, '"eta": "60 – 90 phút"', '"eta": "45 – 75 phút"', 'nha-be eta');
a = sub(a, '"eta": "40 – 60 phút",\n    "title": "Nạp Mực Máy In Quận 7',
          '"eta": "30 – 50 phút",\n    "title": "Nạp Mực Máy In Quận 7', 'quan-7 eta');

a = sub(a,
  'Bình Chánh rộng, và đó là điều phải nói thật ngay từ đầu: từ kho ở Phạm Hùng tới Bình Hưng chỉ hơn mười phút, nhưng tới Vĩnh Lộc hay Tân Nhựt thì có thể hơn một tiếng.',
  'Kho của chúng tôi nằm ngay trong xã Bình Hưng, nên phần phía bắc của địa bàn này là nhanh nhất trong cả bảy khu — thường 15–25 phút. Nhưng Bình Chánh rất rộng, và đó là điều phải nói thật: tới Vĩnh Lộc hay Tân Nhựt thì có thể hơn một tiếng.',
  'binh-chanh intro');

a = sub(a,
  'Bình Hưng, khu dân cư Trung Sơn (gần kho nhất)',
  'Bình Hưng — kho của chúng tôi đặt ngay tại đây, tới nhanh nhất',
  'binh-chanh coverage');

a = sub(a,
  '{ "q": "Sửa máy in Bình Chánh có đi tới Vĩnh Lộc, Tân Nhựt không?", "a": "Có, nhận toàn huyện.',
  '{ "q": "Sửa máy in Bình Chánh có đi tới Vĩnh Lộc, Tân Nhựt không?", "a": "Có, nhận toàn địa bàn.',
  'binh-chanh faq');

writeFileSync(p('_data/areas.json'), a, 'utf8');

// ------------------------------------------------------------- site.json
let s = readFileSync(p('_data/site.json'), 'utf8');

s = sub(s, '"ward": "Chánh Hưng",', '"ward": "Xã Bình Hưng",', 'site ward');
s = sub(s,
  'Hồ sơ Google Doanh nghiệp đã xác nhận địa chỉ đầy đủ là 5/19 Đ. Phạm Hùng, Chánh Hưng, Hồ Chí Minh 700000. Địa chỉ trên web PHẢI khớp từng chữ với hồ sơ Google — lệch NAP là mất điểm tìm kiếm địa phương.',
  'Chủ shop xác nhận kho thuộc XÃ BÌNH HƯNG (không phải phường Chánh Hưng như Hồ sơ Google đang ghi — cần sửa bên đó cho khớp). Từ 01/07/2025 TP.HCM bỏ cấp quận/huyện nên địa chỉ chỉ ghi: số nhà, đường, xã/phường, thành phố. Tên quận cũ VẪN giữ trong nội dung bài vì khách tìm kiếm theo tên cũ.',
  'site note');

s = sub(s,
  'Với Quận 8, Quận 4, Quận 5 và Quận 6 — kho đặt ở Phạm Hùng nên kỹ thuật thường có mặt trong 20–40 phút. Quận 7, Bình Chánh, Nhà Bè xa hơn, khoảng 45–60 phút tuỳ giờ.',
  'Kho đặt ở Phạm Hùng (xã Bình Hưng) nên khu Bình Hưng và Quận 8 nhanh nhất, thường 15–30 phút. Quận 4, Quận 5, Quận 6 khoảng 25–40 phút. Quận 7 khoảng 30–50 phút. Nhà Bè và các xã xa của Bình Chánh thì 45–75 phút.',
  'site faq eta');

s = sub(s,
  'Kho mực và kỹ thuật đặt tại Phạm Hùng, nên Quận 8, Quận 4, Quận 5, Quận 6 là bán kính gần — không phải chạy từ trung tâm sang.',
  'Kho mực và kỹ thuật đặt tại Phạm Hùng, xã Bình Hưng — sát ranh Quận 8 và nhìn sang Quận 7 qua Nguyễn Văn Linh. Cả bảy khu đều nằm trong bán kính gần, không phải chạy từ trung tâm sang.',
  'site whyUs');

writeFileSync(p('_data/site.json'), s, 'utf8');

console.log(`Đã sửa ${n} chỗ.`);
if (miss.length) { console.log('KHÔNG TÌM THẤY (xem lại):'); miss.forEach(m => console.log('  - ' + m)); }
