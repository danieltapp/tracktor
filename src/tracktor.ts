import {
  fetchGoodreadsActivity,
  fetchLetterboxdActivity,
  fetchGitHubContributions,
} from "./harvesters";
import type { TracktorService } from "./harvesters";
import { getLastUpdatedFromDB, writeTracktorCount } from "./utils/database";

interface Service {
  name: TracktorService;
  fetch: () => Promise<
    number | { totalCommits: number; repositoryCount: number }
  >;
  key: string;
  activityTypes: { name: string; getCount?: (data: any) => number }[];
}

type GitHubActivity = Awaited<ReturnType<typeof fetchGitHubContributions>>;

/**
 * Fetches activity data from various services and writes the counts to the database.
 *
 * The services include Letterboxd, Goodreads, and GitHub.
 */
async function tracktor() {
  const timestamp = new Date().toISOString();
  console.log(`👨🏻‍🌾 Tracktor is up and running 🚜! - ${timestamp}`);

  // Fetch lastUpdated timestamp for Letterboxd
  const lastLetterboxdUpdate = await getLastUpdatedFromDB("letterboxd", 2025);
  const lastGoodreadsUpdate = await getLastUpdatedFromDB("goodreads", 2025);
  const lastGitHubUpdate = await getLastUpdatedFromDB("github", 2025);

  const services: Service[] = [
    {
      name: "letterboxd",
      fetch: () => fetchLetterboxdActivity(2025, lastLetterboxdUpdate ?? ""),
      key: "letterboxd",
      activityTypes: [{ name: "movies" }],
    },
    {
      name: "goodreads",
      fetch: () => fetchGoodreadsActivity(2025, lastGoodreadsUpdate ?? ""),
      key: "goodreads",
      activityTypes: [{ name: "books" }],
    },
    {
      name: "github",
      fetch: () => fetchGitHubContributions(2025, lastGitHubUpdate ?? ""),
      key: "github",
      activityTypes: [
        {
          name: "commits",
          getCount: (data: GitHubActivity) => data.totalCommits,
        },
        {
          name: "repositories",
          getCount: (data: GitHubActivity) => data.repositoryCount,
        },
      ],
    },
  ];

  type Totals = {
    [key: string]: number | { totalCommits: number; repositoryCount: number };
  };

  const totals: Totals = {
    letterboxd: 0,
    goodreads: 0,
    github: {
      totalCommits: 0,
      repositoryCount: 0,
    },
  };

  for (const service of services) {
    try {
      const result = await service.fetch();
      totals[service.key] = result;

      for (const activityType of service.activityTypes) {
        const count = activityType.getCount?.(result) ?? (result as number);

        await writeTracktorCount(service.name, 2025, count, activityType.name);
      }
    } catch (error) {
      console.error(`Error fetching ${service.name} activity.`);
      console.error(error);
    }
  }

  console.log(
    `📚 Goodreads: ${totals.goodreads} new books read since the last run.
  🎥 Letterboxd: ${totals.letterboxd} new movies watched since the last run.
  💻 GitHub: ${
    typeof totals.github === "object" ? totals.github.totalCommits : 0
  } new commits across ${
      typeof totals.github === "object" ? totals.github.repositoryCount : 0
    } repositories since the last run.`
  );

  console.log(`👨🏻‍🌾 Tracktor finished at ${new Date().toISOString()} 🚜!`);
  return;
}

export default tracktor;
