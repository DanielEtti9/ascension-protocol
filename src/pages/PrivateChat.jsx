import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useParams } from "react-router-dom";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function PrivateChat() {
  const { friendId } = useParams();

  const [user, setUser] = useState(null);
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // AUTH
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  // CREATE CHAT ID
  const getChatId = () => {
    return [user.uid, friendId].sort().join("_");
  };

  // LOAD FRIEND
  useEffect(() => {
    if (!friendId) return;

    const loadFriend = async () => {
      const snap = await getDoc(doc(db, "users", friendId));
      if (snap.exists()) setFriend(snap.data());
    };

    loadFriend();
  }, [friendId]);

  // LOAD MESSAGES
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      const chatRef = doc(db, "chats", getChatId());
      const snap = await getDoc(chatRef);

      if (snap.exists()) {
        setMessages(snap.data().messages || []);
      }
    };

    loadMessages();
  }, [user]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const chatRef = doc(db, "chats", getChatId());

    const newMsg = {
      text: input,
      sender: user.uid,
      time: new Date().toISOString(),
    };

    await setDoc(
      chatRef,
      {
        messages: arrayUnion(newMsg),
      },
      { merge: true }
    );

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  if (!user) return null;

  return (
    <div style={container}>
      <div style={card}>
        <h3>Chat with {friend?.email}</h3>

        <div style={chatBox}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...msg,
                alignSelf:
                  m.sender === user.uid ? "flex-end" : "flex-start",
                background:
                  m.sender === user.uid ? "#22c55e" : "#1e293b",
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={row}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={inputStyle}
          />

          <button onClick={sendMessage} style={sendBtn}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617",
};

const card = {
  width: "90%",
  maxWidth: "400px",
  background: "#020617",
  padding: "20px",
  borderRadius: "20px",
  color: "white",
};

const chatBox = {
  height: "400px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "10px",
};

const msg = {
  padding: "10px",
  borderRadius: "10px",
  maxWidth: "70%",
};

const row = {
  display: "flex",
  gap: "8px",
};

const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
};

const sendBtn = {
  padding: "10px",
  background: "#22c55e",
  border: "none",
  borderRadius: "8px",
};