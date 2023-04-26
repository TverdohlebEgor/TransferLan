const dgram = require("dgram");
const net = require("net");

const BROADCAST_IP = "255.255.255.255";
const UDP_CLIENT_PORT = 9293;
const UDP_SERVER_PORT = 9292;
const TCP_CLIENT_PORT = 9293;
const TCP_SERVER_PORT = 9292;

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
    console.log("handling searching messages");
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
        console.log("connected to sock ",sock);
    })

    sock.on("data",(ms) => {
        //TODO : Handle messages and files
        console.log("TODO : Handle messages and files");
    });

    sock.on("close",() => {
        connected_socket = connected_socket.filter((val) => val !== sock);
    })

    connected_socket.push(sock);
}

function createTCPServer(){
    TCP_server = net.createServer();
    TCP_server.listen(TCP_SERVER_PORT,() => {console.log("TCP SERVER LISTENING ON PORT ",TCP_SERVER_PORT)});
    handleTCPConnection();
}

module.exports = {
    createUDPSocketServer,
    handleSearchingMessages,
    createTCPServer,

}