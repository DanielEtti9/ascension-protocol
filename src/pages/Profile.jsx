import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import AI from "./pages/AI";
import Profile from "./pages/Profile";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={container}>
      <div style={content}>{children}</div>

      {/* TAB BAR */}
      <div style={tabBar}>
        <Tab icon="🏠" active={location.pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
        <Tab icon="💬" active={location.pathname === "/chat"} onClick={() => navigate("/chat")} />
        <Tab icon="🤖" active={location.pathname === "/ai"} onClick={() => navigate("/ai")} />
        <Tab icon="👤" active={location.pathname === "/profile"} onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
}

function Tab({ icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...tabBtn,
        opacity: active ? 1 : 0.5,
        transform: active ? "scale(1.2)" : "scale(1)",
      }}
    >
      {icon}
    </button>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/chat" element={<Layout><Chat /></Layout>} />
        <Route path="/ai" element={<Layout><AI /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/* STYLES */

const container = {
  minHeight: "100vh",
  background: "radial-gradient(circle,#0f172a,#020617)",
};

const content = {
  paddingBottom: "80px",
};

const tabBar = {
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
};

const tabBtn = {
  fontSize: "22px",
  background: "none",
  border: "none",
  color: "white",
};