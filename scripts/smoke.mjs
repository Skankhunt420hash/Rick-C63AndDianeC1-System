import { spawn } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const PORT = Number(process.env.SMOKE_PORT || 8790);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DB_PATH = join(process.cwd(), "data", "erleuchtung-db.json");

let server;
let browser;
let dbSnapshot = null;
const pageErrors = [];
const generatedDirs = [];
const workspaceDirs = [];

try {
  dbSnapshot = await readFile(DB_PATH, "utf8").catch(() => null);
  server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));

  await waitForHealth();

  browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${BASE_URL}/#home`, { waitUntil: "networkidle" });
  await page.getByText("Empire Production Line", { exact: true }).waitFor();
  if (await page.locator(".workflow-command-card").count() !== 6) {
    throw new Error("Empire Production Line does not contain all six workflow steps.");
  }
  for (const route of ["chat", "reports", "blueprint", "workspace", "empire", "training", "audit", "legal", "home"]) {
    await page.locator(`.top-nav [data-route="${route}"]`).click();
    await page.waitForURL(`**/#${route}`);
  }

  await page.locator('.top-nav [data-route="blueprint"]').click();
  await page.getByText("Choose what this blueprint should become", { exact: true }).waitFor();
  await page.getByRole("button", { name: /VR Experience/ }).click();
  await page.locator('.capability-card.selected[data-build-target="vr-game"]').waitFor();
  await page.getByText(/Delivery target: VR Experience/).waitFor();
  await page.locator('.top-nav [data-route="home"]').click();

  await page.locator("#targetText").fill('<img src=x onerror="window.__smokeXss=true"> release audit');
  await page.getByRole("button", { name: "Analyze Target" }).click();
  await page.waitForURL("**/#chat", { timeout: 10000 }).catch(async () => {
    const diagnostic = await page.evaluate(() => ({
      hash: location.hash,
      toast: document.querySelector("#toast")?.textContent || ""
    }));
    throw new Error(`Analysis flow did not open chat: ${JSON.stringify(diagnostic)}; page errors: ${pageErrors.join(" | ")}`);
  });
  await page.getByRole("button", { name: "Reports" }).click();
  await page.waitForURL("**/#reports");
  if (await page.evaluate(() => Boolean(window.__smokeXss))) {
    throw new Error("User input executed as HTML.");
  }

  await page.getByRole("button", { name: "Audit" }).click();
  await page.waitForURL("**/#audit");
  await page.getByText("Project Audit", { exact: true }).waitFor();
  await page.getByText("project readiness").waitFor();
  await page.getByRole("heading", { name: "What works" }).waitFor();
  await page.getByRole("heading", { name: "Risks" }).waitFor();
  await page.getByRole("heading", { name: "Missing to finish" }).waitFor();

  await page.getByRole("button", { name: "Refresh Audit" }).click();
  await page.getByText("Project audit refreshed.").waitFor();

  const health = await page.evaluate(async () => {
    const response = await fetch("/api/health");
    return response.json();
  });

  if (!health.ok || health.backend !== "node-local") {
    throw new Error(`Unexpected health response: ${JSON.stringify(health)}`);
  }

  const doctor = await page.evaluate(async () => {
    const response = await fetch("/api/doctor");
    return response.json();
  });

  if (!doctor.ok || !doctor.doctor) {
    throw new Error(`Unexpected doctor response: ${JSON.stringify(doctor)}`);
  }

  await assertApiHardening();
  const adminToken = await assertGeneratedBuilder(browser);
  await assertWorkspaceFactory(page, adminToken);
  if (pageErrors.length) throw new Error(`Browser page errors: ${pageErrors.join(" | ")}`);

  console.log("Smoke test passed: production line, workspace factory, engine scaffolds, generated app, navigation, XSS safety, audit and hardened APIs are working.");
} finally {
  if (browser) await browser.close();
  if (server) {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
  for (const dir of generatedDirs) await rm(dir, { recursive: true, force: true });
  for (const dir of workspaceDirs) await rm(dir, { recursive: true, force: true });
  if (dbSnapshot !== null) await writeFile(DB_PATH, dbSnapshot, "utf8");
}

async function assertGeneratedBuilder(activeBrowser) {
  const status = await fetch(`${BASE_URL}/api/admin/status`).then((response) => response.json());
  if (status.configured) return null;

  const password = "smoke-release-password";
  const setup = await fetch(`${BASE_URL}/api/admin/set-password`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!setup.ok) throw new Error(`Could not configure temporary smoke admin: ${setup.status}`);

  const login = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password })
  }).then((response) => response.json());
  if (!login.token) throw new Error("Temporary smoke admin login failed.");

  const response = await fetch(`${BASE_URL}/api/product/build`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": login.token },
    body: JSON.stringify({
      product: {
        name: "Smoke Generated App",
        slug: "smoke-generated-app",
        pitch: "Release verification product.",
        type: "Web App",
        deliveryLevel: "Buildable now",
        buildTarget: { label: "Web App", output: "Working responsive web app + ZIP" },
        versions: [{ name: "MVP", summary: "Smoke test" }],
        modules: ["Input", "Builder", "Export"],
        pages: ["Dashboard", "Builder"],
        buildPhases: ["Generate", "Verify", "Export"]
      }
    })
  }).then((result) => result.json());
  if (!response.build?.url || !response.build?.dir) throw new Error("Generated builder did not return a working build.");
  generatedDirs.push(response.build.dir);

  const generatedPage = await activeBrowser.newPage();
  generatedPage.on("pageerror", (error) => pageErrors.push(`generated app: ${error.message}`));
  await generatedPage.goto(`${BASE_URL}${response.build.url}`, { waitUntil: "networkidle" });
  await generatedPage.getByRole("heading", { name: "Smoke Generated App" }).waitFor();
  await generatedPage.locator("#note").fill('<img src=x onerror="window.__generatedXss=true">');
  await generatedPage.getByRole("button", { name: "Add Note" }).click();
  if (await generatedPage.evaluate(() => Boolean(window.__generatedXss))) {
    throw new Error("Generated app executed a saved note as HTML.");
  }
  await generatedPage.close();
  return login.token;
}

async function assertWorkspaceFactory(page, adminToken) {
  const unauthorized = await fetch(`${BASE_URL}/api/workspaces`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Unauthorized Workspace", adapter: "web-pwa" })
  });
  if (unauthorized.status !== 403) throw new Error(`Unauthorized workspace creation returned ${unauthorized.status}, expected 403.`);
  if (!adminToken) return;

  const blueprintId = `smoke-blueprint-${Date.now()}`;
  const projectId = `smoke-project-${Date.now()}`;
  const sync = await fetch(`${BASE_URL}/api/db/sync`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify({ db: {
      blueprints: [{ id: blueprintId, project_name: "Linked Smoke Product", tagline: "Blueprint flows into workspace", features: ["Evidence-backed feature"], frontend_pages: ["Evidence Board"] }],
      empireProjects: [{ id: projectId, blueprint_id: blueprintId, name: "Linked Smoke Project" }]
    } })
  });
  if (!sync.ok) throw new Error(`Admin project sync failed: ${sync.status}`);

  const create = await fetch(`${BASE_URL}/api/workspaces`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify({ name: "Smoke Workspace", adapter: "web-pwa", project_id: projectId })
  }).then((response) => response.json());
  if (!create.workspace?.id || !create.workspace?.slug) throw new Error(`Workspace creation failed: ${JSON.stringify(create)}`);
  workspaceDirs.push(join(process.cwd(), "generated", "workspaces", create.workspace.slug));
  const workspaceId = create.workspace.id;

  const detail = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}`).then((response) => response.json());
  if (!detail.tree?.some((item) => item.path === "src/app.js")) throw new Error("Workspace file tree is missing src/app.js.");
  if (!detail.workspace?.readiness?.checks?.length || !detail.workspace.preview_url) throw new Error("Workspace readiness or preview URL is missing.");
  const preview = await fetch(`${BASE_URL}${detail.workspace.preview_url}`);
  if (!preview.ok || !(await preview.text()).includes("Smoke Workspace")) throw new Error("Contained workspace preview did not render.");
  const previewEscape = await fetch(`${BASE_URL}/workspace-previews/${workspaceId}/../factory.manifest.json`);
  if (previewEscape.status !== 404) throw new Error(`Workspace preview traversal returned ${previewEscape.status}, expected 404.`);

  const file = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/file?path=${encodeURIComponent("src/app.js")}`).then((response) => response.json());
  if (!file.content?.includes("workspaceStatus")) throw new Error("Workspace file read did not return starter content.");
  const spec = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/file?path=${encodeURIComponent("product.spec.json")}`).then((response) => response.json());
  if (!spec.content?.includes("Evidence-backed feature") || !spec.content?.includes("Evidence Board")) throw new Error("Linked blueprint did not flow into product.spec.json.");

  const write = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/file`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify({ path: "src/app.js", content: file.content.replace("ready: true", "ready: true") })
  });
  if (!write.ok) throw new Error(`Workspace file write failed: ${write.status}`);

  for (const command of ["syntax", "check", "test", "build-inspect"]) {
    const response = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/run`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": adminToken },
      body: JSON.stringify({ command })
    }).then((result) => result.json());
    if (response.run?.status !== "passed") throw new Error(`Workspace ${command} did not pass: ${JSON.stringify(response)}`);
  }

  const arbitrary = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/run`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify({ command: "powershell -Command whoami" })
  });
  if (arbitrary.status !== 400) throw new Error(`Arbitrary workspace command returned ${arbitrary.status}, expected 400.`);

  for (const path of ["../server.js", ".env", "secrets/token.txt"]) {
    const response = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/file?path=${encodeURIComponent(path)}`);
    if (![400, 403].includes(response.status)) throw new Error(`Unsafe workspace path ${path} returned ${response.status}.`);
  }

  const adapterFiles = {
    desktop: "adapters/desktop.md",
    "native-mobile": "adapters/mobile.md",
    godot: "godot/project.godot",
    vr: "adapters/vr.md"
  };
  for (const [adapter, expectedFile] of Object.entries(adapterFiles)) {
    const adapterWorkspace = await fetch(`${BASE_URL}/api/workspaces`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": adminToken },
      body: JSON.stringify({ name: `Smoke ${adapter}`, adapter })
    }).then((response) => response.json());
    workspaceDirs.push(join(process.cwd(), "generated", "workspaces", adapterWorkspace.workspace.slug));
    const adapterDetail = await fetch(`${BASE_URL}/api/workspaces/${adapterWorkspace.workspace.id}`).then((response) => response.json());
    if (!adapterDetail.tree?.some((item) => item.path === expectedFile)) throw new Error(`${adapter} adapter is missing ${expectedFile}.`);
    if (!adapterDetail.workspace?.limits?.length || adapterDetail.workspace.adapter_status === "starter-ready") {
      throw new Error(`${adapter} adapter did not report its honest scaffold limits.`);
    }
  }

  await page.reload({ waitUntil: "networkidle" });
  await page.locator('.top-nav [data-route="workspace"]').click();
  await page.getByRole("heading", { name: "Coding Workspace" }).waitFor();
  await page.getByRole("button", { name: /Smoke Workspace Web \/ PWA/ }).click();
  await page.getByRole("heading", { name: "Smoke Workspace", exact: true }).waitFor();
  await page.getByText("Web / PWA / verified", { exact: true }).waitFor();
}

async function assertApiHardening() {
  for (const path of ["/server.js", "/data/erleuchtung-db.json", "/package.json"]) {
    const response = await fetch(`${BASE_URL}${path}`);
    if (response.status !== 404) throw new Error(`Sensitive static path exposed: ${path}`);
  }

  const dbResponse = await fetch(`${BASE_URL}/api/db`);
  const dbPayload = await dbResponse.json();
  if (!dbResponse.ok || dbPayload.db?.adminAuth) {
    throw new Error("Public database response exposed admin authentication data.");
  }

  const invalidJson = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{"
  });
  if (invalidJson.status !== 400) throw new Error(`Invalid JSON returned ${invalidJson.status}, expected 400.`);

  const emptyChat = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  if (emptyChat.status !== 400) throw new Error(`Empty chat returned ${emptyChat.status}, expected 400.`);

  const oversized = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "x".repeat(1024 * 1024 + 1) })
  });
  if (oversized.status !== 413) throw new Error(`Oversized JSON returned ${oversized.status}, expected 413.`);

  const logout = await fetch(`${BASE_URL}/api/admin/logout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  if (logout.status !== 403) throw new Error(`Unauthorized logout returned ${logout.status}, expected 403.`);

  const unauthorizedRun = await fetch(`${BASE_URL}/api/workspaces/not-a-workspace/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ command: "test" })
  });
  if (unauthorizedRun.status !== 404) throw new Error(`Unknown workspace returned ${unauthorizedRun.status}, expected 404.`);

  const privateScan = await fetch(`${BASE_URL}/api/scan`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "http://127.0.0.1:8787/" })
  });
  if (privateScan.status !== 400) throw new Error(`Private-network scan returned ${privateScan.status}, expected 400.`);

  const descriptionScan = await fetch(`${BASE_URL}/api/scan`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Collaborative AI builder with dashboard, preview and export workflow." })
  }).then((response) => response.json());
  if (!descriptionScan.scan?.evidence?.length || !descriptionScan.scan?.reusable_patterns?.length || !descriptionScan.scan?.blueprint_seed?.features?.length) {
    throw new Error(`Description scan did not return evidence-backed blueprint seed: ${JSON.stringify(descriptionScan)}`);
  }

  const unauthorizedTraining = await fetch(`${BASE_URL}/api/training/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topic: "Unauthorized training" })
  });
  if (unauthorizedTraining.status !== 403) throw new Error(`Unauthorized training creation returned ${unauthorizedTraining.status}, expected 403.`);

  for (const path of ["/api/db/sync", "/api/blueprints", "/api/empire-projects"]) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ item: { id: "unauthorized-write" } })
    });
    if (response.status !== 403) throw new Error(`Unauthorized mutation ${path} returned ${response.status}, expected 403.`);
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "msedge", headless: true });
  } catch (edgeError) {
    try {
      return await chromium.launch({ headless: true });
    } catch (chromiumError) {
      throw new Error([
        "Could not launch a Playwright browser.",
        `Edge: ${edgeError.message}`,
        `Chromium: ${chromiumError.message}`,
        "Install a supported browser or run: npx playwright install chromium"
      ].join("\n"));
    }
  }
}

async function waitForHealth() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become ready at ${BASE_URL}`);
}
