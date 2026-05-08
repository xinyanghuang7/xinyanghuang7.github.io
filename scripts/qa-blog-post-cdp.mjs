import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765/';
const postPath = process.env.POST_PATH;
const outDir = process.env.OUT_DIR || 'artifacts/qa-blog-post-cdp';
const port = Number(process.env.CDP_PORT || 9234);
const waitMs = Number(process.env.PAGE_WAIT_MS || 2200);
const expectedPostPath = new URL(postPath, 'https://example.invalid/').pathname;

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
    const html = document.documentElement.outerHTML || '';
    const root = q('article.blog-article, main, body') || document;
    const market = q('#market') || root;
    const chromeError = location.href.startsWith('chrome-error://');
    const expectedPostPath = ${JSON.stringify(expectedPostPath)};
    const expectedPathLoaded = location.pathname.endsWith(expectedPostPath);
    const statusLikePage = !!document.title && text.length > 2000;
    const hasArticle = !!q('article.blog-article, main article, body.post-page');
    const sourceLedger = root.querySelector('[data-qa="source-ledger"], .source-ledger');
    const sourceLedgerLinks = sourceLedger ? sourceLedger.querySelectorAll('[data-qa="source-ledger-item"], a.news-source-link, a[href^="http"]').length : 0;
    const holdingCards = Array.from(market.querySelectorAll('[data-qa="holding-news-card"], .holding-news-card'));
    const watchlistCards = Array.from(root.querySelectorAll('[data-qa="watchlist-news-card"], .watchlist-news-card'));
    const requiredModuleIds = ['#stock-pick', '#lesson', '#creator-digest', '#market', '#decision-cards', '#risks'];
    const moduleIds = ['#stock-pick', '#lesson', '#creator-digest', '#market', ...(q('#watchlist') ? ['#watchlist'] : []), '#decision-cards', '#risks', ...(q('#sources') ? ['#sources'] : [])];
    const articleSections = qa('article.blog-article section.article-section, article section.article-section')
      .map(sec => sec.id)
      .filter(Boolean);
    const modulePositions = moduleIds.map(id => articleSections.indexOf(id.slice(1)));
    const moduleOrder = moduleIds.map((id, idx) => ({ id, index: modulePositions[idx], top: q(id)?.getBoundingClientRect().top ?? null }));
    const orderOk = modulePositions.every(idx => idx >= 0)
      && modulePositions.slice(1).every((idx, i) => idx > modulePositions[i]);
    const hasScreenshotLeak = /截图|截屏|screenshot|内部工作流|internal workflow/i.test(text);
    const visibleMeta = q('.article-meta-bar')?.innerText || '';
    const markdownFirst = document.body.classList.contains('post-simple-markdown');
    const decisionTableRows = q('#decision-cards table') ? q('#decision-cards table').querySelectorAll('tbody tr').length : 0;
    const hasEvidenceTable = !!q('#pm-dashboard table, #facts table');
    return {
      url: location.href,
      title: document.title,
      ready: document.readyState,
      bodyClass: document.body.className,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      replacementChars: (text.match(/\uFFFD/g) || []).length,
      titleReplacementChars: ((document.title || '').match(/\uFFFD/g) || []).length,
      anchorsOk: ['#pm-dashboard', ...requiredModuleIds].every(id => !!q(id)),
      orderOk,
      articleSections,
      modulePositions,
      markdownFirst,
      hasPm: !!q('#pm-dashboard'),
      hasNewsGrade: !!q('.news-grade-board'),
      hasScenario: qa('.scenario-matrix').length,
      hasActionFields: qa('.action-field').length,
      decisionTableRows,
      hasEvidenceTable,
      hasSourceLinks: qa('a.news-source-link').length,
      chromeError,
      expectedPathLoaded,
      statusLikePage,
      hasArticle,
      htmlLength: html.length,
      sourceClassMentions: (html.match(/source-ledger/g) || []).length,
      holdingClassMentions: (html.match(/holding-news-card/g) || []).length,
      hasSourceLedger: !!sourceLedger,
      sourceLedgerLinks,
      hasSourceAudit: !!q('.source-audit-panel'),
      sourceBoundaryMarks: qa('.source-boundary, .fact-analysis-split, .inline-source-chip').length,
      hasCitationSchema: !!document.querySelector('script[type="application/ld+json"]')?.textContent?.includes('citation'),
      hasHoldingCards: holdingCards.length,
      hasWatchlistCards: watchlistCards.length,
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
  '--no-proxy-server',
  '--ignore-certificate-errors',
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
    const loadFailed = metrics.chromeError || !metrics.expectedPathLoaded || !metrics.statusLikePage || !metrics.hasArticle;
    if (metrics.chromeError) issues.push(`${row[3]}: Chrome failed to load target URL`);
    if (!metrics.expectedPathLoaded) issues.push(`${row[3]}: loaded unexpected path ${metrics.url}`);
    if (!metrics.statusLikePage) issues.push(`${row[3]}: loaded page is too small or missing title (htmlLength=${metrics.htmlLength})`);
    if (!metrics.hasArticle) issues.push(`${row[3]}: loaded page lacks article/post root`);
    if (loadFailed) continue;
    if (metrics.overflowX > 0) issues.push(`${row[3]}: horizontal overflow ${metrics.overflowX}px`);
    if (metrics.replacementChars > 0 || metrics.titleReplacementChars > 0) issues.push(`${row[3]}: replacement/mojibake chars detected`);
    if (!metrics.anchorsOk) issues.push(`${row[3]}: missing required anchors`);
    if (!metrics.orderOk) issues.push(`${row[3]}: module order broken`);
    if (!metrics.hasPm) issues.push(`${row[3]}: missing PM dashboard`);
    if (!metrics.hasNewsGrade && !metrics.markdownFirst) issues.push(`${row[3]}: missing news grade board`);
    if (metrics.markdownFirst) {
      if (metrics.decisionTableRows < 3) issues.push(`${row[3]}: markdown-first action table has too few rows`);
      if (!metrics.hasEvidenceTable) issues.push(`${row[3]}: markdown-first evidence table missing`);
    } else if (metrics.hasScenario < 1 && metrics.hasActionFields < 4) issues.push(`${row[3]}: missing scenario matrix/action fields`);
    if (metrics.hasSourceLinks < 6 && !/chrome-error:\/\//.test(metrics.url)) issues.push(`${row[3]}: too few visible news/source links`);
    if (!metrics.hasSourceLedger) issues.push(`${row[3]}: missing source ledger`);
    if (metrics.sourceLedgerLinks < 5) issues.push(`${row[3]}: source ledger has too few external references`);
    if (!metrics.hasSourceAudit && !metrics.markdownFirst) issues.push(`${row[3]}: missing source audit panel`);
    if (!metrics.markdownFirst && metrics.sourceBoundaryMarks < 5) issues.push(`${row[3]}: too few fact/source/analysis boundary marks`);
    if (!metrics.hasCitationSchema) issues.push(`${row[3]}: missing citation schema metadata`);
    if (metrics.hasHoldingCards < 3) issues.push(`${row[3]}: too few true holding/news cards`);
    if (metrics.articleSections.includes('watchlist') && metrics.hasWatchlistCards < 3) issues.push(`${row[3]}: too few watchlist radar cards`);
    if (metrics.hasScreenshotLeak) issues.push(`${row[3]}: screenshot/internal workflow leak in visible text`);
    if (row[1] < 600 && metrics.hasMobileJump && metrics.mobileJump?.position !== 'static') issues.push(`${row[3]}: mobile jump is not static`);
  }

  cdp.close();
  console.log(JSON.stringify({ base, postPath, outDir, checked: results.length, issues, results }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  chrome.kill();
}
