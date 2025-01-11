import dotenv from "dotenv";
import Parser from "rss-parser";
import formatYear from "../utils/format-year";

dotenv.config();

const { LETTERBOXD_USER } = process.env;

if (!LETTERBOXD_USER) {
  throw new Error("Missing LETTERBOXD_USER in environment variables.");
}

type LetterboxdFeedItem = {
  creator: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
};

const parser = new Parser();

/**
 * 📽️ Fetches activity from Letterboxd RSS feed.
 *
 * This function fetches the RSS feed of a specified Letterboxd user and groups the activity by year.
 * If a year is provided, it returns the count of activities for that year. Otherwise, it returns the total count of activities.
 *
 * @param {number} [year] - The year for which to count activities.
 * @returns {Promise<number>} The count of activities for the specified year or total activities.
 */
export async function fetchLetterboxdActivity(year?: number): Promise<number> {
  const feed = await parser.parseURL(
    `https://letterboxd.com/${LETTERBOXD_USER}/rss/`
  );
  const items = feed.items as LetterboxdFeedItem[];
  const groupedByYear = items.reduce<Record<string, LetterboxdFeedItem[]>>(
    (acc, item) => {
      const year = formatYear(item.isoDate);
      acc[year] = acc[year] || [];
      acc[year].push(item);
      return acc;
    },
    {}
  );

  if (year) {
    return groupedByYear[year]?.length || 0;
  }

  return items?.length || 0;
}

export default fetchLetterboxdActivity;
