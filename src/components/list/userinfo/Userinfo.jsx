import "./userInfo.css"
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {
  const { currentUser } = useUserStore();

  return (
    <div className="userInfo">
        <div className="user">
            {/* 1. Update this line to use the avatar from your Store */}
            <img src={currentUser?.avatar || "./avatar.png"} alt="User Avatar"/>
            
            {/* 2. Your username logic is already good */}
            <h1>{currentUser?.username || "Guest"}</h1>
        </div>
        <div className="icons">
            <img src="./more.png" alt=""/>
            <img src="./video.png" alt=""/>
            <img src="./edit.png" alt=""/>
        </div>
    </div>
  )
}

export default Userinfo;