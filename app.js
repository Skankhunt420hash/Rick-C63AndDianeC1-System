const BRAND = {
  shortName: "Erleuchtung",
  fullName: "Erleuchtung (Rick-C63 & Diane-Droidijana)",
  crewName: "Rick-C63 & Diane-Droidijana"
};

const STORAGE_KEY = "erleuchtung-rick-c63-diane-droidijana";

const env = {
  AI_PROVIDER: "demo",
  OPENAI_API_KEY: "",
  DATABASE_URL: "localStorage",
  SESSION_SECRET: "demo-session",
  STORAGE_BUCKET: "browser-local",
  MAX_UPLOAD_SIZE: 8 * 1024 * 1024,
  ENABLE_DEMO_MODE: true,
  APP_NAME: BRAND.fullName,
  APP_URL: location.href
};

const api = {
  available: false,
  health: null,
  doctor: null
};

const MODEL_CATALOG = [
  { id: "codex", label: "GPT-5.4 Codex", provider: "OpenAI", tier: "Pro", role: "Best coding / flagship", free: false },
  { id: "premium", label: "GPT-5.4 Mini", provider: "OpenAI", tier: "Paid", role: "Strong allrounder", free: false },
  { id: "komplex", label: "Codestral Latest", provider: "Mistral", tier: "Paid", role: "Coding specialist", free: false },
  { id: "code", label: "Qwen3 Coder", provider: "OpenRouter", tier: "Free", role: "Best free coding", free: true },
  { id: "fast", label: "Gemini 2.5 Flash Lite", provider: "Google", tier: "Free", role: "Fast free allrounder", free: true },
  { id: "oss", label: "GPT-OSS 120B", provider: "OpenRouter", tier: "Free", role: "Large free reasoning", free: true },
  { id: "laguna", label: "Laguna M.1", provider: "OpenRouter", tier: "Free", role: "Strong free builder", free: true },
  { id: "ultra", label: "Nemotron Ultra 550B", provider: "OpenRouter", tier: "Free", role: "Big free reasoning", free: true }
];

const buildTargets = [
  { id: "web-app", label: "Web App", level: "Buildable now", tone: "ready", output: "Working responsive web app + ZIP" },
  { id: "pwa", label: "PWA / Mobile Web", level: "Buildable now", tone: "ready", output: "Installable-ready web foundation + ZIP" },
  { id: "desktop", label: "Windows Desktop", level: "Launcher export", tone: "partial", output: "Web app + Windows launcher build target" },
  { id: "native-mobile", label: "Native Mobile", level: "Scaffold plan", tone: "plan", output: "Product blueprint + Capacitor/Android build plan" },
  { id: "tool", label: "Automation Tool", level: "Buildable prototype", tone: "ready", output: "Working local UI + workflow package" },
  { id: "3d-game", label: "3D Game", level: "Design scaffold", tone: "plan", output: "Game design, systems blueprint and export package" },
  { id: "vr-game", label: "VR Experience", level: "Design scaffold", tone: "plan", output: "VR interaction blueprint and export package" }
];

function buildTargetGuidance(targetId) {
  const guidance = {
    "web-app": {
      badge: "Works here now",
      tone: "ready",
      text: "Builds a working local web app immediately and can be reopened inside the generated-product flow.",
    },
    "pwa": {
      badge: "Works here now",
      tone: "ready",
      text: "Builds the same working web app with installable-web foundations; still verified locally as web first.",
    },
    "desktop": {
      badge: "Needs host/toolchain",
      tone: "partial",
      text: "Exports a desktop-oriented package honestly, but real packaged binaries depend on the target host and signing/runtime toolchain.",
    },
    "native-mobile": {
      badge: "Scaffold only",
      tone: "plan",
      text: "Creates a verified app blueprint plus editable workspace, but not a finished APK/AAB/IPA on this host. Native packaging still needs Android/iOS toolchains externally.",
    },
    "tool": {
      badge: "Works here now",
      tone: "ready",
      text: "Builds a working local automation-style UI/package that can be reopened and iterated here.",
    },
    "3d-game": {
      badge: "Design scaffold",
      tone: "plan",
      text: "Generates architecture and starter files, not a compiled game binary. Engine export must happen in the real engine toolchain.",
    },
    "vr-game": {
      badge: "Design scaffold",
      tone: "plan",
      text: "Generates VR interaction scaffolds and packaging notes, not a headset-ready build on this host.",
    }
  };
  return guidance[targetId] || guidance["web-app"];
}

const schema = {
  user: ["id", "name", "email", "plan", "created_at", "updated_at"],
  agentSession: ["id", "user_id", "agent_name", "title", "messages", "created_at", "updated_at"],
  analysisTarget: ["id", "user_id", "input_type", "url", "uploaded_file_url", "uploaded_file_name", "uploaded_file_size", "uploaded_file_type", "text_input", "title", "category", "status", "created_at", "updated_at"],
  analysisReport: ["id", "target_id", "summary", "purpose", "target_audience", "visible_features", "design_style", "business_model", "strengths", "weaknesses", "legal_risks", "do_not_copy", "legal_inspiration_points", "upgrade_opportunities", "nemesis_upgrade_idea", "suggested_names", "mvp_plan", "empire_plan", "tech_stack", "monetization", "created_at", "updated_at"],
  blueprint: ["id", "user_id", "report_id", "project_name", "tagline", "problem", "target_user", "features", "premium_features", "frontend_pages", "backend_services", "database_schema", "api_routes", "auth_requirements", "file_upload_requirements", "ai_requirements", "admin_requirements", "roadmap", "test_plan", "deployment_plan", "created_at", "updated_at"],
  empireProject: ["id", "user_id", "blueprint_id", "name", "description", "status", "priority", "difficulty_score", "monetization_score", "legal_safety_score", "next_step", "created_at", "updated_at"],
  trainingJob: ["id", "topic", "objective", "base_model", "seed_urls", "allowed_domains", "discovery_queries", "max_pages", "max_depth", "output_format", "dataset_style", "auto_discover", "hf_namespace", "hf_flavor", "hf_timeout", "hf_private_dataset", "hf_private_model", "launch_on_hf", "status", "phase", "progress", "stats", "package", "sources", "examples", "logs", "hf", "last_error", "created_at", "updated_at", "started_at", "finished_at"],
  codingWorkspace: ["id", "project_id", "name", "slug", "adapter", "adapter_status", "status", "last_run_id", "created_at", "updated_at"]
};

const defaultState = {
  user: {
    id: "user_elija_demo",
    name: "Elija",
    email: "elija@nemesis.local",
    plan: "Erleuchtung Demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  sessions: [],
  targets: [],
  reports: [],
  blueprints: [],
  empireProjects: [],
  trainingJobs: [],
  workspaces: [],
  memories: [],
  chatMode: "plan",
  planningNotes: [],
  blueprintVersions: [],
  currentReportId: null,
  currentBlueprintId: null,
  currentTrainingJobId: null,
  currentWorkspaceId: null,
  currentWorkspaceFile: "",
  projectAudit: null,
  builderTarget: "web-app",
  selectedMainModel: "codex",
  selectedCodingModel: "codex",
  adminSecurity: {
    configured: false,
    token: "",
    expires_at: ""
  }
};

let state = loadState();
let shouldPersistBootCleanup = false;
if (state.adminSecurity?.expires_at) {
  const expiry = Date.parse(state.adminSecurity.expires_at);
  if (Number.isFinite(expiry) && expiry <= Date.now()) {
    state.adminSecurity.token = "";
    state.adminSecurity.expires_at = "";
    clearAdminProtectedState();
    shouldPersistBootCleanup = true;
  }
}
if (shouldPersistBootCleanup) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
let previewObjectUrl = "";

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  seedIfEmpty();
  wireEvents();
  updateAdminButtonLabel();
  routeTo(location.hash.replace("#", "") || "home");
  renderAll();
  greetRick();
  initializeBackend();
});

function cacheElements() {
  Object.assign(els, {
    pages: [...document.querySelectorAll(".page")],
    navLinks: [...document.querySelectorAll(".nav-link")],
    analysisForm: document.querySelector("#analysisForm"),
    targetUrl: document.querySelector("#targetUrl"),
    targetFile: document.querySelector("#targetFile"),
    targetText: document.querySelector("#targetText"),
    analysisType: document.querySelector("#analysisType"),
    previewArea: document.querySelector("#previewArea"),
    recentAnalyses: document.querySelector("#recentAnalyses"),
    savedProjects: document.querySelector("#savedProjects"),
    contextPanel: document.querySelector("#contextPanel"),
    planningBoard: document.querySelector("#planningBoard"),
    chatMessages: document.querySelector("#chatMessages"),
    chatForm: document.querySelector("#chatForm"),
    chatInput: document.querySelector("#chatInput"),
    actionCards: document.querySelector("#actionCards"),
    reportsGrid: document.querySelector("#reportsGrid"),
    blueprintDetail: document.querySelector("#blueprintDetail"),
    projectFlow: document.querySelector("#projectFlow"),
    workflowCommandDeck: document.querySelector("#workflowCommandDeck"),
    capabilityMatrix: document.querySelector("#capabilityMatrix"),
    rickSuggestions: document.querySelector("#rickSuggestions"),
    builderSettings: document.querySelector("#builderSettings"),
    blueprintEditor: document.querySelector("#blueprintEditor"),
    builderOutput: document.querySelector("#builderOutput"),
    taskList: document.querySelector("#taskList"),
    trainingForm: document.querySelector("#trainingForm"),
    trainingTopic: document.querySelector("#trainingTopic"),
    trainingObjective: document.querySelector("#trainingObjective"),
    trainingSeeds: document.querySelector("#trainingSeeds"),
    trainingDomains: document.querySelector("#trainingDomains"),
    trainingPages: document.querySelector("#trainingPages"),
    trainingDepth: document.querySelector("#trainingDepth"),
    trainingModel: document.querySelector("#trainingModel"),
    trainingNamespace: document.querySelector("#trainingNamespace"),
    trainingFlavor: document.querySelector("#trainingFlavor"),
    trainingAutoDiscover: document.querySelector("#trainingAutoDiscover"),
    trainingPrivateDataset: document.querySelector("#trainingPrivateDataset"),
    trainingPrivateModel: document.querySelector("#trainingPrivateModel"),
    trainingLaunchHf: document.querySelector("#trainingLaunchHf"),
    trainingStatus: document.querySelector("#trainingStatus"),
    trainingJobs: document.querySelector("#trainingJobs"),
    trainingRefreshButton: document.querySelector("#trainingRefreshButton"),
    workspaceCreateForm: document.querySelector("#workspaceCreateForm"),
    workspaceName: document.querySelector("#workspaceName"),
    workspaceProject: document.querySelector("#workspaceProject"),
    workspaceAdapter: document.querySelector("#workspaceAdapter"),
    workspaceList: document.querySelector("#workspaceList"),
    workspaceOverview: document.querySelector("#workspaceOverview"),
    workspaceTree: document.querySelector("#workspaceTree"),
    workspaceFileLabel: document.querySelector("#workspaceFileLabel"),
    workspaceEditor: document.querySelector("#workspaceEditor"),
    workspaceSaveFile: document.querySelector("#workspaceSaveFile"),
    workspacePreviewButton: document.querySelector("#workspacePreviewButton"),
    workspaceRuns: document.querySelector("#workspaceRuns"),
    workspaceActivity: document.querySelector("#workspaceActivity"),
    auditHero: document.querySelector("#auditHero"),
    auditStats: document.querySelector("#auditStats"),
    auditFindings: document.querySelector("#auditFindings"),
    auditNextSteps: document.querySelector("#auditNextSteps"),
    refreshAuditButton: document.querySelector("#refreshAuditButton"),
    empireStats: document.querySelector("#empireStats"),
    empireProjects: document.querySelector("#empireProjects"),
    saveBlueprintButton: document.querySelector("#saveBlueprintButton"),
    exportPromptButton: document.querySelector("#exportPromptButton"),
    tasksButton: document.querySelector("#tasksButton"),
    addEmpireButton: document.querySelector("#addEmpireButton"),
    openBuilderButton: document.querySelector("#openBuilderButton"),
    connectProductButton: document.querySelector("#connectProductButton"),
    exportHubButton: document.querySelector("#exportHubButton"),
    adminAccessButton: document.querySelector("#adminAccessButton"),
    modal: document.querySelector("#modal"),
    modalTitle: document.querySelector("#modalTitle"),
    modalBody: document.querySelector("#modalBody"),
    modalClose: document.querySelector("#modalClose"),
    toast: document.querySelector("#toast"),
    resetMemoryButton: document.querySelector("#resetMemoryButton"),
    themePulseButton: document.querySelector("#themePulseButton")
  });
}

function wireEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const route = event.currentTarget.dataset.route;
      if (route) routeTo(route);
    });
  });

  document.querySelectorAll("[data-focus-input]").forEach((button) => {
    button.addEventListener("click", () => {
      routeTo("home");
      setTimeout(() => els.targetUrl.focus(), 80);
    });
  });

  els.analysisForm.addEventListener("submit", handleAnalysisSubmit);
  els.targetFile.addEventListener("change", handleFilePreview);
  els.chatForm.addEventListener("submit", handleChatSubmit);
  document.querySelectorAll("[data-chat-mode]").forEach((button) => {
    button.addEventListener("click", () => setChatMode(button.dataset.chatMode));
  });
  els.modalClose.addEventListener("click", closeModal);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });
  els.saveBlueprintButton.addEventListener("click", () => {
    const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
    state.currentBlueprintId = blueprint.id;
    snapshotBlueprint(blueprint, "Manual blueprint save");
    saveState();
    renderAll();
    toast("Blueprint saved to local Erleuchtung project memory.");
  });
  els.trainingForm?.addEventListener("submit", handleTrainingSubmit);
  els.workspaceCreateForm?.addEventListener("submit", createCodingWorkspace);
  els.workspaceSaveFile?.addEventListener("click", saveWorkspaceFile);
  els.workspacePreviewButton?.addEventListener("click", openWorkspacePreview);
  document.querySelectorAll("[data-workspace-command]").forEach((button) => {
    button.addEventListener("click", () => runWorkspaceLoop(button.dataset.workspaceCommand));
  });
  els.trainingRefreshButton?.addEventListener("click", () => {
    renderTraining();
    toast("Training jobs refreshed.");
  });
  els.refreshAuditButton?.addEventListener("click", refreshAudit);
  els.exportPromptButton.addEventListener("click", exportPrompt);
  els.tasksButton.addEventListener("click", generateTasks);
  els.addEmpireButton.addEventListener("click", addCurrentBlueprintToEmpire);
  els.openBuilderButton.addEventListener("click", generateProductBuild);
  els.connectProductButton.addEventListener("click", connectProductToPages);
  els.exportHubButton.addEventListener("click", openExportHub);
  els.adminAccessButton.addEventListener("click", openAdminAccessModal);
  els.themePulseButton.addEventListener("click", () => {
    document.body.classList.toggle("pulse-boost");
    toast("Interface pulse toggled.");
  });
  els.resetMemoryButton.addEventListener("click", refreshCurrentSession);
  window.addEventListener("hashchange", () => routeTo(location.hash.replace("#", "") || "home"));
}

function routeTo(route) {
  const targetRoute = document.querySelector(`#${route}`) ? route : "home";
  els.pages.forEach((page) => page.classList.toggle("active", page.id === targetRoute));
  els.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === targetRoute));
  if (location.hash !== `#${targetRoute}`) history.replaceState(null, "", `#${targetRoute}`);
  if (targetRoute === "blueprint" && !getCurrentBlueprint() && getCurrentReport()) {
    createBlueprintFromReport(getCurrentReport());
  }
  renderAll();
}

async function handleAnalysisSubmit(event) {
  event.preventDefault();
  const url = els.targetUrl.value.trim();
  const text = els.targetText.value.trim();
  const file = els.targetFile.files[0];
  const analysisType = els.analysisType.value;

  const validation = validateTarget({ url, text, file });
  if (!validation.ok) {
    toast(validation.message);
    return;
  }

  const inputType = determineInputType({ url, text, file, analysisType });
  const target = createTarget({ url, text, file, inputType, analysisType });
  const safety = legalSafetyCheck(`${url} ${text} ${analysisType}`);

  if (!safety.allowed) {
    addChatMessage("user", text || url || analysisType);
    addChatMessage("agent", safety.response);
    toast("Rick-C63 redirected the request to a legal path.");
    routeTo("chat");
    return;
  }

  let scan = null;
  if (api.available && (url || text)) {
    toast(url ? "Scanning public evidence safely..." : "Structuring software description...");
    const response = await apiPost("/api/scan", { url, text, analysisType });
    scan = response?.scan || null;
  }
  const report = createAnalysisReport(target, analysisType, scan);
  const blueprint = createBlueprintFromReport(report);
  const response = rickAnalysisText(report, blueprint);
  addChatMessage("user", `${analysisType}: ${target.title}`);
  addChatMessage("agent", response);
  state.currentReportId = report.id;
  state.currentBlueprintId = blueprint.id;
  saveState();
  clearInputs();
  renderAll();
  routeTo("chat");
  toast(scan ? "Evidence-backed scan, blueprint and action cards generated." : "Fallback analysis, blueprint and action cards generated.");
}

function handleFilePreview() {
  const file = els.targetFile.files[0];
  if (!file) {
    revokePreviewObjectUrl();
    els.previewArea.classList.add("hidden");
    els.previewArea.innerHTML = "";
    return;
  }
  if (file.size > env.MAX_UPLOAD_SIZE) {
    toast("File is bigger than MAX_UPLOAD_SIZE demo limit.");
    revokePreviewObjectUrl();
    els.targetFile.value = "";
    return;
  }
  revokePreviewObjectUrl();
  const url = URL.createObjectURL(file);
  previewObjectUrl = url;
  els.previewArea.innerHTML = `<img src="${url}" alt="Uploaded target preview">`;
  els.previewArea.classList.remove("hidden");
}

function handleChatSubmit(event) {
  event.preventDefault();
  const prompt = els.chatInput.value.trim();
  if (!prompt) return;
  addChatMessage("user", prompt);
  els.chatInput.value = "";

  const safety = legalSafetyCheck(prompt);
  addThinking();
  setTimeout(async () => {
    removeThinking();
    if (!safety.allowed) {
      addChatMessage("agent", safety.response);
    } else {
      const agentResult = state.chatMode === "scan" ? await askRick(prompt) : await planWithRick(prompt);
      const answer = agentResult.answer;
      addChatMessage("agent", answer);
    }
    saveState();
    renderAll();
  }, 700);
}

function setChatMode(mode) {
  state.chatMode = mode === "scan" ? "scan" : "plan";
  document.querySelectorAll("[data-chat-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.chatMode === state.chatMode);
  });
  els.chatInput.placeholder = state.chatMode === "scan"
    ? "Scan Mode: URL, Screenshot-Idee oder neue App eingeben..."
    : "Plan Mode: Sag Rick, was wir an der aktuellen App ändern oder erweitern sollen...";
  saveState();
  renderPlanningBoard();
}

function validateTarget({ url, text, file }) {
  if (!url && !text && !file) return { ok: false, message: "Add a URL, image or idea first." };
  if (url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Bad protocol");
    } catch {
      return { ok: false, message: "Use a valid public http or https URL." };
    }
  }
  if (file && !file.type.startsWith("image/")) return { ok: false, message: "Only image uploads are supported in this demo." };
  return { ok: true };
}

function determineInputType({ url, text, file, analysisType }) {
  if (url && file && text) return "Mixed input: URL + screenshot + notes";
  if (url) return "Website URL";
  if (file && analysisType.includes("Brand")) return "Brand cover";
  if (file) return "Screenshot";
  return "Text description of an app/business idea";
}

function createTarget({ url = "", text = "", file = null, inputType = "Text Idea", analysisType = "Full Erleuchtung Upgrade" }) {
  const title = guessTitle(url, text, analysisType);
  const now = new Date().toISOString();
  const target = {
    id: id("target"),
    user_id: state.user.id,
    input_type: inputType,
    url,
    uploaded_file_url: "",
    uploaded_file_name: file?.name || "",
    uploaded_file_size: file?.size || 0,
    uploaded_file_type: file?.type || "",
    text_input: text,
    title,
    category: analysisType,
    status: "Analyzed",
    created_at: now,
    updated_at: now
  };
  state.targets.unshift(target);
  return target;
}

function createAnalysisReport(target, analysisType, scan = null) {
  const now = new Date().toISOString();
  const concept = target.title;
  const metadata = scan || fetchPublicPageMetadata(target.url);
  const imageSignals = analyzeImageSignals(target);
  const textSignals = analyzeTextIdea(target.text_input || analysisType);
  const archetype = inferProductArchetype(`${target.url} ${target.text_input} ${analysisType}`);
  const ideas = generateSourceIdeas(target, archetype);
  const report = {
    id: id("report"),
    target_id: target.id,
    summary: `${concept} looks like a ${textSignals.category} in the ${archetype.label} zone: it turns a messy user intention into a guided result. ${metadata.description || ""}`,
    purpose: archetype.purpose,
    target_audience: archetype.audience,
    visible_features: uniqueList([...(scan?.blueprint_seed?.features || []), ...archetype.features, "Outcome framing", ...imageSignals]),
    design_style: archetype.design || buildDesignStyle(target.title, target.text_input),
    business_model: archetype.business || buildBusinessModel(target.title, target.text_input),
    strengths: archetype.strengths,
    weaknesses: archetype.weaknesses,
    legal_risks: ["Exact brand imitation", "Logo or name copying", "Copying protected text", "Cloning code or layout pixel-for-pixel", "Unauthorized scraping or private data access"],
    do_not_copy: ["Protected logos", "Protected names", "Exact page layout", "Source code", "Copyrighted copy", "Private data", "Access-control bypasses"],
    legal_inspiration_points: ["General workflow", "Problem category", "User journey logic", "Publicly visible feature pattern", "Business model mechanics", "Interaction principles"],
    evidence: scan?.evidence || [],
    reusable_patterns: scan?.reusable_patterns || [],
    scan_limitations: scan?.limitations || buildScanLimitations(target),
    source_scan: scan ? { id: scan.id, source_url: scan.source_url, fetched_at: scan.fetched_at, word_count: scan.word_count, legal_boundary: scan.legal_boundary } : null,
    upgrade_opportunities: ideas.upgrades,
    nemesis_upgrade_idea: ideas.nemesis,
    suggested_names: ideas.names,
    mvp_plan: ideas.mvp,
    empire_plan: ideas.empire,
    tech_stack: ideas.stack,
    monetization: ideas.money,
    created_at: now,
    updated_at: now
  };
  state.reports.unshift(report);
  state.currentReportId = report.id;
  saveState();
  return report;
}

function createBlueprintFromReport(report) {
  if (!report) return null;
  const existing = state.blueprints.find((blueprint) => blueprint.report_id === report.id);
  if (existing) {
    state.currentBlueprintId = existing.id;
    return existing;
  }
  const now = new Date().toISOString();
  const blueprint = {
    id: id("blueprint"),
    user_id: state.user.id,
    report_id: report.id,
    project_name: report.suggested_names[0] || "Erleuchtung Upgrade System",
    tagline: "Understand the mechanism. Rebuild the legal core. Generate the first software version.",
    problem: report.purpose,
    target_user: report.target_audience,
    features: uniqueList([...(report.reusable_patterns || []).map((item) => item.blueprint_feature), ...report.mvp_plan]).slice(0, 9),
    premium_features: report.empire_plan,
    frontend_pages: uniqueList([...(report.reusable_patterns || []).flatMap((item) => item.suggested_pages || []), ...buildFrontendPages(report)]).slice(0, 8),
    backend_services: buildBackendServices(report),
    database_schema: schema,
    api_routes: ["/api/targets", "/api/analyze", "/api/chat", "/api/legal-check", "/api/reports", "/api/blueprints", "/api/empire-projects", "/api/export-prompt"],
    auth_requirements: "Email/OAuth login, session cookies, user-scoped resources and role-based admin access later.",
    file_upload_requirements: "Image-only upload validation, max file size, storage bucket, virus scan hook and preview generation.",
    ai_requirements: "Runs with the embedded Local Rick-C63 Cortex first. Optional later: connect Ollama or llama.cpp for a real offline local LLM without paid external APIs.",
    admin_requirements: "User management, abuse review, project moderation, billing state and usage analytics.",
    monetization_plan: report.monetization,
    roadmap: buildRoadmap(report),
    test_plan: buildTestPlan(report),
    deployment_plan: "Static hosting for MVP, then Next.js/Node deployment with Postgres, object storage and AI provider secrets.",
    created_at: now,
    updated_at: now
  };
  state.blueprints.unshift(blueprint);
  state.currentBlueprintId = blueprint.id;
  saveState();
  return blueprint;
}

function fetchPublicPageMetadata(url) {
  if (!url) {
    return {
      source: "demo",
      title: "Idea input",
      description: "Demo metadata: no URL was provided, so Rick-C63 analyzed the idea text and selected analysis type."
    };
  }
  const parsed = new URL(url);
  return {
    source: "demo",
    title: parsed.hostname.replace(/^www\./, ""),
    description: `Demo metadata: public URL host detected as ${parsed.hostname}. A production backend would fetch allowed public title, description and preview data without bypassing access.`
  };
}

function uploadScreenshotPlaceholder(fileLabel) {
  return {
    stored: Boolean(fileLabel),
    uploaded_file_url: fileLabel,
    storage: env.STORAGE_BUCKET,
    note: fileLabel ? `Demo image attached: ${fileLabel}` : "No screenshot supplied."
  };
}

function analyzeImageSignals(target = {}) {
  const fileLabel = target.uploaded_file_name || target.uploaded_file_type || target.uploaded_file_url;
  const upload = uploadScreenshotPlaceholder(fileLabel);
  if (!upload.stored) return [];
  const extension = String(target.uploaded_file_name || "").split(".").pop()?.toLowerCase() || "image";
  const sizeKb = Math.max(1, Math.round(Number(target.uploaded_file_size || 0) / 1024));
  const type = String(target.uploaded_file_type || "").toLowerCase();
  const surface = /(phone|mobile|android|iphone)/.test(`${target.text_input || ""} ${target.uploaded_file_name || ""}`.toLowerCase())
    ? "Mobile UI reference"
    : /(dashboard|desktop|web|landing)/.test(`${target.text_input || ""} ${target.uploaded_file_name || ""}`.toLowerCase())
      ? "Desktop/web UI reference"
      : "UI screenshot reference";
  return [
    `Screenshot input attached (${extension}, ~${sizeKb} KB)`,
    surface,
    type.startsWith("image/") ? `Image file detected: ${type}` : "Image file supplied for manual UI inspiration"
  ];
}

function buildScanLimitations(target = {}) {
  const limitations = ["Fallback analysis was used; public source evidence was not fetched."];
  if (target.uploaded_file_name || target.uploaded_file_type || target.uploaded_file_url) {
    limitations.push("No real vision backend is connected yet, so screenshot semantics are inferred from filename/type/context rather than pixel-level understanding.");
  }
  return limitations;
}

function analyzeTextIdea(text) {
  const lowered = text.toLowerCase();
  let category = "value-delivery system";
  if (lowered.includes("brand")) category = "brand positioning system";
  if (lowered.includes("business") || lowered.includes("monet")) category = "business model system";
  if (lowered.includes("app") || lowered.includes("software")) category = "software product system";
  return { category, source: "demo" };
}

function localRickCortex(prompt) {
  const extractedUrl = extractUrl(prompt);
  const intent = detectIntent(prompt);
  const shouldCreateNew = Boolean(extractedUrl) || hasSourceKeyword(prompt) || intent === "new-idea" || intent === "build" || isProjectLikePrompt(prompt);
  let report = getCurrentReport();

  if (shouldCreateNew || !report) {
    const target = createTarget({
      url: extractedUrl || "",
      text: prompt,
      inputType: extractedUrl ? "Website URL from chat" : "Chat idea",
      analysisType: intent === "build" ? "Build Blueprint" : "Full Erleuchtung Upgrade"
    });
    report = createAnalysisReport(target, intent === "build" ? "Build Blueprint" : "Full Erleuchtung Upgrade");
    const newBlueprint = createBlueprintFromReport(report);
    ensureEmpireProjectForBlueprint(newBlueprint, report, "Auto-saved from Rick-C63 chat.");
  }

  const blueprint = createBlueprintFromReport(report);
  const target = state.targets.find((item) => item.id === report.target_id);
  const product = generateProductPackage(blueprint, report, prompt);
  const tactical = generateTacticalIdeas(prompt, report);
  remember(`Rick-C63 worked on ${target?.title || blueprint.project_name}: ${prompt.slice(0, 140)}`);
  state.currentReportId = report.id;
  state.currentBlueprintId = blueprint.id;
  saveState();

  if (intent === "explain-blueprint") {
    return {
      answer: `Alright Elija, kurz und sauber: Ein Blueprint ist kein komisches Business-Wort. Es ist der Bauplan deiner App.\n\nEr sagt:\n1. Welches Problem die App loest.\n2. Welche Seiten sie braucht.\n3. Welche Daten gespeichert werden.\n4. Welche API-Routen noetig sind.\n5. Welche Features zuerst gebaut werden.\n6. Wie aus der Idee eine echte Software wird.\n\nRick-C63 Uebersetzung: Blueprint = Bauzeichnung fuer Software. Ohne Blueprint baut man chaotisch. Mit Blueprint baut man wie ein Architekt.\n\nHier ist was wir daraus bauen koennen: ${blueprint.project_name}. Naechster Schritt: Klick auf Generate Software im Builder.`
    };
  }

  if (intent === "build") {
    return {
      answer: `${rickVoiceLine("build")}\n\nRick-C63 Builder Mode aktiv.\n\nIch habe aus deinem Auftrag ein ganzes Produktpaket gemacht: ${product.name}.\n\n### Das Produkt\n${product.pitch}\n\n### Die 3 Versionen\n${product.versions.map((item) => `- ${item.name}: ${item.summary}`).join("\n")}\n\n### Was verbunden werden kann\n${product.connections.map((item) => `- ${item}`).join("\n")}\n\n### Warum das funktioniert\nDas ist nicht nur eine Idee, sondern ein System: Eingabe rein, Analyse raus, Entscheidung speichern, Produktpaket erzeugen, naechsten Bauschritt starten. So baut man keine Luftschloesser, sondern Maschinen mit Strom im Keller.\n\n### Naechste 3 Smart Moves\n1. Im Builder auf Generate Software klicken.\n2. Das Produktpaket speichern und mit deinen Seiten verbinden.\n3. Danach lokalen Rick ueber Ollama anbinden, damit er wirklich lange, kluge Software-Sessions fahren kann.\n\n[Create Blueprint] [Build MVP Plan] [Add to Empire Dashboard]`
    };
  }

  return {
    answer: `${rickVoiceLine("analysis")}\n\nIch habe den Kontext verstanden: ${target?.title || "deine Idee"}.\n\n### Was ich darin sehe\n${report.summary}\n\n### 3 starke Richtungen\n${tactical.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n### Die legale Version\nWir kopieren keine Namen, Logos, Texte, Layouts oder Code. Wir nehmen nur die Mechanik: Problem erkennen, Workflow verstehen, eigene Version bauen.\n\n### Drei Versionen, damit der Kopf nicht explodiert\n- MVP: ${product.versions[0].summary}\n- Premium: ${product.versions[1].summary}\n- Empire: ${product.versions[2].summary}\n\n### Produktpaket\n${product.pitch}\n\n### Rick-C63 Gedächtnis\nIch habe dieses Projekt gespeichert. Neue URLs im Chat werden als neue Projekte angelegt; alte Projekte kannst du im Empire Dashboard wieder öffnen.\n\n[Create Blueprint] [Build MVP Plan] [Add to Empire Dashboard]`
  };
}

function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+|(?:^|\s)([a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i);
  if (!match) return "";
  const raw = match[0].trim();
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function detectIntent(text) {
  const lowered = text.toLowerCase();
  if (lowered.includes("was ist ein blueprint") || lowered.includes("blueprint") && lowered.includes("was")) return "explain-blueprint";
  if (lowered.includes("build") || lowered.includes("builder") || lowered.includes("generator") || lowered.includes("entwickel") || lowered.includes("software")) return "build";
  if (lowered.includes("neue idee") || lowered.includes("mach daraus") || lowered.includes("url")) return "new-idea";
  return "chat";
}

function hasSourceKeyword(text) {
  const lowered = text.toLowerCase();
  return ["codex", "replit", "canva", "notion", "figma", "shopify", "lovable", "base44", "github", "landing page", "website", "app"].some((key) => lowered.includes(key));
}

function isProjectLikePrompt(text) {
  const lowered = text.toLowerCase();
  const projectWords = ["ich will", "baue", "mach", "entwickle", "erstelle", "app", "software", "plattform", "dashboard", "tool", "generator", "crm", "shop", "lernen", "fitness", "musik", "video", "agentur"];
  return text.length > 28 && projectWords.some((word) => lowered.includes(word));
}

function rickVoiceLine(mode = "analysis") {
  const lines = {
    analysis: [
      "Alright Elija. Ich sehe den Motor unter der Chrom-Leiche. Keine Panik, nur Architektur.",
      "Okay, das Ding hat eine Seele aus Workflow und eine Steuererklaerung aus UX. Wir machen es besser.",
      "Ich hoere die Zahnräder klicken. Das ist kein Wunder, das ist ein System mit Make-up."
    ],
    build: [
      "Builder-Modus. Jetzt wird aus Nebel Beton. Sehr duester, sehr praktisch.",
      "Wir bauen das Ding so, dass es nicht beim ersten Sonnenlicht zerfaellt.",
      "Zeit fuer Produkt-Alchemie: weniger Gerede, mehr Maschine."
    ],
    memory: [
      "Gedächtnis aktiv. Ich vergesse nur langweilige Fehler, nicht deine Projekte.",
      "Projekt wieder im Kopf. Der mentale Keller ist dunkel, aber sortiert.",
      "Ich habe die Akte geladen. Sie hat Neonränder und vermutlich bessere Zukunftschancen als die meisten Startups."
    ]
  };
  const bucket = lines[mode] || lines.analysis;
  return bucket[Math.floor(Math.random() * bucket.length)];
}

function remember(text) {
  if (!state.memories) state.memories = [];
  const now = new Date().toISOString();
  state.memories.unshift({ id: id("memory"), text, created_at: now });
  state.memories = state.memories.slice(0, 30);
}

function inferProductArchetype(text) {
  const lowered = text.toLowerCase();
  const archetypes = [
    {
      keys: ["codex", "code", "developer", "github", "replit", "program"],
      label: "developer automation",
      purpose: "Help builders turn prompts, specs and tasks into working software with less friction.",
      audience: "Developers, solo founders, agencies and technical creators.",
      features: ["Prompt-to-task workflow", "Code/project context", "Build status", "Action buttons", "Iteration loop"],
      strengths: ["High leverage", "Clear productivity value", "Strong repeat usage", "Can become a platform"],
      weaknesses: ["Needs trust", "Must handle errors clearly", "Can become complex for beginners"],
      design: "Dense developer cockpit with terminal-like panels, live build cards, progress rails and clear error states.",
      business: "Subscription for private build agents, premium workspaces, local model setup and project export packs."
    },
    {
      keys: ["canva", "design", "brand", "logo", "visual"],
      label: "creative production",
      purpose: "Turn raw creative intent into polished assets, campaigns and reusable brand systems.",
      audience: "Creators, marketers, small businesses and brand builders.",
      features: ["Asset intake", "Style guidance", "Template generation", "Brand memory", "Export flow"],
      strengths: ["Immediate visual payoff", "Easy to understand", "Great upsell path"],
      weaknesses: ["Must avoid brand copying", "Needs strong asset organization", "Quality expectations are high"],
      design: "Visual studio interface with asset boards, palette panels, preview surfaces and polished export controls.",
      business: "Freemium creator tools, paid brand kits, campaign exports and agency team plans."
    },
    {
      keys: ["shop", "product", "landing", "sales", "ecommerce"],
      label: "conversion commerce",
      purpose: "Guide visitors from curiosity to trust to purchase using a clear value path.",
      audience: "Product sellers, SaaS founders and landing page teams.",
      features: ["Hero promise", "Benefit stack", "Social proof", "Pricing logic", "Checkout path"],
      strengths: ["Direct monetization", "Easy metrics", "Strong A/B testing potential"],
      weaknesses: ["Needs credibility", "Offer must be sharp", "Bad copy hurts conversion"],
      design: "Conversion dashboard with offer builder, proof blocks, funnel timeline and revenue-focused cards.",
      business: "SaaS subscription, revenue analytics upsell, checkout integrations and premium experiments."
    },
    {
      keys: ["learn", "course", "teach", "education", "schule"],
      label: "learning engine",
      purpose: "Transform confusing knowledge into guided steps, feedback and progress.",
      audience: "Students, self-learners, teachers and coaches.",
      features: ["Lesson flow", "Feedback loop", "Progress tracking", "Examples", "Practice tasks"],
      strengths: ["Strong retention", "Natural subscriptions", "Teaches every session"],
      weaknesses: ["Needs quality content", "Must adapt to skill levels", "Progress must feel real"],
      design: "Learning cockpit with lesson paths, skill meters, practice panels and feedback loops.",
      business: "Course subscriptions, tutor mode, school/team licenses and premium practice packs."
    }
  ];
  return archetypes.find((item) => item.keys.some((key) => lowered.includes(key))) || {
    label: "product strategy",
    purpose: "Turn a visible concept or raw idea into a legal, original and buildable product system.",
    audience: "Founders, creators, builders, agencies and operators.",
    features: ["Clear hero promise", "Guided intake", "Result cards", "Saved projects", "Next-step engine"],
    strengths: ["Fast comprehension", "Obvious next action", "Reusable workflow", "Can scale into automation"],
    weaknesses: ["Needs sharp scope", "Must avoid generic output", "Requires clear legal guardrails"],
    design: "Premium command dashboard with guided intake, result cards, project memory and build controls.",
    business: "Freemium project generation, paid builder exports, private AI workspaces and done-with-you setup."
  };
}

function generateSourceIdeas(target, archetype) {
  const baseName = titleToName(target.title || archetype.label);
  const domain = archetype.label;
  return {
    upgrades: [
      `Add a Rick-C63 idea reactor that turns every ${domain} input into 3 original product angles.`,
      "Score every concept by legal safety, difficulty, monetization and speed-to-MVP.",
      "Add a builder that produces a working generated app, not just a static plan.",
      "Save every decision to Empire memory so the project gets smarter with each session."
    ],
    nemesis: `${baseName} becomes an original AI build laboratory: the user gives a URL, screenshot or idea, Rick-C63 extracts the legal mechanism, proposes stronger versions and generates the first software blueprint.`,
    names: [`${baseName} Forge`, `${baseName} Reactor`, `${baseName} Builder`, `Erleuchtung ${baseName}`],
    mvp: [
      `${baseName} intake for URL, screenshot or idea`,
      `Rick-C63 creates a fresh ${domain} analysis`,
      "Builder generates a working app page with state, actions and export",
      "Project is saved and can be reopened from the Empire Dashboard"
    ],
    empire: [
      "Local LLM via Ollama or llama.cpp",
      "One-click project scaffolding",
      "Visual app generator",
      "User accounts and project memory",
      "Export to code workspace",
      "Automated testing and deployment checklist"
    ],
    stack: [
      "Frontend: responsive HTML/CSS/JS now, React/Next.js later",
      "Local AI: embedded rule engine now, Ollama/llama.cpp later",
      "Backend: Node/Express or Next.js API routes",
      "Database: SQLite for local MVP, Postgres for launch",
      "Storage: local files first, S3-compatible bucket later"
    ],
    money: [
      "Free local idea generator",
      "Paid project builder packs",
      "Premium local model setup service",
      "Agency build plans",
      "Empire dashboard subscription"
    ]
  };
}

function buildDesignStyle(title, text = "") {
  const archetype = inferProductArchetype(`${title} ${text}`);
  return archetype.design;
}

function buildBusinessModel(title, text = "") {
  const archetype = inferProductArchetype(`${title} ${text}`);
  return archetype.business;
}

function buildFrontendPages(report) {
  const label = inferProductArchetype(report.summary).label;
  const map = {
    "developer automation": ["Build Cockpit", "Prompt Lab", "Project Files", "Test Console", "Release Board"],
    "creative production": ["Studio Dashboard", "Asset Generator", "Brand Memory", "Campaign Board", "Export Center"],
    "conversion commerce": ["Offer Dashboard", "Funnel Builder", "Audience Lab", "Experiment Board", "Revenue Center"],
    "learning engine": ["Learning Dashboard", "Lesson Builder", "Practice Lab", "Progress Map", "Coach Panel"]
  };
  return map[label] || ["Command Dashboard", "Generator", "Project Memory", "Builder", "Settings"];
}

function buildBackendServices(report) {
  const label = inferProductArchetype(report.summary).label;
  return [
    `${label} input parser`,
    "Rick-C63 local model generation",
    "Project memory persistence",
    "Working app builder",
    "Generated product hosting",
    "Legal safety validation",
    "Export and reconnect service"
  ];
}

function buildRoadmap(report) {
  const project = report.suggested_names?.[0] || "Generated product";
  return [
    `Generate ${project} working MVP`,
    "Open generated software and test core actions",
    "Connect generated product to Empire Dashboard",
    "Add project-specific data storage",
    "Add Ollama-powered iteration loop",
    "Package for mobile/server use"
  ];
}

function buildTestPlan(report) {
  return [
    "Generated app opens without console-breaking syntax",
    "Primary buttons work and save local state",
    "Project can be reopened from Empire Dashboard",
    "Export produces product JSON",
    "Mobile layout stacks cleanly",
    "Legal safety redirect still blocks copying or hacking"
  ];
}

function buildRickSuggestions(report, blueprint) {
  const archetype = inferProductArchetype(report.summary);
  const base = titleToName(blueprint.project_name || report.suggested_names?.[0] || "Erleuchtung");
  const common = {
    legal: "Original code, original UI, no protected assets.",
    pages: blueprint.frontend_pages
  };
  if (archetype.label === "developer automation") {
    return [
      {
        id: "dev-copilot",
        label: "MVP",
        name: `${base} Dev Forge`,
        tagline: "Turn prompts into guided builds.",
        description: "A simple Codex-like builder with project memory, build steps and generated preview.",
        features: ["Prompt intake", "Rick architecture suggestions", "Generate working app", "Save and reopen projects"],
        pages: ["Build Cockpit", "Prompt Lab", "Generated App", "Project Memory"],
        roadmap: ["Name the app", "Choose feature direction", "Generate working preview", "Save/export package"]
      },
      {
        id: "dev-studio",
        label: "Premium",
        name: `${base} Studio`,
        tagline: "A private local software studio.",
        description: "A richer builder with feature backlog, test plan, export targets and Cursor/Codex handoff.",
        features: ["Backlog board", "Local LLM agent", "Preview builds", "Codex/Cursor exports"],
        pages: ["Studio Dashboard", "Feature Board", "Test Console", "Export Hub"],
        roadmap: ["Pick features", "Generate app", "Review preview", "Export to coding tool"]
      },
      {
        id: "dev-empire",
        label: "Empire",
        name: `${base} Empire Builder`,
        tagline: "From idea to product line.",
        description: "A full product factory with multi-project memory and local model loops.",
        features: ["Multi-app workspace", "Agent planning", "Generated apps", "Release pipeline"],
        pages: ["Empire Console", "Agent Room", "Product Factory", "Launch Center"],
        roadmap: ["Create product line", "Generate first app", "Iterate with Rick", "Export/deploy"]
      }
    ];
  }
  return [
    {
      id: "simple-mvp",
      label: "MVP",
      name: `${base} Launch`,
      tagline: "The clean first version.",
      description: "Small, obvious, useful. Enough to test the idea without drowning in buttons.",
      features: ["Guided intake", "Core dashboard", "Saved records", "Export summary"],
      pages: ["Dashboard", "Generator", "Saved Projects"],
      roadmap: ["Name it", "Generate preview", "Test the core action", "Save/export"]
    },
    {
      id: "premium-tool",
      label: "Premium",
      name: `${base} Pro`,
      tagline: "A polished tool people enjoy using.",
      description: "Better visuals, smoother workflow, saved history and premium controls.",
      features: ["Smart dashboard", "Project memory", "Action cards", "Export hub"],
      pages: ["Command Center", "Builder", "Memory", "Exports"],
      roadmap: ["Choose style", "Generate app", "Review preview", "Add premium flow"]
    },
    {
      id: "empire-system",
      label: "Empire",
      name: `${base} Empire`,
      tagline: "A system that can grow.",
      description: "A larger version with modules, dashboards, automation and future local agents.",
      features: ["Module system", "Automation hooks", "Local AI memory", "Launch roadmap"],
      pages: ["Empire Dashboard", "Modules", "Automation", "Launch"],
      roadmap: ["Define modules", "Generate base app", "Connect pages", "Export package"]
    }
  ].map((item) => ({ ...common, ...item }));
}

function getCurrentEmpireProject() {
  const blueprint = getCurrentBlueprint();
  if (!blueprint) return null;
  return state.empireProjects.find((project) => project.blueprint_id === blueprint.id) || null;
}

function generateTacticalIdeas(prompt, report) {
  const archetype = inferProductArchetype(`${prompt} ${report.summary}`);
  if (archetype.label === "developer automation") {
    return [
      "A local Codex-style builder that turns natural language into a complete project folder with files, routes and tests.",
      "A beginner-friendly app architect that explains every technical decision before generating code.",
      "A private offline dev companion connected to local models, so the user owns the workflow and avoids per-token costs."
    ];
  }
  if (archetype.label === "creative production") {
    return [
      "A brand-safe inspiration analyzer that creates original visual directions without copying logos or layouts.",
      "A campaign generator that turns one screenshot into 10 legal content angles.",
      "A creator dashboard that saves palettes, offers, hooks and asset tasks per project."
    ];
  }
  return [
    "A smarter intake wizard that asks only the next useful question and then generates a plan.",
    "A legal rebuild engine that shows what not to copy and what can be transformed.",
    "A software generator that turns the idea into one saved product package with pages, data models, API routes and build phases."
  ];
}

function generateProductPackage(blueprint, report, prompt = "") {
  const name = blueprint.project_name || "Erleuchtung Generated App";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "erleuchtung-app";
  const target = buildTargets.find((item) => item.id === state.builderTarget) || buildTargets[0];
  return {
    name,
    slug,
    type: target.label,
    buildTarget: target,
    deliveryLevel: target.level,
    modelSelection: {
      main: getModelById(state.selectedMainModel),
      coding: getModelById(state.selectedCodingModel)
    },
    pitch: `${name} is a saved software product concept that turns ${report.summary.toLowerCase()} Rick-C63 keeps it legal, buildable and connected to your Empire system.`,
    versions: [
      { name: "MVP", summary: blueprint.features.slice(0, 4).join(", ") },
      { name: "Premium", summary: "Accounts, project memory, saved generators, polished dashboards and exportable product packages." },
      { name: "Empire", summary: "Local LLM agent, visual builder, page connections, automated development loops and launch monitoring." }
    ],
    modules: [
      "Frontend app shell with dashboard, agent lab, generator and project pages",
      "Local Rick-C63 Cortex for offline idea generation",
      "Persistent project memory with saved reports, blueprints and product packages",
      "Legal safety layer before every risky request",
      "Product generator that creates a complete app package instead of loose files"
    ],
    data: {
      tables: Object.keys(schema),
      primaryProject: blueprint.project_name,
      rememberedFrom: prompt || report.summary
    },
    routes: blueprint.api_routes,
    pages: blueprint.frontend_pages,
    connections: [
      "Connect as a new page inside Erleuchtung",
      "Connect to Empire Dashboard as a saved product",
      "Connect to Rick-C63 memory so future chats know the project",
      "Connect directly into a reusable local coding workspace"
    ],
    buildPhases: [
      `Phase 1: Lock the ${target.label} blueprint and save it`,
      `Phase 2: Generate ${target.output}`,
      "Phase 3: Review the working prototype and implementation package",
      "Phase 4: Reopen the product inside Rick-C63's coding workspace loop",
      "Phase 5: Test, package and deploy through the target toolchain"
    ],
    starterFiles: buildStarterFiles(slug, blueprint, report, prompt)
  };
}

function buildStarterFiles(slug, blueprint, report, prompt) {
  return [
    {
      path: `${slug}/README.md`,
      purpose: "Explains the generated software and how to run it.",
      code: `# ${blueprint.project_name}\n\n${blueprint.tagline}\n\nGenerated by Rick-C63 from: ${prompt || report.summary}\n\n## MVP\n${blueprint.features.map((item) => `- ${item}`).join("\n")}\n`
    },
    {
      path: `${slug}/src/app.js`,
      purpose: "Main local app logic.",
      code: `const appName = ${JSON.stringify(blueprint.project_name)};\nconst features = ${JSON.stringify(blueprint.features, null, 2)};\n\nexport function startApp() {\n  return { appName, features, status: "MVP ready to implement" };\n}\n`
    },
    {
      path: `${slug}/src/rick-c63-cortex.js`,
      purpose: "Local no-paid-API reasoning adapter.",
      code: `export function askRickC63(input) {\n  return {\n    summary: "Local analysis for: " + input,\n    legalVersion: "Use the mechanism, not protected assets.",\n    nextMoves: ["Build MVP", "Add memory", "Test safety"]\n  };\n}\n`
    },
    {
      path: `${slug}/src/schema.json`,
      purpose: "Database shape for the future backend.",
      code: JSON.stringify(schema, null, 2)
    }
  ];
}

async function generateProductBuild() {
  if (api.available && !(await requireAdminAccess("Software-Generierung"))) return;
  const report = getCurrentReport();
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(report);
  if (!report || !blueprint) {
    toast("Erst eine URL oder Idee analysieren, dann kann Rick-C63 Software generieren.");
    return;
  }
  if (!state.builderChoice) {
    renderRickSuggestions();
    els.rickSuggestions.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Wähle zuerst eine Rick-C63 Richtung. Keine Glücksrad-Software.");
    return;
  }
  if (!(state.blueprintVersions || []).some((item) => item.blueprint_id === blueprint.id)) {
    els.blueprintEditor.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Speichere zuerst mindestens eine Bauplan-Version. Der Builder baut nicht auf ungeprueften Zufallswerten.");
    return;
  }
  const product = generateProductPackage(blueprint, report, "Builder button");
  saveProductPackage(product, blueprint, report);
  let build = null;
  els.builderOutput.innerHTML = `<div class="builder-explain">Rick-C63 baut jetzt das ${safe(product.buildTarget.label)}-Paket. Lieferstufe: ${safe(product.deliveryLevel)}.</div>`;
  if (api.available) {
    const response = await apiPost("/api/product/build", { product });
    build = response?.build || null;
  } else {
    build = createLocalGeneratedBuild(product);
  }
  if (build) {
    product.build = build;
    saveProductPackage(product, blueprint, report);
  }
  const html = renderProductPackage(product);
  const buildHtml = build ? renderBuildResult(build) : "<p>Build fehlgeschlagen.</p>";
  els.builderOutput.innerHTML = `${html}${buildHtml}`;
  wireBuildPreviewButtons(els.builderOutput);
  openModal("Rick-C63 Software Generator", `${html}${buildHtml}`);
  wireBuildPreviewButtons(els.modalBody);
  toast(build?.status === "ready"
    ? (build.mode === "browser-standalone" ? "Fertige Standalone-App im Browser gebaut." : "Software generiert. Du kannst sie jetzt öffnen.")
    : "Preview-Scaffold generiert. Echte Ziel-Binaries brauchen weiter die passende Toolchain.");
}

function renderBuildResult(build) {
  const ready = build.status === "ready";
  const openLabel = ready ? "Open Software" : "Open Preview Package";
  const downloadButton = build.downloadUrl
    ? `<a class="secondary-button" href="${build.downloadUrl}" download="${safe(build.downloadName || "generated-app.html")}">Download App</a>`
    : "";
  return `<div class="builder-output">
    <h4>${ready ? "Fertige Software" : "Preview + Scaffold"}</h4>
    <p>${safe(build.detail || (ready ? "Rick-C63 hat eine direkt öffnbare App gebaut." : "Rick-C63 hat ein ehrliches Vorschau-/Scaffold-Paket gebaut."))}</p>
    <div class="button-row">
      <a class="primary-button" href="${build.url}" target="_blank" rel="noopener">${openLabel}</a>
      <button class="secondary-button" data-preview-url="${build.url}">Preview Here</button>
      ${downloadButton}
    </div>
    <p><strong>Build-Typ:</strong> ${safe(build.label || build.status || "preview")}</p>
    <p><strong>Ordner:</strong> ${safe(build.dir || "browser-memory")}</p>
    <p><strong>Start:</strong> ${safe(build.entry || "in-browser")}</p>
  </div>`;
}

function createLocalGeneratedBuild(product) {
  const standalone = createStandaloneGeneratedApp(product);
  return {
    status: "ready",
    label: "Standalone generated app",
    detail: "Die App wurde komplett im Browser gebaut: direkt öffnbar, speicherbar und ohne lokalen Node-Server benutzbar. Backend-only Extras wie Training/Admin-Sync bleiben separat.",
    mode: "browser-standalone",
    dir: "browser-memory",
    entry: `${product.slug || 'generated-app'}.html`,
    url: standalone.url,
    downloadUrl: standalone.url,
    downloadName: standalone.filename
  };
}

function createStandaloneGeneratedApp(product) {
  const expanded = expandGeneratedProduct(product);
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(expanded.name)}</title>
  <style>${standaloneProductCss(expanded)}</style>
</head>
<body>
  <div class="cosmos"></div>
  <header>
    <strong>${escapeHtml(expanded.name)}</strong>
    <nav id="nav"></nav>
  </header>
  <main>
    <section class="hero">
      <p class="eyebrow">Generated by Rick-C63</p>
      <h1>${escapeHtml(expanded.name)}</h1>
      <p>${escapeHtml(expanded.pitch || "Generated software product.")}</p>
      <p class="delivery">${escapeHtml(expanded.buildTarget?.label || expanded.type || "Web App")} / Complete standalone app</p>
      <div class="actions">
        <button id="saveProject">Save Project</button>
        <button id="generatePlan">Generate Plan</button>
        <button id="exportSummary">Export JSON</button>
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
  <script>${standaloneProductJs(expanded).replaceAll('</script>', '<\\/script>')}</script>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  return {
    filename: `${expanded.slug || 'generated-app'}.html`,
    url: URL.createObjectURL(blob)
  };
}

function expandGeneratedProduct(product) {
  const slug = String(product.slug || product.name || "generated-app")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "generated-app";
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
    appStateKey: `generated-${slug}`,
    screens: pages.map((page, index) => ({
      name: page,
      purpose: index === 0 ? "Main command center" : `Focused ${page.toLowerCase()} workspace`
    }))
  };
}

function standaloneProductCss(product) {
  const palette = product.palette || { bg: "#050610", accent: "#53ff9d", second: "#1dbdff", third: "#ff3edb" };
  return `:root{--bg:${palette.bg};--accent:${palette.accent};--second:${palette.second};--third:${palette.third};--text:#f3fbff;--muted:#a9b8c9;--panel:rgba(255,255,255,.07);--line:rgba(155,231,255,.22)}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 20% 10%,color-mix(in srgb,var(--second) 28%,transparent),transparent 30%),radial-gradient(circle at 80% 0,color-mix(in srgb,var(--third) 22%,transparent),transparent 24%),var(--bg);color:var(--text);font-family:Inter,Segoe UI,system-ui,sans-serif}.cosmos{position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.75) 0 1px,transparent 1px);background-size:120px 120px;opacity:.22;animation:drift 34s linear infinite}header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;background:rgba(0,0,0,.42);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}nav{display:flex;gap:8px;overflow:auto}nav button,.actions button,#addNote{border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--text);padding:10px 12px;font-weight:800}main{width:min(1180px,calc(100% - 28px));margin:0 auto;padding:38px 0 70px}.hero{min-height:360px;display:grid;align-content:center}.eyebrow{color:var(--accent);font-weight:900;text-transform:uppercase;letter-spacing:.08em}h1{max-width:980px;margin:.1em 0;font-size:clamp(42px,9vw,96px);line-height:.94;letter-spacing:0}h2{margin:0 0 14px}.hero p{max-width:760px;color:#dceeff;font-size:20px;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:10px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card,.workspace>aside,.workspace>section,main>section:not(.hero):not(.grid){border:1px solid var(--line);border-radius:8px;background:var(--panel);box-shadow:0 20px 80px rgba(0,0,0,.28);padding:18px}.workspace{display:grid;grid-template-columns:320px 1fr;gap:14px;margin-top:14px}.screen,.module,.note{border:1px solid var(--line);border-radius:8px;padding:12px;margin:10px 0;background:rgba(0,0,0,.18)}textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.32);color:var(--text);padding:12px;margin:8px 0 10px}.status{display:inline-flex;border-radius:999px;padding:4px 8px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);font-size:12px;font-weight:900}@media(max-width:800px){header{display:grid}.grid,.workspace{grid-template-columns:1fr}h1{font-size:clamp(38px,16vw,70px)}}@keyframes drift{to{transform:translate(-120px,120px)}}`;
}

function standaloneProductJs(product) {
  return `const product=${JSON.stringify(product)};const stateKey=product.appStateKey;const saved=JSON.parse(localStorage.getItem(stateKey)||'{"notes":[],"saves":0}');const $=(id)=>document.querySelector(id);const escape=(value)=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');$('#nav').innerHTML=product.screens.map(s=>'<button>'+escape(s.name)+'</button>').join('');$('#metrics').innerHTML=[['Versions',product.versions.length],['Modules',product.modules.length],['Saved',saved.saves||0]].map(([k,v])=>'<div class="card"><span class="status">'+k+'</span><h2>'+v+'</h2></div>').join('');$('#screens').innerHTML=product.screens.map(s=>'<div class="screen"><strong>'+escape(s.name)+'</strong><p>'+escape(s.purpose)+'</p></div>').join('');$('#modules').innerHTML=product.features.map(f=>'<div class="module"><span class="status">'+escape(f.status)+'</span><h3>'+escape(f.title)+'</h3><p>'+escape(f.description)+'</p></div>').join('');function renderNotes(){ $('#notes').innerHTML=saved.notes.map(n=>'<div class="note">'+escape(n)+'</div>').join('') || '<p>No notes yet.</p>'; }renderNotes();$('#addNote').addEventListener('click',()=>{ const value=$('#note').value.trim(); if(!value)return; saved.notes.unshift(value); $('#note').value=''; localStorage.setItem(stateKey,JSON.stringify(saved)); renderNotes();});$('#saveProject').addEventListener('click',()=>{ saved.saves=(saved.saves||0)+1; localStorage.setItem(stateKey,JSON.stringify(saved)); location.reload();});$('#generatePlan').addEventListener('click',()=>{ const plan=product.buildPhases.map((p,i)=>(i+1)+'. '+p).join('\\n'); saved.notes.unshift('Generated plan:\\n'+plan); localStorage.setItem(stateKey,JSON.stringify(saved)); renderNotes();});$('#exportSummary').addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(product,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=product.slug+'-product.json'; a.click(); });`;
}

function wireBuildPreviewButtons(root) {
  root.querySelectorAll("[data-preview-url]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.dataset.previewUrl;
      const container = button.closest(".builder-output");
      if (!container) return;
      let frame = container.querySelector("iframe[data-generated-preview='true']");
      if (!frame) {
        frame = document.createElement("iframe");
        frame.dataset.generatedPreview = "true";
        frame.title = "Generated software preview";
        frame.style.width = "100%";
        frame.style.minHeight = "620px";
        frame.style.border = "1px solid var(--line)";
        frame.style.borderRadius = "8px";
        frame.style.marginTop = "14px";
        container.appendChild(frame);
      }
      frame.src = url;
    });
  });
}

function openExportHub() {
  const report = getCurrentReport();
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(report);
  if (!report || !blueprint) {
    toast("Erst Projekt analysieren, dann exportieren.");
    return;
  }
  const product = generateProductPackage(blueprint, report, "Export Hub");
  const html = `<div class="export-hub">
    <p>Wähle, was Rick-C63 exportieren soll. Web/Codex/Cursor funktionieren sofort. Windows EXE wird ehrlich nur dann gebaut, wenn der Server auf einem passenden Windows-Host mit Toolchain läuft; sonst bekommst du stattdessen einen klaren Build-Hinweis. AAB bleibt ein vorbereitetes Android-Build-Ziel.</p>
    <label><input type="checkbox" value="web" checked> Web Software</label>
    <label><input type="checkbox" value="codex" checked> Send to Codex package</label>
    <label><input type="checkbox" value="cursor" checked> Send to Cursor package</label>
    <label><input type="checkbox" value="exe" checked> Windows EXE build</label>
    <label><input type="checkbox" value="aab" checked> Android AAB target</label>
    <label><input type="checkbox" value="llm" checked> LLM model notes</label>
    <button class="primary-button full-width" id="downloadExportButton">Download Export ZIP</button>
    <div id="exportResult"></div>
  </div>`;
  openModal("Export / Send Project", html);
  document.querySelector("#downloadExportButton").addEventListener("click", () => exportCurrentProject(product));
}

async function exportCurrentProject(product) {
  if (api.available && !(await requireAdminAccess("Projekt-Export"))) return;
  const checked = [...document.querySelectorAll(".export-hub input:checked")].map((input) => input.value);
  const result = document.querySelector("#exportResult");
  result.innerHTML = "<p>Rick-C63 packt dein Projekt. Bitte kurz nicht an der Realität wackeln.</p>";
  if (!api.available) {
    const bundle = await createStandalonePwaBundle(product, checked);
    downloadBlob(bundle.filename, bundle.blob, bundle.mimeType);
    result.innerHTML = `<div class="builder-output">
      <h4>PWA-Paket bereit</h4>
      <p>Standalone-Export gebaut. Dieses ZIP kannst du direkt fuer PWABuilder verwenden.</p>
      <p><strong>Datei:</strong> ${safe(bundle.filename)}</p>
      <p><strong>Enthalten:</strong> index.html, app.js, styles.css, manifest.webmanifest, sw.js, icons, product.json</p>
    </div>`;
    toast("PWA-Export fuer PWABuilder heruntergeladen.");
    return;
  }
  const response = await apiPost("/api/export/project", { product, formats: checked });
  if (!response?.ok) {
    result.innerHTML = "<p>Export fehlgeschlagen. Backend prüfen.</p>";
    return;
  }
  const windowsBlock = response.windowsExe
    ? (response.windowsExe.ok
        ? `<p><strong>Windows EXE:</strong> ${response.windowsExe.signature_status || response.windowsExe.status || "built"}</p>
    <a class="secondary-button" href="${response.windowsExe.url}" download>Download Windows EXE</a>`
        : `<p><strong>Windows EXE:</strong> ${response.windowsExe.status || "external-build-required"}</p>
    <p>${response.windowsExe.reason || "Build requires a Windows packaging host."}</p>`)
    : "";
  const aabBlock = response.androidAab
    ? `<p><strong>Android AAB:</strong> ${response.androidAab.status || "external-build-required"}</p>
    <p>${response.androidAab.reason || "Build requires an Android SDK/Gradle host."}</p>`
    : "";
  result.innerHTML = `<div class="builder-output">
    <h4>Export bereit</h4>
    <p>Formate: ${response.bundle.formats.join(", ")}</p>
    <p><strong>Lokaler Preview-Typ:</strong> ${safe(response.build.label || response.build.status || "preview")}</p>
    <p>${safe(response.build.detail || "")}</p>
    ${windowsBlock}
    ${aabBlock}
    <a class="primary-button" href="${response.bundle.url}" download>Download ZIP</a>
    <a class="secondary-button" href="${response.build.url}" target="_blank" rel="noopener">${response.build.status === "ready" ? "Open Web App" : "Open Preview Package"}</a>
  </div>`;
  toast("Export ZIP ist bereit.");
}

function renderProductPackage(product) {
  return `<h3>${safe(product.name)}</h3>
    <p>${safe(product.pitch)}</p>
    <div class="delivery-contract">
      <span class="status-badge">${safe(product.buildTarget?.label || product.type)}</span>
      <strong>${safe(product.deliveryLevel || "Product package")}</strong>
      <small>${safe(product.buildTarget?.output || "Blueprint, working web prototype and export package")}</small>
    </div>
    <p>Das ist ein Produktpaket: eine gespeicherte Software-Idee mit Seiten, Modulen, Datenmodell, API-Routen, Verbindungen und Build-Phasen. Keine losen Zettel auf dem Boden der Realitaet.</p>
    <h4>Versionen</h4>
    ${list(product.versions.map((item) => `${item.name}: ${item.summary}`))}
    <h4>Module</h4>
    ${list(product.modules)}
    <h4>Seiten</h4>
    ${list(product.pages)}
    <h4>API-Routen</h4>
    ${list(product.routes)}
    <h4>Verbindungen</h4>
    ${list(product.connections)}
    <h4>Build-Phasen</h4>
    ${list(product.buildPhases)}
    <h4>Lokaler Rick-C63 LLM Plan</h4>
    <p>Beste erste Stufe: Ollama als lokaler Model-Server auf deinem PC. Die mobile Ansicht bleibt leicht; dein Handy verbindet sich spaeter mit deinem lokalen Rick-Server. Fuer maximale Kontrolle kommt danach llama.cpp.</p>`;
}

function titleToName(title) {
  const clean = title
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
  return clean || "Concept";
}

function legalSafetyCheck(text) {
  const risky = [
    "hack", "bypass login", "steal", "clone code", "copy code", "malware", "impersonate",
    "scrape private", "break terms", "password", "session cookie", "exact logo", "copy logo"
  ];
  const lowered = text.toLowerCase();
  const hit = risky.find((word) => lowered.includes(word));
  if (!hit) return { allowed: true };
  return {
    allowed: false,
    response: `Rick-C63 Legal Safety Check\n\nI cannot help with "${hit}" or anything that bypasses access, steals data, clones protected code, impersonates a company or copies exact brand assets.\n\nHere is the legal version: use public concept analysis, official APIs, OAuth, user-owned data, original branding, original layouts and original code. We can rebuild the workflow as your own product without copying the protected shell.\n\nCreate Blueprint | Build MVP Plan | Add to Empire Dashboard`
  };
}

async function initializeBackend() {
  const health = await apiGet("/api/health");
  api.available = Boolean(health?.ok);
  api.health = health || null;
  state.projectAudit = buildProjectAudit(health, null);
  if (api.available) {
    if (state.adminSecurity?.token) {
      const doctor = await apiGet("/api/doctor");
      api.doctor = doctor?.doctor || null;
      state.projectAudit = buildProjectAudit(health, api.doctor);
    }
    const status = await apiGet("/api/admin/status");
    if (status?.ok) {
      if (!state.adminSecurity) state.adminSecurity = {};
      state.adminSecurity.configured = Boolean(status.configured);
      if (!status.unlocked) {
        clearExpiredAdminClientState();
      }
      updateAdminButtonLabel();
    }
  }
  if (api.available) {
    if (state.adminSecurity?.token) {
      const sync = await apiGet("/api/db");
      if (sync?.db) {
        state.targets = sync.db.targets || state.targets;
        state.reports = sync.db.reports || state.reports;
        state.blueprints = sync.db.blueprints || state.blueprints;
        state.blueprintVersions = sync.db.blueprintVersions || state.blueprintVersions;
        state.empireProjects = sync.db.projects || state.empireProjects;
        state.trainingJobs = sync.db.trainingJobs || state.trainingJobs;
        state.workspaces = sync.db.workspaces || state.workspaces;
        state.memories = sync.db.memories || state.memories;
        state.sessions = sync.db.sessions || state.sessions;
        saveState();
      }
      await refreshWorkspaces();
    }
    toast(health.ollama?.reachable ? "Backend online. Ollama/Rick-C63 ist verbunden." : "Backend online. Ollama ist noch offline, Fallback aktiv.");
  }
  renderAll();
}

async function refreshAudit() {
  const health = await apiGet("/api/health");
  if (health?.ok) {
    api.available = true;
    api.health = health;
    if (state.adminSecurity?.token) {
      const doctor = await apiGet("/api/doctor");
      api.doctor = doctor?.doctor || null;
    } else {
      api.doctor = null;
    }
    state.projectAudit = buildProjectAudit(health, api.doctor);
    saveState();
    renderAll();
    toast("Project audit refreshed.");
    return;
  }
  api.available = false;
  state.projectAudit = buildProjectAudit(null, null);
  saveState();
  renderAll();
  toast("Standalone mode aktiv. Live-Backend-Audit ist gerade nicht verbunden.");
}

function buildProjectAudit(health, doctor) {
  const backendOnline = Boolean(health?.ok);
  const ollamaReady = Boolean(health?.ollama?.reachable || doctor?.ollama_ready);
  const nodeReady = backendOnline || Boolean(doctor?.node_ready);
  const doctorAvailable = Boolean(doctor);
  const doctorOk = doctorAvailable ? doctor?.ok !== false : false;
  const backendPort = Number(health?.port) || Number(location.port) || 8787;
  const issues = Array.isArray(doctor?.issues) ? doctor.issues : [];
  const repairs = Array.isArray(doctor?.repairs) ? doctor.repairs : [];
  const hardIssues = [
    !backendOnline ? "This session is running in standalone mode. Core UI/build flow still works, but live admin/training sync is unavailable until the local server responds." : "",
    !ollamaReady ? "Local Ollama/Rick-C63 model is not reachable; AI planning falls back to canned local logic." : "",
    "Training and native EXE export still depend on external runtimes and should be verified on every target machine.",
    "Frontend state and backend JSON sync are useful for MVP, but not enough for multi-user production."
  ].filter(Boolean);
  return {
    checked_at: doctor?.checked_at || new Date().toISOString(),
    score: backendOnline && ollamaReady && doctorOk && !issues.length ? 90 : backendOnline ? (doctorAvailable ? 76 : 72) : 58,
    status: backendOnline ? "Running locally" : "Standalone mode",
    summary: backendOnline
      ? "The local Node app is reachable, browser UI can talk to the backend, and the project is ready for feature hardening."
      : "The app still works in standalone mode and can generate complete browser apps, while live audit/training/admin routes wait for the local server.",
    health: [
      { label: "Node server", value: nodeReady ? "Ready" : "Offline", ok: nodeReady },
      { label: "Browser app", value: "Ready", ok: true },
      { label: "Ollama model", value: ollamaReady ? "Reachable" : "Offline", ok: ollamaReady },
      { label: "Doctor report", value: doctorAvailable ? (doctorOk ? "Clean" : "Issues") : "Locked", ok: doctorAvailable ? doctorOk : false }
    ],
    findings: [
      {
        title: "What works",
        tone: "good",
        items: [
          `Private repo is cloned locally and runs on port ${backendPort}.`,
          "npm run check validates JavaScript syntax plus navigation, analysis, XSS safety, Audit and API hardening.",
          "Core pages exist: Home, Rick-C63, Reports, Builder, Empire, Training, Legal and Audit.",
          "Backend routes already cover health, doctor, chat, DB sync, products, exports and training jobs.",
          "Coding workspaces provide contained file editing and allowlisted syntax, check, test and build-inspect loops.",
          "Sensitive repository files and admin authentication data are not exposed by public routes.",
          "Node, Ollama and llama.cpp bind to localhost by default.",
          ...repairs
        ]
      },
      {
        title: "Risks",
        tone: hardIssues.length ? "warn" : "good",
        items: [
          ...issues,
          ...(!doctorAvailable && backendOnline ? ["Detailed doctor diagnostics are locked until admin mode is enabled."] : []),
          ...hardIssues
        ]
      },
      {
        title: "Missing to finish",
        tone: "work",
        items: [
          "Connect an explicit vision model before claiming semantic screenshot analysis.",
          "Add repo-level project roadmap and issue backlog so every feature has a finish line.",
          "Add backup/export controls for data/erleuchtung-db.json.",
          "Add dedicated integration tests for Training and native EXE export on a fully provisioned machine.",
          "Provision external SDKs before claiming desktop, native mobile, Godot or VR compilation."
        ]
      }
    ],
    nextSteps: [
      "Add provisioned-machine coverage for Training, native EXE export and external engine toolchains.",
      "Add a persistent Roadmap page or backlog JSON for the finish-one-by-one workflow.",
      "Make the Audit page able to trigger the self-healing doctor script from admin mode.",
      "Add automated backups for the local database.",
      "Keep dependencies and local runtimes updated."
    ]
  };
}

function clearAdminProtectedState() {
  api.doctor = null;
  state.targets = [];
  state.reports = [];
  state.blueprints = [];
  state.blueprintVersions = [];
  state.empireProjects = [];
  state.trainingJobs = [];
  state.workspaces = [];
  state.memories = [];
  state.sessions = [];
  state.currentReportId = null;
  state.currentBlueprintId = null;
  state.currentTrainingJobId = null;
  state.currentWorkspaceId = null;
  state.currentWorkspaceFile = "";
}

function updateAdminButtonLabel() {
  if (!els.adminAccessButton) return;
  const unlocked = Boolean(state.adminSecurity?.token);
  els.adminAccessButton.textContent = unlocked ? "Admin On" : "Admin Lock";
}

async function requireAdminAccess(actionLabel) {
  if (!api.available) {
    toast("Backend offline. Admin-Absicherung greift erst mit npm start.");
    return false;
  }
  const status = await apiGet("/api/admin/status");
  if (!status?.ok) {
    toast("Admin-Status konnte nicht geprueft werden.");
    return false;
  }
  state.adminSecurity.configured = Boolean(status.configured);
  if (status.unlocked && state.adminSecurity?.token) return true;
  if (state.adminSecurity?.token && !status.unlocked) {
    clearExpiredAdminClientState();
  }
  openAdminAccessModal(actionLabel);
  toast(`${actionLabel} braucht Admin-Freigabe.`);
  return false;
}

function openAdminAccessModal(actionLabel = "") {
  const configured = Boolean(state.adminSecurity?.configured);
  const unlocked = Boolean(state.adminSecurity?.token);
  if (unlocked) {
    const html = `<p>Admin-Modus ist aktiv.</p>
      <button class="secondary-button full-width" id="adminLogoutButton">Admin sperren</button>`;
    openModal("Admin Zugriff", html);
    document.querySelector("#adminLogoutButton")?.addEventListener("click", logoutAdmin);
    return;
  }
  const setupBlock = configured ? "" : `<label>
      Neues Admin-Passwort setzen
      <input id="adminSetPassword" type="password" minlength="8" placeholder="Mindestens 8 Zeichen">
    </label>
    <button class="secondary-button full-width" id="adminSetPasswordButton">Passwort speichern</button>`;
  const html = `<p>${actionLabel ? `${actionLabel} ist gesperrt.` : "Admin-Bereich gesperrt."} Entsperre mit deinem selbst gesetzten Passwort.</p>
    ${setupBlock}
    <label>
      Admin-Passwort
      <input id="adminPassword" type="password" placeholder="Passwort eingeben">
    </label>
    <button class="primary-button full-width" id="adminUnlockButton">Admin entsperren</button>`;
  openModal("Admin Zugriff", html);
  document.querySelector("#adminSetPasswordButton")?.addEventListener("click", setAdminPassword);
  document.querySelector("#adminUnlockButton")?.addEventListener("click", loginAdmin);
}

async function setAdminPassword() {
  const input = document.querySelector("#adminSetPassword");
  const password = input?.value?.trim() || "";
  if (password.length < 8) {
    toast("Passwort braucht mindestens 8 Zeichen.");
    return;
  }
  const response = await apiPost("/api/admin/set-password", { password });
  if (!response?.ok) {
    toast("Passwort konnte nicht gesetzt werden.");
    return;
  }
  state.adminSecurity.configured = true;
  saveState();
  toast("Admin-Passwort gespeichert.");
  openAdminAccessModal();
}

async function loginAdmin() {
  const input = document.querySelector("#adminPassword");
  const password = input?.value || "";
  if (!password) {
    toast("Bitte Passwort eingeben.");
    return;
  }
  const response = await apiPost("/api/admin/login", { password });
  if (!response?.ok || !response.token) {
    toast("Admin-Login fehlgeschlagen.");
    return;
  }
  state.adminSecurity.token = response.token;
  state.adminSecurity.expires_at = response.expires_at || "";
  saveState();
  updateAdminButtonLabel();
  closeModal();
  toast("Admin-Modus entsperrt.");
}

async function logoutAdmin() {
  await apiPost("/api/admin/logout", {});
  clearExpiredAdminClientState();
  closeModal();
  toast("Admin-Modus gesperrt.");
}

async function askRick(prompt) {
  const local = localRickCortex(prompt);
  if (!api.available) return local;

  const response = await apiPost("/api/chat", {
    prompt,
    context: {
      currentReport: getCurrentReport(),
      currentBlueprint: getCurrentBlueprint(),
      memories: state.memories?.slice(0, 8) || []
    }
  });

  if (!response?.ok || !response.text) return local;

  if (response.db?.memories) {
    state.memories = response.db.memories;
    saveState();
  }

  return {
    answer: `${response.text}\n\nProvider: ${response.provider === "ollama" ? `Ollama Rick-C63 local model (${response.model})` : response.provider}`
  };
}

async function planWithRick(prompt) {
  const report = getCurrentReport();
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(report);
  if (!blueprint) {
    return {
      answer: "Rick-C63 Planning Studio braucht zuerst ein Projekt. Scan zuerst eine URL oder Idee, dann plane ich mit dir daran weiter."
    };
  }

  const localPlan = createPlanningUpdate(prompt, blueprint, report);
  applyPlanningUpdate(localPlan, blueprint);

  let aiText = "";
  if (api.available) {
    const response = await apiPost("/api/chat", {
      prompt: `Planning mode. Do not scan a new target. Work on this existing app and propose concrete changes.\n\nUser request: ${prompt}\n\nCurrent blueprint: ${JSON.stringify(blueprint, null, 2)}\n\nReturn: short Rick-C63 response, 3 feature suggestions, one recommended next step.`,
      context: {
        mode: "planning",
        currentBlueprint: blueprint,
        currentReport: report,
        planningNotes: state.planningNotes?.slice(0, 8) || []
      }
    });
    aiText = response?.text || "";
  }

  const answer = aiText || formatPlanningAnswer(localPlan, blueprint);
  return { answer };
}

function createPlanningUpdate(prompt, blueprint, report) {
  const lowered = prompt.toLowerCase();
  const appNameMatch = prompt.match(/(?:name|nenn|heisst|heißen|app soll)\s*:?\s*([A-ZÄÖÜa-zäöü0-9 -]{3,40})/i);
  const focus = inferPlanningFocus(lowered);
  const baseFeature = focus.feature;
  return {
    id: id("plan"),
    prompt,
    focus: focus.label,
    appName: appNameMatch ? appNameMatch[1].trim() : "",
    features: [
      baseFeature,
      `${focus.label} dashboard section`,
      `Rick-C63 suggestion cards for ${focus.label.toLowerCase()}`
    ],
    pages: [
      focus.page,
      `${focus.label} Board`
    ],
    roadmap: [
      `Add ${baseFeature}`,
      `Review ${focus.label.toLowerCase()} with Rick-C63`,
      "Generate updated software preview"
    ],
    created_at: new Date().toISOString()
  };
}

function inferPlanningFocus(lowered) {
  if (lowered.includes("design") || lowered.includes("layout") || lowered.includes("animation")) {
    return { label: "Design Upgrade", feature: "Animated premium interface layer", page: "Design Studio" };
  }
  if (lowered.includes("zahlung") || lowered.includes("abo") || lowered.includes("geld") || lowered.includes("monet")) {
    return { label: "Monetization", feature: "Pricing and offer builder", page: "Revenue Lab" };
  }
  if (lowered.includes("login") || lowered.includes("user") || lowered.includes("account")) {
    return { label: "Accounts", feature: "User account and project ownership", page: "Account Center" };
  }
  if (lowered.includes("export") || lowered.includes("download") || lowered.includes("codex") || lowered.includes("cursor")) {
    return { label: "Export System", feature: "One-click export and tool handoff", page: "Export Hub" };
  }
  if (lowered.includes("ki") || lowered.includes("agent") || lowered.includes("rick")) {
    return { label: "Agent Intelligence", feature: "Rick-C63 planning memory and feature advisor", page: "Agent Studio" };
  }
  return { label: "Product Expansion", feature: "Guided feature planning workflow", page: "Planning Studio" };
}

function applyPlanningUpdate(update, blueprint) {
  if (update.appName) blueprint.project_name = update.appName;
  blueprint.features = uniqueList([...(blueprint.features || []), ...update.features]).slice(0, 9);
  blueprint.frontend_pages = uniqueList([...(blueprint.frontend_pages || []), ...update.pages]).slice(0, 8);
  blueprint.roadmap = uniqueList([...(blueprint.roadmap || []), ...update.roadmap]).slice(0, 10);
  blueprint.updated_at = new Date().toISOString();
  snapshotBlueprint(blueprint, `Rick-C63 planning update: ${update.focus}`);
  if (!state.planningNotes) state.planningNotes = [];
  state.planningNotes.unshift(update);
  state.planningNotes = state.planningNotes.slice(0, 20);
  remember(`Planning update for ${blueprint.project_name}: ${update.focus}`);
  saveState();
}

function formatPlanningAnswer(update, blueprint) {
  return `${rickVoiceLine("build")}\n\nPlan Mode aktiv. Ich scanne jetzt nichts Neues, ich arbeite an deiner App: ${blueprint.project_name}.\n\n### Was ich ändern würde\n1. ${update.features[0]}\n2. ${update.features[1]}\n3. ${update.features[2]}\n\n### In den Bauplan übernommen\n- Neue Seite: ${update.pages.join(", ")}\n- Roadmap: ${update.roadmap.join(" -> ")}\n\n### Nächster Schritt\nWenn dir diese Richtung gefällt: im Builder eine Rick-C63 Richtung wählen, App-Name prüfen, dann Generate Software klicken. Keine Zufalls-App. Wir bauen bewusst.`;
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function clearExpiredAdminClientState() {
  if (!state.adminSecurity) state.adminSecurity = {};
  state.adminSecurity.token = "";
  state.adminSecurity.expires_at = "";
  clearAdminProtectedState();
  saveState();
  if (document.readyState !== "loading") {
    renderAll();
    updateAdminButtonLabel();
  }
}

async function apiGet(path) {
  try {
    const headers = { accept: "application/json" };
    if (state.adminSecurity?.token) headers["x-admin-token"] = state.adminSecurity.token;
    const response = await fetch(path, { headers });
    if (response.status === 403 && state.adminSecurity?.token) clearExpiredAdminClientState();
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function apiPost(path, body) {
  try {
    const headers = { "content-type": "application/json", accept: "application/json" };
    if (state.adminSecurity?.token) headers["x-admin-token"] = state.adminSecurity.token;
    const response = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    if (response.status === 403 && state.adminSecurity?.token) clearExpiredAdminClientState();
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function rickAnalysisText(report, blueprint) {
  return `## Rick-C63 Analysis

### 1. What this really is
${report.summary}

### 2. Why it works
It works because it compresses uncertainty. Psychologically, users like systems that turn messy inputs into clear next moves. In business terms, it packages expertise into repeatable output. In UX terms, it gives one obvious path forward.

### 3. What we must not copy
${report.do_not_copy.map((item) => `- ${item}`).join("\n")}

### 4. The legal core
Use the public idea mechanics: ${report.legal_inspiration_points.join(", ")}. Do not copy the costume; rebuild the engine with original code, original names and original interface decisions.

### 5. The Erleuchtung upgrade
${report.nemesis_upgrade_idea}

### 6. MVP version
${report.mvp_plan.map((item, index) => `${index + 1}. ${item}`).join("\n")}

### 7. Empire version
${report.empire_plan.map((item, index) => `${index + 1}. ${item}`).join("\n")}

### 8. Build architecture
Frontend pages: ${blueprint.frontend_pages.join(", ")}.
Backend services: ${blueprint.backend_services.join(", ")}.
Database: User, Agent Session, Analysis Target, Analysis Report, Blueprint and Empire Project.
APIs: ${blueprint.api_routes.join(", ")}.

### 9. Monetization
${report.monetization.join(", ")}.

### 10. Next 3 smart moves
1. Create the MVP blueprint.
2. Build upload + URL analysis with demo AI fallback.
3. Add the Empire Dashboard so every idea becomes a saved project.

[Create Blueprint] [Build MVP Plan] [Add to Empire Dashboard]`;
}

function renderAll() {
  renderWorkflowCommandDeck();
  renderRecent();
  renderProjects();
  renderContext();
  renderPlanningBoard();
  renderActions();
  renderReports();
  renderBlueprint();
  renderProjectFlow();
  renderCapabilityMatrix();
  renderRickSuggestions();
  renderBuilderSettings();
  renderBlueprintEditor();
  renderDevelopmentTasks();
  renderEmpire();
  renderTraining();
  renderWorkspaces();
  renderAudit();
}

function renderRecent() {
  const reports = state.reports.slice(0, 4);
  els.recentAnalyses.innerHTML = reports.length ? reports.map((report) => miniReportCard(report)).join("") : emptyState("No reports yet. Feed Rick-C63 a URL, screenshot or idea.");
  els.recentAnalyses.querySelectorAll("[data-open-report]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentReportId = button.dataset.openReport;
      saveState();
      routeTo("reports");
    });
  });
}

function renderProjects() {
  const projects = state.empireProjects.slice(0, 4);
  els.savedProjects.innerHTML = projects.length ? projects.map(projectCard).join("") : emptyState("No Empire projects yet. Create a blueprint, then add it here.");
  wireProjectButtons(els.savedProjects);
}

function renderContext() {
  const target = getCurrentTarget();
  const report = getCurrentReport();
  const trainingJob = getCurrentTrainingJob();
  const memories = (state.memories || []).slice(0, 5);
  els.contextPanel.innerHTML = `
    <div class="mini-card"><h3>User</h3><p>${safe(state.user.name)} / ${safe(state.user.plan)}</p></div>
    <div class="mini-card"><h3>Backend</h3><p>${api.available ? "Online" : "Standalone mode"} / Ollama ${api.health?.ollama?.reachable ? "connected" : "optional"} / ${safe(api.health?.ollama?.model || "qwen3-coder:30b")}</p></div>
    <div class="mini-card"><h3>Model stack</h3><p>Main: ${safe(getModelById(state.selectedMainModel)?.label || "GPT-5.4 Codex")}<br>Coding: ${safe(getModelById(state.selectedCodingModel)?.label || "GPT-5.4 Codex")}</p></div>
    <div class="mini-card"><h3>Current Target</h3><p>${safe(target ? target.title : "No target selected")}</p></div>
    <div class="mini-card"><h3>Current Report</h3><p>${safe(report ? report.summary : "No report yet")}</p></div>
    <div class="mini-card"><h3>Training Job</h3><p>${safe(trainingJob ? `${trainingJob.topic} / ${trainingJob.status}` : "No training job selected")}</p></div>
    <div class="mini-card"><h3>Rick-C63 Memories</h3><p>${memories.length ? memories.map((memory) => safe(memory.text)).join("<br>") : "No memories yet"}</p></div>
    <div class="mini-card"><h3>Data Model</h3><p>${Object.keys(schema).join(", ")}</p></div>
  `;
}

function renderPlanningBoard() {
  if (!els.planningBoard) return;
  setChatModeVisualOnly();
  const blueprint = getCurrentBlueprint();
  const notes = (state.planningNotes || []).slice(0, 4);
  if (state.chatMode === "scan") {
    els.planningBoard.innerHTML = `<div class="planning-hint scan">
      <strong>Scan Mode</strong>
      <span>Für neue URLs, Screenshots oder frische Ideen. Danach wechselst du in Plan Mode.</span>
    </div>`;
    return;
  }
  els.planningBoard.innerHTML = `<div class="planning-hint">
      <strong>${safe(blueprint ? blueprint.project_name : "No active project")}</strong>
      <span>${blueprint ? "Sag Rick, was geändert, erweitert oder verbessert werden soll." : "Scan zuerst eine Idee oder URL."}</span>
    </div>
    <div class="quick-prompts">
      ${["Mach das Design klarer und edler", "Füge 3 starke Features hinzu", "Plane Login und Projekt-Speicher", "Verbessere Export zu Codex/Cursor"].map((prompt) => `<button data-quick-prompt="${prompt}">${prompt}</button>`).join("")}
    </div>
    <div class="plan-notes">
      ${notes.length ? notes.map((note) => `<div><strong>${safe(note.focus)}</strong><span>${safe(note.prompt)}</span></div>`).join("") : "<p>Noch keine Planungsnotizen.</p>"}
    </div>`;
  els.planningBoard.querySelectorAll("[data-quick-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      els.chatInput.value = button.dataset.quickPrompt;
      els.chatInput.focus();
    });
  });
}

function setChatModeVisualOnly() {
  document.querySelectorAll("[data-chat-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.chatMode === state.chatMode);
  });
  if (els.chatInput) {
    els.chatInput.placeholder = state.chatMode === "scan"
      ? "Scan Mode: URL, Screenshot-Idee oder neue App eingeben..."
      : "Plan Mode: Sag Rick, was wir an der aktuellen App ändern oder erweitern sollen...";
  }
}

function renderActions() {
  els.actionCards.innerHTML = [
    actionCard("Create Blueprint", "Generate or open the product blueprint for the current analysis.", () => routeTo("blueprint")),
    actionCard("Build MVP Plan", "Create concrete development tasks from the current blueprint.", generateTasks),
    actionCard("Add to Empire Dashboard", "Save this blueprint as an Empire project with scores.", addCurrentBlueprintToEmpire),
    actionCard("Open Training Lab", "Collect public sources and prepare a model training package.", () => routeTo("training")),
    actionCard("Open Project Audit", "Review runtime health, risks and next build moves.", () => routeTo("audit")),
    actionCard("Legal Safety Check", "Review allowed and blocked actions before building.", () => routeTo("legal"))
  ].join("");
  els.actionCards.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", actionHandlers[button.dataset.action]);
  });
}

const actionHandlers = {};

function actionCard(title, body, handler) {
  const key = title.toLowerCase().replaceAll(" ", "-");
  actionHandlers[key] = handler;
  return `<div class="action-card"><h3>${title}</h3><p>${body}</p><button class="secondary-button full-width" data-action="${key}">${title}</button></div>`;
}

function renderReports() {
  els.reportsGrid.innerHTML = state.reports.length ? state.reports.map(fullReportCard).join("") : emptyState("No reports generated yet.");
  els.reportsGrid.querySelectorAll("[data-blueprint-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const report = state.reports.find((item) => item.id === button.dataset.blueprintReport);
      state.currentReportId = report.id;
      createBlueprintFromReport(report);
      saveState();
      routeTo("blueprint");
    });
  });
}

function renderBlueprint() {
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
  if (!blueprint) {
    els.blueprintDetail.innerHTML = emptyState("No blueprint yet. Generate an analysis first.");
    return;
  }
  els.blueprintDetail.innerHTML = [
    block("Software Bauplan", `${safe(blueprint.project_name)}<br><span class="muted">${safe(blueprint.problem)}</span>`, "wide"),
    block("Main features", list(blueprint.features)),
    block("Pages", list(blueprint.frontend_pages)),
    block("Build path", list(blueprint.roadmap), "wide")
  ].join("");
}

function renderDevelopmentTasks() {
  if (!els.taskList) return;
  const blueprint = getCurrentBlueprint();
  const target = buildTargets.find((item) => item.id === state.builderTarget) || buildTargets[0];
  if (!blueprint) {
    els.taskList.innerHTML = "<li>Analyze a source to create the first build queue.</li>";
    return;
  }
  const tasks = [
    `Delivery target: ${target.label} - ${target.output}`,
    "Review and save at least one blueprint version with Rick-C63",
    ...(blueprint.roadmap || []).slice(0, 5),
    "Generate, preview and export the product package"
  ];
  els.taskList.innerHTML = tasks.map((task) => `<li>${safe(task)}</li>`).join("");
}

function renderWorkflowCommandDeck() {
  if (!els.workflowCommandDeck) return;
  const project = getCurrentEmpireProject();
  const steps = [
    { number: "01", label: "Scan", detail: "URL, screenshot or idea", route: "home", done: Boolean(getCurrentReport()) },
    { number: "02", label: "Extract", detail: "Legal mechanisms and strengths", route: "reports", done: Boolean(getCurrentReport()) },
    { number: "03", label: "Blueprint", detail: "Pages, features, data and APIs", route: "blueprint", done: Boolean(getCurrentBlueprint()) },
    { number: "04", label: "Plan with Rick", detail: "Iterate and save blueprint versions", route: "chat", done: Boolean((state.blueprintVersions || []).length) },
    { number: "05", label: "Build", detail: "Open a real coding workspace and verify it", route: "workspace", done: Boolean(state.workspaces?.length) },
    { number: "06", label: "Export", detail: "Preview, package and continue", route: "empire", done: Boolean(project?.product_package) }
  ];
  els.workflowCommandDeck.innerHTML = steps.map((step) => `
    <button class="workflow-command-card ${step.done ? "done" : ""}" data-route="${step.route}">
      <span>${step.number}</span>
      <strong>${step.label}</strong>
      <small>${step.detail}</small>
    </button>
  `).join("");
  els.workflowCommandDeck.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => routeTo(button.dataset.route));
  });
}

function renderCapabilityMatrix() {
  if (!els.capabilityMatrix) return;
  const selected = state.builderTarget || "web-app";
  els.capabilityMatrix.innerHTML = `
    <div class="capability-intro">
      <span class="status-badge">Delivery Engine</span>
      <strong>Choose what this blueprint should become</strong>
      <small>Rick-C63 builds working web prototypes now. Native, 3D and VR targets receive an honest scaffold and implementation package for their required engines.</small>
    </div>
    <div class="capability-grid">
      ${buildTargets.map((target) => `
        <button class="capability-card ${target.tone} ${selected === target.id ? "selected" : ""}" data-build-target="${target.id}">
          <strong>${target.label}</strong>
          <span>${target.level}</span>
          <small>${target.output}</small>
        </button>
      `).join("")}
    </div>`;
  els.capabilityMatrix.querySelectorAll("[data-build-target]").forEach((button) => {
    button.addEventListener("click", () => {
      state.builderTarget = button.dataset.buildTarget;
      saveState();
      renderCapabilityMatrix();
      renderBuilderSettings();
      renderDevelopmentTasks();
    });
  });
}

function renderProjectFlow() {
  const project = getCurrentEmpireProject();
  const built = Boolean(project?.product_package?.build);
  const steps = [
    ["1", "Scan", Boolean(getCurrentReport())],
    ["2", "Legal Rebuild", Boolean(state.builderChoice)],
    ["3", "Edit Bauplan", Boolean(getCurrentBlueprint() && (state.blueprintVersions || []).length)],
    ["4", "Generate", built],
    ["5", "Preview / Export", built],
    ["6", "Erleuchtung Group", Boolean(project)]
  ];
  els.projectFlow.innerHTML = steps.map(([number, label, done], index) => `
    <div class="flow-step ${done ? "done" : ""} ${!done && steps.slice(0, index).every((step) => step[2]) ? "next" : ""}">
      <strong>${number}</strong>
      <span>${label}</span>
    </div>
  `).join("");
}

function renderRickSuggestions() {
  const report = getCurrentReport();
  const blueprint = getCurrentBlueprint();
  if (!report || !blueprint) {
    els.rickSuggestions.innerHTML = "";
    return;
  }
  const suggestions = buildRickSuggestions(report, blueprint);
  els.rickSuggestions.innerHTML = suggestions.map((suggestion, index) => `
    <button class="suggestion-card ${state.builderChoice === suggestion.id ? "selected" : ""}" data-suggestion="${suggestion.id}">
      <span>${safe(suggestion.label)}</span>
      <strong>${safe(suggestion.name)}</strong>
      <small>${safe(suggestion.description)}</small>
    </button>
  `).join("");
  els.rickSuggestions.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      state.builderChoice = button.dataset.suggestion;
      const selected = suggestions.find((item) => item.id === state.builderChoice);
      if (selected) {
        blueprint.project_name = selected.name;
        blueprint.tagline = selected.tagline;
        blueprint.features = selected.features;
        blueprint.frontend_pages = selected.pages;
        blueprint.roadmap = selected.roadmap;
        blueprint.updated_at = new Date().toISOString();
        snapshotBlueprint(blueprint, `Selected legal rebuild direction: ${selected.label}`);
      }
      saveState();
      renderAll();
      toast("Rick-C63 Vorschlag gewählt.");
    });
  });
}

function renderBuilderSettings() {
  const blueprint = getCurrentBlueprint();
  if (!blueprint) {
    els.builderSettings.innerHTML = "";
    return;
  }
  const targetId = state.builderTarget || "web-app";
  const target = buildTargets.find((item) => item.id === targetId) || buildTargets[0];
  const guidance = buildTargetGuidance(target.id);
  els.builderSettings.innerHTML = `
    <label>App name<input id="builderAppName" value="${escapeHtml(blueprint.project_name)}"></label>
    <label>What should it do?<textarea id="builderGoal" rows="3">${escapeHtml(blueprint.problem)}</textarea></label>
    <label>Delivery target<select id="builderTarget">
      ${buildTargets.map((item) => `<option value="${item.id}" ${state.builderTarget === item.id ? "selected" : ""}>${item.label} - ${item.level}</option>`).join("")}
    </select></label>
    <div class="delivery-honesty ${guidance.tone}">
      <span class="status-badge ${guidance.tone}">${escapeHtml(guidance.badge)}</span>
      <strong>${escapeHtml(target.label)} · ${escapeHtml(target.output)}</strong>
      <p>${escapeHtml(guidance.text)}</p>
    </div>
    <label>Main model<select id="builderMainModel">
      ${MODEL_CATALOG.map((item) => `<option value="${item.id}" ${state.selectedMainModel === item.id ? "selected" : ""}>${item.label} · ${item.provider} · ${item.tier}</option>`).join("")}
    </select></label>
    <label>Coding model<select id="builderCodingModel">
      ${MODEL_CATALOG.map((item) => `<option value="${item.id}" ${state.selectedCodingModel === item.id ? "selected" : ""}>${item.label} · ${item.provider} · ${item.tier}</option>`).join("")}
    </select></label>
    <div class="button-row">
      <button class="secondary-button" type="button" id="presetFreeOnly">Free only preset</button>
      <button class="secondary-button" type="button" id="presetBestQuality">Best quality preset</button>
    </div>
    <label>Feeling<select id="builderFeeling">
      ${["Cosmic premium", "Developer cockpit", "Creative studio", "Conversion machine", "Learning engine"].map((item) => `<option ${state.builderFeeling === item ? "selected" : ""}>${item}</option>`).join("")}
    </select></label>
    <div class="delivery-honesty ready">
      <span class="status-badge ready">Model choices</span>
      <strong>Main: ${escapeHtml(getModelById(state.selectedMainModel)?.label || "GPT-5.4 Codex")}</strong>
      <p>Coding: ${escapeHtml(getModelById(state.selectedCodingModel)?.label || "GPT-5.4 Codex")}. Codex ist standardmäßig gesetzt; dazu 5 starke Free-Modelle plus weitere Premium-Optionen.</p>
    </div>
    <button class="secondary-button full-width" id="applyBuilderSettings">Apply Rick-C63 Settings</button>
  `;
  document.querySelector("#presetFreeOnly").addEventListener("click", () => {
    document.querySelector("#builderMainModel").value = "oss";
    document.querySelector("#builderCodingModel").value = "code";
    toast("Free-only Preset gesetzt.");
  });
  document.querySelector("#presetBestQuality").addEventListener("click", () => {
    document.querySelector("#builderMainModel").value = "codex";
    document.querySelector("#builderCodingModel").value = "codex";
    toast("Best-quality Preset gesetzt.");
  });
  document.querySelector("#applyBuilderSettings").addEventListener("click", () => {
    blueprint.project_name = document.querySelector("#builderAppName").value.trim() || blueprint.project_name;
    blueprint.problem = document.querySelector("#builderGoal").value.trim() || blueprint.problem;
    state.builderTarget = document.querySelector("#builderTarget").value;
    state.selectedMainModel = document.querySelector("#builderMainModel").value;
    state.selectedCodingModel = document.querySelector("#builderCodingModel").value;
    state.builderFeeling = document.querySelector("#builderFeeling").value;
    saveState();
    renderAll();
    toast("Builder-Einstellungen gespeichert.");
  });
}

function getModelById(id) {
  return MODEL_CATALOG.find((item) => item.id === id) || MODEL_CATALOG[0];
}

function renderBlueprintEditor() {
  const blueprint = getCurrentBlueprint();
  if (!els.blueprintEditor || !blueprint) {
    if (els.blueprintEditor) els.blueprintEditor.innerHTML = "";
    return;
  }
  const versions = (state.blueprintVersions || []).filter((item) => item.blueprint_id === blueprint.id);
  els.blueprintEditor.innerHTML = `
    <div class="section-heading">
      <span>Rick-C63 Blueprint Workshop</span>
      <small>Bearbeite den Software-Bauplan direkt oder ändere ihn im Planning Studio zusammen mit Rick.</small>
    </div>
    <div class="blueprint-editor-grid">
      <label>App name<input id="workshopName" value="${escapeHtml(blueprint.project_name)}"></label>
      <label>Tagline<input id="workshopTagline" value="${escapeHtml(blueprint.tagline)}"></label>
      <label class="wide">Problem solved<textarea id="workshopProblem" rows="3">${escapeHtml(blueprint.problem)}</textarea></label>
      <label>Features, one per line<textarea id="workshopFeatures" rows="7">${escapeHtml((blueprint.features || []).join("\n"))}</textarea></label>
      <label>Pages, one per line<textarea id="workshopPages" rows="7">${escapeHtml((blueprint.frontend_pages || []).join("\n"))}</textarea></label>
      <label class="wide">Development roadmap, one per line<textarea id="workshopRoadmap" rows="6">${escapeHtml((blueprint.roadmap || []).join("\n"))}</textarea></label>
    </div>
    <div class="button-row">
      <button class="primary-button" id="saveWorkshopBlueprint">Save Blueprint Version</button>
      <button class="secondary-button" id="openPlanningStudio">Continue with Rick-C63</button>
    </div>
    <p class="muted">${versions.length} gespeicherte Bauplan-Version${versions.length === 1 ? "" : "en"}. Der Builder verwendet immer den neuesten Stand.</p>
  `;
  document.querySelector("#saveWorkshopBlueprint").addEventListener("click", () => {
    blueprint.project_name = document.querySelector("#workshopName").value.trim() || blueprint.project_name;
    blueprint.tagline = document.querySelector("#workshopTagline").value.trim() || blueprint.tagline;
    blueprint.problem = document.querySelector("#workshopProblem").value.trim() || blueprint.problem;
    blueprint.features = linesFrom("#workshopFeatures", blueprint.features);
    blueprint.frontend_pages = linesFrom("#workshopPages", blueprint.frontend_pages);
    blueprint.roadmap = linesFrom("#workshopRoadmap", blueprint.roadmap);
    blueprint.updated_at = new Date().toISOString();
    snapshotBlueprint(blueprint, "Blueprint Workshop save");
    saveState();
    renderAll();
    toast("Neue Bauplan-Version gespeichert.");
  });
  document.querySelector("#openPlanningStudio").addEventListener("click", () => {
    state.chatMode = "plan";
    saveState();
    routeTo("chat");
    els.chatInput.focus();
  });
}

function linesFrom(selector, fallback = []) {
  const values = document.querySelector(selector).value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  return values.length ? uniqueList(values) : fallback;
}

function snapshotBlueprint(blueprint, reason) {
  state.blueprintVersions = state.blueprintVersions || [];
  state.blueprintVersions.unshift({
    id: id("blueprint-version"),
    blueprint_id: blueprint.id,
    reason,
    blueprint: structuredClone(blueprint),
    created_at: new Date().toISOString()
  });
  state.blueprintVersions = state.blueprintVersions.slice(0, 60);
}

function renderEmpire() {
  const projects = state.empireProjects;
  const avg = (key) => projects.length ? Math.round(projects.reduce((sum, project) => sum + (Number(project[key]) || 0), 0) / projects.length) : 0;
  els.empireStats.innerHTML = [
    stat("Projects", projects.length),
    stat("Avg Legal Safety", avg("legal_safety_score")),
    stat("Avg Monetization", avg("monetization_score")),
    stat("Blueprints", state.blueprints.length)
  ].join("");
  els.empireProjects.innerHTML = projects.length ? projects.map(projectCard).join("") : emptyState("The Empire Dashboard is waiting for its first saved project.");
  wireProjectButtons(els.empireProjects);
  els.empireProjects.querySelectorAll("[data-status]").forEach((select) => {
    select.addEventListener("change", () => {
      const project = state.empireProjects.find((item) => item.id === select.dataset.status);
      project.status = select.value;
      project.updated_at = new Date().toISOString();
      saveState();
      renderEmpire();
      toast("Project status updated.");
    });
  });
}

function renderTraining() {
  if (!els.trainingJobs || !els.trainingStatus) return;
  const jobs = state.trainingJobs || [];
  const current = getCurrentTrainingJob();
  const counts = {
    total: jobs.length,
    running: jobs.filter((job) => job.status === "running").length,
    done: jobs.filter((job) => job.status === "complete" || job.status === "partial").length,
    failed: jobs.filter((job) => job.status === "failed").length
  };
  els.trainingStatus.innerHTML = [
    stat("Jobs", counts.total),
    stat("Running", counts.running),
    stat("Done", counts.done),
    stat("Failed", counts.failed)
  ].join("");
  const active = current
    ? `<div class="training-active">
        <strong>${escapeHtml(current.topic)}</strong>
        <span>${escapeHtml(current.phase || "ready")}  /  ${escapeHtml(current.status || "queued")}  /  ${current.stats?.sources || 0} sources  /  ${current.stats?.examples || 0} examples</span>
        <small>${current.package?.url ? `Package: ${current.package.url}` : "No package exported yet."}</small>
        <small>${current.hf?.job_url ? `HF job: ${current.hf.job_url}` : "HF job not launched yet."}</small>
      </div>`
    : `<div class="training-active empty">No active training job selected.</div>`;
  els.trainingStatus.insertAdjacentHTML("beforeend", active);
  els.trainingJobs.innerHTML = jobs.length
    ? jobs.map(trainingJobCard).join("")
    : emptyState("No training jobs yet. Define a topic, public seeds and start the automation.");
  els.trainingJobs.querySelectorAll("[data-training-open]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentTrainingJobId = button.dataset.trainingOpen;
      saveState();
      renderTraining();
      toast("Training job selected.");
    });
  });
  els.trainingJobs.querySelectorAll("[data-training-run]").forEach((button) => {
    button.addEventListener("click", () => runTrainingJob(button.dataset.trainingRun));
  });
  els.trainingJobs.querySelectorAll("[data-training-export]").forEach((button) => {
    button.addEventListener("click", () => exportTrainingJob(button.dataset.trainingExport));
  });
  els.trainingJobs.querySelectorAll("[data-training-launch]").forEach((button) => {
    button.addEventListener("click", () => launchTrainingJob(button.dataset.trainingLaunch));
  });
}

function renderAudit() {
  if (!els.auditHero || !els.auditStats || !els.auditFindings || !els.auditNextSteps) return;
  const audit = state.projectAudit || buildProjectAudit(api.health, api.doctor);
  const checked = audit.checked_at ? new Date(audit.checked_at).toLocaleString() : "not checked";
  els.auditHero.innerHTML = `
    <div>
      <span class="status-badge ${audit.score >= 80 ? "complete" : "running"}">${escapeHtml(audit.status)}</span>
      <h2>${audit.score}/100 project readiness</h2>
      <p>${escapeHtml(audit.summary)}</p>
      <small>Last check: ${escapeHtml(checked)}</small>
    </div>
  `;
  els.auditStats.innerHTML = (audit.health || []).map((item) => `
    <div class="stat-card audit-stat ${item.ok ? "ok" : "needs-work"}">
      <strong>${escapeHtml(item.value)}</strong>
      <span>${escapeHtml(item.label)}</span>
    </div>
  `).join("");
  els.auditFindings.innerHTML = (audit.findings || []).map((group) => `
    <article class="audit-card ${escapeHtml(group.tone || "work")}">
      <h3>${escapeHtml(group.title)}</h3>
      ${list(group.items || [])}
    </article>
  `).join("");
  els.auditNextSteps.innerHTML = list(audit.nextSteps || []);
}

function getCurrentTrainingJob() {
  return state.trainingJobs?.find((job) => job.id === state.currentTrainingJobId) || state.trainingJobs?.[0] || null;
}

function trainingJobCard(job) {
  const selected = job.id === state.currentTrainingJobId;
  const statusClass = String(job.status || "queued");
  const packageUrl = job.package?.url || job.package?.folder_url || "";
  const hfJobUrl = job.hf?.job_url || "";
  return `<article class="training-job-card ${selected ? "selected" : ""}">
    <div class="tag-row">
      <span class="status-badge ${statusClass}">${escapeHtml(job.status || "queued")}</span>
      <span class="tag">${escapeHtml(job.phase || "ready")}</span>
      ${job.hf?.job_id ? `<span class="tag">HF ${escapeHtml(job.hf.status || "submitted")}</span>` : ""}
    </div>
    <h3>${escapeHtml(job.topic || "Untitled training job")}</h3>
    <p>${escapeHtml(job.objective || "")}</p>
    <div class="training-meta">
      <span>Model: ${escapeHtml(job.base_model || "n/a")}</span>
      <span>Flavor: ${escapeHtml(job.hf_flavor || "a10g-small")}</span>
      <span>Pages: ${job.max_pages || 0}</span>
      <span>Depth: ${job.max_depth || 0}</span>
      <span>Sources: ${job.stats?.sources || 0}</span>
      <span>Examples: ${job.stats?.examples || 0}</span>
    </div>
    <div class="training-meta">
      <span>Dataset repo: ${escapeHtml(job.hf?.dataset_repo || "pending")}</span>
      <span>Model repo: ${escapeHtml(job.hf?.model_repo || "pending")}</span>
    </div>
    ${packageUrl ? `<a class="package-link" href="${packageUrl}" target="_blank" rel="noreferrer">Open package</a>` : `<span class="muted">Package not exported yet.</span>`}
    ${hfJobUrl ? `<a class="package-link" href="${hfJobUrl}" target="_blank" rel="noreferrer">Open Hugging Face job</a>` : ""}
    ${job.last_error ? `<div class="training-error">${escapeHtml(job.last_error)}</div>` : ""}
    <div class="button-row">
      <button class="secondary-button" data-training-open="${escapeHtml(job.id)}">Select</button>
      <button class="secondary-button" data-training-run="${escapeHtml(job.id)}">Run again</button>
      <button class="secondary-button" data-training-export="${escapeHtml(job.id)}">Export</button>
      <button class="secondary-button" data-training-launch="${escapeHtml(job.id)}">${job.hf?.job_id ? "Re-launch HF" : "Launch HF"}</button>
    </div>
    <details>
      <summary>Logs</summary>
      <div class="training-logs">${(job.logs || []).slice(0, 6).map((line) => `<div>${escapeHtml(line)}</div>`).join("") || "<div>No logs yet.</div>"}</div>
    </details>
  </article>`;
}

async function handleTrainingSubmit(event) {
  event.preventDefault();
  const payload = buildTrainingJobInput();
  if (!payload.topic) {
    toast("Please enter a training topic.");
    return;
  }
  if (!api.available) {
    toast("Backend offline. Start npm start to run the automation.");
    return;
  }
  if (!(await requireAdminAccess("Training-Automation starten"))) return;
  const createResponse = await apiPost("/api/training/jobs", { job: payload });
  if (!createResponse?.ok || !createResponse.job) {
    toast("Training job could not be created.");
    return;
  }
  upsertTrainingJob(createResponse.job);
  state.currentTrainingJobId = createResponse.job.id;
  saveState();
  renderTraining();
  toast("Training job created. Collecting public sources now.");

  const runResponse = await apiPost(`/api/training/jobs/${createResponse.job.id}/run`, { options: {} });
  if (!runResponse?.ok || !runResponse.job) {
    toast("Training run failed to start.");
    return;
  }
  upsertTrainingJob(runResponse.job);
  state.currentTrainingJobId = runResponse.job.id;
  saveState();
  renderAll();
  toast(runResponse.job.status === "complete" ? "Training package completed." : "Training completed with warnings.");

  if (payload.launchOnHf) {
    await launchTrainingJob(runResponse.job.id);
  }
}

function buildTrainingJobInput() {
  return {
    topic: els.trainingTopic?.value?.trim() || "",
    objective: els.trainingObjective?.value?.trim() || "",
    seedUrls: els.trainingSeeds?.value || "",
    allowedDomains: els.trainingDomains?.value || "",
    maxPages: els.trainingPages?.value || 12,
    maxDepth: els.trainingDepth?.value || 1,
    baseModel: els.trainingModel?.value || "",
    hfNamespace: els.trainingNamespace?.value?.trim() || "",
    hfFlavor: els.trainingFlavor?.value || "a10g-small",
    autoDiscover: Boolean(els.trainingAutoDiscover?.checked),
    hfPrivateDataset: Boolean(els.trainingPrivateDataset?.checked),
    hfPrivateModel: Boolean(els.trainingPrivateModel?.checked),
    launchOnHf: Boolean(els.trainingLaunchHf?.checked)
  };
}

async function runTrainingJob(jobId) {
  if (!api.available) {
    toast("Backend offline. Training jobs need the local server.");
    return;
  }
  if (!(await requireAdminAccess("Training-Job ausführen"))) return;
  const response = await apiPost(`/api/training/jobs/${jobId}/run`, { options: {} });
  if (!response?.ok || !response.job) {
    toast("Training run failed.");
    return;
  }
  upsertTrainingJob(response.job);
  state.currentTrainingJobId = response.job.id;
  saveState();
  renderTraining();
  toast(response.job.status === "complete" ? "Training job finished." : "Training job finished with warnings.");
}

async function exportTrainingJob(jobId) {
  if (!api.available) {
    toast("Backend offline. Export needs the local server.");
    return;
  }
  if (!(await requireAdminAccess("Training-Paket exportieren"))) return;
  const response = await apiPost(`/api/training/jobs/${jobId}/export`, {});
  if (!response?.ok || !response.job) {
    toast("Training export failed.");
    return;
  }
  upsertTrainingJob(response.job);
  state.currentTrainingJobId = response.job.id;
  saveState();
  renderTraining();
  toast("Training package exported.");
}

async function launchTrainingJob(jobId) {
  if (!api.available) {
    toast("Backend offline. Hugging Face launch needs the local server.");
    return;
  }
  if (!(await requireAdminAccess("Hugging Face Job starten"))) return;
  const response = await apiPost(`/api/training/jobs/${jobId}/hf-launch`, { options: {} });
  if (!response?.ok || !response.job) {
    toast("Hugging Face launch failed.");
    return;
  }
  upsertTrainingJob(response.job);
  state.currentTrainingJobId = response.job.id;
  saveState();
  renderAll();
  if (response.job.status === "failed") {
    toast(response.job.last_error || "Hugging Face launch failed.");
    return;
  }
  toast(response.job.hf?.job_id ? "Hugging Face job submitted." : "Training launched on Hugging Face.");
}

function upsertTrainingJob(job) {
  const items = state.trainingJobs || [];
  const filtered = items.filter((item) => item.id !== job.id);
  state.trainingJobs = [job, ...filtered];
}

function wireProjectButtons(root) {
  root.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.openProject));
  });
  root.querySelectorAll("[data-view-product]").forEach((button) => {
    button.addEventListener("click", () => viewProjectProduct(button.dataset.viewProduct));
  });
}

function openProject(projectId) {
  const project = state.empireProjects.find((item) => item.id === projectId);
  if (!project) return;
  const blueprint = state.blueprints.find((item) => item.id === project.blueprint_id);
  if (blueprint) {
    state.currentBlueprintId = blueprint.id;
    state.currentReportId = blueprint.report_id;
  }
  remember(`Opened project: ${project.name}`);
  saveState();
  renderAll();
  routeTo("chat");
  addChatMessage("agent", `${rickVoiceLine("memory")}\n\nProjekt geladen: ${project.name}.\n\nIch habe den Bauplan, Status und naechsten Schritt wieder im Kopf. Sag mir jetzt, ob wir analysieren, verbessern, verbinden oder entwickeln sollen.`);
}

function viewProjectProduct(projectId) {
  const project = state.empireProjects.find((item) => item.id === projectId);
  if (!project) return;
  const blueprint = state.blueprints.find((item) => item.id === project.blueprint_id);
  const report = blueprint ? state.reports.find((item) => item.id === blueprint.report_id) : null;
  const product = project.product_package || (blueprint && report ? generateProductPackage(blueprint, report, "View product") : null);
  if (!product) {
    toast("Noch kein Produktpaket vorhanden.");
    return;
  }
  openModal("Saved Product Package", renderProductPackage(product));
}

function addCurrentBlueprintToEmpire() {
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
  if (!blueprint) {
    toast("Create a report or blueprint first.");
    return;
  }
  const existing = state.empireProjects.find((project) => project.blueprint_id === blueprint.id);
  if (existing) {
    toast("This blueprint is already in the Empire Dashboard.");
    routeTo("empire");
    return;
  }
  ensureEmpireProjectForBlueprint(blueprint, getCurrentReport(), "Manually added from Builder.");
  saveState();
  renderAll();
  routeTo("empire");
  toast("Added to Empire Dashboard.");
}

function ensureEmpireProjectForBlueprint(blueprint, report, source = "Rick-C63") {
  if (!blueprint) return null;
  const existing = state.empireProjects.find((project) => project.blueprint_id === blueprint.id);
  if (existing) return existing;
  const now = new Date().toISOString();
  const product = report ? generateProductPackage(blueprint, report, source) : null;
  const project = {
    id: id("empire"),
    user_id: state.user.id,
    blueprint_id: blueprint.id,
    name: blueprint.project_name,
    description: blueprint.tagline,
    type: product?.type || "Software Product",
    status: "Blueprint Ready",
    priority: "High",
    difficulty_score: 72,
    monetization_score: 86,
    legal_safety_score: 94,
    next_step: "Open project, generate product package, then connect it to a page.",
    product_package: product,
    created_at: now,
    updated_at: now
  };
  state.empireProjects.unshift(project);
  return project;
}

function saveProductPackage(product, blueprint, report) {
  const project = ensureEmpireProjectForBlueprint(blueprint, report, "Product Generator");
  if (!project) return;
  project.product_package = product;
  project.status = "Building";
  project.next_step = "Connect this product package to one of your Erleuchtung pages.";
  project.updated_at = new Date().toISOString();
  remember(`Saved product package: ${product.name}`);
  saveState();
}

async function connectProductToPages() {
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
  const report = getCurrentReport();
  if (!blueprint || !report) {
    toast("Erst Projekt analysieren, dann verbinden.");
    return;
  }
  const product = generateProductPackage(blueprint, report, "Connect to pages");
  const project = ensureEmpireProjectForBlueprint(blueprint, report, "Connect Product to Pages");
  saveProductPackage(product, blueprint, report);

  if (!api.available) {
    openModal("Connect Product to My Pages", `<h3>${product.name}</h3><p>Backend offline. Das Produktpaket ist lokal gespeichert, aber fuer den echten Edit-Loop musst du den lokalen Server starten und dann einen Coding Workspace erzeugen.</p><h4>Naechster Schritt</h4><p>Starte <code>npm start</code>, entsperre Admin und verbinde das Produkt erneut. Dann wird automatisch ein editierbarer Workspace angelegt.</p>`);
    toast("Produkt lokal gespeichert. Fuer echten Edit-Loop braucht es den lokalen Server.");
    return;
  }

  if (!(await requireAdminAccess("Produkt mit Workspace verbinden"))) return;
  const sync = await apiPost("/api/db/sync", { db: state });
  if (!sync?.ok) {
    toast("Projektzustand konnte vor dem Verbinden nicht synchronisiert werden.");
    return;
  }

  await refreshWorkspaces();
  const existingWorkspace = (state.workspaces || []).find((item) => item.project_id === (project?.id || "") && item.adapter === "web-pwa");
  if (existingWorkspace?.id) {
    state.currentWorkspaceId = existingWorkspace.id;
    state.currentWorkspaceFile = "";
    await refreshWorkspaces(existingWorkspace.id);
    routeTo("workspace");
    openModal("Connect Product to My Pages", `<h3>${product.name}</h3><p>Verbindung steht bereits: Rick-C63 nutzt den vorhandenen Coding Workspace weiter, statt fuer denselben Empire-Project Duplikate anzulegen.</p><h4>Workspace</h4><p>${safe(existingWorkspace.name)} · ${safe(existingWorkspace.adapter_label || existingWorkspace.adapter)}</p><h4>Naechster Schritt</h4><p>Im Workspace kannst du weiter Dateien oeffnen, speichern, Preview laden und den allowlisted Check-/Test-Loop fahren.</p>`);
    toast("Vorhandenen Coding Workspace wiederverwendet.");
    return;
  }

  const workspaceName = `${blueprint.project_name || product.name} Workspace`;
  const workspaceResponse = await apiPost("/api/workspaces", {
    name: workspaceName,
    project_id: project?.id || "",
    adapter: "web-pwa"
  });

  if (!workspaceResponse?.workspace?.id) {
    openModal("Connect Product to My Pages", `<h3>${product.name}</h3><p>Das Produktpaket wurde synchronisiert, aber der editierbare Workspace konnte noch nicht erstellt werden.</p><h4>Aktuelle Ziel-Verbindungen</h4>${list(product.connections)}<h4>Fehler</h4><p>${safe(workspaceResponse?.error || "Workspace creation failed.")}</p>`);
    toast("Workspace konnte nicht erstellt werden.");
    return;
  }

  state.currentWorkspaceId = workspaceResponse.workspace.id;
  state.currentWorkspaceFile = "";
  await refreshWorkspaces(workspaceResponse.workspace.id);
  routeTo("workspace");
  openModal("Connect Product to My Pages", `<h3>${product.name}</h3><p>Verbindung steht: Rick-C63 hat einen echten Coding Workspace erzeugt, damit du die generierte Software weiter bearbeiten und pruefen kannst.</p><h4>Workspace</h4><p>${safe(workspaceResponse.workspace.name)} · ${safe(workspaceResponse.workspace.adapter_label || workspaceResponse.workspace.adapter)}</p><h4>Naechster Schritt</h4><p>Im Workspace kannst du jetzt Dateien oeffnen, speichern, Preview laden und den allowlisted Check-/Test-Loop fahren.</p>`);
  toast("Produkt mit echtem Coding Workspace verbunden.");
}

function generateTasks() {
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
  if (!blueprint) {
    toast("Create a blueprint first.");
    return;
  }
  const tasks = [
    "Create backend routes for targets, reports, blueprints and Empire projects.",
    "Connect persistent database tables to the required data model.",
    "Add provider adapter that uses OPENAI_API_KEY when present and demo responses when absent.",
    "Implement screenshot storage with MAX_UPLOAD_SIZE validation.",
    "Add legal safety tests for hacking, cloning, impersonation and private data requests.",
    "Build authenticated user sessions and user-scoped project access.",
    "Deploy MVP and monitor report generation quality."
  ];
  els.taskList.innerHTML = tasks.map((task) => `<li>${task}</li>`).join("");
  openModal("Generated Development Tasks", `<ol>${tasks.map((task) => `<li>${task}</li>`).join("")}</ol>`);
}

function exportPrompt() {
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
  if (!blueprint) {
    toast("Create a blueprint first.");
    return;
  }
  const prompt = `Build ${blueprint.project_name}\n\n${blueprint.tagline}\n\nPages:\n${blueprint.frontend_pages.map((item) => `- ${item}`).join("\n")}\n\nFeatures:\n${blueprint.features.map((item) => `- ${item}`).join("\n")}\n\nAPIs:\n${blueprint.api_routes.map((item) => `- ${item}`).join("\n")}\n\nSafety: refuse hacking, bypassing login, copying protected assets, stealing data, impersonation and malware-like behavior.`;
  downloadText("nemesis-blueprint-prompt.txt", prompt);
  toast("Export prompt downloaded.");
}

function addChatMessage(role, text) {
  const now = new Date().toISOString();
  if (!Array.isArray(state.sessions)) state.sessions = [];
  let session = state.sessions.find((item) => Array.isArray(item.messages));
  if (!session) {
    session = {
      id: id("session"),
      user_id: state.user.id,
      agent_name: "Rick-C63",
      title: "The Mad Genius Architect of Erleuchtung",
      messages: [],
      created_at: now,
      updated_at: now
    };
    state.sessions.unshift(session);
  }
  if (!Array.isArray(session.messages)) session.messages = [];
  session.messages.push({ role, text, created_at: now });
  session.updated_at = now;
  saveState();
  renderChat();
}

function greetRick() {
  if (state.sessions[0]?.messages?.length) {
    renderChat();
    return;
  }
  addChatMessage("agent", "Alright Elija, Rick-C63 online. We do not copy the shell. We extract the legal engine, upgrade the workflow, and turn it into your own Erleuchtung system.\n\nSend me a URL, screenshot, brand, product page or idea. I will give you the legal version, MVP version, empire version and next 3 smart moves.");
}

function renderChat() {
  const messages = state.sessions.find((item) => Array.isArray(item.messages))?.messages || [];
  els.chatMessages.innerHTML = messages.map((message) => `<div class="message ${message.role}">${escapeHtml(message.text)}</div>`).join("");
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function addThinking() {
  const node = document.createElement("div");
  node.className = "message agent thinking";
  node.id = "thinkingMessage";
  node.textContent = "Rick-C63 is firing up the brain lightning...";
  els.chatMessages.appendChild(node);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function removeThinking() {
  document.querySelector("#thinkingMessage")?.remove();
}

function fullReportCard(report) {
  const target = state.targets.find((item) => item.id === report.target_id);
  return `<article class="report-card">
    <div class="tag-row"><span class="tag">${safe(target?.input_type || "Target")}</span><span class="status-badge">${safe(target?.status || "Analyzed")}</span></div>
    <h3>${safe(target?.title || "Analysis Report")}</h3>
    <p>${safe(report.summary)}</p>
    ${reportSection("Detected category", [target?.category || "Full Erleuchtung Upgrade"])}
    ${reportSection("Main purpose", [report.purpose])}
    ${reportSection("Target audience", [report.target_audience])}
    ${reportSection("Visible features", report.visible_features)}
    ${reportSection("Design style", [report.design_style])}
    ${reportSection("Business model guess", [report.business_model])}
    ${reportSection("Strengths", report.strengths)}
    ${reportSection("Weaknesses", report.weaknesses)}
    ${reportSection("Legal risk areas", report.legal_risks)}
    ${reportSection("What not to copy", report.do_not_copy)}
    ${reportSection("Legal inspiration points", report.legal_inspiration_points)}
    ${reportSection("Evidence", (report.evidence || []).map((item) => `${item.kind}: ${item.claim}${item.source_url ? ` (${item.source_url})` : ""}`))}
    ${reportSection("Reusable evidence-backed patterns", (report.reusable_patterns || []).map((item) => `${item.name}: ${item.blueprint_feature}`))}
    ${reportSection("Scan limitations", report.scan_limitations || [])}
    ${reportSection("Upgrade opportunities", report.upgrade_opportunities)}
    ${reportSection("New original concept", [report.nemesis_upgrade_idea])}
    ${reportSection("Suggested app/module names", report.suggested_names)}
    ${reportSection("Recommended tech stack", report.tech_stack)}
    ${reportSection("Monetization ideas", report.monetization)}
    ${reportSection("MVP plan", report.mvp_plan)}
    ${reportSection("Full build plan", report.empire_plan)}
    <button class="primary-button full-width" data-blueprint-report="${safe(report.id)}">Create Blueprint</button>
  </article>`;
}

async function refreshWorkspaces(selectId = "") {
  if (!api.available) return;
  const response = await apiGet("/api/workspaces");
  if (!response?.items) return;
  state.workspaces = response.items;
  if (selectId) state.currentWorkspaceId = selectId;
  if (!state.currentWorkspaceId && state.workspaces[0]) state.currentWorkspaceId = state.workspaces[0].id;
  saveState();
  await loadCurrentWorkspace();
}

async function loadCurrentWorkspace() {
  const workspace = getCurrentWorkspace();
  if (!workspace || !api.available) {
    renderWorkspaces();
    return;
  }
  const detail = await apiGet(`/api/workspaces/${encodeURIComponent(workspace.id)}`);
  if (detail?.workspace) {
    state.workspaces = state.workspaces.map((item) => item.id === detail.workspace.id ? { ...item, ...detail.workspace, tree: detail.tree || [], runs: detail.runs || [] } : item);
  }
  renderWorkspaces();
}

async function createCodingWorkspace(event) {
  event.preventDefault();
  if (!(await requireAdminAccess("Workspace erstellen"))) return;
  const name = els.workspaceName.value.trim() || getCurrentBlueprint()?.project_name || "New Coding Workspace";
  const projectId = els.workspaceProject.value;
  const adapter = els.workspaceAdapter.value;
  const existingWorkspace = (state.workspaces || []).find((item) => item.project_id === projectId && item.adapter === adapter);
  if (projectId && existingWorkspace?.id) {
    state.currentWorkspaceId = existingWorkspace.id;
    state.currentWorkspaceFile = "";
    await refreshWorkspaces(existingWorkspace.id);
    routeTo("workspace");
    toast("Vorhandenen Workspace geöffnet.");
    return;
  }
  const sync = await apiPost("/api/db/sync", { db: state });
  if (!sync?.ok) {
    toast("Project state could not be synchronized before workspace creation.");
    return;
  }
  const response = await apiPost("/api/workspaces", {
    name,
    project_id: projectId,
    adapter
  });
  if (!response?.workspace) {
    toast("Workspace konnte nicht erstellt werden.");
    return;
  }
  els.workspaceName.value = "";
  await refreshWorkspaces(response.workspace.id);
  routeTo("workspace");
  toast("Secure coding workspace created.");
}

function getCurrentWorkspace() {
  return state.workspaces?.find((item) => item.id === state.currentWorkspaceId) || state.workspaces?.[0] || null;
}

function renderWorkspaces() {
  if (!els.workspaceList) return;
  const workspaces = state.workspaces || [];
  const current = getCurrentWorkspace();
  const preferredProjectId = current?.project_id || getCurrentEmpireProject()?.id || "";
  els.workspaceProject.innerHTML = `<option value="">No linked Empire project</option>${state.empireProjects.map((project) => `<option value="${safe(project.id)}" ${project.id === preferredProjectId ? "selected" : ""}>${safe(project.name)}</option>`).join("")}`;
  els.workspaceList.innerHTML = workspaces.length ? workspaces.map((workspace) => `
    <button class="mini-card workspace-select ${workspace.id === current?.id ? "selected" : ""}" data-workspace-id="${safe(workspace.id)}">
      <strong>${safe(workspace.name)}</strong>
      <span>${safe(workspace.adapter_label || workspace.adapter)} / ${safe(workspace.status)}</span>
      <small>${workspace.run_count || workspace.runs?.length || 0} runs</small>
    </button>`).join("") : emptyState("No coding workspace yet. Create one from a blueprint or Empire project.");
  els.workspaceList.querySelectorAll("[data-workspace-id]").forEach((button) => button.addEventListener("click", async () => {
    state.currentWorkspaceId = button.dataset.workspaceId;
    state.currentWorkspaceFile = "";
    await loadCurrentWorkspace();
  }));

  if (!current) {
    els.workspaceOverview.innerHTML = emptyState("Create a workspace to turn the blueprint into editable local project files.");
    els.workspaceTree.innerHTML = "";
    els.workspaceRuns.innerHTML = "";
    els.workspaceActivity.innerHTML = "";
    els.workspaceEditor.value = "";
    return;
  }
  const linkedProject = state.empireProjects.find((project) => project.id === current.project_id);
  els.workspaceOverview.innerHTML = `
    <div><span class="status-badge ${current.status === "verified" ? "complete" : "running"}">${safe(current.status)}</span>
    <h3>${safe(current.name)}</h3><p>${safe(current.adapter_label || current.adapter)} / ${safe(current.adapter_status)}</p><small>${safe(linkedProject ? `Linked Empire project: ${linkedProject.name}` : "No linked Empire project")}</small></div>
    <div class="workspace-capabilities"><strong>Capabilities</strong>${list(current.capabilities || [])}<strong>Readiness: ${safe(current.readiness?.level || "unknown")}</strong>${list((current.readiness?.checks || []).map((item) => `${item.label}: ${item.status} - ${item.detail}`))}<strong>Limits</strong>${list(current.limits || [])}</div>`;
  if (els.workspacePreviewButton) {
    els.workspacePreviewButton.disabled = !current.preview_url;
    els.workspacePreviewButton.title = current.readiness?.preview?.detail || "";
  }
  const tree = current.tree || [];
  els.workspaceTree.innerHTML = tree.length ? tree.map((item) => item.type === "directory"
    ? `<div class="workspace-directory">${safe(item.path)}/</div>`
    : `<button data-workspace-file="${safe(item.path)}" ${item.editable ? "" : "disabled"}>${safe(item.path)} <small>${item.size} B</small></button>`).join("")
    : "<p class=\"muted\">Load the workspace to inspect its files.</p>";
  els.workspaceTree.querySelectorAll("[data-workspace-file]").forEach((button) => button.addEventListener("click", () => openWorkspaceFile(button.dataset.workspaceFile)));
  els.workspaceRuns.innerHTML = (current.runs || []).length ? current.runs.map((run) => `
    <article class="workspace-run ${safe(run.status)}">
      <div><strong>${safe(run.command)}</strong><span class="status-badge ${run.status === "passed" ? "complete" : "failed"}">${safe(run.status)}</span><small>${run.duration_ms} ms</small></div>
      <pre>${safe(run.output || "No output")}</pre>
    </article>`).join("") : "<p class=\"muted\">No build or test runs yet.</p>";
  els.workspaceActivity.innerHTML = (current.activity || []).length ? current.activity.slice(0, 8).map((item) => `
    <div class="workspace-activity-item"><strong>${safe(item.type)}</strong><span>${safe(item.detail)}</span><small>${safe(new Date(item.created_at).toLocaleString())}</small></div>
  `).join("") : "<p class=\"muted\">No workspace activity yet.</p>";
}

async function openWorkspaceFile(path) {
  const workspace = getCurrentWorkspace();
  if (!workspace) return;
  const response = await apiGet(`/api/workspaces/${encodeURIComponent(workspace.id)}/file?path=${encodeURIComponent(path)}`);
  if (!response?.ok) {
    toast("File could not be opened.");
    return;
  }
  state.currentWorkspaceFile = response.path;
  els.workspaceFileLabel.textContent = response.path;
  els.workspaceEditor.value = response.content;
}

function openWorkspacePreview() {
  const workspace = getCurrentWorkspace();
  if (!workspace?.preview_url) {
    toast("This adapter has no browser preview. Review its external toolchain requirements.");
    return;
  }
  openModal(`${workspace.name} Preview`, `<iframe class="workspace-preview-frame" src="${safe(workspace.preview_url)}" title="${safe(workspace.name)} preview" sandbox="allow-scripts"></iframe>`);
}

async function saveWorkspaceFile() {
  const workspace = getCurrentWorkspace();
  if (!workspace || !state.currentWorkspaceFile) {
    toast("Select an editable workspace file first.");
    return;
  }
  if (!(await requireAdminAccess("Workspace-Datei speichern"))) return;
  const response = await apiPost(`/api/workspaces/${encodeURIComponent(workspace.id)}/file`, {
    path: state.currentWorkspaceFile,
    content: els.workspaceEditor.value
  });
  if (!response?.ok) {
    toast("File save failed.");
    return;
  }
  await loadCurrentWorkspace();
  toast(`${state.currentWorkspaceFile} saved.`);
}

async function runWorkspaceLoop(command) {
  const workspace = getCurrentWorkspace();
  if (!workspace) {
    toast("Create or select a workspace first.");
    return;
  }
  if (!(await requireAdminAccess(`Workspace ${command}`))) return;
  toast(`Running allowlisted ${command} command...`);
  const response = await apiPost(`/api/workspaces/${encodeURIComponent(workspace.id)}/run`, { command });
  if (!response?.run) {
    toast("Workspace command failed to start.");
    return;
  }
  await refreshWorkspaces(workspace.id);
  toast(`${command}: ${response.run.status} in ${response.run.duration_ms} ms.`);
}

function miniReportCard(report) {
  const target = state.targets.find((item) => item.id === report.target_id);
  return `<div class="mini-card"><h3>${safe(target?.title || "Analysis")}</h3><p>${safe(report.summary)}</p><div class="tag-row"><span class="tag">${safe(target?.category || "Analysis")}</span></div><button class="secondary-button full-width" data-open-report="${safe(report.id)}">Open Report</button></div>`;
}

function projectCard(project) {
  const status = project.status || "Blueprint Ready";
  const priority = project.priority || "Normal";
  const monetization = Number.isFinite(project.monetization_score) ? project.monetization_score : 0;
  const difficulty = Number.isFinite(project.difficulty_score) ? project.difficulty_score : 0;
  const legal = Number.isFinite(project.legal_safety_score) ? project.legal_safety_score : 0;
  return `<article class="project-card">
    <div class="tag-row"><span class="status-badge">${safe(status)}</span><span class="tag">${safe(priority)} priority</span></div>
    <h3>${safe(project.name || "Untitled project")}</h3>
    <p>${safe(project.description || "No project description yet.")}</p>
    <p><strong>Next step:</strong> ${safe(project.next_step || "Review and save the blueprint.")}</p>
    <div class="tag-row">
      <span class="tag">Money ${monetization}</span>
      <span class="tag">Difficulty ${difficulty}</span>
      <span class="tag">Legal ${legal}</span>
    </div>
    <div class="button-row">
      <button class="secondary-button" data-open-project="${safe(project.id)}">Open</button>
      <button class="secondary-button" data-view-product="${safe(project.id)}">Product</button>
    </div>
    <label>Status
      <select data-status="${safe(project.id)}">
        ${["Idea", "Analyzed", "Blueprint Ready", "Building", "Testing", "Launched", "Archived"].map((option) => `<option ${option === status ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  </article>`;
}

function reportSection(title, items) {
  return `<div class="report-section"><h4>${safe(title)}</h4>${list(items)}</div>`;
}

function block(title, value, extraClass = "") {
  return `<div class="blueprint-block ${extraClass}"><h4>${title}</h4><div>${Array.isArray(value) ? list(value) : value}</div></div>`;
}

function list(items) {
  if (!Array.isArray(items)) return `<p>${safe(items)}</p>`;
  return `<ul>${items.map((item) => `<li>${safe(typeof item === "string" ? item : JSON.stringify(item))}</li>`).join("")}</ul>`;
}

function stat(label, value) {
  return `<div class="stat-card"><strong>${safe(value)}</strong><span>${safe(label)}</span></div>`;
}

function emptyState(message) {
  return `<div class="mini-card"><p>${safe(message)}</p></div>`;
}

function getCurrentReport() {
  return state.reports.find((report) => report.id === state.currentReportId) || state.reports[0] || null;
}

function getCurrentBlueprint() {
  return state.blueprints.find((blueprint) => blueprint.id === state.currentBlueprintId) || state.blueprints[0] || null;
}

function getCurrentTarget() {
  const report = getCurrentReport();
  return report ? state.targets.find((target) => target.id === report.target_id) : state.targets[0] || null;
}

function seedIfEmpty() {
  if (state.reports.length) return;
  const target = createTarget({
    text: "A premium app that turns public URLs, screenshots, brands and business ideas into legal upgraded blueprints.",
    inputType: "Text description of an app/business idea",
    analysisType: "Full Erleuchtung Upgrade"
  });
  const report = createAnalysisReport(target, "Full Erleuchtung Upgrade");
  createBlueprintFromReport(report);
}

function loadState() {
  try {
    const saved = migrateState(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
    return {
      ...structuredClone(defaultState),
      ...saved,
      memories: saved.memories || [],
      blueprintVersions: saved.blueprintVersions || [],
      trainingJobs: saved.trainingJobs || [],
      workspaces: saved.workspaces || [],
      currentTrainingJobId: saved.currentTrainingJobId || null,
      projectAudit: saved.projectAudit || null
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(migrateState(state)));
}

function migrateState(value) {
  if (Array.isArray(value)) {
    return value.map((item) => migrateState(item));
  }
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? rewriteBrandText(value) : value;
  }
  const migrated = {};
  for (const [key, item] of Object.entries(value)) {
    migrated[key] = migrateState(item);
  }
  return migrated;
}

function rewriteBrandText(value) {
  if (typeof value !== "string") return value;
  return value
    .replaceAll(/Nemesis Droidijana -63/gi, BRAND.fullName)
    .replaceAll(/Nemesis Droidijana/gi, BRAND.shortName)
    .replaceAll(/Nemesis/gi, BRAND.shortName)
    .replaceAll(/Nox/gi, BRAND.crewName)
    .replaceAll(/nox/gi, BRAND.crewName)
    .replaceAll(/Virus/gi, BRAND.shortName);
}

function refreshCurrentSession() {
  state.sessions = [];
  remember("Current chat session refreshed. Long-term project memory stayed alive.");
  greetRick();
  saveState();
  renderAll();
  routeTo("chat");
  toast("Aktuelle Sitzung neu gestartet. Projekte und Erinnerungen bleiben gespeichert.");
}

function clearInputs() {
  revokePreviewObjectUrl();
  els.targetUrl.value = "";
  els.targetText.value = "";
  els.targetFile.value = "";
  els.previewArea.innerHTML = "";
  els.previewArea.classList.add("hidden");
}

function revokePreviewObjectUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }
}

function guessTitle(url, text, fallback) {
  if (url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return fallback;
    }
  }
  if (text) return text.split(/\s+/).slice(0, 6).join(" ");
  return fallback;
}

function openModal(title, body) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = body;
  els.modal.classList.remove("hidden");
}

function closeModal() {
  els.modal.classList.add("hidden");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2800);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  downloadBlob(filename, blob, "text/plain");
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function createStandalonePwaBundle(product, formats = ["web"]) {
  const expanded = expandGeneratedProduct(product);
  const icon192 = createPngIconDataUrl(expanded, 192);
  const icon512 = createPngIconDataUrl(expanded, 512);
  const files = {
    "index.html": standalonePwaHtml(expanded),
    "app.js": standaloneProductJs(expanded),
    "styles.css": standaloneProductCss(expanded),
    "manifest.webmanifest": JSON.stringify({
      name: expanded.name,
      short_name: expanded.name.slice(0, 24),
      description: expanded.pitch || "Generated app",
      start_url: "./index.html",
      scope: "./",
      display: "standalone",
      background_color: expanded.palette?.bg || "#050610",
      theme_color: expanded.palette?.bg || "#050610",
      icons: [
        { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    }, null, 2),
    "sw.js": standalonePwaServiceWorker(),
    "product.json": JSON.stringify(expanded, null, 2),
    "README-PWABUILDER.txt": `PWABuilder upload package for ${expanded.name}.\n\nOpen or host these files and point PWABuilder at the app URL.\nFormats requested: ${formats.join(", ")}.\n`
  };
  const binaryFiles = {
    "icons/icon-192.png": dataUrlToUint8Array(icon192),
    "icons/icon-512.png": dataUrlToUint8Array(icon512)
  };
  const zip = createBrowserZip(files, binaryFiles);
  return {
    filename: `${expanded.slug || "generated-app"}-pwabuilder-upload.zip`,
    blob: new Blob([zip], { type: "application/zip" }),
    mimeType: "application/zip"
  };
}

function standalonePwaHtml(product) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${escapeHtml(product.palette?.bg || "#050610")}">
  <meta name="description" content="${escapeHtml(product.pitch || "Generated app")}">
  <title>${escapeHtml(product.name)}</title>
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
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
      <p class="delivery">PWA / Complete standalone app</p>
      <div class="actions">
        <button id="saveProject">Save Project</button>
        <button id="generatePlan">Generate Plan</button>
        <button id="exportSummary">Export JSON</button>
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
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
    }
  </script>
  <script src="app.js"></script>
</body>
</html>`;
}

function standalonePwaServiceWorker() {
  return `const CACHE_NAME = 'rick-c63-generated-pwa-v1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('./index.html'))));
});`;
}

function createPngIconDataUrl(product, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const palette = product.palette || { bg: '#050610', accent: '#53ff9d', second: '#1dbdff', third: '#ff3edb' };
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(size * 0.5, size * 0.45, size * 0.08, size * 0.5, size * 0.5, size * 0.48);
  grad.addColorStop(0, palette.accent);
  grad.addColorStop(0.45, palette.second);
  grad.addColorStop(1, palette.third);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = Math.max(6, size * 0.03);
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#03131d';
  ctx.font = `${Math.round(size * 0.2)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R63', size * 0.5, size * 0.52);
  return canvas.toDataURL('image/png');
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function createBrowserZip(textFiles, binaryFiles = {}) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const entries = [
    ...Object.entries(textFiles).map(([name, content]) => [name, new TextEncoder().encode(String(content ?? ''))]),
    ...Object.entries(binaryFiles)
  ];
  for (const [name, data] of entries) {
    const fileName = new TextEncoder().encode(name.replaceAll('\\', '/'));
    const crc = crc32(data);
    const local = new Uint8Array(30 + fileName.length + data.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, fileName.length, true);
    local.set(fileName, 30);
    local.set(data, 30 + fileName.length);
    localParts.push(local);

    const central = new Uint8Array(46 + fileName.length);
    const cview = new DataView(central.buffer);
    cview.setUint32(0, 0x02014b50, true);
    cview.setUint16(4, 20, true);
    cview.setUint16(6, 20, true);
    cview.setUint32(16, crc, true);
    cview.setUint32(20, data.length, true);
    cview.setUint32(24, data.length, true);
    cview.setUint16(28, fileName.length, true);
    cview.setUint32(42, offset, true);
    central.set(fileName, 46);
    centralParts.push(central);
    offset += local.length;
  }
  const centralSize = centralParts.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  eview.setUint32(0, 0x06054b50, true);
  eview.setUint16(8, entries.length, true);
  eview.setUint16(10, entries.length, true);
  eview.setUint32(12, centralSize, true);
  eview.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end]);
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0 ^ (-1);
  for (let index = 0; index < bytes.length; index += 1) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]) & 0xff];
  return (crc ^ (-1)) >>> 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safe(value) {
  return escapeHtml(String(value ?? ""));
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
