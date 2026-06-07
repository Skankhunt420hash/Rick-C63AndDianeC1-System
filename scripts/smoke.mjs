import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const PORT = Number(process.env.SMOKE_PORT || 8790);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DB_PATH = join(process.cwd(), "data", "erleuchtung-db.json");

let server;
let browser;
let dbSnapshot = null;

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

  await page.goto(`${BASE_URL}/#home`, { waitUntil: "networkidle" });
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

  console.log("Smoke test passed: audit page, refresh action and health APIs are working.");
} finally {
  if (browser) await browser.close();
  if (server) server.kill();
  if (dbSnapshot !== null) await writeFile(DB_PATH, dbSnapshot, "utf8");
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
