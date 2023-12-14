document.addEventListener('DOMContentLoaded', function() {

  const newGroupNameInput = document.getElementById('newGroupName');
  const createGroupButton = document.getElementById('createGroup');
  const selectGroupDropdown = document.getElementById('selectGroup');
  const newLinkInput = document.getElementById('newLink');
  const addLinkButton = document.getElementById('addLink');
  const removeLinkButton = document.getElementById('removeLink');
  const linkList = document.getElementById('linkList');
  const renameGroupButton = document.getElementById('renameGroup');
  const deleteGroupButton = document.getElementById('deleteGroup');
  const saveSettingsButton = document.getElementById('saveSettings');

  // Add ID
  const menuButtons = document.getElementById('menu-buttons');

  let groups = [];

  function loadGroups() {
    chrome.storage.local.get('groups', function(data) {
      if (chrome.runtime.lastError) {
        console.error("Error loading groups:", chrome.runtime.lastError);
      } else {
        groups = data.groups || [];
        updateGroupDropdown();
      }
  
});

  createGroupButton.addEventListener('click', createGroup);
  selectGroupDropdown.addEventListener('change', selectGroup);
  addLinkButton.addEventListener('click', addLink);
  removeLinkButton.addEventListener('click', removeLink);
  renameGroupButton.addEventListener('click', renameGroup);
  deleteGroupButton.addEventListener('click', deleteGroup);
  saveSettingsButton.addEventListener('click', saveSettings);

  chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === 'openTabGroup') {
      openGroupTabs(); 
    } else if (message.action === 'openAllTabs') {
      openAllTabs();
    } else if (message.action === 'openGroup') {
      openSpecificGroupTabs(message.groupName);
    }
  });

  async function createTab(url) {
    await chrome.tabs.create({url, active: false, pinned: true});
  }

  async function openGroupTabs() {
    const selectedGroupName = selectGroupDropdown.value;
    const selectedGroup = groups.find(group => group.name === selectedGroupName);

    selectedGroup.links.forEach(async (link) => {
      // Use template string
      const fullLink = link.startsWith('http://') || link.startsWith('https://') ? link : `http://${link}`;

      // Call createTab directly
      await createTab(fullLink);
    });
  }

  function openAllTabs() {
    groups.forEach(async (group) => {
      group.links.forEach(async (link) => {
        await createTab(link);
      });
    });
  }

  function openSpecificGroupTabs(groupName) {
    const selectedGroup = groups.find(group => group.name === groupName);

    if (selectedGroup) {
      selectedGroup.links.forEach(async (link) => {
        await createTab(link);
      });
    }
  }

  function createGroup() {
    const groupName = newGroupNameInput.value.trim();
    const groupColor = getSelectedGroupColor();

    if (groupName && !groups.find(group => group.name === groupName)) {
      groups.push({ name: groupName, links: [], color: groupColor });
      updateGroupDropdown();
      clearInputs();
      saveGroups();

      // Ajout du bouton au menu de l'extension
      addButtonToMenu(groupName);
    }
  }

  function addButtonToMenu(groupName) {
    const button = document.createElement('button');
    button.textContent = groupName;
    button.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'openGroup', groupName: groupName });
    });
    menuButtons.appendChild(button);
  }

  function addLink() {
    const selectedGroupName = selectGroupDropdown.value;
    const selectedGroup = groups.find(group => group.name === selectedGroupName);
    const newLink = newLinkInput.value.trim();

    if (newLink && !selectedGroup.links.includes(newLink)) {
      selectedGroup.links.push(newLink);
      selectGroup();
      clearInputs();
      saveGroups();
    }
  }

  function removeLink() {
    const selectedGroupName = selectGroupDropdown.value;
    const selectedGroup = groups.find(group => group.name === selectedGroupName);
    const selectedLinks = selectedGroup.links;

    const selectedItems = Array.from(linkList.querySelectorAll('input[type="checkbox"]:checked'));

    selectedItems.forEach(item => {
      const linkIndex = parseInt(item.value, 10);
      if (!isNaN(linkIndex) && linkIndex >= 0 && linkIndex < selectedLinks.length) {
        selectedLinks.splice(linkIndex, 1);
      }
    });

    selectGroup();
    saveGroups();
  }

  function renameGroup() {
    const selectedGroupName = selectGroupDropdown.value;
    const newGroupName = prompt('Nouveau nom pour le groupe :', selectedGroupName);

    if (newGroupName && !groups.find(group => group.name === newGroupName)) {
      const selectedGroup = groups.find(group => group.name === selectedGroupName);
      selectedGroup.name = newGroupName;
      updateGroupDropdown();
      saveGroups();
    }
  }

  function deleteGroup() {
    const selectedGroupName = selectGroupDropdown.value;
    const confirmation = confirm(`Voulez-vous vraiment supprimer le groupe "${selectedGroupName}" ?`);

    if (confirmation) {
      groups = groups.filter(group => group.name !== selectedGroupName);
      updateGroupDropdown();
      clearInputs();
      saveGroups();
    }
  }

  function saveGroups() {
    // Sauvegarder les groupes dans chrome.storage.local
    chrome.storage.local.set({ groups: groups });
  }

  function saveSettings() {
    // Vous pouvez ajouter le code nécessaire pour sauvegarder les paramètres ici
    console.log(groups);
  }

  function clearInputs() {
    newGroupNameInput.value = '';
    newLinkInput.value = '';
  }

  function createLinkListItem(link, index) {
    const listItem = document.createElement('li');
    listItem.className = 'link-list-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = index;
    listItem.appendChild(checkbox);

    const linkText = document.createElement('span');
    linkText.textContent = link;
    listItem.appendChild(linkText);

    return listItem;
  }

