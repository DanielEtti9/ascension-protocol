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
  "Spend time in worship 🙌",
  "Encourage someone today ❤️",
  "Meditate on Scripture 🧠",
  "Fast or sacrifice something today 🔥",
  "Share the Word with someone ✝️",
];

export default function Dashboard() {
  const today = new Date();
  const todayIndex = today.getDate() - 1;
  const todayQuest = quests[today.getDay()];

  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const [stats, setStats] = useState({
    streak: 0,
    longest: 0,
    study: 0,
    prayer: 0,
    worship: 0,
  });

  const [friendId, setFriendId] = useState("");
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // LOAD USER DATA
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setDays(data.days || []);
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

  // CALCULATE STATS
  useEffect(() => {
    let streak = 0;
    let longest = 0;
    let current = 0;

    let study = 0;
    let prayer = 0;
    let worship = 0;

    days.forEach((d, i) => {
      if (d.study) study++;
      if (d.prayer) prayer++;
      if (d.worship) worship++;

      if (d.study && d.prayer && d.worship) {
        current++;
        if (i <= todayIndex) streak = current;
      } else {
        current = 0;
      }

      if (current > longest) longest = current;
    });

    setStats({ streak, longest, study, prayer, worship });
  }, [days]);

  // SAVE USER DATA
  useEffect(() => {
    if (!user || days.length === 0) return;

    const ref = doc(db, "users", user.uid);

    setDoc(
      ref,
      {
        email: user.email,
        days,
        streak: stats.streak,
        longestStreak: stats.longest,
        totalStudy: stats.study,
        totalPrayer: stats.prayer,
        totalWorship: stats.worship,
      },
      { merge: true }
    );
  }, [days, stats]);

  // ADD FRIEND
  const addFriend = async () => {
    if (!friendId) return;

    const ref = doc(db, "users", user.uid);

    await updateDoc(ref, {
      friends: arrayUnion(friendId),
    });

    setFriendId("");
    alert("Friend added!");
  };

  // LOAD FRIENDS
  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const ids = snap.data().friends || [];
      let list = [];

      for (let id of ids) {
        const fSnap = await getDoc(doc(db, "users", id));
        if (fSnap.exists()) list.push(fSnap.data());
      }

      setFriends(list);
    };

    loadFriends();
  }, [user, days]);

  // LEADERBOARD
  useEffect(() => {
    const loadLeaderboard = async () => {
      const snap = await getDocs(collection(db, "users"));

      let list = [];

      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          email: data.email,
          streak: data.streak || 0,
        });
      });

      list.sort((a, b) => b.streak - a.streak);
      setLeaderboard(list.slice(0, 5));
    };

    loadLeaderboard();
  }, [days]);

  // TOGGLE DAY
  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={container}>
      <div style={card}>
        {/* HEADER */}
        <h2>Ascension</h2>
        <p style={{ opacity: 0.6 }}>{user.email}</p>

        {/* VERSE */}
        <div style={verseBox}>"{verse}"</div>

        {/* DAILY QUEST */}
        <div style={questBox}>
          <h4>🔥 Daily Quest</h4>
          <p>{todayQuest}</p>
        </div>

        {/* AI INSIGHT */}
        <div style={aiBox}>
          <h4>🤖 AI Insight</h4>
          <p>
            {stats.streak >= 5
              ? "🔥 You're walking in discipline. Stay consistent."
              : "Stay aligned. Keep building consistency."}
          </p>
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
                  ...dayBox,
                  background: bg,
                  transform: selectedDay === i ? "scale(1.1)" : "scale(1)",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* STREAK */}
        <div style={streakBox}>
          🔥 {stats.streak} Day Streak
        </div>

        {/* STATS */}
        <div style={statsBox}>
          📖 {stats.study} | 🙏 {stats.prayer} | 🙌 {stats.worship}
        </div>

        {/* UPDATE DAY */}
        <div style={updateBox}>
          <h4>Update Day</h4>

          {selectedDay !== null ? (
            <>
              <p>Day {selectedDay + 1}</p>

              <button style={btn("#3b82f6")} onClick={() => toggle("study")}>
                📖 Study
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

        {/* CHAT NAV */}
        <button
          style={btn("#2563eb")}
          onClick={() => (window.location.href = "/chat")}
        >
          Open Chat 💬
        </button>

        {/* ADD FRIEND */}
        <div style={sectionBox}>
          <h4>Add Friend</h4>

          <input
            placeholder="Enter Friend UID"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            style={input}
          />

          <button style={btn("#3b82f6")} onClick={addFriend}>
            Add Friend
          </button>
        </div>

        {/* FRIENDS */}
        <div style={sectionBox}>
          <h4>Friends</h4>

          {friends.length === 0 ? (
            <p>No friends yet</p>
          ) : (
            friends.map((f, i) => (
              <p key={i}>
                {f.email} — 🔥 {f.streak || 0}
              </p>
            ))
          )}
        </div>

        {/* LEADERBOARD */}
        <div style={sectionBox}>
          <h4>🏆 Leaderboard</h4>

          {leaderboard.map((p, i) => (
            <p key={i}>
              {i + 1}. {p.email} — 🔥 {p.streak}
            </p>
          ))}
        </div>

        {/* LOGOUT */}
        <button style={logoutBtn} onClick={handleLogout}>
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
  background: "radial-gradient(circle,#0f172a,#020617)",
};

const card = {
  width: "90%",
  maxWidth: "420px",
  padding: "25px",
  borderRadius: "20px",
  background: "#020617",
  color: "white",
  textAlign: "center",
};

const verseBox = {
  padding: "10px",
  background: "#1e293b",
  borderRadius: "10px",
  marginBottom: "10px",
};

const questBox = {
  padding: "10px",
  background: "#facc15",
  color: "black",
  borderRadius: "10px",
  marginBottom: "10px",
};

const aiBox = {
  padding: "10px",
  background: "#22c55e",
  borderRadius: "10px",
  marginBottom: "10px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: "8px",
};

const dayBox = {
  height: "45px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const streakBox = {
  marginTop: "10px",
  padding: "10px",
  background: "#22c55e",
  borderRadius: "10px",
};

const statsBox = {
  marginTop: "10px",
};

const updateBox = {
  marginTop: "10px",
};

const sectionBox = {
  marginTop: "15px",
  padding: "10px",
  background: "#1e293b",
  borderRadius: "10px",
};

const input = {
  width: "100%",
  padding: "8px",
  marginBottom: "8px",
  borderRadius: "8px",
};

const btn = (color) => ({
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "8px",
  border: "none",
  background: color,
  color: "white",
});

const logoutBtn = {
  marginTop: "15px",
  padding: "10px",
  width: "100%",
};