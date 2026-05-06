import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:8899/';
const path = process.env.TEMPLATE_PATH || process.argv[2] || 'templates/blog-reading-template.html';
const outDir = process.env.OUT_DIR || 'artifacts/qa-blog-reading-template';
const port = Number(process.env.CDP_PORT || 9256);

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
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}

async function snap(cdp, width, height, label) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await cdp.send('Page.navigate', { url: new URL(path, base).href });
  await delay(1200);
  const metrics = await evalExpr(cdp, `(() => {
    const text = document.body.innerText || '';
    const q = s => document.querySelector(s);
    return {
      url: location.href,
      title: document.title,
      bodyClass: document.body.className,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      replacementChars: (text.match(/�/g) || []).length,
      hasHero: !!q('.blog-reading-hero'),
      hasArticle: !!q('.blog-article.markdown-body'),
      sectionCount: document.querySelectorAll('.article-section').length,
      hasQuickJump: !!q('.article-mobile-jump'),
      articleWidth: Math.round((q('.blog-article') || document.body).getBoundingClientRect().width),
      ledeWidth: Math.round((q('.reading-lede') || document.body).getBoundingClientRect().width)
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
  '--window-size=1440,1200', 'about:blank'
], { stdio: ['ignore', 'ignore', 'ignore'] });
try {
  await getJson(`http://127.0.0.1:${port}/json/version`);
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await targetRes.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const results = [await snap(cdp, 1440, 1200, 'desktop'), await snap(cdp, 390, 1000, 'mobile')];
  cdp.close();
  const issues = [];
  for (const r of results) {
    if (r.overflowX > 0) issues.push(`${r.url}: overflow ${r.overflowX}`);
    if (r.replacementChars > 0) issues.push(`${r.url}: replacement chars`);
    if (!r.hasHero || !r.hasArticle || r.sectionCount < 7) issues.push(`${r.url}: template structure incomplete`);
  }
  console.log(JSON.stringify({ base, path, outDir, issues, results }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  chrome.kill();
}
