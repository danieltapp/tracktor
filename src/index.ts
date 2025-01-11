import tracktor from "./tracktor";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("👨🏻‍🌾 Tracktor server is running 🚜!");
});

app.listen(PORT, () => {
  console.log(
    `👨🏻‍🌾 Tracktor server is listening on http://localhost:${PORT} 🚜!`
  );
});

tracktor().catch((error) => {
  console.error("👨🏻‍🌾 Error running Tracktor 🚜!", error);
});
