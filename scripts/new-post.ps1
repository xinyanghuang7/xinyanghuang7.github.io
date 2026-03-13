# 创建新文章脚本（修复 UTF-8 BOM 编码）
# 用法: .\new-post.ps1 [-Date "2026-03-09"]

param(
    [string]$Date = (Get-Date -Format "yyyy-MM-dd")
)

$ErrorActionPreference = "Stop"

# 解析日期
$year, $month, $day = $Date.Split('-')

# 构建路径
$postDir = "posts/$year/$month"
$postFile = "$postDir/$day.html"
$templateFile = "template/post-template.html"

# 确保目录存在
$baseDir = Split-Path $PSScriptRoot -Parent
$fullDir = Join-Path $baseDir $postDir
if (!(Test-Path $fullDir)) {
    New-Item -ItemType Directory -Force -Path $fullDir | Out-Null
    Write-Host "✓ 创建目录: $postDir" -ForegroundColor Green
}

# 检查文件是否已存在
$fullPath = Join-Path $baseDir $postFile
if (Test-Path $fullPath) {
    Write-Host "⚠ 文件已存在: $postFile" -ForegroundColor Yellow
    $overwrite = Read-Host "是否覆盖? (y/n)"
    if ($overwrite -ne 'y') {
        Write-Host "取消操作" -ForegroundColor Gray
        exit
    }
}

# 读取模板
$templatePath = Join-Path $baseDir $templateFile
if (!(Test-Path $templatePath)) {
    Write-Host "✗ 模板文件不存在: $templateFile" -ForegroundColor Red
    exit 1
}

$template = Get-Content $templatePath -Raw

# 生成内容
$replacements = @{
    '{{TITLE}}' = "$year年$month月$day`日美股分析"
    '{{DESCRIPTION}}' = "$year年$month月$day`日美股宝藏标的分析、投资认知分享与科技核心资讯"
    '{{DISPLAY_DATE}}' = "$year年$([int]$month)月$([int]$day)日"
    '{{HERO_TITLE}}' = "每日财经分析"
    '{{HERO_SUBTITLE}}' = '"以合理的价格买入优秀的企业"'
    '{{DATE_SHORT}}' = "$year/$month/$day"
    '{{STOCK_TICKER}}' = "XXX"
    '{{STOCK_NAME}}' = "示例公司 (请修改)"
    '{{STOCK_EXCHANGE}}' = "交易所 · 上市信息"
    '{{STOCK_INDUSTRY}}' = "所属行业"
    '{{STOCK_BUSINESS}}' = "核心业务描述"
    '{{STOCK_CAP}}' = "市值定位"
    '{{STOCK_DIVIDEND}}' = "股息率"
    '{{STOCK_HIGHLIGHTS}}' = @"
                        <li><strong>亮点1：</strong>请填写核心价值亮点</li>
                        <li><strong>亮点2：</strong>请填写核心价值亮点</li>
                        <li><strong>亮点3：</strong>请填写核心价值亮点</li>
"@
    '{{STOCK_RISKS}}' = @"
                        <li><strong>风险1：</strong>请填写核心风险提示</li>
                        <li><strong>风险2：</strong>请填写核心风险提示</li>
"@
    '{{STOCK_ADVICE}}' = "建议持有周期<strong>X-Y年</strong>，单个标的仓位控制在投资组合的<strong>X%-Y%</strong>以内。"
    '{{WISDOM_THEME}}' = "投资主题"
    '{{WISDOM_TITLE}}' = "今日投资认知标题"
    '{{WISDOM_CONTENT}}' = @"
                    <p>请填写投资认知内容...</p>
                    <p style="margin-top: 1rem;">继续填写...</p>
"@
    '{{WISDOM_RULES}}' = @"
                        <li><strong>规则1：</strong>请填写可执行规则</li>
                        <li><strong>规则2：</strong>请填写可执行规则</li>
                        <li><strong>规则3：</strong>请填写可执行规则</li>
"@
    '{{WISDOM_CASE}}' = @"
                    <p>请填写经典案例...</p>
                    <p style="margin-top: 0.8rem;">案例细节...</p>
                    <p style="margin-top: 0.8rem;"><strong>关键启示：</strong>...</p>
"@
    '{{WISDOM_TAKEAWAY}}' = "请填写核心要点总结。"
    '{{MARKET_STOCKS}}' = @"
                <!-- Stock 1 -->
                <div class="stock-detail-card">
                    <div class="stock-detail-header">
                        <div>
                            <div class="stock-detail-ticker">STOCK1</div>
                            <div class="stock-detail-name">公司1 · 描述</div>
                        </div>
                        <div class="stock-price">
                            <div class="price-value">$XXX.XX</div>
                            <div class="price-change price-up">▲ +X.XX%</div>
                        </div>
                    </div>
                    <div class="metrics-grid">
                        <div class="metric"><div class="metric-label">成交量</div><div class="metric-value">XX.XXM</div></div>
                        <div class="metric"><div class="metric-label">日高/日低</div><div class="metric-value">$XXX/$XXX</div></div>
                        <div class="metric"><div class="metric-label">超额收益</div><div class="metric-value price-up">+X.XX%</div></div>
                    </div>
                    <div class="news-list">
                        <div class="news-item">
                            <div class="news-title">🎯 新闻标题1</div>
                            <div class="news-perspective"><strong>【长线视角】</strong>分析内容...</div>
                        </div>
                    </div>
                </div>
"@
    '{{ANALYSIS_OPPORTUNITY}}' = @"
                        <div class="analysis-item">
                            <strong>标的1</strong>
                            <p>机会分析内容...</p>
                        </div>
"@
    '{{ANALYSIS_RISK}}' = @"
                        <div class="analysis-item">
                            <strong>标的1</strong>
                            <p>风险分析内容...</p>
                        </div>
"@
    '{{ANALYSIS_SUMMARY}}' = "<strong>综合投资态度与操作策略：</strong>请填写综合分析..."
}

# 替换模板变量
$content = $template
foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# 写入文件 - UTF-8 BOM 编码
$utf8Bom = [byte[]](0xEF, 0xBB, 0xBF)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$finalBytes = $utf8Bom + $bytes
[System.IO.File]::WriteAllBytes($fullPath, $finalBytes)

Write-Host ""
Write-Host "✓ 文章创建成功!" -ForegroundColor Green
Write-Host "  文件: $postFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 编辑文件: $postFile 填充内容" -ForegroundColor Gray
Write-Host "  2. 运行 .\scripts\deploy.py --date $Date 部署到GitHub" -ForegroundColor Gray
