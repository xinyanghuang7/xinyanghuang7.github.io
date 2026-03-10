$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$issues = New-Object System.Collections.Generic.List[string]
$htmlFiles = Get-ChildItem -Recurse -File -Include *.html | Where-Object { $_.FullName -notmatch '\\.git\\' }
$postFiles = $htmlFiles | Where-Object { $_.FullName -match '\\posts\\' }

function Add-Issue([string]$msg) {
    $issues.Add($msg)
    Write-Output "FAIL $msg"
}

Write-Output '== OpenClaw Blog QA ==' 

foreach ($file in $postFiles) {
    $content = Get-Content -Raw -Encoding UTF8 $file.FullName
    $rel = $file.FullName.Substring($root.Length + 1)

    if ($content -notmatch '<script src="\.\./\.\./\.\./js/main\.js(?:\?v=[^"'']+)?"></script>') {
        Add-Issue "$rel missing main.js include"
    }

    if ($content -match '(<section class="section"[^>]*>)(?s:.*)</body>' -and $content -notmatch 'id="progressBar"') {
        Add-Issue "$rel missing progress bar"
    }

    if ($content -match 'XXX\.XX|待填充|最新动态\.\.\.|新闻分析\.\.\.|基于调研数据') {
        Add-Issue "$rel still contains placeholder content"
    }

    $matches = [regex]::Matches($content, '(?:\.\./\.\./\.\./)?images/[^"''\) ]+')
    foreach ($m in $matches) {
        $asset = $m.Value -replace '^\.\./\.\./\.\./',''
        if (-not (Test-Path $asset)) {
            Add-Issue "$rel references missing asset $asset"
        }
    }
}

$indexPath = Join-Path $root 'index.html'
if (Test-Path $indexPath) {
    $index = Get-Content -Raw -Encoding UTF8 $indexPath
    if ($index -match '<meta name="author" content="[^"]*"\s*<meta') {
        Add-Issue 'index.html has malformed meta tag'
    }
}

if ($issues.Count -eq 0) {
    Write-Output 'PASS all checks passed'
    exit 0
}

Write-Output ("SUMMARY {0} issue(s) found" -f $issues.Count)
exit 1
