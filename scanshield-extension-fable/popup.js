const API_BASE = "https://scanshield-ai.com";
const statusEl = document.getElementById("status");
const toggle = document.getElementById("autoScanToggle");
const adBlockToggle = document.getElementById("adBlockToggle");

// Helper: mostra status com cor (neutro, ok ou erro)
function setStatus(text, kind = "") {
  statusEl.textContent = text;
  statusEl.className = "status" + (kind ? ` ${kind}` : "");
}

// Carrega estado atual dos toggles
chrome.storage.sync.get(["autoScanEnabled", "adBlockEnabled"], (data) => {
  toggle.checked = data.autoScanEnabled ?? true;
  adBlockToggle.checked = data.adBlockEnabled ?? true;
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ autoScanEnabled: toggle.checked });
  setStatus(
    toggle.checked
      ? "Escaneamento automático ativado."
      : "Escaneamento automático desativado.",
    toggle.checked ? "ok" : ""
  );
});

adBlockToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ adBlockEnabled: adBlockToggle.checked });
  setStatus(
    adBlockToggle.checked
      ? "Adblock ativado. Recarregue a página pra aplicar."
      : "Adblock desativado. Recarregue a página pra aplicar.",
    adBlockToggle.checked ? "ok" : ""
  );
});

// Botão "Analisar tela atual" — tira print da aba visível, envia pro backend
// (que salva no Supabase Storage) e abre a página de análise já com a
// imagem pronta via URL — reaproveitando o fluxo existente do Analyze.jsx.
document.getElementById("scanPageBtn").addEventListener("click", async () => {
  setStatus("Capturando tela...");
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" });

    setStatus("Enviando para o ScanShield...");
    const token = await getStoredAuthToken();
    const uploadRes = await fetch(`${API_BASE}/api/extensionUpload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: dataUrl, auth_token: token }),
    });

    if (!uploadRes.ok) throw new Error(`Upload falhou: ${uploadRes.status}`);
    const { file_url } = await uploadRes.json();

    chrome.tabs.create({ url: `${API_BASE}/analyze?prefill_url=${encodeURIComponent(file_url)}` });
    setStatus("Abrindo análise...", "ok");
  } catch (err) {
    console.error("[ScanShield] Erro ao capturar tela:", err);
    setStatus("Erro ao enviar a captura. Tente novamente.", "error");
  }
});

async function getStoredAuthToken() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: "scanshield-ai.com" });
    const authCookie = cookies.find((c) => c.name.includes("supabase") || c.name.includes("auth-token"));
    return authCookie ? authCookie.value : null;
  } catch {
    return null;
  }
}

document.getElementById("openSiteBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: API_BASE });
});
