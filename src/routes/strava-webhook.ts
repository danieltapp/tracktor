import { Router, type Request, type Response } from "express";
import type { StravaWebhookEvent } from "../types/strava";
import {
	fetchActivityById,
	isRunActivity,
	getActivityYear,
} from "../services/strava";
import { writeTracktorCount } from "../utils/database";

const router = Router();

const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN;

/**
 * GET /strava/webhook
 * Handles Strava subscription validation requests
 */
router.get("/", (req: Request, res: Response) => {
	const mode = req.query["hub.mode"];
	const challenge = req.query["hub.challenge"];
	const verifyToken = req.query["hub.verify_token"];

	if (mode === "subscribe" && verifyToken === STRAVA_VERIFY_TOKEN) {
		console.log("Strava webhook subscription validated");
		res.json({ "hub.challenge": challenge });
	} else {
		console.error("Strava webhook validation failed");
		res.status(403).send("Forbidden");
	}
});

/**
 * POST /strava/webhook
 * Handles incoming Strava webhook events
 * Responds immediately with 200, processes asynchronously
 */
router.post("/", (req: Request, res: Response) => {
	const event = req.body as StravaWebhookEvent;

	console.log("Received Strava webhook event:", JSON.stringify(event));

	// Acknowledge receipt immediately
	res.status(200).send("EVENT_RECEIVED");

	// Process the event asynchronously
	processWebhookEvent(event).catch((error) => {
		console.error("Error processing Strava webhook event:", error);
	});
});

/**
 * Processes a Strava webhook event asynchronously
 */
async function processWebhookEvent(event: StravaWebhookEvent): Promise<void> {
	// Only process activity creation events
	if (event.object_type !== "activity" || event.aspect_type !== "create") {
		console.log(`Ignoring event: ${event.object_type} ${event.aspect_type}`);
		return;
	}

	try {
		const activity = await fetchActivityById(event.object_id);
		console.log(`Fetched activity: ${activity.name} (${activity.type})`);

		if (!isRunActivity(activity)) {
			console.log(`Activity is not a run (type: ${activity.type}), skipping`);
			return;
		}

		const year = getActivityYear(activity);
		await writeTracktorCount("strava", year, 1, "runs");
		console.log(`Incremented Strava run count for ${year}`);
	} catch (error) {
		console.error(`Failed to process activity ${event.object_id}:`, error);
		throw error;
	}
}

export default router;
