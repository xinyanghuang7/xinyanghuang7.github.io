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
                    <p style="margin-top: 1rem;">If the evidence is soft, say so clearly instead of pretending certainty.</p>
'@

$wisdomRules = @'
                        <li><strong>Rule 1:</strong> Replace with an actionable rule.</li>
                        <li><strong>Rule 2:</strong> Replace with an actionable rule.</li>
                        <li><strong>Rule 3:</strong> Replace with an actionable rule.</li>
'@

$wisdomCase = @'
                    <p>Replace with a real case and real numbers.</p>
                    <p style="margin-top: 0.8rem;">Do not leave this as slogan-only content.</p>
                    <p style="margin-top: 0.8rem;"><strong>Key takeaway:</strong> Turn the case into a usable decision rule.</p>
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

$analysisOpportunity = @'
                        <div class="analysis-item">
                            <strong>Priority research name</strong>
                            <p>Explain why this deserves incremental capital now.</p>
                        </div>
'@

$analysisRisk = @'
                        <div class="analysis-item">
                            <strong>Wait for more proof</strong>
                            <p>Explain what has not been validated yet.</p>
                        </div>
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
    '{{ANALYSIS_OPPORTUNITY}}' = $analysisOpportunity
    '{{ANALYSIS_RISK}}' = $analysisRisk
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
Write-Host 'Next steps:' -ForegroundColor Yellow
Write-Host ('  1. Edit ' + $postFile + ' with real content') -ForegroundColor Gray
Write-Host '  2. Run python .\scripts\sync-site-data.py' -ForegroundColor Gray
Write-Host '  3. Run .\scripts\qa-site.ps1' -ForegroundColor Gray
Write-Host ('  4. Run python .\scripts\deploy.py --date ' + $Date) -ForegroundColor Gray
