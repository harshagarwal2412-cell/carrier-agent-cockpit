-- Question: Per 1,000 outbound touches, how many connect, fit, get quoted, and book, by carrier segment?
WITH by_seg AS (
    SELECT segment, COUNT(*) AS touches, SUM(connected) AS connected, SUM(qualified) AS qualified,
           SUM(quoted) AS quoted, SUM(booked) AS booked
    FROM touches GROUP BY segment
    UNION ALL
    SELECT 'all', COUNT(*), SUM(connected), SUM(qualified), SUM(quoted), SUM(booked) FROM touches
)
SELECT
    segment,
    touches,
    ROUND(1000.0 * connected / touches) AS connected_per_1k,
    ROUND(1000.0 * qualified / touches) AS qualified_per_1k,
    ROUND(1000.0 * quoted    / touches) AS quoted_per_1k,
    ROUND(1000.0 * booked    / touches) AS booked_per_1k
FROM by_seg
ORDER BY CASE segment WHEN 'all' THEN 0 WHEN 'oo' THEN 1 WHEN 'sf' THEN 2 ELSE 3 END;
