const dgram = require("dgram");
const net = require("net");
const fptsrv = require("ftp-srv"); 
const fs = require("fs");

const BROADCAST_IP = "255.255.255.255";
const UDP_CLIENT_PORT = 9293;
const UDP_SERVER_PORT = 9292;
const TCP_CLIENT_PORT = 9293;
const TCP_SERVER_PORT = 9292;
const TCP_FILE_PORT = 9294;

const FILE_MESSAGE_HEADER = "EFJ90S";
const FILEREQUEST_MESSAGE_HEADER = "POM02X";
const SERVER_NOW_HAS_FILE_HEADER = "HKDMQP"

const slashForOs = process.platform === "win32" ? "\\" : "/";

const {myEmitter} = require("./Client")

let UDP_socket;
let TCP_server;
let FTP_server;
let connected_socket = [];
let file_owner = {};

let lastFileAsker = null;

function createUDPSocketServer(){
    if(UDP_socket) return;
    UDP_socket = dgram.createSocket("udp4");
    UDP_socket.bind(UDP_SERVER_PORT, () => {
        UDP_socket.setBroadcast(true);
    });
}

function handleSearchingMessages(username){
    UDP_socket.on("message",(ms,rinfo) => {
        if(ms.toString().slice(0,14) === "SEARCHING_ROOM"){
            UDP_socket.send("HERE_ROOM "+username,UDP_CLIENT_PORT,BROADCAST_IP);
        }
    })
}

function handleTCPConnection(){
    TCP_server.on("connection",(sock) => {
        console.log("connected to sock ",sock.remoteAddress);

        sock.on("data",(ms) => {
            if(ms.toString().slice(0,6) === FILE_MESSAGE_HEADER){
                file_owner[ms.toString().slice(6)] = sock;
                serverSendMessage(ms); // It send it like a message because is the link not the file itself, this will create the file button
            }
            else if(ms.toString().slice(0,6) === FILEREQUEST_MESSAGE_HEADER){
                let stringSaved = ms.toString().slice(6,ms.toString().indexOf("%"))
                if(file_owner[stringSaved] === "SERVER"){
                    //server has file
                    console.log("SERVER HAS IT -> " + ms.toString().slice(6));
                    let partialMs = ms.toString().slice(0,ms.toString().indexOf("%"));
                    let fileName = partialMs.slice(partialMs.toString().lastIndexOf(slashForOs)+1); //Here if I put a \ work for linux and a // for windows. TODO find a fix
                    console.log(partialMs);
                    console.log(fileName);
                    fs.copyFile(ms.toString().slice(ms.indexOf("/")+1,ms.indexOf("%")),process.cwd()+slashForOs+"download"+slashForOs+fileName,(err) => {
                        if(err)console.log(err);
                        else{
                            console.log("I should have copyed it")
                            sock.write(SERVER_NOW_HAS_FILE_HEADER+ms.toString().slice(6))
                        }
                    })
                }
                else if(file_owner[stringSaved]){
                    //server ask for the file
                    file_owner[stringSaved].write(ms);
                    lastFileAsker = sock;
                }
            }

            else if(ms.toString().slice(0,6) === SERVER_NOW_HAS_FILE_HEADER){
                if(!lastFileAsker) return;
                lastFileAsker.write(ms);
                //now server has the file that he have asked for
            }

            else
                serverSendMessage(ms);
        });

        sock.on("close",() => {
            connected_socket = connected_socket.filter((val) => val !== sock);
            console.log("disconnected to sock ",sock.remoteAddress);
        })

        connected_socket.push(sock);
    });

}

function serverSendMessage(ms){
    broadcastMessageTCP(ms);
    myEmitter.emit("MESSAGE_TO_DISPLAY",ms);
}

function createTCPServer(){
    TCP_server = net.createServer();
    TCP_server.listen(TCP_SERVER_PORT,() => {console.log("TCP SERVER LISTENING ON PORT ",TCP_SERVER_PORT)});
    handleTCPConnection();
}

function createFPTServer(){
    FTP_server = new fptsrv({
        url : "ftp://0.0.0.0:9294",
        anonymous : true,
    });

    FTP_server.on("login",(data,resolve,reject) => {
        resolve({root : "./"});
    })

    FTP_server.listen();

}

function broadcastMessageTCP(ms){
    connected_socket.forEach((sock) => {
        sock.write(ms);
    })
}

myEmitter.on("ENTERING_ROOM",(ms) => {
    if(TCP_server)TCP_server.close();
});

myEmitter.on("SERVER_CHOOSE_FILE_TO_SEND",(ms) => {
    file_owner[ms.toString().slice(6)] = "SERVER";
    serverSendMessage(ms); // It send it like a message because is the link not the file itself, this will create the file button
});

module.exports = {
    createUDPSocketServer,
    handleSearchingMessages,
    createTCPServer,
    createFPTServer,
    serverSendMessage
}