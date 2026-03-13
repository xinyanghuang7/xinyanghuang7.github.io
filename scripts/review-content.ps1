# 启动 Blog Reviewer Agent 进行内容审核
# 使用方法: .\scripts\review-content.ps1 -ContentFile "posts/2026/03/07.html"

param(
    [Parameter(Mandatory=$true)]
    [string]$ContentFile,
    
    [string]$ReviewerAgentId = "blog-reviewer"
)

$ErrorActionPreference = "Stop"
$baseDir = Join-Path $PSScriptRoot ".."
$filePath = Join-Path $baseDir $ContentFile

if (!(Test-Path $filePath)) {
    Write-Host "错误: 文件不存在 $ContentFile" -ForegroundColor Red
    exit 1
}

$content = Get-Content $filePath -Raw -Encoding UTF8
Write-Host ""
Write-Host "🔍 启动 Reviewer Agent 审核内容..." -ForegroundColor Cyan
Write-Host "文件: $ContentFile" -ForegroundColor Gray
Write-Host ""

# 构建审核请求
$reviewRequest = @"
请审核以下美股投资博客内容。

## 审核标准:
1. **事实准确性**: 股票代码、财务数据、行业信息
2. **合规性**: 免责声明、避免收益承诺、区分事实与观点
3. **投资逻辑**: 价值投资框架、护城河分析、风险评估
4. **可读性**: 段落长度、术语解释、结构清晰度
5. **语气风格**: 客观理性、长期主义定位

## 待审核内容:

```html
$content
```

## 请输出:
1. 总体评分 (1-10)
2. 主要问题列表（位置 + 建议）
3. 优点
4. 修改优先级（必须/建议/可选）
5. 最终建议（通过/需修改/不通过）
"@

Write-Host $reviewRequest
Write-Host ""
Write-Host "请将上述内容发送给 reviewer agent 进行审核" -ForegroundColor Yellow
