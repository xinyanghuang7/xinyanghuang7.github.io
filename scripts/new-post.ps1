param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd')
)

$ErrorActionPreference = 'Stop'

$parts = $Date.Split('-')
if ($parts.Count -ne 3) {
    Write-Host 'Error: date must be YYYY-MM-DD' -ForegroundColor Red
    exit 1
}

$year, $month, $day = $parts
$postDir = "posts/$year/$month"
$postFile = "$postDir/$day.html"
$templateFile = 'templates/blog-reading-template.html'

$baseDir = Split-Path $PSScriptRoot -Parent
$fullDir = Join-Path $baseDir $postDir
$fullPath = Join-Path $baseDir $postFile
$templatePath = Join-Path $baseDir $templateFile

function New-TodoBlock([string]$text) {
    return "<p><strong>TODO:</strong> $text</p>"
}

if (!(Test-Path $fullDir)) {
    New-Item -ItemType Directory -Force -Path $fullDir | Out-Null
    Write-Host "Created directory: $postDir" -ForegroundColor Green
}

if (Test-Path $fullPath) {
    Write-Host "File already exists: $postFile" -ForegroundColor Yellow
    $overwrite = Read-Host 'Overwrite? (y/n)'
    if ($overwrite -ne 'y') {
        Write-Host 'Cancelled.' -ForegroundColor Gray
        exit 0
    }
}

if (!(Test-Path $templatePath)) {
    Write-Host "Error: missing template $templateFile" -ForegroundColor Red
    exit 1
}

$template = Get-Content $templatePath -Raw -Encoding UTF8

$displayDate = "$year-$month-$day"
$replacements = [ordered]@{
    '{{description}}' = "$displayDate daily investment note with facts, judgment, risks, and source boundaries."
    '{{yyyy}}' = $year
    '{{mm}}' = $month
    '{{dd}}' = $day
    '{{title}}' = "$displayDate US Stock Note"
    '{{date}}' = $displayDate
    '{{one_line_conclusion}}' = '写一句今天最重要、可复核、能指导动作边界的核心结论。'
    '{{tickers}}' = 'TICKERS TBD'
    '{{pm_dashboard_markdown}}' = (New-TodoBlock '写 PM brief：组合姿态、今日动作/不动作、最大风险、最大机会、证据截止。')
    '{{stock_pick_markdown}}' = (New-TodoBlock '写今日标的 5+2，并先标注身份：holding / watchlist / candidate / case-study。')
    '{{lesson_markdown}}' = (New-TodoBlock '写一句可复用投资规则，再给极简依据、失效边界和它如何映射到当前持仓/候选。')
    '{{creator_digest_markdown}}' = (New-TodoBlock '固定覆盖美投君/本地美投系统/环球视野财经；逐项标注有字幕数字/标题层/待补 transcript/无。')
    '{{market_markdown}}' = (New-TodoBlock '真实持仓优先；观察列表另起层；每条写来源、时间、核心事实、影响、动作是否改变。')
    '{{decision_cards_markdown}}' = (New-TodoBlock '只给真实持仓动作卡：状态、动作、加仓/暂停/减仓触发、风控线、今日最高优先级。')
    '{{risks_markdown}}' = (New-TodoBlock '写共同叙事风险、反证、失效条件、下一步观察。')
    '{{sources_markdown}}' = '<ul><li><strong>TODO:</strong> source name, link if available, what it supports, and confidence boundary.</li></ul>'
}

$content = $template
foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, [string]$replacements[$key])
}

$unresolved = [regex]::Matches($content, '\{\{[^}]+\}\}')
if ($unresolved.Count -gt 0) {
    Write-Host 'Error: unresolved placeholders remain:' -ForegroundColor Red
    $unresolved | Select-Object -ExpandProperty Value -Unique | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)

Write-Host ''
Write-Host 'Markdown-first post scaffold created.' -ForegroundColor Green
Write-Host ("  File: " + $postFile) -ForegroundColor Cyan
Write-Host ''
Write-Host 'Default Markdown-first benchmark workflow:' -ForegroundColor Yellow
Write-Host '  1. Refresh upstream truth (command-center / portfolio / candidate-pool / ticker files / real-time-thesis-monitor when freshness-sensitive)' -ForegroundColor Gray
Write-Host ('  2. Draft ' + $postFile + ' with PM brief + 5 modules + source/evidence boundaries; use prose first, components only when they improve comprehension') -ForegroundColor Gray
Write-Host '  3. Run reviewer chain: content review -> semantic review -> lightweight frontend compatibility close' -ForegroundColor Gray
Write-Host '  4. Run python .\scripts\sync-site-data.py' -ForegroundColor Gray
Write-Host '  5. Run .\scripts\qa-site.ps1' -ForegroundColor Gray
Write-Host '  Note: Do not use scripts/generate_blog.py or scripts/generate_blog_full.py for default posts; they are legacy-only guarded generators.' -ForegroundColor DarkYellow
Write-Host ('  6. Run python .\scripts\investing\validate_blog_backprop_diff.py --base-ref HEAD') -ForegroundColor Gray
Write-Host ('  7. Run python .\scripts\deploy.py --date ' + $Date) -ForegroundColor Gray
Write-Host '  8. Verify GitHub + live domain + desktop/mobile browser render before calling it done' -ForegroundColor Gray
