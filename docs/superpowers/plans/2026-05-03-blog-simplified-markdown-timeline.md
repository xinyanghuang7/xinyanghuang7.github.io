# Blog Simplified Markdown Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从 2026-05-03 文章和首页归档入口开始，把博客从“复杂前端组件堆叠”改造成“内容优先、Markdown 阅读感、轻量时间线归档 + 卡片预览”的长期研究站。

**Architecture:** 保留静态站架构和现有 SEO / posts-data / sync 流程，不大规模重写历史页面；新增一套低风险的 `blog-reading` 文章样式和 `timeline-archive` 首页组件。文章页用 Markdown-like HTML 语义结构承载内容，首页用日期锚点 + 横向卡片预览替换重日历网格，后续再按需要加入抽卡式内嵌详情。

**Tech Stack:** 原生 HTML/CSS/JavaScript，现有 Python/PowerShell 生成脚本，GitHub Pages 静态发布，无前端框架。

---

## 1. 产品判断

### 1.1 核心方向

这次不是继续给 0501/0502 的复杂样式打补丁，而是换默认生产范式：

1. **文章页优先像 Markdown**：少卡片、少嵌套、少装饰；标题、段落、引用、表格、清单、来源链接清楚即可。
2. **内容密度提高**：每个模块必须写具体解释、判断边界、证据来源和可带走方法，不能用短句卡片撑版面。
3. **首页负责选择，不负责炫技**：首页只帮助读者按日期 / 月份 / 主题快速找到文章，不把大量视觉样式压到内容生产上。
4. **动效只做辅助**：时间线、卡片居中、键盘可达、轻量转场可以做；不让动效反过来决定文章结构。

### 1.2 和用户给出的“抽卡轮播组件”需求的取舍

用户给出的组件规格适合作为首页归档区的长期目标，但第一阶段不应该完整实现所有复杂动效，否则会再次把主要精力消耗在前端上。

第一阶段采用 **MVP 版本**：

- 时间锚点：按 `2026-05 / 2026-04 / 2026-03` 分组。
- 卡片预览：横向滚动，当前卡片居中和轻微高亮。
- 双向联动：点击月份锚点滚到该月首篇；滚动卡片时更新当前月份。
- 打开文章：默认跳转到简洁 Markdown 阅读页，而不是先做全屏内嵌详情。
- 抽卡详情：保留为第二阶段渐进增强，只在基础阅读和首页选择体验稳定后实现。

这样既响应“时间线归档式抽卡预览”的方向，又避免重新陷入 0501/0502 的前端复杂度。

---

## 2. 文件结构与职责

### 新增文件

- `css/blog-reading.css`
  - 文章页 Markdown-like 阅读样式。
  - 只负责 `.blog-reading-page`、`.blog-article`、`.markdown-body`、`.reading-toc` 等类。
  - 不污染 options / learning / legacy 页面。

- `css/timeline-archive.css`
  - 首页时间线归档 + 卡片预览组件样式。
  - 负责时间锚点、横向卡片、当前卡片高亮、响应式布局。

- `js/timeline-archive.js`
  - 从 `window.__POSTS__` 读取文章数据。
  - 构建月份锚点、横向文章卡片、当前卡片联动。
  - 支持点击、键盘、触摸/横向滚动。

- `template/post-reading-template.html`
  - 新文章默认模板。
  - 结构接近 Markdown：hero 更短，正文用语义化 section / h2 / h3 / p / ul / blockquote / table。

- `docs/blog-simplified-standard.md`
  - 新标准文档：从 0503 起的内容与样式规则。
  - 明确“内容优先、Markdown-like、证据边界、少卡片”的写作规范。

### 修改文件

- `index.html`
  - 在 `#archive` 内新增轻量时间线组件容器。
  - 保留 noscript 列表作为 fallback。
  - 第一阶段可以隐藏或下移现有复杂日历，而不是直接删除。

- `js/posts-data.js`
  - 仍由 `scripts/sync-site-data.py` 自动生成，不手写。

- `scripts/sync-site-data.py`
  - 增强首页归档 fallback 文案或数据字段时修改。
  - 避免破坏 JSON-LD 修复逻辑。

- `posts/2026/05/03.html`
  - 第一篇试点：迁移到 `.blog-reading-page` + `.markdown-body` 阅读样式。
  - 内容保留但减少复杂卡片嵌套，改为清晰长文结构。

- `posts/2026/05/01.html`、`posts/2026/05/02.html`
  - 第二批试点：不要求立刻大改内容，但先移除过重视觉依赖，统一到阅读样式。

- `scripts/new-post.ps1`
  - 默认使用 `template/post-reading-template.html`。
  - 提醒写作流程从“填卡片”改为“写 Markdown-like 正文”。

- `scripts/generate_blog_full.py`
  - 中期改造：生成 HTML 时输出阅读型结构，而不是复杂卡片结构。

---

## 3. 阶段路线

## Phase A — 先做 0503 阅读页瘦身

目标：让 0503 成为新文章样式的标杆，读者点开后直接看内容。

### Task 1: 新增 Markdown-like 阅读 CSS

**Files:**
- Create: `css/blog-reading.css`
- Modify: `posts/2026/05/03.html`

- [ ] **Step 1: 新建 `css/blog-reading.css`**

核心样式原则：

```css
:root {
  --reading-bg: #f7f2e8;
  --reading-paper: #fffaf0;
  --reading-text: #232018;
  --reading-muted: #6f6758;
  --reading-line: rgba(35, 32, 24, 0.14);
  --reading-accent: #8a5a24;
  --reading-max: 820px;
  --reading-duration: 180ms;
}

.blog-reading-page {
  background: var(--reading-bg);
  color: var(--reading-text);
}

.blog-reading-page .hero {
  min-height: auto;
  padding: 96px 20px 40px;
  background: transparent;
}

.blog-reading-page .hero-content {
  max-width: var(--reading-max);
  margin: 0 auto;
}

.blog-article,
.markdown-body {
  max-width: var(--reading-max);
  margin: 0 auto;
  padding: 32px 20px 88px;
  font-size: 18px;
  line-height: 1.88;
}

.markdown-body h2 {
  margin: 56px 0 18px;
  padding-top: 16px;
  border-top: 1px solid var(--reading-line);
  font-size: clamp(1.45rem, 2.2vw, 2rem);
  line-height: 1.35;
}

.markdown-body h3 {
  margin: 32px 0 12px;
  font-size: 1.18rem;
}

.markdown-body p,
.markdown-body li {
  color: var(--reading-text);
}

.markdown-body blockquote,
.markdown-callout {
  margin: 28px 0;
  padding: 18px 22px;
  border-left: 4px solid var(--reading-accent);
  background: rgba(138, 90, 36, 0.08);
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 0.94em;
}

.markdown-body th,
.markdown-body td {
  border-bottom: 1px solid var(--reading-line);
  padding: 10px 8px;
  vertical-align: top;
}

.reading-toc {
  max-width: var(--reading-max);
  margin: 0 auto;
  padding: 0 20px 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reading-toc a {
  border: 1px solid var(--reading-line);
  border-radius: 999px;
  padding: 6px 10px;
  color: var(--reading-muted);
  text-decoration: none;
}
```

- [ ] **Step 2: 在 0503 HTML 中加入样式引用**

在 `style.css` 后添加：

```html
<link rel="stylesheet" href="../../../css/blog-reading.css?v=20260503reading1">
```

- [ ] **Step 3: body 加新类**

将：

```html
<body class="post-page post-premium post-0502 post-0503">
```

改为：

```html
<body class="post-page post-premium post-0503 blog-reading-page">
```

- [ ] **Step 4: 先不改正文内容，只用 CSS 覆盖复杂视觉**

第一步只让页面整体变成阅读纸面，降低卡片阴影/圆角/嵌套的视觉噪音。

- [ ] **Step 5: 本地打开 0503 验证**

Run:

```powershell
python -m http.server 8000
```

Open:

```text
http://localhost:8000/posts/2026/05/03.html
```

Expected:
- 首屏更像文章而不是落地页。
- 段落宽度不超过 820px。
- 旧复杂组件仍能显示，但视觉权重降低。

---

### Task 2: 0503 结构瘦身为 Markdown-like 正文

**Files:**
- Modify: `posts/2026/05/03.html`

- [ ] **Step 1: 保留 6 个内容模块，但改表达结构**

最终 0503 正文结构：

```html
<main id="main" class="blog-article markdown-body">
  <section id="pm-dashboard">
    <h2>00 今日 PM 看板</h2>
    <blockquote>今日一句话：AI 主线仍强，但组合动作不能被 capex headline 牵着走；BRK.B 的价值在于提醒我们，现金和等待也是资产。</blockquote>
    <p>...</p>
  </section>

  <section id="stock-pick">
    <h2>01 今日宝藏标的：BRK.B</h2>
    <p>...</p>
    <h3>1. 行业：...</h3>
    <p>...</p>
  </section>

  <section id="lesson">
    <h2>02 一句话硬核投资实战干货</h2>
    <blockquote>如果你说不清下一次加仓比保留现金更划算，那今天最专业的动作可能就是不动。</blockquote>
    <p>...</p>
  </section>

  <section id="creator-digest">
    <h2>03 关注博主 / 本地美投每日摘要</h2>
    <p>...</p>
  </section>

  <section id="market">
    <h2>04 持仓新闻解读 + 观察列表雷达</h2>
    <p>...</p>
  </section>

  <section id="decision-cards">
    <h2>05 持仓动作卡片 + 当日最高优先级</h2>
    <p>...</p>
  </section>
</main>
```

- [ ] **Step 2: 删除或降级过重组件**

优先删除 / 合并这些视觉容器：

```text
pm-dashboard-shell
source-ledger-grid
source-audit-panel
five-plus-grid
creator-card-grid
holding-news-grid
action-card-grid-premium
scenario-matrix
```

替换方式：
- 卡片网格 → `h3 + p + ul`
- 状态卡 → `blockquote` 或小表格
- 动作卡 → Markdown 表格
- 来源台账 → 来源清单

- [ ] **Step 3: 保留内容，不压缩内容**

迁移时不删信息，只减少容器。

例如动作卡改成：

```html
<table>
  <thead>
    <tr><th>持仓</th><th>当前动作</th><th>加仓触发</th><th>暂停/降级触发</th></tr>
  </thead>
  <tbody>
    <tr><td>META</td><td>继续持有</td><td>AI 广告 ROI 与 FCF 变硬</td><td>capex 继续上修但 ROI 不兑现</td></tr>
    <tr><td>NVDA</td><td>持有等待</td><td>客户 ROI / 推理需求 / networking 继续超预期</td><td>2027 后增速或毛利率被重估</td></tr>
    <tr><td>NBIS</td><td>持有观察</td><td>交付、融资、收入、毛利连续兑现</td><td>融资恶化、交付延迟、只剩 backlog 叙事</td></tr>
  </tbody>
</table>
```

- [ ] **Step 4: 文章底部加“来源与边界”**

```html
<section id="sources">
  <h2>来源与边界</h2>
  <ul>
    <li><a href="https://www.berkshirehathaway.com/reports.html">Berkshire Hathaway reports</a>：用于 BRK.B 资本配置与保险浮存金框架。</li>
    <li>...</li>
  </ul>
  <p>周末稿不写未经核验的实时价格；创作者标题层不进入动作结论。</p>
</section>
```

- [ ] **Step 5: 验证 HTML 与可读性**

Run:

```powershell
python .\scripts\sync-site-data.py
.\scripts\qa-site.ps1
```

Expected:
- `Synced 60 posts -> index.html + js/posts-data.js`
- QA 不报 404 / 关键资源缺失。
- 0503 内容不比原文短，但页面 DOM 嵌套明显减少。

---

## Phase B — 新首页归档：从日历格子改为时间线卡片预览

目标：首页只做“快速选择文章”，让读者按月份锚点和卡片预览进入内容页。

### Task 3: 新增时间线归档组件 JS

**Files:**
- Create: `js/timeline-archive.js`
- Modify: `index.html`

- [ ] **Step 1: 在首页新增容器**

放在 `#archive` 的搜索框后、旧 `calendar-section` 前：

```html
<section class="timeline-archive" id="timelineArchive" aria-label="时间线文章归档">
  <div class="timeline-archive-head">
    <div>
      <p class="timeline-kicker">Timeline Archive</p>
      <h3>按月份回看研究，不在日历格子里找文章</h3>
      <p>点击月份锚点定位到当月文章；左右滑动卡片，当前文章自动居中。点开后直接进入简洁阅读页。</p>
    </div>
  </div>
  <div class="timeline-month-nav" id="timelineMonthNav" aria-label="月份锚点"></div>
  <div class="timeline-carousel-wrap">
    <button class="timeline-arrow" id="timelinePrev" type="button" aria-label="上一篇">←</button>
    <div class="timeline-carousel" id="timelineCarousel" tabindex="0" aria-label="文章卡片预览"></div>
    <button class="timeline-arrow" id="timelineNext" type="button" aria-label="下一篇">→</button>
  </div>
</section>
```

- [ ] **Step 2: 引入脚本**

在 `posts-data.js` 后、旧 `main-calendar.js` 前或后加入：

```html
<script src="js/timeline-archive.js?v=20260503timeline1"></script>
```

- [ ] **Step 3: 实现 `TimelineArchive`**

核心 JS：

```js
(function () {
  const posts = window.__POSTS__ || [];
  const nav = document.getElementById('timelineMonthNav');
  const carousel = document.getElementById('timelineCarousel');
  if (!posts.length || !nav || !carousel) return;

  const monthKey = (date) => date.slice(0, 7);
  const monthLabel = (key) => {
    const [year, month] = key.split('-');
    return `${year}年${Number(month)}月`;
  };

  const months = [...new Set(posts.map((post) => monthKey(post.date)))];
  let currentIndex = 0;

  function renderNav() {
    nav.innerHTML = months.map((key, index) => `
      <button class="timeline-month-pill${index === 0 ? ' is-active' : ''}" type="button" data-month="${key}">
        ${monthLabel(key)}
      </button>
    `).join('');
  }

  function renderCards() {
    carousel.innerHTML = posts.map((post, index) => {
      const date = post.date || '';
      const title = post.title || '未命名文章';
      const desc = post.desc || '点击进入全文。';
      const key = monthKey(date);
      return `
        <article class="timeline-card${index === 0 ? ' is-active' : ''}" data-index="${index}" data-month="${key}">
          <a href="${post.url}" class="timeline-card-link">
            <time>${date}</time>
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(desc)}</p>
          </a>
        </article>
      `;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    }[char]));
  }

  function setActive(index, shouldScroll = true) {
    currentIndex = Math.max(0, Math.min(index, posts.length - 1));
    const cards = [...carousel.querySelectorAll('.timeline-card')];
    cards.forEach((card, i) => card.classList.toggle('is-active', i === currentIndex));
    const month = cards[currentIndex]?.dataset.month;
    nav.querySelectorAll('.timeline-month-pill').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.month === month);
    });
    if (shouldScroll && cards[currentIndex]) {
      cards[currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function bind() {
    nav.addEventListener('click', (event) => {
      const button = event.target.closest('.timeline-month-pill');
      if (!button) return;
      const index = posts.findIndex((post) => monthKey(post.date) === button.dataset.month);
      if (index >= 0) setActive(index);
    });

    document.getElementById('timelinePrev')?.addEventListener('click', () => setActive(currentIndex - 1));
    document.getElementById('timelineNext')?.addEventListener('click', () => setActive(currentIndex + 1));

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') setActive(currentIndex - 1);
      if (event.key === 'ArrowRight') setActive(currentIndex + 1);
      if (event.key === 'Enter') carousel.querySelector('.timeline-card.is-active a')?.click();
    });

    carousel.addEventListener('click', (event) => {
      const card = event.target.closest('.timeline-card');
      if (!card) return;
      const index = Number(card.dataset.index);
      if (index !== currentIndex) {
        event.preventDefault();
        setActive(index);
      }
    });
  }

  renderNav();
  renderCards();
  bind();
})();
```

- [ ] **Step 4: 验证首页没有 JS 错误**

Open:

```text
http://localhost:8000/
```

Expected:
- 月份锚点出现。
- 卡片从 0503、0502、0501 开始倒序显示。
- 点击 2026年5月，0503 卡片居中。
- 点击当前卡片进入 0503。

---

### Task 4: 新增时间线归档 CSS

**Files:**
- Create: `css/timeline-archive.css`
- Modify: `index.html`

- [ ] **Step 1: 新建 CSS**

```css
.timeline-archive {
  margin: 32px 0 40px;
  padding: clamp(20px, 4vw, 36px);
  border: 1px solid rgba(35, 32, 24, 0.12);
  background: rgba(255, 250, 240, 0.72);
}

.timeline-archive-head {
  max-width: 760px;
  margin-bottom: 20px;
}

.timeline-kicker {
  margin: 0 0 6px;
  color: var(--accent, #8a5a24);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.timeline-month-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 16px;
  scrollbar-width: thin;
}

.timeline-month-pill {
  flex: 0 0 auto;
  border: 1px solid rgba(35, 32, 24, 0.16);
  background: transparent;
  color: inherit;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
}

.timeline-month-pill.is-active {
  background: #232018;
  color: #fffaf0;
}

.timeline-carousel-wrap {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.timeline-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 18px 4px 26px;
  outline: none;
}

.timeline-card {
  flex: 0 0 min(74vw, 420px);
  scroll-snap-align: center;
  opacity: 0.68;
  transform: scale(0.94);
  filter: blur(0.2px);
  transition: transform 180ms ease-out, opacity 180ms ease-out, filter 180ms ease-out;
}

.timeline-card.is-active,
.timeline-card:hover,
.timeline-card:focus-within {
  opacity: 1;
  transform: scale(1);
  filter: none;
}

.timeline-card-link {
  display: block;
  min-height: 220px;
  padding: 22px;
  border: 1px solid rgba(35, 32, 24, 0.14);
  background: #fffaf0;
  color: inherit;
  text-decoration: none;
}

.timeline-card time {
  color: #8a5a24;
  font-size: 0.9rem;
}

.timeline-card h4 {
  margin: 12px 0;
  font-size: clamp(1.18rem, 2vw, 1.55rem);
  line-height: 1.35;
}

.timeline-card p {
  color: #6f6758;
  line-height: 1.7;
}

.timeline-arrow {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(35, 32, 24, 0.16);
  background: transparent;
  cursor: pointer;
}

@media (max-width: 720px) {
  .timeline-carousel-wrap {
    grid-template-columns: 1fr;
  }
  .timeline-arrow {
    display: none;
  }
  .timeline-card {
    flex-basis: 84vw;
  }
}
```

- [ ] **Step 2: 首页引入 CSS**

```html
<link rel="stylesheet" href="css/timeline-archive.css?v=20260503timeline1">
```

- [ ] **Step 3: 旧日历降权**

第一阶段不要删除旧日历。给 `calendar-section` 加一个说明或折叠：

```html
<details class="legacy-calendar-details">
  <summary>需要传统月历视图？展开这里</summary>
  <div class="calendar-section" id="calendarSection">...</div>
</details>
```

如果改动风险太高，先只在 CSS 中：

```css
.calendar-section {
  margin-top: 28px;
  opacity: 0.78;
}
```

- [ ] **Step 4: 验证 PC / mobile**

Expected:
- PC 可点击左右箭头。
- Mobile 可横向滑动。
- 当前卡片视觉突出，但不花哨。
- 首页文章选择比旧日历更直观。

---

## Phase C — 0501 / 0502 回收成阅读型，不让它们继续当复杂样式标杆

### Task 5: 给 0501 / 0502 套用阅读样式

**Files:**
- Modify: `posts/2026/05/01.html`
- Modify: `posts/2026/05/02.html`

- [ ] **Step 1: 添加 `blog-reading.css`**
- [ ] **Step 2: body 添加 `blog-reading-page`**
- [ ] **Step 3: 降低旧卡片网格视觉权重**
- [ ] **Step 4: 不压缩正文内容，只改可读性**
- [ ] **Step 5: 对比 0501 / 0502 / 0503 三页首屏与正文节奏**

Expected:
- 三页像同一套阅读系统。
- 0501/0502 不再显得像复杂前端模板展示页。
- 内容质量问题留给 Phase D，不和样式改造混在一起。

---

## Phase D — 改写生产标准：以后默认写内容，而不是写组件

### Task 6: 新增简化博客标准文档

**Files:**
- Create: `docs/blog-simplified-standard.md`
- Modify: `docs/blog-premium-standard.md`

- [ ] **Step 1: 写入新规则**

```markdown
# Blog Simplified Standard

## 默认页面结构

- Hero 只放标题、副标题、日期、3-5 个目录锚点。
- 正文只使用 h2 / h3 / p / ul / ol / blockquote / table / source list。
- 禁止为了视觉丰富而创建多层卡片网格。
- 每个模块至少有 2-4 段具体解释，不能只写短句。
- 来源和判断边界必须在模块内或文末出现。

## 文章质量优先级

1. 事实是否可核验
2. 判断是否具体
3. 对持仓动作有没有边界
4. 是否留下可复用方法
5. 页面是否易读
6. 视觉是否高级

视觉永远排在内容之后。
```

- [ ] **Step 2: 在旧 premium standard 顶部标注迁移方向**

加入：

```markdown
2026-05-03 update: default daily blog output is migrating to `blog-simplified-standard.md`. Premium visual components are no longer the default; use them only when they improve comprehension.
```

---

### Task 7: 更新新文章脚手架

**Files:**
- Create: `template/post-reading-template.html`
- Modify: `scripts/new-post.ps1`

- [ ] **Step 1: 从 0503 瘦身后结构抽出新模板**
- [ ] **Step 2: `new-post.ps1` 默认模板改为 `template/post-reading-template.html`**
- [ ] **Step 3: 保留旧模板为 legacy，不删除**
- [ ] **Step 4: 创建一篇测试草稿验证模板路径**

Run:

```powershell
.\scripts\new-post.ps1 -Date 2026-05-04
```

Expected:
- 生成 0504 reading template。
- 默认包含 5 模块结构。
- 不再生成复杂卡片 scaffold。

---

## Phase E — 抽卡式详情页作为渐进增强，而不是第一阶段阻塞项

### Task 8: 评估是否加入内嵌详情 overlay

**Files:**
- Modify: `js/timeline-archive.js`
- Modify: `css/timeline-archive.css`

- [ ] **Step 1: 先确认首页卡片 + 文章跳转体验是否足够好**
- [ ] **Step 2: 如果需要，再做 overlay**

MVP overlay 行为：

- 点击当前卡片时 fetch 对应 HTML。
- 提取 `<main id="main">` 内容。
- 从底部 slide up 成 90vh 阅读面板。
- ESC / close button / 下滑关闭。
- 如果 fetch 失败，回退为正常链接跳转。

明确不在第一阶段做：
- 虚拟滚动。
- 复杂 3D 抽卡。
- 横纵向可配置框架。
- 独立路由系统。

原因：目前文章数量约 60 篇，简单 DOM 足够；虚拟滚动和复杂动效会增加维护成本，违背“内容优先”。

---

## 4. 验证清单

### 本地验证

Run:

```powershell
python .\scripts\sync-site-data.py
.\scripts\qa-site.ps1
python -m http.server 8000
```

Manual checks:

```text
http://localhost:8000/
http://localhost:8000/posts/2026/05/03.html
http://localhost:8000/posts/2026/05/02.html
http://localhost:8000/posts/2026/05/01.html
```

Expected:
- 首页时间线从 0503 / 0502 / 0501 开始。
- 点击卡片能进入对应文章。
- 月份锚点能切换当前卡片。
- 文章正文更像 Markdown 阅读页。
- 搜索和 noscript fallback 不损坏。
- SEO meta / JSON-LD 仍在。

### 内容验证

0503 必须满足：

- BRK.B 不是交易动作，而是 case-study。
- META / NVDA / NBIS 才是真实持仓动作卡。
- TSM / MSFT / GOOGL / UNH / VST / LLY 是观察雷达，不写买卖。
- 创作者层没有 transcript 时明确降级。
- 来源清单保留。
- 正文信息量不比现有版本低。

---

## 5. 推荐执行顺序

1. `css/blog-reading.css` + 0503 body/link：先让新阅读感落地。
2. 0503 DOM 瘦身：把复杂卡片改为 Markdown-like 正文。
3. `timeline-archive.css/js` + 首页容器：做新首页入口。
4. 0501/0502 套阅读样式：停止旧复杂标杆继续扩散。
5. 新标准文档 + 新模板：让 0504 以后默认走内容优先。
6. 评估抽卡 overlay：只在基础体验稳定后做。

---

## 6. 关键风险与控制

- **风险：误删内容。** 控制：先迁移结构，不删信息；每个模块迁移后人工对照原文。
- **风险：编码事故。** 控制：不要用 PowerShell `Set-Content` 批量重写 HTML；优先用 Python `read_text/write_text(encoding='utf-8')` 或精确文件编辑。
- **风险：首页双归档冲突。** 控制：第一阶段保留旧日历 fallback，只把新时间线放在前面。
- **风险：又做成复杂前端。** 控制：抽卡 overlay、虚拟滚动、复杂配置全部放 Phase E，不阻塞第一阶段。
- **风险：内容继续变短。** 控制：新标准明确“每个模块要有具体解释”，视觉不再替代内容。

---

## 7. 执行 handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-03-blog-simplified-markdown-timeline.md`.

Recommended execution mode: Subagent-Driven, task by task, with visual QA after Task 2 and Task 4.
