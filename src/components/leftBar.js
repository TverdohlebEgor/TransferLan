import classes from "./leftBar.module.css";
import PossibleRooms from "./possibleRooms";

import { useState } from "react";
const ipcRenderer = window.electron.ipcRenderer;

let isSearching,setIsSearching;

async function SearchButtonPress(isSearching){
  setIsSearching(!isSearching);
  if(!isSearching)
    ipcRenderer.send("StartRoomOwnerSearch");
  else
    ipcRenderer.send("StopRoomOwnerSearch");
}

async function OpenButtonPress(setRoomStatus,setRoomOwnerName,username){
  setRoomOwnerName(username);
  setRoomStatus("roomOwner");
  ipcRenderer.send("ImRoomOwner",username);
}

export default function LeftBar(props){
  [isSearching,setIsSearching] = useState(false);
    return (
      <div className={classes.container}>
        <h1 className={classes.usernameLabel}>USERNAME</h1>
        <input type={"text"} className={classes.usernameTextArea} onChange={(event) => {props.setUsername(event.target.value)}}></input>
        <PossibleRooms
          roomsFounded = {props.roomsFounded}
        />
        <button className={classes.openRoom} disabled={!props.username || props.roomStatus === "roomOwner"} onClick={() => OpenButtonPress(props.setRoomStatus,props.setRoomOwnerName,props.username)}> OPEN ROOM </button>
        <button className={classes.searchRoom} disabled={!props.username} onClick={() => SearchButtonPress(isSearching)}> {isSearching ? "IS SEARCHING" : "SEARCH ROOM"}</button>
      </div>
    );
  }
  