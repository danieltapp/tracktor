import express from "express";
import dotenv from "dotenv";
import stravaWebhookRouter from "./routes/strava-webhook";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount webhook routes
app.use("/strava/webhook", stravaWebhookRouter);

// Start server
app.listen(PORT, () => {
	console.log(`Tracktor webhook server running on port ${PORT}`);
});
