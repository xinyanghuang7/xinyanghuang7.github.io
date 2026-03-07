---
name: us-stock-blog
description: Create and deploy a professional US stock investment blog with AI-generated images. Use when the user wants to create, update, or deploy a financial blog about US stock value investing. Supports content generation, AI image creation via ModelScope, and automatic GitHub Pages deployment.
---

# US Stock Investment Blog Creator

Create and deploy a professional US stock value investment blog with rich content and AI-generated imagery.

## When to Use

- User wants to create a US stock investment blog
- User wants to update blog content with daily stock picks
- User wants to generate and add AI images to the blog
- User wants to deploy the blog to GitHub Pages

## Prerequisites

Required environment variables:
- `MODELSCOPE_TOKEN` - For AI image generation
- `GITHUB_TOKEN` - For GitHub Pages deployment (Personal Access Token with `repo` scope)

Python dependencies (for stock ratings):
```bash
pip install tradingview-ta yfinance
```

## Quick Start

```powershell
# Create new blog
.\scripts\create-blog.ps1

# Generate images for blog
.\scripts\generate-images.ps1

# Deploy to GitHub Pages
.\scripts\deploy.ps1 -Repo "username.github.io"
```

## Daily Blog Publishing (每日自动发布)

自动提取博客中提到的股票代码，获取评级，并发布到 GitHub Pages。

### Setup

1. **配置 API 密钥（本地安全存储）：**

   ```powershell
   cd ~/.openclaw/skills/us-stock-blog
   
   # 复制模板并编辑
   cp .env.example .env
   
   # 填入你的密钥
   notepad .env
   ```

   `.env` 内容示例：
   ```
   GITHUB_TOKEN=your_github_pat_here
   MODELSCOPE_TOKEN=your_modelscope_token_here
   ```

2. **加载环境变量：**

   ```powershell
   # PowerShell
   Get-Content .env | ForEach-Object { $k, $v = $_ -split '=', 2; [Environment]::SetEnvironmentVariable($k, $v, "Process") }
   
   # 验证
   $env:GITHUB_TOKEN
   ```

### Daily Workflow

**创建博客内容：**

```powershell
# 创建博客内容（简单 HTML 片段）
$content = @"
<h3>VST / Vistra Corp.</h3>
<p>电力公用事业 / 竞争性电力生产与零售</p>
<p>AI电力需求爆发受益者...</p>
"@

$content | Out-File -Encoding UTF8 "content/2026-03-07.html"
```

**一键发布（自动提取股票 + 获取评级 + 推送）：**

```powershell
# 方式1：自动提取股票代码
.\scripts\daily-publish.ps1 -BlogFile "content/2026-03-07.html"

# 方式2：指定股票代码
.\scripts\daily-publish.ps1 -BlogFile "content/2026-03-07.html" -Symbols "VST,NEE"

# 方式3：仅生成本地文件（不推送）
.\scripts\daily-publish.ps1 -BlogFile "content/2026-03-07.html" -SkipPush
```

脚本会自动：
1. 🔍 从内容中提取股票代码（如 VST, NEE, NVDA）
2. 📊 获取 TradingView 技术指标
3. 🏦 获取 Yahoo Finance 分析师评级
4. 📈 计算综合评级（强烈买入/买入/中性/卖出/强烈卖出）
5. 📝 在文末添加评级汇总表格
6. 🚀 推送到 GitHub Pages

### Generated Output

生成的博客会自动添加一个评级汇总 Section：

```html
<section id="ratings-summary">
  <h2>本文提及标的投资评级汇总</h2>
  <table>
    <thead>
      <tr>
        <th>代码</th>
        <th>综合评级</th>
        <th>分数</th>
        <th>技术面</th>
        <th>分析师</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>VST</td>
        <td>🚀 强烈买入</td>
        <td>+1.85</td>
        <td>BUY (11/2/8)</td>
        <td>买入 | +23.5%</td>
      </tr>
    </tbody>
  </table>
</section>
```

## Security (安全管理)

⚠️ **绝不提交 API 密钥到 GitHub！**

| 安全做法 | 说明 |
|---------|------|
| ✅ `.env` | 本地存储密钥，已加入 `.gitignore` |
| ✅ `.env.example` | 模板文件，不含真实密钥 |
| ✅ 环境变量 | 脚本运行时从环境变量读取 |
| ❌ 硬编码 | 绝不在代码中写死密钥 |

**完整安全指南：** `references/security-guide.md`

## Stock Ratings Feature (股票交易评级)

Automatically fetch technical indicators and analyst ratings for any stock.

### Data Sources

| Source | Data Type | Weight |
|--------|-----------|--------|
| **TradingView** | Technical indicators (RSI, MACD, Moving Averages, etc.) | 40% |
| **Yahoo Finance** | Analyst ratings from Wall Street firms | 60% |

### Rating Scale

| Score | Rating | Color | Description |
|-------|--------|-------|-------------|
| +2 | 🚀 强烈买入 | Green | Strong Buy - Multiple bullish signals |
| +1 | 📈 买入 | Light Green | Buy - Positive outlook |
| 0 | ➖ 中性 | Yellow | Neutral - Mixed signals |
| -1 | 📉 卖出 | Orange | Sell - Negative outlook |
| -2 | 🔻 强烈卖出 | Red | Strong Sell - Multiple bearish signals |

### Usage

**Command Line:**
```bash
# Single stock
python scripts/get_stock_ratings.py AAPL NASDAQ

# Output includes:
# - TradingView technical summary (BUY/SELL/NEUTRAL counts)
# - Yahoo Finance analyst consensus
# - Price targets and upside potential
# - Composite rating with confidence level
```

**Python API:**
```python
from scripts.get_stock_ratings import get_stock_rating, format_rating_for_blog

# Get rating for a stock
rating = get_stock_rating("AAPL", company_name="Apple Inc.", exchange="NASDAQ")

# Access individual components
print(rating.composite_rating)  # "买入"
print(rating.composite_score)   # 1.2
print(rating.confidence)        # "高"

# Generate HTML for blog
html = format_rating_for_blog(rating)
```

**Batch Processing:**
```python
from scripts.get_stock_ratings import get_stock_ratings_batch

stocks = [
    {"symbol": "AAPL", "company_name": "Apple Inc.", "exchange": "NASDAQ"},
    {"symbol": "VST", "company_name": "Vistra Corp.", "exchange": "NYSE"},
    {"symbol": "NVDA", "company_name": "NVIDIA Corp.", "exchange": "NASDAQ"},
]

ratings = get_stock_ratings_batch(stocks)
for r in ratings:
    print(f"{r.symbol}: {r.composite_rating} (score: {r.composite_score})")
```

### Integration with Blog

1. Include the CSS in your HTML `<head>`:
```html
<link rel="stylesheet" href="assets/rating-styles.css">
```

2. Add the rating HTML to your stock pick section:
```html
<section class="section" id="stock-pick">
    <div class="section-header">
        <div class="section-number">01</div>
        <h2 class="section-title">美股每日宝藏标的</h2>
    </div>
    
    <!-- Stock pick content here -->
    
    <!-- Rating widget -->
    <div class="stock-rating">
        <div class="rating-header">
            <span class="rating-badge rating-买入">买入</span>
            <span class="rating-confidence">置信度: 高</span>
        </div>
        <div class="rating-section">
            <h4>📈 技术指标 (TradingView)</h4>
            <p>综合建议: <strong>BUY</strong></p>
            <p>指标统计: 买入12 | 卖出3 | 中性5</p>
        </div>
        <div class="rating-summary">
            <p>💡 【买入】技术面BUY，目标价上涨空间+15.3%，建议关注</p>
        </div>
    </div>
</section>
```

### Supported Exchanges

- `NASDAQ` - 纳斯达克
- `NYSE` - 纽约证券交易所
- `AMEX` - 美国证券交易所
- `CRYPTO` - 加密货币 (使用 `screener="crypto"`)

## Workflow

### Step 1: Create Blog Content

1. Read the blog template from `assets/blog-template.html`
2. Generate daily content following the structure:
   - **Module 1**: Daily Stock Pick (宝藏标的)
   - **Module 2**: Investment Wisdom (投资认知加餐)
   - **Module 3**: Market Morning Report (科技核心标早报)
3. Update the HTML with new content

### Step 2: Generate AI Images

Use ModelScope API to generate 3 types of images:

```powershell
$prompts = @(
    "Professional financial investment concept, Wall Street atmosphere, golden bull statue silhouette against dark navy blue background, abstract stock market chart lines flowing upward, luxury gold and deep blue color scheme",
    "Value investing concept art, vintage leather-bound investment ledger with gold pen, golden calculator, stock certificates scattered artistically, warm golden hour lighting, dark wood desk surface",
    "Modern tech stock analysis visualization, holographic data charts floating in dark space, AI chip circuit patterns, futuristic blue and gold neon accents"
)
```

See `references/modelscope-api.md` for detailed API usage.

### Step 3: Deploy to GitHub

Use GitHub Contents API for deployment:

```powershell
# Get current file SHA
$sha = (Invoke-RestMethod -Uri "https://api.github.com/repos/USER/REPO/contents/index.html").sha

# Prepare payload
$payload = @{
    message = "Update blog"
    content = [Convert]::ToBase64String([IO.File]::ReadAllBytes("index.html"))
    sha = $sha  # Required for existing files
} | ConvertTo-Json -Compress

# Push to GitHub
Invoke-RestMethod -Uri "https://api.github.com/repos/USER/REPO/contents/index.html" `
    -Method Put `
    -Headers @{
        "Authorization" = "token $env:GITHUB_TOKEN"
        "Content-Type" = "application/json"
    } `
    -Body $payload
```

See `references/github-api.md` for complete deployment guide.

## Blog Structure

```
blog/
├── index.html              # Main blog page
├── images/
│   ├── hero-bg.jpg        # Hero section background
│   ├── value-investing.jpg # Investment wisdom section
│   └── tech-analysis.jpg  # Market report section
└── css/ (optional)
```

## Design System

- **Colors**: Dark navy `#0f1419`, Gold accent `#c9a227`, Cream background `#faf8f5`
- **Typography**: Cormorant Garamond (display), Source Sans Pro (body)
- **Style**: Editorial/Magazine + Luxury/Refined aesthetic
- **Features**: Scroll progress bar, fade-in animations, hover effects

## Resources

- `references/modelscope-api.md` - Image generation API details
- `references/github-api.md` - GitHub deployment guide
- `references/blog-examples.md` - Sample content structures
- `references/rating-examples.md` - Rating integration examples
- `references/security-guide.md` - API key security best practices
- `assets/blog-template.html` - Starting HTML template
- `assets/rating-styles.css` - Stock rating widget styles
- `scripts/get_stock_ratings.py` - Stock rating data fetcher
- `scripts/generate_daily_blog.py` - Daily blog generator with auto-ratings
- `scripts/daily-publish.ps1` - One-click daily publish script
- `.env.example` - Environment variable template (safe to commit)

## Troubleshooting

**Image generation timeout**: ModelScope tasks can take 2-5 minutes. Implement polling with 5-second intervals.

**GitHub 422 error**: Ensure SHA is provided when updating existing files.

**Token authentication**: Verify `GITHUB_TOKEN` has `repo` scope permissions.

**Stock Rating Issues**:
- `ImportError`: Install dependencies with `pip install tradingview-ta yfinance`
- `TradingView API error`: Check internet connection and stock symbol validity
- `Yahoo Finance empty`: Some stocks may not have analyst coverage (common for small-caps)
