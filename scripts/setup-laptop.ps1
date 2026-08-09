$ErrorActionPreference = "Stop"

Write-Host "Erleuchtung laptop setup"
Write-Host "Installing portable Node.js runtime..."
powershell -ExecutionPolicy Bypass -File scripts\install-node-runtime.ps1

Write-Host "Installing local Ollama runtime..."

powershell -ExecutionPolicy Bypass -File scripts\install-ollama-runtime.ps1

Write-Host ""
Write-Host "Starting Ollama and downloading Rick-C63 qwen3-coder:30b..."
Write-Host "The model download is large and can take a long time."

powershell -ExecutionPolicy Bypass -File scripts\ensure-rick-model.ps1

Write-Host ""
Write-Host "Setup finished. Start the app with:"
Write-Host "powershell -ExecutionPolicy Bypass -File scripts\start-erleuchtung.ps1"
Write-Host "Optional: set PORT before start if you do not want the default 8787."
