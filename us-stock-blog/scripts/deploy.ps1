# Deploy blog to GitHub Pages
# Requires: GITHUB_TOKEN environment variable with 'repo' scope

param(
    [Parameter(Mandatory=$true)]
    [string]$Repo,  # format: "username.github.io"
    
    [string]$SourceDir = ".",
    [string]$ImagesDir = ".\images"
)

$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Error "GITHUB_TOKEN environment variable not set"
    Write-Host "Create token at: https://github.com/settings/tokens"
    exit 1
}

$owner = $Repo.Split('/')[0] -replace '\.github\.io$', ''
$apiBase = "https://api.github.com/repos/$owner/$Repo"

function Upload-GitHubFile {
    param(
        [string]$LocalPath,
        [string]$RemotePath,
        [string]$Message
    )
    
    Write-Host "Uploading $RemotePath..." -NoNewline
    
    # Read and encode file
    $bytes = [IO.File]::ReadAllBytes($LocalPath)
    $content = [Convert]::ToBase64String($bytes)
    
    # Get existing SHA if file exists
    $uri = "$apiBase/contents/$RemotePath"
    $sha = $null
    
    try {
        $existing = Invoke-RestMethod -Uri $uri -Headers @{
            "Accept" = "application/vnd.github.v3+json"
            "Authorization" = "token $token"
        } -ErrorAction Stop
        $sha = $existing.sha
    }
    catch {
        # File doesn't exist
    }
    
    # Prepare payload
    $payload = @{
        message = $Message
        content = $content
    }
    
    if ($sha) {
        $payload.sha = $sha
    }
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Put -Headers @{
            "Authorization" = "token $token"
            "Content-Type" = "application/json"
            "Accept" = "application/vnd.github.v3+json"
        } -Body ($payload | ConvertTo-Json -Compress) -ErrorAction Stop
        
        Write-Host " ✅" -ForegroundColor Green
        return $response.commit.sha
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Error "Failed to upload ${RemotePath}: $_"
        return $null
    }
}

Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Yellow
Write-Host "Repository: $Repo" -ForegroundColor Cyan
Write-Host ""

# Upload main HTML file
$htmlSha = Upload-GitHubFile `
    -LocalPath (Join-Path $SourceDir "index.html") `
    -RemotePath "index.html" `
    -Message "Update blog with new content - $(Get-Date -Format 'yyyy-MM-dd')"

# Upload images
if (Test-Path $ImagesDir) {
    Write-Host "`nUploading images..." -ForegroundColor Yellow
    
    Get-ChildItem $ImagesDir -File | ForEach-Object {
        Upload-GitHubFile `
            -LocalPath $_.FullName `
            -RemotePath "images/$($_.Name)" `
            -Message "Add/Update image: $($_.Name)"
    }
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your site will be available at: https://$Repo" -ForegroundColor Cyan
Write-Host "⏳ Allow 1-2 minutes for GitHub Pages to build and deploy."
