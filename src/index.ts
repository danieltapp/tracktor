import tracktor from "./tracktor";
import cron from "node-cron";
import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("👨🏻‍🌾 Tracktor server is running 🚜!");
});

app.listen(PORT, () => {
  console.log(
    `👨🏻‍🌾 Tracktor server is listening on http://localhost:${PORT} 🚜!`
  );
});

cron.schedule(
  "0 8 * * *",
  () => {
    console.log("👨🏻‍🌾 Tracktor cron job started 🚜!");
    tracktor();
  },
  {
    timezone: "America/New_York",
  }
);

console.log("👨🏻‍🌾 Tracktor cron job scheduled to run every day at 8 AM EST 🚜!");
