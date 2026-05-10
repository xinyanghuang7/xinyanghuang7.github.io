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

Say "Preflight: repo and post"
if (!(Test-Path $PostPath)) { Fail "POST_PATH not found: $PostPath" }
$localHead = (git rev-parse HEAD).Trim()
$currentBranch = (git branch --show-current).Trim()
Write-Host "repo=$repo"
Write-Host "branch=$currentBranch head=$localHead post=$PostPath"
if ($currentBranch -ne $Branch) { Warn "current branch is $currentBranch, expected $Branch" }

Say "Local QA"
powershell -ExecutionPolicy Bypass -File "scripts\qa-site.ps1"

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
& git @pushArgs
if ($LASTEXITCODE -ne 0) { Fail "git push failed" }

Say "Verify remote HEAD"
$remoteOutput = & git @remoteArgs
$remoteLine = $remoteOutput | Select-Object -First 1
if (!$remoteLine) { Fail "cannot read remote HEAD" }
$remoteHead = ($remoteLine -split "\s+")[0]
Write-Host "localHead=$localHead"
Write-Host "remoteHead=$remoteHead"
if ($remoteHead -ne $localHead) { Fail "remote HEAD mismatch; GitHub has not received the intended commit" }

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
