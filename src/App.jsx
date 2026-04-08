import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import AI from "./pages/AI";

function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div style={appContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ paddingBottom: "80px" }}
      >
        {children}
      </motion.div>

      {/* BOTTOM NAV */}
      <div style={nav}>
        <button onClick={() => navigate("/dashboard")} style={navBtn}>🏠</button>
        <button onClick={() => navigate("/chat")} style={navBtn}>💬</button>
        <button onClick={() => navigate("/ai")} style={navBtn}>🤖</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/chat"
          element={
            <Layout>
              <Chat />
            </Layout>
          }
        />

        <Route
          path="/ai"
          element={
            <Layout>
              <AI />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/* STYLES */

const appContainer = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top,#0f172a,#020617)",
};

const nav = {
  position: "fixed",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "90%",
  maxWidth: "400px",
  display: "flex",
  justifyContent: "space-around",
  padding: "12px",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  background: "rgba(255,255,255,0.08)",
  boxShadow: "0 0 20px rgba(0,0,0,0.4)",
};

const navBtn = {
  fontSize: "20px",
  background: "none",
  border: "none",
  color: "white",
};