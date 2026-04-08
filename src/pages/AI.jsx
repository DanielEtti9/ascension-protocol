import { useState, useEffect } from "react";
import { getAIResponse } from "../services/ai";

export default function AI() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [days, setDays] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("days");
    if (saved) {
      setDays(JSON.parse(saved));
    }
  }, []);

const generateSummary = (days) => {
  const total = days.length;

  const study = days.filter((d) => d.study).length;
  const prayer = days.filter((d) => d.prayer).length;
  const focus = days.filter((d) => d.focus).length;

  // Detect patterns
  const weakArea =
    study < prayer && study < focus
      ? "study"
      : prayer < study && prayer < focus
      ? "prayer"
      : "focus";

  return `
Out of ${total} days:
- Study: ${study}
- Prayer: ${prayer}
- Focus: ${focus}

Weakest area: ${weakArea}

Instruction:
Analyze this user deeply and give practical, specific advice to improve consistency.
`;
};

  const handleAsk = async () => {
    try {
      const summary = generateSummary(days);

      const fullPrompt = `
User Data:
${summary}

Question:
${input}
`;

      const res = await getAIResponse(fullPrompt);
      setResponse(res);
    } catch (err) {
      console.error(err);
      setResponse("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#0f172a", minHeight: "100vh", color: "white" }}>
      <h2>AI Assistant</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        style={{ padding: "10px", width: "100%", marginTop: "10px" }}
      />

      <button onClick={handleAsk} style={{ marginTop: "10px" }}>
        Ask AI
      </button>

      <div style={{ marginTop: "20px" }}>
        <p>{response}</p>
      </div>
    </div>
  );
}