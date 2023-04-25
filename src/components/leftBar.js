import classes from "./leftBar.module.css";
import PossibleRooms from "./possibleRooms";

export default function LeftBar(){ 
    return (
      <div className={classes.container}>
        <h1 className={classes.usernameLabel}>USERNAME</h1>
        <input type={"text"} className={classes.usernameTextArea}></input>
        <PossibleRooms/>
        <button className={classes.openRoom}> OPEN ROOM </button>
        <button className={classes.searchRoom}> SEARCH ROOM</button>
      </div>
    );
  }
  