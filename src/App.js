import LeftBar from "./components/leftBar.js"
import RightBar from "./components/rightBar.js";

import { useEffect, useState } from "react";
const ipcRenderer = window.electron.ipcRenderer;

export default function App(){ 

  const [roomOwnerName,setRoomOwnerName] = useState(null);
  const [roomStatus,setRoomStatus] = useState("inNoRoom"); // inNoRoom | roomOwner | roomGuest
  const [username,setUsername] = useState("");
  const [message,setMessage] = useState("");
  const [roomsFounded,setRoomsFounded] = useState({});
  const [messagesDisplayed , setMessagesDisplayed] = useState([]);
  
  useEffect(() => {
    ipcRenderer.on("ROOM_FOUNDED",(event,ms) => {
      setRoomsFounded(
        { 
          ...roomsFounded,
          ...{[ms.slice(0,ms.indexOf("@"))] : [ms.slice(ms.indexOf("@")+1)]}
        });
      });
      ipcRenderer.on("IM_IN_ROOM",(event,ms) => {
        setRoomStatus("roomGuest");
          setRoomOwnerName(ms);
        });
      ipcRenderer.on("MESSAGE_TO_DISPLAY",(event,ms) => { 
        setMessagesDisplayed(messagesDisplayed.concat(ms));
      });
      ipcRenderer.on("SERVER_IS_CLOSING",(event,ms) => {
        setRoomStatus("inNoRoom")
      })
    return;
  },[roomsFounded,messagesDisplayed]);

  return (
        <div>
          <LeftBar 
            roomStatus = {roomStatus}
            setRoomStatus = {setRoomStatus}
            username = {username}
            setUsername = {setUsername}
            roomsFounded = {roomsFounded}
            setRoomOwnerName = {setRoomOwnerName}
            />
          <RightBar
            roomStatus = {roomStatus}
            setRoomStatus = {setRoomStatus}
            username = {username}
            setUsername = {setUsername}
            roomOwnerName = {roomOwnerName}
            message = {message}
            setMessage = {setMessage}
            messagesDisplayed = {messagesDisplayed}
            />
        </div>
  );
}
