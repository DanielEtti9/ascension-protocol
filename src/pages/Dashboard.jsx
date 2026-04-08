import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const verse = "Be still, and know that I am God.";

export default function Dashboard() {
  const today = new Date();
  const todayIndex = today.getDate() - 1;

  const [user, setUser] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // LOAD DATA
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

  // SAVE DATA
  useEffect(() => {
    if (!user || days.length === 0) return;
    const ref = doc(db, "users", user.uid);
    setDoc(ref, { days }, { merge: true });
  }, [days]);

  // TOGGLE
  const toggle = (type) => {
    if (selectedDay === null) return;

    const updated = [...days];
    updated[selectedDay][type] = !updated[selectedDay][type];
    setDays(updated);
  };

  // STREAK
  const getStreak = () => {
    let streak = 0;

    for (let i = todayIndex; i >= 0; i--) {
      const d = days[i];
      if (d?.study && d?.prayer && d?.worship) streak++;
      else break;
    }

    return streak;
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0f172a, #020617)",
        display: "flex",
        justifyContent: "center",
        padding: "30px 20px",
        color: "white",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "25px", textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Ascension</h2>
          <p style={{ fontSize: "12px", opacity: 0.6 }}>
            {user.email}
          </p>
        </div>

        {/* VERSE CARD */}
        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(168,85,247,0.2))",
            textAlign: "center",
            marginBottom: "25px",
            boxShadow: "0 0 30px rgba(34,197,94,0.2)",
          }}
        >
          <p style={{ fontStyle: "italic", lineHeight: 1.6 }}>
            "{verse}"
          </p>
        </div>

        {/* DAYS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
          }}
        >
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
                  height: "52px",
                  borderRadius: "14px",
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "0.2s",
                  transform:
                    selectedDay === i ? "scale(1.1)" : "scale(1)",
                  boxShadow:
                    selectedDay === i
                      ? "0 0 20px rgba(34,197,94,0.6)"
                      : "none",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* STREAK */}
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            borderRadius: "18px",
            background: "linear-gradient(90deg,#22c55e,#4ade80)",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            boxShadow: "0 0 25px rgba(34,197,94,0.5)",
          }}
        >
          {getStreak()} Day Streak 🔥
        </div>

        {/* UPDATE */}
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            borderRadius: "18px",
            background: "#0f172a",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Update Day</h3>

          {selectedDay !== null ? (
            <>
              <p style={{ textAlign: "center", opacity: 0.6 }}>
                Day {selectedDay + 1}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "15px",
                }}
              >
                <button style={btnStyle("#3b82f6")} onClick={() => toggle("study")}>
                  📖 Study the Word
                </button>

                <button style={btnStyle("#a855f7")} onClick={() => toggle("prayer")}>
                  🙏 Prayer
                </button>

                <button style={btnStyle("#22c55e")} onClick={() => toggle("worship")}>
                  🙌 Worship
                </button>
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", opacity: 0.5 }}>
              Select a day above
            </p>
          )}
        </div>

        {/* LEGEND */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "12px",
            opacity: 0.5,
          }}
        >
          📖 Word • 🙏 Prayer • 🙌 Worship
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            background: "#111827",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// BUTTON STYLE
const btnStyle = (color) => ({
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: color,
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: `0 0 15px ${color}`,
});