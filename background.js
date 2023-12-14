const createTab = async function (url) {
  await chrome.tabs.create({ url, active: false, pinned: true });
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ theme: 'default' });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getTheme') {
    chrome.storage.local.get('theme', function (data) {
      sendResponse({ theme: data.theme });
    });
  } else if (request.action === 'setTheme') {
    chrome.storage.local.set({ theme: request.theme });
  } else if (request.action === 'openGroup') {
    openGroupTabs(request.groupName);
  }
  return true;
});

async function openGroupTabs(groupName) {
  chrome.storage.local.get('groups', function (data) {
    const groups = data.groups || [];
    const selectedGroup = groups.find(group => group.name === groupName);

    if (selectedGroup) {
      selectedGroup.links.forEach(async (link) => {
        await createTab(link);
      });
    }
  });
}