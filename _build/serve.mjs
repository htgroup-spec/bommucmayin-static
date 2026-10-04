/** serve.mjs — static server không phụ thuộc package nào, hiểu URL sạch.
 *  Dùng để xem trước ở local: node _build/serve.mjs [port] */
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { resolve, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Thứ tự: tham số dòng lệnh → biến môi trường PORT → 4321.
// Có PORT để chạy được nhiều bản xem trước cùng lúc mà không giành cổng nhau.
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 4321;
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };
createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = resolve(ROOT, '.' + p);
  try {
    const st = await stat(f).catch(() => null);
    if (!st || st.isDirectory()) f = join(f, 'index.html');
    const body = await readFile(f);
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    const nf = await readFile(resolve(ROOT, '404.html')).catch(() => Buffer.from('404'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(nf);
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
