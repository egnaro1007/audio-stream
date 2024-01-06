const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.static(__dirname + "/index.js"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});



app.get("/api/v1/search", function (req, res) {
  const searchTerm = req.query.term;

  const data = [
    { id: 1, song: 'Renai Circulation', year: '2009', album: 'Bakemonogatari' },
    { id: 2, song: 'Idol', year: '2023', album: 'Single' },
    { id: 3, song: 'song3', year: 'year3', album: 'album3' },
    { id: 4, song: 'song4', year: 'year4', album: 'album4' },
    { id: 5, song: 'song5', year: 'year5', album: 'album5' }
  ];

  // const responseData = data.filter(item => item.song.toLowerCase().includes(searchTerm.toLowerCase()));
  const responseData = data;

  // Construct the response JSON
  const response = {
    term: searchTerm,
    number: responseData.length,
    result: responseData
  };

  res.json(response);
});

app.get("/api/v1/audio", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // Get the songNumber from the query parameters and set the audioPath
  const audioPath = `assets/music/${req.query.audio_id}.mp3`;

  const audioSize = fs.statSync(audioPath).size;

  const CHUNK_SIZE = 100 * 1024; // 100KB, m có thể chia nhỏ hơn nếu muốn
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

