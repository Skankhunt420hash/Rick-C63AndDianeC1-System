# Rick-C63AndDianeC1-System

Private Erleuchtung software system for Rick-C63 and Diane-C1.

Read the core text first:

- [BIBEL.md](BIBEL.md)

## What this repo is

This project is a private software and worldbuilding system focused on:

- Erleuchtung
- Frieden
- original code
- legal-safe creation
- harmony instead of coercion

Rick-C63 is treated here as a mythic genius-architect figure, and Diane-C1 as the balancing force that keeps the system grounded, gentle, and alive.

## Setup

Double-click:

```text
Install Erleuchtung.cmd
```

Then start with:

```text
Start Erleuchtung.cmd
```

The setup installs portable Node.js, the local Ollama runtime and `qwen3-coder:30b`. The start script checks the local model and downloads it automatically if it is missing.

## Local app

Run the app server:

```powershell
npm start
```

Then open:

```text
http://localhost:8787
```

The server binds to `127.0.0.1` by default. Keep it local unless you add a production authentication and network security layer.

## Software factory workspace

The Empire Production Line now connects blueprints and Empire projects to real local coding workspaces:

- Workspaces are persisted in the JSON database and project files live only under `generated/workspaces/`.
- The Workspace page provides a contained file tree, text editor, adapter capabilities/limits, status, and build/test history.
- Mutating files, creating workspaces, and executing runs require the local admin unlock.
- File access rejects traversal, hidden/sensitive paths, oversized files, and access outside the dedicated workspace root.
- Commands are a fixed allowlist: `syntax`, `check`, `test`, and `build-inspect`. The API never accepts an executable or command arguments from the client.
- Run output, status, exit code, and duration are stored in workspace history.

`test` intentionally executes project test code with Node.js. Treat admin-unlocked workspaces as trusted local code.

## Engine adapters

| Adapter | Current capability | Honest limit |
| --- | --- | --- |
| Web / PWA | Editable starter, manifest, local checks/tests | Hosting and store publishing are external |
| Desktop | Web shell and packaging instructions | Electron/Tauri, signing, and compilation toolchains are external |
| Native Mobile | Capacitor-oriented starter instructions | Android/iOS SDKs and signing are external |
| Godot / 3D | Godot project and scene skeleton | Godot editor/export templates are external |
| VR | OpenXR-oriented architecture scaffold | Runtime, headset SDK, and engine toolchain are external |

## Training and export

- Private training workspace for public web collection and fine-tuning prep
- Local export support for software packages
- Windows launcher generation
- Private-by-default repository and workflow

Native/game adapters are scaffolds, not claims of compiled or signed binaries. Existing EXE/AAB export targets still require their documented external toolchains.

## Verification

```powershell
npm run check
npm audit
```

The smoke test restores the JSON database and removes generated test workspaces/products after completion. It covers navigation, XSS safety, API hardening, workspace creation/editing/runs, and workspace security boundaries.

## Principle

This system is for building, not copying.
It is designed to stay private, original, and controlled by you.
