-- Album art lookup cache (normalized artist|album key → resolved result JSON)
CREATE TABLE IF NOT EXISTS album_art_cache (
  cache_key   TEXT PRIMARY KEY,
  result_json TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Manual artwork overrides — always win over API results
CREATE TABLE IF NOT EXISTS album_art_overrides (
  id                TEXT    NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  normalized_artist TEXT    NOT NULL,
  normalized_album  TEXT    NOT NULL,
  image_url         TEXT    NOT NULL,
  thumbnail_url     TEXT,
  source_url        TEXT,
  source_type       TEXT    NOT NULL DEFAULT 'manual',
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (normalized_artist, normalized_album)
);
