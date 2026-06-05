param(
  [switch]$SkipModel,
  [switch]$SkipDownloads
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$runtime = Join-Path $root "runtime"
$dataDir = Join-Path $root "data"
$db = Join-Path $dataDir "nemesis-db.json"
$report = Join-Path $dataDir "doctor-report.json"
$node = Join-Path $runtime "node\node.exe"
$ollama = Join-Path $runtime "ollama\ollama.exe"
$models = Join-Path $root "models\ollama"
$issues = [System.Collections.Generic.List[string]]::new()
$repairs = [System.Collections.Generic.List[string]]::new()

New-Item -ItemType Directory -Path $runtime -Force | Out-Null
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
New-Item -ItemType Directory -Path $models -Force | Out-Null

function Add-Issue([string]$Text) {
  $issues.Add($Text)
  Write-Host "[Doctor] $Text"
}

function Add-Repair([string]$Text) {
  $repairs.Add($Text)
  Write-Host "[Doctor] Repaired: $Text"
}

if (-not (Test-Path -LiteralPath $db)) {
  Add-Issue "Local database was missing."
  @'
{
  "targets": [],
  "projects": [],
  "reports": [],
  "blueprints": [],
  "blueprintVersions": [],
  "products": [],
  "memories": [],
  "sessions": []
}
'@ | Set-Content -LiteralPath $db -Encoding UTF8
  Add-Repair "Created a clean local database."
} else {
  try {
    Get-Content -LiteralPath $db -Raw | ConvertFrom-Json | Out-Null
  } catch {
    Add-Issue "Local database JSON was damaged."
    $backup = Join-Path $dataDir ("nemesis-db.damaged-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
    Copy-Item -LiteralPath $db -Destination $backup
    @'
{
  "targets": [],
  "projects": [],
  "reports": [],
  "blueprints": [],
  "blueprintVersions": [],
  "products": [],
  "memories": [],
  "sessions": []
}
'@ | Set-Content -LiteralPath $db -Encoding UTF8
    Add-Repair "Backed up damaged data and created a clean local database."
  }
}

if (-not (Test-Path -LiteralPath $node) -and -not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  Add-Issue "Node.js runtime was missing."
  if ($SkipDownloads) {
    Add-Issue "Node.js repair skipped because downloads are disabled."
  } else {
    powershell -ExecutionPolicy Bypass -File scripts\install-node-runtime.ps1
    Add-Repair "Installed portable Node.js runtime."
  }
}

if (-not (Test-Path -LiteralPath $ollama)) {
  Add-Issue "Ollama runtime was missing."
  if ($SkipDownloads) {
    Add-Issue "Ollama repair skipped because downloads are disabled."
  } else {
    powershell -ExecutionPolicy Bypass -File scripts\install-ollama-runtime.ps1
    Add-Repair "Installed local Ollama runtime."
  }
}

if (-not $SkipModel -and -not $SkipDownloads) {
  powershell -ExecutionPolicy Bypass -File scripts\ensure-rick-model.ps1
  Add-Repair "Verified Rick-C63 qwen3-coder:30b local model."
}

$nodeReady = (Test-Path -LiteralPath $node) -or [bool](Get-Command node.exe -ErrorAction SilentlyContinue)
$ollamaReady = Test-Path -LiteralPath $ollama
$doctor = [ordered]@{
  ok = $nodeReady -and $ollamaReady
  app = "Nemesis Droidijana -63"
  checked_at = (Get-Date).ToString("o")
  node_ready = $nodeReady
  ollama_ready = $ollamaReady
  model_check_skipped = [bool]$SkipModel
  issues = $issues
  repairs = $repairs
}
$doctor | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $report -Encoding UTF8
$doctor | ConvertTo-Json -Depth 5

if (-not $doctor.ok) {
  throw "Self-Healing Doctor could not repair all required local components."
}
