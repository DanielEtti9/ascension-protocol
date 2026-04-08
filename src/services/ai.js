import axios from "axios";
const API_KEY = import.meta.env.VITE_OPENAI_KEY;

export const getAIResponse = async (message) => {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: `
You are a high-level personal growth AI.
You analyze user habits and give direct, practical advice.

Focus on:
- discipline
- consistency
- spiritual growth
- focus optimization

Be specific. Be actionable. Be honest.
`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("AI ERROR:", err);
    return "Error getting AI response";
  }
};