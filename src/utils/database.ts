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
  service: TracktorService,
  year: number,
  count: number,
  activityType: string
): Promise<void> {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from("tracktor_counts")
      .select("id, count")
      .eq("service", service)
      .eq("year", year)
      .eq("activity_type", activityType)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingData) {
      if (count > existingData.count) {
        const { error: updateError } = await supabase
          .from("tracktor_counts")
          .update({ count })
          .eq("id", existingData.id);

        if (updateError) throw updateError;

        console.log(
          `Updated count for ${service} (${year}, ${activityType}) to ${count}. Previous: ${existingData.count}`
        );
      } else {
        console.log(
          `Count for ${service} (${year}, ${activityType}) remains unchanged. Existing: ${existingData.count}, New: ${count}`
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("tracktor_counts")
        .insert([{ service, year, count, activity_type: activityType }]);

      if (insertError) throw insertError;

      console.log(
        `Inserted new count for ${service} (${year}, ${activityType}): ${count}`
      );
    }
  } catch (error) {
    console.error("Error writing to Supabase:", error);
  }
}
