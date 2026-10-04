# bommucmayin.net — site tĩnh dịch vụ máy in khu Nam TP.HCM

Site tĩnh thuần HTML/CSS/JS, sinh từ dữ liệu JSON, deploy bằng GitHub Pages.

- **Domain:** bommucmayin.net
- **Địa bàn:** Quận 8, Quận 7, Quận 6, Quận 5, Quận 4, Bình Chánh, Nhà Bè (+ Phú Mỹ Hưng)
- **Lưu ý pháp nhân:** site này KHÔNG thuộc pháp nhân Hi-tech. Chủ shop xác nhận 02/10/2026 — mọi nhắc tới tên công ty, MST và email đã được gỡ bỏ.
- **Hoá đơn VAT — cập nhật 04/10/2026:** chủ shop xác nhận **có xuất hoá đơn VAT**, pháp nhân là công ty Hưng Thịnh. Nhưng **cố ý không nêu tên công ty trên site**: các site anh em dùng chung pháp nhân, lộ tên ra thì khách thấy chúng giống nhau và không gọi. Vì vậy chỉ được ghi *"có xuất hoá đơn VAT"* — **tuyệt đối không** ghi tên công ty, mã số thuế hay địa chỉ pháp nhân. Phần này hiện chỉ có trên hai trang đích quảng cáo; muốn đưa vào 21 trang SEO thì hỏi chủ shop trước.
- **Hotline:** 0986 704 260 (số chính, dùng cho cả Zalo) · Số cũ 0703 525 478 vẫn nhận máy · Kho: 5/19 Phạm Hùng, TP.HCM

---

## Ba quy tắc không được phá

1. **URL sạch.** Mọi trang là `<slug>/index.html`, mọi link nội bộ **không chứa `.html`**.
   `_build/audit.mjs` sẽ báo lỗi nếu lọt.
2. **Link tương đối.** `../`, `../../` — không dùng đường dẫn tuyệt đối bắt đầu bằng `/`,
   để site chạy được cả khi mở local lẫn khi đổi domain.
3. **Không bịa số liệu.** Mọi con số lượt tìm kiếm phải đến từ `_data/keywords.json`
   (Google Ads API). Chưa đo thì ghi "chưa có số", không ước lượng.

---

## Cấu trúc

```
bommucmayin/
├── index.html                  ← sinh ra, đừng sửa tay
├── <slug>/index.html           ← 21 trang, đều sinh ra
├── css/style.css               ← giao diện (sửa tay ở đây)
├── css/responsive.css
├── js/main.js                  ← vanilla JS, không thư viện
├── _data/                      ← NGUỒN NỘI DUNG — sửa ở đây
│   ├── site.json               NAP, nav, bảng giá, quy trình, FAQ chung
│   ├── areas.json              8 trang khu vực, mỗi trang một góc riêng
│   ├── pages.json              nội dung các trang lõi + 3 bài blog
│   ├── ads-pages.json          2 trang đích Google Ads (B2B, noindex) — đọc mục bên dưới
│   └── keywords.json           số liệu Google Ads (sinh ra, đừng sửa tay)
├── _includes/                  ← khung menu + footer dùng chung
├── _build/
│   ├── extract-keywords.mjs    gom số thật từ các file VIP trong hub
│   ├── generate.mjs            sinh toàn bộ trang
│   ├── audit.mjs               kiểm trước khi đẩy
│   └── serve.mjs               server local hiểu URL sạch
├── docs/redirects.md           kế hoạch 301
└── KEYWORD-PLAN-bommucmayin.md bộ từ khoá + lý do chọn
```

**Sửa nội dung thì sửa `_data/*.json` rồi chạy lại generate** — đừng sửa file HTML đã sinh,
lần build sau sẽ ghi đè.

---

## Lệnh

```bash
node _build/generate.mjs     # sinh 21 trang + sitemap + robots + CNAME + 404
node _build/audit.mjs        # kiểm: link .html sót, link gãy, H1, title trùng, JSON-LD
node _build/serve.mjs 4321   # xem trước ở http://localhost:4321
node _build/extract-keywords.mjs   # gom lại số liệu từ khoá từ hub
node _build/export-logo.mjs   # dựng lại logo, favicon, apple-touch, ảnh OG từ _img-src/logo-moi-2026.png
```

Quy trình chuẩn mỗi lần sửa:

```bash
node _build/generate.mjs && node _build/audit.mjs
```

`audit.mjs` thoát mã 1 nếu có lỗi — đừng commit khi còn lỗi.

---

## Deploy

Repo: **github.com/htgroup-spec/bommucmayin-static** (public)
GitHub Pages: nhánh `main`, thư mục gốc. `CNAME` và `.nojekyll` do generate tự sinh.

DNS tại AZDIGI (ns1/ns2.azdigi.com) — **đã cấu hình 02/10/2026**:

```
A      bommucmayin.net.       185.199.108.153        TTL 3600
A      bommucmayin.net.       185.199.109.153        TTL 3600
A      bommucmayin.net.       185.199.110.153        TTL 3600
A      bommucmayin.net.       185.199.111.153        TTL 3600
CNAME  www.bommucmayin.net.   htgroup-spec.github.io TTL 3600
```

> **MX vẫn trỏ về chính tên miền** (`0 bommucmayin.net`) — bản ghi còn lại từ thời chạy
> cPanel. Apex nay là GitHub Pages nên **email @bommucmayin.net không hoạt động**. Nếu cần
> email thì trỏ MX sang dịch vụ mail riêng; nếu không dùng thì xoá bản ghi cho sạch zone.

Khi GitHub báo DNS check xong, bật **Enforce HTTPS** trong Settings → Pages.

Máy này còn lưu credential của một tài khoản GitHub khác, nên remote phải ghi kèm tài khoản:

```
https://htgroup-spec@github.com/htgroup-spec/bommucmayin-static.git
```

---

## Hai trang đích Google Ads — quy tắc riêng, đừng phá

`nap-muc-may-in-van-phong/` và `sua-may-in-van-phong/` **không phải trang SEO**. Chúng chỉ
để chiến dịch `HTquan8` đổ về. Nguồn nội dung: `_data/ads-pages.json`.

| Quy tắc | Vì sao |
|---|---|
| Không có chữ "tại nhà", "hộ gia đình", "hẻm nhỏ" | Google chặn quảng cáo dịch vụ kỹ thuật nhắm **người dùng cá nhân** bằng chính sách `THIRD_PARTY_CONSUMER_TECHNICAL_SUPPORT`. Chính nó làm tài khoản ngừng hiển thị từ 8/2026. Chạy cho doanh nghiệp thì không thuộc diện đó. |
| `noindex, follow`, không vào `sitemap.xml` | Để index thì chúng cạnh tranh với 21 trang SEO đang nhắm đúng cụm "tại nhà" (420 lượt/tháng). |
| 21 trang SEO **giữ nguyên** chữ "tại nhà" | Đó là organic miễn phí, không đụng tới. Tách trang là để quảng cáo và SEO không giẫm chân nhau. |
| Không hứa hoá đơn VAT, không hứa bảo hành linh kiện | Chủ shop chưa xác nhận hai thứ này — xem `_note_facts` trong `ads-pages.json`. |

Google đã tự xác nhận ranh giới khi duyệt từ khoá: cụm trần trụi **"sửa máy in"** và
**"sửa máy in tận nơi"** bị chặn thẳng, còn "sửa máy in gần đây", "sửa máy in canon",
"sửa máy in bình chánh" thì cho qua. Đừng thêm lại hai cụm bị chặn.

Kế hoạch chiến dịch và script dựng nằm ở `AUTOMATION/adsgoogle/`:
`_config/plan_htquan8.js`, `scripts/actions/validate_htquan8.js`, `scripts/actions/build_htquan8.js`.

---

## Ranh giới nội dung với các site anh em

Theo `projects/phan-vung-keyword-2026-07.md` (bảng phân vùng 27/07/2026) và quyết định
01/10/2026:

| Cụm | Chủ quản |
|---|---|
| Dịch vụ nạp mực / sửa máy in **khu Nam** | **site này** |
| Bán hộp mực, drum, linh kiện theo model | mucinminhtien.com |
| Dịch vụ local **khu Đông** (Thủ Đức, Dĩ An, Biên Hoà) | tinhocnamphong.net |
| How-to / lỗi máy in (kho blog) | tinhocnamphong.net |
| Máy in bill / POS / giấy in nhiệt | mucinht.com |

Site này **không** mở trang bán sản phẩm theo model, **không** xây kho how-to, và **không**
viết trang quận ngoài 7 quận huyện khu Nam.

Năm trang `/khu-vuc/` của mucinminhtien.com sẽ 301 về đây — xem `docs/redirects.md`,
**chỉ bật sau khi** các trang khu vực của site này đã được Google index.

---

## Việc còn mở

- [ ] Giao diện: chủ shop sẽ gửi template mẫu để áp vào (sửa `css/`, nội dung không đổi)
- [ ] Ảnh thật: kỹ thuật đang làm, kho mực, bản in trước/sau — hiện site chưa có ảnh nào
- [x] Logo — chủ shop gửi bản chính thức 03/10/2026, bộ nhận diện sinh từ `_build/export-logo.mjs`
- [ ] Ghim Google Maps đúng vị trí rồi mới ghi phường/quận vào địa chỉ (hiện cố ý để trống)
- [ ] Cloudflare + Bulk Redirects để 301 thật (GitHub Pages không làm được)
- [ ] Quyết cụm "cho thuê máy photocopy Quận 7" (50 lượt/tháng) — có làm dịch vụ này không
