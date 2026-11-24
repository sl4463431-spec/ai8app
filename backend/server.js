
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30
  })
);

app.get("/", (req, res) => {
  res.json({
    name: "AI8",
    status: "running",
    message: "AI8 Backend is working"
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, task, language } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter your question"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is missing"
      });
    }

    const languageName =
      language === "ar" ? "Arabic" :
      language === "fr" ? "French" : "English";

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text:
                "You are AI8, a helpful intelligent assistant. " +
                "Answer in " + languageName + ". " +
                "Task: " + String(task || "assistant") + ". " +
                "User message: " + prompt.trim().slice(0, 12000)
            }]
          }]
        }),
        signal: AbortSignal.timeout(60000)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);

      return res.status(502).json({
        error: data.error?.message || "Gemini request failed"
      });
    }

    const answer = (
      data.candidates?.[0]?.content?.parts || []
    )
      .map(part => part.text || "")
      .join("");

    if (!answer) {
      return res.status(502).json({
        error: "No answer returned from Gemini"
      });
    }

    return res.json({
      success: true,
      text: answer
    });

  } catch (error) {
    console.error("AI8 error:", error);

    return res.status(500).json({
      error: "Server error. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("AI8 server running on port " + PORT);
});
