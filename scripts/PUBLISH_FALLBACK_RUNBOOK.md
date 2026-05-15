# Publish Fallback Runbook

目标：避免“git push 失败就整条发布链卡死”。

## 发布主路径

1. `publish-blog.ps1` 先确保发布载荷已进 HEAD
   - `posts/YYYY/MM/DD.html`
   - `index.html`
   - `js/posts-data.js`
   - `sitemap.xml`（若存在）
2. 本地 QA 必须通过
3. 优先尝试 `git push`
4. 若 `git push` 失败，且环境存在以下任一 token：
   - `gh_token`
   - `GH_TOKEN`
   - `GITHUB_TOKEN`
   则自动切换到 GitHub Contents API fallback：`python scripts/deploy.py --date YYYY-MM-DD --path scripts/publish-blog.ps1`
5. 无论走 git 还是 API，最终都必须做正式域名 live QA；否则不算完成

## 失败分层

### A. Git push 失败，但 API fallback 可用
- 允许继续发布
- 仍需 live QA 通过后才能宣称成功

### B. Git push 失败，API fallback 不可用
- 直接判定为“未发布完成”
- 不得用“本地 QA 通过”替代远端完成

### C. 远端已更新，但正式域名还是 404 / 旧页面
- 判定为 CDN / GitHub Pages pending
- 继续重试 live QA
- 在 live QA 没过前，不得向用户报“发布成功”

## 维护要求

- 修改 `publish-blog.ps1` 时，必须同时检查本 runbook 是否需要同步更新
- 新增 fallback 通道时，必须写明：触发条件、验证方式、成功标准、失败标准
