param(
  [string]$ModelUrl = "https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q4_k_m.gguf",
  [string]$OutputPath = "models\rick-c63-qwen2.5-coder-7b-q4_k_m.gguf",
  [long]$ExpectedBytes = 4683073536
)

$ErrorActionPreference = "Stop"

$outputFullPath = Join-Path (Get-Location) $OutputPath
$outputDir = Split-Path -Parent $outputFullPath

if (-not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

if (Test-Path -LiteralPath $outputFullPath) {
  $currentBytes = (Get-Item -LiteralPath $outputFullPath).Length
  if ($currentBytes -eq $ExpectedBytes) {
    Write-Host "Model already exists and size is correct: $outputFullPath"
    exit 0
  }
  Write-Host "Partial model found: $currentBytes / $ExpectedBytes bytes. Resuming..."
}

Write-Host "Downloading Rick-C63 local model..."
Write-Host "Source: $ModelUrl"
Write-Host "Target: $outputFullPath"
Write-Host "This can take a while because the GGUF model is several GB."

if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
  & curl.exe -L --fail --ssl-no-revoke --continue-at - --output $outputFullPath $ModelUrl
} else {
  Invoke-WebRequest -Uri $ModelUrl -OutFile $outputFullPath
}

if (-not (Test-Path -LiteralPath $outputFullPath)) {
  Write-Error "Download failed: model file not found after download."
  exit 1
}

Write-Host "Rick-C63 model downloaded:"
Write-Host $outputFullPath
