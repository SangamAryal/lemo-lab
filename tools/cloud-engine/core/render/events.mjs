import fs from 'fs'; import path from 'path'; import { openDemo, closeServer } from './page.mjs';
const dir = path.resolve(process.argv[2]);
const { browser, page } = await openDemo(dir);
const r = await page.evaluate(() => ({ dur: window.DUR, ev: window.EV }));
fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(r)); console.log('events', r.ev.length, 'dur', r.dur);
await browser.close(); closeServer();
