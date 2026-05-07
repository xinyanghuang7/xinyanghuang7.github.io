# Blog Reading System 2026-05

Goal: move the daily blog from a complex frontend showcase into a content-first investment notes system: Markdown-like, readable, easy to navigate, and stable on mobile.

## Principles

1. The homepage is for discovery and navigation, not for carrying full article complexity.
2. Article pages are for deep reading. Prefer Markdown semantics: headings, paragraphs, lists, tables, quotes, and sources.
3. CSS should serve readability only: line width, line height, heading hierarchy, quotes, tables, and mobile rhythm.
4. JS should serve navigation only: timeline, card centering, preview drawer, keyboard navigation, and ESC.
5. Facts, sources, creator input, and my judgment must be separated. Do not invent certainty just to look professional.

## Homepage / archive entry

- Use timeline archive as the primary picker instead of the default calendar grid.
- Month anchors should land on the first article of that month.
- Horizontal preview cards should auto-center the active card.
- Clicking a non-active card first centers it.
- Clicking the active card opens a light preview drawer.
- The drawer only carries summary, date, keywords, and a read-more link; it must not carry the full article.
- Keep the legacy calendar inside a folded compatibility area.

## Article page template

Article bodies should be close to this structure:

```markdown
# Title

> One-sentence core conclusion

## 1. Today's most important judgment
## 2. What happened
## 3. Why it matters
## 4. Impact on holdings / watchlist
## 5. Risks and disconfirming evidence
## 6. Next observations
## 7. Sources and evidence boundaries
```

Minimum requirements for every daily investment article:

- One-sentence conclusion
- Fact layer
- Source layer
- My judgment
- Action boundary
- Risks and disconfirming evidence
- Next observations

## Style boundaries

Keep:

- Reading-style hero
- Table of contents / quick jumps
- Key quote block
- Simple tables
- Source section
- Previous / next article links

Weaken or avoid:

- Many nested mini-cards
- Dashboard maze layouts
- Heavy gradients and excessive animation
- Bespoke components for every section
- Turning watchlists into trade instructions

## 0503 sample

The 0503 article is a transition sample: it keeps the original information density, but uses `blog-reading.css` to reduce card complexity. Future articles should be generated from Markdown structure at the source, not generated as dashboard pages and then flattened by CSS.

## Phase 2 execution standard

1. New articles should start from a Markdown outline, not from a dashboard layout.
2. Each article should use only a few semantic components: conclusion quote, fact list, source list, risks/disconfirming evidence, and action boundary.
3. Page acceptance must include desktop screenshots and 390px mobile screenshots.
4. Remote acceptance Chrome runs must disable the local proxy to avoid global mihomo / Clash interference.
5. New CSS should first reuse reading variables from `blog-reading.css`; only reusable cross-article rules should enter `style.css`.


## Default daily production path after 2026-05-07

The default daily post path is now **Markdown-first benchmark-depth**, not the old component-heavy premium template.

1. Create new posts through `scripts/new-post.ps1`; it must read `templates/blog-reading-template.html`.
2. Keep `template/post-template.html` as legacy only for old pages; do not use it for new daily posts.
3. The default article shell must include these stable anchors in this order: `pm-dashboard`, `stock-pick`, `lesson`, `creator-digest`, `market`, `decision-cards`, `risks`, `sources`.
4. Prose remains the primary surface; benchmark components are allowed only where they improve understanding: PM brief, creator digest/source ledger, holding news cards, action cards, and evidence audit.
5. `scripts/qa-site.ps1` must validate the Markdown-first template path, not the legacy premium template path.
6. `scripts/qa-blog-post-cdp.mjs` is the browser gate for benchmark-depth pages and should check required anchors, source links, evidence audit, holding cards, action fields, overflow, mojibake, and Chrome load failures.
7. A release is not complete until local QA, browser screenshots, GitHub push, and live-domain browser verification pass.

## Release and editing hardening

These rules are mandatory after the 2026-05-06 proxy / QA false-positive incident:

1. **GitHub push must bypass the flaky local Git proxy.** Use:
   ```powershell
   git -c http.proxy= -c https.proxy= push origin main
   ```
   The user's global Git config may point `http.proxy` / `https.proxy` at `127.0.0.1:7890`; that proxy can fail TLS handshakes even when direct GitHub access works. Do not treat that failure as a repo or GitHub outage until a proxy-bypassed `ls-remote`/`push` has been tried.
2. **HTML QA must be attribute-order independent.** Tools such as BeautifulSoup can rewrite `<meta>` and `<link>` attribute order. QA should validate semantics with order-independent regex/lookaheads, not strict serialized strings.
3. **Avoid whole-file HTML rewrites unless necessary.** Prefer precise edits or byte-safe ASCII/version replacements. If a parser rewrite is necessary, immediately run `scripts/qa-site.ps1` and a browser screenshot check.
4. **Live validation should use cache-busting URLs when checking a fresh deploy.** Example: `https://4fire.qzz.io/posts/YYYY/MM/DD.html?v=YYYYMMDDHHMM`. If the cache-busted URL passes and the plain URL is stale, treat it as CDN cache propagation rather than failed deployment.
