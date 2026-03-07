# Generate 3 images for the blog using ModelScope API
# Requires: MODELSCOPE_TOKEN environment variable

param(
    [string]$OutputDir = ".\images"
)

$token = $env:MODELSCOPE_TOKEN
if (-not $token) {
    Write-Error "MODELSCOPE_TOKEN environment variable not set"
    exit 1
}

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$prompts = @(
    @{
        Name = "hero-bg.jpg"
        Prompt = "Professional financial investment concept, Wall Street atmosphere, golden bull statue silhouette against dark navy blue background, abstract stock market chart lines flowing upward, luxury gold and deep blue color scheme, cinematic lighting, sophisticated, editorial magazine style"
    },
    @{
        Name = "value-investing.jpg"
        Prompt = "Value investing concept art, vintage leather-bound investment ledger with gold pen, golden calculator, stock certificates scattered artistically, warm golden hour lighting, dark wood desk surface, sophisticated financial aesthetic, rich textures, professional photography style"
    },
    @{
        Name = "tech-analysis.jpg"
        Prompt = "Modern tech stock analysis visualization, holographic data charts floating in dark space, AI chip circuit patterns, futuristic blue and gold neon accents, digital growth graphs ascending, sleek professional design, dark background with glowing elements"
    }
)

$tasks = @()

# Submit all tasks
foreach ($p in $prompts) {
    Write-Host "Submitting task for $($p.Name)..." -ForegroundColor Yellow
    
    $body = @{
        model = "Qwen/Qwen-Image"
        prompt = $p.Prompt
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod `
            -Uri "https://api-inference.modelscope.cn/v1/images/generations" `
            -Method Post `
            -Headers @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
                "X-ModelScope-Async-Mode" = "true"
            } `
            -Body $body
        
        $tasks += @{
            TaskId = $response.task_id
            Name = $p.Name
            Status = "SUBMITTED"
        }
        
        Write-Host "  Task ID: $($response.task_id)" -ForegroundColor Cyan
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Error "Failed to submit task for $($p.Name): $_"
    }
}

# Poll all tasks
Write-Host "`nWaiting for all images to generate..." -ForegroundColor Yellow

$completed = 0
while ($completed -lt $tasks.Count) {
    $completed = 0
    
    foreach ($task in $tasks) {
        if ($task.Status -eq "DOWNLOADED" -or $task.Status -eq "FAILED") {
            $completed++
            continue
        }
        
        try {
            $result = Invoke-RestMethod `
                -Uri "https://api-inference.modelscope.cn/v1/tasks/$($task.TaskId)" `
                -Headers @{
                    "X-ModelScope-Task-Type" = "image_generation"
                    "Authorization" = "Bearer $token"
                }
            
            $task.Status = $result.task_status
            
            if ($result.task_status -eq "SUCCEED" -and $result.output_images) {
                $url = $result.output_images[0]
                $outputPath = Join-Path $OutputDir $task.Name
                
                Invoke-WebRequest -Uri $url -OutFile $outputPath
                $size = (Get-Item $outputPath).Length
                
                Write-Host "✅ $($task.Name) downloaded ($([math]::Round($size/1KB,2)) KB)" -ForegroundColor Green
                $task.Status = "DOWNLOADED"
            }
            elseif ($result.task_status -eq "FAILED") {
                Write-Host "❌ $($task.Name) failed" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "⚠️ Error checking $($task.Name): $_" -ForegroundColor Yellow
        }
    }
    
    if ($completed -lt $tasks.Count) {
        Write-Host "Progress: $completed/$($tasks.Count) complete..."
        Start-Sleep -Seconds 5
    }
}

Write-Host "`n✅ All tasks complete!" -ForegroundColor Green
Get-ChildItem $OutputDir | Select-Object Name, @{N="SizeKB";E={[math]::Round($_.Length/1KB,2)}}
