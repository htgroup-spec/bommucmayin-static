/**
 * symptom-figures.mjs — Hình SVG cho 6 trang hướng dẫn theo triệu chứng (đợt thử Ads 05/11/2026).
 * Vẽ bằng code để nhẹ, nét trên mọi màn hình và không phải ảnh giả: đây là hình MINH HOẠ, trang ghi rõ như vậy.
 *   sample(id)  mẫu bản in hoặc màn hình báo lỗi, khung 120×160, để khách đặt cạnh tờ giấy của mình mà so
 *   printerPath(hl)  sơ đồ đường giấy, tô màu các bộ phận trong mảng hl
 *   diagram(id) hình thao tác riêng của từng bài
 * Chữ trong hình cũng bị kiểm BANNED_SYMPTOM ở generate.mjs.
 */

const INK = '#2a2a2a', MUTED = '#8a8a8a', LINE = '#d5d9df', ACC = '#0b57b8', HOT = '#d9480f', OK = '#2b8a3e', BAD = '#c92a2a';
let uid = 0;
const svg = (w, h, label, body, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;

// ---------- mẫu bản in ----------
const TEXT_W = [72, 92, 84, 96, 66, 90, 80, 94, 58, 88, 76, 92, 70];
function textLines(fill, opacity = 1) {
  const top = `<rect x="12" y="13" width="46" height="6" fill="${fill}" opacity="${opacity}"/>`;
  const rows = TEXT_W.map((w, i) => `<rect x="12" y="${28 + i * 9.4}" width="${w}" height="4" fill="${fill}" opacity="${opacity}"/>`).join('');
  return top + rows;
}
const sheet = (inner, bg = '#fff') => `<rect x=".5" y=".5" width="119" height="159" rx="2" fill="${bg}" stroke="${LINE}"/>${inner}`;
const SPECKS = [[20, 40], [35, 95], [60, 22], [88, 60], [100, 120], [48, 140], [76, 104], [16, 118], [104, 30], [66, 72], [28, 66], [92, 148]];

const S = {
  'mo-deu': () => sheet(textLines(INK, 0.28)),
  'mo-nhat': () => sheet(textLines(INK, 0.45)),
  'mo-ben': () => { const id = `g${++uid}`; return `<defs><linearGradient id="${id}"><stop offset=".35" stop-color="${INK}"/><stop offset=".95" stop-color="${INK}" stop-opacity=".08"/></linearGradient></defs>` + sheet(textLines(`url(#${id})`)).replace(/width="(\d+)" height="4"/g, 'width="$1" height="4.01"'); },
  'mo-nen': () => sheet(textLines('#444'), '#d4d4d4'),
  'mo-nap': () => sheet(textLines(INK, 0.5) + `<rect x="30" y="0" width="16" height="160" fill="#fff" opacity=".6"/><rect x="74" y="0" width="22" height="160" fill="#fff" opacity=".5"/>`),
  'soc-doc': () => sheet(textLines(INK) + `<rect x="80" y="1" width="3.5" height="158" fill="#111"/>`),
  'soc-ngang': () => sheet(textLines(INK) + [38, 88, 138].map((y) => `<rect x="1" y="${y}" width="118" height="4" fill="#111" opacity=".8"/>`).join('')),
  'vach-trang': () => sheet(textLines(INK) + `<rect x="54" y="1" width="6" height="158" fill="#fff"/>`),
  'soc-nen': () => sheet(textLines('#444') + [22, 47, 71, 96].map((x) => `<rect x="${x}" y="1" width="1.6" height="158" fill="#777" opacity=".7"/>`).join(''), '#dcdcdc'),
  'soc-phun': () => { const id = `g${++uid}`; return `<defs><linearGradient id="${id}" x2="1" y2="1"><stop stop-color="#1c7ed6"/><stop offset=".5" stop-color="#e64980"/><stop offset="1" stop-color="#fcc419"/></linearGradient></defs>` + sheet(`<rect x="10" y="12" width="100" height="136" fill="url(#${id})"/>` + Array.from({ length: 14 }, (_, i) => `<rect x="10" y="${16 + i * 9.6}" width="100" height="2" fill="#fff" opacity=".85"/>`).join('')); },
  'lem-bong': () => { const id = `b${++uid}`; return `<defs><filter id="${id}"><feGaussianBlur stdDeviation="1"/></filter></defs>` + sheet(textLines(INK) + `<g filter="url(#${id})"><path d="M14 64 L108 92" stroke="#555" stroke-width="11" opacity=".55"/></g>`); },
  'lem-khap': () => sheet(textLines(INK) + SPECKS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#333" opacity=".7"/>`).join(''), '#eeeeee'),
  'lem-dai': () => { const id = `b${++uid}`; return `<defs><filter id="${id}"><feGaussianBlur stdDeviation="2.5"/></filter></defs>` + sheet(textLines(INK) + `<rect x="90" y="-4" width="20" height="168" fill="#222" opacity=".5" filter="url(#${id})"/>`); },
  'lem-sau': () => sheet([30, 80, 130].map((y) => `<ellipse cx="34" cy="${y}" rx="11" ry="4" fill="#555" opacity=".45"/><ellipse cx="86" cy="${y}" rx="11" ry="4" fill="#555" opacity=".45"/>`).join('')),
  'lem-am': () => { const id = `b${++uid}`; return `<defs><filter id="${id}"><feGaussianBlur stdDeviation="1.3"/></filter></defs>` + sheet(`<g filter="url(#${id})">${textLines(INK, 0.8)}</g>`); },
  'ket-nhan': () => `<path d="M14 18 L34 10 L52 20 L72 8 L92 18 L108 12 L102 62 L112 104 L100 150 L78 140 L56 152 L34 142 L14 150 L20 104 L10 62 Z" fill="#fff" stroke="${MUTED}" stroke-width="1.5"/><path d="M34 10 L42 62 L24 150 M72 8 L66 70 L82 142 M10 62 L60 72 L102 62 M20 104 L66 96 L112 104" fill="none" stroke="${LINE}" stroke-width="1.5"/>`,
  'ket-keo': () => `<rect x="20" y="58" width="80" height="62" fill="#fff" stroke="${MUTED}"/><rect x="10" y="118" width="100" height="24" rx="3" fill="#e9ecef" stroke="${MUTED}"/><circle cx="60" cy="38" r="20" fill="#adb5bd" stroke="${INK}" stroke-width="2"/><circle cx="60" cy="38" r="5" fill="${INK}"/><path d="M94 18 L114 38 M114 18 L94 38" stroke="${BAD}" stroke-width="4"/>`,
  'ket-nhieu': () => [0, 1, 2].map((i) => `<rect x="${16 + i * 11}" y="${16 + i * 13}" width="74" height="104" fill="#fff" stroke="${MUTED}"/>`).join(''),
  'ket-manh': () => `<rect x="12" y="20" width="96" height="120" rx="6" fill="#343a40"/><path d="M42 74 l20 -6 l6 16 l-14 12 l-16 -8 z" fill="#fff"/><path d="M72 46 l11 3 l-3 12 l-12 -4 z" fill="#fff"/><circle cx="58" cy="82" r="30" fill="none" stroke="#ffd43b" stroke-width="3"/><path d="M80 104 L100 128" stroke="#ffd43b" stroke-width="5"/>`,
  'ket-bat': () => `<rect x="10" y="44" width="100" height="74" rx="6" fill="#dee2e6" stroke="${MUTED}"/><rect x="24" y="30" width="72" height="16" fill="#fff" stroke="${MUTED}"/><rect x="22" y="118" width="76" height="16" fill="#fff" stroke="${MUTED}"/><path d="M60 58 L84 100 H36 Z" fill="#ffd43b" stroke="${INK}" stroke-width="2"/><rect x="58" y="72" width="4" height="15" fill="${INK}"/><circle cx="60" cy="93" r="2.4" fill="${INK}"/>`,
};

function lcd(text, sub = '') {
  return `<rect x="4" y="24" width="112" height="112" rx="8" fill="#e9ecef" stroke="${MUTED}"/><rect x="13" y="36" width="94" height="44" rx="3" fill="#b7d3a8" stroke="#6b8f5e"/>
<text x="60" y="${sub ? 55 : 63}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1f3318">${text}</text>${sub ? `<text x="60" y="70" text-anchor="middle" font-size="9.5" fill="#1f3318">${sub}</text>` : ''}
<circle cx="32" cy="104" r="9" fill="#ced4da"/><circle cx="60" cy="104" r="9" fill="${ACC}"/><circle cx="88" cy="104" r="9" fill="#ced4da"/>`;
}

export function sample(id, label) {
  if (id.startsWith('lcd:')) {
    const [text, sub] = id.slice(4).split('|');
    return svg(120, 160, label, lcd(text, sub), 'symptom-sample');
  }
  if (!S[id]) throw new Error(`symptom-figures: không có mẫu "${id}"`);
  return svg(120, 160, label, S[id](), 'symptom-sample');
}

// ---------- sơ đồ đường giấy ----------
const PARTS = {
  khay: { x: 40, y: 232, t: 'Khay giấy', lx: 150, ly: 250, anchor: 'middle', shape: (c) => `<rect x="36" y="224" width="228" height="34" rx="3" fill="${c}" stroke="${INK}"/>` },
  banh: { t: 'Bánh kéo giấy', lx: 34, ly: 150, anchor: 'start', shape: (c) => `<circle cx="74" cy="196" r="15" fill="${c}" stroke="${INK}"/>`, lead: [74, 158, 74, 181] },
  hop: { t: 'Hộp mực', lx: 190, ly: 34, anchor: 'middle', shape: (c) => `<rect x="120" y="44" width="140" height="74" rx="8" fill="${c}" stroke="${INK}"/>` },
  chip: { t: 'Chip', lx: 292, ly: 56, anchor: 'start', shape: (c) => `<rect x="244" y="50" width="11" height="15" fill="${c}" stroke="${INK}"/>`, lead: [255, 57, 289, 53] },
  gat: { t: 'Gạt mực', lx: 292, ly: 104, anchor: 'start', shape: (c) => `<rect x="225" y="92" width="26" height="6" rx="1" fill="${c}" stroke="${INK}"/>`, lead: [251, 95, 289, 100] },
  truc: { t: 'Trục từ', lx: 136, ly: 76, anchor: 'start', shape: (c) => `<circle cx="205" cy="84" r="16" fill="${c}" stroke="${INK}"/>` },
  trong: { t: 'Trống', lx: 206, ly: 146, anchor: 'start', shape: (c) => `<circle cx="178" cy="140" r="22" fill="${c}" stroke="${INK}"/>` },
  say: { t: 'Bộ sấy', lx: 352, ly: 214, anchor: 'middle', shape: (c) => `<rect x="316" y="140" width="72" height="56" rx="8" fill="${c}" stroke="${INK}"/>`, extra: `<circle cx="352" cy="155" r="10" fill="#fff" stroke="${INK}"/><circle cx="352" cy="182" r="10" fill="#fff" stroke="${INK}"/>` },
};

export function printerPath(hl, label) {
  const on = new Set(hl);
  const color = (k) => (on.has(k) ? '#ffd8a8' : '#eef1f5');
  const parts = Object.entries(PARTS).map(([k, p]) => {
    const tc = on.has(k) ? HOT : '#555';
    const fw = on.has(k) ? 700 : 500;
    return p.shape(color(k)) + (p.extra || '') +
      (p.lead ? `<line x1="${p.lead[0]}" y1="${p.lead[1]}" x2="${p.lead[2]}" y2="${p.lead[3]}" stroke="${tc}"/>` : '') +
      `<text x="${p.lx}" y="${p.ly}" text-anchor="${p.anchor}" font-size="14" font-weight="${fw}" fill="${tc}">${p.t}</text>`;
  }).join('');
  const path = `<path d="M48 224 C48 196 58 168 96 168 H330 C352 168 352 168 372 168 C410 168 414 130 414 88 V28" fill="none" stroke="${ACC}" stroke-width="3" stroke-dasharray="7 5"/><path d="M414 16 l-7 14 h14 z" fill="${ACC}"/><text x="404" y="20" text-anchor="end" font-size="13" fill="${ACC}">Giấy ra</text>`;
  return svg(460, 270, label, `<rect x="10" y="10" width="440" height="252" rx="12" fill="#fafbfc" stroke="${LINE}"/>${path}${parts}`, 'symptom-diagram');
}

// ---------- hình thao tác ----------
const arrowDefs = (id, c) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker></defs>`;
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 14}" font-weight="${o.w || 500}" fill="${o.c || INK}">${s}</text>`;

const D = {
  'lac-hop': () => { const a = `a${++uid}`; return arrowDefs(a, ACC) + `<rect x="80" y="44" width="200" height="60" rx="10" fill="#343a40"/><rect x="104" y="60" width="96" height="26" rx="3" fill="#74c0fc"/>${T(152, 78, 'Hộp mực', { fs: 13, c: '#08306b', w: 700 })}<line x1="66" y1="74" x2="14" y2="74" stroke="${ACC}" stroke-width="4" marker-end="url(#${a})"/><line x1="294" y1="74" x2="346" y2="74" stroke="${ACC}" stroke-width="4" marker-end="url(#${a})"/>${T(180, 28, 'Cầm hai đầu hộp, lắc ngang nhẹ 5 đến 6 lần', { w: 700 })}${T(180, 132, 'Không để nắng chiếu, không chạm tay vào trục')}`; },
  'do-lap': () => { const a = `a${++uid}`; return arrowDefs(a, HOT) + `<rect x="30" y="16" width="200" height="184" fill="#fff" stroke="${LINE}"/>` + [40, 66, 118, 144, 170].map((y) => `<rect x="46" y="${y}" width="${y % 4 ? 150 : 170}" height="5" fill="${INK}" opacity=".7"/>`).join('') + [54, 132].map((y) => `<rect x="31" y="${y}" width="198" height="6" fill="#111"/>`).join('') + `<line x1="252" y1="57" x2="252" y2="135" stroke="${HOT}" stroke-width="3" marker-start="url(#${a})" marker-end="url(#${a})"/>${T(262, 90, 'Đo khoảng', { a: 'start', c: HOT, w: 700 })}${T(262, 110, 'cách này', { a: 'start', c: HOT, w: 700 })}${T(262, 134, 'rồi ghi lại', { a: 'start', fs: 13 })}`; },
  'cha-tay': () => { const b = `b${++uid}`; const page = (x, smear) => `<rect x="${x}" y="14" width="150" height="88" fill="#fff" stroke="${LINE}"/>` + [30, 46, 62, 78].map((y) => `<rect x="${x + 14}" y="${y}" width="122" height="5" fill="${INK}"/>`).join('') + (smear ? `<path d="M${x + 22} 40 L${x + 128} 76" stroke="#555" stroke-width="16" opacity=".5" filter="url(#${b})"/>` : `<path d="M${x + 44} 86 q18 -14 44 -10" fill="none" stroke="${ACC}" stroke-width="3"/>`); return `<defs><filter id="${b}"><feGaussianBlur stdDeviation="3"/></filter></defs>` + page(14, true) + page(196, false) + T(89, 126, 'Chà tay, chữ bong ra', { w: 700, c: HOT }) + T(89, 146, 'Kiểm tra bộ sấy') + T(271, 126, 'Chà tay, chữ vẫn nguyên', { w: 700, c: OK }) + T(271, 146, 'Kiểm tra gạt mực, hộp mực'); },
  'cay-het-muc': () => { const a = `a${++uid}`; const box = (x, y, w, h, s, f = '#eef3fb', st = ACC) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${f}" stroke="${st}"/>${s}`; const ln = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${MUTED}" stroke-width="2" marker-end="url(#${a})"/>`; return arrowDefs(a, MUTED) + box(90, 8, 200, 34, T(190, 30, 'Máy báo hết mực', { w: 700 })) + ln(190, 42, 190, 64) + box(90, 66, 200, 34, T(190, 88, 'In một trang: còn đậm không?', { fs: 13, w: 700 })) + ln(140, 100, 90, 134) + ln(240, 100, 290, 134) + T(74, 120, 'Còn đậm', { c: OK, fs: 13, w: 700 }) + T(308, 120, 'Đã nhạt', { c: HOT, fs: 13, w: 700 }) + box(6, 136, 174, 66, T(93, 160, 'Do bộ đếm hoặc chip', { fs: 13, w: 700 }) + T(93, 180, 'Nạp xong cần đặt lại cữ', { fs: 12 }) + T(93, 195, 'hoặc thay chip', { fs: 12 }), '#ebfbee', OK) + box(200, 136, 174, 66, T(287, 160, 'Hết mực thật', { fs: 13, w: 700 }) + T(287, 180, 'Lắc hộp để in tạm', { fs: 12 }) + T(287, 195, 'rồi nạp mực', { fs: 12 }), '#fff4e6', HOT); },
  'keo-giay': () => { const a = `a${++uid}`, b = `a${++uid}`; return arrowDefs(a, OK) + arrowDefs(b, BAD) + `<rect x="18" y="26" width="120" height="110" rx="10" fill="#dee2e6" stroke="${MUTED}"/><circle cx="118" cy="58" r="11" fill="#868e96"/><circle cx="118" cy="104" r="11" fill="#868e96"/>${T(78, 84, 'Trong máy', { fs: 13 })}<rect x="112" y="72" width="130" height="18" fill="#fff" stroke="${MUTED}"/><line x1="250" y1="66" x2="342" y2="66" stroke="${OK}" stroke-width="4" marker-end="url(#${a})"/>${T(296, 54, 'Kéo chậm, hai tay', { fs: 13, c: OK, w: 700 })}<line x1="342" y1="100" x2="256" y2="100" stroke="${BAD}" stroke-width="4" marker-end="url(#${b})" stroke-dasharray="6 4"/>${T(298, 122, 'Không đẩy ngược', { fs: 13, c: BAD, w: 700 })}${T(180, 160, 'Luôn kéo theo chiều giấy chạy, không giật mạnh')}`; },
  'thanh-xanh': () => { const a = `a${++uid}`; return arrowDefs(a, ACC) + `<rect x="24" y="52" width="312" height="44" rx="8" fill="#495057"/><rect x="40" y="68" width="280" height="10" rx="3" fill="#adb5bd"/><rect x="150" y="60" width="34" height="26" rx="4" fill="#40c057" stroke="#2b8a3e"/><line x1="140" y1="36" x2="50" y2="36" stroke="${ACC}" stroke-width="4" marker-end="url(#${a})"/><line x1="194" y1="36" x2="312" y2="36" stroke="${ACC}" stroke-width="4" marker-end="url(#${a})"/>${T(167, 20, 'Gạt qua lại khoảng 10 lần', { w: 700 })}<path d="M46 106 v14 M38 114 l8 -10 l8 10" fill="none" stroke="${HOT}" stroke-width="3"/>${T(66, 122, 'Xong, trả thanh về đúng vị trí có mũi tên', { a: 'start', c: HOT, w: 700, fs: 13 })}`; },
};
const DSIZE = { 'lac-hop': [360, 146], 'do-lap': [360, 214], 'cha-tay': [360, 158], 'cay-het-muc': [380, 210], 'keo-giay': [360, 172], 'thanh-xanh': [360, 134] };

export function diagram(id, label) {
  if (!D[id]) throw new Error(`symptom-figures: không có hình "${id}"`);
  return svg(DSIZE[id][0], DSIZE[id][1], label, D[id](), 'symptom-diagram');
}
