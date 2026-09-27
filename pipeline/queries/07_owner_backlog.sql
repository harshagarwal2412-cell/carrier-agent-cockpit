-- Question: Which team owns the most sampled failures? (the taxonomy turned into a backlog)
SELECT owner, COUNT(*) AS calls, GROUP_CONCAT(DISTINCT failure_mode) AS failure_modes,
       ROUND(SUM(load_value_usd)) AS load_value_at_risk_usd
FROM call_reviews
GROUP BY owner
ORDER BY calls DESC;
