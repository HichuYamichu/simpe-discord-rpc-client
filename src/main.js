'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');

let mainWindow;
let startTimestamp;
let rpc;

function createWindow() {
  mainWindow = new BrowserWindow({
    center: true,
    width: 540,
    height: 825,
    minWidth: 540,
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

ipcMain.on('start', (event, clientId) => {
  console.log(clientId);
  if (rpc) {
    rpc.clearActivity();
    rpc.destroy();
    rpc = undefined;
  }
  rpc = new DiscordRPC.Client({ transport: 'ipc' });
  rpc.on('ready', () => {
    setActivity();

    setInterval(() => {
      setActivity();
    }, 15e3);
  });

  startTimestamp = new Date();
  rpc.login({ clientId });
});

app.on('ready', () => {
  createWindow();
  setTimeout(() => {}, 5e3);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

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
