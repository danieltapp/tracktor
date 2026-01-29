/**
 * Strava webhook event payload structure
 * Sent by Strava when an activity event occurs
 */
export interface StravaWebhookEvent {
	/** Type of object (e.g., "activity") */
	object_type: "activity" | "athlete";
	/** ID of the activity or athlete */
	object_id: number;
	/** Type of action (e.g., "create", "update", "delete") */
	aspect_type: "create" | "update" | "delete";
	/** Athlete ID who owns the activity */
	owner_id: number;
	/** Subscription ID */
	subscription_id: number;
	/** Unix timestamp of the event */
	event_time: number;
	/** Updates object containing changed fields (for update events) */
	updates?: Record<string, unknown>;
}

/**
 * Strava activity response from the API
 */
export interface StravaActivity {
	/** Unique activity ID */
	id: number;
	/** Activity name/title */
	name: string;
	/** Activity type (e.g., "Run", "Ride", "Swim") */
	type: string;
	/** Sport type for more specific categorization */
	sport_type: string;
	/** ISO 8601 timestamp of when the activity started */
	start_date: string;
	/** Local start date in athlete's timezone */
	start_date_local: string;
	/** Distance in meters */
	distance: number;
	/** Moving time in seconds */
	moving_time: number;
	/** Elapsed time in seconds */
	elapsed_time: number;
	/** Total elevation gain in meters */
	total_elevation_gain: number;
	/** Athlete who performed the activity */
	athlete: {
		id: number;
	};
}

/**
 * Strava webhook subscription validation query params
 */
export interface StravaWebhookValidation {
	"hub.mode": string;
	"hub.challenge": string;
	"hub.verify_token": string;
}
