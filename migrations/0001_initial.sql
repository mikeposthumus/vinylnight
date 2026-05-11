-- ── Users ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id          TEXT PRIMARY KEY,       -- UUID, generated app-side
  username    TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,        -- PBKDF2 via crypto.subtle
  avatar_url  TEXT,
  location    TEXT,
  bio         TEXT,                   -- max 300 chars enforced app-side
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Top 3 current albums per user (rank 1-3)
CREATE TABLE user_top_albums (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank        INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 3),
  artist      TEXT NOT NULL,
  album_title TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, rank)
);

-- ── Groups ───────────────────────────────────────────────────────────
CREATE TABLE groups (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,  -- URL-safe identifier
  location     TEXT,
  description  TEXT,
  founded_year INTEGER,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE group_genres (
  id       TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  genre    TEXT NOT NULL,
  UNIQUE (group_id, genre)
);

-- Members + join requests share this table via status
CREATE TABLE group_members (
  id        TEXT PRIMARY KEY,
  group_id  TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',  -- 'founder' | 'member'
  status    TEXT NOT NULL DEFAULT 'pending', -- 'active' | 'pending' | 'declined'
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (group_id, user_id)
);

-- Track which members have approved/declined a pending join request
CREATE TABLE join_request_votes (
  request_id TEXT NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
  voter_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote       TEXT NOT NULL, -- 'approve' | 'decline'
  voted_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (request_id, voter_id)
);

-- ── Seasons & Episodes ───────────────────────────────────────────────
CREATE TABLE seasons (
  id       TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  number   INTEGER NOT NULL,
  year     INTEGER NOT NULL,
  status   TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed'
  UNIQUE (group_id, number)
);

CREATE TABLE episodes (
  id        TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  number    INTEGER NOT NULL,
  date      TEXT,                            -- ISO date, e.g. '2026-06-15'
  host_id   TEXT REFERENCES users(id),
  status    TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming' | 'current' | 'completed'
  UNIQUE (season_id, number)
);

CREATE TABLE episode_attendees (
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, user_id)
);

-- ── Vinyl Selections ─────────────────────────────────────────────────
CREATE TABLE episode_vinyls (
  id             TEXT PRIMARY KEY,
  episode_id     TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  contributed_by TEXT NOT NULL REFERENCES users(id),
  artist         TEXT NOT NULL,
  album_title    TEXT NOT NULL,
  art_url        TEXT,
  position_tag   TEXT CHECK (position_tag IN ('opener', 'middle', 'closer')),
  added_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Auth: session tokens (simple cookie-based sessions) ──────────────
CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,   -- random token stored in cookie
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- ── Indexes ──────────────────────────────────────────────────────────
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user  ON group_members(user_id);
CREATE INDEX idx_seasons_group       ON seasons(group_id);
CREATE INDEX idx_episodes_season     ON episodes(season_id);
CREATE INDEX idx_vinyls_episode      ON episode_vinyls(episode_id);
CREATE INDEX idx_sessions_user       ON sessions(user_id);
CREATE INDEX idx_sessions_expires    ON sessions(expires_at);
