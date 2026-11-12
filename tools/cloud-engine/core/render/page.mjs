// stand-in: serve a film folder (+ /core from LIB) and open it in headless Chromium
import http from 'http'; import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const require = createRequire(process.cwd() + '/'); const { chromium } = require('playwright');
const LIB = process.env.LIB; let server;
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
export async function openDemo(dir, { w = 1080, h = 1920, page: pg = 'index.html' } = {}) {
  server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = u.startsWith('/core/') ? path.join(LIB, u) : path.join(dir, u === '/' ? pg : u);
    fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); res.end(b); });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message)); page.on('console', m => { if (m.type() === 'error') console.error('console', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/${pg}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  return { browser, page, port };
}
export function closeServer() { server && server.close(); }
