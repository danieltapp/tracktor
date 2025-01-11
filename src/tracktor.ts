import {
  fetchGoodreadsActivity,
  fetchLetterboxdActivity,
  fetchGitHubContributions,
} from "./harvesters";
import type { TracktorService } from "./harvesters";
import { writeTracktorCount } from "./utils/database";

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

  const services: Service[] = [
    {
      name: "letterboxd",
      fetch: () => fetchLetterboxdActivity(2025),
      key: "letterboxd",
      activityTypes: [{ name: "movies" }],
    },
    {
      name: "goodreads",
      fetch: () => fetchGoodreadsActivity(2025),
      key: "goodreads",
      activityTypes: [{ name: "books" }],
    },
    {
      name: "github",
      fetch: () => fetchGitHubContributions(2025),
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
    `📚 Goodreads: ${totals.goodreads} books read in 2025.
🎥 Letterboxd: ${totals.letterboxd} movies watched in 2025.
💻 GitHub: ${
      typeof totals.github === "object" ? totals.github.totalCommits : 0
    } commits in 2025 across ${
      typeof totals.github === "object" ? totals.github.repositoryCount : 0
    } repositories.`
  );

  console.log(`👨🏻‍🌾 Tracktor finished at ${new Date().toISOString()} 🚜!`);
  return;
}

export default tracktor;
