export default async function handler(req, res) {
  const { message, stats } = req.body;

  const prompt = `
You are a Christian spiritual coach.

User Stats:
- Streak: ${stats.streak}
- Study days: ${stats.study}
- Prayer days: ${stats.prayer}
- Worship days: ${stats.worship}

User Message:
${message}

Give:
- Encouragement
- Biblical tone
- Short actionable advice
`;

  try {
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

    res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
}