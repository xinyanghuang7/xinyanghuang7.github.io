<#
.SYNOPSIS
Pushes to GitHub while bypassing the user's flaky global Git HTTP proxy.

WHY
The user-level Git config may contain http.proxy / https.proxy = http://127.0.0.1:7890.
That local proxy has caused intermittent schannel TLS handshake failures for GitHub.
Use this repo helper for GitHub push/reachability checks instead of changing global config.
#>
param(
    [string]$Remote = 'origin',
    [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'

git -c http.proxy= -c https.proxy= push $Remote $Branch
exit $LASTEXITCODE
