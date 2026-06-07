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

const buildTargets = [
  { id: "web-app", label: "Web App", level: "Buildable now", tone: "ready", output: "Working responsive web app + ZIP" },
  { id: "pwa", label: "PWA / Mobile Web", level: "Buildable now", tone: "ready", output: "Installable-ready web foundation + ZIP" },
  { id: "desktop", label: "Windows Desktop", level: "Launcher export", tone: "partial", output: "Web app + Windows launcher build target" },
  { id: "native-mobile", label: "Native Mobile", level: "Scaffold plan", tone: "plan", output: "Product blueprint + Capacitor/Android build plan" },
  { id: "tool", label: "Automation Tool", level: "Buildable prototype", tone: "ready", output: "Working local UI + workflow package" },
  { id: "3d-game", label: "3D Game", level: "Design scaffold", tone: "plan", output: "Game design, systems blueprint and export package" },
  { id: "vr-game", label: "VR Experience", level: "Design scaffold", tone: "plan", output: "VR interaction blueprint and export package" }
];

const schema = {
  user: ["id", "name", "email", "plan", "created_at", "updated_at"],
  agentSession: ["id", "user_id", "agent_name", "title", "messages", "created_at", "updated_at"],
  analysisTarget: ["id", "user_id", "input_type", "url", "uploaded_file_url", "uploaded_file_name", "uploaded_file_size", "uploaded_file_type", "text_input", "title", "category", "status", "created_at", "updated_at"],
  analysisReport: ["id", "target_id", "summary", "purpose", "target_audience", "visible_features", "design_style", "business_model", "strengths", "weaknesses", "legal_risks", "do_not_copy", "legal_inspiration_points", "upgrade_opportunities", "nemesis_upgrade_idea", "suggested_names", "mvp_plan", "empire_plan", "tech_stack", "monetization", "created_at", "updated_at"],
  blueprint: ["id", "user_id", "report_id", "project_name", "tagline", "problem", "target_user", "features", "premium_features", "frontend_pages", "backend_services", "database_schema", "api_routes", "auth_requirements", "file_upload_requirements", "ai_requirements", "admin_requirements", "roadmap", "test_plan", "deployment_plan", "created_at", "updated_at"],
  empireProject: ["id", "user_id", "blueprint_id", "name", "description", "status", "priority", "difficulty_score", "monetization_score", "legal_safety_score", "next_step", "created_at", "updated_at"],
  trainingJob: ["id", "topic", "objective", "base_model", "seed_urls", "allowed_domains", "discovery_queries", "max_pages", "max_depth", "output_format", "dataset_style", "auto_discover", "hf_namespace", "hf_flavor", "hf_timeout", "hf_private_dataset", "hf_private_model", "launch_on_hf", "status", "phase", "progress", "stats", "package", "sources", "examples", "logs", "hf", "last_error", "created_at", "updated_at", "started_at", "finished_at"]
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
  memories: [],
  chatMode: "plan",
  planningNotes: [],
  blueprintVersions: [],
  currentReportId: null,
  currentBlueprintId: null,
  currentTrainingJobId: null,
  projectAudit: null,
  builderTarget: "web-app",
  adminSecurity: {
    configured: false,
    token: "",
    expires_at: ""
  }
};

let state = loadState();
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

function handleAnalysisSubmit(event) {
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

  const report = createAnalysisReport(target, analysisType);
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
  toast("Rick-C63 generated a legal analysis, blueprint and action cards.");
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

function createAnalysisReport(target, analysisType) {
  const now = new Date().toISOString();
  const concept = target.title;
  const metadata = fetchPublicPageMetadata(target.url);
  const imageSignals = analyzeImagePlaceholder(target.uploaded_file_name || target.uploaded_file_type || target.uploaded_file_url);
  const textSignals = analyzeTextIdea(target.text_input || analysisType);
  const archetype = inferProductArchetype(`${target.url} ${target.text_input} ${analysisType}`);
  const ideas = generateSourceIdeas(target, archetype);
  const report = {
    id: id("report"),
    target_id: target.id,
    summary: `${concept} looks like a ${textSignals.category} in the ${archetype.label} zone: it turns a messy user intention into a guided result. ${metadata.description}`,
    purpose: archetype.purpose,
    target_audience: archetype.audience,
    visible_features: [...archetype.features, "Outcome framing", ...imageSignals],
    design_style: archetype.design || buildDesignStyle(target.title, target.text_input),
    business_model: archetype.business || buildBusinessModel(target.title, target.text_input),
    strengths: archetype.strengths,
    weaknesses: archetype.weaknesses,
    legal_risks: ["Exact brand imitation", "Logo or name copying", "Copying protected text", "Cloning code or layout pixel-for-pixel", "Unauthorized scraping or private data access"],
    do_not_copy: ["Protected logos", "Protected names", "Exact page layout", "Source code", "Copyrighted copy", "Private data", "Access-control bypasses"],
    legal_inspiration_points: ["General workflow", "Problem category", "User journey logic", "Publicly visible feature pattern", "Business model mechanics", "Interaction principles"],
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
    features: report.mvp_plan,
    premium_features: report.empire_plan,
    frontend_pages: buildFrontendPages(report),
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

function analyzeImagePlaceholder(fileLabel) {
  const upload = uploadScreenshotPlaceholder(fileLabel);
  if (!upload.stored) return [];
  return ["Uploaded image preview", "Visual hierarchy scan placeholder", "Brand and layout inspiration check placeholder"];
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
      "Later connect to a real local build workspace"
    ],
    buildPhases: [
      `Phase 1: Lock the ${target.label} blueprint and save it`,
      `Phase 2: Generate ${target.output}`,
      "Phase 3: Review the working prototype and implementation package",
      "Phase 4: Continue the development loop with Rick-C63 and a coding workspace",
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
  if (!(await requireAdminAccess("Software-Generierung"))) return;
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
    if (build) {
      product.build = build;
      saveProductPackage(product, blueprint, report);
    }
  }
  const html = renderProductPackage(product);
  const buildHtml = build ? renderBuildResult(build) : "<p>Frontend-only mode: Produktpaket gespeichert. Starte den Backend-Server, damit echte Software erzeugt wird.</p>";
  els.builderOutput.innerHTML = `${html}${buildHtml}`;
  wireBuildPreviewButtons(els.builderOutput);
  openModal("Rick-C63 Software Generator", `${html}${buildHtml}`);
  wireBuildPreviewButtons(els.modalBody);
  toast(build ? "Software generiert. Du kannst sie jetzt öffnen." : "Produktpaket gespeichert. Backend starten fuer echte Software.");
}

function renderBuildResult(build) {
  return `<div class="builder-output">
    <h4>Fertige Software</h4>
    <p>Rick-C63 hat eine direkt öffnbare App gebaut.</p>
    <div class="button-row">
      <a class="primary-button" href="${build.url}" target="_blank" rel="noopener">Open Software</a>
      <button class="secondary-button" data-preview-url="${build.url}">Preview Here</button>
    </div>
    <p><strong>Ordner:</strong> ${build.dir}</p>
    <p><strong>Start:</strong> ${build.entry}</p>
  </div>`;
}

function wireBuildPreviewButtons(root) {
  root.querySelectorAll("[data-preview-url]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.dataset.previewUrl;
      const frame = document.createElement("iframe");
      frame.src = url;
      frame.title = "Generated software preview";
      frame.style.width = "100%";
      frame.style.minHeight = "620px";
      frame.style.border = "1px solid var(--line)";
      frame.style.borderRadius = "8px";
      frame.style.marginTop = "14px";
      button.closest(".builder-output").appendChild(frame);
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
    <p>Wähle, was Rick-C63 exportieren soll. Web/Codex/Cursor funktionieren sofort. EXE erzeugt eine echte Windows-Datei und signiert sie automatisch, sobald dein Authenticode-Zertifikat eingerichtet ist. AAB bleibt ein vorbereitetes Android-Build-Ziel.</p>
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
  if (!(await requireAdminAccess("Projekt-Export"))) return;
  const checked = [...document.querySelectorAll(".export-hub input:checked")].map((input) => input.value);
  const result = document.querySelector("#exportResult");
  result.innerHTML = "<p>Rick-C63 packt dein Projekt. Bitte kurz nicht an der Realität wackeln.</p>";
  if (!api.available) {
    result.innerHTML = "<p>Backend ist nicht online. Starte <code>node server.js</code>, dann kann Rick-C63 ZIPs bauen.</p>";
    return;
  }
  const response = await apiPost("/api/export/project", { product, formats: checked });
  if (!response?.ok) {
    result.innerHTML = "<p>Export fehlgeschlagen. Backend prüfen.</p>";
    return;
  }
  result.innerHTML = `<div class="builder-output">
    <h4>Export bereit</h4>
    <p>Formate: ${response.bundle.formats.join(", ")}</p>
    ${response.windowsExe ? `<p><strong>Windows EXE:</strong> ${response.windowsExe.signature_status}</p>
    <a class="secondary-button" href="${response.windowsExe.url}" download>Download Windows EXE</a>` : ""}
    <a class="primary-button" href="${response.bundle.url}" download>Download ZIP</a>
    <a class="secondary-button" href="${response.build.url}" target="_blank" rel="noopener">Open Web App</a>
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
    const doctor = await apiGet("/api/doctor");
    api.doctor = doctor?.doctor || null;
    state.projectAudit = buildProjectAudit(health, api.doctor);
    const status = await apiGet("/api/admin/status");
    if (status?.ok) {
      if (!state.adminSecurity) state.adminSecurity = {};
      state.adminSecurity.configured = Boolean(status.configured);
      if (!status.unlocked) {
        state.adminSecurity.token = "";
        state.adminSecurity.expires_at = "";
      }
      updateAdminButtonLabel();
    }
  }
  if (api.available) {
    const sync = await apiPost("/api/db/sync", { db: state });
    if (sync?.db) {
      state.targets = sync.db.targets || state.targets;
      state.reports = sync.db.reports || state.reports;
      state.blueprints = sync.db.blueprints || state.blueprints;
      state.blueprintVersions = sync.db.blueprintVersions || state.blueprintVersions;
      state.empireProjects = sync.db.projects || state.empireProjects;
      state.trainingJobs = sync.db.trainingJobs || state.trainingJobs;
      state.memories = sync.db.memories || state.memories;
      state.sessions = sync.db.sessions || state.sessions;
      saveState();
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
    const doctor = await apiGet("/api/doctor");
    api.doctor = doctor?.doctor || null;
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
  toast("Backend offline. Showing static audit.");
}

function buildProjectAudit(health, doctor) {
  const backendOnline = Boolean(health?.ok);
  const ollamaReady = Boolean(health?.ollama?.reachable || doctor?.ollama_ready);
  const nodeReady = backendOnline || Boolean(doctor?.node_ready);
  const doctorOk = doctor?.ok !== false;
  const issues = Array.isArray(doctor?.issues) ? doctor.issues : [];
  const repairs = Array.isArray(doctor?.repairs) ? doctor.repairs : [];
  const hardIssues = [
    !backendOnline ? "Backend is offline when the page is opened as a static file." : "",
    !ollamaReady ? "Local Ollama/Rick-C63 model is not reachable; AI planning falls back to canned local logic." : "",
    "Training and native EXE export still depend on external runtimes and should be verified on every target machine.",
    "Frontend state and backend JSON sync are useful for MVP, but not enough for multi-user production."
  ].filter(Boolean);
  return {
    checked_at: doctor?.checked_at || new Date().toISOString(),
    score: backendOnline && ollamaReady && doctorOk && !issues.length ? 90 : backendOnline ? 76 : 58,
    status: backendOnline ? "Running locally" : "Static fallback",
    summary: backendOnline
      ? "The local Node app is reachable, browser UI can talk to the backend, and the project is ready for feature hardening."
      : "The frontend can render without the server, but real audit, training, export and AI routes need npm start.",
    health: [
      { label: "Node server", value: nodeReady ? "Ready" : "Offline", ok: nodeReady },
      { label: "Browser app", value: "Ready", ok: true },
      { label: "Ollama model", value: ollamaReady ? "Reachable" : "Offline", ok: ollamaReady },
      { label: "Doctor report", value: doctorOk ? "Clean" : "Issues", ok: doctorOk }
    ],
    findings: [
      {
        title: "What works",
        tone: "good",
        items: [
          "Private repo is cloned locally and runs on port 8787.",
          "npm run check validates JavaScript syntax plus navigation, analysis, XSS safety, Audit and API hardening.",
          "Core pages exist: Home, Rick-C63, Reports, Builder, Empire, Training, Legal and Audit.",
          "Backend routes already cover health, doctor, chat, DB sync, products, exports and training jobs.",
          "Sensitive repository files and admin authentication data are not exposed by public routes.",
          "Node, Ollama and llama.cpp bind to localhost by default.",
          ...repairs
        ]
      },
      {
        title: "Risks",
        tone: hardIssues.length ? "warn" : "good",
        items: [...issues, ...hardIssues]
      },
      {
        title: "Missing to finish",
        tone: "work",
        items: [
          "Replace demo analysis with a stronger local model pipeline once Ollama is consistently available.",
          "Add repo-level project roadmap and issue backlog so every feature has a finish line.",
          "Add backup/export controls for data/erleuchtung-db.json.",
          "Add dedicated integration tests for Training and native EXE export on a fully provisioned machine."
        ]
      }
    ],
    nextSteps: [
      "Add provisioned-machine coverage for Training and native EXE export.",
      "Add a persistent Roadmap page or backlog JSON for the finish-one-by-one workflow.",
      "Make the Audit page able to trigger the self-healing doctor script from admin mode.",
      "Add automated backups for the local database.",
      "Keep dependencies and local runtimes updated."
    ]
  };
}

function updateAdminButtonLabel() {
  if (!els.adminAccessButton) return;
  const unlocked = Boolean(state.adminSecurity?.token);
  els.adminAccessButton.textContent = unlocked ? "Admin On" : "Admin Lock";
}

async function requireAdminAccess(actionLabel) {
  if (!api.available) {
    toast("Backend offline. Admin-Absicherung greift erst mit node server.js.");
    return false;
  }
  const status = await apiGet("/api/admin/status");
  if (!status?.ok) {
    toast("Admin-Status konnte nicht geprueft werden.");
    return false;
  }
  state.adminSecurity.configured = Boolean(status.configured);
  if (status.unlocked && state.adminSecurity?.token) return true;
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
  state.adminSecurity.token = "";
  state.adminSecurity.expires_at = "";
  saveState();
  updateAdminButtonLabel();
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

async function apiGet(path) {
  try {
    const headers = { accept: "application/json" };
    if (state.adminSecurity?.token) headers["x-admin-token"] = state.adminSecurity.token;
    const response = await fetch(path, { headers });
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
    <div class="mini-card"><h3>Backend</h3><p>${api.available ? "Online" : "Frontend-only"} / Ollama ${api.health?.ollama?.reachable ? "connected" : "offline"} / ${safe(api.health?.ollama?.model || "qwen3-coder:30b")}</p></div>
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
    { number: "05", label: "Build", detail: "Generate the selected delivery target", route: "blueprint", done: Boolean(project?.product_package?.build) },
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
  els.builderSettings.innerHTML = `
    <label>App name<input id="builderAppName" value="${escapeHtml(blueprint.project_name)}"></label>
    <label>What should it do?<textarea id="builderGoal" rows="3">${escapeHtml(blueprint.problem)}</textarea></label>
    <label>Delivery target<select id="builderTarget">
      ${buildTargets.map((item) => `<option value="${item.id}" ${state.builderTarget === item.id ? "selected" : ""}>${item.label} - ${item.level}</option>`).join("")}
    </select></label>
    <label>Feeling<select id="builderFeeling">
      ${["Cosmic premium", "Developer cockpit", "Creative studio", "Conversion machine", "Learning engine"].map((item) => `<option ${state.builderFeeling === item ? "selected" : ""}>${item}</option>`).join("")}
    </select></label>
    <button class="secondary-button full-width" id="applyBuilderSettings">Apply Rick-C63 Settings</button>
  `;
  document.querySelector("#applyBuilderSettings").addEventListener("click", () => {
    blueprint.project_name = document.querySelector("#builderAppName").value.trim() || blueprint.project_name;
    blueprint.problem = document.querySelector("#builderGoal").value.trim() || blueprint.problem;
    state.builderTarget = document.querySelector("#builderTarget").value;
    state.builderFeeling = document.querySelector("#builderFeeling").value;
    saveState();
    renderAll();
    toast("Builder-Einstellungen gespeichert.");
  });
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
    toast("Backend offline. Start node server.js to run the automation.");
    return;
  }
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

function connectProductToPages() {
  const blueprint = getCurrentBlueprint() || createBlueprintFromReport(getCurrentReport());
  const report = getCurrentReport();
  if (!blueprint || !report) {
    toast("Erst Projekt analysieren, dann verbinden.");
    return;
  }
  const product = generateProductPackage(blueprint, report, "Connect to pages");
  saveProductPackage(product, blueprint, report);
  const html = `<h3>${product.name} verbinden</h3>
    <p>Diese Verbindungslogik ist vorbereitet. Als naechstes kann ein echter Page-Registry-Bereich entstehen, wo du auswaehlst: Home, Rick Lab, Empire Dashboard oder neue eigene Seite.</p>
    <h4>Aktuelle Ziel-Verbindungen</h4>
    ${list(product.connections)}
    <h4>Naechster technischer Schritt</h4>
    <p>Wir bauen eine Page Registry: jedes Produkt bekommt eine page_id, route, navigation label, components und data bindings.</p>`;
  openModal("Connect Product to My Pages", html);
  toast("Produkt-Verbindung vorbereitet.");
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
      currentTrainingJobId: saved.currentTrainingJobId || null,
      projectAudit: saved.projectAudit || null
    };
  } catch {
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
