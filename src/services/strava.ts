import axios from "axios";
import { refreshAccessToken } from "../harvesters/strava";
import type { StravaActivity } from "../types/strava";

/**
 * Fetches a single activity by ID from the Strava API
 */
export async function fetchActivityById(
	activityId: number,
): Promise<StravaActivity> {
	const accessToken = await refreshAccessToken();

	const response = await axios.get<StravaActivity>(
		`https://www.strava.com/api/v3/activities/${activityId}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	return response.data;
}

/**
 * Checks if the activity type is a "Run"
 */
export function isRunActivity(activity: StravaActivity): boolean {
	return activity.type === "Run";
}

/**
 * Extracts the year from an activity's start date
 */
export function getActivityYear(activity: StravaActivity): number {
	return new Date(activity.start_date).getFullYear();
}
