const { createUDPSocketClient,
  startSearchingServer,
  stopSearchingServer,
  handleServerFounded,
  myEmitter,
  connectToTCPServer,
  sendMessageToTCPServer,
  sendFileToTCPServer,
  requestFileToTCPServer
} = require("./Client");

const {
  createUDPSocketServer,
  handleSearchingMessages,
  createTCPServer,
  createFPTServer,
  serverSendMessage,
  
} = require("./Server");

const { app, BrowserWindow, ipcMain, dialog} = require('electron');

const path = require("path")

const isDev = require('electron-is-dev');

const FILE_MESSAGE_HEADER = "EFJ90S";
const FILEREQUEST_MESSAGE_HEADER = "POM02X";

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
      ? (process.env.PORT || 'http://localhost:3000')
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

myEmitter.on("MESSAGE_TO_DISPLAY",(ms) => {
  win.webContents.send("MESSAGE_TO_DISPLAY",ms.toString());
})

ipcMain.on("EnteringRoom",(event,value) => {
  win.webContents.send("IM_IN_ROOM",value[0]);
  connectToTCPServer(value[1][0]);
  myEmitter.emit("ENTERING_ROOM")
})

ipcMain.on("ImRoomOwner",(event,ms) => {
  stopSearchingServer();
  roomOwner = true;

  createUDPSocketServer();
  handleSearchingMessages(ms);
  createTCPServer();
  createFPTServer();
})

ipcMain.on("roomGuestSendMessage",(event,ms) => {
  sendMessageToTCPServer(ms);
})

ipcMain.on("roomOwnerSendMessage",(event,ms) => {
  serverSendMessage(ms);
})

ipcMain.on("clientFileRequest",(event,ms) => {
  dialog.showOpenDialog({
    properties:[
      "openDirectory"
    ]
  }).then((response) => {
    requestFileToTCPServer(FILEREQUEST_MESSAGE_HEADER+ms.toString().substr(6)+"%"+response["filePaths"]);
  })
})

ipcMain.on("serverFileRequest",(event,ms) => {
  dialog.showOpenDialog({
    properties:[
      "openDirectory"
    ]
  }).then((response) => {
    //TODO
    console.log("TODO MAKE SERVER CAPABLE OF DOWNLOADING STUFF");
    //requestFileToTCPServer(FILEREQUEST_MESSAGE_HEADER+ms.toString().substr(6)+"%"+response["filePaths"]);
  })
})

ipcMain.on("clientChooseFileToSend",(event,ms) => {
  dialog.showOpenDialog({
    properties:[
      "openFile"
    ]
  }).then((response) => {
    sendFileToTCPServer(ms+"/"+response["filePaths"]);
  })
});

ipcMain.on("serverChooseFileToSend",(event,ms) => {
  dialog.showOpenDialog({
    properties:[
      "openFile"
    ]
  }).then((response) => {
    myEmitter.emit("SERVER_CHOOSE_FILE_TO_SEND",FILE_MESSAGE_HEADER + ms+"/"+response["filePaths"]);
  })
})