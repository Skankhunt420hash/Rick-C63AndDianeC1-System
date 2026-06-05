import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data");
const DB_PATH = join(DATA_DIR, "nemesis-db.json");
const DOCTOR_PATH = join(DATA_DIR, "doctor-report.json");
const GENERATED_DIR = join(ROOT, "generated-products");
const PORT = Number(process.env.PORT || 8787);
const LLAMA_URL = process.env.LLAMA_CPP_URL || "http://127.0.0.1:8080";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.RICK_C63_OLLAMA_MODEL || "qwen3-coder:30b";
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGING_FACE_HUB_TOKEN || "";
const HF_JOBS_NAMESPACE = process.env.HF_JOBS_NAMESPACE || "";
const HF_JOBS_FLAVOR = process.env.HF_JOBS_FLAVOR || "a10g-small";
const HF_JOBS_TIMEOUT = process.env.HF_JOBS_TIMEOUT || "4h";
const HF_TRAINING_DEFAULT_MODEL = process.env.HF_TRAINING_DEFAULT_MODEL || "Qwen/Qwen2.5-Coder-1.5B-Instruct";
const OLLAMA_FALLBACK_MODELS = ["qwen3-coder:30b", "qwen2.5-coder:32b", "qwen2.5-coder:14b", "qwen2.5-coder:7b", "qwen2.5-coder:3b"];
const execFileAsync = promisify(execFile);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jsonl": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".zip": "application/zip",
  ".exe": "application/vnd.microsoft.portable-executable"
};

const defaultDb = {
  targets: [],
  projects: [],
  reports: [],
  blueprints: [],
  blueprintVersions: [],
  trainingJobs: [],
  products: [],
  memories: [],
  sessions: [],
  adminAuth: {
    password_hash: "",
    password_salt: "",
    session_token: "",
    session_expires_at: ""
  }
};

await ensureStorage();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Erleuchtung (Rick-C63 & Diane-Droidijana) server running on http://localhost:${PORT}`);
  console.log(`Rick-C63 Ollama target: ${OLLAMA_URL} (${OLLAMA_MODEL})`);
  console.log(`Legacy llama.cpp fallback target: ${LLAMA_URL}`);
});

async function handleApi(req, res, url) {
  if (url.pathname === "/api/training/jobs" && req.method === "GET") {
    const db = await readDb();
    sendJson(res, 200, { ok: true, items: db.trainingJobs || [] });
    return;
  }

  if (url.pathname === "/api/training/jobs" && req.method === "POST") {
    const body = await readJson(req);
    const db = await readDb();
    const job = createTrainingJob(body.job || body);
    db.trainingJobs = [job, ...(db.trainingJobs || [])];
    await writeDb(db);
    sendJson(res, 200, { ok: true, job, items: db.trainingJobs });
    return;
  }

  if (url.pathname.startsWith("/api/training/jobs/")) {
    const jobId = url.pathname.split("/")[4] || "";
    const action = url.pathname.split("/")[5] || "";
    const db = await readDb();
    const jobIndex = (db.trainingJobs || []).findIndex((item) => item.id === jobId);
    if (jobIndex === -1) {
      sendJson(res, 404, { ok: false, error: "Training job not found" });
      return;
    }
    const job = db.trainingJobs[jobIndex];

    if (req.method === "GET" && !action) {
      sendJson(res, 200, { ok: true, job });
      return;
    }

    if (req.method === "POST" && action === "run") {
      const body = await readJson(req);
      const updated = await runTrainingPipeline(job, body.options || {});
      db.trainingJobs[jobIndex] = updated;
      await writeDb(db);
      sendJson(res, 200, { ok: true, job: updated, package: updated.package || null });
      return;
    }

    if (req.method === "POST" && action === "export") {
      const updated = await exportTrainingPackage(job);
      db.trainingJobs[jobIndex] = updated;
      await writeDb(db);
      sendJson(res, 200, { ok: true, job: updated, package: updated.package || null });
      return;
    }

    if (req.method === "POST" && action === "hf-launch") {
      const body = await readJson(req);
      const updated = await launchHuggingFaceTrainingJob(job, body.options || {});
      db.trainingJobs[jobIndex] = updated;
      await writeDb(db);
      sendJson(res, 200, { ok: true, job: updated, package: updated.package || null });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Training job action not found" });
    return;
  }

  const collections = {
    "/api/targets": "targets",
    "/api/reports": "reports",
    "/api/blueprints": "blueprints",
    "/api/empire-projects": "projects"
  };
  const collection = collections[url.pathname];
  if (collection && req.method === "GET") {
    const db = await readDb();
    sendJson(res, 200, { ok: true, items: db[collection] || [] });
    return;
  }
  if (collection && req.method === "POST") {
    const body = await readJson(req);
    const item = body.item || body;
    if (!item?.id) {
      sendJson(res, 400, { ok: false, error: "Missing item.id" });
      return;
    }
    const db = await readDb();
    db[collection] = mergeById(db[collection] || [], [item]);
    await writeDb(db);
    sendJson(res, 200, { ok: true, item, items: db[collection] });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    const llama = await checkLlama();
    const ollama = await checkOllama();
    sendJson(res, 200, {
      ok: true,
      app: "Erleuchtung (Rick-C63 & Diane-Droidijana)",
      backend: "node-local",
      ollama,
      llama
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/db") {
    sendJson(res, 200, { ok: true, db: await readDb() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/doctor") {
    let doctor = { ok: false, status: "No doctor report yet." };
    if (existsSync(DOCTOR_PATH)) {
      doctor = JSON.parse((await readFile(DOCTOR_PATH, "utf8")).replace(/^\uFEFF/, ""));
    }
    sendJson(res, 200, { ok: true, doctor });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/status") {
    const db = await readDb();
    const token = getAdminToken(req);
    sendJson(res, 200, {
      ok: true,
      configured: Boolean(db.adminAuth?.password_hash),
      unlocked: isAdminTokenValid(db, token)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/set-password") {
    const body = await readJson(req);
    const password = String(body.password || "");
    const currentPassword = String(body.currentPassword || "");
    if (password.length < 8) {
      sendJson(res, 400, { ok: false, error: "Password must be at least 8 characters." });
      return;
    }
    const db = await readDb();
    const configured = Boolean(db.adminAuth?.password_hash);
    if (configured && !verifyPassword(db, currentPassword)) {
      sendJson(res, 401, { ok: false, error: "Current password is invalid." });
      return;
    }
    const salt = randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);
    db.adminAuth = {
      password_hash: hash,
      password_salt: salt,
      session_token: "",
      session_expires_at: ""
    };
    await writeDb(db);
    sendJson(res, 200, { ok: true, configured: true });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    const body = await readJson(req);
    const password = String(body.password || "");
    const db = await readDb();
    if (!db.adminAuth?.password_hash) {
      sendJson(res, 400, { ok: false, error: "Admin password is not configured." });
      return;
    }
    if (!verifyPassword(db, password)) {
      sendJson(res, 401, { ok: false, error: "Invalid password." });
      return;
    }
    const token = randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    db.adminAuth.session_token = token;
    db.adminAuth.session_expires_at = expires;
    await writeDb(db);
    sendJson(res, 200, { ok: true, token, expires_at: expires });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/logout") {
    const db = await readDb();
    db.adminAuth.session_token = "";
    db.adminAuth.session_expires_at = "";
    await writeDb(db);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/db/sync") {
    const body = await readJson(req);
    const db = await readDb();
    const merged = mergeDb(db, body);
    await writeDb(merged);
    sendJson(res, 200, { ok: true, db: merged });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/chat") {
    const body = await readJson(req);
    const db = await readDb();
    const result = await askRick(body.prompt || "", body.context || {}, db);
    db.sessions.unshift({
      id: createId("session"),
      prompt: body.prompt || "",
      response: result.text,
      provider: result.provider,
      created_at: new Date().toISOString()
    });
    db.memories.unshift({
      id: createId("memory"),
      text: `Rick-C63 discussed: ${(body.prompt || "").slice(0, 180)}`,
      created_at: new Date().toISOString()
    });
    db.memories = db.memories.slice(0, 100);
    await writeDb(db);
    sendJson(res, 200, { ok: true, ...result, db });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/product/build") {
    const db = await readDb();
    if (!isAdminTokenValid(db, getAdminToken(req))) {
      sendJson(res, 403, { ok: false, error: "Admin unlock required." });
      return;
    }
    const body = await readJson(req);
    const product = body.product;
    if (!product?.name) {
      sendJson(res, 400, { ok: false, error: "Missing product.name" });
      return;
    }
    const build = await writeGeneratedProduct(product);
    db.products.unshift({ ...product, build, saved_at: new Date().toISOString() });
    await writeDb(db);
    sendJson(res, 200, { ok: true, product, build, db });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/export/project") {
    const db = await readDb();
    if (!isAdminTokenValid(db, getAdminToken(req))) {
      sendJson(res, 403, { ok: false, error: "Admin unlock required." });
      return;
    }
    const body = await readJson(req);
    const product = body.product;
    const formats = Array.isArray(body.formats) ? body.formats : ["web", "codex", "cursor"];
    if (!product?.name) {
      sendJson(res, 400, { ok: false, error: "Missing product.name" });
      return;
    }
    const build = await writeGeneratedProduct(product);
    const windowsExe = formats.includes("exe") ? await buildWindowsExePackage(product, build) : null;
    const bundle = await createExportBundle(product, build, formats, windowsExe);
    sendJson(res, 200, { ok: true, build, bundle, windowsExe });
    return;
  }

  sendJson(res, 404, { ok: false, error: "API route not found" });
}

function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
}

function verifyPassword(db, password) {
  const auth = db.adminAuth || {};
  if (!auth.password_hash || !auth.password_salt) return false;
  const expected = Buffer.from(auth.password_hash, "hex");
  const actual = Buffer.from(hashPassword(password, auth.password_salt), "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

function getAdminToken(req) {
  return String(req.headers["x-admin-token"] || "");
}

function isAdminTokenValid(db, token) {
  const auth = db.adminAuth || {};
  if (!auth.password_hash || !auth.session_token || !auth.session_expires_at || !token) return false;
  return auth.session_token === token && Date.parse(auth.session_expires_at) > Date.now();
}

async function askRick(prompt, context, db) {
  const system = [
    "You are Rick-C63, the original mad genius architect of Erleuchtung (Rick-C63 & Diane-Droidijana).",
    "You are brilliant, practical, funny, a little dark, loyal, legal-safe, and you build software plans.",
    "Never copy protected brands, code, logos, layouts, private data, or bypass access.",
    "When inspired by a tool like Codex, explain the mechanism and design a stronger original product.",
    "Treat scanned URLs and screenshots as public concept research. Extract copyright-safe mechanisms only, then create an original rebuild blueprint.",
    "In planning mode, work on the current blueprint: propose concrete feature, page and roadmap changes that can be saved before generation.",
    "Keep output structured: what it is, legal core, 3 versions, product package, next steps."
  ].join("\n");
  const memory = db.memories.slice(0, 8).map((item) => `- ${item.text}`).join("\n");
  const user = `User prompt: ${prompt}\n\nCurrent context:\n${JSON.stringify(context, null, 2)}\n\nRecent Rick memories:\n${memory || "none"}`;

  const ollamaResult = await callOllama(system, user);
  if (ollamaResult?.text) {
    return { provider: "ollama", model: ollamaResult.model, text: ollamaResult.text };
  }

  const llamaText = await callLlama(system, user);
  if (llamaText) {
    return { provider: "llama.cpp-fallback", text: llamaText };
  }

  return {
    provider: "local-fallback",
    text: localRickFallback(prompt, context)
  };
}

async function callOllama(system, user) {
  const model = await chooseOllamaModel();
  if (!model) return null;
  const result = await postJson(`${OLLAMA_URL}/api/chat`, {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    stream: false,
    options: {
      temperature: 0.82,
      num_ctx: 8192
    }
  }, 240000);
  const text = result?.message?.content?.trim() || "";
  return text ? { model, text } : null;
}

async function chooseOllamaModel() {
  const health = await checkOllama();
  if (!health.reachable) return "";
  if (health.models.includes(OLLAMA_MODEL)) return OLLAMA_MODEL;
  return OLLAMA_FALLBACK_MODELS.find((model) => health.models.includes(model)) || health.models[0] || "";
}

async function callLlama(system, user) {
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user }
  ];

  const chat = await postJson(`${LLAMA_URL}/v1/chat/completions`, {
    model: "local-rick-c63",
    messages,
    temperature: 0.82,
    max_tokens: 1800
  });
  const chatText = chat?.choices?.[0]?.message?.content;
  if (chatText) return chatText.trim();

  const completion = await postJson(`${LLAMA_URL}/completion`, {
    prompt: `${system}\n\n${user}\n\nRick-C63:`,
    temperature: 0.82,
    n_predict: 1800
  });
  return completion?.content?.trim() || "";
}

async function postJson(url, body, timeoutMs = 45000) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function checkLlama() {
  try {
    const response = await fetch(`${LLAMA_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return { configured_url: LLAMA_URL, reachable: response.ok, status: response.status };
  } catch {
    return { configured_url: LLAMA_URL, reachable: false, status: "offline" };
  }
}

async function checkOllama() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!response.ok) return { configured_url: OLLAMA_URL, model: OLLAMA_MODEL, reachable: false, status: response.status };
    const data = await response.json();
    const models = (data.models || []).map((model) => model.name);
    return {
      configured_url: OLLAMA_URL,
      model: OLLAMA_MODEL,
      reachable: true,
      installed: models.includes(OLLAMA_MODEL),
      models
    };
  } catch {
    return { configured_url: OLLAMA_URL, model: OLLAMA_MODEL, reachable: false, status: "offline" };
  }
}

function localRickFallback(prompt, context) {
  const source = prompt.match(/https?:\/\/[^\s]+|codex|replit|canva|github|figma|notion/i)?.[0] || "your idea";
  return `Rick-C63 local fallback active.

I see the machine: ${source}. We are not copying the corpse paint; we are extracting the engine and building your own thunder-powered version.

1. What this is
It is a workflow product: user intent goes in, structured output comes out, then the user iterates until something real exists.

2. Legal core
Use the mechanism, not protected names, logos, exact layouts, text, private data or code.

3. Three versions
- MVP: input, Rick analysis, saved project, generated product package.
- Premium: project memory, connected pages, polished dashboard, build phases.
- Empire: llama.cpp Rick-C63 server, real code generation, test loop and deployment pipeline.

4. Product package
Build an original software generator inspired by the usefulness of ${source}: it turns an idea into architecture, screens, routes, data model, tasks and connected product modules.

5. Next steps
1. Generate Software.
2. Connect it to your pages.
3. Start llama.cpp so I can think with the big local brain instead of this emergency candle in a cathedral.`;
}

async function writeGeneratedProduct(product) {
  const slug = safeSlug(product.slug || product.name);
  const dir = join(GENERATED_DIR, slug);
  await mkdir(join(dir, "src"), { recursive: true });

  const expanded = expandProduct(product);
  const files = {
    "README.md": productReadme(expanded),
    "product.json": JSON.stringify(expanded, null, 2),
    "src/index.html": productHtml(expanded),
    "src/styles.css": productCss(expanded),
    "src/app.js": productJs(expanded)
  };

  for (const [file, content] of Object.entries(files)) {
    await writeFile(join(dir, file), content, "utf8");
  }
  return {
    dir,
    files: Object.keys(files),
    entry: join(dir, "src", "index.html"),
    url: `/generated-products/${slug}/src/index.html`
  };
}

async function createExportBundle(product, build, formats, windowsExe = null) {
  const slug = safeSlug(product.slug || product.name);
  const exportDir = join(ROOT, "exports");
  await mkdir(exportDir, { recursive: true });
  const zipPath = join(exportDir, `${slug}-export.zip`);
  const expanded = expandProduct(product);
  const files = {};

  files["README.md"] = exportReadme(expanded, formats);
  files["product.json"] = JSON.stringify(expanded, null, 2);
  files["codex/CODEX_PROMPT.md"] = codexPrompt(expanded);
  files["cursor/CURSOR_INSTRUCTIONS.md"] = cursorInstructions(expanded);
  files["models/RICK_C63_MODEL_NOTES.md"] = modelExportNotes(expanded);
  files["build/windows-exe/README.md"] = exeBuildReadme(expanded);
  files["build/android-aab/README.md"] = aabBuildReadme(expanded);
  files["build/export-manifest.json"] = JSON.stringify({ formats, generated_at: new Date().toISOString(), build }, null, 2);

  const productFiles = await collectFiles(build.dir);
  for (const file of productFiles) {
    files[`software/${file.relativePath}`] = await readFile(file.fullPath);
  }
  if (windowsExe?.dir) {
    const windowsFiles = await collectFiles(windowsExe.dir);
    for (const file of windowsFiles) {
      files[`windows-exe/${file.relativePath}`] = await readFile(file.fullPath);
    }
  }

  await writeFile(zipPath, createZip(files));
  return {
    path: zipPath,
    url: `/exports/${slug}-export.zip`,
    formats,
    files: Object.keys(files)
  };
}

async function buildWindowsExePackage(product, build) {
  const slug = safeSlug(product.slug || product.name);
  const outputDir = join(ROOT, "exports", `${slug}-windows`);
  await execFileAsync("powershell", [
    "-ExecutionPolicy", "Bypass",
    "-File", join(ROOT, "scripts", "build-windows-exe.ps1"),
    "-SourceDir", build.dir,
    "-OutputDir", outputDir,
    "-AppName", product.name,
    "-Slug", slug
  ], {
    cwd: ROOT,
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 4
  });
  const manifest = JSON.parse((await readFile(join(outputDir, "windows-build.json"), "utf8")).replace(/^\uFEFF/, ""));
  return {
    ...manifest,
    dir: outputDir,
    url: `/exports/${slug}-windows/${slug}.exe`
  };
}

async function collectFiles(dir, base = dir) {
  const { readdir, stat } = await import("node:fs/promises");
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      files.push(...await collectFiles(fullPath, base));
    } else {
      files.push({
        fullPath,
        relativePath: fullPath.slice(base.length + 1).replaceAll("\\", "/")
      });
    }
  }
  return files;
}

function exportReadme(product, formats) {
  return `# ${product.name} Export

This export was generated by Rick-C63.

Included formats:
${formats.map((format) => `- ${format}`).join("\n")}

## Open the generated web software

Open:

\`\`\`text
software/src/index.html
\`\`\`

## Important

EXE and AAB exports are prepared as build targets. They require native build toolchains before they can become signed production binaries.
`;
}

function codexPrompt(product) {
  return `# Codex Build Prompt

You are continuing a generated Rick-C63 software product.

Project: ${product.name}
Pitch: ${product.pitch}

Build goals:
${product.buildPhases.map((phase) => `- ${phase}`).join("\n")}

Modules:
${product.modules.map((module) => `- ${module}`).join("\n")}

Rules:
- Do not copy protected assets, names, logos, private data or source code.
- Build an original implementation.
- Keep mobile responsive.
- Preserve product.json as the source of truth.
`;
}

function cursorInstructions(product) {
  return `# Cursor Instructions

Open this export folder in Cursor.

Start with:

1. Read \`product.json\`.
2. Open \`software/src/index.html\`.
3. Improve the generated app based on the modules and build phases.
4. Keep the project original and legal-safe.

Suggested first task:

Turn ${product.name} into a richer working app with persistent project records, route-like screens and polished mobile UI.
`;
}

function modelExportNotes(product) {
  return `# LLM Model Export Notes

Rick-C63 currently uses Ollama with qwen3-coder:30b.

This export does not duplicate the 18GB model file by default. The model is stored locally in:

\`\`\`text
models/ollama
\`\`\`

For portable deployment, install Ollama on the target machine and run:

\`\`\`powershell
ollama pull qwen3-coder:30b
\`\`\`

Product context:
${product.name}
${product.pitch}
`;
}

function exeBuildReadme(product) {
  return `# Windows EXE Build Target

Erleuchtung generates a real Windows EXE launcher for ${product.name} during export.

If WINDOWS_CODESIGN_PFX is configured and Windows SDK SignTool is installed, Erleuchtung signs and verifies the EXE automatically. Otherwise it reports the executable honestly as unsigned.
`;
}

function aabBuildReadme(product) {
  return `# Android AAB Build Target

Prepared target for ${product.name}.

Recommended path:
- Wrap the web app with Capacitor.
- Generate Android project.
- Build signed AAB through Android Studio/Gradle.

This folder is a build target, not a signed AAB yet.
`;
}

function expandProduct(product) {
  const slug = safeSlug(product.slug || product.name);
  const seed = hashString(`${product.name} ${product.pitch}`);
  const palettes = [
    { bg: "#061019", accent: "#53ff9d", second: "#1dbdff", third: "#ff3edb" },
    { bg: "#100813", accent: "#ffd166", second: "#8d5cff", third: "#53ff9d" },
    { bg: "#070b1c", accent: "#1dbdff", second: "#ff5a7a", third: "#ffd166" },
    { bg: "#08120d", accent: "#53ff9d", second: "#ffd166", third: "#1dbdff" }
  ];
  const palette = palettes[seed % palettes.length];
  const modules = product.modules?.length ? product.modules : ["Intake", "Generator", "Memory", "Dashboard"];
  const pages = product.pages?.length ? product.pages : ["Dashboard", "Generator", "Projects"];
  const features = modules.slice(0, 6).map((module, index) => ({
    id: `feature-${index + 1}`,
    title: module,
    description: `A working ${module.toLowerCase()} module connected to ${product.name}.`,
    status: index < 2 ? "ready" : "next"
  }));
  return {
    ...product,
    slug,
    palette,
    features,
    generatedAt: new Date().toISOString(),
    appStateKey: `generated-${slug}`,
    primaryActions: [
      "Create a new project record",
      "Generate a build plan",
      "Save progress locally",
      "Export product summary"
    ],
    screens: pages.map((page, index) => ({
      name: page,
      purpose: index === 0 ? "Main command center" : `Focused ${page.toLowerCase()} workspace`
    }))
  };
}

function productReadme(product) {
  return `# ${product.name}

Generated by Rick-C63 for Erleuchtung (Rick-C63 & Diane-Droidijana).

## Pitch
${product.pitch || ""}

## Versions
${(product.versions || []).map((item) => `- ${item.name}: ${item.summary}`).join("\n")}

## Modules
${(product.modules || []).map((item) => `- ${item}`).join("\n")}

## Build phases
${(product.buildPhases || []).map((item) => `- ${item}`).join("\n")}
`;
}

function productHtml(product) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(product.name)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="cosmos"></div>
  <header>
    <strong>${escapeHtml(product.name)}</strong>
    <nav id="nav"></nav>
  </header>
  <main>
    <section class="hero">
      <p class="eyebrow">Generated by Rick-C63</p>
      <h1>${escapeHtml(product.name)}</h1>
      <p>${escapeHtml(product.pitch || "Generated software product.")}</p>
      <div class="actions">
        <button id="saveProject">Save Project</button>
        <button id="generatePlan">Generate Plan</button>
        <button id="exportSummary">Export</button>
      </div>
    </section>
    <section class="grid" id="metrics"></section>
    <section class="workspace">
      <aside>
        <h2>Screens</h2>
        <div id="screens"></div>
      </aside>
      <section>
        <h2>Live Builder</h2>
        <label>Project note<textarea id="note" rows="5" placeholder="Describe the next feature..."></textarea></label>
        <button id="addNote">Add Note</button>
        <div id="notes"></div>
      </section>
    </section>
    <section>
      <h2>Modules</h2>
      <div id="modules"></div>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>`;
}

function productCss(product) {
  const palette = product.palette || { bg: "#050610", accent: "#53ff9d", second: "#1dbdff", third: "#ff3edb" };
  return `:root{--bg:${palette.bg};--accent:${palette.accent};--second:${palette.second};--third:${palette.third};--text:#f3fbff;--muted:#a9b8c9;--panel:rgba(255,255,255,.07);--line:rgba(155,231,255,.22)}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 20% 10%,color-mix(in srgb,var(--second) 28%,transparent),transparent 30%),radial-gradient(circle at 80% 0,color-mix(in srgb,var(--third) 22%,transparent),transparent 24%),var(--bg);color:var(--text);font-family:Inter,Segoe UI,system-ui,sans-serif}.cosmos{position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.75) 0 1px,transparent 1px);background-size:120px 120px;opacity:.22;animation:drift 34s linear infinite}header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;background:rgba(0,0,0,.42);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}nav{display:flex;gap:8px;overflow:auto}nav button,.actions button,#addNote{border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--text);padding:10px 12px;font-weight:800}main{width:min(1180px,calc(100% - 28px));margin:0 auto;padding:38px 0 70px}.hero{min-height:360px;display:grid;align-content:center}.eyebrow{color:var(--accent);font-weight:900;text-transform:uppercase;letter-spacing:.08em}h1{max-width:980px;margin:.1em 0;font-size:clamp(42px,9vw,96px);line-height:.94;letter-spacing:0}h2{margin:0 0 14px}.hero p{max-width:760px;color:#dceeff;font-size:20px;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:10px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card,.workspace>aside,.workspace>section,main>section:not(.hero):not(.grid){border:1px solid var(--line);border-radius:8px;background:var(--panel);box-shadow:0 20px 80px rgba(0,0,0,.28);padding:18px}.workspace{display:grid;grid-template-columns:320px 1fr;gap:14px;margin-top:14px}.screen,.module,.note{border:1px solid var(--line);border-radius:8px;padding:12px;margin:10px 0;background:rgba(0,0,0,.18)}textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.32);color:var(--text);padding:12px;margin:8px 0 10px}.status{display:inline-flex;border-radius:999px;padding:4px 8px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);font-size:12px;font-weight:900}@media(max-width:800px){header{display:grid}.grid,.workspace{grid-template-columns:1fr}h1{font-size:clamp(38px,16vw,70px)}}@keyframes drift{to{transform:translate(-120px,120px)}}`;
}

function productJs(product) {
  return `const product=${JSON.stringify(product, null, 2)};
const stateKey=product.appStateKey;
const saved=JSON.parse(localStorage.getItem(stateKey)||'{"notes":[],"saves":0}');
const $=(id)=>document.querySelector(id);
$("#nav").innerHTML=product.screens.map(s=>'<button data-screen="'+s.name+'">'+s.name+'</button>').join('');
$("#metrics").innerHTML=[
  ['Versions',product.versions.length],
  ['Modules',product.modules.length],
  ['Saved',saved.saves||0]
].map(([k,v])=>'<div class="card"><span class="status">'+k+'</span><h2>'+v+'</h2></div>').join('');
$("#screens").innerHTML=product.screens.map(s=>'<div class="screen"><strong>'+s.name+'</strong><p>'+s.purpose+'</p></div>').join('');
$("#modules").innerHTML=product.features.map(f=>'<div class="module"><span class="status">'+f.status+'</span><h3>'+f.title+'</h3><p>'+f.description+'</p></div>').join('');
function renderNotes(){ $("#notes").innerHTML=saved.notes.map(n=>'<div class="note">'+n+'</div>').join('') || '<p>No notes yet.</p>'; }
renderNotes();
$("#addNote").addEventListener('click',()=>{ const value=$("#note").value.trim(); if(!value)return; saved.notes.unshift(value); $("#note").value=''; localStorage.setItem(stateKey,JSON.stringify(saved)); renderNotes(); });
$("#saveProject").addEventListener('click',()=>{ saved.saves=(saved.saves||0)+1; localStorage.setItem(stateKey,JSON.stringify(saved)); location.reload(); });
$("#generatePlan").addEventListener('click',()=>{ const plan=product.buildPhases.map((p,i)=>(i+1)+'. '+p).join('\\n'); saved.notes.unshift('Generated plan:\\n'+plan); localStorage.setItem(stateKey,JSON.stringify(saved)); renderNotes(); });
$("#exportSummary").addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(product,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=product.slug+'-product.json'; a.click(); });`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
    const fileName = Buffer.from(name.replaceAll("\\", "/"), "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(fileName.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, fileName, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(fileName.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, fileName);

    offset += local.length + fileName.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

async function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(ROOT, normalized);
  if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
    sendJson(res, 404, { ok: false, error: "Not found" });
    return;
  }
  const content = await readFile(filePath);
  const extension = extname(filePath);
  const headers = {
    "content-type": mimeTypes[extension] || "application/octet-stream",
    "content-length": content.length
  };
  if (url.pathname.startsWith("/exports/") && [".exe", ".zip"].includes(extension)) {
    const filename = filePath.split(/[\\/]/).pop();
    headers["content-disposition"] = `attachment; filename="${filename}"`;
  }
  res.writeHead(200, headers);
  res.end(content);
}

async function ensureStorage() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(GENERATED_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    await writeDb(defaultDb);
  }
}

async function readDb() {
  try {
    return { ...defaultDb, ...JSON.parse(await readFile(DB_PATH, "utf8")) };
  } catch {
    return structuredClone(defaultDb);
  }
}

async function writeDb(db) {
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function mergeDb(db, body) {
  const incoming = body?.db || body || {};
  return {
    ...db,
    targets: mergeById(db.targets || [], incoming.targets || []),
    projects: mergeById(db.projects, incoming.empireProjects || incoming.projects || []),
    reports: mergeById(db.reports, incoming.reports || []),
    blueprints: mergeById(db.blueprints, incoming.blueprints || []),
    blueprintVersions: mergeById(db.blueprintVersions || [], incoming.blueprintVersions || []),
    trainingJobs: mergeById(db.trainingJobs || [], incoming.trainingJobs || []),
    memories: mergeById(db.memories, incoming.memories || []),
    sessions: mergeById(db.sessions, incoming.sessions || [])
  };
}

function mergeById(current, incoming) {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    if (item?.id) map.set(item.id, { ...map.get(item.id), ...item });
  }
  return [...map.values()];
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function safeSlug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "generated-product";
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createTrainingJob(input = {}) {
  const now = new Date().toISOString();
  const topic = String(input.topic || input.name || "").trim();
  const objective = String(input.objective || input.goal || "").trim();
  const baseModel = String(input.baseModel || input.base_model || HF_TRAINING_DEFAULT_MODEL).trim();
  const seedUrls = normalizeUrlList(input.seedUrls || input.seed_urls || input.sources || input.seed_urls_text);
  const allowedDomains = normalizeList(input.allowedDomains || input.allowed_domains || []);
  const discoveryQueries = normalizeList(input.discoveryQueries || input.discovery_queries || input.searchQueries || input.search_queries || topic);
  const jobId = input.id || createId("training-job");
  return {
    id: jobId,
    topic: topic || "untitled topic",
    objective: objective || topic || "collect public web evidence and prepare training data",
    base_model: baseModel,
    seed_urls: seedUrls,
    allowed_domains: allowedDomains,
    discovery_queries: discoveryQueries,
    max_pages: clampNumber(input.maxPages ?? input.max_pages, 1, 48, 12),
    max_depth: clampNumber(input.maxDepth ?? input.max_depth, 0, 3, 1),
    output_format: String(input.outputFormat || input.output_format || "instruction-jsonl"),
    dataset_style: String(input.datasetStyle || input.dataset_style || "fact-grounded"),
    auto_discover: input.autoDiscover ?? input.auto_discover ?? true,
    hf_namespace: String(input.hfNamespace || input.hf_namespace || HF_JOBS_NAMESPACE || "").trim(),
    hf_flavor: String(input.hfFlavor || input.hf_flavor || HF_JOBS_FLAVOR || "a10g-small").trim(),
    hf_timeout: String(input.hfTimeout || input.hf_timeout || HF_JOBS_TIMEOUT || "4h").trim(),
    hf_private_dataset: input.hfPrivateDataset ?? input.hf_private_dataset ?? true,
    hf_private_model: input.hfPrivateModel ?? input.hf_private_model ?? true,
    launch_on_hf: input.launchOnHf ?? input.launch_on_hf ?? Boolean(HF_TOKEN || HF_JOBS_NAMESPACE),
    status: "queued",
    phase: "ready",
    progress: 0,
    stats: {
      seeds: seedUrls.length,
      sources: 0,
      examples: 0,
      bytes: 0
    },
    package: null,
    sources: [],
    examples: [],
    logs: [],
    hf: {
      dataset_repo: "",
      model_repo: "",
      job_id: "",
      job_url: "",
      status: "",
      launched_at: "",
      launch_command: "",
      upload_status: ""
    },
    last_error: "",
    created_at: now,
    updated_at: now,
    started_at: "",
    finished_at: ""
  };
}

async function runTrainingPipeline(job, options = {}) {
  const workingJob = { ...job, ...options };
  const startedAt = new Date().toISOString();
  workingJob.status = "running";
  workingJob.phase = "discovering sources";
  workingJob.started_at = startedAt;
  workingJob.updated_at = startedAt;
  workingJob.progress = 5;
  workingJob.logs = [...(workingJob.logs || []), logLine("Pipeline started", startedAt)];

  try {
    const discovery = await discoverTrainingSources(workingJob);
    workingJob.sources = discovery.sources;
    workingJob.stats.sources = discovery.sources.length;
    workingJob.progress = 55;
    workingJob.phase = "building dataset";
    workingJob.logs.push(logLine(`Collected ${discovery.sources.length} public sources`, new Date().toISOString()));

    const examples = await buildTrainingExamples(workingJob, discovery.sources);
    workingJob.examples = examples;
    workingJob.stats.examples = examples.length;
    workingJob.progress = 80;
    workingJob.phase = "exporting package";
    workingJob.logs.push(logLine(`Prepared ${examples.length} instruction records`, new Date().toISOString()));

    const pkg = await writeTrainingPackage(workingJob);
    workingJob.package = pkg;
    workingJob.stats.bytes = pkg.bytes || 0;
    workingJob.progress = 100;
    workingJob.status = discovery.sources.length ? "complete" : "partial";
    workingJob.phase = discovery.sources.length ? "finished" : "finished with warnings";
    workingJob.finished_at = new Date().toISOString();
    workingJob.updated_at = workingJob.finished_at;
    workingJob.logs.push(logLine(`Package exported to ${pkg.url}`, workingJob.finished_at));
    return workingJob;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    workingJob.status = "failed";
    workingJob.phase = "failed";
    workingJob.last_error = error.message;
    workingJob.updated_at = finishedAt;
    workingJob.finished_at = finishedAt;
    workingJob.logs = [...(workingJob.logs || []), logLine(`Failed: ${error.message}`, finishedAt)];
    return workingJob;
  }
}

async function exportTrainingPackage(job) {
  if (!job.sources?.length || !job.examples?.length) {
    return runTrainingPipeline(job);
  }
  const pkg = await writeTrainingPackage(job);
  const updatedAt = new Date().toISOString();
  return {
    ...job,
    package: pkg,
    updated_at: updatedAt,
    finished_at: job.finished_at || updatedAt,
    status: job.status || "complete",
    phase: job.phase || "exported"
  };
}

async function discoverTrainingSources(job) {
  const seen = new Set();
  const queue = [];
  const sources = [];
  const allowedDomains = new Set(job.allowed_domains || []);
  const seedUrls = uniqueList([
    ...(job.seed_urls || []),
    ...(job.auto_discover ? await discoverUrlsFromSearch(job) : [])
  ]).filter(Boolean);

  for (const rawUrl of seedUrls) {
    const parsed = normalizeWebUrl(rawUrl);
    if (!parsed) continue;
    if (!allowedDomains.size) allowedDomains.add(parsed.hostname);
    queue.push({ url: parsed.href, depth: 0 });
  }

  const maxPages = clampNumber(job.max_pages, 1, 48, 12);
  const maxDepth = clampNumber(job.max_depth, 0, 3, 1);

  while (queue.length && sources.length < maxPages) {
    const current = queue.shift();
    const parsed = normalizeWebUrl(current.url);
    if (!parsed) continue;
    const normalized = parsed.href;
    if (seen.has(normalized)) continue;
    if (allowedDomains.size && !allowedDomains.has(parsed.hostname)) continue;
    seen.add(normalized);

    const fetched = await fetchPublicPage(normalized);
    if (!fetched) continue;
    const source = {
      id: createId("source"),
      url: normalized,
      domain: parsed.hostname,
      title: fetched.title,
      description: fetched.description,
      excerpt: fetched.excerpt,
      word_count: fetched.wordCount,
      content_type: fetched.contentType,
      source_type: fetched.sourceType,
      depth: current.depth,
      fetched_at: new Date().toISOString(),
      links: fetched.links.slice(0, 24)
    };
    sources.push(source);

    if (current.depth < maxDepth) {
      for (const link of fetched.links) {
        const next = normalizeWebUrl(link, normalized);
        if (!next) continue;
        if (seen.has(next.href)) continue;
        if (allowedDomains.size && !allowedDomains.has(next.hostname)) continue;
        queue.push({ url: next.href, depth: current.depth + 1 });
      }
    }
  }

  return { sources };
}

async function discoverUrlsFromSearch(job) {
  const queries = uniqueList([
    ...(job.discovery_queries || []),
    job.topic,
    job.objective
  ].filter(Boolean)).slice(0, 4);
  if (!queries.length) return [];

  const results = [];
  for (const query of queries) {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${query} ${job.topic}`.trim())}`;
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 Erleuchtung Training Bot",
          accept: "text/html,application/xhtml+xml"
        },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) continue;
      const html = await response.text();
      const links = extractSearchResultLinks(html);
      results.push(...links);
    } catch {
      continue;
    }
  }
  return uniqueList(results);
}

function extractSearchResultLinks(html) {
  const links = [];
  const linkPattern = /<a[^>]+class="[^"]*(result__a|result-link)[^"]*"[^>]+href="([^"]+)"/gi;
  let match;
  while ((match = linkPattern.exec(html))) {
    const href = decodeHtml(match[2]);
    if (/^https?:\/\//i.test(href)) links.push(href);
  }
  return links;
}

async function fetchPublicPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 Erleuchtung Training Bot",
        accept: "text/html,application/xhtml+xml,application/xml,text/plain,*/*"
      },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    const sourceType = contentType.includes("xml") ? "feed" : contentType.includes("html") ? "html" : "document";
    const text = await response.text();
    if (!text) return null;
    const html = text.slice(0, 400000);
    const title = extractTitle(html) || new URL(url).hostname;
    const description = extractDescription(html);
    const cleanText = cleanHtmlText(html);
    const excerpt = cleanText.slice(0, 2400).trim();
    const links = extractLinks(html, url);
    const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    return {
      title,
      description,
      excerpt,
      links,
      wordCount,
      contentType,
      sourceType
    };
  } catch {
    return null;
  }
}

function extractTitle(html) {
  return decodeHtml((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim())
    || decodeHtml((html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "").trim())
    || decodeHtml((html.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "").trim());
}

function extractDescription(html) {
  return decodeHtml((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || "").trim())
    || decodeHtml((html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] || "").trim())
    || "";
}

function extractLinks(html, baseUrl) {
  const links = [];
  const pattern = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const href = match[1].trim();
    try {
      const resolved = new URL(href, baseUrl);
      if (!["http:", "https:"].includes(resolved.protocol)) continue;
      if (resolved.hash && !resolved.pathname) continue;
      links.push(resolved.href);
    } catch {
      continue;
    }
  }
  return uniqueList(links);
}

function cleanHtmlText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<\/(p|div|li|section|article|br|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
  ).trim();
}

async function buildTrainingExamples(job, sources) {
  const examples = [];
  for (const source of sources) {
    const example = await buildTrainingExample(job, source);
    if (example) examples.push(example);
  }
  return examples;
}

async function buildTrainingExample(job, source) {
  const input = [
    `Topic: ${job.topic}`,
    `Objective: ${job.objective}`,
    `Source URL: ${source.url}`,
    `Source title: ${source.title}`,
    `Source description: ${source.description || "n/a"}`,
    `Source excerpt: ${source.excerpt.slice(0, 1600)}`
  ].join("\n");

  const modelExample = await summarizeTrainingSource(job, source, input);
  if (modelExample) return modelExample;

  const facts = pickFacts(source.excerpt, 3);
  const output = [
    `Key facts about ${job.topic}:`,
    ...facts.map((fact) => `- ${fact}`),
    `Source: ${source.url}`
  ].join("\n");

  return {
    id: createId("example"),
    instruction: `Summarize the most relevant factual takeaways about ${job.topic} from the provided web source.`,
    input,
    output,
    source_url: source.url,
    source_title: source.title,
    topic: job.topic,
    created_at: new Date().toISOString()
  };
}

async function summarizeTrainingSource(job, source, input) {
  const model = await chooseOllamaModel();
  if (!model) return null;
  const result = await postJson(`${OLLAMA_URL}/api/chat`, {
    model,
    messages: [
      {
        role: "system",
        content: [
          "You prepare instruction-tuning examples for a research dataset.",
          "Use only the provided source content.",
          "Do not copy long passages verbatim.",
          "Return strict JSON with keys: instruction, input, output, facts."
        ].join(" ")
      },
      {
        role: "user",
        content: input
      }
    ],
    stream: false,
    options: {
      temperature: 0.2,
      num_ctx: 8192
    }
  }, 120000);
  const text = result?.message?.content?.trim();
  if (!text) return null;
  const parsed = parseModelJson(text);
  if (!parsed) return null;
  return {
    id: createId("example"),
    instruction: String(parsed.instruction || `Summarize the most relevant factual takeaways about ${job.topic} from the provided web source.`),
    input: String(parsed.input || input),
    output: String(parsed.output || "").trim() || `Source: ${source.url}`,
    source_url: source.url,
    source_title: source.title,
    topic: job.topic,
    facts: Array.isArray(parsed.facts) ? parsed.facts.slice(0, 6) : [],
    created_at: new Date().toISOString()
  };
}

function parseModelJson(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i)?.[1];
    if (!fenced) return null;
    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

async function writeTrainingPackage(job) {
  const slug = safeSlug(`${job.topic}-${job.id}`);
  const packageDir = join(ROOT, "exports", "training", slug);
  await mkdir(packageDir, { recursive: true });

  const manifest = {
    id: job.id,
    topic: job.topic,
    objective: job.objective,
    base_model: job.base_model,
    source_count: job.sources?.length || 0,
    example_count: job.examples?.length || 0,
    created_at: job.created_at,
    updated_at: new Date().toISOString(),
    files: [
      "README.md",
      "manifest.json",
      "sources.json",
      "dataset.jsonl",
      "hf-train.py",
      "launch-hf-job.md",
      "train-axolotl.yaml",
      "train-ollama.md"
    ]
  };

  const files = {
    "README.md": renderTrainingReadme(job, manifest),
    "manifest.json": JSON.stringify(manifest, null, 2),
    "sources.json": JSON.stringify(job.sources || [], null, 2),
    "dataset.jsonl": (job.examples || []).map((item) => JSON.stringify(item)).join("\n") + (job.examples?.length ? "\n" : ""),
    "hf-train.py": renderHfTrainingScript(job, manifest),
    "launch-hf-job.md": renderHfLaunchNotes(job, manifest),
    "train-axolotl.yaml": renderAxolotlConfig(job, manifest),
    "train-ollama.md": renderOllamaTrainingNotes(job, manifest)
  };

  for (const [file, content] of Object.entries(files)) {
    await writeFile(join(packageDir, file), content, "utf8");
  }

  const zipPath = join(ROOT, "exports", `${slug}.zip`);
  await writeFile(zipPath, createZip(files));

  const bytes = Object.values(files).reduce((sum, value) => sum + Buffer.byteLength(String(value), "utf8"), 0);
  return {
    dir: packageDir,
    zip: zipPath,
    url: `/exports/${slug}.zip`,
    folder_url: `/exports/training/${slug}`,
    bytes,
    files: Object.keys(files)
  };
}

function renderTrainingReadme(job, manifest) {
  return `# Training Package: ${job.topic}

Objective: ${job.objective}

Base model: ${job.base_model}

This package was generated from public web sources that were explicitly seeded or discovered from public search results.

## Contents
- ${manifest.files.join("\n- ")}

## Recommended next step
Run the dataset through your preferred fine-tuning stack:
- Axolotl for LoRA / QLoRA
- Unsloth for faster local training
- Hugging Face Jobs for cloud GPU training

## Safety notes
- Only use public, allowed, and license-compatible sources.
- Review the dataset before training.
- Remove any sensitive, copyrighted, or policy-restricted material.
`;
}

function renderAxolotlConfig(job, manifest) {
  return `base_model: ${job.base_model}
data_path: dataset.jsonl
output_dir: ./output/${safeSlug(job.topic)}
load_in_4bit: true
bf16: true
micro_batch_size: 2
gradient_accumulation_steps: 8
num_epochs: 3
learning_rate: 0.0002
cutoff_len: 4096
dataset_prepared_path: ./prepared
adapter: lora
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
sample_packing: true
wandb_project: ${safeSlug(job.topic)}
notes: ${manifest.id}
`;
}

function renderOllamaTrainingNotes(job, manifest) {
  return `# Ollama Training Notes

Ollama itself is not a training framework. Use this dataset with a separate fine-tuning pipeline, then import the resulting adapter or model.

Suggested workflow:
1. Review \`dataset.jsonl\`.
2. Train with Axolotl, Unsloth, or Hugging Face Jobs.
3. Export the resulting model or adapter.
4. Create an Ollama \`Modelfile\` for local serving.

Package id: ${manifest.id}
Topic: ${job.topic}
`;
}

function renderHfLaunchNotes(job, manifest) {
  const datasetRepo = buildDatasetRepoId(job);
  const modelRepo = buildModelRepoId(job);
  return `# Hugging Face Jobs Launch Notes

Dataset repo:
\`\`\`text
${datasetRepo}
\`\`\`

Model repo:
\`\`\`text
${modelRepo}
\`\`\`

Suggested job settings:
- flavor: ${job.hf_flavor}
- timeout: ${job.hf_timeout}
- private dataset: ${job.hf_private_dataset ? "yes" : "no"}
- private model: ${job.hf_private_model ? "yes" : "no"}

This package includes \`hf-train.py\`, which the job can execute after the dataset repo upload.
Manifest id: ${manifest.id}
`;
}

function renderHfTrainingScript(job, manifest) {
  const targetModules = [
    "q_proj",
    "k_proj",
    "v_proj",
    "o_proj",
    "gate_proj",
    "up_proj",
    "down_proj"
  ];
  return `import json
import os
from pathlib import Path

import torch
from datasets import load_dataset
from huggingface_hub import HfApi, snapshot_download
from peft import LoraConfig, TaskType, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer, DataCollatorForLanguageModeling, Trainer, TrainingArguments

DATASET_REPO = os.environ["TRAINING_DATASET_REPO"]
MODEL_REPO = os.environ["TRAINING_OUTPUT_REPO"]
BASE_MODEL = os.environ["TRAINING_BASE_MODEL"]
JOB_ID = os.environ.get("TRAINING_JOB_ID", "${manifest.id}")
TOKEN = os.environ.get("HF_TOKEN")
PRIVATE_MODEL = os.environ.get("TRAINING_PRIVATE_MODEL", "true").lower() == "true"
OUTPUT_DIR = Path("/tmp") / f"nemesis-{JOB_ID}"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def build_text(example):
    instruction = str(example.get("instruction", "")).strip()
    input_text = str(example.get("input", "")).strip()
    output_text = str(example.get("output", "")).strip()
    parts = [f"### Instruction\\n{instruction}"]
    if input_text:
        parts.append(f"### Input\\n{input_text}")
    parts.append(f"### Response\\n{output_text}")
    return {"text": "\\n\\n".join(parts)}

def tokenize(tokenizer, batch):
    return tokenizer(batch["text"], truncation=True, max_length=2048)

def find_target_modules(model):
    wanted = {${JSON.stringify(targetModules).slice(1, -1)}}
    found = []
    for name, _module in model.named_modules():
        leaf = name.rsplit(".", 1)[-1]
        if leaf in wanted and leaf not in found:
            found.append(leaf)
    return found or ["q_proj", "v_proj"]

def main():
    print(f"Training job: {JOB_ID}")
    dataset_dir = snapshot_download(repo_id=DATASET_REPO, repo_type="dataset", token=TOKEN)
    dataset_file = Path(dataset_dir) / "dataset.jsonl"
    if not dataset_file.exists():
        raise FileNotFoundError(f"Missing dataset.jsonl in {dataset_dir}")

    dataset = load_dataset("json", data_files=str(dataset_file), split="train")
    dataset = dataset.map(build_text)

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, token=TOKEN, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        token=TOKEN,
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    )
    model.config.use_cache = False
    model.gradient_checkpointing_enable()

    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        task_type=TaskType.CAUSAL_LM,
        target_modules=find_target_modules(model),
    )
    model = get_peft_model(model, lora_config)

    tokenized = dataset.map(lambda batch: tokenize(tokenizer, batch), batched=True, remove_columns=dataset.column_names)
    collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    args = TrainingArguments(
        output_dir=str(OUTPUT_DIR),
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        num_train_epochs=1,
        logging_steps=5,
        save_strategy="epoch",
        report_to="none",
        bf16=torch.cuda.is_available(),
        fp16=False,
        remove_unused_columns=False,
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=tokenized,
        data_collator=collator,
    )
    trainer.train()
    trainer.save_model(str(OUTPUT_DIR))
    tokenizer.save_pretrained(str(OUTPUT_DIR))

    api = HfApi(token=TOKEN)
    api.create_repo(repo_id=MODEL_REPO, repo_type="model", private=PRIVATE_MODEL, exist_ok=True)
    api.upload_folder(
        repo_id=MODEL_REPO,
        repo_type="model",
        folder_path=str(OUTPUT_DIR),
        path_in_repo=".",
        commit_message=f"Erleuchtung training output for {JOB_ID}",
    )
    print(json.dumps({
        "job_id": JOB_ID,
        "dataset_repo": DATASET_REPO,
        "model_repo": MODEL_REPO,
        "output_dir": str(OUTPUT_DIR),
        "status": "complete",
    }, indent=2))

if __name__ == "__main__":
    main()
`;
}

async function launchHuggingFaceTrainingJob(job, options = {}) {
  const workingJob = job.package?.dir ? { ...job } : await runTrainingPipeline(job, options);
  try {
    if (!workingJob.package?.dir) {
      throw new Error("Training package is missing. Run the local preparation step first.");
    }

    const packageDir = workingJob.package.dir;
    const datasetRepo = buildDatasetRepoId(workingJob);
    const modelRepo = buildModelRepoId(workingJob);
    const repoPrivate = workingJob.hf_private_dataset !== false;
    const modelPrivate = workingJob.hf_private_model !== false;
    const cliToken = HF_TOKEN || "";
    const hfArgsBase = cliToken ? ["--token", cliToken] : [];

    workingJob.logs = [...(workingJob.logs || []), logLine("Preparing Hugging Face dataset repo")];
    await runHfCli([
      "repo", "create", datasetRepo,
      "--repo-type", "dataset",
      ...(repoPrivate ? ["--private"] : []),
      "--exist-ok",
      ...hfArgsBase
    ]);

    await runHfCli([
      "upload",
      datasetRepo,
      packageDir,
      "--repo-type", "dataset",
      "--commit-message", `Erleuchtung dataset package for ${workingJob.topic}`,
      "--quiet",
      ...hfArgsBase
    ]);

    const command = buildHfJobCommand(workingJob, datasetRepo, modelRepo);
    const submission = await runHfCli([
      "jobs", "run",
      "--flavor", workingJob.hf_flavor || HF_JOBS_FLAVOR,
      "--timeout", workingJob.hf_timeout || HF_JOBS_TIMEOUT,
      ...(workingJob.hf_namespace ? ["--namespace", workingJob.hf_namespace] : HF_JOBS_NAMESPACE ? ["--namespace", HF_JOBS_NAMESPACE] : []),
      "--env", `TRAINING_DATASET_REPO=${datasetRepo}`,
      "--env", `TRAINING_OUTPUT_REPO=${modelRepo}`,
      "--env", `TRAINING_BASE_MODEL=${workingJob.base_model}`,
      "--env", `TRAINING_JOB_ID=${workingJob.id}`,
      "--env", `TRAINING_PRIVATE_MODEL=${modelPrivate ? "true" : "false"}`,
      "--secrets", "HF_TOKEN",
      ...(cliToken ? ["--token", cliToken] : []),
      "pytorch/pytorch:2.5.1-cuda12.1-cudnn9-runtime",
      "bash",
      "-lc",
      command
    ]);

    const parsed = parseHfJobSubmission(submission.stdout || submission.stderr || "");
    const updatedAt = new Date().toISOString();
    workingJob.hf = {
      ...(workingJob.hf || {}),
      dataset_repo: datasetRepo,
      model_repo: modelRepo,
      job_id: parsed.jobId || workingJob.hf?.job_id || "",
      job_url: parsed.jobUrl || workingJob.hf?.job_url || "",
      status: parsed.jobId ? "submitted" : "submission-unknown",
      launched_at: updatedAt,
      launch_command: command,
      upload_status: "dataset uploaded"
    };
    workingJob.status = "running";
    workingJob.phase = "submitted to Hugging Face Jobs";
    workingJob.progress = Math.max(workingJob.progress || 0, 95);
    workingJob.updated_at = updatedAt;
    workingJob.logs = [...(workingJob.logs || []), logLine(`HF dataset repo: ${datasetRepo}`, updatedAt), logLine(`HF model repo: ${modelRepo}`, updatedAt), logLine(`HF job: ${workingJob.hf.job_id || "pending"}`, updatedAt)];
    return workingJob;
  } catch (error) {
    const failedAt = new Date().toISOString();
    workingJob.status = "failed";
    workingJob.phase = "hugging face launch failed";
    workingJob.last_error = error.message;
    workingJob.updated_at = failedAt;
    workingJob.logs = [...(workingJob.logs || []), logLine(`HF launch failed: ${error.message}`, failedAt)];
    return workingJob;
  }
}

function buildDatasetRepoId(job) {
  const prefix = job.hf_namespace || HF_JOBS_NAMESPACE || "";
  const repoName = `nemesis-${safeSlug(job.topic)}-${shortJobSuffix(job.id)}-dataset`;
  return prefix ? `${prefix}/${repoName}` : repoName;
}

function buildModelRepoId(job) {
  const prefix = job.hf_namespace || HF_JOBS_NAMESPACE || "";
  const repoName = `nemesis-${safeSlug(job.topic)}-${shortJobSuffix(job.id)}-model`;
  return prefix ? `${prefix}/${repoName}` : repoName;
}

function shortJobSuffix(jobId) {
  return String(jobId || "").replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase() || String(Date.now()).slice(-8);
}

function buildHfJobCommand(job, datasetRepo, modelRepo) {
  return [
    "python -m pip install --no-cache-dir datasets transformers peft accelerate huggingface_hub safetensors",
    "python - <<'PY'",
    "import os, subprocess",
    "from huggingface_hub import hf_hub_download",
    "token = os.environ.get('HF_TOKEN')",
    "repo = os.environ['TRAINING_DATASET_REPO']",
    "script = hf_hub_download(repo_id=repo, repo_type='dataset', filename='hf-train.py', token=token)",
    "subprocess.check_call(['python', script])",
    "PY"
  ].join("\n");
}

function parseHfJobSubmission(text) {
  const jobId = text.match(/Job started with ID:\s*([a-f0-9]+)/i)?.[1] || text.match(/jobs\/[^\s/]+\/([a-f0-9]+)/i)?.[1] || "";
  const jobUrl = text.match(/View at:\s*(https:\/\/\S+)/i)?.[1] || "";
  return { jobId, jobUrl };
}

async function runHfCli(args) {
  return await execFileAsync("hf", args, {
    cwd: ROOT,
    windowsHide: true,
    timeout: 1200000,
    maxBuffer: 1024 * 1024 * 8,
    encoding: "utf8"
  });
}

function logLine(message, timestamp = new Date().toISOString()) {
  return `${timestamp} - ${message}`;
}

function normalizeWebUrl(value, base = "") {
  if (!value) return null;
  try {
    const parsed = new URL(String(value).trim(), base || undefined);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    parsed.hash = "";
    return parsed;
  } catch {
    return null;
  }
}

function normalizeUrlList(value) {
  return normalizeList(value)
    .map((item) => normalizeWebUrl(item))
    .filter(Boolean)
    .map((item) => item.href);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeList(item));
  }
  return String(value || "")
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

function pickFacts(text, count = 3) {
  const sentences = String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 40);
  const selected = sentences.slice(0, count);
  if (selected.length) return selected;
  const words = String(text || "").split(/\s+/).filter(Boolean).slice(0, 30).join(" ");
  return words ? [words] : ["No textual evidence extracted from source excerpt."];
}

function decodeHtml(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#039;", "'");
}
