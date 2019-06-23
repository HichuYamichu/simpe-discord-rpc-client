const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    center: true,
    width: 500,
    height: 825,
    minWidth: 500,
    minHeight: 700,
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

    const activity = { instance: false, startTimestamp };

    const fields = [
      'details',
      'state',
      'largeImageKey',
      'largeImageText',
      'smallImageKey',
      'smallImageText'
    ];
    for (const field of fields) {
      const fieldValue = await mainWindow.webContents.executeJavaScript(
        `document.getElementById("${field}").value`
      );
      if (fieldValue) activity[field] = fieldValue;
    }

    rpc.setActivity(activity);
  }
}
