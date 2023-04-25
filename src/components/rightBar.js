import classes from "./rightBar.module.css";

import Chat from "./chat";

export default function RightBar(){ 
    return (
        <div className={classes.container}>
            <div className={classes.currentRoomHeader}>
                IN X ROOM / IN NO ROOM
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