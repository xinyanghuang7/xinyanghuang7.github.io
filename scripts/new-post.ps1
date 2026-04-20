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
$templateFile = 'template/post-template.html'

$baseDir = Split-Path $PSScriptRoot -Parent
$fullDir = Join-Path $baseDir $postDir
$fullPath = Join-Path $baseDir $postFile
$templatePath = Join-Path $baseDir $templateFile

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

$stockHighlights = @'
                        <li><strong>Highlight 1:</strong> Replace with a real business-quality point.</li>
                        <li><strong>Highlight 2:</strong> Replace with a real valuation / moat point.</li>
                        <li><strong>Highlight 3:</strong> Replace with a real long-term thesis point.</li>
'@

$stockRisks = @'
                        <li><strong>Risk 1:</strong> Replace with a real thesis risk.</li>
                        <li><strong>Risk 2:</strong> Replace with a real execution / valuation risk.</li>
'@

$wisdomContent = @'
                    <p>Replace with real framework content. Separate verified facts from personal judgment.</p>
                    <p class="flow-gap-md">If the evidence is soft, say so clearly instead of pretending certainty.</p>
'@

$wisdomRules = @'
                        <li><strong>Rule 1:</strong> Replace with an actionable rule.</li>
                        <li><strong>Rule 2:</strong> Replace with an actionable rule.</li>
                        <li><strong>Rule 3:</strong> Replace with an actionable rule.</li>
'@

$wisdomCase = @'
                    <p>Replace with a real case and real numbers.</p>
                    <p class="flow-gap-sm">Do not leave this as slogan-only content.</p>
                    <p class="flow-gap-sm"><strong>Key takeaway:</strong> Turn the case into a usable decision rule.</p>
'@

$marketStocks = @'
                <article class="stock-detail-card">
                    <div class="stock-detail-header">
                        <div>
                            <div class="stock-detail-ticker">HOLDING1</div>
                            <div class="stock-detail-name">Replace with a real holding / watchlist label</div>
                        </div>
                        <div class="stock-price">
                            <div class="price-value">Replace with real data cutoff</div>
                        </div>
                    </div>
                    <div class="news-list">
                        <div class="news-item">
                            <div class="news-title">Evidence audit</div>
                            <div class="news-perspective"><strong>[Audit]</strong> Replace with external basis, data cutoff, my judgment, confidence, and evidence strength.</div>
                        </div>
                    </div>
                </article>
'@

$decisionCards = @'
                <article class="tracking-card tracking-card-core">
                    <div class="tracking-card-header">
                        <span class="tracking-card-ticker">HOLDING1</span>
                        <span class="tracking-badge tracking-badge-core">核心 holding</span>
                    </div>
                    <div class="tracking-row">
                        <span class="tracking-label">当前桶位</span>
                        <span class="tracking-value tracking-value-core">Replace with the real bucket / posture and make sure it matches Module 3.</span>
                    </div>
                    <div class="tracking-row">
                        <span class="tracking-label">核心变量</span>
                        <span class="tracking-value tracking-value-core">Replace with the single most important thing to watch now.</span>
                    </div>
                    <div class="tracking-row">
                        <span class="tracking-label">不要误读</span>
                        <span class="tracking-value tracking-value-core">Replace with the key trap / false signal / overread warning.</span>
                    </div>
                    <div class="tracking-row">
                        <span class="tracking-label">下一步</span>
                        <span class="tracking-value tracking-value-core">Replace with the next action boundary and evidence path.</span>
                    </div>
                </article>
'@

$replacements = [ordered]@{
    '{{TITLE}}' = ($year + ' US Stock Note')
    '{{DESCRIPTION}}' = ($Date + ' daily stock-pick, investing framework, and portfolio decision note.')
    '{{DISPLAY_DATE}}' = $Date
    '{{DATE_ISO}}' = $Date
    '{{DATE_CANONICAL}}' = ($year + '/' + $month + '/' + $day)
    '{{HERO_TITLE}}' = 'Replace with the real hero title'
    '{{HERO_SUBTITLE}}' = '"Replace with one sentence worth remembering"'
    '{{DATE_SHORT}}' = ($year + '/' + $month + '/' + $day)
    '{{STOCK_TICKER}}' = 'XXX'
    '{{STOCK_NAME}}' = 'Replace with real company name'
    '{{STOCK_EXCHANGE}}' = 'Exchange · Listing info'
    '{{STOCK_INDUSTRY}}' = 'Industry'
    '{{STOCK_BUSINESS}}' = 'Core business'
    '{{STOCK_CAP}}' = 'Market-cap bucket'
    '{{STOCK_DIVIDEND}}' = 'Dividend / buyback note'
    '{{STOCK_HIGHLIGHTS}}' = $stockHighlights
    '{{STOCK_RISKS}}' = $stockRisks
    '{{STOCK_ADVICE}}' = 'Replace with a real conclusion, and tag the ticker as holding / watchlist / candidate / case-study.'
    '{{WISDOM_THEME}}' = 'Framework theme'
    '{{WISDOM_TITLE}}' = 'Replace with the real framework title'
    '{{WISDOM_CONTENT}}' = $wisdomContent
    '{{WISDOM_RULES}}' = $wisdomRules
    '{{WISDOM_CASE}}' = $wisdomCase
    '{{WISDOM_TAKEAWAY}}' = 'Replace with the one-sentence takeaway.'
    '{{MARKET_STOCKS}}' = $marketStocks
    '{{DECISION_CARDS}}' = $decisionCards
    '{{ANALYSIS_SUMMARY}}' = '<strong>Summary:</strong> Replace with the real action summary and evidence boundary.'
}

$content = $template
foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, [string]$replacements[$key])
}

$utf8Bom = [byte[]](0xEF, 0xBB, 0xBF)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
[System.IO.File]::WriteAllBytes($fullPath, $utf8Bom + $bytes)

Write-Host ''
Write-Host 'Post scaffold created.' -ForegroundColor Green
Write-Host ("  File: " + $postFile) -ForegroundColor Cyan
Write-Host ''
Write-Host 'Default premium workflow:' -ForegroundColor Yellow
Write-Host '  1. Refresh upstream truth (command-center / portfolio / candidate-pool / ticker files / real-time-thesis-monitor when Module 3 is freshness-sensitive)' -ForegroundColor Gray
Write-Host ('  2. Draft ' + $postFile + ' with teaching-first prose and no filler short lines') -ForegroundColor Gray
Write-Host '  3. Run reviewer chain: blog-reviewer -> blog-semantic-reviewer -> frontend close' -ForegroundColor Gray
Write-Host '  4. Run python .\scripts\sync-site-data.py' -ForegroundColor Gray
Write-Host '  5. Run .\scripts\qa-site.ps1' -ForegroundColor Gray
Write-Host ('  6. Run python .\scripts\investing\validate_blog_backprop_diff.py --base-ref HEAD') -ForegroundColor Gray
Write-Host ('  7. Run python .\scripts\deploy.py --date ' + $Date) -ForegroundColor Gray
Write-Host '  8. Verify GitHub + live domain + browser render before calling it done' -ForegroundColor Gray
