const express = require("express");
const app = express();
const fs = require("fs");

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/index.js"));

app.get("/", function (req, res) {
  // res.sendFile(__dirname + "/index.html");
  res.render("index", {});
});

app.get("/listen", function (req, res) {
  res.redirect("/");
});

app.get("/listen/:id", function (req, res) {
  songInfo = getInformation(req.params.id);

  if (!songInfo) {
    res.status(404).sendFile(__dirname + "/views/404.html");
    return;
  }

  res.render("index", {
    song_id: songInfo.id,
    song: songInfo.song,
    year: songInfo.year,
    album: songInfo.album
  });
});

app.get("/api/v1/search", function (req, res) {
  const searchTerm = req.query.term;

  // Search logic would go here. For now, just return mock data.

  responseData = search(searchTerm);

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



// Test data, will be replaced with database later
const data = [
  { id: 'renai', song: 'Renai Circulation', year: '2009', album: 'Bakemonogatari' },
  { id: 'idol', song: 'Idol', year: '2023', album: 'Single' },
  { id: 3, song: 'song3', year: 'year3', album: 'album3' },
  { id: 4, song: 'song4', year: 'year4', album: 'album4' },
  { id: 5, song: 'song5', year: 'year5', album: 'album5' }
];

function search(term) {
  // return data.filter(item => item.song.toLowerCase().includes(term.toLowerCase()));
  // Logic for searching would go here. For now, just return mock data.


  return data;
}

function getInformation(id) {
  return data.find(item => item.id === id);
}
