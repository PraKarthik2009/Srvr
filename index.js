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


app.listen(3000, () => console.log("Proxy running on port 3000"));
