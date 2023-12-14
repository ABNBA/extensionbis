// utils.js
async function createTab(url) {
  // Utiliser la fonction pour créer un onglet ici
  await chrome.tabs.create({ url, active: false, pinned: true });
}
