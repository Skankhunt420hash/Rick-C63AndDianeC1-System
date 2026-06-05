param(
  [string]$Model = "qwen3-coder:30b"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ollama = Join-Path $root "runtime\ollama\ollama.exe"
$models = Join-Path $root "models\ollama"

if (-not (Test-Path -LiteralPath $ollama)) {
  powershell -ExecutionPolicy Bypass -File scripts\install-ollama-runtime.ps1
}

New-Item -ItemType Directory -Path $models -Force | Out-Null
$env:OLLAMA_MODELS = $models
$env:OLLAMA_HOST = "127.0.0.1:11434"

try {
  Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -UseBasicParsing -TimeoutSec 2 | Out-Null
} catch {
  Start-Process -FilePath $ollama -ArgumentList "serve" -WorkingDirectory $root -WindowStyle Hidden | Out-Null
  Start-Sleep -Seconds 4
}

$installed = ((Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 10).models | ForEach-Object { $_.name })
if ($installed -notcontains $Model) {
  Write-Host "Rick-C63 local model is missing. Downloading $Model..."
  Write-Host "This download is approximately 18GB and runs only when the model is not installed."
  & $ollama pull $Model
}

$installed = ((Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 10).models | ForEach-Object { $_.name })
if ($installed -notcontains $Model) {
  throw "Rick-C63 model installation did not finish: $Model"
}
Write-Host "Rick-C63 model ready: $Model"
