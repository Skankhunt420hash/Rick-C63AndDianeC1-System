$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$exports = Join-Path $root "exports"
$stage = Join-Path $root ".nemesis-exe-stage"
$payload = Join-Path $stage "nemesis-droidijana-63-payload.zip"
$exe = Join-Path $exports "Nemesis-Rick-Droidijana-63.exe"
$source = Join-Path $stage "NemesisInstaller.cs"

if (Test-Path -LiteralPath $stage) {
  Remove-Item -LiteralPath $stage -Recurse -Force
}
New-Item -ItemType Directory -Path $stage | Out-Null
New-Item -ItemType Directory -Path $exports -Force | Out-Null

$payloadRoot = Join-Path $stage "payload"
New-Item -ItemType Directory -Path $payloadRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $payloadRoot "data") | Out-Null

@("index.html", "styles.css", "app.js", "server.js", "package.json", "README.md", "WINDOWS-SIGNING.md") |
  ForEach-Object { Copy-Item -LiteralPath (Join-Path $root $_) -Destination $payloadRoot }
Copy-Item -LiteralPath (Join-Path $root "scripts") -Destination $payloadRoot -Recurse

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
'@ | Set-Content -LiteralPath (Join-Path $payloadRoot "data\nemesis-db.json") -Encoding UTF8

Compress-Archive -Path (Join-Path $payloadRoot "*") -DestinationPath $payload -CompressionLevel Optimal

@'
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;

internal static class NemesisInstaller
{
    [STAThread]
    private static void Main()
    {
        try
        {
            var installDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "NemesisDroidijana63"
            );
            Directory.CreateDirectory(installDir);
            ExtractPayload(installDir);

            var starter = Path.Combine(installDir, "scripts", "doctor-and-start.ps1");
            var info = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = "-ExecutionPolicy Bypass -File \"" + starter + "\"",
                WorkingDirectory = installDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            Process.Start(info);
            MessageBox.Show(
                "Nemesis Droidijana -63 is starting locally.\n\nOn the first launch, the Self-Healing Doctor installs missing runtimes and downloads the approximately 18GB Rick-C63 model if needed. The browser opens when the local system is ready.",
                "Nemesis Rick & Droidijana",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "Nemesis installation failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private static void ExtractPayload(string installDir)
    {
        var assembly = Assembly.GetExecutingAssembly();
        using (var payload = assembly.GetManifestResourceStream("NemesisPayload.zip"))
        using (var archive = new ZipArchive(payload, ZipArchiveMode.Read))
        {
            foreach (var entry in archive.Entries)
            {
                var normalizedEntry = entry.FullName.Replace("\\", "/");
                var destination = Path.GetFullPath(Path.Combine(installDir, entry.FullName));
                if (!destination.StartsWith(installDir, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Unsafe payload path.");
                if (String.IsNullOrEmpty(entry.Name))
                {
                    Directory.CreateDirectory(destination);
                    continue;
                }
                Directory.CreateDirectory(Path.GetDirectoryName(destination));
                if (normalizedEntry.Equals("data/nemesis-db.json", StringComparison.OrdinalIgnoreCase) && File.Exists(destination))
                    continue;
                entry.ExtractToFile(destination, true);
            }
        }
    }
}
'@ | Set-Content -LiteralPath $source -Encoding UTF8

$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path -LiteralPath $csc)) {
  $csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}
$cscArgs = @(
  "/nologo",
  "/target:winexe",
  "/optimize+",
  "/reference:System.Windows.Forms.dll",
  "/reference:System.IO.Compression.dll",
  "/reference:System.IO.Compression.FileSystem.dll",
  "/resource:$payload,NemesisPayload.zip",
  "/out:$exe",
  $source
)
& $csc @cscArgs
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $exe)) {
  throw "Nemesis laptop EXE compilation failed."
}

Remove-Item -LiteralPath $stage -Recurse -Force
Write-Host "Nemesis laptop EXE created:"
Write-Host $exe
