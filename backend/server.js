const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// الموديلات الجديدة بس - 2.0 اتلغى من جوجل
const MODELS = ["gemini-3.8-flash", "gemini-3-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

app.get("/", (req, res) => res.json({ name: "AI8", status: "running", message: "AI8 Backend is working" }));

app.post("/api/generate", async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt" });
  const system = language === "ar" ? "انت مساعد ذكي اسمه AI8، رد بالعربية وباختصار." : "You are AI8 assistant.";
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
        // لو الموديل اتلغى او زحمة او حصة - جرب اللي بعده على طول، مترجعش خطأ
        if (r.status === 400 || r.status === 404 || r.status === 429 || r.status === 503 || lastError.toLowerCase().includes("not available") || lastError.toLowerCase().includes("overload") || lastError.toLowerCase().includes("quota") || lastError.toLowerCase().includes("high demand")) {
          continue;
        }
        return res.status(r.status).json({ error: lastError });
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.json({ text });
    } catch (e) { lastError = e.message; continue; }
  }
  return res.status(503).json({ error: "كل الموديلات زحمة دلوقتي، جرب تاني بعد دقيقة: " + lastError });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
