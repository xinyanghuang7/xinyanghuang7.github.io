import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765/';
const postPath = process.env.POST_PATH;
const outDir = process.env.OUT_DIR || 'artifacts/qa-blog-post-cdp';
const port = Number(process.env.CDP_PORT || 9234);
const waitMs = Number(process.env.PAGE_WAIT_MS || 2200);

if (!postPath) {
  console.error('POST_PATH is required, e.g. posts/2026/04/30.html');
  process.exit(2);
}

class Cdp {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.seq = 0;
    this.pending = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener('message', (ev) => {
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
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      last = `${res.status} ${res.statusText}`;
    } catch (e) {
      last = e.message;
    }
    await delay(250);
  }
  throw new Error(`failed to fetch ${url}: ${last}`);
}

async function evalExpr(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}

function makeUrl(pathWithHash) {
  return new URL(pathWithHash, base).href;
}

async function snap(cdp, pathWithHash, width, height, label) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await cdp.send('Page.navigate', { url: makeUrl(pathWithHash) });
  await delay(waitMs);

  const metrics = await evalExpr(cdp, `(() => {
    const q = s => document.querySelector(s);
    const qa = s => Array.from(document.querySelectorAll(s));
    const rect = s => {
      const e = q(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return {
        top: Math.round(r.top),
        left: Math.round(r.left),
        width: Math.round(r.width),
        height: Math.round(r.height),
        display: cs.display,
        grid: cs.gridTemplateColumns,
        position: cs.position,
      };
    };
    const text = document.body.innerText || '';
    const moduleIds = ['#stock-pick', '#lesson', '#creator-digest', '#market', '#decision-cards'];
    const moduleOrder = moduleIds.map(id => ({ id, top: q(id)?.getBoundingClientRect().top ?? null }));
    const orderOk = moduleOrder.every(x => x.top !== null)
      && moduleOrder.slice(1).every((x, i) => x.top > moduleOrder[i].top);
    const hasScreenshotLeak = /截图|截屏|screenshot|内部工作流|internal workflow/i.test(text);
    const visibleMeta = q('.article-meta-bar')?.innerText || '';
    return {
      url: location.href,
      title: document.title,
      ready: document.readyState,
      bodyClass: document.body.className,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      replacementChars: (text.match(/�/g) || []).length,
      titleReplacementChars: ((document.title || '').match(/�/g) || []).length,
      anchorsOk: ['#pm-dashboard', ...moduleIds].every(id => !!q(id)),
      orderOk,
      hasPm: !!q('#pm-dashboard'),
      hasNewsGrade: !!q('.news-grade-board'),
      hasScenario: qa('.scenario-matrix').length,
      hasActionFields: qa('.action-field').length,
      hasSourceLinks: qa('a.news-source-link').length,
      hasSourceLedger: !!q('.source-ledger'),
      sourceLedgerLinks: qa('.source-ledger a.news-source-link').length,
      hasSourceAudit: !!q('.source-audit-panel'),
      sourceBoundaryMarks: qa('.source-boundary, .fact-analysis-split, .inline-source-chip').length,
      hasCitationSchema: !!document.querySelector('script[type="application/ld+json"]')?.textContent?.includes('citation'),
      hasHoldingCards: qa('.holding-news-card').length,
      hasMobileJump: !!q('.article-mobile-jump'),
      mobileJump: rect('.article-mobile-jump'),
      pmGrid: rect('.pm-dashboard-grid'),
      newsGrid: rect('.news-grade-grid'),
      scenario: rect('.scenario-matrix'),
      marketTape: rect('.market-tape'),
      hasScreenshotLeak,
      visibleMeta,
    };
  })()`);

  await fs.mkdir(outDir, { recursive: true });
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(`${outDir}/${label}.png`, Buffer.from(screenshot.data, 'base64'));
  return metrics;
}

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${port}`,
  '--window-size=1440,1500',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'ignore'] });

try {
  await getJson(`http://127.0.0.1:${port}/json/version`);
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!targetRes.ok) throw new Error(`failed to create CDP target: ${targetRes.status} ${targetRes.statusText}`);
  const target = await targetRes.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const cases = [
    [postPath, 1440, 1500, 'desktop-full'],
    [`${postPath}#pm-dashboard`, 390, 1200, 'mobile-pm'],
    [`${postPath}#creator-digest`, 390, 1400, 'mobile-creator'],
    [`${postPath}#market`, 390, 1400, 'mobile-market'],
    [`${postPath}#decision-cards`, 390, 1400, 'mobile-actions'],
  ];

  const results = [];
  const issues = [];
  for (const row of cases) {
    const metrics = await snap(cdp, ...row);
    results.push(metrics);
    if (metrics.overflowX > 0) issues.push(`${row[3]}: horizontal overflow ${metrics.overflowX}px`);
    if (metrics.replacementChars > 0 || metrics.titleReplacementChars > 0) issues.push(`${row[3]}: replacement/mojibake chars detected`);
    if (!metrics.anchorsOk) issues.push(`${row[3]}: missing required anchors`);
    if (!metrics.orderOk) issues.push(`${row[3]}: module order broken`);
    if (!metrics.hasPm) issues.push(`${row[3]}: missing PM dashboard`);
    if (!metrics.hasNewsGrade) issues.push(`${row[3]}: missing news grade board`);
    if (metrics.hasScenario < 1 && metrics.hasActionFields < 4) issues.push(`${row[3]}: missing scenario matrix/action fields`);
    if (metrics.hasSourceLinks < 6) issues.push(`${row[3]}: too few visible news/source links`);
    if (!metrics.hasSourceLedger) issues.push(`${row[3]}: missing source ledger`);
    if (metrics.sourceLedgerLinks < 5) issues.push(`${row[3]}: source ledger has too few external references`);
    if (!metrics.hasSourceAudit) issues.push(`${row[3]}: missing source audit panel`);
    if (metrics.sourceBoundaryMarks < 5) issues.push(`${row[3]}: too few fact/source/analysis boundary marks`);
    if (!metrics.hasCitationSchema) issues.push(`${row[3]}: missing citation schema metadata`);
    if (metrics.hasHoldingCards < 3) issues.push(`${row[3]}: too few holding/news cards`);
    if (metrics.hasScreenshotLeak) issues.push(`${row[3]}: screenshot/internal workflow leak in visible text`);
    if (row[1] < 600 && metrics.mobileJump?.position !== 'static') issues.push(`${row[3]}: mobile jump is not static`);
  }

  cdp.close();
  console.log(JSON.stringify({ base, postPath, outDir, checked: results.length, issues, results }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  chrome.kill();
}
