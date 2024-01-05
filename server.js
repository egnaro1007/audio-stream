const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.static(__dirname + "/index.js"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/audio", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  const audioPath = "Renai-Circulation-Kana-Hanazawa.mp3";
  const audioSize = fs.statSync(audioPath).size;

  const CHUNK_SIZE = 100 * 1024; // 1MB, m có thể chia nhỏ hơn nếu muốn
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, audioSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${audioSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "audio/mpeg",
  };

  res.writeHead(206, headers);

  const audioStream = fs.createReadStream(audioPath, { start, end });
  audioStream.pipe(res);

});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

