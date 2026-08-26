const checkbox = document.getElementById("autoScanEnabled");
const adBlockCheckbox = document.getElementById("adBlockEnabled");

chrome.storage.sync.get(["autoScanEnabled", "adBlockEnabled"], (data) => {
  checkbox.checked = data.autoScanEnabled ?? true;
  adBlockCheckbox.checked = data.adBlockEnabled ?? true;
});

checkbox.addEventListener("change", () => {
  chrome.storage.sync.set({ autoScanEnabled: checkbox.checked });
});

adBlockCheckbox.addEventListener("change", () => {
  chrome.storage.sync.set({ adBlockEnabled: adBlockCheckbox.checked });
});
