# Site Quality Standard

## Purpose

This document is the release bar for `4fire.qzz.io` after the 2026-04-18 redesign pass.
It exists to stop the site from drifting back into thin typography, templated copy, and partial-fix shipping.

## Non-Negotiables

1. **Readable first**
   - Body copy, captions, pills, and navigation must remain readable on desktop and mobile.
   - No ultra-thin text, washed-out contrast, or decorative typography that harms legibility.

2. **Human copy only**
   - No placeholders like "请替换" or mechanical instruction text in shipped pages.
   - No empty slogans, generic Buffett quotes used as filler, or AI-template phrasing that says nothing concrete.

3. **Pages need a complete structure**
   - Homepage must explain what the site is, how research is done, where the options course lives, and how archives are explored.
   - Options pages must include orientation, learning path, reading support, and clear navigation back to the course.
   - Articles must separate evidence, judgment, and action boundary.

4. **Options UX must be tool-grade**
   - Payoff charts must be readable, fast, and inspectable on both desktop and mobile.
   - Chart visuals should expose strike, breakeven, and profit/loss shape without requiring source inspection.

5. **Ship only after live verification**
   - Local QA is necessary but not sufficient.
   - Official completion requires remote GitHub update plus live-domain verification.

## Required Release Checks

- Run `scripts/qa-site.ps1`
- Verify homepage on the live domain
- Verify options index on the live domain
- Verify at least one representative options chapter with payoff chart interaction
- Verify the latest article page on the live domain
- Check for replacement chars, mojibake, layout overlap, broken quick nav, and dead links

## Common Failure Modes To Prevent

- Typography changes that look elegant in code but become too faint on mobile
- New content generated from templates that still contains author instructions or generic placeholder prose
- Visual polish applied to homepage only while options pages remain structurally weaker
- Charts that look fine as static SVG but fail as an interactive reading aid
- Declaring success after local edits without live-domain confirmation
