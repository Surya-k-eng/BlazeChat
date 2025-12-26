import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";
import { doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [Text, setText] = useState("");
  const [chat, setChat] = useState();   //? ✅ added
  const {currentUser} = useUserStore()
  const {chatID, user} = useChatStore()
  const [incomingCall, setIncomingCall] = useState(null);
  console.log(Text);
  const endRef = useRef(null)

  useEffect(() => {
    if (!chatID || !currentUser) return;
    const callDoc = doc(db, "voiceCalls", chatID);
    const unsub = onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data && data.to === currentUser.id && !data.accepted) {
        setIncomingCall(data);
      }});
      return () => unsub();
    }, [chatID, currentUser]);

  


  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"})     
  },[])

  useEffect(()=>{

    if (!chatID) return;
    const unSub = onSnapshot(doc(db,"chats",chatID),(res)=>{
      setChat(res.data());
    });
    return () =>{
      unSub();
    };
  },[chatID]);
  console.log(chat)

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
  if (Text === "" || !chatID || !currentUser) return;

  try {
    // push message to chat
    await updateDoc(doc(db, "chats", chatID), {
      messages: arrayUnion({
        senderId: currentUser.id,
        text: Text,
        createdAt: Date.now()
      })
    });

    // clear input
    setText("");

    // update last message in userChats
    const userIDs = [currentUser.id,user.id]

    for (const id of userIDs){
    const userChatRef = doc(db, "userchats",id);
    const userChatsSnapshot = await getDoc(userChatRef);

    if (userChatsSnapshot.exists()) {
      const userChatsData = userChatsSnapshot.data();

      const chatIndex = userChatsData.chats.findIndex(
        (c) => c.chatID === chatID
      );

      if (chatIndex !== -1) {
        userChatsData.chats[chatIndex].lastMessage = Text;
        userChatsData.chats[chatIndex].isSeen = id == false;
        userChatsData.chats[chatIndex].updatedAt = Date.now();

        await updateDoc(userChatRef, {
          chats: userChatsData.chats,
        });
      }
    }
    }
    
  } catch (err) {
    console.error("Error sending message:", err);
  }
};



  return (
    <div className="chat">
      {/* Top Section */}
      <div className="top">
        <div className="user">
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`} 
            alt="User Avatar" 
          />
          <div className="texts">
            <h1>{user?.username || "Unknown User"}</h1>
            
          </div>
        </div>

        <div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video Call" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="center">
        {chat?.messages.map((message) => (
          <div className={`messages ${message.senderId === currentUser.id ? "own" : ""}`}key={message?.createdAt}>
            <div className="texts">
              <p>{message.text}</p>
            </div>
          </div>
))}

        
        

        
        <div ref={endRef}></div>
      </div>

      {/* Bottom Input Section */}
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="Attach" />
          <img src="./camera.png" alt="Camera" />
          <img src="./mic.png" alt="Mic" />
        </div>

        <input
          type="text"
          placeholder="Type a message"
          value={Text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend}>Send</button>
        
      </div>
    </div>
  );
};

export default Chat;
