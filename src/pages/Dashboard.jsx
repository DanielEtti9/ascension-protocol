import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  getDocs,
} from "firebase/firestore";

const verse = "Be still, and know that I am God.";

const quests = [
  "Read the Word today 📖",
  "Pray for someone 🙏",
  "Worship deeply today 🙌",
  "Encourage someone ❤️",
  "Share the Gospel ✝️",
  "Reflect in silence 🧠",
  "Intercede for others 🔥",
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const [stats, setStats] = useState({
    streak: 0,
    study: 0,
    prayer: 0,
    worship: 0,
  });

  const [leaderboard, setLeaderboard] = useState([]);

  const todayQuest = quests[new Date().getDay()];

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
        const empty = Array.from({ length: 30 }, () => ({
          study: false,
          prayer: false,
          worship: false,
        }));
        setDays(empty);
      }
    };

    load();
  }, [user]);

  useEffect(() => {
    let streak = 0;
    let study = 0,
      prayer = 0,
      worship = 0;

    days.forEach((d) => {
      if (d.study) study++;
      if (d.prayer) prayer++;
      if (d.worship) worship++;

      if (d.study && d.prayer && d.worship) streak++;
    });

    setStats({ streak, study, prayer, worship });
  }, [days]);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    setDoc(
      ref,
      {
        email: user.email,
        days,
        streak: stats.streak,
      },
      { merge: true }
    );
  }, [days, stats]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const snap = await getDocs(collection(db, "users"));
      let list = [];

      snap.forEach((doc) => list.push(doc.data()));

      list.sort((a, b) => (b.streak || 0) - (a.streak || 0));
      setLeaderboard(list.slice(0, 5));
    };

    loadLeaderboard();
  }, [days]);

  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ fontSize: "28px" }}>Ascension</h1>
        <p style={{ opacity: 0.6 }}>{user.email}</p>

        {/* VERSE */}
        <div style={glass}>
          <p>"{verse}"</p>
        </div>

        {/* QUEST */}
        <div style={quest}>
          🔥 {todayQuest}
        </div>

        {/* AI */}
        <div style={ai}>
          🤖 Stay aligned. Keep building consistency.
        </div>

        {/* GRID */}
        <div style={grid}>
          {days.map((d, i) => {
            const total =
              (d.study ? 1 : 0) +
              (d.prayer ? 1 : 0) +
              (d.worship ? 1 : 0);

            const bg =
              total === 3
                ? "#22c55e"
                : total === 2
                ? "#eab308"
                : total === 1
                ? "#3b82f6"
                : "#111827";

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(i)}
                style={{
                  ...day,
                  background: bg,
                  boxShadow:
                    selectedDay === i
                      ? "0 0 15px rgba(34,197,94,0.8)"
                      : "none",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* STREAK */}
        <div style={streak}>
          🔥 {stats.streak} Day Streak
        </div>

        {/* UPDATE */}
        <div style={glass}>
          <h4>Update Day</h4>

          {selectedDay !== null ? (
            <>
              <button style={btn("#3b82f6")} onClick={() => toggle("study")}>
                📖 Word
              </button>

              <button style={btn("#a855f7")} onClick={() => toggle("prayer")}>
                🙏 Prayer
              </button>

              <button style={btn("#22c55e")} onClick={() => toggle("worship")}>
                🙌 Worship
              </button>
            </>
          ) : (
            <p>Select a day</p>
          )}
        </div>

        {/* LEADERBOARD */}
        <div style={glass}>
          <h4>🏆 Leaderboard</h4>
          {leaderboard.map((p, i) => (
            <p key={i}>
              {i + 1}. {p.email} 🔥 {p.streak || 0}
            </p>
          ))}
        </div>

        <button
          style={btn("#2563eb")}
          onClick={() => (window.location.href = "/chat")}
        >
          Open Chat 💬
        </button>

        <button style={logout} onClick={() => signOut(auth)}>
          Logout
        </button>
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
  background: "radial-gradient(circle at top, #0f172a, #020617)",
};

const card = {
  width: "90%",
  maxWidth: "420px",
  padding: "25px",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  textAlign: "center",
};

const glass = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.05)",
};

const quest = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  background: "#facc15",
  color: "black",
  fontWeight: "bold",
};

const ai = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  background: "#22c55e",
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
  cursor: "pointer",
};

const streak = {
  marginTop: "15px",
  padding: "12px",
  borderRadius: "12px",
  background: "#22c55e",
  fontWeight: "bold",
};

const btn = (color) => ({
  width: "100%",
  padding: "10px",
  marginTop: "8px",
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