param(
  [Parameter(Mandatory=$true)]
  [string]$PostPath,

  [string]$Branch = "main",
  [string]$LiveBase = "https://4fire.qzz.io/",
  [string]$OutDir = "artifacts/live-publish-qa",
  [int]$LiveRetries = 6,
  [int]$RetrySeconds = 30
)

$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repo

function Say($msg) { Write-Host "== $msg ==" -ForegroundColor Cyan }
function Warn($msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "FAIL: $msg" -ForegroundColor Red; exit 1 }

function Test-Tcp($HostName, $Port) {
  try {
    $r = Test-NetConnection $HostName -Port $Port -WarningAction SilentlyContinue
    return [bool]$r.TcpTestSucceeded
  } catch { return $false }
}

function Get-TrackedPublishFiles($PostPath) {
  $files = @($PostPath, 'index.html', 'js/posts-data.js')
  if (Test-Path 'sitemap.xml') { $files += 'sitemap.xml' }
  return $files | Select-Object -Unique
}

function Get-PathStatusLines([string[]]$Paths) {
  if (!$Paths -or $Paths.Count -eq 0) { return @() }
  $output = & git status --short -- $Paths 2>$null
  if ($LASTEXITCODE -ne 0 -or !$output) { return @() }
  return @($output)
}

function Ensure-PublishCommit($PostPath) {
  $paths = Get-TrackedPublishFiles $PostPath
  $statusLines = Get-PathStatusLines $paths
  if ($statusLines.Count -eq 0) {
    Write-Host 'publish paths already committed' -ForegroundColor DarkGray
    return
  }

  Say 'Stage/commit publish payload'
  Write-Host ($statusLines -join "`n")
  & git add -- $paths
  if ($LASTEXITCODE -ne 0) { Fail 'git add failed for publish payload' }

  $remaining = Get-PathStatusLines $paths
  if ($remaining.Count -eq 0) {
    Write-Host 'nothing left to commit after staging; continuing' -ForegroundColor DarkGray
    return
  }

  $postDate = $null
  if ($PostPath -match '^posts[\/](\d{4})[\/](\d{2})[\/](\d{2})\.html$') {
    $postDate = "$($Matches[1])-$($Matches[2])-$($Matches[3])"
  }
  $message = if ($postDate) { "publish: add/update $postDate daily blog" } else { "publish: update blog payload" }
  & git commit -m $message
  if ($LASTEXITCODE -ne 0) { Fail 'git commit failed for publish payload' }
}

Say "Preflight: repo and post"
if (!(Test-Path $PostPath)) { Fail "POST_PATH not found: $PostPath" }
Ensure-PublishCommit $PostPath
$localHead = (git rev-parse HEAD).Trim()
$currentBranch = (git branch --show-current).Trim()
$headTreeCheck = & git ls-tree -r --name-only HEAD -- $PostPath
if ($LASTEXITCODE -ne 0 -or !$headTreeCheck) { Fail "HEAD does not contain $PostPath; refuse to publish" }
Write-Host "repo=$repo"
Write-Host "branch=$currentBranch head=$localHead post=$PostPath"
if ($currentBranch -ne $Branch) { Warn "current branch is $currentBranch, expected $Branch" }

Say "Local QA"
powershell -ExecutionPolicy Bypass -File "scripts\qa-site.ps1"
if ($PostPath -match 'posts/.+\.html$') {
  python scripts\validate-module4-watchlist.py $PostPath
  $postDate = $PostPath -replace '^posts[\\/](\d{4})[\\/](\d{2})[\\/](\d{2})\.html$','$1-$2-$3'
  $packetPath = Join-Path (Join-Path (Split-Path $repo -Parent) 'artifacts\daily-input') "$postDate-realtime-packet.json"
  if (Test-Path $packetPath) {
    python scripts\validate-daily-realtime-packet.py $packetPath $PostPath
  } else {
    Fail "Missing realtime input packet: $packetPath. Build it before publishing."
  }
}

Say "Network diagnosis"
$proxyHost = "127.0.0.1"
$proxyPort = 7890
$proxyOk = Test-Tcp $proxyHost $proxyPort
$githubOk = Test-Tcp "github.com" 443
Write-Host "proxy 127.0.0.1:7890 = $proxyOk"
Write-Host "github.com:443 direct = $githubOk"

$pushArgs = @()
$remoteArgs = @()
if ($githubOk) {
  Say "Push mode: bypass broken/optional git proxy"
  $pushArgs = @("-c","http.proxy=","-c","https.proxy=","push","origin",$Branch)
  $remoteArgs = @("-c","http.proxy=","-c","https.proxy=","ls-remote","origin","HEAD")
} elseif ($proxyOk) {
  Say "Push mode: configured proxy"
  $pushArgs = @("push","origin",$Branch)
  $remoteArgs = @("ls-remote","origin","HEAD")
} else {
  Fail "Neither direct GitHub 443 nor local proxy 127.0.0.1:7890 is reachable. Do not claim remote publish."
}

Say "Git push"
$pushSucceeded = $false
& git @pushArgs
if ($LASTEXITCODE -eq 0) {
  $pushSucceeded = $true
} else {
  Warn "git push failed; checking API fallback"
  $token = $env:gh_token
  if ([string]::IsNullOrWhiteSpace($token)) { $token = $env:GH_TOKEN }
  if ([string]::IsNullOrWhiteSpace($token)) { $token = $env:GITHUB_TOKEN }
  if (![string]::IsNullOrWhiteSpace($token) -and $PostPath -match '^posts[\/](\d{4})[\/](\d{2})[\/](\d{2})\.html$') {
    $postDate = "$($Matches[1])-$($Matches[2])-$($Matches[3])"
    Say "Fallback deploy via GitHub Contents API"
    python scripts/deploy.py --date $postDate --path scripts/publish-blog.ps1
    if ($LASTEXITCODE -ne 0) { Fail "git push failed and API fallback deploy failed" }
    $pushSucceeded = $true
    $remoteHead = 'api-fallback-deploy'
  } else {
    Fail "git push failed"
  }
}

if ($pushSucceeded -and !$remoteHead) {
  Say "Verify remote HEAD"
  $remoteOutput = & git @remoteArgs
  $remoteLine = $remoteOutput | Select-Object -First 1
  if (!$remoteLine) { Fail "cannot read remote HEAD" }
  $remoteHead = ($remoteLine -split "\s+")[0]
  Write-Host "localHead=$localHead"
  Write-Host "remoteHead=$remoteHead"
  if ($remoteHead -ne $localHead) { Fail "remote HEAD mismatch; GitHub has not received the intended commit" }
} elseif ($remoteHead -eq 'api-fallback-deploy') {
  Write-Host "localHead=$localHead"
  Write-Host "remoteHead=api-fallback-deploy"
}

Say "Live formal-domain QA"
$env:SITE_BASE = $LiveBase
$env:POST_PATH = $PostPath.Replace('\\','/')
$env:OUT_DIR = $OutDir
$qaOk = $false
for ($i = 1; $i -le $LiveRetries; $i++) {
  Write-Host "Live QA attempt ${i}/${LiveRetries}: $LiveBase$($env:POST_PATH)"
  & node scripts/qa-blog-post-cdp.mjs
  if ($LASTEXITCODE -eq 0) { $qaOk = $true; break }
  if ($i -lt $LiveRetries) {
    Warn "Live QA failed; likely GitHub Pages/CDN delay. Waiting $RetrySeconds seconds..."
    Start-Sleep -Seconds $RetrySeconds
  }
}

if (!$qaOk) {
  Fail "GitHub remote HEAD is updated, but formal-domain live QA still failed. Treat as GitHub Pages/CDN pending, not as content complete."
}

Say "DONE: GitHub remote and formal-domain live QA passed"
