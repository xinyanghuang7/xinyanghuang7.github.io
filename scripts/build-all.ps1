# 完整构建流程
# 1. 生成搜索索引
# 2. 生成站点地图  
# 3. 更新主页目录
# 4. 部署到GitHub

param(
    [switch]$Deploy,
    [switch]$SkipIndex
)

$ErrorActionPreference = "Stop"
$scriptsDir = $PSScriptRoot

Write-Host ""
Write-Host "开始构建博客..." -ForegroundColor Cyan
Write-Host ""

# 1. 生成搜索索引
if (!$SkipIndex) {
    Write-Host "步骤 1/4: 生成搜索索引..." -ForegroundColor Yellow
    & "$scriptsDir\build-search-index.ps1"
    Write-Host ""
}

# 2. 生成站点地图
Write-Host "步骤 2/4: 生成站点地图..." -ForegroundColor Yellow
& "$scriptsDir\build-sitemap.ps1"
Write-Host ""

# 3. 更新主页目录
Write-Host "步骤 3/4: 更新主页目录..." -ForegroundColor Yellow
& "$scriptsDir\update-index.ps1"
Write-Host ""

# 4. 部署（如果指定了 -Deploy 参数）
if ($Deploy) {
    Write-Host "步骤 4/4: 部署到 GitHub..." -ForegroundColor Yellow
    & "$scriptsDir\deploy.ps1"
} else {
    Write-Host "步骤 4/4: 部署已跳过（使用 -Deploy 参数进行部署）" -ForegroundColor Gray
}

Write-Host ""
Write-Host "构建完成!" -ForegroundColor Green
