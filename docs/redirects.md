# Kế hoạch 301 — bommucmayin.net

> Lập 02/10/2026. Hai việc redirect độc lập nhau, làm được cái nào thì làm trước cái đó.

---

## Vấn đề: GitHub Pages KHÔNG làm được 301 thật

GitHub Pages chỉ phục vụ file tĩnh. Nó không đọc `.htaccess`, không có `_redirects` như
Netlify, và không trả được mã `301 Moved Permanently`. Thứ duy nhất làm được thuần GitHub là
trang HTML `<meta http-equiv="refresh">` — Google có hiểu và truyền phần lớn tín hiệu, nhưng
chậm hơn và yếu hơn 301 thật.

**Cách đúng: đưa domain qua Cloudflare (gói Free) rồi dùng Bulk Redirects.** Cloudflare đứng
trước GitHub Pages, trả 301 thật trước khi request chạm tới GitHub.

---

## Việc 1 — Chuyển 5 trang khu Nam từ mucinminhtien.com sang đây

Theo quyết định 01/10/2026: bommucmayin.net là chủ quản cụm dịch vụ local khu Nam;
mucinminhtien.com quay về bán hộp mực / linh kiện theo model.

| URL cũ (mucinminhtien.com) | → URL mới (bommucmayin.net) |
|---|---|
| `/khu-vuc/quan-8/` | `/khu-vuc/quan-8/` |
| `/khu-vuc/quan-7/` | `/khu-vuc/quan-7/` |
| `/khu-vuc/quan-4/` | `/khu-vuc/quan-4/` |
| `/khu-vuc/binh-chanh/` | `/khu-vuc/binh-chanh/` |
| `/khu-vuc/nha-be/` | `/khu-vuc/nha-be/` |
| `/khu-vuc/chanh-hung/` | `/khu-vuc/quan-8/` (Chánh Hưng thuộc Q8, không mở trang riêng — 0 lượt) |
| `/khu-vuc/` | `/khu-vuc/` |

**Thứ tự làm — quan trọng, đừng đảo:**

1. Đẩy bommucmayin.net lên, chờ 7 trang khu vực được Google index (kiểm bằng
   `site:bommucmayin.net` trong Search Console).
2. Chỉ khi đó mới bật 301 ở mucinminhtien.com. Redirect sang trang Google chưa biết thì
   mất tín hiệu.
3. Sau khi 301 chạy, gỡ link nội bộ trỏ tới `/khu-vuc/` trong menu và footer của
   mucinminhtien, trỏ sang bommucmayin.net bằng anchor tự nhiên.
4. Gửi lại sitemap của cả hai site trong Search Console.

**Lưu ý:** mucinminhtien.com cũng chạy GitHub Pages nên cũng cần Cloudflare để 301 thật.
Nếu chưa muốn đưa qua Cloudflare, dùng tạm meta-refresh (mẫu ở cuối file).

---

## Việc 2 — Hứng URL cũ của site bommucmayin.net đời trước

Site cũ (2/2025 – 1/2026) dùng hai họ URL, Google vẫn còn index:

```
/bom-muc-in-<địa-danh>.html
/sua-may-in-<địa-danh>.html
```

Địa danh ở ba mức: đường+quận, phường+quận, thành phố+tỉnh — trải khắp cả nước, không chỉ
TP.HCM. **Không có danh sách đầy đủ** (Wayback chỉ lưu 4 bản trang chủ, chặn không đọc được
trang con), nên phải dùng regex thay vì liệt kê.

### Quy tắc Cloudflare Bulk Redirect (dùng Regex)

| # | Nguồn (regex) | Đích | Mã |
|---|---|---|---|
| 1 | `^/bom-muc-in-.*quan-8.*\.html$` | `/khu-vuc/quan-8/` | 301 |
| 2 | `^/bom-muc-in-.*quan-7.*\.html$` | `/khu-vuc/quan-7/` | 301 |
| 3 | `^/bom-muc-in-.*quan-6.*\.html$` | `/khu-vuc/quan-6/` | 301 |
| 4 | `^/bom-muc-in-.*quan-5.*\.html$` | `/khu-vuc/quan-5/` | 301 |
| 5 | `^/bom-muc-in-.*quan-4.*\.html$` | `/khu-vuc/quan-4/` | 301 |
| 6 | `^/bom-muc-in-.*binh-chanh.*\.html$` | `/khu-vuc/binh-chanh/` | 301 |
| 7 | `^/bom-muc-in-.*nha-be.*\.html$` | `/khu-vuc/nha-be/` | 301 |
| 8 | `^/sua-may-in-.*\.html$` | `/sua-may-in/` | 301 |
| 9 | `^/bom-muc-in-.*\.html$` | `/nap-muc-may-in-tan-noi/` | 301 |
| 10 | `^/(bom\|nap\|do\|thay)-muc.*\.html$` | `/nap-muc-may-in-tan-noi/` | 301 |

Thứ tự quan trọng: quy tắc hẹp (1–7) phải đứng **trước** quy tắc gom (8–10).

### Vì sao không redirect hết về trang chủ

Hàng nghìn URL ở các tỉnh khác (Bến Tre, Sóc Trăng, Phú Yên, Lâm Đồng…) nay không còn trang
tương ứng — địa bàn mới chỉ còn khu Nam TP.HCM. Dồn hết về trang chủ thì Google coi là
soft 404 hàng loạt, hại hơn là để 404 sạch.

**Cách xử lý đúng:**
- URL thuộc 7 quận đang phục vụ → 301 về đúng trang khu vực (quy tắc 1–7).
- URL dịch vụ chung không rõ địa danh → 301 về trang trụ (quy tắc 8–10).
- URL ở tỉnh khác → **để 404**. Trang `404.html` đã có nội dung hữu ích và link đi tiếp.

Đây là lựa chọn có chủ ý: thà 404 sạch còn hơn giả vờ có nội dung mà không có.

---

## Lớp đỡ tạm khi chưa có Cloudflare

File `404.html` đã nhúng sẵn một đoạn JS: nếu đường dẫn khớp mẫu URL cũ, nó tự chuyển sang
trang phù hợp. **Đây chỉ là tiện cho người dùng thật, không thay được 301** — Google vẫn
thấy mã 404.

Nếu cần redirect vài URL cụ thể mà chưa có Cloudflare, tạo file HTML tĩnh dạng này:

```html
<!DOCTYPE html>
<html lang="vi"><head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=https://bommucmayin.net/khu-vuc/quan-8/">
<link rel="canonical" href="https://bommucmayin.net/khu-vuc/quan-8/">
<meta name="robots" content="noindex, follow">
<title>Đang chuyển trang…</title>
</head><body>
<p>Trang đã chuyển sang <a href="https://bommucmayin.net/khu-vuc/quan-8/">bommucmayin.net/khu-vuc/quan-8/</a></p>
</body></html>
```

---

## Checklist sau khi bật redirect

- [ ] Thêm cả `bommucmayin.net` và `www.bommucmayin.net` vào Search Console
- [ ] Gửi `https://bommucmayin.net/sitemap.xml`
- [ ] Kiểm vài URL cũ bằng `curl -I` — phải thấy `301`, không phải `200` hay `302`
- [ ] Theo dõi báo cáo Coverage 2–4 tuần, xem số trang 404 có giảm không
- [ ] Sau khi mucinminhtien 301 xong, kiểm trang `/khu-vuc/` của nó không còn tự index
