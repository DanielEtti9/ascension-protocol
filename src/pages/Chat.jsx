import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // LOAD MESSAGES (REAL-TIME)
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setMessages(list);
    });

    return () => unsubscribe();
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: input,
      email: user.email,
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={container}>
      <div style={card}>
        <h2>🔥 Fellowship Chat</h2>

        {/* MESSAGES */}
        <div style={chatBox}>
          {messages.map((m, i) => (
            <div key={i} style={msg}>
              <strong>{m.email}</strong>
              <p>{m.text}</p>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
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
  background: "radial-gradient(circle,#0f172a,#020617)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const card = {
  width: "90%",
  maxWidth: "500px",
  background: "#020617",
  padding: "20px",
  borderRadius: "20px",
  color: "white",
};

const chatBox = {
  height: "400px",
  overflowY: "auto",
  marginBottom: "10px",
};

const msg = {
  background: "#1e293b",
  padding: "10px",
  borderRadius: "10px",
  marginBottom: "8px",
};

const inputRow = {
  display: "flex",
  gap: "10px",
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