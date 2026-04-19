# Blog Premium Standard

Single source of truth for the public blog / options-course output standard.

Last updated: 2026-04-19
Public domain: `https://4fire.qzz.io/`

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
   - local QA
   - GitHub remote updated
   - live domain updated
   - final pass through `strict-site-reviewer`

### Default anti-drift rule
- Do not let drafting skip upstream truth refresh.
- Do not let reviewer skills silently replace each other.
- Do not let a visually nicer page bypass live verification.
- Do not let options-course polish drift into a second visual system unrelated to the blog.

## 1. Four-part frozen contract

Every daily post must contain all 4 parts. No silent downgrade.

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

### Module 2 — 真实可带走的小故事
- Must be a **real, evidence-based, reusable** lesson.
- Must leave the reader with **one clear takeaway sentence**.
- No fake fable, empty slogan, or generic AI moralizing.

### Module 3 — 新闻内容 + 专属解读
- Must use the split structure:
  - **Latest News**
  - **What It Means**
- Ranking rule:
  1. **price-explanation power / action relevance first**
  2. then **latest genuinely relevant** item(s)
  3. then older but higher-signal driver(s) when they better explain the current move or current action boundary
  4. explicitly explain exceptions when a slightly older item matters more
- Every news item must include:
  - source
  - concrete fact / event
  - why it matters
  - detailed interpretation
- Default workflow is: **`real-time-thesis-monitor` for latest-vs-important ranking → official / high-quality sources for evidence hardening → blog expression**.
- Do **not** default to Tavily or a raw news search as the first ranking layer.
- Never ship Module 3 as a vague news roundup.

### Module 4 — 持仓地图 / 动作地图
- Must remain compatible with the site's decision-card / holding-map standard.
- Must state:
  - 当前桶位
  - 核心变量
  - 不要误读
  - 下一步
  - 当前最重要的一件事
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
- The reading surface must feel centered and balanced; avoid obvious left-heavy layouts that leave a large dead band on the right when the section is meant to be a card/grid surface.
- Module 4 / 动作地图 must look like an intentional card system, not a generic fallback column layout.
- If one premium post exposes a structural defect that is likely shared (meta-bar collision, small cards, card-surface regression, sticky UI obstruction), sample nearby recent posts and the shared CSS/template layer before calling the work closed.

### Premium options-course hard gates
- The course index must read like an **editorial syllabus**, not a raw chapter dump.
- Learning-path cards, toolkit cards, and chapter-directory cards must have clear hierarchy, enough breathing room, and obvious CTA landing points.
- Chapter pages must keep a stable reading ladder: **summary → reading rail →正文 → chapter navigation**.
- Quick-nav and chapter-meta bars may be sticky, but must not visually overpower the content or feel heavier than the chapter body.
- Payoff charts, source figures, and blockquotes need deliberate spacing so the page reads like a premium lesson, not a template export.
- Prev/next / return-to-course navigation must feel like part of one calm learning path, not a loose set of utility links.
- If the options-course homepage gets better but chapter pages still feel flatter / harsher / more template-like, the job is not finished.

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
- To get there, the upstream stack must already be wired before drafting:
  1. investing-system state refreshed
  2. Module 3 ranking inherited from `real-time-thesis-monitor`
  3. public evidence hardened with official / high-quality sources
  4. layout closed against shared frontend gates
  5. publish + live verification completed before calling success

This file is the control tower for future blog-output / options-course polish work.
