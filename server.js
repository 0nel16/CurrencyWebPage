const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

const favoritesFolder = path.join(__dirname, "text_files");
const favoritesFile = path.join(favoritesFolder, "favorites.txt");

if (!fs.existsSync(favoritesFolder)) {
  fs.mkdirSync(favoritesFolder);
}

app.get("/api/rates", async (req, res) => {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,CHF,AUD,CAD,RON");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

app.post("/favorites", function (req, res){
  const pair = req.body.pair;
  if(!pair){
    return res.status(400).json({ error: "Missing currency pair"});
  }

  let favorites = [];
  if (fs.existsSync(favoritesFile)) {
    favorites = fs.readFileSync(favoritesFile, "utf-8").split("\n").filter(Boolean);
  }

  if (favorites.indexOf(pair) === -1) {
    fs.appendFileSync(favoritesFile, pair + "\n");
  }

  res.json({ success: true });
});

app.delete("/favorites", function (req, res) {
  const pair = req.body.pair;
  if (!pair) {
    return res.status(400).json({ error: "Missing currency pair" });
  }

  if (!fs.existsSync(favoritesFile)) {
    return res.json({ success: true });
  }

  const updated = fs.readFileSync(favoritesFile, "utf-8")
    .split("\n")
    .filter(Boolean)
    .filter(function (line) {
      return line !== pair;
    });

  fs.writeFileSync(favoritesFile, updated.join("\n"));
  res.json({ success: true });
});

app.get("/favorites/list", function (req, res) {
  if (!fs.existsSync(favoritesFile)) {
    return res.json([]);
  }

  const data = fs
    .readFileSync(favoritesFile, "utf-8")
    .split("\n")
    .filter(Boolean);
  res.json(data);
})

app.listen(3000, () => console.log("Server running on http://localhost:3000"));