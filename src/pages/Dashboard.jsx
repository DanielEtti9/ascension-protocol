import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [streak, setStreak] = useState(0);

  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // LOAD USER
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

  // STREAK
  useEffect(() => {
    let count = 0;
    days.forEach((d) => {
      if (d.study && d.prayer && d.worship) count++;
    });
    setStreak(count);
  }, [days]);

  // SAVE
  useEffect(() => {
    if (!user) return;

    setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        days,
        streak,
      },
      { merge: true }
    );
  }, [days, streak]);

  // TOGGLE
  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  // ADD FRIEND (EMAIL)
  const addFriend = async () => {
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

    alert("Friend added!");
    setFriendEmail("");
  };

  // LOAD FRIENDS
  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      const ids = snap.data()?.friends || [];

      let list = [];

      for (let id of ids) {
        const f = await getDoc(doc(db, "users", id));
        if (f.exists()) list.push({ id, ...f.data() });
      }

      setFriends(list);
    };

    loadFriends();
  }, [user]);

  if (!user) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={container}>
      <div style={card}>
        <h2>Ascension</h2>
        <p>{user.email}</p>

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
                style={{ ...day, background: color }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <div style={streak}>🔥 {streak} Day Streak</div>

        {/* UPDATE */}
        <div style={box}>
          <h4>Update Day</h4>
          {selectedDay === null ? (
            <p>Select a day</p>
          ) : (
            <>
              <button onClick={() => toggle("study")}>📖 Word</button>
              <button onClick={() => toggle("prayer")}>🙏 Prayer</button>
              <button onClick={() => toggle("worship")}>🙌 Worship</button>
            </>
          )}
        </div>

        {/* FRIENDS */}
        <div style={box}>
          <h4>Add Friend</h4>
          <input
            placeholder="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
          />
          <button onClick={addFriend}>Add</button>
        </div>

        <div style={box}>
          <h4>Friends</h4>
          {friends.map((f) => (
            <p key={f.id}>
              {f.email} — 🔥 {f.streak || 0}
            </p>
          ))}
        </div>

        {/* NAV */}
        <button onClick={() => (window.location.href = "/chat")}>
          Global Chat
        </button>

        <button onClick={() => (window.location.href = "/ai")}>
          AI Coach
        </button>

        <button onClick={() => signOut(auth)}>Logout</button>
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
  maxWidth: "400px",
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
  height: "40px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const streak = {
  marginTop: "10px",
  padding: "10px",
  background: "#22c55e",
  borderRadius: "8px",
};

const box = {
  marginTop: "10px",
  padding: "10px",
  background: "#1e293b",
  borderRadius: "10px",
};