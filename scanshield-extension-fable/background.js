// ── ScanShield Extension — Background Service Worker ─────────────────────
// Reaproveita o backend já existente do site (api/analyze.js e a lógica de
// classificação em 2 estágios que já usamos no Analyze.jsx).

const API_BASE = "https://scanshield-ai.com"; // ajuste se o domínio for outro
const CLASSIFY_ENDPOINT = `${API_BASE}/api/classify`; // ver nota no final sobre criar esse endpoint
const ANALYZE_ENDPOINT = `${API_BASE}/api/analyze`;

// Cache simples em memória: evita re-escanear a mesma URL repetidamente
const scannedUrls = new Map(); // url -> { timestamp, result }
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutos

// ── Menu de contexto: clique direito em imagem ou link ────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "scanshield-check-image",
    title: "Verificar no ScanShield",
    contexts: ["image"],
  });
  chrome.contextMenus.create({
    id: "scanshield-check-link",
    title: "Verificar link no ScanShield",
    contexts: ["link"],
  });

  // Ativa o adblock por padrão na primeira instalação
  const stored = await chrome.storage.sync.get(["adBlockEnabled"]);
  if (stored.adBlockEnabled === undefined) {
    chrome.storage.sync.set({ adBlockEnabled: true });
  }
  await applyAdBlockState(stored.adBlockEnabled ?? true);
});

// Liga/desliga o ruleset de rede do adblock (declarativeNetRequest)
async function applyAdBlockState(enabled) {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enabled ? ["adblock_rules"] : [],
      disableRulesetIds: enabled ? [] : ["adblock_rules"],
    });
  } catch (err) {
    console.error("[ScanShield] Erro ao alternar adblock:", err);
  }
}

// Reage a mudanças feitas no popup/options
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.adBlockEnabled) {
    applyAdBlockState(changes.adBlockEnabled.newValue);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "scanshield-check-image" && info.srcUrl) {
    await handleManualImageCheck(info.srcUrl, tab.id);
  }
  if (info.menuItemId === "scanshield-check-link" && info.linkUrl) {
    await handleManualLinkCheck(info.linkUrl, tab.id);
  }
});

async function handleManualImageCheck(imageUrl, tabId) {
  setBadge(tabId, "...", "#3b82f6");
  try {
    const result = await classifyImageUrl(imageUrl);
    handleClassificationResult(result, tabId, imageUrl);
  } catch (err) {
    console.error("[ScanShield] Erro ao verificar imagem:", err);
    setBadge(tabId, "!", "#ef4444");
  }
}

async function handleManualLinkCheck(linkUrl, tabId) {
  // Links: abrimos a análise no próprio site, já com a URL pré-preenchida
  chrome.tabs.create({ url: `${API_BASE}/analyze?check_url=${encodeURIComponent(linkUrl)}` });
}

// ── Classificador leve (estágio 1) — chamado tanto no manual quanto no automático
async function classifyImageUrl(imageUrl) {
  const cached = scannedUrls.get(imageUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const token = await getAuthToken();
  const response = await fetch(CLASSIFY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ image_url: imageUrl }),
  });

  if (!response.ok) throw new Error(`Classificador retornou ${response.status}`);
  const result = await response.json();
  scannedUrls.set(imageUrl, { timestamp: Date.now(), result });
  return result;
}

function handleClassificationResult(result, tabId, sourceUrl) {
  const categories = result.categories || [];
  if (categories.length === 0) {
    setBadge(tabId, "✓", "#22c55e");
    return;
  }

  setBadge(tabId, String(categories.length), "#ef4444");

  const isHighRisk = categories.includes("golpe") || categories.includes("deepfake");
  if (isHighRisk) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "⚠️ ScanShield: risco detectado",
      message: `Encontramos sinais de ${categories.join(", ")} nesta imagem. Toque para ver o laudo completo.`,
      priority: 2,
    });
  }
}

function setBadge(tabId, text, color) {
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

// ── Mensagens vindas do content script (escaneamento automático de página) ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_PAGE_IMAGES") {
    handleAutoScan(message.imageUrls, sender.tab.id);
  }
  if (message.type === "GET_SETTINGS") {
    chrome.storage.sync.get(["autoScanEnabled"], (data) => {
      sendResponse({ autoScanEnabled: data.autoScanEnabled ?? true });
    });
    return true; // resposta assíncrona
  }
});

async function handleAutoScan(imageUrls, tabId) {
  const settings = await chrome.storage.sync.get(["autoScanEnabled"]);
  if (settings.autoScanEnabled === false) return;

  // Limita a análise automática às 5 imagens mais relevantes da página,
  // pra não estourar custo de API em páginas com dezenas de imagens.
  const toScan = imageUrls.slice(0, 5);
  let totalRisks = 0;

  for (const url of toScan) {
    try {
      const result = await classifyImageUrl(url);
      if ((result.categories || []).length > 0) {
        totalRisks += result.categories.length;
        if (result.categories.includes("golpe") || result.categories.includes("deepfake")) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "⚠️ ScanShield: risco detectado nesta página",
            message: `Sinais de ${result.categories.join(", ")} encontrados. Clique no ícone da extensão pra ver detalhes.`,
            priority: 2,
          });
        }
      }
    } catch (err) {
      console.error("[ScanShield] Erro no auto-scan:", err);
    }
  }

  setBadge(tabId, totalRisks > 0 ? String(totalRisks) : "✓", totalRisks > 0 ? "#ef4444" : "#22c55e");
}

// ── Auth: reaproveita a sessão do Supabase se o usuário já estiver logado no site
async function getAuthToken() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: "scanshield-ai.com" });
    const authCookie = cookies.find((c) => c.name.includes("supabase") || c.name.includes("auth-token"));
    return authCookie ? authCookie.value : null;
  } catch {
    return null;
  }
}
