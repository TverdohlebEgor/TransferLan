import classes from "./roomPossibilites.module.css"
const ipcRenderer = window.electron.ipcRenderer;


async function EnterButtonPressed(roomOwnerName,roomOwnerIp){
  ipcRenderer.send("EnteringRoom",[roomOwnerName,roomOwnerIp]);
}

export default function RoomPossibilites(props){ 
    return (
      <div className={classes.container}>
        {props.name}
        <button onClick={() => EnterButtonPressed(props.name,props.ip)}> ENTER </button>
      </div>
    );
  }
  