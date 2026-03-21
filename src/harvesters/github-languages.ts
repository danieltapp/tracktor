import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
  throw new Error(
    "Missing GITHUB_TOKEN or GITHUB_USERNAME in environment variables."
  );
}

export type LanguageStats = {
  languageName: string;
  bytes: number;
  repoCount: number;
  percentage: number;
};

type LanguageEdge = {
  size: number;
  node: {
    name: string;
  };
};

type RepositoryWithLanguages = {
  name: string;
  owner: {
    login: string;
  };
  languages: {
    edges: LanguageEdge[];
    totalSize: number;
  };
};

type ContributionsCollectionWithLanguages = {
  totalCommitContributions: number;
  commitContributionsByRepository: {
    repository: RepositoryWithLanguages;
    contributions: {
      totalCount: number;
    };
  }[];
};

export async function fetchGitHubLanguages(
  year: number,
  fromDate?: string
): Promise<LanguageStats[]> {
  const from = fromDate ?? `${year}-01-01T00:00:00Z`;
  const to = new Date().toISOString();

  const query = `
    query ($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          commitContributionsByRepository {
            repository {
              name
              owner { login }
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node { name }
                }
                totalSize
              }
            }
            contributions { totalCount }
          }
        }
      }
    }
  `;

  const variables = {
    username: GITHUB_USERNAME,
    from,
    to,
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

    const data: ContributionsCollectionWithLanguages =
      response.data.data.user.contributionsCollection;

    return aggregateLanguages(data.commitContributionsByRepository);
  } catch (error) {
    console.error("Error fetching GitHub languages.");
    throw error;
  }
}

function aggregateLanguages(
  repos: ContributionsCollectionWithLanguages["commitContributionsByRepository"]
): LanguageStats[] {
  const languageMap = new Map<
    string,
    { bytes: number; repos: Set<string> }
  >();

  let totalBytes = 0;

  for (const { repository } of repos) {
    const repoKey = `${repository.owner.login}/${repository.name}`;

    for (const edge of repository.languages.edges) {
      const langName = edge.node.name;
      const size = edge.size;

      if (!languageMap.has(langName)) {
        languageMap.set(langName, { bytes: 0, repos: new Set() });
      }

      const lang = languageMap.get(langName)!;
      lang.bytes += size;
      lang.repos.add(repoKey);
      totalBytes += size;
    }
  }

  const stats: LanguageStats[] = [];

  for (const [languageName, { bytes, repos }] of languageMap) {
    stats.push({
      languageName,
      bytes,
      repoCount: repos.size,
      percentage:
        totalBytes > 0
          ? Math.round((bytes / totalBytes) * 10000) / 100
          : 0,
    });
  }

  return stats.sort((a, b) => b.bytes - a.bytes);
}

export default fetchGitHubLanguages;
