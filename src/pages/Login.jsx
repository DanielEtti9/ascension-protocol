import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background:
          "radial-gradient(circle at top, #0f172a, #020617)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "400px",
          padding: "30px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          textAlign: "center",
          boxShadow: "0 0 40px rgba(34,197,94,0.15)",
        }}
      >
        {/* LOGO / TITLE */}
        <h1 style={{ marginBottom: "10px" }}>Ascension</h1>

        <p style={{ opacity: 0.6, fontSize: "14px" }}>
          Align your life. Grow daily.
        </p>

        {/* VERSE */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.05)",
            fontStyle: "italic",
          }}
        >
          "Draw near to God, and He will draw near to you."
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(90deg,#22c55e,#4ade80)",
            color: "black",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(34,197,94,0.4)",
          }}
        >
          Continue with Google →
        </button>
      </div>
    </div>
  );
}