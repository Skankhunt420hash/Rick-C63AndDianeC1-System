$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$ollama = Join-Path $root "runtime\ollama\ollama.exe"
$models = Join-Path $root "models\ollama"

if (-not (Test-Path -LiteralPath $models)) {
  New-Item -ItemType Directory -Path $models | Out-Null
}

$env:OLLAMA_MODELS = $models
$env:OLLAMA_HOST = "127.0.0.1:11434"
$env:RICK_C63_OLLAMA_MODEL = "qwen3-coder:30b"

powershell -ExecutionPolicy Bypass -File scripts\ensure-rick-model.ps1

$portableNode = Join-Path $root "runtime\node\node.exe"
if (-not (Test-Path -LiteralPath $portableNode) -and -not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  powershell -ExecutionPolicy Bypass -File scripts\install-node-runtime.ps1
}

Write-Host "Starting Nemesis Droidijana -63..."
Write-Host "Open: http://localhost:8787"

if (Test-Path -LiteralPath $portableNode) {
  & $portableNode server.js
} elseif (Get-Command node.exe -ErrorAction SilentlyContinue) {
  & node.exe server.js
} else {
  Write-Error "Node.js runtime missing. Run scripts\setup-laptop.ps1 first."
  exit 1
}
