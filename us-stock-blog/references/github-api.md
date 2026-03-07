# GitHub Pages Deployment API Reference

## Prerequisites

1. Create GitHub Personal Access Token:
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `repo` (full repository access)
   - Copy the token (format: `ghp_xxx` or `github_pat_xxx`)

2. Set environment variable:
   ```powershell
   $env:GITHUB_TOKEN = "your_token_here"
   ```

## API Endpoints

### Get File SHA (for updates)

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
```

**Response:**
```json
{
  "name": "index.html",
  "sha": "abc123...",
  "path": "index.html"
}
```

### Create or Update File

```
PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}
```

**Headers:**
```
Authorization: token {GITHUB_TOKEN}
Content-Type: application/json
Accept: application/vnd.github.v3+json
```

**Request Body (New File):**
```json
{
  "message": "Create blog",
  "content": "Base64EncodedContent"
}
```

**Request Body (Update File):**
```json
{
  "message": "Update blog",
  "content": "Base64EncodedContent",
  "sha": "PreviousFileSHA"
}
```

## Complete PowerShell Deployment Script

```powershell
# Configuration
$owner = "your-username"
$repo = "your-username.github.io"
$token = $env:GITHUB_TOKEN

# Function to upload file to GitHub
function Upload-GitHubFile {
    param(
        [string]$LocalPath,
        [string]$RemotePath,
        [string]$Message
    )
    
    # Read and encode file
    $content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($LocalPath))
    
    # Check if file exists
    $uri = "https://api.github.com/repos/$owner/$repo/contents/$RemotePath"
    $sha = $null
    
    try {
        $existing = Invoke-RestMethod -Uri $uri -Headers @{
            "Accept" = "application/vnd.github.v3+json"
        }
        $sha = $existing.sha
        Write-Host "File exists, will update. SHA: $sha"
    } catch {
        Write-Host "File does not exist, will create new."
    }
    
    # Prepare payload
    $payload = @{
        message = $Message
        content = $content
    }
    
    if ($sha) {
        $payload.sha = $sha
    }
    
    $body = $payload | ConvertTo-Json -Compress
    
    # Upload
    $response = Invoke-RestMethod -Uri $uri -Method Put -Headers @{
        "Authorization" = "token $token"
        "Content-Type" = "application/json"
        "Accept" = "application/vnd.github.v3+json"
    } -Body $body
    
    Write-Host "Uploaded successfully!"
    Write-Host "Commit SHA: $($response.commit.sha)"
}

# Upload HTML
Upload-GitHubFile `
    -LocalPath "index.html" `
    -RemotePath "index.html" `
    -Message "Update blog with new content"

# Upload images
Upload-GitHubFile `
    -LocalPath "images/hero-bg.jpg" `
    -RemotePath "images/hero-bg.jpg" `
    -Message "Add hero background image"
```

## Error Handling

| Status Code | Meaning | Solution |
|------------|---------|----------|
| 401 | Unauthorized | Check token validity and permissions |
| 403 | Forbidden | Token lacks `repo` scope |
| 404 | Not Found | Repository doesn't exist or is private |
| 422 | Validation Failed | SHA mismatch for existing files |

## GitHub Pages Activation

1. Repository must be named: `{username}.github.io`
2. Go to Settings → Pages
3. Source: Deploy from a branch → Main branch
4. Wait 1-2 minutes for deployment
5. Site available at: `https://{username}.github.io`
