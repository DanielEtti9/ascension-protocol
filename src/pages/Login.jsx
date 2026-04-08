import { useEffect } from "react";
import { auth, provider } from "../services/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

export default function Login() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "/dashboard";
      }
    });

    return () => unsub();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1>Ascension</h1>
        <p>Grow spiritually daily</p>

        <button style={btn} onClick={login}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617",
};

const card = {
  padding: "30px",
  borderRadius: "20px",
  background: "#1e293b",
  color: "white",
  textAlign: "center",
};

const btn = {
  marginTop: "20px",
  padding: "12px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "#22c55e",
  color: "white",
};