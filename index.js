// index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url parameter");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: req.headers.authorization || '',
        Accept: req.headers.accept || '',
        // Add other headers if needed
      }
    });
    const data = await response.text();

    // Forward content-type header from Uploadcare to client
    res.set('Content-Type', response.headers.get('content-type'));

    res.send(data);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});
// DeepSeek AI
app.use(express.json()); // add once for JSON body parsing

app.post("/deepseek", async (req, res) => {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer sk-8f4e5c812da64b86b1aa25306c37870a`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat", // adjust if needed
        messages: req.body.messages || [{ role: "user", content: "Hello DeepSeek!" }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// OpenAI
app.post("/openai", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or "gpt-4o" depending on your quota
        messages: req.body.messages || [{ role: "user", content: "Hello OpenAI!" }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Google Gemini
app.post("/gemini", async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAagbghJPnpO0UyHCZxmYTIRGNGaFHnezE`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: req.body.prompt || "Hello Gemini!" }]
        }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});


app.listen(3000, () => console.log("Proxy running on port 3000"));
