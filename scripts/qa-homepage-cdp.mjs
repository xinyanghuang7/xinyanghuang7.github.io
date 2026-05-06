import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:8899/';
const outDir = process.env.OUT_DIR || 'artifacts/qa-homepage';
const port = Number(process.env.CDP_PORT || 9266);

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
  await cdp.send('Page.navigate', { url: new URL('index.html', base).href });
  await delay(1400);
  const metrics = await evalExpr(cdp, `(() => {
    const q = s => document.querySelector(s);
    const hero = q('.hero');
    const heroRect = hero ? hero.getBoundingClientRect() : { height: 0 };
    const archive = q('#archive');
    const archiveItem = q('.archive-item');
    const heroCards = document.querySelectorAll('.hero-insight-card').length;
    const researchCards = document.querySelectorAll('#research-standards .research-card').length;
    const text = document.body.innerText || '';
    return {
      url: location.href,
      title: document.title,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      replacementChars: (text.match(/�/g) || []).length,
      heroHeight: Math.round(heroRect.height),
      heroCards,
      researchCards,
      archiveItems: document.querySelectorAll('.archive-item').length,
      hasArchive: !!archive,
      firstArchiveTitle: archiveItem?.querySelector('.archive-item-title')?.innerText || '',
      heroTitleLinesApprox: q('.hero h1') ? Math.round(q('.hero h1').getBoundingClientRect().height / parseFloat(getComputedStyle(q('.hero h1')).lineHeight || '1')) : 0
    };
  })()`);
  await fs.mkdir(outDir, { recursive: true });
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(`${outDir}/${label}.png`, Buffer.from(screenshot.data, 'base64'));
  return metrics;
}

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--no-proxy-server', '--ignore-certificate-errors', `--remote-debugging-port=${port}`,
  '--window-size=1440,1400', 'about:blank'
], { stdio: ['ignore', 'ignore', 'ignore'] });

try {
  await getJson(`http://127.0.0.1:${port}/json/version`);
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await targetRes.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const results = [await snap(cdp, 1440, 1400, 'desktop'), await snap(cdp, 390, 1200, 'mobile')];
  cdp.close();
  const issues = [];
  for (const r of results) {
    if (r.overflowX > 0) issues.push(`${r.url}: overflow ${r.overflowX}`);
    if (r.replacementChars > 0) issues.push(`${r.url}: replacement chars`);
    if (r.heroCards < 3) issues.push(`${r.url}: missing hero insight cards`);
    if (r.researchCards < 3) issues.push(`${r.url}: missing research cards`);
    if (!r.hasArchive) issues.push(`${r.url}: archive container missing`);
  }
  console.log(JSON.stringify({ base, outDir, issues, results }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  chrome.kill();
}
