# Carrier Agent Cockpit

[![CI](https://github.com/harshagarwal2412-cell/carrier-agent-cockpit/actions/workflows/ci.yml/badge.svg)](https://github.com/harshagarwal2412-cell/carrier-agent-cockpit/actions/workflows/ci.yml)

**Live demo:** https://harshagarwal2412-cell.github.io/carrier-agent-cockpit/

## Problem

AI agents now handle hundreds of thousands of freight-carrier conversations a day for brokerages. The easy metrics (calls handled, texts sent, carriers touched) go up whenever capacity is added, so they can't tell a busy agent from a good one.

The questions that matter are whether a conversation **moved a load, held the margin, and left a carrier who'd pick up again**. If the scoreboard rewards touches, the agent learns to spam.

## Solution

A measurement design and a working cockpit:

- **Metric tree:** one root metric (loads covered per rep-day, at target margin, with no human touch) and four branches (Reach, Convert, Retain, Trust). Each leaf metric names the way it can go green while the business gets worse.
- **Cockpit:**
  - segment filter (owner-operator, small fleet, mid fleet)
  - KPI tiles
  - coverage funnel with stage drop-offs
  - autonomy vs. escalation trend
  - D30 repeat-book cohorts
  - a failure taxonomy with an owner for each failure
- **Three first questions and a 90-day rollout plan:** instrument, fix the worst funnel drop, make it a playbook

**Key insight:** owner-operators and mid-size fleets are two different products sharing one dashboard. Mid fleets lose 68% of touches at *connect*, because a dispatcher answers instead of the driver. That's a workflow problem, not a conversation problem.

## Architecture

```
src/                          # TypeScript + React cockpit
├── domain/
│   ├── dashboard.ts          # Segment data, series, funnel math, worst-drop detection
│   └── dashboard.test.ts     # Vitest suite
└── components/Cockpit.tsx    # Segment filter, tiles, funnel, SVG trend chart, cohort bars
pipeline/                     # Python + SQL metrics pipeline (see below)
scripts/export-targets.ts     # Exports the dashboard's figures for the pipeline tests
```

## Metrics pipeline (Python + SQL)

[`pipeline/`](pipeline/) computes **every number on the cockpit with SQL from event-level data**: 40,000 outbound touches, 2,980 bookings, 2,400 carriers and a 250-call QA sample. See [`pipeline/report.ipynb`](pipeline/report.ipynb) for the full analysis.

- `generate.py` builds a deterministic synthetic brokerage with exact funnel counts, quantile-exact time-to-cover (inverse-CDF sampling), and a numerically solved segment mix.
- 7 SQL queries build the metric tree:
  - median and p90 time-to-cover from window functions
  - the worst funnel drop per segment, with `RANK()`
  - cohort repeat rates
  - the failure taxonomy
- pytest asserts that the SQL output **equals the dashboard**, and CI regenerates the data to prove it's reproducible.

![Funnel by segment](pipeline/figures/funnel_by_segment.png)

## Testing

- **TypeScript (Vitest):** 8 tests cover funnel normalization and drop-offs, worst-drop detection per segment, series direction, and tile/series consistency.
- **Python (pytest):** 15 tests confirm the SQL reproduces every dashboard figure, and that the schema rejects impossible funnels.

```bash
npm install && npm test && npm run dev
pip install -r pipeline/requirements.txt && pytest pipeline
```

CI runs both suites on every push. `main` deploys to GitHub Pages.

## Tech stack

**Languages:** TypeScript · Python · SQL

React 18 · Vite · Vitest · pandas · matplotlib · SQLite · pytest · Jupyter · GitHub Actions · GitHub Pages

## Data

All figures are illustrative and generated to make the structure clear. None of it is FleetWorks' data. Public context (funding, brokerage count, rep throughput, carrier-first positioning) comes from TechCrunch, FreightCaviar and a Freight Pod interview. Not affiliated with or endorsed by FleetWorks.

---

Harsh Agarwal
