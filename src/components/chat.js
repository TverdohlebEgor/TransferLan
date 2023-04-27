import classes from "./chat.module.css";

export default function Chat(props){ 
    return (
      <div>
        {
          props.messagesDisplayed.map(
            (value) => {return(<p className={classes.message}>
              {value}
            </p>) }
          )
        }
      </div>
    );
  }