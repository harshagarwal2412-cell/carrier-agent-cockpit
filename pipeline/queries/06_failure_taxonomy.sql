-- Question: Where do conversations break, what does it cost, and who owns the fix?
SELECT
    failure_mode,
    COUNT(*)                                                 AS calls,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)       AS pct_of_sample,
    cost,
    owner,
    ROUND(SUM(load_value_usd))                               AS load_value_at_risk_usd
FROM call_reviews
GROUP BY failure_mode
ORDER BY calls DESC;
