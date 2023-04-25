import classes from "./possibleRooms.module.css"
import RoomPossibilites from "./roomPossibilites";

export default function PossibleRooms(){ 
    return (
      <div className={classes.container}>
        <RoomPossibilites/>
        <RoomPossibilites/>
      </div>
    );
  }
  