$ErrorActionPreference = 'Stop'

$baseDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$postsDir = Join-Path $baseDir 'posts'
$outputFile = Join-Path $baseDir 'sitemap.xml'
$baseUrl = 'https://4fire.qzz.io'

$urls = @()
$urls += @{
    loc = "$baseUrl/"
    lastmod = Get-Date -Format 'yyyy-MM-dd'
    changefreq = 'daily'
    priority = '1.0'
}

if (Test-Path $postsDir) {
    Get-ChildItem -Path $postsDir -Recurse -Filter '*.html' | ForEach-Object {
        $relativePath = ($_.FullName.Replace($baseDir, '').TrimStart([char[]]'\\/')) -replace '\\', '/'
        $urls += @{
            loc = "$baseUrl/$relativePath"
            lastmod = $_.LastWriteTime.ToString('yyyy-MM-dd')
            changefreq = 'weekly'
            priority = '0.8'
        }
    }
}

$lines = @(
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
)

foreach ($url in $urls) {
    $lines += '  <url>'
    $lines += "    <loc>$($url.loc)</loc>"
    $lines += "    <lastmod>$($url.lastmod)</lastmod>"
    $lines += "    <changefreq>$($url.changefreq)</changefreq>"
    $lines += "    <priority>$($url.priority)</priority>"
    $lines += '  </url>'
}

$lines += '</urlset>'
$lines -join "`n" | Set-Content $outputFile -Encoding UTF8

Write-Host 'Sitemap generated: sitemap.xml' -ForegroundColor Green
Write-Host "  URLs: $($urls.Count)" -ForegroundColor Cyan
