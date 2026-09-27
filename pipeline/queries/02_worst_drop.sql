-- Question: Where does each segment lose the most carriers? (the stage with the worst drop is the next sprint)
WITH f AS (
    SELECT segment, COUNT(*) AS t, SUM(connected) AS c, SUM(qualified) AS q, SUM(quoted) AS r, SUM(booked) AS b
    FROM touches GROUP BY segment
),
drops AS (
    SELECT segment, 'Connected'     AS stage, 1.0 - 1.0 * c / t AS drop_rate FROM f UNION ALL
    SELECT segment, 'Qualified fit',          1.0 - 1.0 * q / c FROM f UNION ALL
    SELECT segment, 'Rate quoted',            1.0 - 1.0 * r / q FROM f UNION ALL
    SELECT segment, 'Booked',                 1.0 - 1.0 * b / r FROM f
),
ranked AS (
    SELECT *, RANK() OVER (PARTITION BY segment ORDER BY drop_rate DESC) AS rk FROM drops
)
SELECT s.label AS segment, r.stage AS worst_stage, ROUND(100 * r.drop_rate) AS drop_pct
FROM ranked r JOIN segments s USING (segment)
WHERE r.rk = 1
ORDER BY r.drop_rate DESC;
