# Blog publish network runbook

Purpose: prevent repeating the local-success / remote-push-failed / live-domain-not-yet-up confusion.

## Root cause pattern

This workstation may have global Git proxy settings:

- `http.proxy=http://127.0.0.1:7890`
- `https.proxy=http://127.0.0.1:7890`

When the local proxy service is not listening, normal `git push` tries a dead proxy and fails even if direct `github.com:443` works. Some previous failures were also raw GitHub 443/TLS outages. Therefore publishing must choose a network path based on diagnostics, not habit.

## Three separate done states

1. Local done
   - post generated
   - site data synced
   - local QA / local screenshot QA passed
   - local commit exists

2. GitHub done
   - push succeeded
   - `git ls-remote origin HEAD` equals `git rev-parse HEAD`

3. Formal-domain done
   - `https://4fire.qzz.io/<post>` loads the article, not GitHub Pages 404
   - live CDP QA screenshots pass

Only state 3 is final completion for user requests that require remote/screenshot acceptance.

## Standard command

From `xinyanghuang7.github.io/`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\publish-blog.ps1 -PostPath "posts/YYYY/MM/DD.html" -OutDir "artifacts/YYYYMMDD-post-live"
```

The script automatically:

1. runs local site QA;
2. tests `127.0.0.1:7890` and `github.com:443`;
3. uses proxy-bypass push when direct GitHub works;
4. uses configured proxy only when direct GitHub is unavailable but proxy works;
5. verifies remote HEAD;
6. retries formal-domain live QA to handle GitHub Pages/CDN delay.

## Manual fallback

If the script cannot be used:

```powershell
Test-NetConnection 127.0.0.1 -Port 7890
Test-NetConnection github.com -Port 443
```

Decision table:

| proxy 7890 | github.com:443 | action |
|---|---|---|
| false | true | `git -c http.proxy= -c https.proxy= push origin main` |
| true | true | prefer proxy-bypass push; normal push is acceptable |
| true | false | normal `git push origin main` through proxy |
| false | false | network is not publishable; do not claim remote completion |

After push:

```powershell
git rev-parse HEAD
git -c http.proxy= -c https.proxy= ls-remote origin HEAD
```

If these hashes match but live URL is 404, classify as GitHub Pages/CDN propagation delay and retry live QA later. Do not rewrite content and do not say push failed.
