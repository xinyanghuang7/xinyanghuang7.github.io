#Requires -Version 5.1
<#
.SYNOPSIS
    Get stock trading ratings for US stocks.

.DESCRIPTION
    Fetches technical indicators from TradingView and analyst ratings from Yahoo Finance,
    then generates a composite rating (Strong Buy/Buy/Neutral/Sell/Strong Sell).

.PARAMETER Symbol
    Stock symbol (e.g., AAPL, VST, NVDA)

.PARAMETER Exchange
    Stock exchange (default: NASDAQ). Options: NASDAQ, NYSE, AMEX

.PARAMETER OutputFormat
    Output format: json, html, or summary (default: summary)

.EXAMPLE
    .\get-rating.ps1 -Symbol "AAPL"
    
.EXAMPLE
    .\get-rating.ps1 -Symbol "VST" -Exchange "NYSE" -OutputFormat html
    
.EXAMPLE
    .\get-rating.ps1 -Symbol "NVDA" -OutputFormat json | ConvertFrom-Json
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Symbol,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("NASDAQ", "NYSE", "AMEX")]
    [string]$Exchange = "NASDAQ",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("summary", "json", "html")]
    [string]$OutputFormat = "summary"
)

$ErrorActionPreference = "Stop"

# Check Python availability
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $python) {
    Write-Error "Python not found. Please install Python 3.8 or later."
    exit 1
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ratingScript = Join-Path $scriptDir "get_stock_ratings.py"

if (-not (Test-Path $ratingScript)) {
    Write-Error "Rating script not found: $ratingScript"
    exit 1
}

Write-Host "🔍 Fetching rating for $Symbol on $Exchange..." -ForegroundColor Cyan

# Run Python script
try {
    $output = & $python.Source $ratingScript $Symbol $Exchange 2>&1
    
    # Check for errors in output
    $errorLines = $output | Where-Object { $_ -match "^❌|^Error" }
    if ($errorLines) {
        Write-Host "⚠️  Warnings/Errors encountered:" -ForegroundColor Yellow
        $errorLines | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    }
    
    # Extract the requested format
    switch ($OutputFormat) {
        "json" {
            # Find JSON section
            $jsonStart = $output.IndexOf("{")
            $jsonEnd = $output.LastIndexOf("}")
            if ($jsonStart -ge 0 -and $jsonEnd -gt $jsonStart) {
                $jsonContent = $output[$jsonStart..$jsonEnd] -join "`n"
                Write-Output $jsonContent
            } else {
                Write-Error "Could not extract JSON from output"
            }
        }
        "html" {
            # Find HTML section
            $inHtml = $false
            $htmlLines = @()
            foreach ($line in $output) {
                if ($line -match "HTML 输出") {
                    $inHtml = $true
                    continue
                }
                if ($inHtml -and $line -match "^=+$") {
                    continue
                }
                if ($inHtml -and $line -match "^<div class='stock-rating'") {
                    $htmlLines += $line
                }
                elseif ($inHtml -and $htmlLines.Count -gt 0) {
                    $htmlLines += $line
                }
            }
            Write-Output ($htmlLines -join "`n")
        }
        default {
            # Summary format - just show the nice console output
            $output | ForEach-Object { Write-Host $_ }
        }
    }
}
catch {
    Write-Error "Failed to run rating script: $_"
    exit 1
}
