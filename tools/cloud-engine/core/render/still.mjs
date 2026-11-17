// node still.mjs DIR t [--out dir] [--prefix p] [--page x.html]
import fs from 'fs'; import path from 'path'; import { openDemo, closeServer } from './page.mjs';
const a = process.argv.slice(2), dir = path.resolve(a[0]), ts = a[1].split(',').map(Number);
const opt = k => { const i = a.indexOf(k); return i > 0 ? a[i + 1] : null; };
const out = opt('--out') || path.join(dir, 'out'), pre = opt('--prefix') || 'still_', pg = opt('--page') || 'index.html';
const sz = (opt('--size') || '1080x1920').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, { w: sz[0], h: sz[1], page: pg });
for (const t of ts) { await page.evaluate(t => window.render(t), t); const b = await page.locator('canvas').first().screenshot({ type: 'jpeg', quality: 92 }); fs.writeFileSync(path.join(out, `${pre}${t}.jpg`), b); console.log(path.join(out, `${pre}${t}.jpg`)); }
await browser.close(); closeServer();
