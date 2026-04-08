import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setDays(snap.data().days || []);
        setStreak(snap.data().streak || 0);
      } else {
        setDays(Array.from({ length: 30 }, () => ({
          study: false,
          prayer: false,
          worship: false,
        })));
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let s = 0;
    days.forEach(d => {
      if (d.study && d.prayer && d.worship) s++;
    });

    setDoc(doc(db, "users", user.uid), {
      email: user.email,
      days,
      streak: s,
    }, { merge: true });
  }, [days]);

  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  if (!user) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={container}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={card}>
        
        <h2>Ascension</h2>
        <p style={{ opacity: 0.6 }}>{user.email}</p>

        {/* 🔥 STREAK */}
        <div style={streakBox}>
          🔥 {streak} Day Streak
        </div>

        {/* 📅 GRID */}
        <div style={grid}>
          {days.map((d, i) => {
            const total =
              (d.study ? 1 : 0) +
              (d.prayer ? 1 : 0) +
              (d.worship ? 1 : 0);

            const color =
              total === 3 ? "#22c55e" :
              total === 2 ? "#eab308" :
              total === 1 ? "#3b82f6" :
              "#111827";

            return (
              <motion.div
                whileTap={{ scale: 0.85 }}
                key={i}
                onClick={() => setSelectedDay(i)}
                style={{ ...day, background: color }}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>

        {/* ✨ UPDATE */}
        <div style={glass}>
          <h4>Update Day</h4>

          <button style={btn("#3b82f6")} onClick={() => toggle("study")}>📖 Word</button>
          <button style={btn("#a855f7")} onClick={() => toggle("prayer")}>🙏 Prayer</button>
          <button style={btn("#22c55e")} onClick={() => toggle("worship")}>🙌 Worship</button>
        </div>

      </motion.div>
    </div>
  );
}

/* 🎨 STYLES */

const container = {
  display: "flex",
  justifyContent: "center",
  paddingTop: "30px",
};

const card = {
  width: "90%",
  maxWidth: "420px",
  padding: "25px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 0 40px rgba(34,197,94,0.2)",
  color: "white",
  textAlign: "center",
};

const streakBox = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  background: "#22c55e",
  boxShadow: "0 0 15px #22c55e",
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

const glass = {
  marginTop: "15px",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.05)",
};

const btn = (color) => ({
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "12px",
  border: "none",
  background: color,
  color: "white",
  boxShadow: `0 0 12px ${color}`,
});