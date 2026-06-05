# Windows EXE signing

Erleuchtung now generates a real Windows `.exe` launcher for every generated web product.

## Install SignTool

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-windows-signing-tools.ps1
```

This downloads the official Microsoft Windows SDK installer and opens it. Install the `Signing Tools for Desktop Apps` component.

## Provide a trusted code-signing certificate

Obtain an Authenticode code-signing certificate for your company or your verified identity from a trusted certificate authority. Export or provide it as a `.pfx` file with its private key.

Before starting Erleuchtung:

```powershell
$env:WINDOWS_CODESIGN_PFX="C:\secure\your-company-code-signing.pfx"
$env:WINDOWS_CODESIGN_PASSWORD="your-pfx-password"
powershell -ExecutionPolicy Bypass -File scripts\start-nemesis.ps1
```

When a `.pfx` is configured, Erleuchtung signs with SHA-256, timestamps the executable and runs Authenticode verification. A failed signature or verification stops the export.

Optional timestamp override:

```powershell
$env:WINDOWS_TIMESTAMP_URL="https://your-rfc3161-timestamp-service"
```

Without a trusted certificate, Erleuchtung still generates a working `.exe`, but reports it honestly as unsigned.
