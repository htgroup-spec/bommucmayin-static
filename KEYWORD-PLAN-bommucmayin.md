# Bộ Keyword — bommucmayin.net (dịch vụ máy in khu Nam TP.HCM)

> Data thật từ Google Ads KeywordPlanIdeaService · geo TP.HCM (1028581) · lập 02/10/2026
> Nguồn gốc: `VIP_ban-do-nhu-cau-hcm_2026-09-28.csv`, `VIP_khu-nam-5-quan_2026-09-28.csv`,
> `VIP_khu-nam-longtail_2026-09-28.csv` (projects/minhtiengithub) và
> `VIP_muc-in-hcm_2026-07-29.csv` (projects/tinhocnamphong).
> Gom lại bằng `_build/extract-keywords.mjs` → `_data/keywords.json`.
>
> **Không có con số nào trong file này do AI ước lượng.** Từ nào chưa đo thì ghi "chưa có số".

---

## Cách bộ này được dựng

| Bước | Kết quả |
|---|---|
| Đọc lại 4 file VIP đã chạy | 8.874 dòng thô |
| Gộp trùng (giữ volume lớn nhất) | 7.958 từ có lượt |
| Loại nhiễu sai ngành + tên đối thủ | 28 từ bị loại (xem bảng dưới) |
| Tách cụm tổng vs cụm địa danh | 13.750 lượt cụm tổng · 1.070 lượt 7 quận |

### Nhiễu đã loại và lý do

| Từ | Lượt | Lý do loại |
|---|---:|---|
| mực in mạnh tài, mực in tân việt sinh, mực in lyvystar, mực in song hy | 260 / 110 / 90 / 90 | Tên thương hiệu đối thủ — không nhắm trực tiếp được |
| cho thuê xe máy quận 7 (+3 biến thể) | 50 + 30 | Google kéo về vì cùng chứa "quận 7". Sai ngành hoàn toàn |
| …trường thịnh, …itdolozi (18 từ) | 10 mỗi từ | Khách đang tìm đích danh đối thủ |

Nếu không loại, "sửa máy in quận phú nhuận" (720 lượt) và "sửa máy in thủ đức" (390) cũng lọt
vào cụm tổng và làm trang chủ nhắm sai địa bàn.

---

## Điều data nói ngược trực giác

**1. Mỏ vàng KHÔNG nằm ở trang quận.** Toàn bộ 7 quận cộng lại chỉ **1.070 lượt/tháng**.
Riêng ba từ không gắn địa danh — `thay mực máy in` 1.600, `bơm mực máy in` 1.300,
`nạp mực máy in` 1.000 — đã là **3.900 lượt**, gấp 3,6 lần cả bảy quận. Vì vậy trang chủ
và trang trụ dịch vụ mới là nơi đáng đầu tư nhất, không phải nhân bản trang quận.

**2. Domain này trùng khớp chính xác từ khoá 1.300 lượt.** `bommucmayin.net` ↔
`bơm mực máy in` (1.300 lượt/tháng, cạnh tranh TB, CPC 7.146–63.961đ). Đây là tài sản
sẵn có mà các site anh em không có.

**3. Từ dễ nhất lại không phải từ to nhất.** `nạp mực in tận nơi` 480 lượt nhưng compIndex
chỉ **6**; `nạp mực máy in giá rẻ` 390 lượt, compIndex **6**. Hai từ này dễ lên hơn hẳn
`bơm mực máy in` (ci 60) dù chỉ nhỏ hơn ba lần.

**4. Đuôi dài theo địa danh gần như rỗng — đã kiểm chứng.** Theo
`projects/minhtiengithub/BAN-DO-TU-KHOA-KHU-NAM.md`: hãng máy × quận = 0 lượt (trừ
"sửa máy in canon quận 7" = 10); phường/xã = 0 toàn bộ; tình huống (gấp, chủ nhật,
ban đêm) = 0. **Mở trang riêng cho các cụm này là dựng trang rỗng — đúng định nghĩa
doorway page.** Vì vậy site này phủ chúng bằng H2 và FAQ *bên trong* trang đã có.

**5. Bốn động từ là bốn từ khoá riêng.** `nạp` / `đổ` / `bơm` / `thay` mực — cùng một việc
với khách nhưng Google đếm riêng, và cộng lại lớn hơn từ chính. Mỗi trang khu vực có một
khối giải thích bốn cách gọi, **viết khác nhau ở từng trang** (Q8 kèm mẹo lắc hộp, Q4 theo
chuyện giá rẻ, Q6 theo chi phí trên mỗi trang, Q5 theo hộp dự phòng, Q7 theo nhóm khách,
Bình Chánh theo gọi lẻ vs gộp lượt, Nhà Bè theo gộp đơn một chuyến).

---

## Bức tranh tổng thể

### Cụm tổng — không gắn địa danh (13.750 lượt/tháng)

| Từ khoá | Lượt/th | Cạnh tranh | ci | Trang phủ |
|---|---:|---|---:|---|
| thay mực máy in | 1.600 | TB | 42 | `/` + `/nap-muc-may-in-tan-noi/` |
| bơm mực máy in | 1.300 | TB | 60 | `/` (H1 + domain trùng khớp) |
| nạp mực máy in | 1.000 | **Thấp** | 28 | `/` + `/nap-muc-may-in-tan-noi/` |
| sửa máy in gần đây | 720 | TB | 34 | `/sua-may-in/` + `/khu-vuc/` |
| mực in | 720 | Cao | 86 | không nhắm — intent mua hàng, thuộc mucinminhtien |
| nạp mực in tận nơi | 480 | **Thấp** | 6 | `/nap-muc-may-in-tan-noi/` — **quick win số 1** |
| nạp mực máy in giá rẻ | 390 | **Thấp** | 6 | FAQ "giá rẻ có hỏng máy không" (`/khu-vuc/quan-4/`) |
| mực máy in | 390 | Cao | 100 | không nhắm |
| thay mực in | 320 | Thấp | 32 | `/nap-muc-may-in-tan-noi/` |
| nạp mực in | 260 | Thấp | 27 | `/` |
| sửa máy in | 260 | Thấp | 9 | `/sua-may-in/` |
| bơm mực máy in gần đây | 210 | Cao | 76 | `/khu-vuc/` khối "gần đây" |
| drum máy in | 210 | Cao | 86 | `/kinh-nghiem/dau-hieu-phai-thay-trong-may-in/` |
| nạp mực máy in gần đây | 170 | TB | 47 | `/khu-vuc/` khối "gần đây" |
| nạp mực máy in tại nhà | 170 | **Thấp** | 12 | `/nap-muc-may-in-tan-noi/` mục "tại nhà hay mang đi" |
| nạp mực máy in tận nơi | 170 | **Thấp** | 4 | `/nap-muc-may-in-tan-noi/` |
| thay mực máy in gần đây | 170 | Cao | 71 | `/khu-vuc/` |
| hộp mực máy in | 140 | Cao | 100 | không nhắm — thuộc mucinminhtien (bán sản phẩm) |

### Cụm địa danh — 7 quận huyện (1.070 lượt/tháng)

| Khu | Lượt/th | Từ chính | Trang |
|---|---:|---|---|
| Quận 7 | 290 | nạp mực máy in quận 7 (70), thay mực máy in quận 7 (40) | `/khu-vuc/quan-7/` |
| Quận 6 | 150 | nạp mực máy in quận 6 (50, **ci 2**), sua may in quan 6 (30) | `/khu-vuc/quan-6/` |
| Bình Chánh | 130 | sửa máy in bình chánh (40), nạp mực máy in bình chánh (40) | `/khu-vuc/binh-chanh/` |
| Quận 4 | 120 | nạp mực máy in quận 4 (40), sửa máy in tại nhà quận 4 (20) | `/khu-vuc/quan-4/` |
| Quận 8 | 80 | nạp mực máy in quận 8 (20) | `/khu-vuc/quan-8/` |
| Phú Mỹ Hưng | 70 | nạp mực máy in phú mỹ hưng (70, **Thấp**) | `/khu-vuc/phu-my-hung/` |
| Quận 5 | 60 | nạp mực máy in quận 5 (20) | `/khu-vuc/quan-5/` |
| Nhà Bè | 40 | sửa máy in nhà bè (20) | `/khu-vuc/nha-be/` |

**Phú Mỹ Hưng là tên khu dân cư DUY NHẤT trong cả địa bàn đạt lượt thật** — nên có trang
riêng. Mọi tên khu khác (Trung Sơn, Him Lam, Hiệp Phước, Bình Điền…) đều 0 lượt, chỉ được
nhắc trong trang quận tương ứng, không mở trang.

---

## Kế hoạch nội dung

### Tier 1 — Trang trụ (đã dựng)
| Trang | Nhắm | Lượt gom |
|---|---|---:|
| `/` | bơm mực máy in · nạp mực máy in · thay mực máy in | ~3.900 |
| `/nap-muc-may-in-tan-noi/` | nạp mực in tận nơi · tại nhà · thay mực in | ~1.400 |
| `/sua-may-in/` | sửa máy in · sửa máy in gần đây · dịch vụ sửa máy in tận nơi | ~1.100 |

### Tier 2 — Quick win (cạnh tranh Thấp, làm trước)
- `nạp mực in tận nơi` 480 / ci 6 — ưu tiên số 1
- `nạp mực máy in giá rẻ` 390 / ci 6
- `nạp mực máy in quận 6` 50 / ci 2 — quận dễ nhất trong bảy
- `nạp mực máy in phú mỹ hưng` 70 / Thấp
- `nạp mực máy in tận nơi` 170 / ci 4

### Tier 3 — 8 trang khu vực (đã dựng)
Mỗi trang có góc riêng, không copy khung: Q8 (kho tại chỗ, chợ Bình Điền), Q7 (thủ tục cao
ốc + KCX), Q6 (máy quá tải, chi phí trên mỗi trang), Bình Chánh (xưởng/kho, bụi–nhiệt–điện),
Q4 (hẻm nhỏ, chuyện "giá rẻ"), Q5 (cửa hàng sỉ, hộp dự phòng), Nhà Bè (đi theo tuyến, KCN),
Phú Mỹ Hưng (thẻ khách, không làm bẩn nhà).

### Tier 4 — Blog quyết định mua (3 bài, đã dựng)
Chọn chủ đề **gắn quyết định chi tiền**, cố ý tránh cụm how-to chung mà
`phan-vung-keyword-2026-07.md` đã giao cho tinhocnamphong:
- Nạp mực hay thay hộp mực mới (quyết định chi tiền)
- Nên nạp mực bao lâu một lần (chu kỳ dịch vụ)
- Dấu hiệu phải thay trống — phủ `drum máy in` 210 lượt

---

## Ranh giới với các site anh em

Theo `projects/phan-vung-keyword-2026-07.md` và quyết định 01/10/2026:

| Cụm | Thuộc về | bommucmayin.net làm gì |
|---|---|---|
| Dịch vụ nạp mực/sửa máy in **khu Nam** (Q8, Q7, Q6, Q5, Q4, Bình Chánh, Nhà Bè) | **bommucmayin.net** | Chủ quản. Nhận 301 từ 5 trang `/khu-vuc/` của mucinminhtien |
| Bán hộp mực, drum, linh kiện theo model | mucinminhtien.com | Không làm trang bán sản phẩm |
| Dịch vụ local **khu Đông** (Thủ Đức, Dĩ An, Biên Hoà) | tinhocnamphong.net | Không viết |
| How-to / lỗi máy in (blog chung) | tinhocnamphong.net | Chỉ 3 bài gắn quyết định mua, không làm kho how-to |
| Máy in bill / POS / giấy nhiệt | mucinht.com | Không đụng |

---

## Việc còn phải làm

| Việc | Vì sao |
|---|---|
| Chạy lại API sau 3–6 tháng | Volume là trung bình 12 tháng, cần đo lại để thấy xu hướng |
| Quyết cụm **cho thuê máy photocopy Quận 7** (50 lượt, CPC 45–73k) | Có làm dịch vụ cho thuê thì viết trang; không thì bỏ hẳn. Hiện **chưa phủ** |
| Đo riêng cụm `sửa máy in` không địa danh | Hiện lấy từ bộ tinhocnamphong (29/07), nên chạy lại riêng cho khu Nam |

## Lệnh chạy lại

```bash
node _build/extract-keywords.mjs    # gom lại từ các file VIP trong hub
node _build/generate.mjs            # sinh lại 21 trang
node _build/audit.mjs               # kiểm trước khi đẩy
```

Muốn đo từ khoá MỚI (không chỉ gom lại) thì chạy skill `keyword-research`:
```bash
node D:/AUTOMATION/shared/skills/keyword-research/scripts/keyword_research.js <config.json> --out .
```
