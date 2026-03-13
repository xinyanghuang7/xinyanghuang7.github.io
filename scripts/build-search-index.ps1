$ErrorActionPreference = 'Stop'

$script = Join-Path $PSScriptRoot 'sync-site-data.py'
if (!(Test-Path $script)) {
    Write-Host "Error: missing $script" -ForegroundColor Red
    exit 1
}

python $script
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Site data synced.' -ForegroundColor Green
Write-Host '  Outputs: index.html + js/posts-data.js' -ForegroundColor Cyan
