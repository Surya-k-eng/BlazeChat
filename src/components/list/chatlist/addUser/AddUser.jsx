import "./addUser.css";
import { collection, query, where, getDocs, setDoc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { doc } from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const {currentUser} = useUserStore()

  const handleAdd = async()=>{

    const chatRef = collection(db,"chats")
    const userChatRef = collection(db,"userchats")
    try{
      const newChatRef = doc(chatRef)

      await setDoc(newChatRef,{
        createdAt:serverTimestamp(),
        messages:[],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatID: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt:Date.now(),
        }),
      });     

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatID:newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt:Date.now(),
        }),
      });

      console.log(newChatRef.id)

    }catch(err)
    {
      console.log(err)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" name="username" placeholder="Username" />
        <button type="submit">Search</button>
      </form>

      {user && (
  <div className="user">
    <div className="detail">
      {/* Use the avatar from the found user object */}
      <img 
  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
  alt="avatar" 
/>
      <span>{user.username}</span>
    </div>
    <button onClick={handleAdd}>Add User</button>
  </div>
)}
    </div>
  );
};

export default AddUser;
