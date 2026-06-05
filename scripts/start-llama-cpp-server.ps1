param(
  [string]$LlamaServerPath = $env:LLAMA_SERVER_PATH,
  [string]$ModelPath = $env:RICK_C63_MODEL_PATH,
  [int]$Port = 8080,
  [int]$ContextSize = 8192,
  [int]$GpuLayers = 0
)

if (-not $LlamaServerPath) {
  $localServer = Get-ChildItem -Path (Join-Path (Get-Location) "runtime\llama-cpp") -Recurse -Filter "llama-server.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($localServer) {
    $LlamaServerPath = $localServer.FullName
  } else {
    $LlamaServerPath = "C:\llama.cpp\llama-server.exe"
  }
}

if (-not $ModelPath) {
  $localModel = Join-Path (Get-Location) "models\rick-c63-qwen2.5-coder-7b-q4_k_m.gguf"
  if (Test-Path -LiteralPath $localModel) {
    $ModelPath = $localModel
  } else {
    $ModelPath = "C:\llama.cpp\models\rick-c63.gguf"
  }
}

if (-not (Test-Path -LiteralPath $LlamaServerPath)) {
  Write-Error "llama-server.exe not found: $LlamaServerPath"
  Write-Host "Set LLAMA_SERVER_PATH to your llama-server.exe path."
  exit 1
}

if (-not (Test-Path -LiteralPath $ModelPath)) {
  Write-Error "GGUF model not found: $ModelPath"
  Write-Host "Set RICK_C63_MODEL_PATH to your .gguf model path."
  exit 1
}

$ModelPath = (Resolve-Path -LiteralPath $ModelPath).Path
$serverDir = Split-Path -Parent $LlamaServerPath

Push-Location $serverDir
& $LlamaServerPath `
  --model $ModelPath `
  --host 0.0.0.0 `
  --port $Port `
  --ctx-size $ContextSize `
  --n-gpu-layers $GpuLayers
Pop-Location
