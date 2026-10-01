/**
 * generate.mjs — sinh toàn bộ site tĩnh cho bommucmayin.net
 *
 * Quy tắc bắt buộc:
 *  1. URL SẠCH — mọi trang là <slug>/index.html, link KHÔNG chứa '.html'.
 *  2. Link TƯƠNG ĐỐI — chạy được cả khi mở local và trên GitHub Pages.
 *  3. Mỗi trang 1 thẻ H1, title/description riêng, canonical tuyệt đối.
 *  4. Số lượt tìm kiếm chỉ đọc từ _data/keywords.json (Google Ads API) — không tự điền.
 *
 * Chạy:  node _build/generate.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8');
const json = p => JSON.parse(read(p));

const S = json('_data/site.json');
const AREAS = json('_data/areas.json').sort((a, b) => a.order - b.order);
const P = json('_data/pages.json');
const KW = existsSync(resolve(ROOT, '_data/keywords.json')) ? json('_data/keywords.json') : { areas: {}, generic: [] };

const MENU_TPL = read('_includes/menu.html');
const FOOTER_TPL = read('_includes/footer.html');

const YEAR = new Date().getFullYear();
const TODAY = new Date().toISOString().slice(0, 10);
const built = [];

// ---------- helpers ----------
const esc = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** Bỏ thực thể HTML để nhét an toàn vào JSON-LD. */
const plain = s => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/<[^>]*>/g, '');
/** prefix tương đối theo độ sâu: 0 -> '', 1 -> '../', 2 -> '../../' */
const pre = d => '../'.repeat(d);
const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ADDR_FULL = `${S.address.street}, ${S.address.locality}`;

// ---------- menu / footer ----------
function navHtml(depth, current) {
  const p = pre(depth);
  return S.nav.map(item => {
    let sub = item.sub || null;
    if (item.subFrom === 'areas') sub = AREAS.map(a => ({ label: a.label, href: `khu-vuc/${a.slug}/` }));
    const cur = current === item.href ? ' aria-current="page"' : '';
    const link = `<a href="${p}${item.href}"${cur}>${item.label}</a>`;
    if (!sub) return `        <li>${link}</li>`;
    const subLis = sub.map(s2 => `            <li><a href="${p}${s2.href}">${s2.label}</a></li>`).join('\n');
    return `        <li class="has-sub">${link}\n          <ul class="sub">\n${subLis}\n          </ul>\n        </li>`;
  }).join('\n');
}

function menu(depth, current) {
  return MENU_TPL
    .replace(/<!--[\s\S]*?-->\s*/, '')
    .replace(/{{NAV}}/g, navHtml(depth, current))
    .replace(/{{P}}/g, pre(depth))
    .replace(/{{HOTLINE}}/g, S.hotline)
    .replace(/{{TEL}}/g, S.hotlineTel)
    .replace(/{{STREET}}/g, ADDR_FULL);
}

function footer(depth) {
  const p = pre(depth);
  const cols = Object.entries(S.footerLinks).map(([h, links]) => {
    const lis = links.map(l => `          <li><a href="${p}${l.href}">${l.label}</a></li>`).join('\n');
    return `      <div>\n        <h3>${h}</h3>\n        <ul>\n${lis}\n        </ul>\n      </div>`;
  }).join('\n');
  const areaLinks = AREAS.map(a =>
    `        <li><a href="${p}khu-vuc/${a.slug}/">${a.label}</a></li>`).join('\n');
  return FOOTER_TPL
    .replace(/<!--[\s\S]*?-->\s*/, '')
    .replace(/{{NAV_COLS}}/g, cols)
    .replace(/{{AREA_LINKS}}/g, areaLinks)
    .replace(/{{P}}/g, p)
    .replace(/{{HOTLINE}}/g, S.hotline)
    .replace(/{{TELRAW}}/g, S.hotlineRaw)
    .replace(/{{TEL}}/g, S.hotlineTel)
    .replace(/{{EMAIL}}/g, S.email)
    .replace(/{{STREET}}/g, ADDR_FULL)
    .replace(/{{LEGAL}}/g, S.legalName)
    .replace(/{{TAXID}}/g, S.taxId)
    .replace(/{{YEAR}}/g, YEAR);
}

// ---------- schema ----------
const localBusiness = () => ({
  '@type': 'LocalBusiness',
  name: `${S.brandFull} — ${S.brandSub}`,
  legalName: S.legalName,
  taxID: S.taxId,
  telephone: S.hotlineTel,
  email: S.email,
  url: S.baseUrl + '/',
  priceRange: S.priceRange,
  address: { '@type': 'PostalAddress', streetAddress: S.address.street, addressLocality: S.address.locality, addressCountry: S.address.country },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '08:00', closes: '17:00' },
  ],
  areaServed: AREAS.filter(a => !a.parent).map(a => ({ '@type': 'AdministrativeArea', name: a.label + ', TP.HCM' })),
});

const faqSchema = faq => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(f => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
});

const crumbSchema = (items, depth) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: plain(it.label),
    ...(it.href !== null ? { item: S.baseUrl + '/' + it.href } : {}),
  })),
});

// ---------- layout ----------
function page({ slug, depth, title, metaDesc, ogTitle, h1, lead, body, crumbs, schemas = [], current = '' }) {
  const p = pre(depth);
  const canonical = S.baseUrl + '/' + (slug ? slug + '/' : '');
  const crumbHtml = crumbs && crumbs.length ? `
<nav class="breadcrumb" aria-label="Đường dẫn">
  <div class="container">
    <ol>
${crumbs.map(c => c.href === null
    ? `      <li aria-current="page">${c.label}</li>`
    : `      <li><a href="${p}${c.href}">${c.label}</a></li>`).join('\n')}
    </ol>
  </div>
</nav>` : '';

  const ld = schemas.map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${attr(title)}</title>
<meta name="description" content="${attr(metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="vi_VN">
<meta property="og:site_name" content="${attr(S.brandFull)}">
<meta property="og:title" content="${attr(ogTitle || title)}">
<meta property="og:description" content="${attr(metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14457f">
<link rel="stylesheet" href="${p}css/style.css">
<link rel="stylesheet" href="${p}css/responsive.css">
${ld}
</head>
<body>
${menu(depth, current)}
${crumbHtml}
<main id="main-content">
${h1 ? `<section class="section">
  <div class="container">
    <div class="container-narrow" style="padding:0">
      <h1>${h1}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>
  </div>
</section>` : ''}
${body}
</main>
${footer(depth)}
<script src="${p}js/main.js" defer></script>
</body>
</html>
`;
  const dir = slug ? resolve(ROOT, slug) : ROOT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), html, 'utf8');
  built.push({ url: '/' + (slug ? slug + '/' : ''), bytes: html.length });
}

// ---------- blocks ----------
const ctaBand = (depth, h, p2) => `
<section class="cta-band">
  <div class="container">
    <h2>${h}</h2>
    <p>${p2}</p>
    <div class="cta-actions">
      <a class="btn btn-primary btn-lg" href="tel:${S.hotlineTel}">Gọi ${S.hotline}</a>
      <a class="btn btn-ghost btn-lg" href="https://zalo.me/${S.hotlineRaw}" rel="nofollow noopener" target="_blank">Nhắn Zalo</a>
    </div>
  </div>
</section>`;

const linkBox = (depth, icon, h, p2, href, label) => `
<div class="link-box">
  <div class="link-box-icon" aria-hidden="true">${icon}</div>
  <div class="link-box-content"><h4>${h}</h4><p>${p2}</p></div>
  <a class="btn btn-secondary" href="${pre(depth)}${href}">${label}</a>
</div>`;

function faqBlock(faq, title = 'Câu hỏi thường gặp') {
  return `
<section class="section section-alt">
  <div class="container">
    <div class="section-head"><h2>${title}</h2></div>
    <div class="faq">
${faq.map(f => `      <details>
        <summary>${f.q}</summary>
        <div class="faq-body"><p>${f.a}</p></div>
      </details>`).join('\n')}
    </div>
  </div>
</section>`;
}

function priceTables(depth) {
  return S.pricing.map(g => `
    <h3 id="${g.anchor}">${g.group}</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Loại máy / mã hộp mực</th><th>Giá</th><th>Ghi chú</th></tr></thead>
        <tbody>
${g.rows.map(r => `          <tr><td>${r.name}</td><td class="price">${r.price}</td><td class="card-meta">${r.note}</td></tr>`).join('\n')}
        </tbody>
      </table>
    </div>`).join('\n');
}

// ======================= TRANG CHỦ =======================
{
  const d = P.home;
  const body = `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="section-head"><h2>${d.introTitle}</h2></div>
    <div class="prose">${d.intro.map(x => `<p>${x}</p>`).join('\n')}</div>
    ${linkBox(0, '💰', 'Xem bảng giá đầy đủ theo mã hộp mực', 'Laser A4 từ 80.000đ, A3 từ 250.000đ, linh kiện niêm yết rõ từng loại.', 'bang-gia/', 'Xem bảng giá')}
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head">
      <h2>${d.howTitle}</h2>
      <p>Đọc bản in là biết máy cần gì. Dưới đây là sáu triệu chứng gặp nhiều nhất và việc thật sự cần làm.</p>
    </div>
    <div class="grid grid-3">
${d.how.map(x => `      <div class="card"><h3>${x.h}</h3><p>${x.p}</p></div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><h2>Vì sao khách khu Nam gọi chúng tôi</h2></div>
    <div class="grid grid-3">
${S.whyUs.map(w => `      <div class="card"><div class="card-icon" aria-hidden="true">${w.icon}</div><h3>${w.title}</h3><p>${w.text}</p></div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head">
      <h2>Khu vực phục vụ và thời gian tới thật</h2>
      <p>Kho vật tư đặt tại ${S.address.street}. Thời gian dưới đây là khung thật theo khoảng cách, không phải một con số dán cho cả thành phố.</p>
    </div>
    <div class="grid grid-4">
${AREAS.map(a => `      <a class="card card-link" href="khu-vuc/${a.slug}/">
        <h3>${a.label}</h3>
        <p class="card-meta">Kỹ thuật tới trong <strong>${a.eta}</strong></p>
      </a>`).join('\n')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><h2>${d.brandTitle}</h2><p>${d.brandIntro}</p></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Hãng</th><th>Mã hộp mực gặp nhiều</th><th>Lưu ý</th></tr></thead>
        <tbody>
${d.brands.map(b => `          <tr><td><strong>${b.n}</strong></td><td>${b.c}</td><td class="card-meta">${b.note}</td></tr>`).join('\n')}
        </tbody>
      </table>
    </div>
    <p class="table-note">Không thấy máy của anh/chị trong bảng? Gọi ${S.hotline} và đọc tên model — chúng tôi nhận gần như toàn bộ máy in laser và phun mực phổ thông.</p>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head"><h2>Quy trình làm việc</h2><p>Năm bước, và bước nào cũng có thể dừng nếu anh/chị không đồng ý giá.</p></div>
    <ol class="steps">
${S.steps.map(s2 => `      <li class="step"><div class="step-number" aria-hidden="true">${s2.n}</div><h3>${s2.title}</h3><p>${s2.text}</p></li>`).join('\n')}
    </ol>
  </div>
</section>

${faqBlock(S.faq.slice(0, 6))}
${ctaBand(0, 'Máy in đang dừng? Gọi là có người đi ngay', `Kho ở ${S.address.street} — Quận 8, Quận 4, Quận 5, Quận 6 thường 15–40 phút. Xem máy rồi báo giá, anh/chị đồng ý mới tháo.`)}`;

  page({
    slug: '', depth: 0, current: '',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    body,
    schemas: [
      { '@context': 'https://schema.org', ...localBusiness() },
      faqSchema(S.faq.slice(0, 6)),
    ],
  });
}

// ======================= PILLAR NẠP MỰC =======================
{
  const d = P['nap-muc'];
  const sec = d.sections.map((s2, i) => {
    let inner = '';
    if (s2.p) inner += s2.p.map(x => `<p>${x}</p>`).join('\n');
    if (s2.steps) inner += `<ol>\n${s2.steps.map(x => `  <li>${x}</li>`).join('\n')}\n</ol>`;
    return `
<section class="section${i % 2 ? ' section-alt' : ''}">
  <div class="container">
    <div class="prose">
      <h2 id="${slugify(s2.h)}">${s2.h}</h2>
      ${inner}
    </div>
  </div>
</section>`;
  }).join('\n');

  page({
    slug: 'nap-muc-may-in-tan-noi', depth: 1, current: 'nap-muc-may-in-tan-noi/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Nạp mực máy in tận nơi', href: null }],
    body: sec + `
<section class="section">
  <div class="container">
    ${linkBox(1, '💰', 'Giá nạp mực theo từng hãng máy', 'Bảng giá công khai theo mã hộp mực, đã gồm công đi lại và vệ sinh buồng mực.', 'bang-gia/', 'Xem bảng giá')}
    ${linkBox(1, '📍', 'Anh/chị ở quận nào?', 'Mỗi khu có khung thời gian tới khác nhau — xem trang khu vực của mình để biết trước.', 'khu-vuc/', 'Chọn khu vực')}
  </div>
</section>
${faqBlock(S.faq.slice(0, 5))}
${ctaBand(1, 'Đặt nạp mực tận nơi', 'Đọc dòng máy và địa chỉ, chúng tôi báo khung giá ngay trong cuộc gọi.')}`,
    schemas: [
      { '@context': 'https://schema.org', '@type': 'Service', name: 'Nạp mực máy in tận nơi', serviceType: 'Nạp mực, bơm mực, thay mực máy in tận nơi', description: plain(d.metaDesc), provider: localBusiness(), areaServed: AREAS.filter(a => !a.parent).map(a => ({ '@type': 'AdministrativeArea', name: a.label + ', TP.HCM' })) },
      faqSchema(S.faq.slice(0, 5)),
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Nạp mực máy in tận nơi', href: 'nap-muc-may-in-tan-noi/' }]),
    ],
  });
}

// ======================= SỬA MÁY IN =======================
{
  const d = P['sua-may-in'];
  const sec = d.sections.map((s2, i) => {
    let inner = '';
    if (s2.p) inner += s2.p.map(x => `<p>${x}</p>`).join('\n');
    if (s2.table) inner += `
<div class="table-wrap">
  <table>
    <thead><tr><th>Triệu chứng</th><th>Nguyên nhân thường gặp</th><th>Xử lý ở đâu</th></tr></thead>
    <tbody>
${s2.table.map(r => `      <tr><td>${r.a}</td><td class="card-meta">${r.b}</td><td>${r.c}</td></tr>`).join('\n')}
    </tbody>
  </table>
</div>`;
    return `
<section class="section${i % 2 ? ' section-alt' : ''}">
  <div class="container">
    <div class="${s2.table ? '' : 'prose'}">
      <h2 id="${slugify(s2.h)}">${s2.h}</h2>
      ${inner}
    </div>
  </div>
</section>`;
  }).join('\n');

  page({
    slug: 'sua-may-in', depth: 1, current: 'sua-may-in/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Sửa máy in tận nơi', href: null }],
    body: sec + `
<section class="section">
  <div class="container">
    ${linkBox(1, '🖨', 'Chỉ cần nạp mực thôi?', 'Nếu bản in chỉ nhạt dần đều cả trang thì đó là hết mực — xem quy trình nạp mực 7 bước.', 'nap-muc-may-in-tan-noi/', 'Xem quy trình')}
  </div>
</section>
${ctaBand(1, 'Máy in hỏng giữa giờ làm?', 'Gọi và mô tả triệu chứng. Kỹ thuật mang vật tư theo để xử lý trong cùng một lượt đi.')}`,
    schemas: [
      { '@context': 'https://schema.org', '@type': 'Service', name: 'Sửa máy in tận nơi', serviceType: 'Sửa chữa máy in tại nhà, tại công ty', description: plain(d.metaDesc), provider: localBusiness() },
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Sửa máy in tận nơi', href: 'sua-may-in/' }]),
    ],
  });
}

// ======================= BẢNG GIÁ =======================
{
  const d = P['bang-gia'];
  page({
    slug: 'bang-gia', depth: 1, current: 'bang-gia/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Bảng giá', href: null }],
    body: `
<section class="section" style="padding-top:0">
  <div class="container">
${priceTables(1)}
    <h3>Điều cần biết về giá</h3>
    <ul>
${S.pricingNotes.map(n => `      <li>${n}</li>`).join('\n')}
    </ul>
    ${linkBox(1, '📍', 'Giá có khác nhau theo quận không?', 'Không. Giá như nhau cho cả bảy quận huyện — chỉ thời gian tới là khác, do khoảng cách.', 'khu-vuc/', 'Xem khu vực')}
  </div>
</section>
${faqBlock([S.faq[1], S.faq[2], S.faq[5]])}
${ctaBand(1, 'Cần báo giá cho đúng máy của anh/chị?', 'Đọc dòng máy qua điện thoại hoặc chụp nhãn hộp mực gửi Zalo — chúng tôi báo con số cụ thể.')}`,
    schemas: [
      { '@context': 'https://schema.org', ...localBusiness() },
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Bảng giá', href: 'bang-gia/' }]),
    ],
  });
}

// ======================= QUY TRÌNH & BẢO HÀNH =======================
{
  const d = P['quy-trinh'];
  const sec = d.sections.map((s2, i) => {
    let inner = '';
    if (s2.p) inner += s2.p.map(x => `<p>${x}</p>`).join('\n');
    if (s2.list) inner += `<ul>\n${s2.list.map(x => `  <li>${x}</li>`).join('\n')}\n</ul>`;
    return `
<section class="section${i % 2 ? ' section-alt' : ''}">
  <div class="container"><div class="prose"><h2 id="${slugify(s2.h)}">${s2.h}</h2>${inner}</div></div>
</section>`;
  }).join('\n');

  page({
    slug: 'quy-trinh-bao-hanh', depth: 1, current: 'quy-trinh-bao-hanh/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Quy trình & bảo hành', href: null }],
    body: `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="section-head"><h2>Năm bước kỹ thuật làm tại nhà anh/chị</h2></div>
    <ol class="steps">
${S.steps.map(s2 => `      <li class="step"><div class="step-number" aria-hidden="true">${s2.n}</div><h3>${s2.title}</h3><p>${s2.text}</p></li>`).join('\n')}
    </ol>
  </div>
</section>
${sec}
${ctaBand(1, 'Cần bảo hành hoặc đặt lịch mới?', `Gọi ${S.hotline} và đọc số phiếu, hoặc chỉ cần nói địa chỉ và dòng máy.`)}`,
    schemas: [crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Quy trình & bảo hành', href: 'quy-trinh-bao-hanh/' }])],
  });
}

// ======================= VỀ CHÚNG TÔI =======================
{
  const d = P['ve-chung-toi'];
  const sec = d.sections.map((s2, i) => {
    let inner = '';
    if (s2.p) inner += s2.p.map(x => `<p>${x}</p>`).join('\n');
    if (s2.list) inner += `<ul>\n${s2.list.map(x => `  <li>${x}</li>`).join('\n')}\n</ul>`;
    return `
<section class="section${i % 2 ? ' section-alt' : ''}">
  <div class="container"><div class="prose"><h2 id="${slugify(s2.h)}">${s2.h}</h2>${inner}</div></div>
</section>`;
  }).join('\n');

  page({
    slug: 've-chung-toi', depth: 1,
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Về chúng tôi', href: null }],
    body: sec + ctaBand(1, 'Cần hợp đồng bảo trì cho công ty?', 'Gửi danh sách máy, chúng tôi báo giá bằng văn bản để anh/chị trình kế toán.'),
    schemas: [
      { '@context': 'https://schema.org', ...localBusiness() },
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Về chúng tôi', href: 've-chung-toi/' }]),
    ],
  });
}

// ======================= LIÊN HỆ =======================
{
  const d = P['lien-he'];
  page({
    slug: 'lien-he', depth: 1, current: 'lien-he/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Liên hệ', href: null }],
    body: `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="split">
      <div>
${d.tips.map(t => `        <h2>${t.h}</h2>\n        <ul>\n${t.list.map(x => `          <li>${x}</li>`).join('\n')}\n        </ul>`).join('\n')}
      </div>
      <div class="card">
        <h3>Thông tin liên hệ</h3>
        <p><strong>Gọi / Zalo</strong><br><a href="tel:${S.hotlineTel}" style="font-size:1.3rem;font-weight:750">${S.hotline}</a></p>
        <p><strong>Email</strong><br><a href="mailto:${S.email}">${S.email}</a></p>
        <p><strong>Kho vật tư</strong><br>${ADDR_FULL}</p>
        <p><strong>Giờ làm việc</strong><br>${S.hours}</p>
        <p><strong>Pháp nhân</strong><br>${S.legalName}<br>MST ${S.taxId}</p>
        <a class="btn btn-primary btn-block" href="tel:${S.hotlineTel}">Gọi ngay</a>
      </div>
    </div>
  </div>
</section>
${ctaBand(1, 'Gọi là có người bắt máy', 'Trong giờ làm việc chúng tôi bắt máy trực tiếp, không qua tổng đài tự động.')}`,
    schemas: [
      { '@context': 'https://schema.org', ...localBusiness() },
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Liên hệ', href: 'lien-he/' }]),
    ],
  });
}

// ======================= FAQ =======================
{
  const d = P['faq-page'];
  page({
    slug: 'cau-hoi-thuong-gap', depth: 1,
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Câu hỏi thường gặp', href: null }],
    body: faqBlock(S.faq, 'Toàn bộ câu hỏi') + ctaBand(1, 'Câu của anh/chị không có ở đây?', `Gọi ${S.hotline} — chúng tôi trả lời trực tiếp, không cần để lại thông tin.`),
    schemas: [
      faqSchema(S.faq),
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Câu hỏi thường gặp', href: 'cau-hoi-thuong-gap/' }]),
    ],
  });
}

// ======================= HUB KHU VỰC =======================
{
  const d = P['khu-vuc'];
  page({
    slug: 'khu-vuc', depth: 1, current: 'khu-vuc/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Khu vực phục vụ', href: null }],
    body: `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2 id="gan-day">${d.nearTitle}</h2>
${d.near.map(x => `      <p>${x}</p>`).join('\n')}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head"><h2>Bảy quận huyện và thời gian tới</h2></div>
    <div class="grid grid-2">
${AREAS.map(a => `      <a class="card card-link" href="${a.slug}/">
        <h3>${a.label}</h3>
        <p class="card-meta">Kỹ thuật tới trong <strong>${a.eta}</strong></p>
        <p>${plain(a.intro[0]).slice(0, 150)}…</p>
      </a>`).join('\n')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${linkBox(1, '💰', 'Giá như nhau cho cả bảy khu', 'Chúng tôi không tính giá khác theo quận. Chỉ thời gian tới là khác, do khoảng cách thật.', 'bang-gia/', 'Xem bảng giá')}
  </div>
</section>
${ctaBand(1, 'Không thấy khu của anh/chị?', 'Gọi và cho biết địa chỉ — nếu ngoài địa bàn, chúng tôi nói thẳng thay vì nhận rồi để anh/chị chờ.')}`,
    schemas: [
      { '@context': 'https://schema.org', ...localBusiness() },
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Khu vực phục vụ', href: 'khu-vuc/' }]),
    ],
  });
}

// ======================= TRANG KHU VỰC =======================
for (const a of AREAS) {
  const kwData = KW.areas?.[a.slug];
  const kwList = kwData?.keywords?.slice(0, 8) || [];
  const others = AREAS.filter(x => x.slug !== a.slug).slice(0, 5);

  const body = `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="split">
      <div class="prose" style="max-width:none">
${a.intro.map(x => `        <p>${x}</p>`).join('\n')}
      </div>
      <div class="card">
        <h3>Thông tin nhanh — ${a.label}</h3>
        <div class="table-wrap" style="border:0">
          <table style="min-width:0">
            <tbody>
              <tr><td>Thời gian tới</td><td><strong>${a.eta}</strong></td></tr>
              <tr><td>Nạp mực laser A4</td><td class="price">từ 80.000đ</td></tr>
              <tr><td>Máy A3 / photocopy</td><td class="price">từ 250.000đ</td></tr>
              <tr><td>Phun mực hệ bình</td><td class="price">từ 150.000đ</td></tr>
              <tr><td>Giờ làm việc</td><td>08:00 – 19:00</td></tr>
              <tr><td>Hoá đơn VAT</td><td>Có</td></tr>
            </tbody>
          </table>
        </div>
        <a class="btn btn-primary btn-block" href="tel:${S.hotlineTel}">Gọi ${S.hotline}</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="prose">
      <h2 id="cach-goi">${a.verbBlockTitle}</h2>
${a.verbBlock.map(x => `      <p>${x}</p>`).join('\n')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><h2 id="khu-nhan">${a.coverageTitle}</h2></div>
    <div class="grid grid-2">
${a.coverage.map(c => `      <div class="card" style="padding:16px 20px"><p class="mb-0">${c}</p></div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head"><h2 id="dac-diem">${a.localTitle}</h2></div>
    <div class="grid grid-3">
${a.local.map(l => `      <div class="card"><h3>${l.h}</h3><p>${l.p}</p></div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${linkBox(2, '💰', 'Bảng giá đầy đủ theo mã hộp mực', 'Giá như nhau cho cả bảy khu — chỉ thời gian tới là khác.', 'bang-gia/', 'Xem bảng giá')}
    ${linkBox(2, '🔧', 'Máy hỏng chứ không chỉ hết mực?', 'Xem bảng triệu chứng – nguyên nhân để biết việc nào xử lý được ngay tại chỗ.', 'sua-may-in/', 'Xem sửa máy in')}
  </div>
</section>

${faqBlock(a.faq, `Câu hỏi thường gặp — khách ${a.label}`)}

<section class="section">
  <div class="container">
    <div class="section-head"><h2>Khu vực lân cận</h2></div>
    <ul class="chips">
${others.map(o => `      <li><a href="../${o.slug}/">${o.label}</a></li>`).join('\n')}
      <li><a href="../">Xem tất cả khu vực</a></li>
    </ul>
  </div>
</section>
${ctaBand(2, `Đặt nạp mực tận nơi ${a.label}`, `Kỹ thuật tới trong ${a.eta}. Xem máy rồi báo giá, anh/chị đồng ý mới tháo.`)}`;

  const crumbs = [{ label: 'Trang chủ', href: '' }, { label: 'Khu vực', href: 'khu-vuc/' }, { label: a.label, href: null }];
  page({
    slug: `khu-vuc/${a.slug}`, depth: 2, current: 'khu-vuc/',
    title: a.title, metaDesc: a.metaDesc, ogTitle: a.ogTitle, h1: a.h1,
    lead: `Kho vật tư đặt tại ${S.address.street}. Kỹ thuật tới ${a.label} trong <strong>${a.eta}</strong> — xem máy rồi báo giá, anh/chị đồng ý thì mới tháo.`,
    crumbs, body,
    schemas: [
      {
        '@context': 'https://schema.org', '@type': 'Service',
        name: `Nạp mực và sửa máy in tận nơi ${a.label}, TP.HCM`,
        serviceType: 'Nạp mực máy in, sửa máy in tận nơi',
        description: plain(a.metaDesc),
        provider: localBusiness(),
        areaServed: { '@type': 'AdministrativeArea', name: `${a.label}, TP. Hồ Chí Minh` },
        offers: { '@type': 'Offer', priceCurrency: 'VND', price: '80000', description: 'Nạp mực máy in laser A4, đã gồm công đi lại và vệ sinh buồng mực' },
      },
      faqSchema(a.faq),
      crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Khu vực', href: 'khu-vuc/' }, { label: a.label, href: `khu-vuc/${a.slug}/` }]),
    ],
  });
  if (kwList.length) a._kwCovered = kwList;
}

// ======================= BLOG =======================
{
  const d = P.blog;
  page({
    slug: 'kinh-nghiem', depth: 1, current: 'kinh-nghiem/',
    title: d.title, metaDesc: d.metaDesc, ogTitle: d.ogTitle, h1: d.h1, lead: d.lead,
    crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Kinh nghiệm', href: null }],
    body: `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="grid grid-3">
${d.posts.map(po => `      <a class="card card-link" href="${po.slug}/">
        <h3>${po.title}</h3>
        <p>${po.excerpt}</p>
      </a>`).join('\n')}
    </div>
  </div>
</section>
${ctaBand(1, 'Đọc rồi vẫn không chắc?', 'Chụp ảnh bản in bị lỗi gửi Zalo — nhìn ảnh chẩn đoán nhanh hơn nghe mô tả.')}`,
    schemas: [crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Kinh nghiệm', href: 'kinh-nghiem/' }])],
  });

  for (const po of d.posts) {
    const bodyHtml = po.body.map(b => {
      let inner = '';
      if (b.p) inner += b.p.map(x => `<p>${x}</p>`).join('\n');
      if (b.list) inner += `<ul>\n${b.list.map(x => `  <li>${x}</li>`).join('\n')}\n</ul>`;
      return `      <h2 id="${slugify(b.h)}">${b.h}</h2>\n${inner}`;
    }).join('\n');

    const toc = po.body.map(b => `        <li><a href="#${slugify(b.h)}">${b.h}</a></li>`).join('\n');
    const rel = d.posts.filter(x => x.slug !== po.slug);

    page({
      slug: `kinh-nghiem/${po.slug}`, depth: 2, current: 'kinh-nghiem/',
      title: po.title, metaDesc: po.metaDesc, ogTitle: po.title, h1: po.h1, lead: po.lead,
      crumbs: [{ label: 'Trang chủ', href: '' }, { label: 'Kinh nghiệm', href: 'kinh-nghiem/' }, { label: po.h1, href: null }],
      body: `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <nav class="toc" aria-label="Nội dung bài">
        <h2>Nội dung</h2>
        <ol>
${toc}
        </ol>
      </nav>
${bodyHtml}
    </div>
    ${linkBox(2, '📞', 'Cần kỹ thuật xem trực tiếp?', `Gọi ${S.hotline}. Kỹ thuật xem máy rồi báo giá, anh/chị đồng ý thì mới làm.`, 'lien-he/', 'Liên hệ')}
    <div class="section-head" style="margin-top:48px"><h2>Bài liên quan</h2></div>
    <ul class="chips">
${rel.map(r => `      <li><a href="../${r.slug}/">${r.title}</a></li>`).join('\n')}
    </ul>
  </div>
</section>
${ctaBand(2, 'Đặt nạp mực hoặc sửa máy in', 'Khu Nam TP.HCM — xem máy rồi báo giá, bảo hành theo số trang in.')}`,
      schemas: [
        {
          '@context': 'https://schema.org', '@type': 'Article',
          headline: plain(po.title), description: plain(po.metaDesc),
          datePublished: TODAY, dateModified: TODAY,
          author: { '@type': 'Organization', name: S.legalName },
          publisher: { '@type': 'Organization', name: S.brandFull },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${S.baseUrl}/kinh-nghiem/${po.slug}/` },
        },
        crumbSchema([{ label: 'Trang chủ', href: '' }, { label: 'Kinh nghiệm', href: 'kinh-nghiem/' }, { label: po.h1, href: `kinh-nghiem/${po.slug}/` }]),
      ],
    });
  }
}

// ======================= 404 =======================
{
  const oldMap = AREAS.filter(a => !a.parent).map(a => `    { re: /${a.slug.replace(/-/g, '[-_]?')}/i, to: '/khu-vuc/${a.slug}/' },`).join('\n');
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Không tìm thấy trang — ${S.brandFull}</title>
<meta name="robots" content="noindex, follow">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/responsive.css">
</head>
<body>
<main id="main-content">
  <section class="section">
    <div class="container container-narrow">
      <h1>Không tìm thấy trang này</h1>
      <p class="lead">Trang anh/chị vừa mở không còn tồn tại. Site đã được dựng lại, một số đường dẫn cũ đã thay đổi.</p>
      <p id="redirect-note" class="muted"></p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="/">Về trang chủ</a>
        <a class="btn btn-ghost" href="/khu-vuc/">Chọn khu vực</a>
        <a class="btn btn-ghost" href="/bang-gia/">Bảng giá</a>
      </div>
      <h2>Trang hay dùng</h2>
      <ul>
        <li><a href="/nap-muc-may-in-tan-noi/">Nạp mực máy in tận nơi</a></li>
        <li><a href="/sua-may-in/">Sửa máy in tận nơi</a></li>
        <li><a href="/bang-gia/">Bảng giá nạp mực</a></li>
        <li><a href="/cau-hoi-thuong-gap/">Câu hỏi thường gặp</a></li>
        <li><a href="/lien-he/">Liên hệ — ${S.hotline}</a></li>
      </ul>
    </div>
  </section>
</main>
<script>
/* Dự phòng cho đường dẫn cũ dạng /bom-muc-in-<địa-danh>.html của site trước.
   Đây CHỈ là lớp đỡ phía client; 301 thật phải cấu hình ở Cloudflare —
   xem docs/redirects.md. */
(function () {
  var p = decodeURIComponent(location.pathname);
  if (!/^\\/(bom|nap|do|thay)[-_]muc|^\\/sua[-_]may[-_]in/i.test(p)) return;
  var map = [
${oldMap}
  ];
  var hit = map.find(function (m) { return m.re.test(p); });
  var to = hit ? hit.to : (/sua[-_]may[-_]in/i.test(p) ? '/sua-may-in/' : '/nap-muc-may-in-tan-noi/');
  var el = document.getElementById('redirect-note');
  if (el) el.textContent = 'Đang chuyển sang trang phù hợp…';
  location.replace(to);
})();
</script>
</body>
</html>
`;
  writeFileSync(resolve(ROOT, '404.html'), html, 'utf8');
}

// ======================= sitemap / robots / hạ tầng =======================
{
  const urls = built.map(b => {
    const priority = b.url === '/' ? '1.0' : b.url.startsWith('/khu-vuc/') && b.url !== '/khu-vuc/' ? '0.8'
      : /^\/(nap-muc-may-in-tan-noi|sua-may-in|bang-gia|khu-vuc)\/$/.test(b.url) ? '0.9' : '0.6';
    return `  <url>\n    <loc>${S.baseUrl}${b.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');
  writeFileSync(resolve(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');

  writeFileSync(resolve(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${S.baseUrl}/sitemap.xml\n`, 'utf8');

  writeFileSync(resolve(ROOT, 'CNAME'), `${S.domain}\n`, 'utf8');
  writeFileSync(resolve(ROOT, '.nojekyll'), '', 'utf8');
}

// ---------- báo cáo ----------
console.log(`Đã sinh ${built.length} trang:\n`);
built.sort((a, b) => a.url.localeCompare(b.url))
  .forEach(b => console.log('  ' + b.url.padEnd(42) + (b.bytes / 1024).toFixed(1).padStart(7) + ' KB'));
console.log(`\nsitemap.xml · robots.txt · CNAME · .nojekyll · 404.html`);
console.log(`Tổng: ${(built.reduce((s, b) => s + b.bytes, 0) / 1024).toFixed(0)} KB HTML`);
