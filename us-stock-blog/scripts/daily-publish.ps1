#Requires -Version 5.1
<#
.SYNOPSIS
    每日博客自动发布脚本 - 自动提取股票代码并添加投资评级

.DESCRIPTION
    1. 读取博客内容文件
    2. 自动提取股票代码
    3. 获取 TradingView + Yahoo Finance 评级
    4. 在文末添加评级汇总
    5. 推送到 GitHub Pages

.PARAMETER BlogFile
    博客内容 HTML 文件路径

.PARAMETER Symbols
    指定股票代码（可选，逗号分隔）

.PARAMETER SkipPush
    跳过 GitHub 推送（仅生成本地文件）

.EXAMPLE
    .\daily-publish.ps1 -BlogFile "content/2026-03-07.html"
    
.EXAMPLE
    .\daily-publish.ps1 -BlogFile "content/2026-03-07.html" -Symbols "AAPL,NVDA,VST"
    
.EXAMPLE
    .\daily-publish.ps1 -BlogFile "content/2026-03-07.html" -SkipPush
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$BlogFile,
    
    [Parameter(Mandatory=$false)]
    [string]$Symbols,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

# 检查依赖
Write-Info "检查依赖..."

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) {
    Write-Error "Python not found. Please install Python 3.8+."
    exit 1
}

# 检查环境变量
if (-not $env:GITHUB_TOKEN) {
    Write-Warning "GITHUB_TOKEN not set. Will skip GitHub push."
    $SkipPush = $true
}

# 获取脚本路径
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillDir = Split-Path -Parent $scriptDir

# 检查输入文件
if (-not (Test-Path $BlogFile)) {
    Write-Error "Blog file not found: $BlogFile"
    exit 1
}

Write-Info "处理博客文件: $BlogFile"

# 生成带评级的博客
$outputFile = Join-Path $skillDir "output" "$(Get-Date -Format 'yyyy-MM-dd')-blog.html"
New-Item -ItemType Directory -Force -Path (Split-Path $outputFile) | Out-Null

Write-Info "正在获取股票评级..."

$pythonArgs = @(
    "$scriptDir\generate_daily_blog.py",
    "--input", $BlogFile,
    "--output", $outputFile,
    "--title", "美股每日财经博客 | $(Get-Date -Format 'yyyy-MM-dd')"
)

if ($Symbols) {
    $pythonArgs += @("--symbols", $Symbols)
}

& $python.Source @pythonArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to generate blog with ratings"
    exit 1
}

Write-Success "博客生成完成: $outputFile"

# 推送到 GitHub
if (-not $SkipPush) {
    Write-Info "推送到 GitHub..."
    
    $deployScript = Join-Path $scriptDir "deploy.ps1"
    if (Test-Path $deployScript) {
        & $deployScript -File $outputFile
        Write-Success "发布成功!"
        Write-Info "访问地址: https://xinyanghuang7.github.io/stock-blog/"
    } else {
        Write-Warning "Deploy script not found. Skipping push."
    }
} else {
    Write-Info "Skipped GitHub push (use -SkipPush or GITHUB_TOKEN not set)"
}

Write-Info "Done!"
