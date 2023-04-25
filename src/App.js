import LeftBar from "./leftBar.js"
import RightBar from "./rightBar.js";

export default function App(){ 
  return (
    <div className="container">
        <div className="row">
          <LeftBar/>
          <RightBar/>
        </div>
    </div>
  );
}
