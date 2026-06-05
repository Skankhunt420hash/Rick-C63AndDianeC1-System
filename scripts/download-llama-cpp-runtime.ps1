param(
  [string]$ReleaseTag = "b9382",
  [string]$RuntimeUrl = "https://github.com/ggml-org/llama.cpp/releases/download/b9382/llama-b9382-bin-win-cpu-x64.zip",
  [string]$OutputZip = "runtime\llama-cpp.zip",
  [string]$InstallDir = "runtime\llama-cpp"
)

$ErrorActionPreference = "Stop"

$zipFullPath = Join-Path (Get-Location) $OutputZip
$installFullPath = Join-Path (Get-Location) $InstallDir
$zipDir = Split-Path -Parent $zipFullPath

if (-not (Test-Path -LiteralPath $zipDir)) {
  New-Item -ItemType Directory -Path $zipDir | Out-Null
}

if (Test-Path -LiteralPath (Join-Path $installFullPath "llama-server.exe")) {
  Write-Host "llama.cpp runtime already installed: $installFullPath"
  exit 0
}

Write-Host "Downloading llama.cpp runtime $ReleaseTag..."
Write-Host "Source: $RuntimeUrl"
Write-Host "Target: $zipFullPath"

if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
  & curl.exe -L --fail --ssl-no-revoke --continue-at - --output $zipFullPath $RuntimeUrl
} else {
  Invoke-WebRequest -Uri $RuntimeUrl -OutFile $zipFullPath
}

if (Test-Path -LiteralPath $installFullPath) {
  Remove-Item -LiteralPath $installFullPath -Recurse -Force
}

New-Item -ItemType Directory -Path $installFullPath | Out-Null
Expand-Archive -Path $zipFullPath -DestinationPath $installFullPath -Force

$server = Get-ChildItem -Path $installFullPath -Recurse -Filter "llama-server.exe" | Select-Object -First 1
if (-not $server) {
  Write-Error "llama-server.exe not found after extracting runtime."
  exit 1
}

Write-Host "llama.cpp runtime installed:"
Write-Host $server.FullName
