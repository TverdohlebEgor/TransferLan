const dgram = require("dgram");
const net = require("net");
const { EventEmitter } = require('node:events');
const myEmitter = new EventEmitter();

const BROADCAST_IP = "255.255.255.255";

const UDP_CLIENT_PORT = 9293;
const UDP_SERVER_PORT = 9292;
const TCP_CLIENT_PORT = 9293;
const TCP_SERVER_PORT = 9292;

let SEARCHING_SERVER = false;
let SEARCHING_TIME = 10 * 1000; // in ms

let UDP_socket;
let TCP_socket;

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
    TCP_socket = new net.Socket();
    TCP_socket.connect(TCP_SERVER_PORT,ip);
    TCP_socket.on("data", (ms) => {
        console.log("recived from server -> " + ms);
        myEmitter.emit("MESSAGE_TO_DISPLAY",ms);
    })
}

function sendMessageToTCPServer(ms){
    if(!TCP_socket) return;
    TCP_socket.write(ms);
}

module.exports = {
    createUDPSocketClient,
    startSearchingServer,
    stopSearchingServer,
    handleServerFounded,
    myEmitter,
    connectToTCPServer,
    sendMessageToTCPServer

}