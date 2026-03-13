# 生成 sitemap.xml
# 自动生成站点地图供搜索引擎索引

$baseDir = Join-Path $PSScriptRoot ".."
$postsDir = Join-Path $baseDir "posts"
$outputFile = Join-Path $baseDir "sitemap.xml"
$baseUrl = "https://xinyanghuang7.github.io"

$urls = @()

# 首页
$urls += @{
    loc = "$baseUrl/"
    lastmod = Get-Date -Format "yyyy-MM-dd"
    changefreq = "daily"
    priority = "1.0"
}

# 扫描所有文章
if (Test-Path $postsDir) {
    Get-ChildItem -Path $postsDir -Recurse -Filter "*.html" | ForEach-Object {
        $relativePath = $_.FullName.Replace($baseDir, "").TrimStart("\", "/").Replace("\", "/")
        $lastMod = $_.LastWriteTime.ToString("yyyy-MM-dd")
        
        $urls += @{
            loc = "$baseUrl/$relativePath"
            lastmod = $lastMod
            changefreq = "weekly"
            priority = "0.8"
        }
    }
}

# 生成 XML
$xml = @"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
"@

foreach ($url in $urls) {
    $xml += @"
    <url>
        <loc>$($url.loc)</loc>
        <lastmod>$($url.lastmod)</lastmod>
        <changefreq>$($url.changefreq)</changefreq>
        <priority>$($url.priority)</priority>
    </url>
"@
}

$xml += "</urlset>"

$xml | Set-Content $outputFile -Encoding UTF8

Write-Host "✓ Sitemap 已生成: sitemap.xml" -ForegroundColor Green
Write-Host "  共 $($urls.Count) 个 URL" -ForegroundColor Cyan
