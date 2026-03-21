-- Create github_language_stats table for storing language analytics snapshots
CREATE TABLE github_language_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  year INTEGER NOT NULL,
  language_name VARCHAR(100) NOT NULL,
  bytes BIGINT NOT NULL,
  repo_count INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date, language_name)
);

-- Index for querying by date (most common query pattern)
CREATE INDEX idx_language_stats_date ON github_language_stats(snapshot_date DESC);

-- Index for filtering by year
CREATE INDEX idx_language_stats_year ON github_language_stats(year);

-- Index for filtering by language
CREATE INDEX idx_language_stats_language ON github_language_stats(language_name);
