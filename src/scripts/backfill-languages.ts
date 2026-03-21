import { fetchGitHubLanguages } from "../harvesters/github-languages";
import { writeLanguageSnapshot } from "../utils/language-database";

async function backfillLanguages() {
  console.log("Starting language backfill...");

  const year = 2026;
  const fromDate = "2026-01-01T00:00:00Z";

  try {
    console.log(`Fetching language data from ${fromDate}...`);
    const languages = await fetchGitHubLanguages(year, fromDate);

    if (languages.length === 0) {
      console.log("No language data found.");
      return;
    }

    console.log(`Found ${languages.length} languages. Writing snapshot...`);
    await writeLanguageSnapshot(languages, year);

    console.log("\nBackfill complete! Language breakdown:");
    for (const lang of languages.slice(0, 10)) {
      console.log(
        `  ${lang.languageName}: ${lang.percentage}% (${lang.bytes} bytes across ${lang.repoCount} repos)`
      );
    }
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

backfillLanguages();
