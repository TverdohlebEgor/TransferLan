import LeftBar from "./components/leftBar.js"
import RightBar from "./components/rightBar.js";

import { useEffect, useState } from "react";
const ipcRenderer = window.electron.ipcRenderer;

export default function App(){ 

  const [roomOwnerName,setRoomOwnerName] = useState(null);
  const [roomOwnerIp,setRoomOwnerIp] = useState(null);
  const [roomsFounded,setRoomsFounded] = useState({});
  const [roomStatus,setRoomStatus] = useState("inNoRoom"); // inNoRoom | roomOwner | roomGuest
  const [username,setUsername] = useState("");
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
    return;
  },[roomsFounded]);

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
            />
        </div>
  );
}
