# ModelScope Image Generation API Reference

## API Endpoints

### Submit Generation Task

```
POST https://api-inference.modelscope.cn/v1/images/generations
```

**Headers:**
```
Authorization: Bearer {MODELSCOPE_TOKEN}
Content-Type: application/json
X-ModelScope-Async-Mode: true
```

**Request Body:**
```json
{
  "model": "Qwen/Qwen-Image",
  "prompt": "Your image description here"
}
```

**Response:**
```json
{
  "task_id": 1234567
}
```

### Poll Task Status

```
GET https://api-inference.modelscope.cn/v1/tasks/{task_id}
```

**Headers:**
```
X-ModelScope-Task-Type: image_generation
Authorization: Bearer {MODELSCOPE_TOKEN}
```

**Response (Success):**
```json
{
  "task_id": 1234567,
  "task_status": "SUCCEED",
  "output_images": [
    "https://muse-ai.oss-cn-hangzhou.aliyuncs.com/img/xxx.png"
  ]
}
```

**Response (Processing):**
```json
{
  "task_id": 1234567,
  "task_status": "PROCESSING"
}
```

**Response (Failed):**
```json
{
  "task_id": 1234567,
  "task_status": "FAILED"
}
```

## Complete PowerShell Example

```powershell
$token = $env:MODELSCOPE_TOKEN

# 1. Submit task
$body = @{
    model = "Qwen/Qwen-Image"
    prompt = "Your prompt here"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "https://api-inference.modelscope.cn/v1/images/generations" `
    -Method Post `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
        "X-ModelScope-Async-Mode" = "true"
    } `
    -Body $body

$taskId = $response.task_id
Write-Host "Task submitted: $taskId"

# 2. Poll until complete
while ($true) {
    $result = Invoke-RestMethod `
        -Uri "https://api-inference.modelscope.cn/v1/tasks/$taskId" `
        -Headers @{
            "X-ModelScope-Task-Type" = "image_generation"
            "Authorization" = "Bearer $token"
        }
    
    if ($result.task_status -eq "SUCCEED") {
        $imageUrl = $result.output_images[0]
        Invoke-WebRequest -Uri $imageUrl -OutFile "output.jpg"
        Write-Host "Image downloaded!"
        break
    }
    
    if ($result.task_status -eq "FAILED") {
        Write-Host "Generation failed"
        break
    }
    
    Start-Sleep -Seconds 5
}
```

## Rate Limits

- Minimum 20 seconds between submissions
- Tasks typically complete in 2-5 minutes
- Some tasks may timeout and need retry

## Recommended Prompts for Finance Blog

1. **Hero Background**:
   ```
   Professional financial investment concept, Wall Street atmosphere, 
   golden bull statue silhouette against dark navy blue background, 
   abstract stock market chart lines flowing upward, 
   luxury gold and deep blue color scheme, cinematic lighting
   ```

2. **Value Investing**:
   ```
   Value investing concept art, vintage leather-bound investment ledger 
   with gold pen, golden calculator, stock certificates scattered artistically, 
   warm golden hour lighting, dark wood desk surface, 
   sophisticated financial aesthetic, rich textures
   ```

3. **Tech Analysis**:
   ```
   Modern tech stock analysis visualization, holographic data charts 
   floating in dark space, AI chip circuit patterns, 
   futuristic blue and gold neon accents, digital growth graphs ascending, 
   sleek professional design, dark background with glowing elements
   ```
