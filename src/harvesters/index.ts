import fetchGoodreadsActivity from "./goodreads";
import fetchLetterboxdActivity from "./letterboxd";
import fetchGitHubContributions from "./github";

export type TracktorService = "goodreads" | "letterboxd" | "github";

export {
  fetchGoodreadsActivity,
  fetchLetterboxdActivity,
  fetchGitHubContributions,
};
