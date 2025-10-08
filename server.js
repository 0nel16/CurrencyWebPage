const express = require("express");
const app = express();

app.use(express.static(__dirname));

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

app.listen(3000, () => console.log("Server running on http://localhost:3000"));