const storage = require('electron-json-storage');
const { shell } = require('electron');
const { ipcRenderer } = require('electron');

document.addEventListener('click', event => {
  if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

const details = document.getElementById('details');
const state = document.getElementById('state');
const largeImageKey = document.getElementById('largeImageKey');
const largeImageText = document.getElementById('largeImageText');
const smallImageKey = document.getElementById('smallImageKey');
const smallImageText = document.getElementById('smallImageText');
const clientID = document.getElementById('client-id');

const saveBTN = document.getElementById('saveBTN');
const startBTN = document.getElementById('startBTN');

startBTN.addEventListener('click', () => {
  ipcRenderer.send('start', clientID.value);
});

let cache = {};

function getSave(saveName) {
  storage.get(saveName, (error, cache) => {
    if (error) throw error;

    if (cache.details) details.value = cache.details;
    if (cache.state) state.value = cache.state;
    if (cache.largeImageKey) largeImageKey.value = cache.largeImageKey;
    if (cache.largeImageText) largeImageText.value = cache.largeImageText;
    if (cache.smallImageKey) smallImageKey.value = cache.smallImageKey;
    if (cache.smallImageText) smallImageText.value = cache.smallImageText;
    if (cache.clientID) clientID.value = cache.clientID;
  });
}

function removeSave(saveNameToRemove) {
  delete cache[saveNameToRemove];
  storage.remove(saveNameToRemove, error => {
    if (error) throw error;
  });
  const savesStore = document.getElementById('saves');
  const saves = savesStore.children;
  for (const save of saves) {
    if (save.firstChild.innerHTML === saveNameToRemove) {
      savesStore.removeChild(save);
    }
  }
}

storage.getAll((error, data) => {
  if (error) throw error;
  cache = data;
  console.log(data);

  for (const saveName of Object.keys(cache)) {
    const div = document.createElement('div');
    const btn = document.createElement('a');
    btn.innerHTML = saveName;
    btn.onclick = function() {
      getSave(saveName);
    };
    const remover = document.createElement('a');
    remover.innerHTML = '&times;';
    remover.onclick = function() {
      removeSave(saveName);
    };
    div.appendChild(btn);
    div.appendChild(remover);
    const list = document.getElementById('saves');
    list.appendChild(div);
  }
});

saveBTN.addEventListener('click', () => {
  const saveNameInput = document.getElementById('save-name');
  const saveName = saveNameInput.value || 'new save';
  const saveData = {
    details: details.value,
    state: state.value,
    largeImageKey: largeImageKey.value,
    largeImageText: largeImageText.value,
    smallImageKey: smallImageKey.value,
    smallImageText: smallImageText.value,
    clientID: clientID.value
  };
  if (!cache[saveName]) {
    const div = document.createElement('div');
    const btn = document.createElement('a');
    btn.innerHTML = saveName;
    btn.onclick = function() {
      getSave(saveName);
    };
    const remover = document.createElement('a');
    remover.innerHTML = '&times;';
    remover.onclick = function() {
      removeSave(saveName);
    };
    div.appendChild(btn);
    div.appendChild(remover);
    const list = document.getElementById('saves');
    list.appendChild(div);
  }
  cache[saveName] = saveData;
  storage.set(saveName, saveData, error => {
    if (error) throw error;
  });
});

function openDrawer() {
  document.getElementById('drawer').style.height = '75%';
  const overlay = document.querySelector('.sliderWrapper');
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
}

function closeDrawer() {
  document.getElementById('drawer').style.height = '0';
  const overlay = document.querySelector('.sliderWrapper');
  overlay.style.visibility = 'hidden';
  overlay.style.opacity = '0';
}
