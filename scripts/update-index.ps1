$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'build-search-index.ps1')
exit $LASTEXITCODE
