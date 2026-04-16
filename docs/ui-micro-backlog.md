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
