import classes from "./rightBar.module.css";

import Chat from "./chat";

export default function RightBar(props){ 

    let Header;

    if(props.roomStatus === "inNoRoom") Header = "In no room";
    else if(props.roomStatus === "roomGuest") Header = "In "+props.roomOwnerName+" room";
    else if(props.roomStatus === "roomOwner") Header = "In your room";

    return (
        <div className={classes.container}>
            <div className={classes.currentRoomHeader}>
                {Header}
            </div>
            <Chat/>
            <div className={classes.messageArea}>
                <textarea className={classes.textArea}></textarea>
                <button className={classes.buttonMessage}>{">"}</button>
                <button className={classes.buttonFile}>FILE</button>
            </div>
        </div>

    );
  }