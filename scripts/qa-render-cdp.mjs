import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:8787/';
const port = Number(process.env.CDP_PORT || 9223);

function chromeArgs() {
  return [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${port}`, '--window-size=1440,1400', 'about:blank'
  ];
}

async function getJson(url, tries = 40) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      last = `${res.status} ${res.statusText}`;
    } catch (e) { last = e.message; }
    await delay(250);
  }
  throw new Error(`failed to fetch ${url}: ${last}`);
}

class Cdp {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.seq = 0; this.pending = new Map(); }
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

function luminance([r,g,b]) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
}
function parseRgb(s) {
  const m = String(s).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  return m[1].split(',').slice(0,3).map(x => Number.parseFloat(x));
}
function contrast(fg, bg) {
  const L1 = luminance(fg), L2 = luminance(bg);
  const hi = Math.max(L1,L2), lo = Math.min(L1,L2);
  return (hi + 0.05) / (lo + 0.05);
}

async function evalExpr(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return r.result.value;
}

async function auditPage(cdp, path) {
  const url = new URL(path, base).href;
  await cdp.send('Page.navigate', { url });
  await new Promise(resolve => {
    const done = () => resolve();
    cdp.ws.addEventListener('message', function onMsg(ev) {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Page.loadEventFired') { cdp.ws.removeEventListener('message', onMsg); done(); }
    });
    setTimeout(done, 5000);
  });
  await delay(400);
  return await evalExpr(cdp, `(() => {
    const bodyText = document.body.innerText || '';
    const card = document.querySelector('.chapter-body-card') || document.querySelector('.course-intro-card') || document.querySelector('main');
    const r = card ? card.getBoundingClientRect() : {width:0,height:0};
    const cs = card ? getComputedStyle(card) : null;
    function effectiveBg(el) {
      let cur = el;
      while (cur) {
        const bg = getComputedStyle(cur).backgroundColor;
        if (bg && !/^rgba?\\(0, 0, 0, 0\\)$/.test(bg) && bg !== 'transparent') return bg;
        cur = cur.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }
    const p = card ? (card.querySelector('p,li,td') || card) : null;
    const pcs = p ? getComputedStyle(p) : null;
    const market = document.querySelector('.market-grid-comfort');
    const media = document.querySelector('.market-grid-comfort .section-media-frame');
    return {
      url: location.href,
      title: document.title,
      bodyTextLength: bodyText.replace(/\\s+/g,'').length,
      cardWidth: Math.round(r.width),
      cardHeight: Math.round(r.height),
      cardBg: card ? effectiveBg(card) : '',
      textColor: pcs ? pcs.color : '',
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      marketGridColumns: market ? getComputedStyle(market).gridTemplateColumns : null,
      mediaPosition: media ? getComputedStyle(media).position : null
    };
  })()`);
}

const chrome = spawn(chromePath, chromeArgs(), { stdio: ['ignore', 'ignore', 'ignore'] });
try {
  await getJson(`http://127.0.0.1:${port}/json/version`);
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!targetRes.ok) throw new Error(`failed to create CDP target: ${targetRes.status} ${targetRes.statusText}`);
  const target = await targetRes.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const paths = ['posts/2026/04/23.html#market'];
  for (let i=1;i<=29;i++) paths.push(`options/${String(i).padStart(2,'0')}.html#chapter-content`);
  const results = [];
  const issues = [];
  for (const path of paths) {
    const row = await auditPage(cdp, path);
    const fg = parseRgb(row.textColor), bg = parseRgb(row.cardBg);
    row.contrast = fg && bg ? Number(contrast(fg,bg).toFixed(2)) : null;
    results.push(row);
    if (row.bodyTextLength < 1500) issues.push(`${path}: too little rendered text (${row.bodyTextLength})`);
    if (row.cardWidth < 300 || row.cardHeight < 120) issues.push(`${path}: content card too small ${row.cardWidth}x${row.cardHeight}`);
    if (row.contrast !== null && row.contrast < 4.5) issues.push(`${path}: low text contrast ${row.contrast} (${row.textColor} on ${row.cardBg})`);
    if (row.overflowX > 6) issues.push(`${path}: horizontal overflow ${row.overflowX}px`);
    if (path.includes('04/23') && row.marketGridColumns && row.marketGridColumns.trim().split(' ').length > 1) issues.push(`${path}: market grid still appears multi-column (${row.marketGridColumns})`);
    if (path.includes('04/23') && row.mediaPosition === 'sticky') issues.push(`${path}: market media frame is still sticky`);
  }
  cdp.close();
  console.log(JSON.stringify({ base, checked: results.length, issues, results }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  chrome.kill();
}
