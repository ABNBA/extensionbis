document.addEventListener('DOMContentLoaded', function () {
  const openSingleTabsButton = document.getElementById('openSingleTabs');
  const openTabGroupButton = document.getElementById('openTabGroup');
  const openAllTabsButton = document.getElementById('openAllTabs');
  const selectWhiteThemeButton = document.getElementById('selectWhiteTheme');
  const selectGreenThemeButton = document.getElementById('selectGreenTheme');
  const selectOrangeThemeButton = document.getElementById('selectOrangeTheme');
  const selectBlueThemeButton = document.getElementById('selectBlueTheme');
  const openSettingsButton = document.getElementById('openSettings');
  const groupButtonsContainer = document.getElementById('groupButtons'); // Nouvel élément pour les boutons de groupe

  openSingleTabsButton.addEventListener('click', async function () {
    await openSingleTabs();
  });

  openTabGroupButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'openTabGroup' });
  });

  openAllTabsButton.addEventListener('click', async function () {
    await openSingleTabs();
    chrome.runtime.sendMessage({ action: 'openAllTabs' });
  });

  selectWhiteThemeButton.addEventListener('click', function () {
    applyTheme('white');
  });

  selectGreenThemeButton.addEventListener('click', function () {
    applyTheme('green');
  });

  selectOrangeThemeButton.addEventListener('click', function () {
    applyTheme('orange');
  });

  selectBlueThemeButton.addEventListener('click', function () {
    applyTheme('blue');
  });

  openSettingsButton.addEventListener('click', function () {
    chrome.tabs.create({ url: 'settings.html' });
  });

  // Demander le thème actuel à chrome.storage.local
  chrome.storage.local.get('theme', function (data) {
    if (data.theme) {
      applyTheme(data.theme);
    }
  });

  // Charger la liste des groupes depuis chrome.storage.local
  chrome.storage.local.get('groups', function (data) {
    const groups = data.groups || [];

    // Créer des boutons dynamiques pour chaque groupe
    groups.forEach(group => {
      const button = document.createElement('button');
      button.textContent = group.name;
      button.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'openGroup', groupName: group.name });
      });
      groupButtonsContainer.appendChild(button);
    });
  });
});

async function openSingleTabs() {
  const urls = [
    'https://www.facebook.com/messages/',
    'https://web.whatsapp.com/',
    'https://business.facebook.com/'
  ];

  for (const url of urls) {
    chrome.tabs.create({ url, active: false, pinned: true });
  }
}

function applyTheme(theme) {
  const body = document.body;

  // Retirer les classes de thème actuelles
  body.classList.remove('white-theme', 'green-theme', 'orange-theme', 'blue-theme');

  // Appliquer la classe de thème sélectionnée
  body.classList.add(`${theme}-theme`);

  // Stocker le thème choisi dans chrome.storage.local
  chrome.storage.local.set({ theme: theme });
}
