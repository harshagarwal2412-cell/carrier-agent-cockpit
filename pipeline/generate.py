"""
Generate an event-level synthetic dataset for the carrier-agent cockpit.

The dashboard shows illustrative, aggregated numbers. This script produces the
raw events a real brokerage would have (carriers, loads, outbound touches,
bookings, sampled call reviews) so every dashboard number can be *computed* in
SQL instead of typed in. Generation is deterministic: exact stage counts, and
quantile-exact durations via inverse-CDF sampling, so the tests can pin values.

    python pipeline/generate.py
"""
from __future__ import annotations

import csv
import math
import random
from pathlib import Path
from statistics import NormalDist

OUT = Path(__file__).resolve().parent / "data"
SEED = 20260926
WEEKS = 12

# Segment mix of outbound touches (solved so the blended funnel matches the "all carriers" view).
SEGMENTS = {
    #        touches   per-1,000 funnel: connected, qualified, quoted, booked
    "oo": {"touches": 16_000, "funnel": (468, 274, 205, 81), "label": "Owner-operator (1-5)"},
    "sf": {"touches": 16_400, "funnel": (401, 281, 196, 79), "label": "Small fleet (6-30)"},
    "mf": {"touches": 7_600, "funnel": (318, 226, 148, 51), "label": "Mid fleet (31+)"},
}
# Share of loads booked with no human touch in the latest week, and the all-carrier weekly trend.
AUTONOMY_W12 = {"oo": 67, "sf": 60, "mf": 48}
AUTONOMY_TREND = [48, 49, 51, 50, 53, 55, 54, 57, 58, 59, 60, 61]
ESCALATION_TREND = [19.5, 19.1, 18.4, 18.8, 17.2, 16.4, 16.9, 15.1, 14.4, 13.8, 13.0, 12.4]
# Minutes from load posted to rate confirmation: (median, p90) per segment.
TIME_TO_COVER = {"oo": (31, 129), "sf": (36, 164), "mf": (54, 252)}
# Average % paid over the broker's target buy rate.
RATE_DELTA_PCT = {"oo": 0.9, "sf": 1.6, "mf": 3.1}
# D30 repeat-book rate by first-booking cohort week (W1-W6), overall; W6 by segment.
COHORT_REPEAT = [29, 31, 30, 35, 37, 34]
COHORT_W6_BY_SEGMENT = {"oo": 41, "sf": 33, "mf": 22}
COHORT_SIZE = 400
FAILURES = [  # (failure mode, sampled calls, cost, owner)
    ("Special instruction dropped", 68, "Fall-off / TONU", "Product"),
    ("Anchored high on a soft lane", 54, "Margin", "Pricing"),
    ("Equipment mismatch surfaced late", 41, "Wasted call", "Matching"),
    ("Carrier abandoned during vetting", 39, "Lost supply", "Trust & safety"),
    ("Agent looped, carrier hung up", 27, "Carrier trust", "Product"),
    ("Escalated, no human available", 21, "Coverage delay", "Ops"),
]
SEG_MIX = {"oo": 0.40, "sf": 0.41, "mf": 0.19}


def exact_flags(n: int, k: int, rng: random.Random) -> list[bool]:
    """Exactly k True values out of n, shuffled."""
    flags = [True] * k + [False] * (n - k)
    rng.shuffle(flags)
    return flags


def lognormal_quantiles(n: int, median: float, p90: float, rng: random.Random) -> list[float]:
    """n values whose empirical median and 90th percentile match the targets (inverse-CDF, evenly spaced)."""
    mu = math.log(median)
    sigma = math.log(p90 / median) / NormalDist().inv_cdf(0.9)
    values = [math.exp(mu + sigma * NormalDist().inv_cdf((i + 0.5) / n)) for i in range(n)]
    rng.shuffle(values)
    return values


def write(name: str, rows: list[dict]) -> None:
    with (OUT / name).open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {name} ({len(rows):,} rows)")


def main() -> None:
    rng = random.Random(SEED)
    OUT.mkdir(parents=True, exist_ok=True)

    write("segments.csv", [{"segment": s, "label": v["label"]} for s, v in SEGMENTS.items()])

    touches, bookings = [], []
    touch_id = booking_id = 0
    for seg, cfg in SEGMENTS.items():
        n = cfg["touches"]
        c, q, r, b = (round(n * x / 1000) for x in cfg["funnel"])
        # Nested funnel: each stage is an exact subset of the previous one.
        order = list(range(n))
        rng.shuffle(order)
        stage = {i: 0 for i in range(n)}
        for depth, k in enumerate((c, q, r, b), start=1):
            for i in order[:k]:
                stage[i] = depth
        weeks = [i % WEEKS + 1 for i in range(n)]
        rng.shuffle(weeks)
        # Escalations: among connected conversations, the weekly all-carrier escalation rate.
        for i in range(n):
            touch_id += 1
            touches.append({
                "touch_id": touch_id, "segment": seg, "week": weeks[i],
                "connected": int(stage[i] >= 1), "qualified": int(stage[i] >= 2),
                "quoted": int(stage[i] >= 3), "booked": int(stage[i] >= 4), "escalated": 0,
            })

        booked = [t for t in touches if t["segment"] == seg and t["booked"]]
        minutes = lognormal_quantiles(len(booked), *TIME_TO_COVER[seg], rng)
        # Autonomy: per week, the segment's W12 rate shifted along the all-carrier trend.
        by_week: dict[int, list[dict]] = {}
        for t in booked:
            by_week.setdefault(t["week"], []).append(t)
        human = {}
        for w, items in by_week.items():
            rate = AUTONOMY_W12[seg] + (AUTONOMY_TREND[w - 1] - AUTONOMY_TREND[-1])
            flags = exact_flags(len(items), round(len(items) * rate / 100), rng)
            for t, autonomous in zip(items, flags):
                human[t["touch_id"]] = int(not autonomous)
        # Rate paid vs. target: spread around the segment mean, mean preserved exactly.
        spread = [rng.gauss(0, 1.2) for _ in booked]
        shift = RATE_DELTA_PCT[seg] - sum(spread) / len(spread)
        for t, mins, d in zip(booked, minutes, spread):
            booking_id += 1
            bookings.append({
                "booking_id": booking_id, "touch_id": t["touch_id"], "segment": seg, "week": t["week"],
                "minutes_to_cover": round(mins, 2), "human_touched": human[t["touch_id"]],
                "target_rate_usd": 2000, "booked_rate_usd": round(2000 * (1 + (d + shift) / 100), 4),
            })

    # Weekly escalation rate across all connected conversations.
    for w in range(1, WEEKS + 1):
        conn = [t for t in touches if t["week"] == w and t["connected"]]
        for t, esc in zip(conn, exact_flags(len(conn), round(len(conn) * ESCALATION_TREND[w - 1] / 100), rng)):
            t["escalated"] = int(esc)

    write("touches.csv", touches)
    write("bookings.csv", bookings)

    # Carrier cohorts by week of first booking, with a D30 repeat flag.
    carriers, carrier_id = [], 0
    for wk, rate in enumerate(COHORT_REPEAT, start=1):
        seg_counts = {s: round(COHORT_SIZE * m) for s, m in SEG_MIX.items()}
        if wk == len(COHORT_REPEAT):  # latest cohort carries the per-segment tile values
            seg_rates = COHORT_W6_BY_SEGMENT
        else:
            seg_rates = {s: rate for s in SEGMENTS}
        cohort = []
        for seg, n in seg_counts.items():
            for rep in exact_flags(n, round(n * seg_rates[seg] / 100), rng):
                carrier_id += 1
                cohort.append({"carrier_id": carrier_id, "segment": seg, "first_booking_week": wk,
                               "rebooked_within_30d": int(rep)})
        carriers += cohort
    write("carriers.csv", carriers)

    # QA sample of 250 calls, weighted to high-value loads.
    reviews, rid = [], 0
    for mode, n, cost, owner in FAILURES:
        for _ in range(n):
            rid += 1
            reviews.append({"review_id": rid, "failure_mode": mode, "cost": cost, "owner": owner,
                            "load_value_usd": round(rng.lognormvariate(math.log(3200), 0.35))})
    write("call_reviews.csv", reviews)


if __name__ == "__main__":
    main()
