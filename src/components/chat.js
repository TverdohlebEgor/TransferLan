import classes from "./chat.module.css";

const ipcRenderer = window.electron.ipcRenderer;

const FILE_MESSAGE_HEADER = "EFJ90S";

async function FileButtonPressed(roomStatus,filems){
  if(roomStatus === "roomGuest")
    ipcRenderer.send("clientFileRequest",filems);
  else
    ipcRenderer.send("serverFileRequest",filems);
}

export default function Chat(props){ 
    return (
      <div>
        {
          props.messagesDisplayed.map(
            (value) => {
              console.log("value " + value)
              console.log(value.substring(0,6))
            if(value.substring(0,6) === FILE_MESSAGE_HEADER){
              return(
                <button className={classes.file} onClick={() => FileButtonPressed(props.roomStatus,value)}>
                  {value.substring(6,value.indexOf("/")) + "@" +value.substring(value.lastIndexOf("/")+1)}
                </button>
              )
            }
            else{
              return(
                <p className={classes.message}>
                  {value}
                </p>) 
            }
              }
          )
        }
      </div>
    );
  }