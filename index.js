import "dotenv/config";  // <-- load env vars locally
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// --- /proxy endpoint (unchanged) ---
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url parameter");
  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: req.headers.authorization || "",
        Accept: req.headers.accept || "",
      },
    });
    const data = await response.text();
    res.set(
      "Content-Type",
      response.headers.get("content-type") || "text/plain"
    );
    res.send(data);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// --- Generic AI Proxy Handler ---
async function aiProxy({
  req,
  res,
  url,
  method = "POST",
  headers = {},
  payload = null,
  responseType = "json",
}) {
  try {
    const fetchOptions = {
      method,
      headers,
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    };
    const response = await fetch(url, fetchOptions);
    let data;
    if (responseType === "json") {
      data = await response.json();
      res.json(data);
    } else {
      data = await response.text();
      res.send(data);
    }
  } catch (err) {
    console.error("AI Proxy error:", err);
    res.status(500).send(err.toString());
  }
}

// --- DeepSeek ---
app.post("/deepseek", (req, res) =>
  aiProxy({
    req,
    res,
    url: "https://api.deepseek.com/chat/completions",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    payload: {
      model: "deepseek-chat",
      messages:
        req.body.messages || [{ role: "user", content: "Hello DeepSeek!" }],
    },
  })
);

// --- OpenAI ---
app.post("/openai", (req, res) =>
  aiProxy({
    req,
    res,
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    payload: {
      model: "gpt-4o-mini",
      messages:
        req.body.messages || [{ role: "user", content: "Hello OpenAI!" }],
    },
  })
);

// --- Gemini helper ---
function geminiBody(prompt) {
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };
}

// Gemini - Flash (Key #1)
app.post("/gemini/flash", (req, res) =>
  aiProxy({
    req,
    res,
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: { "Content-Type": "application/json" },
    payload: geminiBody(req.body.prompt || "Hello Gemini Flash (Key 1)!"),
  })
);

// Gemini - Pro
app.post("/gemini/pro", (req, res) =>
  aiProxy({
    req,
    res,
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: { "Content-Type": "application/json" },
    payload: geminiBody(req.body.prompt || "Hello Gemini Pro!"),
  })
);

// Gemini - Flash (Backup Key #2)
app.post("/gemini/flash2", (req, res) =>
  aiProxy({
    req,
    res,
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY2}`,
    headers: { "Content-Type": "application/json" },
    payload: geminiBody(req.body.prompt || "Hello Gemini Flash (Key 2)!"),
  })
);

// Gemini 2.5 - Flash
app.post("/gemini/flash25", (req, res) =>
  aiProxy({
    req,
    res,
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: { "Content-Type": "application/json" },
    payload: geminiBody(req.body.prompt || "Hello Gemini 2.5 Flash!"),
  })
);

// Gemini 2.5 - Pro
app.post("/gemini/pro25", (req, res) =>
  aiProxy({
    req,
    res,
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: { "Content-Type": "application/json" },
    payload: geminiBody(req.body.prompt || "Hello Gemini 2.5 Pro!"),
  })
);

// Gemini 2.5 - Default
app.post("/gemini/25", (req, res) =>
  aiProxy({
    req,
    res,
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: { "Content-Type": "application/json" },
    payload: geminiBody(req.body.prompt || "Hello Gemini 2.5!"),
  })
);

app.listen(3000, () => console.log("Proxy running on port 3000"));
