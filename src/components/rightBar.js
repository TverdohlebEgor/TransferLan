import classes from "./rightBar.module.css";

import Chat from "./chat";
const ipcRenderer = window.electron.ipcRenderer;

async function ButtonMessagePressed(roomStatus,ms,setMessage){
    if(ms === "" || roomStatus === "inNoRoom") return;
    if(roomStatus === "roomGuest")
        ipcRenderer.send("roomGuestSendMessage",ms);
    else if(roomStatus === "roomOwner")
        ipcRenderer.send("roomOwnerSendMessage",ms);
    setMessage("");
}

export default function RightBar(props){ 

    let Header;

    if(props.roomStatus === "inNoRoom") Header = "In no room";
    else if(props.roomStatus === "roomGuest") Header = "In "+props.roomOwnerName+" room";
    else if(props.roomStatus === "roomOwner") Header = "In your room " + props.roomOwnerName;

    return (
        <div className={classes.container}>
            <div className={classes.currentRoomHeader}>
                {Header}
            </div>
            <Chat
                messagesDisplayed = {props.messagesDisplayed}    
            />
            <div className={classes.messageArea}>
                <textarea className={classes.textArea} value={props.message} onChange={(event) => {props.setMessage(event.target.value)}}></textarea>
                <button className={classes.buttonMessage} onClick={() => ButtonMessagePressed(props.roomStatus,props.username+"@"+props.message,props.setMessage)}>{">"}</button>
                <button className={classes.buttonFile}>FILE</button>
            </div>
        </div>

    );
  }