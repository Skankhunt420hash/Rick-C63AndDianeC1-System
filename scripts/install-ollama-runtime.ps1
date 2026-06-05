param(
  [string]$RuntimeUrl = "https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip",
  [string]$OutputZip = "runtime\ollama.zip",
  [string]$InstallDir = "runtime\ollama"
)

$ErrorActionPreference = "Stop"

$zipFullPath = Join-Path (Get-Location) $OutputZip
$installFullPath = Join-Path (Get-Location) $InstallDir
$zipDir = Split-Path -Parent $zipFullPath

if (-not (Test-Path -LiteralPath $zipDir)) {
  New-Item -ItemType Directory -Path $zipDir | Out-Null
}

if (Test-Path -LiteralPath (Join-Path $installFullPath "ollama.exe")) {
  Write-Host "Ollama runtime already installed: $installFullPath"
  exit 0
}

Write-Host "Downloading Ollama Windows runtime..."
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

if (-not (Test-Path -LiteralPath (Join-Path $installFullPath "ollama.exe"))) {
  Write-Error "ollama.exe not found after extraction."
  exit 1
}

Write-Host "Ollama runtime installed:"
Write-Host (Join-Path $installFullPath "ollama.exe")
