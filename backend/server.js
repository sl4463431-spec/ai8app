const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  try {
    const userMsg = req.body.message || req.body.prompt || "ازيك";
    console.log("سؤال:", userMsg);

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = "";

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "انت مساعد مصري ذكي، رد بالعامية المصرية باختصار. سؤال المستخدم: " + userMsg }] }]
          })
        });
        const data = await r.json();
        console.log("موديل:", model, "رد جوجل:", JSON.stringify(data).slice(0, 500));
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          return res.json({ reply: answer, answer: answer });
        } else {
          lastError = JSON.stringify(data);
        }
      } catch (e) {
        lastError = e.message;
      }
    }
    return res.json({ reply: "لا توجد اجابة - خطأ: " + lastError });
  } catch (e) {
    return res.json({ reply: "لا توجد اجابة - " + e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("شغال على " + PORT));
