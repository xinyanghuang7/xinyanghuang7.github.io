# 完整的博客写作-审核-发布工作流
# 演示 Writer Agent 和 Reviewer Agent 的协作

param(
    [Parameter(Mandatory=$true)]
    [string]$Date,  # 格式: 2026-03-07
    
    [switch]$SkipReview,
    [switch]$AutoDeploy
)

$ErrorActionPreference = "Stop"
$baseDir = Join-Path $PSScriptRoot ".."

Write-Host ""
Write-Host "📝 博客写作-审核-发布工作流" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# ========== Phase 1: 创建文章 ==========
Write-Host "📄 Phase 1: 创建文章模板..." -ForegroundColor Yellow
$postPath = "posts/$($Date.Replace('-', '/')).html"
$fullPath = Join-Path $baseDir $postPath

if (!(Test-Path $fullPath)) {
    & "$PSScriptRoot\new-post.ps1" -Date $Date
} else {
    Write-Host "文章已存在: $postPath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✏️  请编辑文件: $postPath" -ForegroundColor Green
Write-Host "编辑完成后，按 Enter 继续..." -ForegroundColor Yellow
Read-Host

# ========== Phase 2: 内容审核 ==========
if (!$SkipReview) {
    Write-Host ""
    Write-Host "🔍 Phase 2: 内容审核..." -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    
    # 提取关键内容用于审核（去掉HTML标签便于阅读）
    $plainText = $content -replace '<[^\u003e]+>', ' ' -replace '\s+', ' '
    
    Write-Host ""
    Write-Host "📋 审核请求已准备，请将以下内容发送给 Reviewer Agent:" -ForegroundColor Cyan
    Write-Host ""
    
    @"
## 🎯 审核任务

请审核以下美股投资博客内容：

### 审核维度:
1. **事实准确性** - 股票代码、财务数据是否正确
2. **合规性** - 是否有免责声明，是否避免收益承诺
3. **投资逻辑** - 价值投资框架是否清晰，风险分析是否全面
4. **可读性** - 结构是否清晰，术语是否易懂
5. **语气风格** - 是否客观理性，符合长期主义定位

### 待审核内容:
```
标题: $Date 美股投资笔记

$($plainText.Substring(0, [Math]::Min(2000, $plainText.Length)))
... (truncated for brevity)
```

### 请输出:
- **总体评分**: X/10
- **主要问题**: 列出具体问题（位置+描述+建议）
- **优点**: 值得保留的地方
- **必须修改**: 合规性问题、事实错误
- **建议修改**: 逻辑、可读性问题
- **最终建议**: [通过/需修改/不通过]
"@ | Write-Host
    
    Write-Host ""
    Write-Host "请将审核请求发送给 reviewer agent，然后将反馈粘贴到这里..." -ForegroundColor Yellow
    Write-Host "（输入 END 结束多行输入）" -ForegroundColor Gray
    
    $feedback = @()
    do {
        $line = Read-Host
        if ($line -ne "END") { $feedback += $line }
    } while ($line -ne "END")
    
    $feedbackText = $feedback -join "`n"
    
    # 检查是否通过
    if ($feedbackText -match "最终建议.*不通过" -or $feedbackText -match "评分.*[0-5]\/10") {
        Write-Host ""
        Write-Host "❌ 审核未通过，请根据反馈修改后再提交" -ForegroundColor Red
        Write-Host "保存反馈到 memory/$Date-review.md" -ForegroundColor Gray
        
        $feedbackText | Set-Content (Join-Path $baseDir "memory/$Date-review.md") -Encoding UTF8
        exit 1
    }
    
    if ($feedbackText -match "必须修改" -or $feedbackText -match "需修改") {
        Write-Host ""
        Write-Host "⚠️  需要修改，请根据反馈调整内容" -ForegroundColor Yellow
        Write-Host "反馈已保存到 memory/$Date-review.md" -ForegroundColor Gray
        
        $feedbackText | Set-Content (Join-Path $baseDir "memory/$Date-review.md") -Encoding UTF8
        
        Write-Host ""
        $continue = Read-Host "修改完成后输入 Y 继续，N 退出"
        if ($continue -ne "Y") { exit }
    } else {
        Write-Host ""
        Write-Host "✅ 审核通过！" -ForegroundColor Green
    }
}

# ========== Phase 3: 构建和部署 ==========
Write-Host ""
Write-Host "🚀 Phase 3: 构建和部署..." -ForegroundColor Yellow

# 更新索引
& "$PSScriptRoot\update-index.ps1"

# 询问是否部署
if (!$AutoDeploy) {
    Write-Host ""
    $deploy = Read-Host "是否部署到 GitHub? (Y/N)"
    if ($deploy -eq "Y") {
        & "$PSScriptRoot\deploy.ps1"
    } else {
        Write-Host "部署已跳过" -ForegroundColor Gray
    }
} else {
    & "$PSScriptRoot\deploy.ps1"
}

Write-Host ""
Write-Host "🎉 工作流完成！" -ForegroundColor Green
Write-Host "文章: https://xinyanghuang7.github.io/$postPath" -ForegroundColor Cyan
