param(
  [string]$Version = "22.17.0",
  [string]$RuntimeDir = "runtime\node"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$installDir = Join-Path $root $RuntimeDir
$nodeExe = Join-Path $installDir "node.exe"
$zipPath = Join-Path $root "runtime\node.zip"
$extractDir = Join-Path $root "runtime\node-extract"
$url = "https://nodejs.org/dist/v$Version/node-v$Version-win-x64.zip"

if (Test-Path -LiteralPath $nodeExe) {
  Write-Host "Portable Node.js already installed: $nodeExe"
  exit 0
}

New-Item -ItemType Directory -Path (Join-Path $root "runtime") -Force | Out-Null
Write-Host "Downloading portable Node.js v$Version..."
if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
  & curl.exe -L --fail --ssl-no-revoke --continue-at - --output $zipPath $url
} else {
  Invoke-WebRequest -Uri $url -OutFile $zipPath
}

if (Test-Path -LiteralPath $extractDir) {
  Remove-Item -LiteralPath $extractDir -Recurse -Force
}
if (Test-Path -LiteralPath $installDir) {
  Remove-Item -LiteralPath $installDir -Recurse -Force
}

New-Item -ItemType Directory -Path $extractDir | Out-Null
Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force
$expanded = Get-ChildItem -LiteralPath $extractDir -Directory | Select-Object -First 1
if (-not $expanded) {
  throw "Portable Node.js archive did not contain an extracted directory."
}
Move-Item -LiteralPath $expanded.FullName -Destination $installDir
Remove-Item -LiteralPath $extractDir -Recurse -Force

if (-not (Test-Path -LiteralPath $nodeExe)) {
  throw "node.exe was not found after portable Node.js installation."
}
Write-Host "Portable Node.js installed: $nodeExe"
