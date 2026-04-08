import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const slides = [
  {
    title: "Grow Spiritually",
    text: "Track your walk with God daily",
  },
  {
    title: "Stay Consistent",
    text: "Build discipline in prayer, word, and worship",
  },
  {
    title: "Walk Together",
    text: "Encourage friends and grow together",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      localStorage.setItem("seenOnboarding", "true");
      navigate("/");
    }
  };

  return (
    <div style={container}>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={card}
      >
        <h1>{slides[index].title}</h1>
        <p>{slides[index].text}</p>

        <button style={btn} onClick={next}>
          {index === slides.length - 1 ? "Start" : "Next"}
        </button>
      </motion.div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "radial-gradient(circle,#0f172a,#020617)",
};

const card = {
  width: "90%",
  maxWidth: "400px",
  padding: "30px",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  textAlign: "center",
};

const btn = {
  marginTop: "20px",
  padding: "12px",
  width: "100%",
  borderRadius: "12px",
  border: "none",
  background: "#22c55e",
  color: "white",
};