param(
  [Parameter(Mandatory = $true)][string]$SourceDir,
  [Parameter(Mandatory = $true)][string]$OutputDir,
  [Parameter(Mandatory = $true)][string]$AppName,
  [Parameter(Mandatory = $true)][string]$Slug
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$exports = Join-Path $root "exports"
$resolvedSource = (Resolve-Path -LiteralPath $SourceDir).Path
$fullOutput = [System.IO.Path]::GetFullPath($OutputDir)

if (-not $resolvedSource.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Source directory must stay inside the Nemesis workspace."
}
if (-not $fullOutput.StartsWith($exports, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Windows output directory must stay inside the exports directory."
}
if (Test-Path -LiteralPath $fullOutput) {
  Remove-Item -LiteralPath $fullOutput -Recurse -Force
}

New-Item -ItemType Directory -Path $fullOutput | Out-Null
$softwareDir = Join-Path $fullOutput "software"
Copy-Item -LiteralPath $resolvedSource -Destination $softwareDir -Recurse

$escapedAppName = $AppName.Replace('"', '\"')
$launcherSource = Join-Path $fullOutput "NemesisLauncher.cs"
$exePath = Join-Path $fullOutput "$Slug.exe"

@"
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class NemesisLauncher
{
    [STAThread]
    private static void Main()
    {
        var app = Path.Combine(AppContext.BaseDirectory, "software", "src", "index.html");
        if (!File.Exists(app))
        {
            MessageBox.Show("Generated application files are missing.", "$escapedAppName", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        Process.Start(new ProcessStartInfo
        {
            FileName = app,
            UseShellExecute = true
        });
    }
}
"@ | Set-Content -LiteralPath $launcherSource -Encoding UTF8

$cscCandidates = @(
  "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
  "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$csc = $cscCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $csc) {
  throw "Windows C# compiler csc.exe was not found."
}

& $csc /nologo /target:winexe /optimize+ /reference:System.Windows.Forms.dll /out:$exePath $launcherSource
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $exePath)) {
  throw "Windows EXE compilation failed."
}

$signTool = $env:WINDOWS_SIGNTOOL_PATH
if (-not $signTool -or -not (Test-Path -LiteralPath $signTool)) {
  $kitRoot = "C:\Program Files (x86)\Windows Kits\10\bin"
  if (Test-Path -LiteralPath $kitRoot) {
    $signTool = Get-ChildItem -LiteralPath $kitRoot -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -match "\\x64\\signtool\.exe$" } |
      Sort-Object FullName -Descending |
      Select-Object -ExpandProperty FullName -First 1
  }
}

$signed = $false
$verified = $false
$signatureStatus = if ($signTool) {
  "Unsigned: provide WINDOWS_CODESIGN_PFX for an Authenticode company signature."
} else {
  "Unsigned: provide WINDOWS_CODESIGN_PFX and install the Windows SDK SignTool."
}
$pfx = $env:WINDOWS_CODESIGN_PFX

if ($pfx) {
  if (-not (Test-Path -LiteralPath $pfx)) {
    throw "WINDOWS_CODESIGN_PFX points to a missing file."
  }
  if (-not $signTool -or -not (Test-Path -LiteralPath $signTool)) {
    throw "Signing certificate configured, but SignTool was not found. Install the Windows SDK or set WINDOWS_SIGNTOOL_PATH."
  }

  $timestampUrl = if ($env:WINDOWS_TIMESTAMP_URL) { $env:WINDOWS_TIMESTAMP_URL } else { "http://timestamp.digicert.com" }
  $signArgs = @("sign", "/f", $pfx, "/fd", "SHA256")
  if ($timestampUrl -ne "none") {
    $signArgs += @("/tr", $timestampUrl, "/td", "SHA256")
  }
  if ($env:WINDOWS_CODESIGN_PASSWORD) {
    $signArgs += @("/p", $env:WINDOWS_CODESIGN_PASSWORD)
  }
  $signArgs += $exePath
  & $signTool @signArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Authenticode signing failed."
  }
  & $signTool verify /pa /v $exePath
  if ($LASTEXITCODE -ne 0) {
    throw "Authenticode verification failed."
  }
  $signed = $true
  $verified = $true
  $signatureStatus = "Authenticode signature verified."
}

Remove-Item -LiteralPath $launcherSource -Force

$manifest = [ordered]@{
  app_name = $AppName
  executable = $exePath
  executable_name = "$Slug.exe"
  signed = $signed
  verified = $verified
  signature_status = $signatureStatus
  generated_at = (Get-Date).ToString("o")
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $fullOutput "windows-build.json") -Encoding UTF8

@"
# $AppName Windows Build

Run:

````text
$Slug.exe
````

Signature status:

````text
$signatureStatus
````

The executable launches the generated local web software from the bundled ``software`` directory.
"@ | Set-Content -LiteralPath (Join-Path $fullOutput "README.md") -Encoding UTF8

$manifest | ConvertTo-Json -Depth 5
