# Blog Premium Standard

Single source of truth for the public blog / options-course output standard.

Last updated: 2026-04-18
Public domain: `https://4fire.qzz.io/`

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
  1. newest genuinely relevant item first
  2. then higher-signal older item(s) if needed
  3. explicitly explain exceptions when a slightly older item matters more
- Every news item must include:
  - source
  - concrete fact / event
  - why it matters
  - detailed interpretation
- Priority is **freshness first**, then **importance / signal strength**.
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

This file is the control tower for future blog-output / options-course polish work.
