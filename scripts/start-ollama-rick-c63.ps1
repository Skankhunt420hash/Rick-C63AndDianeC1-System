param(
  [string]$OllamaPath = $env:OLLAMA_PATH,
  [string]$Model = $env:RICK_C63_OLLAMA_MODEL,
  [string]$ModelsDir = "models\ollama"
)

$ErrorActionPreference = "Stop"

if (-not $OllamaPath) {
  $localOllama = Join-Path (Get-Location) "runtime\ollama\ollama.exe"
  if (Test-Path -LiteralPath $localOllama) {
    $OllamaPath = $localOllama
  } else {
    $cmd = Get-Command ollama -ErrorAction SilentlyContinue
    if ($cmd) {
      $OllamaPath = $cmd.Source
    }
  }
}

if (-not $OllamaPath -or -not (Test-Path -LiteralPath $OllamaPath)) {
  Write-Error "ollama.exe not found. Run scripts\install-ollama-runtime.ps1 first."
  exit 1
}

if (-not $Model) {
  $Model = "qwen3-coder:30b"
}

$modelsFullPath = Join-Path (Get-Location) $ModelsDir
if (-not (Test-Path -LiteralPath $modelsFullPath)) {
  New-Item -ItemType Directory -Path $modelsFullPath | Out-Null
}

$env:OLLAMA_MODELS = $modelsFullPath
if (-not $env:OLLAMA_HOST) {
  $env:OLLAMA_HOST = "127.0.0.1:11434"
}

Write-Host "Starting Ollama server for Rick-C63..."
Write-Host "Runtime: $OllamaPath"
Write-Host "Models: $modelsFullPath"
Write-Host "Model: $Model"
Write-Host "API: http://127.0.0.1:11434"

$serve = Start-Process -FilePath $OllamaPath -ArgumentList "serve" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 5

try {
  & $OllamaPath pull $Model
} catch {
  Write-Warning "Primary model pull failed or was interrupted: $Model"
}

$installed = & $OllamaPath list
if ($installed -notmatch [regex]::Escape($Model)) {
  Write-Host "Installing ready-now fallback model: qwen2.5-coder:3b"
  & $OllamaPath pull "qwen2.5-coder:3b"
}

Write-Host "Rick-C63 model is installed."
Write-Host "Ollama process id: $($serve.Id)"
