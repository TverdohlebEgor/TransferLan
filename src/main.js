// ./public/electron.js
const { app, BrowserWindow, ipcMain , Notification} = require('electron');

const path = require("path")

const isDev = require('electron-is-dev');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 1000,
    minHeight: 1000,
    minWidth: 1000,
    backgroundColor:"#333333",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  
  win.on("close",(event) => {
      win = null;
  })

  win.removeMenu();

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if(process.platform !== "darwin"){
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ------------------------------------------------------------------
