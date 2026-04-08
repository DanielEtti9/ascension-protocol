import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);

  const [streak, setStreak] = useState(0);

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

  // CALCULATE STREAK
  useEffect(() => {
    let s = 0;
    days.forEach((d) => {
      if (d.study && d.prayer && d.worship) s++;
    });
    setStreak(s);
  }, [days]);

  // SAVE USER DATA
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    setDoc(
      ref,
      {
        email: user.email,
        days,
        streak,
      },
      { merge: true }
    );

    // SAVE FOR AI
    localStorage.setItem("stats", JSON.stringify({ streak }));
  }, [days, streak]);

  // ADD FRIEND BY EMAIL
  const addFriend = async () => {
    if (!friendEmail) return;

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", friendEmail)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("User not found");
        return;
      }

      const friendDoc = snap.docs[0];
      const friendId = friendDoc.id;

      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        friends: arrayUnion(friendId),
      });

      setFriendEmail("");
      alert("Friend added!");
    } catch (err) {
      console.log(err);
    }
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
        if (fSnap.exists()) {
          list.push({ id: id, ...fSnap.data() });
        }
      }

      setFriends(list);
    };

    loadFriends();
  }, [user, days]);

  // TOGGLE DAY
  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  if (!user) return null;

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
                  transform: selectedDay === i ? "scale(1.1)" : "scale(1)",
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
            friends.map((f, i) => (
              <div key={i}>
                <p>
                  {f.email} — 🔥 {f.streak || 0}
                </p>

                <button
                  style={btn("#22c55e")}
                  onClick={() =>
                    (window.location.href = "/chat/" + f.id)
                  }
                >
                  Message 💬
                </button>
              </div>
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

        {/* LOGOUT */}
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
  background: "radial-gradient(circle,#0f172a,#020617)",
};

const card = {
  width: "90%",
  maxWidth: "420px",
  padding: "20px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  color: "white",
  textAlign: "center",
};

const grid = {
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

const streakBox = {
  marginTop: "10px",
  padding: "10px",
  background: "#22c55e",
  borderRadius: "10px",
};

const box = {
  marginTop: "15px",
  padding: "12px",
  background: "#1e293b",
  borderRadius: "12px",
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