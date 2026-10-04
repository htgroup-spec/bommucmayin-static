# Nhật ký gửi index Google Search Console — bommucmayin.net

- **Tài khoản:** dongocvu@gmail.com (Chrome "Profile 4", tên hiển thị "vu")
- **Property:** `sc-domain:bommucmayin.net` (Domain property)
- **Hạn mức:** Google giới hạn ~10-12 URL/ngày/property. Hôm nay gửi được **6 URL** thì báo "Đã vượt hạn ngạch".
- **Cách gửi:** GSC → ô "Kiểm tra mọi URL" trên cùng → dán URL → Enter → bấm "YÊU CẦU LẬP CHỈ MỤC" → chờ ~40 giây → "Đã yêu cầu lập chỉ mục".

---

## Ngày 2026-10-04 — đã gửi 6/21 URL

| # | URL | Trạng thái trước khi gửi | Kết quả |
|---|-----|--------------------------|---------|
| 1 | /khu-vuc/quan-4/ | ❗ **Chưa được lập chỉ mục** | ✅ Đã gửi |
| 2 | / (trang chủ) | Đã lập chỉ mục | ✅ Đã gửi |
| 3 | /nap-muc-may-in-tan-noi/ | Đã lập chỉ mục | ✅ Đã gửi |
| 4 | /sua-may-in/ | Đã lập chỉ mục | ✅ Đã gửi |
| 5 | /bang-gia/ | Đã lập chỉ mục | ✅ Đã gửi |
| 6 | /khu-vuc/ | Đã lập chỉ mục | ✅ Đã gửi |
| — | /khu-vuc/quan-7/ | Đã lập chỉ mục | ⛔ **Hết hạn ngạch** — dừng tại đây |

**Việc khác đã làm (không tốn hạn ngạch):**
- Gửi lại sitemap `https://bommucmayin.net/sitemap.xml` → "Đã gửi sơ đồ trang web thành công" (xem mục Vấn đề bên dưới).

---

## Hàng đợi cho ngày mai (2026-10-05) — 15 URL

Gửi theo thứ tự này, tất cả đều **đã được index sẵn** nên chỉ là yêu cầu Google thu thập lại:

1. https://bommucmayin.net/khu-vuc/quan-7/
2. https://bommucmayin.net/khu-vuc/quan-8/
3. https://bommucmayin.net/khu-vuc/quan-5/
4. https://bommucmayin.net/khu-vuc/quan-6/
5. https://bommucmayin.net/khu-vuc/phu-my-hung/
6. https://bommucmayin.net/khu-vuc/binh-chanh/
7. https://bommucmayin.net/khu-vuc/nha-be/
8. https://bommucmayin.net/cau-hoi-thuong-gap/
9. https://bommucmayin.net/lien-he/
10. https://bommucmayin.net/kinh-nghiem/
11. https://bommucmayin.net/kinh-nghiem/nap-muc-hay-thay-hop-muc-moi/
12. https://bommucmayin.net/kinh-nghiem/bao-lau-nen-nap-muc-mot-lan/
13. https://bommucmayin.net/kinh-nghiem/dau-hieu-phai-thay-trong-may-in/
14. https://bommucmayin.net/quy-trinh-bao-hanh/
15. https://bommucmayin.net/ve-chung-toi/

---

## Kết quả quét toàn bộ 21 URL trong sitemap

- **20/21 đã được Google lập chỉ mục** ("URL nằm trên Google").
- **1/21 chưa**: `/khu-vuc/quan-4/` — lý do: "Google không xác định được URL", "Không phát hiện sơ đồ trang web giới thiệu nào". Đã gửi index thủ công hôm nay.

## Hai trang KHÔNG gửi index (cố ý)

| URL | Lý do |
|-----|-------|
| /nap-muc-may-in-van-phong/ | Có thẻ `<meta name="robots" content="noindex, follow">` |
| /sua-may-in-van-phong/ | Có thẻ `<meta name="robots" content="noindex, follow">` |

Đây là 2 landing page riêng cho Google Ads, cố ý chặn index organic. Đã thử gửi `/nap-muc-may-in-van-phong/` một lần → Google trả về **"Yêu cầu lập chỉ mục đã bị từ chối — Bị loại trừ bởi thẻ 'noindex'"**. Không gửi lại. Hai trang này cũng không có trong sitemap.xml, như vậy là đúng.

---

## Vấn đề cần xử lý: sitemap chưa bao giờ được Google đọc thành công

Trong mục "Sơ đồ trang web" có **5 sitemap cũ từ website trước đây trên domain này**, tất cả đều báo đỏ **"Không thể tìm nạp"**, **0 trang được khám phá**:

| Sitemap | Ngày gửi | Lần đọc cuối |
|---------|----------|--------------|
| http://bommucmayin.net/sitemap.xml | 13/10/2024 | 19/4/2025 |
| https://bommucmayin.net/sitemap.xml | 11/4/2022 | 21/4/2025 |
| https://bommucmayin.net/dich-vu-may-tinh-laptop/ | 3/4/2022 | 31/10/2024 |
| http://bommucmayin.net/dich-vu-may-tinh-laptop/ | 3/4/2022 | 31/10/2024 |
| https://bommucmayin.net/thu-mua-laptop-cu-thu-duc-ho-chi-minh.html | 3/4/2022 | 29/1/2025 |

Đã kiểm tra: `https://bommucmayin.net/sitemap.xml` hiện trả về **HTTP 200, application/xml, 3.783 byte** — hoàn toàn bình thường. Trạng thái "Không thể tìm nạp" là tồn đọng từ lần đọc tháng 4/2025, trước khi site mới lên.

**Đã làm:** gửi lại `https://bommucmayin.net/sitemap.xml` ngày 4/10/2026. Cột "Đã gửi" đã nhảy sang 4/10/2026, nhưng cột "Lần đọc cuối" vẫn là 21/4/2025 và trạng thái vẫn đỏ — đó là kết quả tồn đọng từ lần đọc cũ, Google chưa fetch lại. Bình thường mất vài giờ đến 1-2 ngày.

**Đã test phía mình, không có lỗi gì:**

| Kiểm tra | Kết quả |
|----------|---------|
| Fetch `https://.../sitemap.xml` với user-agent Googlebot | 200, `application/xml`, 3.783 byte, không redirect |
| Fetch `http://.../sitemap.xml` với user-agent Googlebot | redirect 1 lần sang https → 200 (chuẩn) |
| Nội dung | XML hợp lệ, 21 URL, `lastmod` 2026-10-04 |
| robots.txt | `Allow: /` + khai báo đúng dòng `Sitemap: https://bommucmayin.net/sitemap.xml` |

**Cần theo dõi:** 1-3 ngày sau kiểm tra lại. Nếu vẫn "Không thể tìm nạp" thì phải đào sâu thêm. Nếu chuyển "Thành công" thì nên **xóa 4 sitemap rác còn lại** (3 cái không phải sitemap + bản http) cho sạch báo cáo.
