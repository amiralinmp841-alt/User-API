const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const TARGET = "https://my.telegram.org";

app.all("*", async (req, res) => {
  try {
    const url = TARGET + req.originalUrl;

    const headers = {
      "user-agent": req.headers["user-agent"] || "Mozilla/5.0",
      "accept": req.headers["accept"] || "*/*",
      "content-type": req.headers["content-type"],
      "cookie": req.headers["cookie"] || "",
      "referer": TARGET,
      "origin": TARGET
    };

    let body;

    if (!["GET", "HEAD"].includes(req.method)) {
      if (req.headers["content-type"]?.includes("application/json")) {
        body = JSON.stringify(req.body);
      } else {
        body = new URLSearchParams(req.body).toString();
      }
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: "manual"
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-encoding") {
        res.setHeader(key, value);
      }
    });

    const text = await response.text();

    res.send(text);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy running on ${PORT}`);
});
