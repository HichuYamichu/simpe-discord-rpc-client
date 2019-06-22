const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 850,
    resizable: true,
    titleBarStyle: 'hidden'
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

let timeout;

app.on('ready', () => {
  createWindow();
  timeout = setInterval(() => {
    getInfo();
  }, 5e3);
});

app.on('window-all-closed', () => {
  app.quit();
});

let clientId;

async function getInfo() {
  clientId = await mainWindow.webContents.executeJavaScript(
    'document.getElementById("client-id").value'
  );

  if (clientId) {
    start();
  }
}

function start() {
  DiscordRPC.register(clientId);

  const rpc = new DiscordRPC.Client({ transport: 'ipc' });
  const startTimestamp = new Date();

  rpc.on('ready', () => {
    setActivity();

    setInterval(() => {
      setActivity();
    }, 15e3);
  });

  rpc
    .login({ clientId })
    .then(() => clearInterval(timeout))
    .catch(console.error);

  async function setActivity() {
    if (!rpc || !mainWindow) {
      return;
    }

    const activity = {instance: false, startTimestamp}

    const details = await mainWindow.webContents.executeJavaScript(
      'document.getElementById("details").value'
    );
    if (details) activity.details = details

    const state = await mainWindow.webContents.executeJavaScript(
      'document.getElementById("state").value'
    );
    if (state) activity.state = state

    largeImageKey = await mainWindow.webContents.executeJavaScript(
      'document.getElementById("largeImageKey").value'
    );
    if (largeImageKey) activity.largeImageKey = largeImageKey

    const largeImageText = await mainWindow.webContents.executeJavaScript(
      'document.getElementById("largeImageText").value'
    );
    if (largeImageText) activity.largeImageText = largeImageText
    
    const smallImageKey = await mainWindow.webContents.executeJavaScript(
      'document.getElementById("smallImageKey").value'
    );
    if (smallImageKey) activity.smallImageKey = smallImageKey
    
    const smallImageText = await mainWindow.webContents.executeJavaScript(
      'document.getElementById("smallImageText").value'
    );
    if (smallImageText) activity.smallImageText = smallImageText

    rpc.setActivity(activity);
  }
}

// const clientId = '462219867467022347';
