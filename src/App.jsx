import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AI() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    streak: 0,
    study: 0,
    prayer: 0,
    worship: 0,
  });

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        const saved = localStorage.getItem("stats");
        if (saved) setStats(JSON.parse(saved));
      }
    });
  }, []);

  const askAI = async () => {
    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        stats,
      }),
    });

    const data = await res.json();

    setResponse(data.reply);
    setLoading(false);
  };

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={container}>
      <div style={card}>
        <h2>🤖 AI Coach</h2>

        <textarea
          placeholder="Ask for guidance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={textarea}
        />

        <button onClick={askAI} style={btn}>
          {loading ? "Thinking..." : "Ask"}
        </button>

        <div style={responseBox}>
          <p>{response}</p>
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
  background: "radial-gradient(circle,#0f172a,#020617)",
};

const card = {
  width: "90%",
  maxWidth: "400px",
  padding: "20px",
  borderRadius: "20px",
  background: "#020617",
  color: "white",
};

const textarea = {
  width: "100%",
  height: "100px",
  marginTop: "10px",
  borderRadius: "10px",
  padding: "10px",
};

const btn = {
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  background: "#22c55e",
  border: "none",
  borderRadius: "10px",
};

const responseBox = {
  marginTop: "15px",
  padding: "10px",
  background: "#1e293b",
  borderRadius: "10px",
};