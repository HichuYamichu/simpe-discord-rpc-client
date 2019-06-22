const { webFrame } = require('electron');
webFrame.setZoomLevelLimits(1, 1);

const storage = require('electron-json-storage');

const details = document.getElementById('details');
const state = document.getElementById('state');
const largeImageKey = document.getElementById('largeImageKey');
const largeImageText = document.getElementById('largeImageText');
const smallImageKey = document.getElementById('smallImageKey');
const smallImageText = document.getElementById('smallImageText');
const clientID = document.getElementById('client-id')

const saveBTN = document.getElementById('saveBTN');

storage.get('cache', function(error, cache) {
  if (error) throw error;

  if (cache.details) details.value = cache.details;
  if (cache.state) state.value = cache.state;
  if (cache.largeImageKey) largeImageKey.value = cache.largeImageKey;
  if (cache.largeImageText) largeImageText.value = cache.largeImageText;
  if (cache.smallImageKey) smallImageKey.value = cache.smallImageKey;
  if (cache.smallImageText) smallImageText.value = cache.smallImageText;
  if (cache.clientID) clientID.value = cache.clientID;
});

saveBTN.addEventListener('click', () => {
  storage.set(
    'cache',
    {
      details: details.value,
      state: state.value,
      largeImageKey: largeImageKey.value,
      largeImageText: largeImageText.value,
      smallImageKey: smallImageKey.value,
      smallImageText: smallImageText.value,
      clientID: clientID.value
    },
    function(error) {
      if (error) throw error;
    }
  );
});
