import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [streak, setStreak] = useState(0);

  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);

  // ✅ AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ✅ REAL-TIME USER DATA
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setDays(snap.data().days || []);
        setStreak(snap.data().streak || 0);
      } else {
        const empty = Array.from({ length: 30 }, () => ({
          study: false,
          prayer: false,
          worship: false,
        }));
        setDays(empty);
      }
    });

    return () => unsub();
  }, [user]);

  // ✅ CALCULATE + SAVE STREAK
  useEffect(() => {
    if (!user) return;

    let count = 0;
    days.forEach((d) => {
      if (d.study && d.prayer && d.worship) count++;
    });

    setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        days,
        streak: count,
      },
      { merge: true }
    );
  }, [days]);

  // ✅ TOGGLE DAY (INSTANT)
  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  // ✅ ADD FRIEND
  const addFriend = async () => {
    if (!friendEmail) return;

    const q = query(
      collection(db, "users"),
      where("email", "==", friendEmail)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("User not found");
      return;
    }

    const friendId = snap.docs[0].id;

    await updateDoc(doc(db, "users", user.uid), {
      friends: arrayUnion(friendId),
    });

    setFriendEmail("");
  };

  // ✅ REAL-TIME FRIENDS
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    const unsub = onSnapshot(ref, async (snap) => {
      const ids = snap.data()?.friends || [];

      let list = [];

      for (let id of ids) {
        const unsubFriend = onSnapshot(doc(db, "users", id), (f) => {
          if (f.exists()) {
            setFriends((prev) => {
              const filtered = prev.filter((x) => x.id !== id);
              return [...filtered, { id, ...f.data() }];
            });
          }
        });
      }
    });

    return () => unsub();
  }, [user]);

  if (loading)
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;

  if (!user)
    return <p style={{ color: "white", textAlign: "center" }}>Not logged in</p>;

  return (
    <div style={container}>
      <div style={card}>
        <h2>Ascension</h2>
        <p style={{ opacity: 0.6 }}>{user.email}</p>

        {/* GRID */}
        <div style={grid}>
          {days.map((d, i) => {
            const total =
              (d.study ? 1 : 0) +
              (d.prayer ? 1 : 0) +
              (d.worship ? 1 : 0);

            const color =
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
                  background: color,
                  transform:
                    selectedDay === i ? "scale(1.1)" : "scale(1)",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* STREAK */}
        <div style={streakBox}>🔥 {streak} Day Streak</div>

        {/* UPDATE */}
        <div style={box}>
          <h4>Update Day</h4>

          {selectedDay === null ? (
            <p>Select a day</p>
          ) : (
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
          )}
        </div>

        {/* ADD FRIEND */}
        <div style={box}>
          <h4>Add Friend</h4>

          <input
            placeholder="Enter email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            style={input}
          />

          <button style={btn("#2563eb")} onClick={addFriend}>
            Add Friend
          </button>
        </div>

        {/* FRIENDS */}
        <div style={box}>
          <h4>Friends</h4>

          {friends.length === 0 ? (
            <p>No friends yet</p>
          ) : (
            friends.map((f) => (
              <p key={f.id}>
                {f.email} — 🔥 {f.streak || 0}
              </p>
            ))
          )}
        </div>

        {/* NAV */}
        <button
          style={btn("#2563eb")}
          onClick={() => (window.location.href = "/chat")}
        >
          Global Chat 💬
        </button>

        <button
          style={btn("#22c55e")}
          onClick={() => (window.location.href = "/ai")}
        >
          AI Coach 🤖
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
  paddingTop: "30px",
  background: "#020617",
};

const card = {
  width: "90%",
  maxWidth: "420px",
  padding: "20px",
  borderRadius: "20px",
  background: "#020617",
  color: "white",
  textAlign: "center",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: "6px",
};

const day = {
  height: "42px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
};

const streakBox = {
  marginTop: "10px",
  padding: "10px",
  background: "#22c55e",
  borderRadius: "8px",
};

const box = {
  marginTop: "12px",
  padding: "12px",
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