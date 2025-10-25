const express = require("express");
const fs = require("fs"); //File system module (read/write favorites)
const path = require("path");

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

//Define folder and file paths for storing favorites
const favoritesFolder = path.join(__dirname, "text_files");
const favoritesFile = path.join(favoritesFolder, "favorites.txt");

//Ensure the storage folder exists and creates it if it does not exist
if (!fs.existsSync(favoritesFolder)) {
  fs.mkdirSync(favoritesFolder);
}

//Get live exchange rates using the Frankfurter API
app.get("/api/rates", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,CHF,AUD,CAD,RON"
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    //Handle connection or API errors
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

//To add a new favorite pair
app.post("/favorites", function (req, res) {
  const pair = req.body.pair; //Extract the currency pair - example EUR/USD
  if (!pair || !pair.includes("/")) {
    //If data is not provided prevent saving it
    return res.status(400).json({ error: "Missing currency pair" });
  }

  //Load existing favorites if file exists
  let favorites = [];
  if (fs.existsSync(favoritesFile)) {
    favorites = fs
      .readFileSync(favoritesFile, "utf-8")
      .split("\n")
      .filter(Boolean);
  }

  //Avoid duplicates and add a newline if file already has content
  if (!favorites.includes(pair)) {
    let prefix = "";
    if (favorites.length > 0) {
      prefix = "\n";
    }
    fs.appendFileSync(favoritesFile, prefix + pair);
  }

  res.json({ success: true }); //Confirmation for frontend
});

//Delete a favorite pair
app.delete("/favorites", function (req, res) {
  const pair = req.body.pair;
  if (!pair) {
    return res.status(400).json({ error: "Missing currency pair" });
  }

  if (!fs.existsSync(favoritesFile)) {
    return res.json({ success: true });
  }

  //Remove the selected pair from the list and rewrite the file
  const updated = fs
    .readFileSync(favoritesFile, "utf-8")
    .split("\n")
    .filter(Boolean)
    .filter(function (line) {
      return line !== pair;
    });

  fs.writeFileSync(favoritesFile, updated.join("\n"));
  res.json({ success: true });
});

//List all saved favorites
app.get("/favorites/list", function (req, res) {
  //Return empty array if no file yet
  if (!fs.existsSync(favoritesFile)) {
    return res.json([]);
  }

  //Read all non-empty lines and send as array
  const data = fs
    .readFileSync(favoritesFile, "utf-8")
    .split("\n")
    .filter(Boolean);
  res.json(data);
});

// Log in route
app.post("/login", function (req, res) {
  const { username, password } = req.body;

  // Read stored credentials
  const loginFile = path.join(favoritesFolder, "login.txt");
  if (!fs.existsSync(loginFile)) {
    return res.status(500).json({ error: "Login file missing" });
  }

  const lines = fs.readFileSync(loginFile, "utf-8").split("\n");
  if (lines.length < 2) {
    return res.status(500).json({ error: "Login file malformed" });
  }
  const userLine = lines.find((line) => line.startsWith("user:"));
  const passLine = lines.find((line) => line.startsWith("pass:"));

  const storedUser = userLine ? userLine.split(":")[1].trim() : "";
  const storedPass = passLine ? passLine.split(":")[1].trim() : "";

  if (username === storedUser && password === storedPass) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

//Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
