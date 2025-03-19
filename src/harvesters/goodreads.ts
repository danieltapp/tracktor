import dotenv from "dotenv";
import Parser from "rss-parser";
import formatYear from "../utils/format-year";

dotenv.config();

const { GOODREADS_USER_ID, GOODREADS_RSS_KEY } = process.env;

if (!GOODREADS_USER_ID || !GOODREADS_RSS_KEY) {
  throw new Error(
    "Missing GOODREADS_USER_ID or GOODREADS_RSS_KEY in environment variables."
  );
}

type GoodreadsFeedItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
};

type GoodreadsFeed = {
  items: GoodreadsFeedItem[];
};

const parser = new Parser<GoodreadsFeed, GoodreadsFeedItem>();

/**
 * 📚 Fetches activity from Goodreads RSS feed.
 *
 * This function fetches the RSS feed of a specified Goodreads user and groups the activity by year.
 * If a year is provided, it returns the count of activities for that year. Otherwise, it returns the total count of activities.
 *
 * @param {number} [year] - The year for which to count activities.
 * @returns {Promise<number>} The count of activities for the specified year or total activities.
 */
export async function fetchGoodreadsActivity(
  year: number,
  lastUpdated?: string
): Promise<number> {
  const feed = await parser.parseURL(
    `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?key=${GOODREADS_RSS_KEY}&shelf=read`
  );
  const items = feed.items as GoodreadsFeedItem[];
  const filteredByYear = items.filter(
    (item) => formatYear(item.isoDate) === String(year)
  );

  let filteredItems = filteredByYear;
  if (lastUpdated) {
    const lastUpdatedDate = new Date(lastUpdated);
    filteredItems = filteredByYear.filter(
      (item) => new Date(item.isoDate) > lastUpdatedDate
    );
  }

  return filteredItems.length;
}

export default fetchGoodreadsActivity;
