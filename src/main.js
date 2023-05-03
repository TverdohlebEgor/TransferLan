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
  broadcastMessageTCP
} = require("./Server");

const { app, BrowserWindow, ipcMain, dialog} = require('electron');

const path = require("path")

const isDev = require('electron-is-dev');

const fs = require("fs");

const FILE_MESSAGE_HEADER = "EFJ90S";
const FILEREQUEST_MESSAGE_HEADER = "POM02X";

let win = null;
const slashForOs = process.platform === "win32" ? "\\" : "/";

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    minHeight: 800,
    minWidth: 800,
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
  myEmitter.emit("ENTERING_ROOM");
})

ipcMain.on("ImRoomOwner",(event,ms) => {
  stopSearchingServer();
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
    let fileName = ms.toString().slice(ms.toString().lastIndexOf(slashForOs));
    let originPosition = ms.toString().slice(ms.toString().indexOf(slashForOs));
    let destinyPosition = response["filePaths"]+fileName;
    //Try to copy the file
    try{
      fs.copyFile(originPosition,destinyPosition,() => {
        console.log("Success!")
      });
    }
    //If fails send file to request
    catch(err){
      console.log("FILE NOT FOUND ASKING THE CLIENT");
      try{
        broadcastMessageTCP(FILEREQUEST_MESSAGE_HEADER+ms.toString().substr(6)+"%"+response["filePaths"]);
        fs.copyFile(process.cwd()+slashForOs+"download"+slashForOs+fileName,destinyPosition);
        }
      catch(err){
        console.log(err);
      }
    }
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