# Nemesis Droidijana -63

Premium static demo app for the Rick-C63 concept engine.

## One-click Windows laptop setup

Double-click:

```text
Install Nemesis Droidijana.cmd
```

Then start with:

```text
Start Nemesis Droidijana.cmd
```

The setup installs portable Node.js, the local Ollama runtime and `qwen3-coder:30b`. The start script checks the local model and downloads it automatically if it is missing.

## Self-Healing Doctor

Nemesis includes `scripts\self-healing-doctor.ps1`. It checks and repairs:

- local database JSON
- portable Node.js
- local Ollama runtime
- Rick-C63 model availability
- startup report in `data\doctor-report.json`

## Windows EXE export and trusted signing

Nemesis generates a real Windows `.exe` launcher during project export. For an Authenticode-verified company signature, install the Windows SDK SignTool and provide your code-signing `.pfx` certificate. See `WINDOWS-SIGNING.md`.

Run the full local app server:

```powershell
npm start
```

Then open:

```text
http://localhost:8787
```

For mobile on the same network, open the computer's LAN IP with port `8787`.

## Rick-C63 local LLM: Ollama + Qwen3-Coder

OpenClaw is an agent framework, not the model brain. Rick-C63 now uses Ollama first. Target model: `qwen3-coder:30b`; ready-now fallback: `qwen2.5-coder:3b` if the large model is still downloading.

Install bundled Ollama runtime:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-ollama-runtime.ps1
```

Download/start the Rick-C63 coding model:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-ollama-rick-c63.ps1
```

Then start the app backend in another terminal:

```powershell
node server.js
```

Open:

```text
http://localhost:8787
```

## llama.cpp legacy

Rick-C63 is wired for a local llama.cpp server. Start llama.cpp separately, then run this app.

Download the built-in Rick-C63 GGUF model into `models/`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\download-rick-c63-model.ps1
```

Download the bundled llama.cpp Windows runtime into `runtime/`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\download-llama-cpp-runtime.ps1
```

Default target:

```text
http://127.0.0.1:8080
```

Override it:

```powershell
$env:LLAMA_CPP_URL="http://127.0.0.1:8080"; npm start
```

If llama.cpp is offline, the app keeps working with the local fallback engine.

Start llama.cpp after placing/downloading your `llama-server.exe` and `.gguf` model:

```powershell
$env:LLAMA_SERVER_PATH="C:\llama.cpp\llama-server.exe"
$env:RICK_C63_MODEL_PATH="C:\llama.cpp\models\your-model.gguf"
powershell -ExecutionPolicy Bypass -File scripts\start-llama-cpp-server.ps1
```

In another terminal:

```powershell
node server.js
```

You can still open `index.html` directly in a browser. The app then runs in frontend-only mode with:

- Rick-C63 structured demo responses
- URL, image and text idea intake
- legal safety redirection
- analysis reports
- blueprint generation
- Empire Dashboard persistence through `localStorage`
- prompt export and development task generation
- backend sync when served through `server.js`
- generated product folders in `generated-products/`

Demo mode is intentional. Missing AI/API credentials do not crash the app.

## Training Automation Lab

Nemesis now includes a `Training` workspace for public web collection and LLM fine-tuning prep.

It can:

- take a topic and objective
- crawl public seed URLs and discovered public pages
- build instruction-style training data
- export a training package with `dataset.jsonl`, `manifest.json` and example training configs

Important:

- use public, license-compatible sources only
- review the dataset before training
- this project prepares the training package; the actual fine-tuning run happens in your chosen stack such as Axolotl, Unsloth or Hugging Face Jobs

## Hugging Face Jobs

The `Training` tab can now submit a GPU job to Hugging Face Jobs.

Requirements:

- the local `hf` CLI must be logged in, or `HF_TOKEN` must be available to the server
- choose a Hugging Face namespace if you want the output repos under an organization
- select a GPU flavor such as `a10g-small`, `l4x1` or `a100-large`

Flow:

1. Nemesis collects the public sources and builds `dataset.jsonl`.
2. The package is uploaded to a dataset repo on the Hub.
3. Nemesis starts a Hugging Face Job that downloads the dataset and trains a LoRA adapter.
4. The adapter is pushed to the output model repo on the Hub.
