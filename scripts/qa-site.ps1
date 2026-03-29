$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$issues = New-Object System.Collections.Generic.List[string]
$htmlFiles = Get-ChildItem -Recurse -File -Include *.html | Where-Object { $_.FullName -notmatch '\\.git\\' }
$postFiles = $htmlFiles | Where-Object { $_.FullName -match '\\posts\\' }
$indexPath = Join-Path $root 'index.html'
$mainJsPath = Join-Path $root 'js\main.js'
$postsDataPath = Join-Path $root 'js\posts-data.js'
$newPostPath = Join-Path $root 'scripts\new-post.ps1'
$postTemplatePath = Join-Path $root 'template\post-template.html'
$optionsIndexPath = Join-Path $root 'options\index.html'
$courseManifestPath = Join-Path $root 'options\course-manifest.json'
$coursePublicPlaceholderPattern = '\{\{[^}]+\}\}|XXX\.XX|待填充|最新动态\.\.\.|新闻分析\.\.\.|基于调研数据|TODO|TBD'
$encodingRiskPattern = '�|锟|锟斤拷|骞|鏈|鏃|鍒|浠|璇|銆|鈥|�\?|\?{2,}'

function Add-Issue([string]$msg) {
    $issues.Add($msg)
    Write-Output "FAIL $msg"
}

function Test-ContentEncodingRisk([string]$content, [string]$rel) {
    $replacementChar = [string][char]0xFFFD

    if ($content.Contains($replacementChar)) {
        Add-Issue "$rel contains Unicode replacement character (�)"
    }

    $titleMatch = [regex]::Match($content, '<title>(.*?)</title>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($titleMatch.Success) {
        $titleText = $titleMatch.Groups[1].Value
        if ($titleText.Contains($replacementChar) -or $titleText -match '\?{2,}') {
            Add-Issue "$rel title appears garbled / question-polluted"
        }
    }

    foreach ($prop in @('description','og:title','og:description','twitter:title','twitter:description')) {
        $pattern = if ($prop -eq 'description') {
            '<meta\s+name="description"\s+content="([^"]*)"'
        } else {
            '<meta\s+property="' + [regex]::Escape($prop) + '"\s+content="([^"]*)"'
        }
        $match = [regex]::Match($content, $pattern)
        if ($match.Success) {
            $fieldText = $match.Groups[1].Value
            if ($fieldText.Contains($replacementChar) -or $fieldText -match '\?{2,}') {
                Add-Issue "$rel meta field $prop appears garbled / question-polluted"
            }
        }
    }
}

function Test-CoursePage([string]$path, [string]$canonicalPath, [string]$scriptPattern, [string]$stylesheetPattern) {
    if (-not (Test-Path $path)) {
        $relMissing = $path.Substring($root.Length + 1)
        Add-Issue "$relMissing missing"
        return $null
    }

    $content = Get-Content -Raw -Encoding UTF8 $path
    $rel = $path.Substring($root.Length + 1)

    if ($content -notmatch $stylesheetPattern) {
        Add-Issue "$rel missing expected stylesheet reference"
    }

    if ($content -notmatch $scriptPattern) {
        Add-Issue "$rel missing expected main.js include"
    }

    if ($content -notmatch ('<link rel="canonical" href="https://4fire\.qzz\.io/' + [regex]::Escape($canonicalPath) + '"')) {
        Add-Issue "$rel missing canonical on https://4fire.qzz.io/$canonicalPath"
    }

    if ($content -notmatch ('<meta\s+property="og:url"\s+content="https://4fire\.qzz\.io/' + [regex]::Escape($canonicalPath) + '"')) {
        Add-Issue "$rel missing og:url on https://4fire.qzz.io/$canonicalPath"
    }

    if ($content -match $coursePublicPlaceholderPattern) {
        Add-Issue "$rel still contains placeholder content"
    }

    if ($content -match 'xinyanghuang7\.github\.io') {
        Add-Issue "$rel still contains legacy xinyanghuang7.github.io domain"
    }

    Test-ContentEncodingRisk -content $content -rel $rel

    return $content
}

Write-Output '== OpenClaw Blog QA =='

foreach ($file in $postFiles) {
    $content = Get-Content -Raw -Encoding UTF8 $file.FullName
    $rel = $file.FullName.Substring($root.Length + 1)

    Test-ContentEncodingRisk -content $content -rel $rel

    if ($content -notmatch '<script src="\.\./\.\./\.\./js/main\.js(?:\?v=[^"'']+)?"></script>') {
        Add-Issue "$rel missing main.js include"
    }

    if ($content -notmatch 'id="progressBar"') {
        Add-Issue "$rel missing progress bar"
    }

    if ($content -match 'XXX\.XX|待填充|最新动态\.\.\.|新闻分析\.\.\.|基于调研数据') {
        Add-Issue "$rel still contains placeholder content"
    }

    if ($content -match 'xinyanghuang7\.github\.io') {
        Add-Issue "$rel still contains legacy xinyanghuang7.github.io domain"
    }

    foreach ($prop in @('og:url', 'og:title', 'og:description')) {
        $pattern = '<meta\s+property="' + [regex]::Escape($prop) + '"'
        $count = ([regex]::Matches($content, $pattern)).Count
        if ($count -gt 1) {
            Add-Issue "$rel has duplicate $prop meta tags"
        }
    }

    if ($content -notmatch '<link rel="canonical" href="https://4fire\.qzz\.io/posts/') {
        Add-Issue "$rel missing canonical on 4fire.qzz.io"
    }

    $dateMatch = [regex]::Match($rel, 'posts\\(?<year>\d{4})\\(?<month>\d{2})\\(?<day>\d{2})\.html$')
    $enforceEnhancedSeo = $false
    if ($dateMatch.Success) {
        $dateIso = "{0}-{1}-{2}" -f $dateMatch.Groups['year'].Value, $dateMatch.Groups['month'].Value, $dateMatch.Groups['day'].Value
        if ([datetime]::ParseExact($dateIso, 'yyyy-MM-dd', $null) -ge [datetime]'2026-03-26') {
            $enforceEnhancedSeo = $true
        }
    }

    if ($enforceEnhancedSeo -and ($content -notmatch '<meta\s+name="keywords"\s+content="[^"]+"')) {
        Add-Issue "$rel missing meta keywords"
    }

    if ($enforceEnhancedSeo -and ($content -notmatch '<meta\s+property="og:image"\s+content="https://4fire\.qzz\.io/[^"]+"')) {
        Add-Issue "$rel missing absolute production og:image"
    }

    if ($enforceEnhancedSeo -and ($content -notmatch '<meta\s+name="twitter:image"\s+content="https://4fire\.qzz\.io/[^"]+"')) {
        Add-Issue "$rel missing absolute production twitter:image"
    }

    if ($enforceEnhancedSeo -and $dateMatch.Success) {
        $datedOgAsset = "images/posts/$dateIso-value.jpg"
        if ((Test-Path $datedOgAsset) -and ($content -match 'https://4fire\.qzz\.io/images/hero-bg\.jpg')) {
            Add-Issue "$rel still uses generic hero og:image even though $datedOgAsset exists"
        }
    }

    $matches = [regex]::Matches($content, '(?:\.\./\.\./\.\./)?images/[^"''\) ]+')
    foreach ($m in $matches) {
        $asset = $m.Value -replace '^\.\./\.\./\.\./',''
        if (-not (Test-Path $asset)) {
            Add-Issue "$rel references missing asset $asset"
        }
    }
}

if (Test-Path $indexPath) {
    $index = Get-Content -Raw -Encoding UTF8 $indexPath

    Test-ContentEncodingRisk -content $index -rel 'index.html'

    if ($index -match '<meta name="author" content="[^"]*"\s*<meta') {
        Add-Issue 'index.html has malformed meta tag'
    }

    if ($index -match 'xinyanghuang7\.github\.io') {
        Add-Issue 'index.html still contains legacy xinyanghuang7.github.io domain'
    }

    if ($index -notmatch '<script src="js/posts-data\.js(?:\?v=[^"'']+)?"></script>') {
        Add-Issue 'index.html missing js/posts-data.js include'
    }

    if ($index -notmatch '<!-- ARCHIVE_ITEMS_START -->' -or $index -notmatch '<!-- ARCHIVE_ITEMS_END -->') {
        Add-Issue 'index.html missing archive sync markers'
    }
}

if (Test-Path $courseManifestPath) {
    $courseManifest = Get-Content -Raw -Encoding UTF8 $courseManifestPath | ConvertFrom-Json
    $courseIndex = Test-CoursePage -path $optionsIndexPath -canonicalPath 'options/' -scriptPattern '<script src="\.\./js/main\.js(?:\?v=[^"'']+)?"></script>' -stylesheetPattern '<link rel="stylesheet" href="\.\./css/style\.css(?:\?v=[^"'']+)?">'
    $publishedChapters = @($courseManifest | Where-Object { $_.status -eq 'published' } | Sort-Object { [int]$_.id })
    $expectedPublishedFiles = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    $chapterContents = @{}

    foreach ($chapter in $publishedChapters) {
        $chapterPath = Join-Path $root $chapter.output_path
        $null = $expectedPublishedFiles.Add(([System.IO.Path]::GetFileName($chapter.output_path)))
        $chapterContents[$chapter.id] = Test-CoursePage -path $chapterPath -canonicalPath ($chapter.output_path -replace '\\','/') -scriptPattern '<script src="\.\./js/main\.js(?:\?v=[^"'']+)?"></script>' -stylesheetPattern '<link rel="stylesheet" href="\.\./css/style\.css(?:\?v=[^"'']+)?">'
    }

    foreach ($generatedChapterFile in Get-ChildItem (Join-Path $root 'options') -File -Filter '*.html' | Where-Object { $_.Name -ne 'index.html' }) {
        if (-not $expectedPublishedFiles.Contains($generatedChapterFile.Name)) {
            Add-Issue "options/$($generatedChapterFile.Name) exists but is not a currently published chapter in course-manifest.json"
        }
    }

    for ($i = 0; $i -lt $publishedChapters.Count; $i++) {
        $chapter = $publishedChapters[$i]
        $content = $chapterContents[$chapter.id]
        if (-not $content) { continue }

        $expectedPrevHref = if ($i -eq 0) { './index.html' } else { './' + [System.IO.Path]::GetFileName($publishedChapters[$i - 1].output_path) }
        $expectedNextHref = if ($i -eq $publishedChapters.Count - 1) { './index.html' } else { './' + [System.IO.Path]::GetFileName($publishedChapters[$i + 1].output_path) }

        if ($content -notmatch ('href="' + [regex]::Escape($expectedPrevHref) + '"')) {
            Add-Issue "options/$([System.IO.Path]::GetFileName($chapter.output_path)) missing expected previous-nav target $expectedPrevHref"
        }
        if ($content -notmatch ('href="' + [regex]::Escape($expectedNextHref) + '"')) {
            Add-Issue "options/$([System.IO.Path]::GetFileName($chapter.output_path)) missing expected next-nav target $expectedNextHref"
        }
    }

    $futureChapters = @($courseManifest | Where-Object { $_.status -in @('syncing', 'coming-soon') })
    foreach ($htmlToCheck in @(@{ Path = $indexPath; Content = $index }, @{ Path = $optionsIndexPath; Content = $courseIndex })) {
        if (-not $htmlToCheck.Content) { continue }

        $relHtml = $htmlToCheck.Path.Substring($root.Length + 1)
        foreach ($futureChapter in $futureChapters) {
            $repoRelativePath = ($futureChapter.output_path -replace '\\','/').TrimStart('./')
            $pageRelativePath = if ($relHtml -eq 'options\index.html') {
                './' + [System.IO.Path]::GetFileName($repoRelativePath)
            } else {
                $repoRelativePath
            }

            foreach ($hrefCandidate in @($repoRelativePath, $pageRelativePath, ($pageRelativePath -replace '^\./',''))) {
                $escapedFuturePath = [regex]::Escape($hrefCandidate)
                if ([regex]::IsMatch($htmlToCheck.Content, '<a\b[^>]*href="' + $escapedFuturePath + '"')) {
                    Add-Issue "$relHtml links to future chapter $repoRelativePath before publish"
                    break
                }
            }
        }
    }
} else {
    Add-Issue 'options/course-manifest.json missing'
}

if (-not (Test-Path $postsDataPath)) {
    Add-Issue 'js/posts-data.js missing'
}

if (-not (Test-Path $newPostPath)) {
    Add-Issue 'scripts/new-post.ps1 missing'
}

if (-not (Test-Path $postTemplatePath)) {
    Add-Issue 'template/post-template.html missing'
}

if (Test-Path $mainJsPath) {
    $mainJs = Get-Content -Raw -Encoding UTF8 $mainJsPath
    if ($mainJs -match 'const articles = \[') {
        Add-Issue 'js/main.js still hardcodes article database instead of using js/posts-data.js'
    }
}

if ($issues.Count -eq 0) {
    Write-Output 'PASS all checks passed'
    exit 0
}

Write-Output ("SUMMARY {0} issue(s) found" -f $issues.Count)
exit 1
