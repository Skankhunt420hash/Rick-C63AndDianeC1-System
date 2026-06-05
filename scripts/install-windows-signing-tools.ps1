$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$runtime = Join-Path $root "runtime\windows-sdk"
$installer = Join-Path $runtime "winsdksetup.exe"
$url = "https://download.microsoft.com/download/dba6f26e-0fb0-43bd-be9a-e3e24becb4a3/KIT_BUNDLE_WINDOWSSDK_MEDIACREATION/winsdksetup.exe"

$existing = Get-ChildItem "C:\Program Files (x86)\Windows Kits\10\bin" -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match "\\x64\\signtool\.exe$" } |
  Select-Object -ExpandProperty FullName -First 1
if ($existing) {
  Write-Host "Windows SignTool already installed:"
  Write-Host $existing
  exit 0
}

New-Item -ItemType Directory -Path $runtime -Force | Out-Null
if (-not (Test-Path -LiteralPath $installer)) {
  Write-Host "Downloading the official Microsoft Windows SDK installer..."
  if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
    & curl.exe -L --fail --ssl-no-revoke --output $installer $url
  } else {
    Invoke-WebRequest -Uri $url -OutFile $installer
  }
}

Write-Host "Opening the official Windows SDK installer."
Write-Host "Install the Signing Tools for Desktop Apps component, then run this script again to verify SignTool."
Start-Process -FilePath $installer -WorkingDirectory $runtime
