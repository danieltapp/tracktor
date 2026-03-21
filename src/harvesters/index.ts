import fetchGoodreadsActivity from "./goodreads";
import fetchLetterboxdActivity from "./letterboxd";
import fetchGitHubContributions, { fetchGitHubData, type GitHubData } from "./github";
import fetchGitHubLanguages, { type LanguageStats } from "./github-languages";

export type TracktorService = "goodreads" | "letterboxd" | "github" | "strava";

export {
	fetchGoodreadsActivity,
	fetchLetterboxdActivity,
	fetchGitHubContributions,
	fetchGitHubData,
	fetchGitHubLanguages,
};

export type { GitHubData, LanguageStats };
