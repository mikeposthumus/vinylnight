-- Seed: The Original group and its history
-- Passwords are placeholder hashes — founders should reset via profile

-- ── Founders ─────────────────────────────────────────────────────────
INSERT INTO users (id, username, email, password_hash, location, bio) VALUES
  ('u-chris', 'chris', 'chris@example.com', 'placeholder', 'Grand Rapids, MI', 'Founder of The Original. Eight years in and still finding new favorites.'),
  ('u-ben',   'ben',   'ben@example.com',   'placeholder', 'Grand Rapids, MI', NULL),
  ('u-kevin', 'kevin', 'kevin@example.com', 'placeholder', 'Grand Rapids, MI', NULL),
  ('u-seth',  'seth',  'seth@example.com',  'placeholder', 'Grand Rapids, MI', NULL),
  ('u-mike',  'mike',  'mike@example.com',  'placeholder', 'Grand Rapids, MI', NULL);

-- ── Group ─────────────────────────────────────────────────────────────
INSERT INTO groups (id, name, slug, location, description, founded_year) VALUES
  ('g-original', 'The Original', 'the-original', 'Grand Rapids, MI',
   'The founding group. Five close friends gathering monthly since 2018 — never a missed month.',
   2018);

INSERT INTO group_genres (id, group_id, genre) VALUES
  ('gg-1', 'g-original', 'Folk'),
  ('gg-2', 'g-original', 'Rock'),
  ('gg-3', 'g-original', 'Americana');

-- ── Members ───────────────────────────────────────────────────────────
INSERT INTO group_members (id, group_id, user_id, role, status) VALUES
  ('gm-chris', 'g-original', 'u-chris', 'founder', 'active'),
  ('gm-ben',   'g-original', 'u-ben',   'founder', 'active'),
  ('gm-kevin', 'g-original', 'u-kevin', 'founder', 'active'),
  ('gm-seth',  'g-original', 'u-seth',  'founder', 'active'),
  ('gm-mike',  'g-original', 'u-mike',  'founder', 'active');

-- ── Season 7 (2025, completed) ────────────────────────────────────────
INSERT INTO seasons (id, group_id, number, year, status) VALUES
  ('s7', 'g-original', 7, 2025, 'completed');

-- S7 E11 — March 2026, Kevin hosted, 4 attended
INSERT INTO episodes (id, season_id, number, date, host_id, status) VALUES
  ('e-s7e11', 's7', 11, '2026-03-15', 'u-kevin', 'completed');
INSERT INTO episode_attendees (episode_id, user_id) VALUES
  ('e-s7e11', 'u-chris'), ('e-s7e11', 'u-kevin'), ('e-s7e11', 'u-seth'), ('e-s7e11', 'u-mike');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e11-1', 'e-s7e11', 'u-kevin', 'Tom Waits',        'Rain Dogs'),
  ('v-s7e11-2', 'e-s7e11', 'u-seth',  'The National',     'Trouble Will Find Me'),
  ('v-s7e11-3', 'e-s7e11', 'u-mike',  'LCD Soundsystem',  'Sound of Silver');

-- S7 E12 — April 2026, Mike hosted, 5 attended
INSERT INTO episodes (id, season_id, number, date, host_id, status) VALUES
  ('e-s7e12', 's7', 12, '2026-04-19', 'u-mike', 'completed');
INSERT INTO episode_attendees (episode_id, user_id) VALUES
  ('e-s7e12', 'u-chris'), ('e-s7e12', 'u-ben'), ('e-s7e12', 'u-kevin'), ('e-s7e12', 'u-seth'), ('e-s7e12', 'u-mike');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e12-1', 'e-s7e12', 'u-chris', 'Bob Dylan',   'Blood on the Tracks'),
  ('v-s7e12-2', 'e-s7e12', 'u-ben',   'Neil Young',  'Harvest Moon'),
  ('v-s7e12-3', 'e-s7e12', 'u-mike',  'Wilco',       'Yankee Hotel Foxtrot');

-- ── Season 8 (2026, active) ───────────────────────────────────────────
INSERT INTO seasons (id, group_id, number, year, status) VALUES
  ('s8', 'g-original', 8, 2026, 'active');

-- S8 E01 — May 2026, Seth hosted, 5 attended
INSERT INTO episodes (id, season_id, number, date, host_id, status) VALUES
  ('e-s8e01', 's8', 1, '2026-05-17', 'u-seth', 'completed');
INSERT INTO episode_attendees (episode_id, user_id) VALUES
  ('e-s8e01', 'u-chris'), ('e-s8e01', 'u-ben'), ('e-s8e01', 'u-kevin'), ('e-s8e01', 'u-seth'), ('e-s8e01', 'u-mike');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s8e01-1', 'e-s8e01', 'u-chris', 'Radiohead',    'OK Computer'),
  ('v-s8e01-2', 'e-s8e01', 'u-ben',   'Bob Dylan',    'Blood on the Tracks'),
  ('v-s8e01-3', 'e-s8e01', 'u-kevin', 'Gillian Welch','Time (The Revelator)');

-- S8 E02 — June 2026, Chris hosts, current
INSERT INTO episodes (id, season_id, number, date, host_id, status) VALUES
  ('e-s8e02', 's8', 2, '2026-06-21', 'u-chris', 'current');
INSERT INTO episode_attendees (episode_id, user_id) VALUES
  ('e-s8e02', 'u-chris'), ('e-s8e02', 'u-ben'), ('e-s8e02', 'u-kevin'), ('e-s8e02', 'u-seth'), ('e-s8e02', 'u-mike');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s8e02-1', 'e-s8e02', 'u-ben',   'Joni Mitchell',     'Blue'),
  ('v-s8e02-2', 'e-s8e02', 'u-kevin', 'Bruce Springsteen', 'Nebraska');
