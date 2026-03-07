# Stock Rating Integration Examples

## Example 1: 单只股票评级

```powershell
# 获取 VST (Vistra Corp) 的评级
python scripts/get_stock_ratings.py VST NYSE
```

**输出示例：**
```
🔍 正在获取 VST 的评级数据...
  ✅ TradingView: BUY (买入11/卖出2/中性8)
  ✅ Yahoo Finance: 买入 | 目标价上涨+23.5%
  📊 综合评级: 买入 (置信度: 高)
```

**生成的 HTML：**
```html
<div class='stock-rating'>
  <div class='rating-header'>
    <span class='rating-badge rating-买入'>买入</span>
    <span class='rating-confidence'>置信度: 高</span>
  </div>
  <div class='rating-section'>
    <h4>📈 技术指标 (TradingView)</h4>
    <p>综合建议: <strong>BUY</strong></p>
    <p>指标统计: 买入11 | 卖出2 | 中性8</p>
    <p>RSI: 62.45</p>
  </div>
  <div class='rating-section'>
    <h4>🏦 分析师评级 (Yahoo Finance)</h4>
    <p>综合建议: <strong>买入</strong> (基于12位分析师)</p>
    <p>当前价: $86.42 | 目标均价: $106.75</p>
    <p>上涨潜力: <span style='color:green'>+23.5%</span></p>
  </div>
  <div class='rating-summary'>
    <p>💡 【买入】技术面BUY，目标价上涨空间+23.5%，建议关注</p>
  </div>
</div>
```

## Example 2: 批量获取多只股票

```python
from scripts.get_stock_ratings import get_stock_ratings_batch, format_rating_for_blog

# 定义要分析的股票列表
tech_stocks = [
    {"symbol": "NVDA", "company_name": "NVIDIA Corp.", "exchange": "NASDAQ"},
    {"symbol": "META", "company_name": "Meta Platforms", "exchange": "NASDAQ"},
    {"symbol": "AAPL", "company_name": "Apple Inc.", "exchange": "NASDAQ"},
    {"symbol": "MSFT", "company_name": "Microsoft Corp.", "exchange": "NASDAQ"},
]

# 批量获取评级
ratings = get_stock_ratings_batch(tech_stocks)

# 按评级排序
ratings_sorted = sorted(ratings, key=lambda x: x.composite_score, reverse=True)

# 输出结果
for r in ratings_sorted:
    print(f"{r.symbol}: {r.composite_rating} (Score: {r.composite_score:+.2f})")
    print(f"  {r.summary}\n")
```

## Example 3: 整合到博客模板

完整的博客 Section 1 (宝藏标的) 示例：

```html
<section class="section" id="stock-pick">
    <div class="section-header">
        <div class="section-number">01</div>
        <h2 class="section-title">美股每日宝藏标的</h2>
        <div class="section-date">2026/03/07</div>
    </div>
    
    <div class="stock-pick-content">
        <h3>VST / Vistra Corp.</h3>
        <p class="stock-meta">电力公用事业 / 竞争性电力生产与零售 | NYSE</p>
        
        <!-- 评级组件 -->
        <div class="stock-rating">
            <div class="rating-header">
                <span class="rating-badge rating-买入">买入</span>
                <span class="rating-confidence">置信度: 高 | 技术面+分析师双重验证</span>
            </div>
            
            <div class="rating-section">
                <h4>📈 技术指标 (TradingView)</h4>
                <div class="indicators-grid">
                    <div class="indicator-item">
                        <span class="indicator-value">BUY</span>
                        <span class="indicator-label">综合建议</span>
                    </div>
                    <div class="indicator-item">
                        <span class="indicator-value">11</span>
                        <span class="indicator-label">买入指标</span>
                    </div>
                    <div class="indicator-item">
                        <span class="indicator-value">2</span>
                        <span class="indicator-label">卖出指标</span>
                    </div>
                    <div class="indicator-item">
                        <span class="indicator-value">62.5</span>
                        <span class="indicator-label">RSI</span>
                    </div>
                </div>
            </div>
            
            <div class="rating-section">
                <h4>🏦 华尔街分析师评级 (Yahoo Finance)</h4>
                <p>综合建议: <strong>买入</strong> (基于12位分析师评级)</p>
                <div class="price-targets">
                    <div class="price-target">
                        <span class="label">当前价</span>
                        <span class="value">$86.42</span>
                    </div>
                    <div class="price-target">
                        <span class="label">目标均价</span>
                        <span class="value">$106.75</span>
                    </div>
                    <div class="price-target">
                        <span class="label">上涨空间</span>
                        <span class="value" style="color: #22c55e;">+23.5%</span>
                    </div>
                    <div class="price-target">
                        <span class="label">最高目标</span>
                        <span class="value">$125.00</span>
                    </div>
                </div>
            </div>
            
            <div class="rating-summary">
                <p>💡 【买入】技术面呈现BUY信号，华尔街分析师目标价较当前有23.5%上涨空间，建议关注能源AI受益标的VST</p>
            </div>
            
            <p class="data-source">数据来源: TradingView技术指标 + Yahoo Finance分析师评级 | 更新时间: 2026-03-07 11:30 EST</p>
        </div>
        
        <!-- 原有内容 -->
        <h4>✅ 核心价值亮点</h4>
        <ul>
            <li>AI电力需求爆发受益者：美国AI数据中心电力需求呈指数级增长...</li>
            <li>战略并购驱动增长：近期完成对Energy Harbor核电资产的收购...</li>
            <li>估值存在安全边际：相比同业龙头估值仍处于合理偏低区间</li>
        </ul>
        
        <h4>⚠️ 核心风险提示</h4>
        <ul>
            <li>区域市场波动风险：电力价格受德州ERCOT市场供需波动影响...</li>
            <li>监管政策不确定性：核电业务面临严格的联邦和州级监管...</li>
        </ul>
        
        <p class="holding-suggestion">💡 <strong>长期持有建议：</strong>建议持有周期2-4年，单个标的仓位控制在投资组合的3%-5%以内，Vistra适合作为能源基础设施板块的卫星配置。</p>
    </div>
</section>
```

## Example 4: 自动化脚本

创建每日自动获取评级的脚本：

```powershell
# daily-ratings.ps1
$stocks = @(
    @{ Symbol = "AAPL"; Exchange = "NASDAQ" },
    @{ Symbol = "VST"; Exchange = "NYSE" },
    @{ Symbol = "NVDA"; Exchange = "NASDAQ" },
    @{ Symbol = "META"; Exchange = "NASDAQ" }
)

$results = @()

foreach ($stock in $stocks) {
    Write-Host "Processing $($stock.Symbol)..."
    $json = .\scripts\get-rating.ps1 -Symbol $stock.Symbol -Exchange $stock.Exchange -OutputFormat json | ConvertFrom-Json
    $results += $json
}

# 保存为JSON供博客使用
$results | ConvertTo-Json -Depth 10 | Out-File "daily-ratings.json"

# 按评级排序显示
$results | Sort-Object composite_score -Descending | 
    Select-Object symbol, composite_rating, composite_score, @{N="Upside"; E={$_.analyst.upside_potential}}
```

## 数据可信度说明

### 置信度等级

| 等级 | 说明 | 使用建议 |
|------|------|----------|
| **高** | 同时拥有TradingView技术面和Yahoo分析师数据 | 可作为重要参考依据 |
| **中** | 只有单一数据源 | 需要结合其他信息判断 |
| **低** | 数据源获取失败 | 不建议作为决策依据 |

### 局限性说明

1. **分析师覆盖度**: 小盘股可能没有分析师覆盖
2. **数据延迟**: 技术面数据实时，分析师评级可能有1-3天延迟
3. **权重配置**: 默认40%技术面+60%分析师，可根据策略调整
4. **市场适应性**: 极端市场环境下，技术指标可能失效

## CSS 自定义

在 `assets/rating-styles.css` 中修改配色：

```css
:root {
  --rating-strong-buy: #22c55e;  /* 修改为你喜欢的绿色 */
  --rating-buy: #84cc16;         /* 修改为你喜欢的浅绿 */
  --rating-neutral: #eab308;     /* 修改为你喜欢的黄色 */
  --rating-sell: #f97316;        /* 修改为你喜欢的橙色 */
  --rating-strong-sell: #ef4444; /* 修改为你喜欢的红色 */
}
```
