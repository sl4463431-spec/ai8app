const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.get("/", (req, res) => res.json({ name: "AI8", status: "running", message: "AI8 Backend is working" }));

// بيجيب الموديلات المتاحة من جوجل نفسها، مش بنكتبها بإيدينا
async function getAvailableModels() {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await r.json();
    const names = (data.models || []).map(m => m.name.replace("models/", "")).filter(n => n.includes("flash") && !n.includes("image") && !n.includes("embedding"));
    // الأولوية: أحدث موديل الأول
    names.sort((a, b) => b.localeCompare(a));
    console.log("Available models:", names);
    return names.length ? names : ["gemini-3.8-flash"];
  } catch (e) {
    return ["gemini-3.8-flash", "gemini-2.5-flash"];
  }
}

app.post("/api/generate", async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt" });
  if (!API_KEY) return res.status(500).json({ error: "API Key مش موجود في Render" });

  const system = language === "ar" ? "انت مساعد ذكي اسمه AI8، رد بالعربية وباختصار ومفيد." : "You are AI8 assistant.";
  const fullPrompt = system + "\n\n" + prompt;
  const MODELS = await getAvailableModels();
  let lastError = "";

  for (const model of MODELS.slice(0, 4)) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1000 } })
        });
        const data = await r.json();
        if (!r.ok) {
          lastError = data.error?.message || "Error";
          console.log(`Failed: ${model} attempt ${attempt} - ${r.status} - ${lastError}`);
          if (r.status === 429 || r.status === 503 || lastError.toLowerCase().includes("overload") || lastError.toLowerCase().includes("high demand") || lastError.toLowerCase().includes("quota")) {
            await sleep(2500);
            continue;
          }
          break; // موديل مش شغال، جرب اللي بعده
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return res.json({ text });
        break;
      } catch (e) { lastError = e.message; await sleep(2000); }
    }
  }
  return res.status(503).json({ error: "جوجل زحمة دلوقتي، جرب تاني بعد دقيقة. التفاصيل: " + lastError });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
