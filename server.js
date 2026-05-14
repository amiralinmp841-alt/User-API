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

    const response = await fetch(url, {
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : req.headers["content-type"]?.includes("application/json")
          ? JSON.stringify(req.body)
          : new URLSearchParams(req.body),
      redirect: "manual"
    });

    res.status(response.status);

    const cookies = response.headers.raw()["set-cookie"];
    if (cookies) res.setHeader("set-cookie", cookies);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        res.setHeader(key, value);
      }
    });

    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy running on port", PORT);
});
