const askAI = async () => {
  if (!input.trim()) return;

  setLoading(true);

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        stats,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setResponse(data.reply);
  } catch (err) {
    console.log(err);
    alert("AI failed");
  }

  setLoading(false);
};