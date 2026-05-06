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
    '{{one_line_conclusion}}' = 'Replace with the one sentence that matters today.'
    '{{tickers}}' = 'TICKERS TBD'
    '{{judgment_markdown}}' = (New-TodoBlock 'Write the main judgment first. Separate fact, interpretation, and action boundary.')
    '{{facts_markdown}}' = (New-TodoBlock 'List only verified facts, numbers, dates, and what changed today.')
    '{{why_markdown}}' = (New-TodoBlock 'Explain why these facts matter for business quality, valuation, or portfolio risk.')
    '{{impact_markdown}}' = (New-TodoBlock 'Map impact to holdings, watchlist names, and candidate pool. State no-action cases explicitly.')
    '{{risks_markdown}}' = (New-TodoBlock 'Name disconfirming evidence, what would make the thesis wrong, and data freshness limits.')
    '{{next_markdown}}' = (New-TodoBlock 'Define the next observations, trigger levels, and when to revisit.')
    '{{sources_markdown}}' = '<ul><li>TODO: source name, link if available, what it supports, and confidence boundary.</li></ul>'
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
Write-Host 'Default simplified reading workflow:' -ForegroundColor Yellow
Write-Host '  1. Refresh upstream truth (command-center / portfolio / candidate-pool / ticker files / real-time-thesis-monitor when freshness-sensitive)' -ForegroundColor Gray
Write-Host ('  2. Draft ' + $postFile + ' with Markdown-first prose, explicit evidence boundaries, and no component-first filler') -ForegroundColor Gray
Write-Host '  3. Run reviewer chain: content review -> semantic review -> lightweight frontend compatibility close' -ForegroundColor Gray
Write-Host '  4. Run python .\scripts\sync-site-data.py' -ForegroundColor Gray
Write-Host '  5. Run .\scripts\qa-site.ps1' -ForegroundColor Gray
Write-Host ('  6. Run python .\scripts\investing\validate_blog_backprop_diff.py --base-ref HEAD') -ForegroundColor Gray
Write-Host ('  7. Run python .\scripts\deploy.py --date ' + $Date) -ForegroundColor Gray
Write-Host '  8. Verify GitHub + live domain + desktop/mobile browser render before calling it done' -ForegroundColor Gray
