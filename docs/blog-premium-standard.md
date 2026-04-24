# Blog Premium Standard

Single source of truth for the public blog / options-course output standard.

Last updated: 2026-04-24
Public domain: `https://4fire.qzz.io/`

## 0.0424 velvet-note style freeze

The public site has now moved from the earlier 0419/0420 premium closure into a stricter **Velvet Note** finish layer.

This is a style-system upgrade, **not** a content-system rewrite.
The following must stay unchanged unless the user explicitly asks otherwise:
- homepage information architecture
- the frozen daily blog 4-module contract
- the 5+2 depth requirement inside Module 1
- the existing investing-system / blog / options-course / knowledge-routing relationship
- the teaching-first writing rhythm already established by 0419 / 0423 quality passes

What changes at 0424 is the surface language:
- matte-black stage-like background
- shallow ivory / parchment reading accents
- gold hierarchy accents
- burgundy interaction states
- sharper, calmer geometry with **far fewer rounded rectangles**
- more immersive hero treatment, richer texture/grain, and stronger first-screen identity
- premium lesson-page feel for options chapters while keeping the same knowledge standard

Hard rule: learn from strong references, but do **not** mechanically clone them. Absorb hierarchy, atmosphere, materials, motion, and spacing quality while keeping the site’s own investment / teaching tone.

The current default public-site style should now inherit these closure principles:
- calm, spacious reading geometry
- fewer, larger, flatter / sharper surfaces instead of nested rounded cards
- strong title/body hierarchy
- obvious section rhythm and edge spacing
- interaction polish without gimmick overload
- the page should feel like it is teaching one coherent idea, not dumping many tiny fragments

Do not regress into dense patchwork layouts, over-nested rounded rectangles, decorative card spam, or stylish-but-empty filler lines.

## 0. Shared workflow / shared product rule

The public blog, homepage, and options-course are **one product surface**, not three unrelated outputs.

Default execution chain:
1. **refresh upstream truth**
   - investing-system state
   - holdings / action truth
   - current-move ranking from `real-time-thesis-monitor` when freshness matters
2. **draft / revise the page**
   - blog post via `us-stock-blog`
   - course / options page via shared frontend layer
3. **specialist review before release wording hardens**
   - `blog-reviewer` for fact / compliance / investment-logic errors
   - `blog-semantic-reviewer` for thin explanation / template-feel / weak prose load-bearing
4. **shared frontend close**
   - mobile + desktop
   - light + dark
   - quick-nav / meta bar / sticky UI / card containment / visual balance
5. **publish + verify live**
   - local QA (`xinyanghuang7.github.io/scripts/qa-site.ps1`)
   - shared-brain back-propagation gate (`python scripts/investing/validate_blog_backprop_diff.py --base-ref HEAD` when blog HTML changed)
   - GitHub remote updated
   - live domain updated
   - final pass through `strict-site-reviewer`

### Default anti-drift rule
- Do not let drafting skip upstream truth refresh.
- Do not let reviewer skills silently replace each other.
- Do not let a visually nicer page bypass live verification.
- Do not let options-course polish drift into a second visual system unrelated to the blog.
- Do not let changed blog HTML skip shared-brain back-propagation validation.

## 0.3 Shared-brain / full-knowledge rule

The blog system, the investing system, the learning system, and the options-course are part of one shared knowledge product.

Mandatory rule:
- before writing, revising, or making action language more concrete, reuse **all relevant existing knowledge**, not just the newest fragment found fastest
- previously learned frameworks, ticker notes, portfolio context, method notes, and options-course concepts should be treated as reusable upstream assets
- do not write as if today's page lives alone; it must connect to the broader investing workflow and help the user see that workflow more clearly
- if a new article reveals a durable framework or better decision boundary, write it back into the shared system instead of letting it stay trapped inside one post

Hard failure patterns:
- ignoring older but still-relevant knowledge because the latest note is easier to use
- producing a page that sounds smooth but is disconnected from the investing workflow
- turning the blog into a pile of standalone observations instead of a compounding knowledge system

## 0.5 Daily learning / teaching rule

The daily blog is not only a publishing surface. It is also a **daily learning surface** for the user.

That means every post should help the reader do at least one of these:
- learn one new reusable investing idea
- sharpen one existing judgment boundary
- see how one method maps into a real holding / watchlist / action decision
- gradually build a more personal investing framework instead of passively consuming updates

Default expression rule:
- **Module 2 teaches the method**
- **Module 3 shows how that method helps explain today's holdings / debate / news**
- **Module 4 reduces it to action boundary and next move**

Writing-quality rule:
- the site is for **teaching useful investing knowledge**, not producing decorative short lines
- avoid empty motivational phrasing, low-information micro-sentences, and paragraphing that looks premium but says little
- every major section should leave the reader with something reusable: a method, a boundary, a comparison lens, a workflow step, or a decision rule
- if a section still reads like short polished fragments instead of real explanatory prose, it is not finished even if the structure markers are present

If a post only updates what happened today but does not help the reader think better next time, it is incomplete.

## 1. Four-part frozen contract

Every daily post must contain all 4 parts. No silent downgrade.

### 1.0 Pre-push structure gate
Before any blog page is pushed, do one explicit structure pass on the final HTML and confirm:
- the 4 modules appear in the fixed order: Module 1 → Module 2 → Module 3 → Module 4
- Module 1 still shows the full 5+2 backbone
- Module 2 still carries one reusable takeaway sentence and a concrete judgment rule
- Module 3 still writes holdings only and keeps source links whenever available
- Module 4 still uses the decision-card / holding-map scaffold and includes 当前桶位 / 核心变量 / 不要误读 / 下一步 / 当前最重要的一件事

If any of these regress, the page is not publish-ready.

### Module 1 — 今日宝藏标的
- Must use the full **5+2** structure:
  1. 行业分析
  2. 商业模式
  3. 管理层与治理
  4. 财报健康度
  5. 估值分析
  6. 投资逻辑（Why now）
  7. 投资风险
- Must be detailed, not a thin 3-bullets summary.
- Must respect dedup / revisit rules.

### Module 2 — 一句话硬核投资实战干货
- 必须是**真实、可核对、有事实依据**的投资经验 / 实战技能；禁止鸡汤、泛谈、伪故事。
- 核心内容必须先压缩成**一句可直接落地的结论**。
- 核心句后只允许补**极简依据说明**，默认不超过 2 段短说明，用来证明为什么这句话成立。
- 目标不是讲一个好听故事，而是让读者一眼拿走一个可执行判断规则。
- 如果 Module 2 还能被拉长成大段散文，说明还没收紧到位。

### Module 3 — 持仓标的当日最新新闻 & 深度解读
- 严格只写**用户真实持仓标的**，不要混入非持仓名字。
- 每个持仓默认筛选 **3 条最重要的当日 / 近窗最新权威信息**，优先级是：
  1. 官方公告 / 公司 newsroom / SEC / 监管 / 财报原文
  2. 行业高权威数据或合作方官方原文
  3. 只有在前两类不足时，才用高质量二手来源补强
- 每条新闻必须同时包含：
  - **新闻核心原文信息**
  - **权威发布来源**
  - **精准发布时间**
  - **对持仓的影响解读**（利好/利空/中性、影响量级、短期/长期逻辑、对操作的参考价值）
- 禁止用“窗口备注 / 组合角色 / 我自己的总结句”冒充新闻条目。
- 默认工作流仍是：`real-time-thesis-monitor` 排最新与最重要顺序 → 官方 / 高质量来源加固证据 → 博客表达。
- Never ship Module 3 as a vague news roundup.

### Module 4 — 持仓动作卡片 + 当日最高优先级事项
- 必须保持卡片化表达，但字段改为更明确的动作语言。
- 每张卡片至少要有：
  - **持仓标的**
  - **当日持仓状态**
  - **建议操作动作**
  - **动作执行阈值**
  - **风控止损 / 止盈线**
- 如果缺乏可靠价格/成交量阈值，必须明确写成**经营 / 事件触发阈值**，不能用空泛词代替。
- 卡片下方必须单列 **当日最高优先级事项**，默认 1-3 条，按优先级排序。
- Should reuse existing rating / target-price / public-evidence query paths whenever available.
- Must stay clearly separated from non-holdings unless explicitly labeled.

## 2. Frontend / interaction closing rules

The homepage, article pages, and options-course pages should feel like one product.

### Cross-mode compatibility
- Must work in:
  - desktop
  - mobile
  - light mode
  - dark mode
- Search, quick-nav, floating buttons, article meta bar, and decision cards must stay readable in all modes.

### Section-header standard
- `section-number` must not clip on mobile.
- section title / subtitle / date must stay aligned and readable.
- small text must maintain comfortable contrast.
- quick-nav / article-meta-bar / section-header must never overlap or visually collide after scroll / anchor jumps.

### Premium article visual hard gates
- Rounded info cards / topic cards / question cards must be large enough to fully contain their copy on desktop and mobile; clipping, cramped multiline squeeze, and text overflow are blockers.
- Default to **fewer, larger, calmer rounded surfaces**. Do not stack extra rounded rectangles unless they create real hierarchy.
- Card copy must keep clear inner padding on all sides; if the text feels glued to the curved edge, the layout is still broken.
- The reading surface must feel centered and balanced; avoid obvious left-heavy layouts that leave a large dead band on the right when the section is meant to be a card/grid surface.
- Heading width and prose width should feel like one system; do not allow a very wide title shell above a much narrower body column unless there is a deliberate editorial reason.
- Do not clamp hero / section / analysis titles with arbitrary narrow `ch` / `em` caps that leave obvious dead space on the right. On premium blog posts, major titles should normally take the full available reading width and wrap naturally.
- At the top of a page, do not stack multiple competing horizontal rails that do nearly the same thing. The current default is simpler: do not ship a separate sticky module quick-nav tab bar on premium posts or options pages. If section anchors are still useful, keep them as ordinary links inside the normal header or body instead of a second sticky rail.
- Module 4 / 动作地图 must look like an intentional card system, not a generic fallback column layout.
- Typography must keep an obvious hierarchy: section title > card / module title > body copy. If they read as the same size, the page is not closed.
- If one premium post exposes a structural defect that is likely shared (meta-bar collision, small cards, card-surface regression, sticky UI obstruction), sample nearby recent posts and the shared CSS/template layer before calling the work closed.

### Premium options-course hard gates
- All options chapters should be rewritten toward the same premium reading system as the blog; the goal is content consistency plus a full formatting rebuild, not minor patchwork.
- Keep the core content aligned with existing online/offline versions, but replace the current ugly or template-feel presentation with calmer structure and more deliberate teaching rhythm.
- Chapter pages should teach through real prose and well-spaced examples, not through stacks of thin decorative boxes.
- The course index must read like an **editorial syllabus**, not a raw chapter dump.
- Learning-path cards, toolkit cards, and chapter-directory cards must have clear hierarchy, enough breathing room, and obvious CTA landing points.
- Chapter pages must keep a stable reading ladder: **summary / chapter index →正文 → chapter navigation**.
- Quick-nav and chapter-meta bars may be sticky, but must not visually overpower the content or feel heavier than the chapter body.
- If quick-nav or header tabs get crowded, prefer wrap / horizontal scroll / simpler labels over squeezed overlap.
- Do not let options chapters lean on repeated thin summary / method cards as fake depth; readers should reach chapter-specific正文 quickly.
- Chapter-body prose width, chapter titles, payoff notes, and blockquotes must feel like the same reading system; wide titles with a much narrower正文 strip are a hard fail.
- Payoff charts, source figures, and blockquotes need deliberate spacing so the page reads like a premium lesson, not a template export.
- Prev/next / return-to-course navigation must feel like part of one calm learning path, not a loose set of utility links.
- If the options-course homepage gets better but chapter pages still feel flatter / harsher / more template-like, the job is not finished.

### Options-course all-chapter closeout gate
- Any change to `template/options-chapter.html`, `template/options-course-index.html`, `scripts/build-options-course.py`, `css/style.css`, or shared navigation must be treated as a **1-29 chapter risk**, not a one-page risk.
- Before publish, sample every generated chapter `options/01.html` through `options/29.html` for: visible正文, no black / blank screen, readable light and dark mode, no mojibake, stable header links, working prev / next / return-to-course links, and no extreme width / overflow.
- Header links inside `options/` must resolve from the options folder: `../index.html#about`, `../index.html#research-standards`, `./index.html`, `../index.html#archive`. Never ship `href="options/"` or `href="index.html#about"` from inside an options page.
- `scripts/qa-site.ps1` is responsible for the static part of this gate; `scripts/qa-render-cdp.mjs` can run the local rendered audit across Module 3 plus `options/01.html`-`options/29.html` when a localhost server is available.
- Visual screenshots are still required before calling a remote course update complete.

### Encoding / generation hard gate
- Any mojibake, `�`, malformed Chinese punctuation, broken closing tag, or JSON-LD quote corruption in public HTML is a blocker.
- Generated pages must be checked at four layers before publish: **head/meta**, **JSON-LD**, **nav labels / CTA text**, and **visible body copy**.
- If an automated rewrite introduces encoding damage, restore the clean UTF-8 file first and then reapply the intended change with the smallest safe edit surface.
- Do not call a release finished if the page body looks okay but the head / schema / generated options pages are already broken.

### Image standard
- Article images should include intrinsic `width` / `height`.
- Public article images should be compressed for delivery.
- Do not ship `.jpg` files that are actually PNG payloads.

## 3. Repository hygiene

### Keep
- Stable site code
- Stable templates
- Stable scripts
- Durable docs that define product standards

### Remove / avoid
- throwaway test pages
- temp payloads
- evidence scratch files
- one-off debug helpers
- files that do not belong to the long-term public-site workflow

## 4. Publish verification gate

Do not call a change complete unless all of these are true:
1. local build / tests pass
2. QA passes
3. GitHub remote is updated
4. live domain is updated
5. live HTML proves the expected version / structure is present

## 5. Default implementation rule

If there is tension between "more features" and "more reliable quality", choose the version that keeps:
- stronger readability
- clearer structure
- better compatibility
- higher one-shot publish reliability

## 6. Golden reference and one-command target

- `posts/2026/04/18.html` is the current **golden-reference post** for premium daily-blog finish quality.
- "Use 0418 as template" does **not** mean copy its topic; it means inherit its bar for:
  - 4-part module closure
  - balanced card density
  - clear prose load-bearing capacity (not bullet-only)
  - strong Module 3 explanation sequencing
  - polished Module 4 card quality
- The long-term target is: **one simple publish command should be enough to generate a near-finished premium post**.
- The default template should already ship the premium quick-nav / article-meta-bar / Module 4 decision-card scaffold, but under the 0424 style freeze that scaffold must render in the new sharper cinematic visual system instead of the older softer rounded-card language.
- To get there, the upstream stack must already be wired before drafting:
  1. investing-system state refreshed
  2. Module 3 ranking inherited from `real-time-thesis-monitor`
  3. public evidence hardened with official / high-quality sources
  4. layout closed against shared frontend gates
  5. publish + live verification completed before calling success

## 7. Workflow hardening target

The long-term workflow target is not just “generate a page”, but:
1. absorb prior knowledge
2. connect it to the current investing workflow
3. express one or more reusable ideas clearly
4. close the shared frontend cleanly
5. keep blog + options-course + homepage in the same product language

When there is tension, prefer:
- more knowledge density over empty elegance
- calmer layout over crowded card tricks
- shared-system consistency over isolated page optimization
- one coherent teaching arc over many disconnected snippets

This file is the control tower for future blog-output / options-course polish work.


## 2026-04-23 anti-regression addendum

### 首页与研究库
- 首页 archive / research 文案块若出现明显右侧死白，优先通过版心、grid ratio、文本测度与卡片密度收口；不要默认继续加更多圆角壳去“填空”。
- 首页的定位文案要强调“研究库 / 可回看 / 可按公司和主题调取”，不是简单日期堆文；同时这一句本身必须在视觉上吃到足够宽度，不能被保守 `max-width` 压成左重右空。

### Premium daily（Module 1~4）
- Module 1 必须在页面层真正落成 5+2：行业、商业模式、管理层、财报健康度、估值、投资逻辑、投资风险。不能再退回 stock-meta + highlights fallback。
- Module 2 默认采用能把故事、图片、规则、案例放进同一阅读节奏的 editorial layout；不接受标题过窄、图片缩在一角、右侧大片空白的半成品双栏。
- Module 3 默认优先“事实 + 为什么重要 + 动作边界”同卡阅读；除非内容强到必须拆层，否则不要再做机械的左右双板块新闻模板。
- Module 3 配图必须先确认完整主体 / 文字不会被 `cover` 裁掉；如果图是竖版、带字、海报式构图，优先完整展示。
- Module 4 标题与动作地图之间必须有明确 breathing room；最后的“今日组合动作总结”只允许一张 calm summary panel，不允许重叠、贴头、套娃卡。

### 期权教材
- 章节摘要区优先减少壳层：一张主摘要卡 + 少量辅助信息即可，禁止再堆多块玩具化加速卡。
- 章节正文必须确保标题宽度与正文宽度属于同一 reading rail；若正文是 78~82ch，标题也应在同一系统里，而不是整卡铺满。
- 配色要有克制的 tonal variation，不能所有章节都只剩同一种米黄表面。
