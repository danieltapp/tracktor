import {
  fetchGoodreadsActivity,
  fetchLetterboxdActivity,
  fetchGitHubContributions,
} from "./harvesters";

async function tracktor() {
  const timestamp = new Date().toISOString();
  console.log(`👨🏻‍🌾 Tracktor is up and running 🚜! - ${timestamp}`);

  const services = [
    {
      name: "Letterboxd",
      fetch: () => fetchLetterboxdActivity(2025),
      key: "letterboxd",
    },
    {
      name: "Goodreads",
      fetch: () => fetchGoodreadsActivity(2025),
      key: "goodreads",
    },
    {
      name: "GitHub",
      fetch: () => fetchGitHubContributions(2025),
      key: "github",
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
}

export default tracktor;
