const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

async function askGemini(userMsg) {
  const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "رد بالعامية المصرية باختصار: " + userMsg }] }] })
      });
      const data = await r.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) return answer;
    } catch (e) { console.log("فشل", model); }
  }
  return null;
}

async function handler(req, res) {
  try {
    const userMsg = req.body?.message || req.body?.prompt || req.body?.text || "";
    if (!userMsg) return res.json({ reply: "ابعت سؤال" });
    const answer = await askGemini(userMsg);
    if (answer) return res.json({ reply: answer, answer: answer, text: answer });
    return res.json({ reply: "لا توجد اجابة - جرب تاني بعد دقيقة" });
  } catch (e) {
    return res.json({ reply: "خطأ: " + e.message });
  }
}

app.post('/api/chat', handler);
app.post('/chat', handler);
app.post('/api/ask', handler);
app.get('/api/health', (req, res) => res.json({ ok: true, hasKey: !!GEMINI_KEY }));

// ده السطر اللي كان بيوقع السيرفر، صلحناه
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) res.sendFile(path.join(__dirname, 'index.html'));
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("شغال على " + PORT));
