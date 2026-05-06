import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:8899/';
const outDir = process.env.OUT_DIR || 'artifacts/qa-homepage-calendar';
const port = Number(process.env.CDP_PORT || 9277);

class Cdp {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.seq = 0; this.pending = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
  }
  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  close() { this.ws?.close(); }
}

async function getJson(url, tries = 50) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); last = `${r.status} ${r.statusText}`; }
    catch (e) { last = e.message; }
    await delay(200);
  }
  throw new Error(`failed to fetch ${url}: ${last}`);
}

async function evalExpr(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return r.result.value;
}

async function snap(cdp, width, height, label) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await cdp.send('Page.navigate', { url: new URL('index.html?v=20260506calendar', base).href });
  await delay(1600);
  await evalExpr(cdp, `(() => {
    const details = document.querySelector('.legacy-calendar-details');
    if (details) details.open = true;
    const cal = document.querySelector('.calendar-section');
    if (cal) {
      const y = window.scrollY + cal.getBoundingClientRect().top - 28;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    }
  })()`);
  await delay(650);
  const metrics = await evalExpr(cdp, `(() => {
    const calendar = document.querySelector('.calendar-section');
    const grid = document.querySelector('.calendar-grid');
    const day = document.querySelector('.calendar-day.has-post');
    const r = calendar ? calendar.getBoundingClientRect() : { width: 0, height: 0, top: 0, left: 0 };
    const dr = day ? day.getBoundingClientRect() : { width: 0, height: 0 };
    const cs = calendar ? getComputedStyle(calendar) : null;
    const dcs = day ? getComputedStyle(day) : null;
    return {
      url: location.href,
      title: document.title,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      replacementChars: ((document.body.innerText || '').match(/�/g) || []).length,
      detailsOpen: !!document.querySelector('.legacy-calendar-details[open]'),
      calendarWidth: Math.round(r.width),
      calendarHeight: Math.round(r.height),
      calendarRadius: cs ? cs.borderRadius : '',
      gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : '',
      postDays: document.querySelectorAll('.calendar-day.has-post').length,
      firstPostDayWidth: Math.round(dr.width),
      firstPostDayHeight: Math.round(dr.height),
      firstPostDayBg: dcs ? dcs.backgroundImage || dcs.backgroundColor : '',
      visibleEntryTitles: document.querySelectorAll('.calendar-entry-title').length,
      clipX: Math.max(0, Math.floor(r.left - 12)),
      clipY: Math.max(0, Math.floor(r.top - 12)),
      clipWidth: Math.ceil(r.width + 24),
      clipHeight: Math.ceil(r.height + 24)
    };
  })()`);
  await fs.mkdir(outDir, { recursive: true });
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(`${outDir}/${label}.png`, Buffer.from(screenshot.data, 'base64'));
  return metrics;
}

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--no-proxy-server',
  `--remote-debugging-port=${port}`, '--window-size=1440,1200', 'about:blank'
], { stdio: ['ignore', 'ignore', 'ignore'] });

try {
  await getJson(`http://127.0.0.1:${port}/json/version`);
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await targetRes.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const results = [await snap(cdp, 1440, 1200, 'desktop'), await snap(cdp, 390, 1050, 'mobile')];
  cdp.close();
  const issues = [];
  for (const r of results) {
    if (r.overflowX > 0) issues.push(`${r.url}: overflow ${r.overflowX}`);
    if (r.replacementChars > 0) issues.push(`${r.url}: replacement chars`);
    if (!r.detailsOpen) issues.push(`${r.url}: calendar details did not open`);
    if (r.postDays < 1) issues.push(`${r.url}: no post days rendered`);
    if (r.visibleEntryTitles < 1) issues.push(`${r.url}: calendar entries missing titles`);
    if (r.calendarWidth < 300 || r.calendarHeight < 200) issues.push(`${r.url}: calendar too small ${r.calendarWidth}x${r.calendarHeight}`);
  }
  console.log(JSON.stringify({ base, outDir, issues, results }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  chrome.kill();
}
