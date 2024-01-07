const { Console } = require("console");
const express = require("express");
const app = express();
const fs = require("fs");

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

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
  getInformation(req.params.id)
    .then(songInfo => {
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
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});


app.get("/api/v1/getInfo", function (req, res) {
  const songId = req.query.id;

  getInformation(songId).then(songInfo => {
    if (!songInfo) {
      res.status(404).send("Not found");
    } else {
      res.json(songInfo);
    }
  });
});

app.get("/api/v1/search", function (req, res) {
  const searchTerm = req.query.term;

  search(searchTerm).then(responseData => {
    // Construct the response JSON
    const response = {
      term: searchTerm,
      number: responseData.length,
      result: responseData
    };

    res.json(response);
  });
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





function search(term) {
  // Logic for searching would go here. For now, just return mock data.
  return new Promise((resolve, reject) => {
    const query = `
      SELECT Tracks.Id, Tracks.Name, Tracks.Year, Albums.AlbumName as Album 
      FROM Tracks 
      INNER JOIN Albums ON Tracks.AlbumId = Albums.AlbumId 
      WHERE Tracks.Name LIKE ?
    `;
    db.all(query, [`%${term}%`], function(err, rows) {
      if (err) {
        reject(err);
      } else {
        const results = rows.map(row => ({
          id: row.Id,
          song: row.Name,
          year: row.Year,
          album: row.Album
        }));
        resolve(results);
      }
    });
  })


  // return data;
}

function getInformation(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT Tracks.Id, Tracks.Name, Tracks.Year, Albums.AlbumName as Album 
      FROM Tracks 
      INNER JOIN Albums ON Tracks.AlbumId = Albums.AlbumId 
      WHERE Tracks.Id = ?
    `;
    db.get(query, [`${id}`], function(err, row) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        if (row) {
          const result = {
            id: row.Id,
            song: row.Name,
            year: row.Year,
            album: row.Album
          };
          resolve(result);
        } else {
          resolve(null);
        }
      }
    });
  });
}
