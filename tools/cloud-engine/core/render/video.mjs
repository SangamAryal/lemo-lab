// node video.mjs DIR --fps 24 --workers 4 --out file.mp4 [--from s --to s]
import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process'; import { openDemo, closeServer } from './page.mjs';
const a = process.argv.slice(2), dir = path.resolve(a[0]); const opt = (k, d) => { const i = a.indexOf(k); return i > 0 ? a[i + 1] : d; };
const fps = +opt('--fps', 24), W = +opt('--workers', 4), out = path.resolve(opt('--out', path.join(dir, 'out/video.mp4')));
fs.mkdirSync(path.dirname(out), { recursive: true });
const first = await openDemo(dir); const DUR = await first.page.evaluate(() => window.DUR);
const t0 = +opt('--from', 0), t1 = +opt('--to', DUR), N = Math.round((t1 - t0) * fps);
const tmp = path.join(path.dirname(out), 'parts'); fs.mkdirSync(tmp, { recursive: true });
const chunk = Math.ceil(N / W); const pages = [first];
for (let w = 1; w < W; w++) pages.push(await openDemo(dir));
const t00 = Date.now();
await Promise.all(pages.map(async ({ page }, w) => {
  const s = w * chunk, e = Math.min(N, s + chunk); if (s >= e) return;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', path.join(tmp, `p${w}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = s; f < e; f++) {
    const url = await page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', .95); }, t0 + f / fps);
    const buf = Buffer.from(url.split(',')[1], 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (w === 0 && f % 48 === 0) console.log(`frame ${f}/${e} ${((Date.now() - t00) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}));
const list = pages.map((_, w) => `file '${path.join(tmp, `p${w}.mp4`)}'`).filter((_, w) => w * chunk < N).join('\n'); fs.writeFileSync(path.join(tmp, 'list.txt'), list);
await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
for (const p of pages) await p.browser.close(); closeServer(); console.log('video', out, N, 'frames');
