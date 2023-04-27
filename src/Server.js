const dgram = require("dgram");
const net = require("net");

const BROADCAST_IP = "255.255.255.255";
const UDP_CLIENT_PORT = 9293;
const UDP_SERVER_PORT = 9292;
const TCP_CLIENT_PORT = 9293;
const TCP_SERVER_PORT = 9292;

const {myEmitter} = require("./Client")

let UDP_socket;
let TCP_server;
let connected_socket = [];

function createUDPSocketServer(){
    if(UDP_socket) return;
    UDP_socket = dgram.createSocket("udp4");
    UDP_socket.bind(UDP_SERVER_PORT, () => {
        UDP_socket.setBroadcast(true);
    });
}

function handleSearchingMessages(username){
    UDP_socket.on("message",(ms,rinfo) => {
        console.log(ms.toString());
        console.log(rinfo);
        if(ms.toString().slice(0,14) === "SEARCHING_ROOM"){
            UDP_socket.send("HERE_ROOM "+username,UDP_CLIENT_PORT,BROADCAST_IP);
        }
    })
}

function handleTCPConnection(){
    TCP_server.on("connection",(sock) => {
        console.log("connected to sock ",sock.remoteAddress);

        sock.on("data",(ms) => {
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

function broadcastMessageTCP(ms){
    connected_socket.forEach((sock) => {
        sock.write(ms);
    })
}

module.exports = {
    createUDPSocketServer,
    handleSearchingMessages,
    createTCPServer,
    serverSendMessage
}