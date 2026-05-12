-- Migration 0005: Full historical data from the Vinyl Night spreadsheet
-- Seasons run May–April; the `year` field is the start year of the season.
-- Season 1 (2019) = May 2019–April 2020, Season 8 (2026) = May 2026–...
-- Dates use the 15th of each month as a placeholder where exact date is unknown.

-- ── Schema: guest user flag ───────────────────────────────────────────────
ALTER TABLE users ADD COLUMN is_guest INTEGER NOT NULL DEFAULT 0;

-- ── Guest user accounts (is_guest = 1, no login credentials) ─────────────
INSERT OR IGNORE INTO users (id, username, email, password_hash, is_guest) VALUES
  ('u-jeanne',  'jeanne',  'jeanne@example.com',  'placeholder', 1),
  ('u-kristin', 'kristin', 'kristin@example.com', 'placeholder', 1),
  ('u-rachel',  'rachel',  'rachel@example.com',  'placeholder', 1),
  ('u-mindy',   'mindy',   'mindy@example.com',   'placeholder', 1),
  ('u-jim',     'jim',     'jim@example.com',     'placeholder', 1),
  ('u-jessie',  'jessie',  'jessie@example.com',  'placeholder', 1),
  ('u-carissa', 'carissa', 'carissa@example.com', 'placeholder', 1);

-- ── Clear ALL S7/S8 episode data (placeholder + any test data) ───────────
DELETE FROM episode_vinyls    WHERE episode_id IN (SELECT id FROM episodes WHERE season_id IN ('s7','s8'));
DELETE FROM episode_attendees WHERE episode_id IN (SELECT id FROM episodes WHERE season_id IN ('s7','s8'));
DELETE FROM episodes WHERE season_id IN ('s7','s8');
-- Seasons s7 and s8 already exist from seed with correct values; no re-insert needed.
-- Update statuses to match reality.
UPDATE seasons SET status = 'completed' WHERE id = 's7';
UPDATE seasons SET status = 'active'    WHERE id = 's8';

-- ── Seasons 1–6 (new) ─────────────────────────────────────────────────────
INSERT INTO seasons (id, group_id, number, year, status) VALUES
  ('s1', 'g-original', 1, 2019, 'completed'),
  ('s2', 'g-original', 2, 2020, 'completed'),
  ('s3', 'g-original', 3, 2021, 'completed'),
  ('s4', 'g-original', 4, 2022, 'completed'),
  ('s5', 'g-original', 5, 2023, 'completed'),
  ('s6', 'g-original', 6, 2024, 'completed');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 1 — May 2019 through April 2020
-- ══════════════════════════════════════════════════════════════════════════

-- S1E01 May 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e01', 's1', 1, '2019-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e01','u-ben'), ('e-s1e01','u-chris'), ('e-s1e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e01-1', 'e-s1e01', 'u-ben',   'Fleetwood Mac',    'Rumours'),
  ('v-s1e01-2', 'e-s1e01', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Beirut',           'Gallipoli'),
  ('v-s1e01-3', 'e-s1e01', 'u-chris', 'Aaron Lee Tasjan', 'Silver Tears');

-- S1E02 June 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e02', 's1', 2, '2019-06-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e02','u-ben'), ('e-s1e02','u-chris'), ('e-s1e02','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e02-1', 'e-s1e02', 'u-ben',   'Radiohead',       'OK Computer'),
  ('v-s1e02-2', 'e-s1e02', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Too Many Zooz',   'Subway Gawdz'),
  ('v-s1e02-3', 'e-s1e02', 'u-chris', 'Lucinda Williams', 'Car Wheels on a Gravel Road');

-- S1E03 July 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e03', 's1', 3, '2019-07-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e03','u-ben'), ('e-s1e03','u-chris'), ('e-s1e03','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e03-1', 'e-s1e03', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Adele',             '21'),
  ('v-s1e03-2', 'e-s1e03', 'u-ben',   'The Decemberists',  'Picaresque'),
  ('v-s1e03-3', 'e-s1e03', 'u-chris', 'Matthew E. White',  'Fresh Blood');

-- S1E04 September 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e04', 's1', 4, '2019-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e04','u-ben'), ('e-s1e04','u-chris'), ('e-s1e04','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e04-1', 'e-s1e04', 'u-chris', 'Neil Young',      'On the Beach'),
  ('v-s1e04-2', 'e-s1e04', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Operation Ivy',   'Energy'),
  ('v-s1e04-3', 'e-s1e04', 'u-ben',   'Lord Huron',      'Lonesome Dreams');

-- S1E05 October 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e05', 's1', 5, '2019-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e05','u-ben'), ('e-s1e05','u-chris'), ('e-s1e05','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s1e05','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e05-1', 'e-s1e05', 'u-ben',   'The White Stripes',  'White Blood Cells'),
  ('v-s1e05-2', 'e-s1e05', 'u-chris', 'Parquet Courts',     'Light Up Gold'),
  ('v-s1e05-3', 'e-s1e05', 'u-kevin', 'Bruce Springsteen',  'Born to Run');

-- S1E06 November 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e06', 's1', 6, '2019-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e06','u-ben'), ('e-s1e06','u-chris'), ('e-s1e06','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e06-1', 'e-s1e06', 'u-ben',   'Fiona Apple',  'Tidal'),
  ('v-s1e06-2', 'e-s1e06', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Nirvana',      'Nevermind'),
  ('v-s1e06-3', 'e-s1e06', 'u-chris', 'Jeff Buckley', 'Grace');

-- S1E07 December 2019
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e07', 's1', 7, '2019-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e07','u-ben'), ('e-s1e07','u-chris'), ('e-s1e07','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s1e07','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e07-1', 'e-s1e07', 'u-ben',   'The Lumineers', 'Cleopatra'),
  ('v-s1e07-2', 'e-s1e07', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Weezer',        'Pinkerton'),
  ('v-s1e07-3', 'e-s1e07', 'u-kevin', 'alt-J',         'This Is All Yours');

-- S1E08 January 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e08', 's1', 8, '2020-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e08','u-ben'), ('e-s1e08','u-chris'), ('e-s1e08','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e08-1', 'e-s1e08', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'First Aid Kit',  'Stay Gold'),
  ('v-s1e08-2', 'e-s1e08', 'u-chris', 'Tom Petty',      'Full Moon Fever'),
  ('v-s1e08-3', 'e-s1e08', 'u-ben',   'Vampire Weekend', 'Vampire Weekend');

-- S1E09 February 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e09', 's1', 9, '2020-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e09','u-ben'), ('e-s1e09','u-chris'), ('e-s1e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s1e09','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e09-1', 'e-s1e09', 'u-chris', 'Bob Dylan',        'The Freewheelin'' Bob Dylan'),
  ('v-s1e09-2', 'e-s1e09', 'u-kevin', 'Nirvana',          'Nevermind'),
  ('v-s1e09-3', 'e-s1e09', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Chris Stapleton',  'From A Room: Volume 1');

-- S1E10 March 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e10', 's1', 10, '2020-03-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e10','u-ben'), ('e-s1e10','u-chris'), ('e-s1e10','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s1e10','u-kevin'), ('e-s1e10','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e10-1', 'e-s1e10', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726', 'Neutral Milk Hotel',  'In the Aeroplane Over the Sea'),
  ('v-s1e10-2', 'e-s1e10', 'u-seth', 'Frightened Rabbit',   'Pedestrian Verse'),
  ('v-s1e10-3', 'e-s1e10', 'u-ben',  'Morphine',            'Cure for Pain');

-- S1E11 April 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s1e11', 's1', 11, '2020-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s1e11','u-ben'), ('e-s1e11','u-chris'), ('e-s1e11','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s1e11','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s1e11-1', 'e-s1e11', 'u-ben',   'Ratatat',        'Classics'),
  ('v-s1e11-2', 'e-s1e11', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Creedence Clearwater Revival', 'Cosmo''s Factory'),
  ('v-s1e11-3', 'e-s1e11', 'u-kevin', 'Lauryn Hill',    'The Miseducation of Lauryn Hill');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 2 — May 2020 through April 2021
-- ══════════════════════════════════════════════════════════════════════════

-- S2E01 May 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e01', 's2', 1, '2020-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e01','u-ben'), ('e-s2e01','u-chris'), ('e-s2e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e01','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e01-1', 'e-s2e01', 'u-ben',   'The Velvet Underground', 'Andy Warhol'),
  ('v-s2e01-2', 'e-s2e01', 'u-chris', 'Pearl Jam',              'No Code'),
  ('v-s2e01-3', 'e-s2e01', 'u-kevin', 'The Beatles',            'Abbey Road');

-- S2E02 June 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e02', 's2', 2, '2020-06-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e02','u-ben'), ('e-s2e02','u-chris'), ('e-s2e02','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e02-1', 'e-s2e02', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Gorillaz',           'Gorillaz'),
  ('v-s2e02-2', 'e-s2e02', 'u-ben',   'Blue Öyster Cult',   'Fire of Unknown Origin'),
  ('v-s2e02-3', 'e-s2e02', 'u-chris', 'Michael Kiwanuka',   'Kiwanuka');

-- S2E03 July 2020 (first session)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e03', 's2', 3, '2020-07-08', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e03','u-ben'), ('e-s2e03','u-chris'), ('e-s2e03','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e03-1', 'e-s2e03', 'u-chris', 'Miles Davis',    'Kind of Blue'),
  ('v-s2e03-2', 'e-s2e03', 'u-ben',   'Madonna',        'Like a Virgin'),
  ('v-s2e03-3', 'e-s2e03', 'u-kevin', 'Stevie Wonder',  'Fulfillingness'' First Finale');

-- S2E04 July 2020 (second session)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e04', 's2', 4, '2020-07-22', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e04','u-ben'), ('e-s2e04','u-chris'), ('e-s2e04','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e04','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e04-1', 'e-s2e04', 'u-ben',   'The Head and the Heart', 'The Head and the Heart'),
  ('v-s2e04-2', 'e-s2e04', 'u-kevin', 'Built to Spill',         'Keep It Like a Secret'),
  ('v-s2e04-3', 'e-s2e04', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'David Bowie',            'The Rise and Fall of Ziggy Stardust and the Spiders from Mars');

-- S2E05 August 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e05', 's2', 5, '2020-08-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e05','u-ben'), ('e-s2e05','u-chris'), ('e-s2e05','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e05','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e05-1', 'e-s2e05', 'u-chris', 'The Who',          'Who''s Next'),
  ('v-s2e05-2', 'e-s2e05', 'u-kevin', 'The Black Keys',   'El Camino'),
  ('v-s2e05-3', 'e-s2e05', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'The Avett Brothers', 'True Sadness');

-- S2E06 September 2020 (special session — different attendees)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e06', 's2', 6, '2020-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e06','u-jeanne'), ('e-s2e06','u-kristin'), ('e-s2e06','u-rachel'), ('e-s2e06','u-mindy');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e06-1', 'e-s2e06', 'u-jeanne',  'Regina Spektor',   'Begin to Hope'),
  ('v-s2e06-2', 'e-s2e06', 'u-kristin', 'The Dixie Chicks', 'Wide Open Spaces'),
  ('v-s2e06-3', 'e-s2e06', 'u-mindy',   'Childish Gambino', 'Camp');

-- S2E07 October 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e07', 's2', 7, '2020-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e07','u-ben'), ('e-s2e07','u-chris'), ('e-s2e07','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e07','u-kevin'), ('e-s2e07','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e07-1', 'e-s2e07', 'u-seth',  'Old 97''s',        'Too Far to Care'),
  ('v-s2e07-2', 'e-s2e07', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Rancid',           '...And Out Come the Wolves'),
  ('v-s2e07-3', 'e-s2e07', 'u-ben',   'Run the Jewels',   'RTJ4'),
  ('v-s2e07-4', 'e-s2e07', 'u-chris', 'Dire Straits',     'Making Movies');

-- S2E08 November 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e08', 's2', 8, '2020-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e08','u-ben'), ('e-s2e08','u-chris'), ('e-s2e08','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e08','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e08-1', 'e-s2e08', 'u-kevin', 'Trampled by Turtles', 'Palomino'),
  ('v-s2e08-2', 'e-s2e08', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Dave Matthews Band',  'Come Tomorrow'),
  ('v-s2e08-3', 'e-s2e08', 'u-ben',   'Phil Collins',        'Face Value');

-- S2E09 December 2020
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e09', 's2', 9, '2020-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e09','u-ben'), ('e-s2e09','u-chris'), ('e-s2e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e09','u-kevin'), ('e-s2e09','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e09-1', 'e-s2e09', 'u-chris', 'Steve Earle',              'El Corazón'),
  ('v-s2e09-2', 'e-s2e09', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Weezer',                   'The Blue Album'),
  ('v-s2e09-3', 'e-s2e09', 'u-kevin', 'Queens of the Stone Age',  'Songs for the Deaf'),
  ('v-s2e09-4', 'e-s2e09', 'u-seth',  'The Stone Roses',          'The Stone Roses');

-- S2E10 January 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e10', 's2', 10, '2021-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e10','u-ben'), ('e-s2e10','u-chris'), ('e-s2e10','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e10','u-kevin'), ('e-s2e10','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e10-1', 'e-s2e10', 'u-ben',   'The Postal Service', 'Give Up'),
  ('v-s2e10-2', 'e-s2e10', 'u-chris', 'The Smiths',         'Strangeways, Here We Come'),
  ('v-s2e10-3', 'e-s2e10', 'u-seth',  'Angel Olsen',        'All Mirrors'),
  ('v-s2e10-4', 'e-s2e10', 'u-kevin', 'Cat Stevens',        'Tea for the Tillerman');

-- S2E11 February 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e11', 's2', 11, '2021-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e11','u-ben'), ('e-s2e11','u-chris'), ('e-s2e11','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e11','u-kevin'), ('e-s2e11','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e11-1', 'e-s2e11', 'u-ben',   'Edvard Grieg', 'Peer Gynt Suites Nos. 1 and 2'),
  ('v-s2e11-2', 'e-s2e11', 'u-seth',  'Fugees',       'The Score'),
  ('v-s2e11-3', 'e-s2e11', 'u-chris', 'The Kinks',    'The Kinks Are the Village Green Preservation Society'),
  ('v-s2e11-4', 'e-s2e11', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Air',          'Moon Safari');

-- S2E12 March 2021 (first session)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e12', 's2', 12, '2021-03-06', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e12','u-ben'), ('e-s2e12','u-chris'), ('e-s2e12','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e12','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e12-1', 'e-s2e12', 'u-ben',   'Sigur Rós',  'Valtari'),
  ('v-s2e12-2', 'e-s2e12', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Eagles',     'Hotel California'),
  ('v-s2e12-3', 'e-s2e12', 'u-chris', 'Neko Case',  'Middle Cyclone');

-- S2E13 March 2021 (second session)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e13', 's2', 13, '2021-03-20', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e13','u-ben'), ('e-s2e13','u-chris'), ('e-s2e13','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e13','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e13-1', 'e-s2e13', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Colter Wall',   'Colter Wall'),
  ('v-s2e13-2', 'e-s2e13', 'u-kevin', 'Talking Heads', 'Speaking in Tongues'),
  ('v-s2e13-3', 'e-s2e13', 'u-ben',   'Sufjan Stevens','Seven Swans');

-- S2E14 April 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s2e14', 's2', 14, '2021-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s2e14','u-ben'), ('e-s2e14','u-chris'), ('e-s2e14','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s2e14','u-kevin'), ('e-s2e14','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s2e14-1', 'e-s2e14', 'u-kevin', 'Mumford & Sons', 'Sigh No More'),
  ('v-s2e14-2', 'e-s2e14', 'u-seth',  'Wells Fargo',    'Watch Out!'),
  ('v-s2e14-3', 'e-s2e14', 'u-chris', 'Wilco',          'Being There'),
  ('v-s2e14-4', 'e-s2e14', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Paul Cauthen',   'Room 41');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 3 — May 2021 through April 2022
-- ══════════════════════════════════════════════════════════════════════════

-- S3E01 May 2021 (Jeanne attended in Ben's place)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e01', 's3', 1, '2021-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e01','u-jeanne'), ('e-s3e01','u-chris'), ('e-s3e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e01','u-kevin'), ('e-s3e01','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e01-1', 'e-s3e01', 'u-jeanne', 'Tori Amos',     'Under the Pink'),
  ('v-s3e01-2', 'e-s3e01', 'u-seth',   'Paul Simon',    'Graceland'),
  ('v-s3e01-3', 'e-s3e01', 'u-kevin',  'Janis Joplin',  'Pearl'),
  ('v-s3e01-4', 'e-s3e01', 'u-chris',  'Jason Isbell',  'Southeastern');

-- S3E02 June 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e02', 's3', 2, '2021-06-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e02','u-ben'), ('e-s3e02','u-chris'), ('e-s3e02','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e02','u-kevin'), ('e-s3e02','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e02-1', 'e-s3e02', 'u-ben',   'Styx',           'The Grand Illusion'),
  ('v-s3e02-2', 'e-s3e02', 'u-chris', 'Arcade Fire',    'Neon Bible'),
  ('v-s3e02-3', 'e-s3e02', 'u-seth',  'R.E.M.',         'Out of Time'),
  ('v-s3e02-4', 'e-s3e02', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'The Avett Brothers', 'I and Love and You');

-- S3E03 July 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e03', 's3', 3, '2021-07-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e03','u-ben'), ('e-s3e03','u-chris'), ('e-s3e03','u-kevin'), ('e-s3e03','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e03-1', 'e-s3e03', 'u-kevin', 'Clutch',            'Book of Bad Decisions'),
  ('v-s3e03-2', 'e-s3e03', 'u-ben',   'ZZ Top',            'Eliminator'),
  ('v-s3e03-3', 'e-s3e03', 'u-chris', 'Thelonious Monk',   'Brilliant Corners');

-- S3E04 August 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e04', 's3', 4, '2021-08-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e04','u-ben'), ('e-s3e04','u-chris'), ('e-s3e04','u-kevin'), ('e-s3e04','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e04-1', 'e-s3e04', 'u-kevin', 'Bob Marley',  'Exodus'),
  ('v-s3e04-2', 'e-s3e04', 'u-seth',  'R.E.M.',      'Life''s Rich Pageant'),
  ('v-s3e04-3', 'e-s3e04', 'u-ben',   'Lord Huron',  'Long Lost');

-- S3E05 September 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e05', 's3', 5, '2021-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e05','u-chris'), ('e-s3e05','u-kevin'), ('e-s3e05','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e05','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e05-1', 'e-s3e05', 'u-seth',  'The Beatles',        'The White Album'),
  ('v-s3e05-2', 'e-s3e05', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'The Rolling Stones', 'Exile on Main St.'),
  ('v-s3e05-3', 'e-s3e05', 'u-chris', 'Wilco',              'Yankee Hotel Foxtrot'),
  ('v-s3e05-4', 'e-s3e05', 'u-kevin', 'Fleet Foxes',        'Fleet Foxes');

-- S3E06 October 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e06', 's3', 6, '2021-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e06','u-ben'), ('e-s3e06','u-chris'), ('e-s3e06','u-kevin'), ('e-s3e06','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e06-1', 'e-s3e06', 'u-ben',   'Michael Jackson',  'Thriller'),
  ('v-s3e06-2', 'e-s3e06', 'u-chris', 'Led Zeppelin',     'Led Zeppelin IV'),
  ('v-s3e06-3', 'e-s3e06', 'u-kevin', 'alt-J',            'An Awesome Wave');

-- S3E07 November 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e07', 's3', 7, '2021-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e07','u-ben'), ('e-s3e07','u-chris'), ('e-s3e07','u-kevin'), ('e-s3e07','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e07','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e07-1', 'e-s3e07', 'u-seth',  'Michelle Shocked',          'Short Sharp Shocked'),
  ('v-s3e07-2', 'e-s3e07', 'u-ben',   'The Avalanches',            'Since I Left You'),
  ('v-s3e07-3', 'e-s3e07', 'u-chris', 'The Jimi Hendrix Experience','Axis: Bold as Love');

-- S3E08 December 2021
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e08', 's3', 8, '2021-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e08','u-ben'), ('e-s3e08','u-chris'), ('e-s3e08','u-kevin'), ('e-s3e08','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e08','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e08-1', 'e-s3e08', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Less Than Jake', 'Losing Streak'),
  ('v-s3e08-2', 'e-s3e08', 'u-ben',   'The Clash',      'London Calling'),
  ('v-s3e08-3', 'e-s3e08', 'u-chris', 'Pavement',       'Crooked Rain, Crooked Rain');

-- S3E09 January 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e09', 's3', 9, '2022-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e09','u-chris'), ('e-s3e09','u-kevin'), ('e-s3e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e09','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e09-1', 'e-s3e09', 'u-kevin', 'Primus',       'Frizzle Fry'),
  ('v-s3e09-2', 'e-s3e09', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Mother''s Cake','Cyberfunk!'),
  ('v-s3e09-3', 'e-s3e09', 'u-seth',  'Joy Division', 'Unknown Pleasures');

-- S3E10 February 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e10', 's3', 10, '2022-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e10','u-ben'), ('e-s3e10','u-chris'), ('e-s3e10','u-kevin'), ('e-s3e10','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e10-1', 'e-s3e10', 'u-kevin', 'Pixies',        'Doolittle'),
  ('v-s3e10-2', 'e-s3e10', 'u-seth',  'Beastie Boys',  'Paul''s Boutique'),
  ('v-s3e10-3', 'e-s3e10', 'u-ben',   'Nahko',         'My Name Is Bear');

-- S3E11 March 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e11', 's3', 11, '2022-03-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e11','u-ben'), ('e-s3e11','u-chris'), ('e-s3e11','u-kevin'), ('e-s3e11','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e11','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e11-1', 'e-s3e11', 'u-chris', 'Garrett T. Capps', 'I Love San Antone'),
  ('v-s3e11-2', 'e-s3e11', 'u-ben',   'Coldplay',         'Parachutes'),
  ('v-s3e11-3', 'e-s3e11', 'u-seth',  'Ryan Adams',       'Heartbreaker');

-- S3E12 April 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s3e12', 's3', 12, '2022-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s3e12','u-ben'), ('e-s3e12','u-chris'), ('e-s3e12','u-kevin'), ('e-s3e12','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s3e12','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s3e12-1', 'e-s3e12', 'u-seth',  'Torres',       'Sprinter'),
  ('v-s3e12-2', 'e-s3e12', 'u-kevin', 'Soundgarden',  'Badmotorfinger'),
  ('v-s3e12-3', 'e-s3e12', 'u-chris', 'Queen',        'News of the World');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 4 — May 2022 through April 2023
-- ══════════════════════════════════════════════════════════════════════════

-- S4E01 May 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e01', 's4', 1, '2022-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e01','u-ben'), ('e-s4e01','u-chris'), ('e-s4e01','u-kevin'), ('e-s4e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e01','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e01-1', 'e-s4e01', 'u-chris',  'Conor Oberst',              'Upside Down Mountain'),
  ('v-s4e01-2', 'e-s4e01', 'u-ben',    'Wet Leg',                   'Wet Leg'),
  ('v-s4e01-3', 'e-s4e01', 'u-kevin',  'The Builders and the Butchers', 'The Builders and the Butchers');

-- S4E02 June 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e02', 's4', 2, '2022-06-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e02','u-ben'), ('e-s4e02','u-chris'), ('e-s4e02','u-kevin'), ('e-s4e02','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e02','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e02-1', 'e-s4e02', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'The Strokes',    'Is This It'),
  ('v-s4e02-2', 'e-s4e02', 'u-kevin', 'Blind Melon',    'Blind Melon'),
  ('v-s4e02-3', 'e-s4e02', 'u-ben',   'Nilüfer Yanya',  'Painless');

-- S4E03 July 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e03', 's4', 3, '2022-07-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e03','u-ben'), ('e-s4e03','u-chris'), ('e-s4e03','u-kevin'), ('e-s4e03','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e03','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e03-1', 'e-s4e03', 'u-seth',  'Okkervil River', 'The Stage Names'),
  ('v-s4e03-2', 'e-s4e03', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Turnstile',      'Glow On'),
  ('v-s4e03-3', 'e-s4e03', 'u-kevin', 'Idles',          'Crawler');

-- S4E04 August 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e04', 's4', 4, '2022-08-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e04','u-ben'), ('e-s4e04','u-chris'), ('e-s4e04','u-kevin'), ('e-s4e04','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e04-1', 'e-s4e04', 'u-seth',  'Strand of Oaks',  'In Heaven'),
  ('v-s4e04-2', 'e-s4e04', 'u-chris', 'John Hiatt',      'Bring the Family'),
  ('v-s4e04-3', 'e-s4e04', 'u-ben',   'Floating Points, Pharoah Sanders & the London Symphony Orchestra', 'Promises');

-- S4E05 September 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e05', 's4', 5, '2022-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e05','u-ben'), ('e-s4e05','u-chris'), ('e-s4e05','u-kevin'), ('e-s4e05','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e05-1', 'e-s4e05', 'u-ben',   'Pink Floyd',   'The Dark Side of the Moon'),
  ('v-s4e05-2', 'e-s4e05', 'u-kevin', 'Fu Manchu',    'Godzilla''s/Eatin'' Dust'),
  ('v-s4e05-3', 'e-s4e05', 'u-chris', 'John Prine',   'The Missing Years');

-- S4E06 October 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e06', 's4', 6, '2022-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e06','u-ben'), ('e-s4e06','u-chris'), ('e-s4e06','u-kevin'), ('e-s4e06','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e06','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e06-1', 'e-s4e06', 'u-ben',   'Rilo Kiley',  'more adventurous'),
  ('v-s4e06-2', 'e-s4e06', 'u-chris', 'Spoon',       'Ga Ga Ga Ga Ga'),
  ('v-s4e06-3', 'e-s4e06', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'The Kills',   'Live at Third Man Records'),
  ('v-s4e06-4', 'e-s4e06', 'u-kevin', 'Kyuss',       'Blues for the Red Sun');

-- S4E07 November 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e07', 's4', 7, '2022-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e07','u-ben'), ('e-s4e07','u-chris'), ('e-s4e07','u-kevin'), ('e-s4e07','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e07-1', 'e-s4e07', 'u-kevin', 'Penny & Sparrow', 'Wendigo'),
  ('v-s4e07-2', 'e-s4e07', 'u-ben',   'Fruit Bats',      'Gold Past Life'),
  ('v-s4e07-3', 'e-s4e07', 'u-seth',  'Jason Isbell',    'Reunions');

-- S4E08 December 2022
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e08', 's4', 8, '2022-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e08','u-ben'), ('e-s4e08','u-chris'), ('e-s4e08','u-kevin'), ('e-s4e08','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e08','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e08-1', 'e-s4e08', 'u-seth',  'U2',          'Achtung Baby'),
  ('v-s4e08-2', 'e-s4e08', 'u-kevin', 'Metallica',   'Master of Puppets'),
  ('v-s4e08-3', 'e-s4e08', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Arctic Monkeys', 'AM'),
  ('v-s4e08-4', 'e-s4e08', 'u-chris', 'Waxahatchee', 'Saint Cloud');

-- S4E09 January 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e09', 's4', 9, '2023-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e09','u-ben'), ('e-s4e09','u-chris'), ('e-s4e09','u-kevin'), ('e-s4e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e09','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e09-1', 'e-s4e09', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Stevie Ray Vaughan', 'Couldn''t Stand the Weather'),
  ('v-s4e09-2', 'e-s4e09', 'u-chris', 'Alex G',             'God Save the Animals'),
  ('v-s4e09-3', 'e-s4e09', 'u-seth',  'The National',       'High Violet');

-- S4E10 February 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e10', 's4', 10, '2023-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e10','u-ben'), ('e-s4e10','u-chris'), ('e-s4e10','u-kevin'), ('e-s4e10','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e10-1', 'e-s4e10', 'u-ben',   'The Seatbelts',       'Cowboy Bebop'),
  ('v-s4e10-2', 'e-s4e10', 'u-kevin', 'Big Thief',           'U.F.O.F.'),
  ('v-s4e10-3', 'e-s4e10', 'u-chris', 'Benjamin Clementine', 'At Least for Now');

-- S4E11 March 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e11', 's4', 11, '2023-03-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e11','u-chris'), ('e-s4e11','u-kevin'), ('e-s4e11','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e11-1', 'e-s4e11', 'u-seth',  'New Order',    'Power, Corruption, and Lies'),
  ('v-s4e11-2', 'e-s4e11', 'u-kevin', 'Nine Inch Nails', 'The Downward Spiral'),
  ('v-s4e11-3', 'e-s4e11', 'u-chris', 'Supertramp',   'Crime of the Century');

-- S4E12 April 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s4e12', 's4', 12, '2023-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s4e12','u-ben'), ('e-s4e12','u-chris'), ('e-s4e12','u-kevin'), ('e-s4e12','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s4e12','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s4e12-1', 'e-s4e12', 'u-kevin', 'Mac DeMarco',       'Here Comes the Cowboy'),
  ('v-s4e12-2', 'e-s4e12', 'u-ben',   'Tyler, the Creator','Flower Boy'),
  ('v-s4e12-3', 'e-s4e12', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Elliott Smith',     'In Between');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 5 — May 2023 through April 2024
-- ══════════════════════════════════════════════════════════════════════════

-- S5E01 May 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e01', 's5', 1, '2023-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e01','u-ben'), ('e-s5e01','u-chris'), ('e-s5e01','u-kevin'), ('e-s5e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e01','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e01-1', 'e-s5e01', 'u-chris', 'Big Thief',              'Dragon New Warm Mountain I Believe in You'),
  ('v-s5e01-2', 'e-s5e01', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Red Hot Chili Peppers',  'Blood Sugar Sex Magik'),
  ('v-s5e01-3', 'e-s5e01', 'u-kevin', 'Charley Crockett',       'Field Recordings Vol. 1');

-- S5E02 June 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e02', 's5', 2, '2023-06-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e02','u-ben'), ('e-s5e02','u-chris'), ('e-s5e02','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e02','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e02-1', 'e-s5e02', 'u-ben',   'Rainbow Kitten Surprise', 'how to: friend, love, freefall'),
  ('v-s5e02-2', 'e-s5e02', 'u-seth',  'Courtney Barnett',        'Sometimes I Sit and Think, and Sometimes I Just Sit'),
  ('v-s5e02-3', 'e-s5e02', 'u-chris', 'Leonard Cohen',           'I''m Your Man');

-- S5E03 July 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e03', 's5', 3, '2023-07-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e03','u-ben'), ('e-s5e03','u-chris'), ('e-s5e03','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e03-1', 'e-s5e03', 'u-chris', 'Santana',            'III'),
  ('v-s5e03-2', 'e-s5e03', 'u-kevin', 'Arctic Monkeys',     'AM'),
  ('v-s5e03-3', 'e-s5e03', 'u-ben',   'The Weather Station','Ignorance');

-- S5E04 August 2023 (unofficial session)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e04', 's5', 4, '2023-08-05', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e04','u-ben'), ('e-s5e04','u-chris'), ('e-s5e04','u-kevin'), ('e-s5e04','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e04','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e04-1', 'e-s5e04', 'u-seth',  'U2',           'The Joshua Tree'),
  ('v-s5e04-2', 'e-s5e04', 'u-chris', 'Warren Zevon', 'Excitable Boy'),
  ('v-s5e04-3', 'e-s5e04', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Billy Strings', 'Renewal');

-- S5E05 August 2023 (regular session)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e05', 's5', 5, '2023-08-19', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e05','u-ben'), ('e-s5e05','u-chris'), ('e-s5e05','u-kevin'), ('e-s5e05','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e05','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e05-1', 'e-s5e05', 'u-kevin', 'Tyler, the Creator', 'Igor'),
  ('v-s5e05-2', 'e-s5e05', 'u-ben',   'Modest Mouse',       'Strangers to Ourselves'),
  ('v-s5e05-3', 'e-s5e05', 'u-chris', 'Dave Brubeck',       'Time Out');

-- S5E06 September 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e06', 's5', 6, '2023-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e06','u-ben'), ('e-s5e06','u-chris'), ('e-s5e06','u-kevin'), ('e-s5e06','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e06-1', 'e-s5e06', 'u-seth',  'R.E.M.',         'Document'),
  ('v-s5e06-2', 'e-s5e06', 'u-ben',   'Black Sabbath',  'Paranoid'),
  ('v-s5e06-3', 'e-s5e06', 'u-kevin', 'Morphine',       'The Night');

-- S5E07 October 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e07', 's5', 7, '2023-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e07','u-ben'), ('e-s5e07','u-chris'), ('e-s5e07','u-kevin'), ('e-s5e07','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e07-1', 'e-s5e07', 'u-kevin', 'Smashing Pumpkins', 'Siamese Dream'),
  ('v-s5e07-2', 'e-s5e07', 'u-chris', 'Ron Gallo',         'Foreground Music'),
  ('v-s5e07-3', 'e-s5e07', 'u-seth',  'Bruce Springsteen', 'Nebraska');

-- S5E08 November 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e08', 's5', 8, '2023-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e08','u-ben'), ('e-s5e08','u-chris'), ('e-s5e08','u-kevin'), ('e-s5e08','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e08','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e08-1', 'e-s5e08', 'u-ben',   'Taylor Swift',       'Midnights'),
  ('v-s5e08-2', 'e-s5e08', 'u-seth',  'Depeche Mode',       'Violator'),
  ('v-s5e08-3', 'e-s5e08', 'u-chris', 'Black Pumas',        'Black Pumas'),
  ('v-s5e08-4', 'e-s5e08', 'u-kevin', 'Car Seat Headrest',  'Teens of Style'),
  ('v-s5e08-5', 'e-s5e08', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Dave Matthews Band', 'Before These Crowded Streets');

-- S5E09 December 2023
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e09', 's5', 9, '2023-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e09','u-ben'), ('e-s5e09','u-chris'), ('e-s5e09','u-kevin'), ('e-s5e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e09','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e09-1', 'e-s5e09', 'u-chris', 'The War on Drugs', 'Lost in the Dream'),
  ('v-s5e09-2', 'e-s5e09', 'u-seth',  'Jeff Buckley',     'Grace'),
  ('v-s5e09-3', 'e-s5e09', 'u-ben',   'First Aid Kit',    'Ruins');

-- S5E10 January 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e10', 's5', 10, '2024-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e10','u-ben'), ('e-s5e10','u-chris'), ('e-s5e10','u-kevin'), ('e-s5e10','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e10','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e10-1', 'e-s5e10', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Cake',        'Fashion Nugget'),
  ('v-s5e10-2', 'e-s5e10', 'u-chris', 'Rilo Kiley',  'Under the Blacklight'),
  ('v-s5e10-3', 'e-s5e10', 'u-ben',   'Eddie Vedder','Into the Wild');

-- S5E11 February 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e11', 's5', 11, '2024-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e11','u-ben'), ('e-s5e11','u-chris'), ('e-s5e11','u-kevin'), ('e-s5e11','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e11','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e11-1', 'e-s5e11', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Radiohead',   'In Rainbows'),
  ('v-s5e11-2', 'e-s5e11', 'u-kevin', 'Shellac',     'At Action Park'),
  ('v-s5e11-3', 'e-s5e11', 'u-ben',   'Lana Del Rey','Did You Know That There''s a Tunnel Under Ocean Blvd');

-- S5E12 March 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e12', 's5', 12, '2024-03-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e12','u-ben'), ('e-s5e12','u-chris'), ('e-s5e12','u-kevin'), ('e-s5e12','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s5e12','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e12-1', 'e-s5e12', 'u-seth',  'American Aquarium', 'Burn. Flicker. Die.'),
  ('v-s5e12-2', 'e-s5e12', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Marvin Gaye',       'Let''s Get It On'),
  ('v-s5e12-3', 'e-s5e12', 'u-kevin', 'Green Day',         'American Idiot');

-- S5E13 April 2024 (artist/album were swapped in source for all three entries — corrected here)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s5e13', 's5', 13, '2024-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s5e13','u-ben'), ('e-s5e13','u-chris'), ('e-s5e13','u-kevin'), ('e-s5e13','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s5e13-1', 'e-s5e13', 'u-seth',  'Maggie Rogers',  'Surrender'),
  ('v-s5e13-2', 'e-s5e13', 'u-chris', 'Orchestra Baobab','Mouhamadou Bamba'),
  ('v-s5e13-3', 'e-s5e13', 'u-ben',   'Mitski',         'The Land Is Inhospitable and So Are We');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 6 — May 2024 through April 2025
-- ══════════════════════════════════════════════════════════════════════════

-- S6E01 May 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e01', 's6', 1, '2024-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e01','u-ben'), ('e-s6e01','u-chris'), ('e-s6e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e01','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e01-1', 'e-s6e01', 'u-chris', 'Television',     'Marquee Moon'),
  ('v-s6e01-2', 'e-s6e01', 'u-seth',  'Interpol',       'Antics'),
  ('v-s6e01-3', 'e-s6e01', 'u-ben',   'Peter Frampton', 'Frampton Comes Alive!');

-- S6E02 June 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e02', 's6', 2, '2024-06-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e02','u-ben'), ('e-s6e02','u-chris'), ('e-s6e02','u-kevin'), ('e-s6e02','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e02-1', 'e-s6e02', 'u-kevin', 'American Football', 'American Football'),
  ('v-s6e02-2', 'e-s6e02', 'u-ben',   'Johnny Cash',       'Live at Folsom Prison'),
  ('v-s6e02-3', 'e-s6e02', 'u-chris', 'Typhoon',           'White Lighter');

-- S6E03 July 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e03', 's6', 3, '2024-07-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e03','u-chris'), ('e-s6e03','u-kevin'), ('e-s6e03','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e03-1', 'e-s6e03', 'u-chris', 'Pearl Jam',   'Vs.'),
  ('v-s6e03-2', 'e-s6e03', 'u-kevin', 'Big Thief',   'Two Hands'),
  ('v-s6e03-3', 'e-s6e03', 'u-seth',  'Beck',        'Odelay');

-- S6E04 August 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e04', 's6', 4, '2024-08-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e04','u-ben'), ('e-s6e04','u-chris'), ('e-s6e04','u-kevin'), ('e-s6e04','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e04','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e04-1', 'e-s6e04', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Keith Jarrett',  'The Köln Concert'),
  ('v-s6e04-2', 'e-s6e04', 'u-seth',  'Nanci Griffith', 'One Fair Summer Evening'),
  ('v-s6e04-3', 'e-s6e04', 'u-ben',   'Cheap Trick',    'Cheap Trick at Budokan'),
  ('v-s6e04-4', 'e-s6e04', 'u-chris', 'Pearl Jam',      'MTV Unplugged'),
  ('v-s6e04-5', 'e-s6e04', 'u-kevin', 'John Coltrane',  'A Love Supreme: Live in Seattle');

-- S6E05 September 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e05', 's6', 5, '2024-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e05','u-ben'), ('e-s6e05','u-chris'), ('e-s6e05','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e05-1', 'e-s6e05', 'u-ben',   'AC/DC',                  'Back in Black'),
  ('v-s6e05-2', 'e-s6e05', 'u-kevin', 'NOFX',                   'Ribbed: Live in a Dive'),
  ('v-s6e05-3', 'e-s6e05', 'u-chris', 'The Allman Brothers Band','Eat a Peach');

-- S6E06 October 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e06', 's6', 6, '2024-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e06','u-ben'), ('e-s6e06','u-chris'), ('e-s6e06','u-kevin'), ('e-s6e06','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e06-1', 'e-s6e06', 'u-chris', 'Japanese Breakfast', 'Jubilee'),
  ('v-s6e06-2', 'e-s6e06', 'u-ben',   'Linkin Park',        'Hybrid Theory'),
  ('v-s6e06-3', 'e-s6e06', 'u-kevin', 'Talking Heads',      'Little Creatures');

-- S6E07 November 2024
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e07', 's6', 7, '2024-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e07','u-ben'), ('e-s6e07','u-chris'), ('e-s6e07','u-kevin'), ('e-s6e07','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e07','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e07-1', 'e-s6e07', 'u-ben',   'Thundercat',        'The Golden Age of Apocalypse'),
  ('v-s6e07-2', 'e-s6e07', 'u-kevin', 'David Wax Museum',  'Knock Knock Get Up'),
  ('v-s6e07-3', 'e-s6e07', 'u-chris', 'Willie Nile',       'American Ride');

-- S6E08 December 2024 (Ben brought two Sufjan Stevens albums)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e08', 's6', 8, '2024-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e08','u-ben'), ('e-s6e08','u-chris'), ('e-s6e08','u-kevin'), ('e-s6e08','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e08','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e08-1', 'e-s6e08', 'u-kevin', 'Built to Spill',  'Perfect From Now On'),
  ('v-s6e08-2', 'e-s6e08', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Arcade Fire',     'Neon Bible'),
  ('v-s6e08-3', 'e-s6e08', 'u-ben',   'Sufjan Stevens',  'Come on Feel the Illinoise!'),
  ('v-s6e08-4', 'e-s6e08', 'u-ben',   'Sufjan Stevens',  'Tonya Harding');

-- S6E09 January 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e09', 's6', 9, '2025-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e09','u-ben'), ('e-s6e09','u-chris'), ('e-s6e09','u-kevin'), ('e-s6e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e09','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e09-1', 'e-s6e09', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Brandi Carlile',       'By the Way, I Forgive You'),
  ('v-s6e09-2', 'e-s6e09', 'u-kevin', 'Jeremie Albino',       'Our Time in the Sun'),
  ('v-s6e09-3', 'e-s6e09', 'u-seth',  'A Tribe Called Quest', 'People''s Instinctive Travels and the Paths of Rhythm');

-- S6E10 February 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e10', 's6', 10, '2025-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e10','u-ben'), ('e-s6e10','u-chris'), ('e-s6e10','u-kevin'), ('e-s6e10','u-seth'), ('e-s6e10','u-jim');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e10-1', 'e-s6e10', 'u-jim',   'Sturgill Simpson', 'The Ballad of Dood and Juanita'),
  ('v-s6e10-2', 'e-s6e10', 'u-chris', 'Boston',           'Boston'),
  ('v-s6e10-3', 'e-s6e10', 'u-ben',   'Victor Wooten',    'A Show of Hands'),
  ('v-s6e10-4', 'e-s6e10', 'u-seth',  'Lead Belly',       'The Midnight Special');

-- S6E11 March 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e11', 's6', 11, '2025-03-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e11','u-chris'), ('e-s6e11','u-kevin'), ('e-s6e11','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e11','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e11-1', 'e-s6e11', 'u-chris', 'Dave Matthews Band', 'Under the Table and Dreaming'),
  ('v-s6e11-2', 'e-s6e11', 'u-seth',  'Poi Dog Pondering',  'Poi Dog Pondering'),
  ('v-s6e11-3', 'e-s6e11', 'u-kevin', 'Adrian Younge',      'Something About April');

-- S6E12 April 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s6e12', 's6', 12, '2025-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s6e12','u-ben'), ('e-s6e12','u-chris'), ('e-s6e12','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s6e12','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s6e12-1', 'e-s6e12', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Stevie Wonder', 'Songs in the Key of Life'),
  ('v-s6e12-2', 'e-s6e12', 'u-chris', 'White Witch',   'White Witch'),
  ('v-s6e12-3', 'e-s6e12', 'u-ben',   'Kevin Morby',   'Harlem River');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 7 — May 2025 through April 2026
-- ══════════════════════════════════════════════════════════════════════════

-- S7E01 May 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e01', 's7', 1, '2025-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e01','u-ben'), ('e-s7e01','u-chris'), ('e-s7e01','u-kevin'), ('e-s7e01','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e01','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e01-1', 'e-s7e01', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Carole King',   'Tapestry'),
  ('v-s7e01-2', 'e-s7e01', 'u-kevin', 'Mac Miller',    'Circles'),
  ('v-s7e01-3', 'e-s7e01', 'u-ben',   'Band of Horses', 'Band of Horses');

-- S7E02 June 2025 (date known: Cliff Bell's on 6/7/25)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e02', 's7', 2, '2025-06-07', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e02','u-ben'), ('e-s7e02','u-chris'), ('e-s7e02','u-kevin'), ('e-s7e02','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e02-1', 'e-s7e02', 'u-ben',   'Caleb Robinson', 'Live (Cliff Bell''s) on 6/7/25'),
  ('v-s7e02-2', 'e-s7e02', 'u-chris', 'Bob James',      'Three'),
  ('v-s7e02-3', 'e-s7e02', 'u-kevin', 'Ace',            'Five Beside');

-- S7E03 July 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e03', 's7', 3, '2025-07-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e03','u-ben'), ('e-s7e03','u-chris'), ('e-s7e03','u-kevin'), ('e-s7e03','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e03-1', 'e-s7e03', 'u-kevin', 'Melvins',      'Houdini'),
  ('v-s7e03-2', 'e-s7e03', 'u-seth',  'Joe Ely',      'Honky Tonk Masquerade'),
  ('v-s7e03-3', 'e-s7e03', 'u-chris', 'Rose City Band','Rose City Band');

-- S7E04 August 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e04', 's7', 4, '2025-08-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e04','u-ben'), ('e-s7e04','u-chris'), ('e-s7e04','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e04','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e04-1', 'e-s7e04', 'u-seth',  'Quilt',               'Plaza'),
  ('v-s7e04-2', 'e-s7e04', 'u-chris', 'Alejandro Escovedo',  'Big Station'),
  ('v-s7e04-3', 'e-s7e04', 'u-ben',   'The Civil Wars',      'Barton Hollow');

-- S7E05 September 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e05', 's7', 5, '2025-09-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e05','u-ben'), ('e-s7e05','u-chris'), ('e-s7e05','u-kevin'), ('e-s7e05','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e05','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e05-1', 'e-s7e05', 'u-chris', 'Link Wray',        'Link Wray'),
  ('v-s7e05-2', 'e-s7e05', 'u-ben',   'Wet Leg',          'Moisturizer'),
  ('v-s7e05-3', 'e-s7e05', 'u-seth',  'Bruce Springsteen','Nebraska');

-- S7E06 October 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e06', 's7', 6, '2025-10-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e06','u-ben'), ('e-s7e06','u-chris'), ('e-s7e06','u-kevin'), ('e-s7e06','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e06','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e06-1', 'e-s7e06', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Ramones',                       'Rocket to Russia'),
  ('v-s7e06-2', 'e-s7e06', 'u-ben',   'Linkin Park',                   'Meteors'),
  ('v-s7e06-3', 'e-s7e06', 'u-chris', 'Joe Strummer and the Mescaleros','Streetcore');

-- S7E07 November 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e07', 's7', 7, '2025-11-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e07','u-ben'), ('e-s7e07','u-chris'), ('e-s7e07','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e07','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e07-1', 'e-s7e07', 'u-chris', 'Townes Van Zandt', 'Live at the Old Quarter, Houston, Texas'),
  ('v-s7e07-2', 'e-s7e07', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Bad Religion',     'Stranger Than Fiction'),
  ('v-s7e07-3', 'e-s7e07', 'u-ben',   'Pink Floyd',       'Wish You Were Here'),
  ('v-s7e07-4', 'e-s7e07', 'u-seth',  'Elton John',       'Goodbye Yellow Brick Road');

-- S7E08 December 2025
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e08', 's7', 8, '2025-12-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e08','u-ben'), ('e-s7e08','u-chris'), ('e-s7e08','u-kevin');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e08-1', 'e-s7e08', 'u-kevin', 'Of Monsters and Men', 'My Head Is an Animal'),
  ('v-s7e08-2', 'e-s7e08', 'u-chris', 'Amyl and the Sniffers','Comfort to Me'),
  ('v-s7e08-3', 'e-s7e08', 'u-ben',   'The Decemberists',    'The Crane Wife');

-- S7E09 January 2026
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e09', 's7', 9, '2026-01-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e09','u-ben'), ('e-s7e09','u-chris'), ('e-s7e09','u-kevin'), ('e-s7e09','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e09','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e09-1', 'e-s7e09', 'u-seth',  'Angie McMahon',    'Salt'),
  ('v-s7e09-2', 'e-s7e09', 'u-chris', 'Pokey LaFarge',    'Rhumba Country'),
  ('v-s7e09-3', 'e-s7e09', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Bill Evans & Jim Hall', 'Undercurrent');

-- S7E10 February 2026
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e10', 's7', 10, '2026-02-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e10','u-ben'), ('e-s7e10','u-chris'), ('e-s7e10','u-kevin'), ('e-s7e10','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e10-1', 'e-s7e10', 'u-chris', 'Kraftwerk',            'Autobahn'),
  ('v-s7e10-2', 'e-s7e10', 'u-seth',  'PJ Harvey',            'Dry'),
  ('v-s7e10-3', 'e-s7e10', 'u-ben',   'Manchester Orchestra', 'The Million Masks of God');

-- S7E11 March 2026
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e11', 's7', 11, '2026-03-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e11','u-ben'), ('e-s7e11','u-chris'), ('e-s7e11','u-kevin'), ('e-s7e11','285cd74d-ba4a-4f61-9f22-ff62b3bc1726');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e11-1', 'e-s7e11', 'u-ben',   'Sia',           'This Is Acting'),
  ('v-s7e11-2', 'e-s7e11', 'u-kevin', 'Twenty One Pilots', 'Vessel'),
  ('v-s7e11-3', 'e-s7e11', 'u-chris', 'The Pretenders','Learning to Crawl');

-- S7E12 April 2026
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s7e12', 's7', 12, '2026-04-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s7e12','u-ben'), ('e-s7e12','u-chris'), ('e-s7e12','u-kevin'), ('e-s7e12','285cd74d-ba4a-4f61-9f22-ff62b3bc1726'), ('e-s7e12','u-seth');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s7e12-1', 'e-s7e12', 'u-chris', 'James McMurtry',                'Childish Things'),
  ('v-s7e12-2', 'e-s7e12', 'u-ben',   'Tom Petty and the Heartbreakers','Damn the Torpedoes'),
  ('v-s7e12-3', 'e-s7e12', '285cd74d-ba4a-4f61-9f22-ff62b3bc1726',  'Arcade Fire',                   'Funeral');

-- ══════════════════════════════════════════════════════════════════════════
-- SEASON 8 — May 2026 onward
-- ══════════════════════════════════════════════════════════════════════════

-- S8E01 May 2026 (special session — different attendees)
INSERT INTO episodes (id, season_id, number, date, status) VALUES ('e-s8e01', 's8', 1, '2026-05-15', 'completed');
INSERT INTO episode_attendees VALUES ('e-s8e01','u-jeanne'), ('e-s8e01','u-kristin'), ('e-s8e01','u-mindy'), ('e-s8e01','u-jessie'), ('e-s8e01','u-carissa');
INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title) VALUES
  ('v-s8e01-1', 'e-s8e01', 'u-jessie',  'Tracy Chapman',      'Tracy Chapman'),
  ('v-s8e01-2', 'e-s8e01', 'u-jeanne',  'Caamp',              'Lavender Days'),
  ('v-s8e01-3', 'e-s8e01', 'u-kristin', 'David Wax Museum',   'Everything Is Saved'),
  ('v-s8e01-4', 'e-s8e01', 'u-mindy',   'Prince',             'Purple Rain'),
  ('v-s8e01-5', 'e-s8e01', 'u-carissa', 'Gorillaz',           'The Mountain');
