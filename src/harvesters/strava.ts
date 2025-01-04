import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } =
  process.env;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  throw new Error("Missing required environment variables for Strava API.");
}

async function refreshAccessToken(): Promise<string> {
  try {
    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;
    console.log(`New Refresh Token: ${newRefreshToken}`);

    return access_token;
  } catch (error) {
    console.error("Error refreshing access token.");
    throw new Error("Failed to refresh access token");
  }
}

/**
 * Fetches Strava athlete activities.
 *
 * Note: Fetching athlete activity is suboptimal, so this method is currently not in use.
 * The likely next steps will be setting up a webhook endpoint that will be called after an activity is completed and conditionally update
 * our DB when the activity type is a run.
 */
async function fetchStravaActivity({
  before,
  after,
  page = 1,
  per_page = 30,
}: {
  before?: number;
  after?: number;
  page?: number;
  per_page?: number;
} = {}) {
  try {
    const accessToken = await refreshAccessToken();
    const params: Record<string, string | number> = {
      page,
      per_page,
    };
    if (before) params.before = before;
    if (after) params.after = after;

    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      }
    );

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error fetching activities.");
  }
}

export default fetchStravaActivity;
