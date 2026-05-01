const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const TARGET = "https://my.telegram.org";

// همه درخواست‌ها
app.all("*", async (req, res) => {
  try {
    const url = TARGET + req.originalUrl;

    const headers = {
      "user-agent":
        req.headers["user-agent"] ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "accept": req.headers["accept"] || "*/*",
      "content-type": req.headers["content-type"] || undefined,
      "cookie": req.headers["cookie"] || ""
    };

    const response = await fetch(url, {
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
      redirect: "manual"
    });

    // کپی status
    res.status(response.status);

    // کپی headerها
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        res.setHeader("set-cookie", value);
      } else {
        res.setHeader(key, value);
      }
    });

    const body = await response.text();
    res.send(body);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Telegram proxy running on port", PORT);
});
