import axios from "axios";
import dotenv from "dotenv";
import { fetchGitHubLanguages, type LanguageStats } from "./github-languages";

dotenv.config();

const { GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
  throw new Error(
    "Missing GITHUB_TOKEN or GITHUB_USERNAME in environment variables."
  );
}

type Repository = {
  name: string;
  owner: {
    login: string;
  };
};

type ContributionsCollection = {
  totalCommitContributions: number;
  commitContributionsByRepository: {
    repository: Repository;
    contributions: {
      totalCount: number;
    };
  }[];
};

export type GitHubData = {
  contributions: { totalCommits: number; repositoryCount: number } | null;
  languages: LanguageStats[] | null;
};

/**
 * Fetches GitHub contributions. 💻
 *
 * This function fetches the GitHub contributions of a specified user and groups the contributions by year.
 * If a year is provided, it returns the count of contributions for that year. Otherwise, it returns the total count of contributions.
 *
 * @param {number} year - The year for which to count contributions.
 * @returns {Promise<number>} The count of contributions for the specified year or total contributions.
 */
async function fetchGitHubContributions(year: number, lastUpdated?: string) {
  const fromDate = lastUpdated
    ? new Date(lastUpdated).toISOString()
    : `${year}-01-01T00:00:00Z`;
  const toDate = new Date().toISOString();

  const query = `
    query ($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          commitContributionsByRepository {
            repository {
              name
              owner {
                login
              }
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `;

  const variables = {
    username: GITHUB_USERNAME,
    from: fromDate,
    to: toDate,
  };

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query, variables },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    const data: ContributionsCollection =
      response.data.data.user.contributionsCollection;

    const newCommits = data.totalCommitContributions;
    const uniqueRepoNames = new Set(
      data.commitContributionsByRepository.map(
        ({ repository }) => repository.name
      )
    );
    const repositoryCount = uniqueRepoNames.size;

    return { totalCommits: newCommits, repositoryCount };
  } catch (error) {
    console.error("Error fetching GitHub contributions.");
    throw error;
  }
}

export async function fetchGitHubData(
  year: number,
  lastUpdated?: string
): Promise<GitHubData> {
  const [contributions, languages] = await Promise.allSettled([
    fetchGitHubContributions(year, lastUpdated),
    fetchGitHubLanguages(year),
  ]);

  return {
    contributions:
      contributions.status === "fulfilled" ? contributions.value : null,
    languages: languages.status === "fulfilled" ? languages.value : null,
  };
}

export default fetchGitHubContributions;
