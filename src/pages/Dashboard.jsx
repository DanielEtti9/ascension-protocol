import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

const verse = "Be still, and know that I am God.";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setDays(snap.data().days || []);
      } else {
        setDays(
          Array.from({ length: 30 }, () => ({
            study: false,
            prayer: false,
            worship: false,
          }))
        );
      }
    };

    load();
  }, [user]);

  useEffect(() => {
    let s = 0;
    days.forEach((d) => {
      if (d.study && d.prayer && d.worship) s++;
    });
    setStreak(s);
  }, [days]);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    setDoc(ref, { email: user.email, days, streak }, { merge: true });

    localStorage.setItem("stats", JSON.stringify({ streak }));
  }, [days, streak]);

  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  if (!user) return null;

  return (
    <div style={container}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={card}>
        <h1>Ascension</h1>
        <p style={{ opacity: 0.6 }}>{user.email}</p>

        <div style={glass}>
          <p>"{verse}"</p>
        </div>

        <div style={grid}>
          {days.map((d, i) => {
            const done = d.study && d.prayer && d.worship;

            return (
              <motion.div
                whileTap={{ scale: 0.9 }}
                key={i}
                onClick={() => setSelectedDay(i)}
                style={{
                  ...day,
                  background: done ? "#22c55e" : "#111827",
                }}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>

        <div style={streakBox}>🔥 {streak} Day Streak</div>

        <div style={glass}>
          <h4>Update Day</h4>

          <button style={btn("#3b82f6")} onClick={() => toggle("study")}>
            📖 Word
          </button>

          <button style={btn("#a855f7")} onClick={() => toggle("prayer")}>
            🙏 Prayer
          </button>

          <button style={btn("#22c55e")} onClick={() => toggle("worship")}>
            🙌 Worship
          </button>
        </div>

        <button style={logout} onClick={() => signOut(auth)}>
          Logout
        </button>
      </motion.div>
    </div>
  );
}

/* STYLES */

const container = {
  display: "flex",
  justifyContent: "center",
  paddingTop: "30px",
};

const card = {
  width: "90%",
  maxWidth: "400px",
  padding: "20px",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  textAlign: "center",
};

const glass = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.05)",
};

const grid = {
  marginTop: "15px",
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: "8px",
};

const day = {
  height: "45px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const streakBox = {
  marginTop: "15px",
  padding: "10px",
  borderRadius: "10px",
  background: "#22c55e",
};

const btn = (color) => ({
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  borderRadius: "10px",
  border: "none",
  background: color,
  color: "white",
});

const logout = {
  marginTop: "15px",
  padding: "10px",
  width: "100%",
};