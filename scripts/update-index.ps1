# 更新主页文章目录脚本

$postDir = Join-Path $PSScriptRoot ".." "posts"
$indexTemplate = Join-Path $PSScriptRoot ".." "template" "index-template.html"
$indexFile = Join-Path $PSScriptRoot ".." "index.html"

# 扫描所有文章
$archiveItems = @()

if (Test-Path $postDir) {
    $years = Get-ChildItem -Path $postDir -Directory | Sort-Object Name -Descending
    
    foreach ($year in $years) {
        $yearNum = $year.Name
        $yearHtml = "`n                <div class=`"archive-year`">`n                    <h3 class=`"archive-year-title`">$yearNum年</h3>`n"
        
        $months = Get-ChildItem -Path $year.FullName -Directory | Sort-Object Name -Descending
        
        foreach ($month in $months) {
            $monthNum = [int]$month.Name
            $monthNames = @("", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月")
            $monthName = $monthNames[$monthNum]
            
            $yearHtml += "                    <div class=`"archive-month`">`n                        <div class=`"archive-month-title`">$monthName</div>`n                        <div class=`"archive-items`">`n"
            
            $posts = Get-ChildItem -Path $month.FullName -Filter "*.html" | Sort-Object Name -Descending
            
            foreach ($post in $posts) {
                $day = [int]($post.BaseName)
                $postPath = "posts/$yearNum/$($month.Name)/$($post.Name)"
                
                # 尝试从文章中提取标题
                $title = "$yearNum年$monthNum月${day}日美股分析"
                $desc = "点击查看详细分析"
                
                try {
                    $content = Get-Content $post.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
                    if ($content -match '<title>(.+?)\s*\|') {
                        $title = $matches[1].Trim()
                    }
                    # 提取第一个股票ticker作为描述
                    if ($content -match 'stock-ticker[^>]*>([A-Z]+)') {
                        $ticker = $matches[1]
                        $desc = "今日焦点：$ticker 等标的深度分析"
                    }
                } catch {}
                
                $yearHtml += @"
                            <a href="$postPath" class="archive-item">
                                <div class="archive-item-date">$($day.ToString("00"))</div>
                                <div class="archive-item-content">
                                    <div class="archive-item-title">$title</div>
                                    <div class="archive-item-desc">$desc</div>
                                </div>
                                <div class="archive-item-arrow">→</div>
                            </a>
"@
            }
            
            $yearHtml += "                        </div>`n                    </div>`n"
        }
        
        $yearHtml += "                </div>`n"
        $archiveItems += $yearHtml
    }
}

# 如果没有文章，显示示例
if ($archiveItems.Count -eq 0) {
    $archiveItems = @"
                <div class="archive-year">
                    <h3 class="archive-year-title">2026年</h3>
                    <div class="archive-month">
                        <div class="archive-month-title">3月</div>
                        <div class="archive-items">
                            <a href="posts/2026/03/05.html" class="archive-item">
                                <div class="archive-item-date">05</div>
                                <div class="archive-item-content">
                                    <div class="archive-item-title">2026年3月5日美股分析</div>
                                    <div class="archive-item-desc">今日焦点：VST 等标的深度分析</div>
                                </div>
                                <div class="archive-item-arrow">→</div>
                            </a>
                        </div>
                    </div>
                </div>
"@
}

# 读取模板并替换
$template = Get-Content $indexTemplate -Raw -Encoding UTF8
$archiveSection = $archiveItems -join ""

# 替换 ARCHIVE_ITEMS 部分
$pattern = '(\<!-- ARCHIVE_ITEMS_START --\>)[\s\S]*?(\<!-- ARCHIVE_ITEMS_END --\>)'
$replacement = "`$1$archiveSection`$2"
$newContent = $template -replace $pattern, $replacement

# 写入主页
$newContent | Set-Content $indexFile -Encoding UTF8

Write-Host "✓ 主页目录已更新!" -ForegroundColor Green
Write-Host "  找到 $($archiveItems.Count) 个年份的文章" -ForegroundColor Cyan
