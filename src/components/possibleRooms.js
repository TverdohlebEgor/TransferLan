import classes from "./possibleRooms.module.css"
import RoomPossibilites from "./roomPossibilites";

export default function PossibleRooms(props){ 
    return (
      <div className={classes.container}>
        {
          Object.keys(props.roomsFounded).map((value) => {
            return(
              <RoomPossibilites
                name = {value}
                ip = {props.roomsFounded[value]}
              />
            );
          })
        }
      </div>
    );
  }
  