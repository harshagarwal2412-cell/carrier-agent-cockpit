-- Question: Do carriers come back? (D30 repeat-book rate by week of first booking)
SELECT
    'W' || first_booking_week                       AS cohort,
    COUNT(*)                                        AS carriers,
    ROUND(100.0 * AVG(rebooked_within_30d))         AS d30_repeat_pct,
    ROUND(100.0 * AVG(CASE WHEN segment = 'oo' THEN rebooked_within_30d END)) AS owner_op_pct,
    ROUND(100.0 * AVG(CASE WHEN segment = 'mf' THEN rebooked_within_30d END)) AS mid_fleet_pct
FROM carriers
GROUP BY first_booking_week
ORDER BY first_booking_week;
