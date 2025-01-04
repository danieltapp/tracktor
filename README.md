# 🚜 Tracktor

Tracktor is an application designed to aggregate your activity data from various services like [Letterboxd](https://letterboxd.com/), [Goodreads](https://www.goodreads.com/), [Strava](https://www.strava.com/), and [Bluesky](https://bsky.app/). By making API calls to these services, Tracktor provides you with a macro-level view of all the things you spend your time doing.

<img width="678" alt="Screenshot 2025-01-04 at 3 03 32 PM" src="https://github.com/user-attachments/assets/0ffa3cb9-ccc1-4aa9-aceb-ec0bf534afae" />

## Features
- 📚 Aggregate reading activity from Goodreads
- 🎥 Track movie watching habits from Letterboxd
- 🚴‍♂️ Collect fitness data from Strava
- 🦋 Gather social interactions from Bluesky

## Getting Started
To get started with Tracktor, follow these steps:

1. Copy the example environment variables file:
    ```sh
    cp .env.example .env
    ```

2. Populate the `.env` file with your information for each respective service.

3. Install dependencies:
    ```sh
    npm install
    # or
    pnpm install
    ```

4. Run the project:
    ```sh
    npm run dev
    # or
    pnpm dev
    ```

## Initial Work
Setup a daily cron job (`node-cron`?) that makes API calls to these various services. It farm activity data and then write to a DB. I'd say the end goal would be to stand up an API that my personal site, [dt-fyi](https://github.com/danieltapp/dt-fyi) can consume to tout all the stuff I've one so far within the calendar year.
