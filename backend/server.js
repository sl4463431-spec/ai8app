const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash-lite"];

app.get("/", (req, res) => res.json({ name: "AI8", status: "running", message: "AI8 Backend is working" }));

app.post("/api/generate", async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt" });
  const system = language === "ar" ? "انت مساعد ذكي اسمه AI8، رد بالعربية." : "You are AI8 assistant.";
  const fullPrompt = system + "\n\n" + prompt;
  let lastError = "";
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }) });
      const data = await r.json();
      if (!r.ok) {
        lastError = data.error?.message || "Error";
        console.log("Model failed:", model, r.status, lastError);
        if (r.status === 429 || r.status === 503 || lastError.toLowerCase().includes("overload") || lastError.toLowerCase().includes("quota")) continue;
        return res.status(r.status).json({ error: lastError });
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.json({ text });
    } catch (e) { lastError = e.message; continue; }
  }
  return res.status(503).json({ error: "كل الموديلات زحمة: " + lastError });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
