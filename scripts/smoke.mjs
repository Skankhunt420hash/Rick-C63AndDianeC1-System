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
  for (const route of ["chat", "reports", "blueprint", "empire", "training", "audit", "legal", "home"]) {
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
  await assertGeneratedBuilder(browser);
  if (pageErrors.length) throw new Error(`Browser page errors: ${pageErrors.join(" | ")}`);

  console.log("Smoke test passed: production line, delivery targets, generated app, navigation, analysis, XSS safety, audit and hardened APIs are working.");
} finally {
  if (browser) await browser.close();
  if (server) {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
  for (const dir of generatedDirs) await rm(dir, { recursive: true, force: true });
  if (dbSnapshot !== null) await writeFile(DB_PATH, dbSnapshot, "utf8");
}

async function assertGeneratedBuilder(activeBrowser) {
  const status = await fetch(`${BASE_URL}/api/admin/status`).then((response) => response.json());
  if (status.configured) return;

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
