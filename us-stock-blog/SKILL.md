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
- `assets/blog-template.html` - Starting HTML template
- `assets/rating-styles.css` - Stock rating widget styles
- `scripts/get_stock_ratings.py` - Stock rating data fetcher
- `scripts/` - Helper scripts for automation

## Troubleshooting

**Image generation timeout**: ModelScope tasks can take 2-5 minutes. Implement polling with 5-second intervals.

**GitHub 422 error**: Ensure SHA is provided when updating existing files.

**Token authentication**: Verify `GITHUB_TOKEN` has `repo` scope permissions.

**Stock Rating Issues**:
- `ImportError`: Install dependencies with `pip install tradingview-ta yfinance`
- `TradingView API error`: Check internet connection and stock symbol validity
- `Yahoo Finance empty`: Some stocks may not have analyst coverage (common for small-caps)
