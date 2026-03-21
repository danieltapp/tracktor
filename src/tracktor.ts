import {
  fetchGoodreadsActivity,
  fetchLetterboxdActivity,
  fetchGitHubData,
  type GitHubData,
} from "./harvesters";
import type { TracktorService } from "./harvesters";
import { getLastUpdatedFromDB, writeTracktorCount } from "./utils/database";
import { writeLanguageSnapshot } from "./utils/language-database";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface Service {
  name: TracktorService;
  fetch: () => Promise<number | GitHubData>;
  key: string;
  activityTypes: { name: string; getCount?: (data: any) => number }[];
}

/**
 * Fetches activity data from various services and writes the counts to the database.
 *
 * The services include Letterboxd, Goodreads, and GitHub.
 */
async function tracktor() {
  const timestamp = new Date().toISOString();
  const currentYear = new Date().getFullYear();
  console.log(`👨🏻‍🌾 Tracktor is up and running 🚜! - ${timestamp}`);

  // Fetch lastUpdated timestamp for Letterboxd
  const lastLetterboxdUpdate = await getLastUpdatedFromDB("letterboxd", currentYear, "movies");
  const lastGoodreadsUpdate = await getLastUpdatedFromDB("goodreads", currentYear, "books");
  const lastGitHubUpdate = await getLastUpdatedFromDB("github", currentYear, "commits");

  const services: Service[] = [
    {
      name: "letterboxd",
      fetch: () => fetchLetterboxdActivity(currentYear, lastLetterboxdUpdate ?? ""),
      key: "letterboxd",
      activityTypes: [{ name: "movies" }],
    },
    {
      name: "goodreads",
      fetch: () => fetchGoodreadsActivity(currentYear, lastGoodreadsUpdate ?? ""),
      key: "goodreads",
      activityTypes: [{ name: "books" }],
    },
    {
      name: "github",
      fetch: () => fetchGitHubData(currentYear, lastGitHubUpdate ?? ""),
      key: "github",
      activityTypes: [
        {
          name: "commits",
          getCount: (data: GitHubData) => data.contributions?.totalCommits ?? 0,
        },
        {
          name: "repositories",
          getCount: (data: GitHubData) => data.contributions?.repositoryCount ?? 0,
        },
      ],
    },
  ];

  type Totals = {
    [key: string]: number | GitHubData;
  };

  const totals: Totals = {
    letterboxd: 0,
    goodreads: 0,
    github: {
      contributions: { totalCommits: 0, repositoryCount: 0 },
      languages: null,
    },
  };

  for (const service of services) {
    try {
      const result = await service.fetch();
      totals[service.key] = result;

      for (const activityType of service.activityTypes) {
        if (activityType.name === "repositories") continue;
        const count = activityType.getCount?.(result) ?? (result as number);

        await writeTracktorCount(service.name, currentYear, count, activityType.name);
      }

      if (service.name === "github") {
        const githubResult = result as GitHubData;
        if (githubResult.languages && githubResult.languages.length > 0) {
          await writeLanguageSnapshot(githubResult.languages, currentYear);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${service.name} activity.`);
      console.error(error);
    }
  }

  const githubData = totals.github as GitHubData;
  const commits = githubData.contributions?.totalCommits ?? 0;
  const repos = githubData.contributions?.repositoryCount ?? 0;

  console.log(
    `📚 Goodreads: ${totals.goodreads} new books read since the last run.
  🎥 Letterboxd: ${totals.letterboxd} new movies watched since the last run.
  💻 GitHub: ${commits} new commits across ${repos} repositories since the last run.`
  );

  if (githubData.languages && githubData.languages.length > 0) {
    console.log("\nGitHub Languages:");
    for (const lang of githubData.languages.slice(0, 10)) {
      const bytesFormatted = formatBytes(lang.bytes);
      console.log(
        `  ${lang.languageName}: ${lang.percentage}% (${bytesFormatted} across ${lang.repoCount} repos)`
      );
    }
  }

  console.log(`👨🏻‍🌾 Tracktor finished at ${new Date().toISOString()} 🚜!`);
  return;
}

export default tracktor;
