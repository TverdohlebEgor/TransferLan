const dgram = require("dgram");
const net = require("net");
const { EventEmitter } = require('node:events');
const myEmitter = new EventEmitter();
const fs = require("fs");
const ftp = require("basic-ftp");

const BROADCAST_IP = "255.255.255.255";

const UDP_CLIENT_PORT = 9293;
const UDP_SERVER_PORT = 9292;
const TCP_CLIENT_PORT = 9293;
const TCP_SERVER_PORT = 9292;
const FTP_PORT = 9294;

const slashForOs = process.platform === "win32" ? "\\" : "/";

const FILE_MESSAGE_HEADER = "EFJ90S";
const FILEREQUEST_MESSAGE_HEADER = "POM02X";
const SERVER_NOW_HAS_FILE_HEADER = "HKDMQP"

let SEARCHING_SERVER = false;
let SEARCHING_TIME = 10 * 1000; // in ms

let UDP_socket;
let TCP_socket;
let FTP_client;


function createUDPSocketClient(){
    if(UDP_socket) return;
    UDP_socket = dgram.createSocket("udp4");
    UDP_socket.bind(UDP_CLIENT_PORT, () => {
        UDP_socket.setBroadcast(true);
    });
}

function sendSearchingServerMessage(){
    if(!SEARCHING_SERVER) return false;
    UDP_socket.send("SEARCHING_ROOM",UDP_SERVER_PORT,BROADCAST_IP);
}

function startSearchingServer(){
    SEARCHING_SERVER = true;
    sendSearchingServerMessage();
    setInterval(sendSearchingServerMessage,SEARCHING_TIME);
}

function stopSearchingServer(){
    SEARCHING_SERVER = false;
}

function handleServerFounded(){
    UDP_socket.on("message",(ms,rinfo) => {
        if(ms.toString().slice(0,9) === "HERE_ROOM"){
            myEmitter.emit("ROOM_FOUNDED",ms.toString().slice(9)+"@"+rinfo.address.toString());
        }
    })
}

function connectToTCPServer(ip){
    TCP_server_ip = ip;
    TCP_socket = new net.Socket();
    TCP_socket.connect(TCP_SERVER_PORT,ip);
    TCP_socket.on("data", (ms) => {
        if(ms.toString().slice(0,6) === FILEREQUEST_MESSAGE_HEADER){
            console.log("Client has to respond to " + ms.toString());
            respondeFileRequest(ms.toString().slice(6)).then(() => {
                TCP_socket.write(SERVER_NOW_HAS_FILE_HEADER+ms.toString().slice(6));
            });
        }
        else if(ms.toString().slice(0,6) === SERVER_NOW_HAS_FILE_HEADER){
            // server now has the file that we have asked for
            //console.log("I HAVE RECEIVE THE MESSAGE "+ ms.toString().slice(0,6))
            downloadFromServer(ms.toString().slice(ms.indexOf("/")));
        }
        else{
            console.log("recived from server -> " + ms);
            myEmitter.emit("MESSAGE_TO_DISPLAY",ms);
        }
    })
}

function sendFileToTCPServer(ms){
    if(!TCP_socket)return;
    console.log("WANT SEND FILE AT "+ms +" TO SERVER");
    TCP_socket.write(FILE_MESSAGE_HEADER+ms)
}

function sendMessageToTCPServer(ms){
    if(!TCP_socket) return;
    TCP_socket.write(ms);
}

function requestFileToTCPServer(ms){
    if(!TCP_socket) return;
    TCP_socket.write(ms);
}

async function respondeFileRequest(request){
    let currentClientFilePosition =request.slice(request.indexOf(slashForOs),request.indexOf("%")); 
    
    try{
        FTP_client = new ftp.Client();
        
        await FTP_client.access({
            host : "0.0.0.0",
            port : 9294,
        })
       
        await FTP_client.uploadFrom(currentClientFilePosition,"./download/"+currentClientFilePosition.slice(currentClientFilePosition.lastIndexOf(slashForOs))); // / for linux \\ for windows
        
        
    }

    catch(err){
        console.log("This client doesn't have the file requested");
        console.log(err); // TODO makeThisAComment
    }
    FTP_client.close();
}

async function downloadFromServer(ms){
    let positionInOriginalClient = ms.slice(1,ms.indexOf("%"))
    let positionInServer = "/download"+positionInOriginalClient.slice(positionInOriginalClient.lastIndexOf(slashForOs)); //Same things here / for linux \\ for windows
    let positionToDownload = ms.slice(ms.indexOf("%")+1)+positionInServer.slice(positionInServer.lastIndexOf(slashForOs));  // as above

    console.log(positionInOriginalClient)
    console.log(positionInServer)
    console.log(positionToDownload)
    
    try{
        FTP_client = new ftp.Client();

        await FTP_client.access({
            host : "0.0.0.0",
            port : 9294,
        })

        await FTP_client.downloadTo(positionToDownload,positionInServer);
        
        
    }
    catch(err){
        console.log(err);
    }
    FTP_client.close();
}

module.exports = {
    createUDPSocketClient,
    startSearchingServer,
    stopSearchingServer,
    handleServerFounded,
    myEmitter,
    connectToTCPServer,
    sendMessageToTCPServer,
    sendFileToTCPServer,
    requestFileToTCPServer

}