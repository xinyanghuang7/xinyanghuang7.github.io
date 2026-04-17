# UI Micro Backlog

## Locked Working Mode
- Mode: **B**
- Cadence: **one UI micro-fix per 20 minutes**
- Publish policy: **publish immediately after pass**
- Scope rule: **no new content, no large layout rewrite, no blind online edits**
- Acceptance gate:
  1. local QA must pass
  2. live changed page must be checked
  3. previously published pages must also be rechecked
  4. any garble / mojibake / replacement char = fail

## Mandatory Recheck Set After Every Publish
- `https://4fire.qzz.io/`
- `https://4fire.qzz.io/options/`
- changed live page
- previous published page 1
- previous published page 2

If the change is in shared CSS / JS, recheck both blog and options surfaces.

---

## Priority A — Shared Surfaces First

### 1) Mobile quick-nav tap target polish
- **Target files:** `css/style.css`, maybe `js/main.js`
- **Surface:** blog + options shared quick nav
- **Expected outcome:** mobile nav links become easier to tap, less accidental misses, no overlap with sticky header offset
- **Regression pages:** `/`, `/options/`, one recent blog post, one recent options chapter

### 2) Sticky offset consistency audit
- **Target files:** `css/style.css`
- **Surface:** sticky header + anchor landing offsets
- **Expected outcome:** anchor jumps no longer land under sticky header / quick nav
- **Regression pages:** `/options/`, recent blog post with quick nav, recent options chapter

### 3) Shared card spacing normalization
- **Target files:** `css/style.css`
- **Surface:** homepage cards, options overview cards, article support cards
- **Expected outcome:** card padding and vertical rhythm feel unified, less crowded
- **Regression pages:** `/`, `/options/`, one recent article page

### 4) Shared button / link affordance contrast
- **Target files:** `css/style.css`
- **Surface:** action links, pills, quick-nav links
- **Expected outcome:** hover / focus / active state is clearer without overbright gold glow
- **Regression pages:** `/`, `/options/`, one recent options chapter

### 5) Light-mode contrast cleanup
- **Target files:** `css/style.css`
- **Surface:** search, metadata, pills, low-contrast secondary text
- **Expected outcome:** light mode remains readable, especially meta text and card desc text
- **Regression pages:** `/`, `/options/`, one recent blog post

---

## Priority B — Homepage

### 6) Hero text density rebalance
- **Target files:** `index.html`, `css/style.css`
- **Surface:** homepage hero
- **Expected outcome:** title / tagline / description hierarchy feels cleaner and less stacked
- **Regression pages:** `/`, previous homepage-linked recent post pages

### 7) Search panel readability polish
- **Target files:** `css/style.css`, maybe `js/main.js`
- **Surface:** homepage archive search
- **Expected outcome:** results are easier to scan, status text less noisy, active result more obvious
- **Regression pages:** `/`, one recent article result target, one older article target

### 8) Archive card metadata hierarchy
- **Target files:** `css/style.css`
- **Surface:** homepage archive items / calendar-linked list view
- **Expected outcome:** date, title, summary, arrow each have clearer priority
- **Regression pages:** `/`, `/posts/2026/04/16.html`, `/posts/2026/04/15.html`

---

## Priority C — Blog Reading Experience

### 9) Article body width and paragraph rhythm tuning
- **Target files:** `css/style.css`
- **Surface:** recent article page body
- **Expected outcome:** less visual fatigue, better line length, less cramped paragraph stack
- **Regression pages:** `/posts/2026/04/16.html`, `/posts/2026/04/15.html`, `/posts/2026/04/14.html`

### 10) Author / footer quieting pass
- **Target files:** `css/style.css`
- **Surface:** article footer / author block
- **Expected outcome:** support info is present but does not compete with article content
- **Regression pages:** two recent blog posts + homepage

---

## Priority D — Options Course

### 11) Options index overview card polish
- **Target files:** `template/options-course-index.html`, `css/style.css`
- **Surface:** `/options/` overview cards and chapter directory cards
- **Expected outcome:** card hierarchy becomes more stable across different text lengths
- **Regression pages:** `/options/`, `/options/01.html`, `/options/27.html`

### 12) Chapter prev/next navigation clarity
- **Target files:** `template/options-chapter.html`, `css/style.css`
- **Surface:** chapter bottom navigation
- **Expected outcome:** previous / catalog / next feels clearer and easier to scan on mobile
- **Regression pages:** `/options/01.html`, `/options/02.html`, `/options/27.html`

---

## Per-Round Template
- **Issue:**
- **Why now:**
- **Files touched:**
- **Local QA:** `pwsh -File scripts/qa-site.ps1`
- **Live recheck pages:**
- **Garble check:** pass / fail
- **Previous published pages rechecked:** yes / no
- **Next 3 candidates:**

## Round Log

### 2026-04-17 20:05 Asia/Shanghai — Article body width and paragraph rhythm tuning
- **Issue:** 最近几篇长文的主体阅读面已经比早期稳定很多，但正文里几类高频文字块的行宽和段间节奏仍略微偏散：`section subtitle` 容易一口气铺太宽，`analysis-box / highlight-box / wisdom / news` 里的正文段落在桌面端也偶尔显得横向拉得太开，读起来不像“看不清”，而是会增加一点扫读疲劳。
- **Why now:** 这是 backlog 当前最值钱、又足够安全的阅读体验微问题。只做共享 CSS 的文字宽度与段落节奏收口，不改任何文案、不改卡片结构、不碰首页和课程页的信息架构。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** pending
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/posts/2026/04/15.html`
- **Garble check:** pending
- **Previous published pages rechecked:** pending
- **Result:** pending
- **Next 3 candidates:**
  1. Archive card metadata hierarchy
  2. Shared button / link affordance contrast（轻量复核）
  3. Sticky offset consistency audit（只在复现后再改）

### 2026-04-17 17:25 Asia/Shanghai — Hero text density rebalance
- **Issue:** 首页 hero 的 `subtitle / 标题 / 引语 / 描述` 都是对的，但首屏纵向堆叠有点重：标题宽度偏散、引语和说明都在抢第二层级，读起来像一层层往下压，而不是先抓主标题再自然落到说明。
- **Why now:** 这是 backlog 当前最值钱的首页微问题，而且可以继续用最小共享层改动收口。只动 `css/style.css` 里的 hero 节奏与层级，不改首页内容，不改信息架构，也不顺手扩到 about / archive 区。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `ff2faa7` (`style: rebalance homepage hero density`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/options/01.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?v=20260404fix1&oc=1725b` contains the new hero eyebrow / title width / tagline width / description width rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把首页 hero 的层级收紧了一格：subtitle 变成更轻的 eyebrow，主标题行宽更集中，引语和正文说明的宽度与间距也更克制；整体信息没变，但首屏更像“先抓标题，再落到方法和定位”，不再显得一层层堆太满。
- **Next 3 candidates:**
  1. Article body width and paragraph rhythm tuning
  2. Shared button / link affordance contrast（轻量复核）
  3. Archive card metadata hierarchy

### 2026-04-17 17:05 Asia/Shanghai — Chapter prev/next navigation clarity
- **Issue:** 期权章节页底部的 `上一章 / 返回课程 / 下一章` 三栏导航虽然信息齐全，但标题、主链接、说明文字的层级还不够利落；尤其在手机上，三栏并排时更像三个相近文本块，扫读和点按都不够从容。
- **Why now:** 这是 backlog 当前最值钱、且适合继续留在共享 CSS 的 options 微问题。只做 `chapter nav` 的层级和 mobile 布局收紧，不改 HTML，不动课程结构，也不顺手扩成别的卡片修饰。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `7f4b407` (`style: clarify chapter nav rhythm`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/options/01.html`, `https://4fire.qzz.io/options/02.html`, `https://4fire.qzz.io/options/27.html`, `https://4fire.qzz.io/posts/2026/04/17.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?v=20260326review3&oc=1705a` contains the new `chapter-nav-grid` / `chapter-nav-link` mobile-stack and touch-target rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把章节底部导航的标题-链接-说明层级拉开了一点：link 本身更像可点主动作，说明文字行长更稳，slot 背景与内边距更统一；同时在 mobile breakpoint 下改成单列堆叠，让 `上一章 / 返回课程 / 下一章` 不再挤在一排里，扫读和拇指点按都更顺。
- **Next 3 candidates:**
  1. Hero text density rebalance
  2. Article body width and paragraph rhythm tuning
  3. Shared button / link affordance contrast（第二轮只做轻量复核）

### 2026-04-17 16:05 Asia/Shanghai — Mobile quick-nav tap target polish
- **Issue:** 底部悬浮 quick nav 已经能用，但在手机上仍有一点“能点到，但不够从容”的感觉：pill 之间间隙偏紧、左右边缘缓冲不够，短手势下更容易点偏或蹭到相邻项。
- **Why now:** 这是 backlog 当前最值钱的共享层问题，而且 sticky offset 之前已经单独收过；这轮只做 mobile breakpoint 下的触控面积和滚动缓冲增强，不碰桌面端，不改结构，不动锚点逻辑。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `5581ca5` (`style: improve mobile quick nav tap targets`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/options/01.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/options/27.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?v=20260326review3&oc=1605a` contains the new mobile quick-nav width / gap / touch-target rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把 mobile quick nav 的可点区域和边缘缓冲抬了一档：nav 容器更贴近屏宽但保留安全边距，pill 之间留出更稳的触控缝隙，link 的最小高度和横向 padding 也更大一点；整体还是原设计，只是手机上更不容易误触。
- **Next 3 candidates:**
  1. Chapter prev/next navigation clarity
  2. Hero text density rebalance
  3. Article body width and paragraph rhythm tuning

### 2026-04-17 15:45 Asia/Shanghai — Author / footer quieting pass
- **Issue:** 最近几轮已经把 shared cards、search、anchor offset 这类高频交互面收紧了，但文章尾部的 support info 还略显抢戏：author block 的金色头像和底板存在感偏强，全站 footer 的顶部金线、padding 和免责声明块也比正文收尾更“喊”。内容没错，只是尾声没有足够安静。
- **Why now:** 这项是 backlog 里当前最值钱、又足够安全的共享层小问题。只做 `css/style.css` 里的 author / footer 降噪，不改任何 HTML，不碰正文节奏，也不去重做尾部组件。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `e5de242` (`style: quiet author and footer surfaces`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/options/01.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?v=20260326review3&oc=1545d` contains the new quieter author / footer rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把 author block 和全站 footer 的视觉音量往下收了一格：author 卡片底板、边框和头像高光更克制，footer 的顶部金线、内边距、字距和免责声明块也更安静；support info 还在，但不再和正文争层级。
- **Next 3 candidates:**
  1. Mobile quick-nav tap target polish
  2. Chapter prev/next navigation clarity
  3. Hero text density rebalance

### 2026-04-17 15:25 Asia/Shanghai — Shared card spacing normalization
- **Issue:** 共享层几类高频卡片虽然各自已经能用，但细看会发现节奏不完全在一个档位上：首页 archive cards、文章里的 stat / decision cards、以及 rating support card 的内边距和圆角有点各走各的，结果是页面切换时会有轻微的“这块更挤 / 那块更松”的感觉。
- **Why now:** sticky offset 这轮已经收过，接下来最值钱、又适合继续落在共享 CSS 的，就是把这几类常见卡片的 spacing 往同一档靠。只动 padding / radius / margin，不动结构、不改内容，也不重新做卡片体系。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `3468b8b` (`style: normalize shared card spacing`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/posts/2026/04/15.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?oc=1525b` contains the new archive / stat / decision / rating card spacing rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把首页 archive item、正文里的 post stat card / decision detail card / article rating card 的 padding、圆角和竖向留白往 options 页那种较稳定的 `space-lg` 节奏靠了一格，让共享卡片在不同页面之间切换时不那么一块松一块紧。
- **Next 3 candidates:**
  1. Author / footer quieting pass
  2. Mobile quick-nav tap target polish
  3. Chapter prev/next navigation clarity

### 2026-04-17 15:00 Asia/Shanghai — Sticky offset consistency audit
- **Issue:** 之前已经把 mobile quick nav 改成底部悬浮，但锚点落点仍沿用桌面口径的 `header + quick nav + gap` 统一 offset。结果是在手机上点 quick nav / 目录跳转时，页面会被“多推下去一截”，体感像落点不稳、章节没贴住预期位置。
- **Why now:** 这是 backlog 里当前最值钱的共享层问题，而且这轮已经能确认根因，不再只是抽象 audit。最小修正就是只在 mobile breakpoint 下把 anchor offset 改回“只算顶部真正遮挡的 header + 小缓冲”，不去碰桌面 sticky quick nav 本身。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `b952384` (`style: tune mobile anchor offset`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/options/01.html`, `https://4fire.qzz.io/options/27.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?oc=1500c` contains the mobile `calc(var(--oc-header-height) + 18px)` anchor-offset override together with the shared `scroll-margin-top` rule.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把根因收敛到了一个很小的共享变量修正：在 `@media (max-width: 768px)` 下，把 `--oc-anchor-offset` 从桌面逻辑改成 `header + 18px`，让移动端的锚点落点不再把底部 quick nav 也误算成顶部遮挡。
- **Next 3 candidates:**
  1. Shared card spacing normalization
  2. Author / footer quieting pass
  3. Mobile quick-nav tap target polish

### 2026-04-17 14:58 Asia/Shanghai — Search panel readability polish
- **Issue:** 首页 archive search 虽然结构已经完整，但结果项扫读节奏还是有点散：日期、标题、摘要之间的层级不够稳，空结果态也有点像一段裸文字；整体属于“能用，但还不够顺眼”。
- **Why now:** backlog 里这项是当前最安全、最适合继续落在共享 CSS 的小问题；刚做完 light-mode 对比度补强，这轮顺着同一块表面继续把结果列表的可扫读性往上提一档，不碰信息架构也不碰搜索逻辑。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `dcf3b3e` (`style: polish search panel readability`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/posts/2026/04/15.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; cache-busted live `https://4fire.qzz.io/css/style.css?oc=1458` contains the new search-result spacing / `text-wrap: pretty` / `max-width: 60ch` / `search-no-results` rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把 search result item 改成了更稳定的纵向节奏：轻微加大结果项内间距，压实日期 / 标题 / 摘要的层级，给空结果态补上更像组件的底板；同时略增强 light-mode 下 active result 的边界和阴影，让“当前结果”更容易被一眼扫到。
- **Next 3 candidates:**
  1. Sticky offset consistency audit（继续只做根因查验，不盲改共享 offset）
  2. Shared card spacing normalization
  3. Author / footer quieting pass

### 2026-04-17 14:40 Asia/Shanghai — Light-mode contrast cleanup
- **Issue:** 共享 light mode 里，搜索框、搜索状态行和文章 meta chips 虽然已经有浅色皮肤，但对比度还是偏保守：输入框边界有点虚，状态提示和 chips 在浅底上不够稳，扫读时“能看见”和“好读”之间还差一格。
- **Why now:** backlog 里这是当前足够安全、又能继续落在共享 CSS 的一项小修；而 sticky offset 还没收敛出足够安全的根因，这轮先不碰全局锚点逻辑，转去做低风险高频面的可读性补强。
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `a1f4715` (`style: tighten light-mode contrast surfaces`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/17.html`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/posts/2026/04/15.html`
- **Garble check:** pass — all sampled live pages returned 200 with no replacement char (`�`) or high-risk mojibake tokens; live `https://4fire.qzz.io/css/style.css` contains the new light-mode rules for `search-meta-row`, stronger search border, and brighter shortcut / meta chip surfaces.
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮把 light mode 的共享文本与表面层次往上提了一档：略微提高 `--text-tertiary / --text-muted` 对比度，增强搜索框边界和 light-mode shortcut hint / meta pills / article meta chips 的辨识度；没有改结构，只把浅色模式的“读感虚”收紧。
- **Next 3 candidates:**
  1. Sticky offset consistency audit（继续只做根因查验，不盲改共享 offset）
  2. Shared card spacing normalization
  3. Search panel readability polish

### 2026-04-17 14:07 Asia/Shanghai — Options index overview card polish
- **Issue:** `/options/` 上 overview cards / chapter directory cards 因为标题、描述、列表长度不同，内部节奏有点飘：有些卡片的 meta / action 区离正文太远，有些又显得更挤，扫读时层级不够稳。
- **Why now:** backlog 里这是当前足够值钱、又能安全收口的一项小问题；而且这个页面本身带了局部 inline style，继续在共享 CSS 上硬压不合适，这轮改成页级 / template 里做最小修正更稳。
- **Files touched:** `options/index.html`, `template/options-course-index.html`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `e7247e8` (`style: stabilize options index card rhythm`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/01.html`, `https://4fire.qzz.io/options/27.html`
- **Garble check:** pass — live `/options/` raw HTML contains the new rules (`margin-top: auto;`, `gap: 0.85rem;`, `margin: 0.15rem 0 0;`), sampled pages returned 200, and no replacement char (`�`) or high-risk mojibake tokens were detected in raw HTML checks
- **Previous published pages rechecked:** yes
- **Result:** pass — 这轮没有改内容和信息架构，只把 options index 卡片改成更稳定的纵向节奏：卡片内部统一用 column flow，列表/元信息更贴近正文，底部 action 区改为自动贴底，不同字数的卡片在同一排里更不容易一张松一张紧。
- **Next 3 candidates:**
  1. Sticky offset consistency audit（先把 hash 落点根因继续查清）
  2. Shared card spacing normalization
  3. Light-mode contrast cleanup

### 2026-04-17 13:20 Asia/Shanghai — Homepage archive card metadata hierarchy (publish retry + live recheck)
- **Issue:** homepage archive cards still needed the already-prepared hierarchy polish to actually land online: date badge and arrow were a bit too visually loud versus title and summary.
- **Why now:** the previous round had already finished the safest CSS-only polish locally and passed QA, but publish was blocked by GitHub connectivity. The highest-value move this round was to ship that exact micro-fix instead of opening a new UI issue.
- **Files touched:** none this round; shipped existing `css/style.css` change from commit `fc515b8` (`style: refine archive card hierarchy`)
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** `git push origin main` → PASS (`04f03bc..fc515b8`)
- **Live recheck pages:** `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/posts/2026/04/15.html`, `https://4fire.qzz.io/options/01.html`
- **Garble check:** pass — remote HTML / CSS fetches returned 200, no replacement char (`�`) and no high-risk mojibake tokens were detected in sampled pages or shared CSS
- **Previous published pages rechecked:** yes
- **Result:** pass — homepage archive cards now ship with slightly quieter date badges, a clearer title-vs-summary hierarchy, and a more secondary arrow treatment. Shared CSS on the live domain also contains the new archive hierarchy rules (`opacity: 0.58`, `font-size: 1.06rem`), so this round is now genuinely online rather than only local.
- **Next 3 candidates:**
  1. Sticky offset consistency audit (debug root cause first)
  2. Shared card spacing normalization
  3. Light-mode contrast cleanup

### 2026-04-17 00:40 Asia/Shanghai — Homepage archive card metadata hierarchy
- **Issue:** homepage archive cards made the date badge and arrow feel a bit too visually loud versus title and summary; this round narrowed to hierarchy polish only.
- **Why now:** after the shared affordance pass, this was the next safest high-value homepage micro-fix that could stay inside shared CSS without touching markup or information architecture.
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** local commit created `fc515b8` (`style: refine archive card hierarchy`), but push to `origin/main` failed twice due to GitHub connectivity (`Recv failure: Connection was reset` / `Could not connect to server`)
- **Live recheck pages:** not run — publish did not complete, so remote verification would be misleading
- **Garble check:** local QA pass; live garble check pending because this round is unpublished
- **Previous published pages rechecked:** no — blocked before publish
- **Result:** blocked / not shipped — local CSS now de-emphasizes the date badge slightly, lifts title readability, quiets summary text, and makes the arrow feel more like a secondary affordance, but none of this counts as complete until push + live recheck succeed.
- **Next 3 candidates:**
  1. Retry publish and full live recheck for this archive hierarchy pass
  2. Sticky offset consistency audit (debug root cause first)
  3. Shared card spacing normalization

### 2026-04-17 00:20 Asia/Shanghai — Shared button / link affordance contrast
- **Issue:** shared interactive links on blog / options surfaces were a bit too close to plain text state; hover and keyboard focus mostly changed color, but the trigger feel was still weak.
- **Why now:** after the sticky-offset audit stayed blocked, this was the next highest-value shared-surface fix with low structural risk: improve affordance clarity without touching layout or information architecture.
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `a7d602c` (`style: clarify shared link interaction states`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/options/01.html`, `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/posts/2026/04/15.html`
- **Garble check:** pass — titles and body text loaded normally on all sampled pages; no visible `�`, no obvious mojibake, and remote CSS matched the new affordance rules.
- **Previous published pages rechecked:** yes
- **Result:** pass — quick-nav hover/focus now has clearer border/background separation, and course action / nav links have a more obvious interactive state without turning into bright CTA blocks or disturbing layout.
- **Next 3 candidates:**
  1. Sticky offset consistency audit (debug root cause first)
  2. Homepage archive card metadata hierarchy
  3. Shared card spacing normalization

### 2026-04-17 00:00 Asia/Shanghai — Sticky offset consistency audit (inspection only, no publish)
- **Issue:** verify whether sticky header + quick-nav anchor landing is actually stable before touching shared CSS again.
- **Why now:** this was the next Priority A candidate after the quick-nav tap-target pass, but it is only worth changing if a concrete landing bug is reproduced.
- **Files touched:** none
- **Evidence collected:** mobile hash-anchor screenshots sampled on `https://4fire.qzz.io/posts/2026/04/16.html#wisdom`, `https://4fire.qzz.io/posts/2026/04/16.html#decision-cards`, `https://4fire.qzz.io/options/01.html#chapter-content`, `https://4fire.qzz.io/options/01.html#chapter-navigation`
- **Finding:** `#decision-cards` and `#chapter-content` showed suspicious blank-top / unstable first-screen behavior in headless mobile capture, but root cause is not yet isolated enough to justify a shared CSS/JS edit.
- **Garble check:** pass — no visible `�` / mojibake surfaced during this audit.
- **Result:** blocked / no safe fix shipped this round. Need one focused debugging pass on hash-load + sticky behavior before changing offsets globally.
- **Next 3 candidates:**
  1. Sticky offset consistency audit (debug root cause first)
  2. Shared button / link affordance contrast
  3. Homepage archive card metadata hierarchy

### 2026-04-16 23:45 Asia/Shanghai — Mobile quick-nav tap target polish
- **Issue:** mobile `article-quick-nav` links on blog / options surfaces were a bit tight for thumb taps; keep the same structure, only slightly enlarge the tap area and reduce crowding.
- **Why now:** this is Priority A shared surface work, low-risk, and worth fixing early because it affects both blog reading and options course navigation.
- **Files touched:** `css/style.css`
- **Local QA:** `powershell.exe -ExecutionPolicy Bypass -File scripts/qa-site.ps1` → PASS
- **Publish:** committed `96da428` (`style: improve mobile quick-nav tap targets`) and pushed to `main`
- **Live recheck pages:** `https://4fire.qzz.io/posts/2026/04/16.html`, `https://4fire.qzz.io/`, `https://4fire.qzz.io/options/`, `https://4fire.qzz.io/posts/2026/04/15.html`, `https://4fire.qzz.io/options/01.html`
- **Garble check:** pass — titles/body text loaded normally, no visible `�`, no obvious mojibake, remote CSS also confirmed to contain the new mobile quick-nav values.
- **Previous published pages rechecked:** yes
- **Result:** pass — mobile quick-nav remains bottom-docked, no overlap/clipping observed in sampled pages, and tap targets are slightly larger without changing information structure.
- **Next 3 candidates:**
  1. Sticky offset consistency audit
  2. Shared button / link affordance contrast
  3. Homepage archive card metadata hierarchy
