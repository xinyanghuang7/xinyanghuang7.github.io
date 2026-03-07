---
name: us-stock-blog
description: Generate professional US stock investment blog posts with rich content, AI-generated images, and institutional-quality analysis. Creates three-module articles (daily stock pick + investment wisdom + tech market report) following Warren Buffett value investing principles.
---

# US Stock Value Investment Blog Generator

Generate professional, magazine-quality US stock investment blog posts with three comprehensive modules.

## When to Use This Skill

- Creating daily investment blog posts
- Analyzing specific stocks with deep fundamental research
- Generating educational content about value investing principles
- Creating market analysis reports for tech stocks
- **CRITICAL**: Every article MUST include 2 AI-generated images and follow the exact three-module structure

## Output Quality Standard

**Reference Quality**: The blog post from 2026-03-05 (VST + Margin of Safety) is the gold standard. Every new article must match or exceed this quality level:

✅ **Rich Content**: Each module has substantial depth (not just bullet points)
✅ **Professional Analysis**: Data-driven insights with specific numbers and percentages
✅ **Visual Appeal**: 2 high-quality AI-generated images properly placed
✅ **Consistent Structure**: Follows the exact HTML template and CSS classes
✅ **Magazine Style**: Editorial quality writing like Barron's or Forbes

## Three-Module Structure (MANDATORY)

Every blog post MUST contain exactly these three sections:

### Module 1: 美股每日宝藏标的 (Daily Stock Pick)
**Purpose**: Deep fundamental analysis of one quality stock

**Required Elements**:
1. **Header**: Stock ticker + full company name
2. **Meta Info**: Industry, core business, market cap, dividend yield
3. **✅ 核心价值亮点** (3 points minimum):
   - Each point must have data backing (e.g., "未来5年数据中心电力需求预计翻倍")
   - Explain the business logic, not just state facts
   - Include specific metrics when available
4. **⚠️ 核心风险提示** (2 points minimum):
   - Be honest about risks, don't sugarcoat
   - Explain WHY it's a risk and potential impact
   - Use real historical examples if applicable
5. **💡 长期持有建议**: Hold period (e.g., 2-4 years), position size (e.g., 3%-5%), portfolio role

**Writing Style**: Professional analyst report, concise but thorough

**Example Quality** (from VST article):
```
✅ AI电力需求爆发受益者：美国AI数据中心电力需求呈指数级增长，Vistra作为德州最大
电力供应商占据核心区位优势，未来5年数据中心电力需求预计翻倍，公司已锁定多个超大规模
数据中心长期购电协议（PPA），收入可预测性强

⚠️ 区域市场波动风险：电力价格受德州ERCOT市场供需波动影响显著，极端天气事件
（如2021年德州雪灾导致电价飙升数百倍）可能造成短期业绩剧烈波动
```

### Module 2: 每日投资认知加餐 (Investment Wisdom)
**Purpose**: Educational content about value investing principles

**Required Elements**:
1. **主题**: One-sentence core concept
2. **核心理念**: Detailed explanation quoting Buffett/Munger/Graham
3. **可落地执行规则** (3 specific rules):
   - Actionable steps, not vague advice
   - Include specific thresholds (e.g., "6折以下才考虑建仓")
   - Numbered list with clear hierarchy
4. **经典案例**: Real historical case study:
   - Specific dates and numbers
   - What happened
   - Key lessons learned
5. **一句话记忆点**: Memorable takeaway quote
6. **配图**: AI-generated concept image (MANDATORY)

**Writing Style**: Educational but sophisticated, like a masterclass

**Image Requirements**:
- Generate ONE image for this module
- Theme: Professional financial concept, warm golden tones
- Style: Editorial/magazine aesthetic
- Size: 1200x800px minimum
- Placement: After the "核心理念" paragraph

**Example Quality** (from Margin of Safety article):
```html
<div class="wisdom-image" style="margin: 2rem 0; text-align: center;">
    <img src="../../../images/value-investing.jpg" alt="价值投资概念图" 
         style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
    <p style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 0.5rem; font-style: italic;">
        价值投资的艺术：寻找市场价格与内在价值之间的鸿沟
    </p>
</div>
```

### Module 3: 美股科技核心标的每日财经资讯早报 (Tech Market Report)
**Purpose**: Daily news and analysis for major tech stocks

**Required Elements**:
1. **3-5 Tech Stocks**: NVDA, META, AAPL, MSFT, GOOGL, NBIS, etc.
2. **For each stock**:
   - Current price, change %, volume
   - Day high/low
   - 3 recent news items with 【长线视角】analysis
3. **华尔街分析师专业研判**:
   - 📈 机会端分析 (bull case for each stock)
   - ⚠️ 风险端分析 (bear case for each stock)
4. **综合投资态度与操作策略**: Summary under 100 words
5. **配图**: AI-generated tech visualization (MANDATORY)

**Writing Style**: Institutional research report quality

**Image Requirements**:
- Generate ONE image for this module
- Theme: Modern tech/finance visualization
- Style: Futuristic, holographic data charts, blue and gold accents
- Size: 1600x600px (wide banner style)
- Placement: At the top of the market grid

**Example Quality**:
```html
<div style="grid-column: 1 / -1; margin-bottom: 1rem;">
    <img src="../../../images/tech-analysis.jpg" alt="科技股票分析可视化" 
         style="width: 100%; height: 300px; object-fit: cover; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>
```

## Article Generation Workflow

### Step 1: Research and Content Creation

**CRITICAL**: Do NOT use the basic template. Generate FULL CONTENT for all three modules.

1. **Choose Focus Stock** (for Module 1):
   - Research SEC filings, recent earnings
   - Identify 3 strong bullish points with data
   - Identify 2 genuine risks

2. **Choose Investment Theme** (for Module 2):
   - Select from: Margin of Safety, Moat, Circle of Competence, 
                 Long-term Holding, Independent Thinking, etc.
   - Find a real Buffett/Munger quote
   - Identify a historical case study

3. **Research Tech News** (for Module 3):
   - Use latest market data (within 24 hours)
   - Select 3-5 relevant tech stocks
   - Find 3 significant news items per stock
   - Write institutional-quality analysis

### Step 2: Generate AI Images (MANDATORY)

Every article MUST have 2 images. Use these prompts as templates:

**Image 1: Value Investing Concept** (for Module 2):
```
Prompt: "Professional financial investment concept, [SPECIFIC_THEME]. 
Vintage leather-bound investment ledger with gold pen, golden calculator, 
stock certificates scattered artistically, warm golden hour lighting, 
dark wood desk surface, luxury gold and deep navy blue color scheme, 
editorial magazine photography style, shallow depth of field"

Examples by theme:
- Margin of Safety: "...measuring gap between price and value, bridge metaphor..."
- Economic Moat: "...medieval castle with golden walls, protection concept..."
- Compound Interest: "...snowball effect with golden coins, exponential growth..."
```

**Image 2: Tech Stock Visualization** (for Module 3):
```
Prompt: "Modern tech stock analysis visualization, holographic data charts 
floating in dark space, AI chip circuit patterns, stock price charts 
going upward, futuristic blue and gold neon accents, high-tech financial 
data center atmosphere, professional trading floor screens, 
dark navy background with golden light particles"
```

**Image Generation Command**:
```powershell
# Generate Image 1 (Value Investing)
$prompt1 = "Professional financial investment concept, vintage leather-bound investment ledger..."
python us-stock-blog/scripts/generate-images.ps1 -Prompt $prompt1 -Output "images/posts/2026-03-08-value.jpg"

# Generate Image 2 (Tech Analysis)
$prompt2 = "Modern tech stock analysis visualization, holographic data charts..."
python us-stock-blog/scripts/generate-images.ps1 -Prompt $prompt2 -Output "images/posts/2026-03-08-tech.jpg"
```

### Step 3: Build Complete HTML Article

**CRITICAL**: Do NOT use the minimal template. Use the FULL template from 2026-03-05 article as reference.

**Required Structure**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- Meta tags (SEO optimized) -->
    <meta charset="UTF-8">
    <meta name="description" content="...">
    <title>2026年3月8日美股分析：[STOCK] + [THEME] | 美股价值投资笔记</title>
    <link rel="stylesheet" href="../../../css/style.css">
</head>
<body>
    <!-- Progress Bar -->
    <!-- Header with Navigation -->
    
    <!-- Hero Section with Background Image -->
    <section class="hero" style="background-image: url('../../../images/hero-bg.jpg');">
        <div class="subtitle">美股每日财经分析</div>
        <h1>[Stock]深度解析</h1>
        <p class="tagline">"[Theme Quote]"</p>
    </section>
    
    <main>
        <!-- Module 1: Stock Pick -->
        <section class="section" id="stock-pick">
            <div class="section-header">
                <div class="section-number">01</div>
                <h2 class="section-title">美股每日宝藏标的</h2>
                <div class="section-date">2026/03/08</div>
            </div>
            
            <div class="stock-card">
                <!-- Full content here -->
            </div>
        </section>
        
        <!-- Module 2: Investment Wisdom -->
        <section class="section" id="wisdom">
            <!-- Full content with IMAGE -->
        </section>
        
        <!-- Module 3: Market News -->
        <section class="section" id="market">
            <!-- Full content with IMAGE -->
        </section>
    </main>
    
    <footer></footer>
</body>
</html>
```

### Step 4: Add Stock Ratings (Optional but Recommended)

If the article mentions specific stocks, add automatic rating summary:

```powershell
# Get ratings for mentioned stocks
python us-stock-blog/scripts/get_stock_ratings.py [SYMBOL] [EXCHANGE]

# This will output HTML that can be inserted at the end of the article
```

### Step 5: Update Index and Deploy

1. **Add to Archive**: Update `index.html` with new article link
2. **Generate Images**: Ensure both images are generated and saved to correct paths
3. **Deploy to GitHub**:
   ```powershell
   # Option 1: Use GitHub API (recommended)
   .\us-stock-blog\scripts\daily-publish.ps1 -Date "2026-03-08"
   
   # Option 2: Manual Git push
   git add .
   git commit -m "Add 2026-03-08 article: [STOCK] + [THEME]"
   git push origin main
   ```

## Content Quality Checklist

Before considering an article complete, verify:

### Content Depth
- [ ] Module 1 has 3 detailed bullish points with data
- [ ] Module 1 has 2 genuine risk warnings
- [ ] Module 2 includes a real Buffett/Munger quote
- [ ] Module 2 has a historical case study with specific numbers
- [ ] Module 3 covers 3-5 tech stocks
- [ ] Module 3 has institutional-quality bull/bear analysis

### Visual Elements
- [ ] 2 AI-generated images created
- [ ] Image 1 placed in Module 2 with proper styling
- [ ] Image 2 placed in Module 3 with proper styling
- [ ] All images use correct relative paths (../../../images/...)

### Technical Quality
- [ ] HTML uses correct CSS classes from style.css
- [ ] Meta tags are SEO-optimized
- [ ] Navigation links work correctly
- [ ] Article is added to index.html archive
- [ ] All links use correct relative paths

### Writing Quality
- [ ] No vague statements ("可能"、"也许")
- [ ] All claims backed by data or logic
- [ ] Professional tone throughout
- [ ] No grammar or spelling errors
- [ ] Consistent formatting

## Common Mistakes to AVOID

❌ **Mistake 1**: Using the minimal template instead of full article structure
❌ **Mistake 2**: Forgetting to generate images
❌ **Mistake 3**: Shallow content (bullet points without explanation)
❌ **Mistake 4**: No data backing for claims
❌ **Mistake 5**: Wrong image paths or missing images
❌ **Mistake 6**: Not updating index.html
❌ **Mistake 7**: Generic/vague risk warnings
❌ **Mistake 8**: No historical case studies in Module 2

## CSS Class Reference

Use these exact classes for consistent styling:

```css
/* Section Headers */
.section { }
.section-header { }
.section-number { }  /* 01, 02, 03 */
.section-title { }
.section-subtitle { }
.section-date { }

/* Stock Cards */
.stock-card { }
.stock-header { }
.stock-ticker { }  /* Large ticker symbol */
.stock-name { }
.stock-meta { }
.highlight-box { }
.highlight-box.positive { }  /* Green left border */
.highlight-box.warning { }   /* Orange left border */
.highlight-box.tip { }       /* Blue left border */

/* Wisdom Section */
.wisdom-card { }
.wisdom-theme { }   /* Topic label */
.wisdom-title { }   /* H3 title */
.wisdom-content { }
.wisdom-image { }   /* Container for image */
.wisdom-rules { }
.wisdom-case { }
.wisdom-takeaway { }  /* Bottom quote box */

/* Market Section */
.market-grid { }
.stock-detail-card { }
.stock-detail-header { }
.metrics-grid { }
.metric { }
.news-list { }
.news-item { }
.news-title { }
.news-perspective { }
.analysis-box { }
```

## Examples and References

**Gold Standard Article**: `posts/2026/03/05.html`
- Full three-module structure
- Rich content with data
- 2 properly placed images
- Professional analysis quality

**CSS Styles**: `css/style.css`
- Complete design system
- Responsive breakpoints
- Typography hierarchy

**Image Templates**: See "Step 2: Generate AI Images" section above

## Environment Variables

Required for full functionality:

```bash
MODELSCOPE_TOKEN=your_modelscope_api_token
GITHUB_TOKEN=your_github_personal_access_token
```

Store in `.env` file (NEVER commit to GitHub).

## Troubleshooting

**Images not showing**: Check relative paths (should be `../../../images/...` from posts/2026/03/)

**CSS not loading**: Verify path to style.css (should be `../../../css/style.css`)

**Stock ratings not working**: Install dependencies: `pip install tradingview-ta yfinance`

**ModelScope image generation slow**: Normal - takes 2-5 minutes per image. Implement polling.

## Success Metrics

A successfully generated article should:
1. Match or exceed the quality of 2026-03-05 article
2. Have 2 high-quality AI-generated images
3. Contain rich, data-driven content in all three modules
4. Follow the exact HTML/CSS structure
5. Work correctly when viewed on GitHub Pages
