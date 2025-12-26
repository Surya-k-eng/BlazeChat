import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { chatID, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        chatData.sort((a, b) => b.updatedAt - a.updatedAt);

        setChats(chatData);
      }
    );

    return () => unSub();
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    // mark chat as seen   
    const userChatRef = doc(db, "userchats", currentUser.id);
    const userChatsSnapshot = await getDoc(userChatRef);

    if (userChatsSnapshot.exists()) {
      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData.chats.findIndex(
        (c) => c.chatID === chat.chatID
      );

      if (chatIndex !== -1) {
        userChatsData.chats[chatIndex].isSeen = true;

        await updateDoc(userChatRef, {
          chats: userChatsData.chats,
        });
      }
    }

    // set chat in store
    changeChat(chat.chatID, chat.user);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt="search" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="add"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* Chat items */}
      {chats.map((chat) => (
        <div
          className="items"
          key={chat.chatID}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
        >
          <img 
  src={chat.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.user?.username}`} 
  alt="avatar" 
/>
          <div className="texts">
            <span>{chat.user?.username || "Unknown User"}</span>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
