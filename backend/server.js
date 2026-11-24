const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.get("/", (req, res) => res.json({ name: "AI8", status: "running" }));

// نفس دالة الموديلات اللي عندك
async function getAvailableModels() {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await r.json();
    const names = (data.models || []).map(m => m.name.replace("models/", ""));
    names.sort((a, b) => b.localeCompare(a));
    console.log("Available models:", names);
    return names.length ? names : ["gemini-3.8-flash", "gemini-2.5-flash"];
  } catch (e) {
    return ["gemini-3.8-flash", "gemini-2.5-flash"];
  }
}

// 1. توليد نص - زي ما هو عندك
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, language, history } = req.body;
    const models = await getAvailableModels();
    let lastErr = null;
    for (const model of models.slice(0, 3)) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `انت دكتور بيطري ومهندس زراعي خبير في مصر. جاوب ${language === "ar" ? "بالعربي المصري" : "in English"} بالتفصيل.\nالمحادثة:\n${(history || []).map(h => h.role + ": " + h.content).join("\n")}\n\nالسؤال: ${prompt}` }] }]
          })
        });
        const d = await r.json();
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return res.json({ text });
        lastErr = d.error?.message || "no text";
      } catch (e) { lastErr = e.message; await sleep(500); }
    }
    res.status(500).json({ error: lastErr || "generate failed" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. توليد فيديو - ده اللي كان ناقص
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    // لو عندك Replicate هيولد فيديو بجد
    if (process.env.REPLICATE_API_TOKEN) {
      const start = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Prefer": "wait"
        },
        body: JSON.stringify({
          version: "minimax/video-01",
          input: { prompt: `A farmer in Egypt, ${prompt}, realistic educational video` }
        })
      });
      const pred = await start.json();
      if (pred.output) {
        const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
        return res.json({ videoUrl: url });
      }
      return res.json({ status: "queued", jobId: pred.id });
    }

    // لو مفيش مفتاح فيديو، رجع 503 واضح مش فيديو وهمي
    return res.status(503).json({ error: "VIDEO_NOT_CONFIGURED", message: "Add REPLICATE_API_TOKEN in Render" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. متابعة حالة الفيديو
app.get("/api/video-status/:id", async (req, res) => {
  try {
    if (!process.env.REPLICATE_API_TOKEN) return res.json({ status: "no_token" });
    const r = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    const d = await r.json();
    if (d.status === "succeeded") {
      const url = Array.isArray(d.output) ? d.output[0] : d.output;
      return res.json({ status: "ready", videoUrl: url });
    }
    return res.json({ status: d.status });
  } catch (e) { res.json({ error: e.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("AI8 Server on", PORT));
