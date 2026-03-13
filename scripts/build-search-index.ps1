# 生成搜索索引 JSON
# 扫描所有文章并生成搜索索引

$baseDir = Join-Path $PSScriptRoot ".."
$postsDir = Join-Path $baseDir "posts"
$outputFile = Join-Path $baseDir "search-index.json"

$searchIndex = @()

function Extract-Content($content, $pattern) {
    if ($content -match $pattern) {
        return $matches[1].Trim()
    }
    return ""
}

if (Test-Path $postsDir) {
    Get-ChildItem -Path $postsDir -Recurse -Filter "*.html" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -Encoding UTF8
        $relativePath = $_.FullName.Replace($baseDir, "").TrimStart("\", "/").Replace("\", "/")
        
        $title = Extract-Content $content '<title>(.+?)\s*\|'
        $date = Extract-Content $content 'class="nav-date"[^\u003e]*\u003e([^\u003c]+)'
        
        # 提取股票代码
        $tickers = @()
        [regex]::Matches($content, 'stock-ticker[^\u003e]*\u003e([A-Z]{1,5})\u003c') | ForEach-Object {
            $tickers += $_.Groups[1].Value
        }
        
        # 提取摘要（前200字符）
        $descMatch = [regex]::Match($content, '<p>([^\u003c]{50,200})')
        $description = if ($descMatch.Success) { $descMatch.Groups[1].Value } else { "" }
        
        $searchIndex += @{
            title = $title
            url = $relativePath
            date = $date
            tickers = $tickers
            content = $description
        }
    }
}

$searchIndex | ConvertTo-Json -Depth 3 | Set-Content $outputFile -Encoding UTF8

Write-Host "✓ 搜索索引已生成: search-index.json" -ForegroundColor Green
Write-Host "  共 $($searchIndex.Count) 篇文章索引" -ForegroundColor Cyan
