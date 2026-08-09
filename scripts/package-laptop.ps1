$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $root ".laptop-package"
$exports = Join-Path $root "exports"
$zip = Join-Path $exports "erleuchtung-rick-c63-diane-c1-system-laptop-v5.zip"

if (Test-Path -LiteralPath $stage) {
  Remove-Item -LiteralPath $stage -Recurse -Force
}

New-Item -ItemType Directory -Path $stage | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "data") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "models") | Out-Null
New-Item -ItemType Directory -Path $exports -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $root "index.html") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "styles.css") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "app.js") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "server.js") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "package.json") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "README.md") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "WINDOWS-SIGNING.md") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "Install Erleuchtung.cmd") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "Start Erleuchtung.cmd") -Destination $stage
Copy-Item -LiteralPath (Join-Path $root "scripts") -Destination $stage -Recurse

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
'@ | Set-Content -LiteralPath (Join-Path $stage "data\erleuchtung-db.json") -Encoding UTF8

@'
# Laptop package

This lightweight package contains the Erleuchtung app and setup scripts.

First setup: double-click:

```text
Install Erleuchtung.cmd
```

Then start with:

```text
Start Erleuchtung.cmd
```

Open:

```text
http://localhost:8787
```

If you override `PORT`, open that port instead.

The installer downloads portable Node.js, the local Ollama runtime and the approximately 18GB qwen3-coder:30b model into this app folder. On later starts, the model is checked and downloaded only if it is missing.

Self-Healing Doctor:

```text
scripts\self-healing-doctor.ps1
```

The Doctor repairs missing runtime folders, damaged local database JSON and missing local model/runtime components.
'@ | Set-Content -LiteralPath (Join-Path $stage "LAPTOP-SETUP.md") -Encoding UTF8

if (Test-Path -LiteralPath $zip) {
  Remove-Item -LiteralPath $zip -Force
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
Remove-Item -LiteralPath $stage -Recurse -Force

Write-Host "Laptop package created:"
Write-Host $zip
