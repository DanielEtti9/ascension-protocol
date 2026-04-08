import { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("time"));

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsub();
  }, []);

  const send = async () => {
    if (!input) return;

    await addDoc(collection(db, "messages"), {
      text: input,
      user: auth.currentUser.email,
      time: new Date(),
    });

    setInput("");
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>🔥 Fellowship Chat</h2>

      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.user}:</b> {m.text}
          </p>
        ))}
      </div>

      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}