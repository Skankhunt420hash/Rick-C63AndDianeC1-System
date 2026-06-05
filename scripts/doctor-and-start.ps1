$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$log = Join-Path $root "data\doctor-start.log"

try {
  powershell -ExecutionPolicy Bypass -File scripts\self-healing-doctor.ps1 *>> $log

  $portableNode = Join-Path $root "runtime\node\node.exe"
  $node = if (Test-Path -LiteralPath $portableNode) { $portableNode } else { (Get-Command node.exe).Source }
  $env:OLLAMA_MODELS = Join-Path $root "models\ollama"
  $env:RICK_C63_OLLAMA_MODEL = "qwen3-coder:30b"

  try {
    Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/health" -UseBasicParsing -TimeoutSec 2 | Out-Null
  } catch {
    Start-Process -FilePath $node -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden | Out-Null
  }

  for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
    try {
      Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/health" -UseBasicParsing -TimeoutSec 2 | Out-Null
      Start-Process "http://localhost:8787"
      exit 0
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  throw "Erleuchtung backend did not become ready."
} catch {
  $_ | Out-String | Add-Content -LiteralPath $log
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("Erleuchtung could not start. Open data\doctor-start.log for details.", "Erleuchtung Self-Healing Doctor") | Out-Null
  exit 1
}
