import type { TracktorService } from "../harvesters";
import { supabase } from "./supabase-client";

/**
 * 💾 Writes the count of activities for a given service, year, and activity type to the database.
 *
 * If an entry for the service, year, and activity type already exists, it updates the count if the new count is greater.
 * Otherwise, it inserts a new entry.
 *
 * @param {TracktorService} service - The service for which the count is being recorded (e.g., Goodreads, Strava).
 * @param {number} year - The year for which the count is being recorded.
 * @param {number} count - The count of activities.
 * @param {string} activityType - The type of activity being recorded (e.g., "commits", "repositories").
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function writeTracktorCount(
  service: string,
  year: number,
  count: number,
  activityType: string
) {
  // Get existing count from Supabase
  const { data, error } = await supabase
    .from("tracktor_counts")
    .select("count")
    .eq("service", service)
    .eq("year", year)
    .eq("activity_type", activityType)
    .single();

  if (error && error.code !== "PGRST116") {
    // Ignore 'no rows' error
    console.error(`Error fetching count for ${service}:`, error);
    return;
  }

  const currentCount = data?.count || 0;
  const newCount = currentCount + count; // Increment count

  // Upsert new count (ENSURE IT UPDATES INSTEAD OF CREATING NEW ROWS)
  const { error: upsertError } = await supabase.from("tracktor_counts").upsert(
    [
      {
        service,
        year,
        activity_type: activityType,
        count: newCount,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "service,year,activity_type" } // Ensure correct row is updated
  );

  if (upsertError) {
    console.error(`Error updating count for ${service}:`, upsertError);
  } else {
    console.log(`✅ Updated ${service}: ${newCount} total for ${year}`);
  }
}

/**
 * Retrieves the most recent `updated_at` timestamp for a given service, year, and activity type.
 */
export async function getLastUpdatedFromDB(
  service: string,
  year: number,
  activityType?: string
): Promise<string | null> {
  let query = supabase
    .from("tracktor_counts")
    .select("updated_at")
    .eq("service", service)
    .eq("year", year);

  if (activityType) {
    query = query.eq("activity_type", activityType);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error(
      `Error fetching last updated timestamp for ${service}:`,
      error
    );
    return null;
  }

  return data?.updated_at || null;
}
