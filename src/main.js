const { createUDPSocketClient,
  startSearchingServer,
  stopSearchingServer,
  handleServerFounded,
  myEmitter,
  connectToTCPServer
} = require("./Client");

module.exports = {
  createUDPSocketServer,
  handleSearchingMessages
} = require("./Server");

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

let roomOwner = false;

ipcMain.on("StartRoomOwnerSearch",() => {
  createUDPSocketClient();
  startSearchingServer();
  handleServerFounded();
});

ipcMain.on("StopRoomOwnerSearch",() => {
  stopSearchingServer();
})

myEmitter.on("ROOM_FOUNDED",(ms) => {
  win.webContents.send("ROOM_FOUNDED",ms);
})

ipcMain.on("EnteringRoom",(event,value) => {
  console.log(value);
  win.webContents.send("IM_IN_ROOM",value[0]);
  connectToTCPServer(value[1][0]);
})

ipcMain.on("ImRoomOwner",() => {
  stopSearchingServer();
  roomOwner = true;

  createUDPSocketServer();
  handleSearchingMessages("roomOwner");
})