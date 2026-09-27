-- Question: What are the cockpit tiles for each segment? (latest-week autonomy, time to cover, repeat rate, rate delta)
WITH ttc AS (
    SELECT segment, minutes_to_cover,
           ROW_NUMBER() OVER (PARTITION BY segment ORDER BY minutes_to_cover) AS rn,
           COUNT(*)     OVER (PARTITION BY segment)                           AS n
    FROM (SELECT segment, minutes_to_cover FROM bookings
          UNION ALL SELECT 'all', minutes_to_cover FROM bookings)
),
pctl AS (
    SELECT segment,
           AVG(CASE WHEN rn IN ((n + 1) / 2, (n + 2) / 2) THEN minutes_to_cover END) AS median_min,
           MAX(CASE WHEN rn = CAST(0.9 * n + 0.999999 AS INTEGER) THEN minutes_to_cover END) AS p90_min  -- nearest-rank p90
    FROM ttc GROUP BY segment
),
auton AS (
    SELECT segment, ROUND(100.0 * SUM(human_touched = 0) / COUNT(*)) AS pct_no_human_w12
    FROM (SELECT segment, week, human_touched FROM bookings UNION ALL SELECT 'all', week, human_touched FROM bookings)
    WHERE week = 12 GROUP BY segment
),
repeat AS (
    SELECT segment, ROUND(100.0 * AVG(rebooked_within_30d)) AS d30_repeat_pct
    FROM (SELECT segment, first_booking_week, rebooked_within_30d FROM carriers
          UNION ALL SELECT 'all', first_booking_week, rebooked_within_30d FROM carriers)
    WHERE first_booking_week = (SELECT MAX(first_booking_week) FROM carriers)
    GROUP BY segment
),
margin AS (
    SELECT segment, ROUND(100.0 * AVG((booked_rate_usd - target_rate_usd) / target_rate_usd), 1) AS rate_delta_pct
    FROM (SELECT segment, booked_rate_usd, target_rate_usd FROM bookings
          UNION ALL SELECT 'all', booked_rate_usd, target_rate_usd FROM bookings)
    GROUP BY segment
)
SELECT a.segment, a.pct_no_human_w12, ROUND(p.median_min) AS median_min_to_cover, ROUND(p.p90_min) AS p90_min_to_cover,
       r.d30_repeat_pct, m.rate_delta_pct
FROM auton a
JOIN pctl p USING (segment)
JOIN repeat r USING (segment)
JOIN margin m USING (segment)
ORDER BY CASE a.segment WHEN 'all' THEN 0 WHEN 'oo' THEN 1 WHEN 'sf' THEN 2 ELSE 3 END;
