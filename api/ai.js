export default async function handler(req, res) {
  try {
    const { message, stats } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const prompt = `
You are a Christian spiritual coach.

User stats:
- Streak: ${stats?.streak || 0}

User question:
${message}

Respond with:
- Encouragement
- Biblical tone
- Practical advice
- Keep it short
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message });
    }

    res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.log("AI ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}