import "./login.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [seed, setSeed] = useState("default");
  const [loading, setLoading] = useState(false);

  // This ensures the avatar changes as they type their name, until they shuffle
  useEffect(() => {
    if (username) setSeed(username);
  }, [username]);

  const handleShuffle = (e) => {
    e.preventDefault();
    const randomSeed = Math.random().toString(36).substring(7);
    setSeed(randomSeed);
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  // --- FEATURE 1: LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FEATURE 2: SIGN UP ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: avatarUrl, // Saves the intelligent avatar URL
        id: res.user.uid,
        blocked: []
      });
      await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });
      toast.success("Account created!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* LOGIN SECTION */}
      <div className="item">
        <h2>Welcome Back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "loading" : "Sign In"}</button>
        </form>
      </div>

      <div className="separator"></div>

      {/* SIGN UP SECTION */}
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <div className="avatar-preview">
            <img src={avatarUrl} alt="Avatar" />
            <button type="button" className="shuffle-btn" onClick={handleShuffle}>
              Shuffle
            </button>
          </div>
          <input 
            type="text" 
            placeholder="Username" 
            name="username" 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;