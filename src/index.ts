import dotenv from "dotenv";
import { fetchGoodreadsActivity, fetchLetterboxdActivity } from "./harvesters";

dotenv.config();

async function tracktor() {
  console.log("👨🏻‍🌾 Tracktor is up and running 🚜!");

  try {
    const letterboxdCount = await fetchLetterboxdActivity(2025);
    console.log(
      `You've watched ${letterboxdCount} movies on Letterboxd this year 🎬`
    );
  } catch (error) {
    console.warn("👨🏻‍🌾 Tracktor failed to harvest Letterboxd 🚜!");
  }

  try {
    const goodreadsCount = await fetchGoodreadsActivity(2025);
    console.log(
      `You've read ${goodreadsCount} books on Goodreads this year 📚`
    );
  } catch (error) {
    console.warn("👨🏻‍🌾 Tracktor failed to harvest Goodreads 🚜!");
  }

  console.log("👨🏻‍🌾 Tracktor is done 🚜!");
}

tracktor();
