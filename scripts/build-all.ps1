param(
    [switch]$Deploy,
    [string]$Date
)

$ErrorActionPreference = "Stop"
$scriptsDir = $PSScriptRoot

Write-Host ""
Write-Host "Start site build..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1/4: Sync archive + search data..." -ForegroundColor Yellow
& "$scriptsDir\build-search-index.ps1"
Write-Host ""

Write-Host "Step 2/4: Build sitemap..." -ForegroundColor Yellow
& "$scriptsDir\build-sitemap.ps1"
Write-Host ""

Write-Host "Step 3/4: Run local QA..." -ForegroundColor Yellow
& "$scriptsDir\qa-site.ps1"
Write-Host ""

if ($Deploy) {
    Write-Host "Step 4/4: Deploy to GitHub..." -ForegroundColor Yellow
    if ($Date) {
        python "$scriptsDir\deploy.py" --date $Date
    } else {
        python "$scriptsDir\deploy.py"
    }
} else {
    Write-Host "Step 4/4: Deploy skipped (use -Deploy to publish)." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
