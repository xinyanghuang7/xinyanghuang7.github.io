# 完整的博客写作-审核-发布工作流
# 当前版本对齐现有仓库：同步首页/搜索、跑 QA、调用 deploy.py、默认使用 4fire.qzz.io

param(
    [Parameter(Mandatory=$true)]
    [string]$Date,

    [switch]$SkipReview,
    [switch]$AutoDeploy
)

$ErrorActionPreference = "Stop"
$baseDir = Join-Path $PSScriptRoot ".."

Write-Host ""
Write-Host "📝 博客写作-审核-发布工作流" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$postPath = "posts/$($Date.Replace('-', '/')).html"
$fullPath = Join-Path $baseDir $postPath

Write-Host "📄 Phase 1: 准备文章文件..." -ForegroundColor Yellow
if (!(Test-Path $fullPath)) {
    & "$PSScriptRoot\new-post.ps1" -Date $Date
} else {
    Write-Host "文章已存在: $postPath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✏️  请编辑文件: $postPath" -ForegroundColor Green
Write-Host "在继续前，默认先完成：upstream truth 刷新 → draft。尤其是 candidate-pool / daily-stock-picks / ticker files / real-time-thesis-monitor（当 Module 3 需要最新驱动排序时）。" -ForegroundColor DarkGray
Write-Host "编辑完成后，按 Enter 继续..." -ForegroundColor Yellow
Read-Host

if (!$SkipReview) {
    Write-Host ""
    Write-Host "🔍 Phase 2: 内容审核..." -ForegroundColor Yellow
    & "$PSScriptRoot\review-content.ps1" -ContentFile $postPath
    Write-Host ""
    Write-Host "默认 reviewer 链路：blog-reviewer → blog-semantic-reviewer → shared frontend close。请完成这条链后再继续。" -ForegroundColor DarkGray
    Write-Host "请完成 reviewer 审核与必要修改后，按 Enter 继续..." -ForegroundColor Yellow
    Read-Host
}

Write-Host ""
Write-Host "🧱 Phase 3: 同步首页目录与搜索数据..." -ForegroundColor Yellow
& "$PSScriptRoot\build-search-index.ps1"

Write-Host ""
Write-Host "🗺️  Phase 4: 生成站点地图..." -ForegroundColor Yellow
& "$PSScriptRoot\build-sitemap.ps1"

Write-Host ""
Write-Host "🧪 Phase 5: 本地 QA..." -ForegroundColor Yellow
& "$PSScriptRoot\qa-site.ps1"

Write-Host ""
Write-Host "🧠 Phase 6: 共享大脑回写校验..." -ForegroundColor Yellow
python "$baseDir\..\scripts\investing\validate_blog_backprop_diff.py" --base-ref HEAD

if ($AutoDeploy) {
    Write-Host ""
    Write-Host "🚀 Phase 7: 部署到 GitHub..." -ForegroundColor Yellow
    python "$PSScriptRoot\deploy.py" --date $Date
    Write-Host ""
    Write-Host "✅ 部署命令完成。请继续验证 GitHub 远端、https://4fire.qzz.io/ 页面内容与实际浏览器渲染，再宣布成功。" -ForegroundColor Green
    Write-Host "文章: https://4fire.qzz.io/$postPath" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✅ 本地流程完成，部署已跳过" -ForegroundColor Green
    Write-Host "如需部署：python scripts/deploy.py --date $Date" -ForegroundColor Cyan
}
