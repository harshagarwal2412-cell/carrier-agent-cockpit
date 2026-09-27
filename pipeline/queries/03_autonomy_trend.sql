-- Question: Week by week, what share of bookings needed no human, and what share of conversations escalated?
SELECT
    b.week,
    ROUND(100.0 * SUM(b.human_touched = 0) / COUNT(*), 1)  AS pct_booked_no_human,
    e.pct_escalated
FROM bookings b
JOIN (
    SELECT week, ROUND(100.0 * SUM(escalated) / SUM(connected), 1) AS pct_escalated
    FROM touches WHERE connected = 1 GROUP BY week
) e USING (week)
GROUP BY b.week
ORDER BY b.week;
