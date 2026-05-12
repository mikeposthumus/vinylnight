-- Migration 0007: Add play_order to episode_vinyls and backfill historical data
-- play_order is the position in which an album was played during the episode (1 = first, etc.)

ALTER TABLE episode_vinyls ADD COLUMN play_order INTEGER;

-- ── Season 1 ─────────────────────────────────────────────────────────────────

-- S1E01 May 2019: Ben=1, Mike=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e01' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e01' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e01' AND contributed_by = 'u-chris';

-- S1E02 June 2019: Ben=1, Mike=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e02' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e02' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e02' AND contributed_by = 'u-chris';

-- S1E03 July 2019: Mike=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e03' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e03' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e03' AND contributed_by = 'u-chris';

-- S1E04 September 2019: Chris=1, Mike=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e04' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e04' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e04' AND contributed_by = 'u-ben';

-- S1E05 October 2019: Ben=1, Chris=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e05' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e05' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e05' AND contributed_by = 'u-kevin';

-- S1E06 November 2019: Ben=1, Mike=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e06' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e06' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e06' AND contributed_by = 'u-chris';

-- S1E07 December 2019: Ben=1, Mike=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e07' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e07' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e07' AND contributed_by = 'u-kevin';

-- S1E08 January 2020: Mike=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e08' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e08' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e08' AND contributed_by = 'u-ben';

-- S1E09 February 2020: Chris=1, Kevin=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e09' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e09' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e09' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S1E10 March 2020: Mike=1, Seth=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e10' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e10' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e10' AND contributed_by = 'u-ben';

-- S1E11 April 2020: Ben=1, Mike=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s1e11' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s1e11' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s1e11' AND contributed_by = 'u-kevin';

-- ── Season 2 ─────────────────────────────────────────────────────────────────

-- S2E01 May 2020: Ben=1, Chris=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e01' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e01' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e01' AND contributed_by = 'u-kevin';

-- S2E02 June 2020: Mike=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e02' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e02' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e02' AND contributed_by = 'u-chris';

-- S2E03 July 2020 (first): Chris=1, Ben=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e03' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e03' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e03' AND contributed_by = 'u-kevin';

-- S2E04 July 2020 (second): Ben=1, Kevin=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e04' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e04' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e04' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S2E05 August 2020: Chris=1, Kevin=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e05' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e05' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e05' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S2E06 September 2020: Jeanne=1, Kristin=2, Mindy=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e06' AND contributed_by = 'u-jeanne';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e06' AND contributed_by = 'u-kristin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e06' AND contributed_by = 'u-mindy';

-- S2E07 October 2020: Seth=1, Mike=2, Ben=3, Chris=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e07' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e07' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e07' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s2e07' AND contributed_by = 'u-chris';

-- S2E08 November 2020: Kevin=1, Mike=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e08' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e08' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e08' AND contributed_by = 'u-ben';

-- S2E09 December 2020: Chris=1, Mike=2, Kevin=3, Seth=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e09' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e09' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e09' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s2e09' AND contributed_by = 'u-seth';

-- S2E10 January 2021: Ben=1, Chris=2, Seth=3, Kevin=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e10' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e10' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e10' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s2e10' AND contributed_by = 'u-kevin';

-- S2E11 February 2021: Ben=1, Seth=2, Chris=3, Mike=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e11' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e11' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e11' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s2e11' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S2E12 March 2021 (first): Ben=1, Mike=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e12' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e12' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e12' AND contributed_by = 'u-chris';

-- S2E13 March 2021 (second): Mike=1, Kevin=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e13' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e13' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e13' AND contributed_by = 'u-ben';

-- S2E14 April 2021: Kevin=1, Seth=2, Chris=3, Mike=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s2e14' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s2e14' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s2e14' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s2e14' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- ── Season 3 ─────────────────────────────────────────────────────────────────

-- S3E01 May 2021: Jeanne=1, Seth=2, Kevin=3, Chris=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e01' AND contributed_by = 'u-jeanne';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e01' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e01' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s3e01' AND contributed_by = 'u-chris';

-- S3E02 June 2021: Ben=1, Chris=2, Seth=3, Mike=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e02' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e02' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e02' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s3e02' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S3E03 July 2021: Kevin=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e03' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e03' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e03' AND contributed_by = 'u-chris';

-- S3E04 August 2021: Kevin=1, Seth=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e04' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e04' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e04' AND contributed_by = 'u-ben';

-- S3E05 September 2021: Seth=1, Mike=2, Chris=3, Kevin=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e05' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e05' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e05' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s3e05' AND contributed_by = 'u-kevin';

-- S3E06 October 2021: Ben=1, Chris=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e06' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e06' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e06' AND contributed_by = 'u-kevin';

-- S3E07 November 2021: Seth=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e07' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e07' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e07' AND contributed_by = 'u-chris';

-- S3E08 December 2021: Mike=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e08' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e08' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e08' AND contributed_by = 'u-chris';

-- S3E09 January 2022: Kevin=1, Mike=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e09' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e09' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e09' AND contributed_by = 'u-seth';

-- S3E10 February 2022: Kevin=1, Seth=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e10' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e10' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e10' AND contributed_by = 'u-ben';

-- S3E11 March 2022: Chris=1, Ben=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e11' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e11' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e11' AND contributed_by = 'u-seth';

-- S3E12 April 2022: Seth=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s3e12' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s3e12' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s3e12' AND contributed_by = 'u-chris';

-- ── Season 4 ─────────────────────────────────────────────────────────────────

-- S4E01 May 2022: Chris=1, Ben=2 (Kevin had no order recorded)
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e01' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e01' AND contributed_by = 'u-ben';

-- S4E02 June 2022: Mike=1, Kevin=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e02' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e02' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e02' AND contributed_by = 'u-ben';

-- S4E03 July 2022: Seth=1, Mike=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e03' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e03' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e03' AND contributed_by = 'u-kevin';

-- S4E04 August 2022: Seth=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e04' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e04' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e04' AND contributed_by = 'u-ben';

-- S4E05 September 2022: Ben=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e05' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e05' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e05' AND contributed_by = 'u-chris';

-- S4E06 October 2022: Ben=1, Chris=2, Mike=3, Kevin=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e06' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e06' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e06' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s4e06' AND contributed_by = 'u-kevin';

-- S4E07 November 2022: Kevin=1, Ben=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e07' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e07' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e07' AND contributed_by = 'u-seth';

-- S4E08 December 2022: Seth=1, Kevin=2, Mike=3, Chris=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e08' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e08' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e08' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s4e08' AND contributed_by = 'u-chris';

-- S4E09 January 2023: Mike=1, Chris=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e09' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e09' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e09' AND contributed_by = 'u-seth';

-- S4E10 February 2023: Ben=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e10' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e10' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e10' AND contributed_by = 'u-chris';

-- S4E11 March 2023: Seth=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e11' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e11' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e11' AND contributed_by = 'u-chris';

-- S4E12 April 2023: Kevin=1, Ben=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s4e12' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s4e12' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s4e12' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- ── Season 5 ─────────────────────────────────────────────────────────────────

-- S5E01 May 2023: Chris=1, Mike=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e01' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e01' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e01' AND contributed_by = 'u-kevin';

-- S5E02 June 2023: Ben=1, Seth=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e02' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e02' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e02' AND contributed_by = 'u-chris';

-- S5E03 July 2023: Chris=1, Kevin=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e03' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e03' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e03' AND contributed_by = 'u-ben';

-- S5E04 August 2023 (unofficial): Seth=1, Chris=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e04' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e04' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e04' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S5E05 August 2023 (regular): Kevin=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e05' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e05' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e05' AND contributed_by = 'u-chris';

-- S5E06 September 2023: Seth=1, Ben=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e06' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e06' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e06' AND contributed_by = 'u-kevin';

-- S5E07 October 2023: Kevin=1, Chris=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e07' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e07' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e07' AND contributed_by = 'u-seth';

-- S5E08 November 2023: Ben=1, Seth=2, Chris=3, Kevin=4, Mike=5
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e08' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e08' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e08' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s5e08' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 5 WHERE episode_id = 'e-s5e08' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S5E09 December 2023: Chris=1, Seth=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e09' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e09' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e09' AND contributed_by = 'u-ben';

-- S5E10 January 2024: Mike=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e10' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e10' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e10' AND contributed_by = 'u-ben';

-- S5E11 February 2024: Mike=1, Kevin=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e11' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e11' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e11' AND contributed_by = 'u-ben';

-- S5E12 March 2024: Seth=1, Mike=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e12' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e12' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e12' AND contributed_by = 'u-kevin';

-- S5E13 April 2024: Seth=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s5e13' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s5e13' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s5e13' AND contributed_by = 'u-ben';

-- ── Season 6 ─────────────────────────────────────────────────────────────────

-- S6E01 May 2024: Chris=1, Seth=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e01' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e01' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e01' AND contributed_by = 'u-ben';

-- S6E02 June 2024: Kevin=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e02' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e02' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e02' AND contributed_by = 'u-chris';

-- S6E03 July 2024: no order data recorded

-- S6E04 August 2024: Mike=1, Seth=2, Ben=3, Chris=4, Kevin=5
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e04' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e04' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e04' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s6e04' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 5 WHERE episode_id = 'e-s6e04' AND contributed_by = 'u-kevin';

-- S6E05 September 2024: Ben=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e05' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e05' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e05' AND contributed_by = 'u-chris';

-- S6E06 October 2024: Chris=1, Ben=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e06' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e06' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e06' AND contributed_by = 'u-kevin';

-- S6E07 November 2024: Ben=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e07' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e07' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e07' AND contributed_by = 'u-chris';

-- S6E08 December 2024: Kevin=1, Mike=2, Ben=3 (Ben brought two Sufjan albums, both share order 3)
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e08' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e08' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e08' AND contributed_by = 'u-ben';

-- S6E09 January 2025: Mike=1, Kevin=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e09' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e09' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e09' AND contributed_by = 'u-seth';

-- S6E10 February 2025: Jim=1, Chris=2, Ben=3, Seth=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e10' AND contributed_by = 'u-jim';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e10' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e10' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s6e10' AND contributed_by = 'u-seth';

-- S6E11 March 2025: Chris=1, Seth=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e11' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e11' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e11' AND contributed_by = 'u-kevin';

-- S6E12 April 2025: Mike=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s6e12' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s6e12' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s6e12' AND contributed_by = 'u-ben';

-- ── Season 7 ─────────────────────────────────────────────────────────────────

-- S7E01 May 2025: Mike=1, Kevin=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e01' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e01' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e01' AND contributed_by = 'u-ben';

-- S7E02 June 2025: Ben=1, Chris=2, Kevin=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e02' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e02' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e02' AND contributed_by = 'u-kevin';

-- S7E03 July 2025: Kevin=1, Seth=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e03' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e03' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e03' AND contributed_by = 'u-chris';

-- S7E04 August 2025: Seth=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e04' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e04' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e04' AND contributed_by = 'u-ben';

-- S7E05 September 2025: Chris=1, Ben=2, Seth=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e05' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e05' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e05' AND contributed_by = 'u-seth';

-- S7E06 October 2025: Mike=1, Ben=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e06' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e06' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e06' AND contributed_by = 'u-chris';

-- S7E07 November 2025: Chris=1, Mike=2, Ben=3, Seth=4
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e07' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e07' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e07' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s7e07' AND contributed_by = 'u-seth';

-- S7E08 December 2025: Kevin=1, Chris=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e08' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e08' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e08' AND contributed_by = 'u-ben';

-- S7E09 January 2026: Seth=1, Chris=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e09' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e09' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e09' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- S7E10 February 2026: Chris=1, Seth=2, Ben=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e10' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e10' AND contributed_by = 'u-seth';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e10' AND contributed_by = 'u-ben';

-- S7E11 March 2026: Ben=1, Kevin=2, Chris=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e11' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e11' AND contributed_by = 'u-kevin';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e11' AND contributed_by = 'u-chris';

-- S7E12 April 2026: Chris=1, Ben=2, Mike=3
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s7e12' AND contributed_by = 'u-chris';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s7e12' AND contributed_by = 'u-ben';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s7e12' AND contributed_by = '285cd74d-ba4a-4f61-9f22-ff62b3bc1726';

-- ── Season 8 ─────────────────────────────────────────────────────────────────

-- S8E01 May 2026: Jessie=1, Jeanne=2, Kristin=3, Mindy=4, Carissa=5
UPDATE episode_vinyls SET play_order = 1 WHERE episode_id = 'e-s8e01' AND contributed_by = 'u-jessie';
UPDATE episode_vinyls SET play_order = 2 WHERE episode_id = 'e-s8e01' AND contributed_by = 'u-jeanne';
UPDATE episode_vinyls SET play_order = 3 WHERE episode_id = 'e-s8e01' AND contributed_by = 'u-kristin';
UPDATE episode_vinyls SET play_order = 4 WHERE episode_id = 'e-s8e01' AND contributed_by = 'u-mindy';
UPDATE episode_vinyls SET play_order = 5 WHERE episode_id = 'e-s8e01' AND contributed_by = 'u-carissa';
