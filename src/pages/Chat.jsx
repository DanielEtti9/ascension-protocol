import { useState, useEffect, useRef } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  // ✅ REAL-TIME MESSAGES
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(list);
    });

    return () => unsub();
  }, []);

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: input,
        user: auth.currentUser?.email,
        createdAt: serverTimestamp(),
      });

      setInput("");
    } catch (err) {
      console.log("SEND ERROR:", err);
      alert("Message failed to send");
    }
  };

  // ✅ AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={container}>
      <div style={card}>
        <h2>🔥 Fellowship Chat</h2>

        {/* MESSAGES */}
        <div style={chatBox}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...bubble,
                alignSelf:
                  msg.user === auth.currentUser?.email
                    ? "flex-end"
                    : "flex-start",
                background:
                  msg.user === auth.currentUser?.email
                    ? "#22c55e"
                    : "#1e293b",
              }}
            >
              <small style={{ opacity: 0.6 }}>{msg.user}</small>
              <div>{msg.text}</div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* INPUT */}
        <div style={inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            style={inputBox}
          />
          <button onClick={sendMessage} style={sendBtn}>
            Send
          </button>
        </div>

        <button
          style={backBtn}
          onClick={() => (window.location.href = "/dashboard")}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

/* STYLES */

const container = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  justifyContent: "center",
  paddingTop: "20px",
};

const card = {
  width: "95%",
  maxWidth: "500px",
  color: "white",
};

const chatBox = {
  height: "60vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginTop: "10px",
};

const bubble = {
  padding: "10px",
  borderRadius: "10px",
  maxWidth: "70%",
};

const inputRow = {
  display: "flex",
  marginTop: "10px",
  gap: "6px",
};

const inputBox = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
};

const sendBtn = {
  padding: "10px",
  background: "#22c55e",
  border: "none",
  borderRadius: "10px",
  color: "white",
};

const backBtn = {
  marginTop: "10px",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
};