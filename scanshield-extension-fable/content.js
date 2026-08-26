// ── ScanShield — Content Script ────────────────────────────────────────────
// Roda em toda página (document_idle). Coleta imagens relevantes e manda
// pro background script decidir se escaneia. Não faz chamada de API aqui —
// mantém o content script leve, toda lógica pesada fica no background.

(function () {
  // ── Bloqueio cosmético de anúncios ──────────────────────────────────────
  // As regras de rede (declarativeNetRequest) já bloqueiam os scripts/imagens
  // de anúncio na origem. Esse CSS extra some com o "buraco" que às vezes
  // sobra no layout quando o recurso é bloqueado mas o contêiner continua lá.
  chrome.storage.sync.get(["adBlockEnabled"], (data) => {
    if (data.adBlockEnabled ?? true) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("adblock.css");
      (document.head || document.documentElement).appendChild(link);
    }
  });

  // Debounce: evita re-escanear a mesma página várias vezes (ex: SPA com
  // várias re-renderizações) em menos de 3 segundos.
  let lastScanTime = 0;
  const DEBOUNCE_MS = 3000;

  function collectRelevantImages() {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs
      .filter((img) => {
        // Ignora ícones pequenos, logos, avatares minúsculos — foco no que
        // pode ser conteúdo real (oferta, print de golpe, foto de perfil grande)
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        return w >= 200 && h >= 200 && img.src && img.src.startsWith("http");
      })
      .map((img) => img.src)
      .slice(0, 10); // limite de segurança, mesmo antes do corte no background
  }

  function runScan() {
    const now = Date.now();
    if (now - lastScanTime < DEBOUNCE_MS) return;
    lastScanTime = now;

    const imageUrls = collectRelevantImages();
    if (imageUrls.length === 0) return;

    chrome.runtime.sendMessage({ type: "SCAN_PAGE_IMAGES", imageUrls });
  }

  // Roda uma vez quando a página carrega
  runScan();

  // Re-roda se o conteúdo mudar significativamente (SPA, infinite scroll)
  const observer = new MutationObserver(() => {
    runScan();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
