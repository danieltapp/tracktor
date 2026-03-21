import { supabase } from "./supabase-client";

export type LanguageStats = {
  languageName: string;
  bytes: number;
  repoCount: number;
  percentage: number;
};

export async function writeLanguageSnapshot(
  languages: LanguageStats[],
  year: number
): Promise<void> {
  const snapshotDate = new Date().toISOString().split("T")[0];

  const rows = languages.map((lang) => ({
    snapshot_date: snapshotDate,
    year,
    language_name: lang.languageName,
    bytes: lang.bytes,
    repo_count: lang.repoCount,
    percentage: lang.percentage,
  }));

  const { error } = await supabase
    .from("github_language_stats")
    .upsert(rows, { onConflict: "snapshot_date,language_name" });

  if (error) {
    console.error("Error writing language snapshot:", error);
    throw error;
  }

  console.log(
    `✅ Wrote language snapshot for ${snapshotDate}: ${languages.length} languages`
  );
}

export async function getLatestLanguageSnapshot(): Promise<LanguageStats[]> {
  const { data: latestDate, error: dateError } = await supabase
    .from("github_language_stats")
    .select("snapshot_date")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  if (dateError) {
    if (dateError.code === "PGRST116") {
      return [];
    }
    console.error("Error fetching latest snapshot date:", dateError);
    throw dateError;
  }

  const { data, error } = await supabase
    .from("github_language_stats")
    .select("language_name, bytes, repo_count, percentage")
    .eq("snapshot_date", latestDate.snapshot_date)
    .order("bytes", { ascending: false });

  if (error) {
    console.error("Error fetching latest language snapshot:", error);
    throw error;
  }

  return data.map((row) => ({
    languageName: row.language_name,
    bytes: row.bytes,
    repoCount: row.repo_count,
    percentage: row.percentage,
  }));
}
