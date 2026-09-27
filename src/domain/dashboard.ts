/**
 * Illustrative dashboard figures. The Python pipeline in /pipeline regenerates
 * these from event-level data with SQL, and its tests assert the two agree.
 * The all-carrier tiles are the segment blend the pipeline computes.
 */

export type Segment = "all" | "oo" | "sf" | "mf";
export type Trend = "up" | "flat" | "down";

export interface Tile {
  t: string;
  v: string;
  d: string;
  c: Trend;
}

export interface SegmentData {
  label: string;
  tiles: Tile[];
  /** Per 1,000 outbound touches: [touches(unused), connected, qualified fit, rate quoted, booked]. */
  funnel: number[];
}

export const SEGMENTS: { id: Segment; label: string }[] = [
  { id: "all", label: "All carriers" },
  { id: "oo", label: "Owner-operator (1–5)" },
  { id: "sf", label: "Small fleet (6–30)" },
  { id: "mf", label: "Mid fleet (31+)" },
];

export const DATA: Record<Segment, SegmentData> = {
  all: {
    label: "All carriers",
    tiles: [
      { t: "Loads covered / rep-day", v: "75", d: "+11 vs. Q prior", c: "up" },
      { t: "Covered with no human", v: "62%", d: "+13 pts / 12 wk", c: "up" },
      { t: "Median time to cover", v: "35m", d: "p90 · 2h 39m", c: "flat" },
      { t: "D30 repeat-book rate", v: "34%", d: "+2 pts / 12 wk", c: "up" },
      { t: "Rate delta vs. target", v: "+1.5%", d: "over target buy", c: "down" },
    ],
    funnel: [176, 412, 268, 190, 75],
  },
  oo: {
    label: "Owner-operator (1–5 trucks)",
    tiles: [
      { t: "Loads covered / rep-day", v: "82", d: "+14 vs. Q prior", c: "up" },
      { t: "Covered with no human", v: "67%", d: "+15 pts / 12 wk", c: "up" },
      { t: "Median time to cover", v: "31m", d: "p90 · 2h 09m", c: "flat" },
      { t: "D30 repeat-book rate", v: "41%", d: "+5 pts / 12 wk", c: "up" },
      { t: "Rate delta vs. target", v: "+0.9%", d: "over target buy", c: "flat" },
    ],
    funnel: [176, 468, 274, 205, 81],
  },
  sf: {
    label: "Small fleet (6–30 trucks)",
    tiles: [
      { t: "Loads covered / rep-day", v: "77", d: "+9 vs. Q prior", c: "up" },
      { t: "Covered with no human", v: "60%", d: "+12 pts / 12 wk", c: "up" },
      { t: "Median time to cover", v: "36m", d: "p90 · 2h 44m", c: "flat" },
      { t: "D30 repeat-book rate", v: "33%", d: "+1 pt / 12 wk", c: "flat" },
      { t: "Rate delta vs. target", v: "+1.6%", d: "over target buy", c: "down" },
    ],
    funnel: [176, 401, 281, 196, 79],
  },
  mf: {
    label: "Mid fleet (31+ trucks)",
    tiles: [
      { t: "Loads covered / rep-day", v: "64", d: "+4 vs. Q prior", c: "flat" },
      { t: "Covered with no human", v: "48%", d: "+6 pts / 12 wk", c: "up" },
      { t: "Median time to cover", v: "54m", d: "p90 · 4h 12m", c: "down" },
      { t: "D30 repeat-book rate", v: "22%", d: "−1 pt / 12 wk", c: "down" },
      { t: "Rate delta vs. target", v: "+3.1%", d: "over target buy", c: "down" },
    ],
    funnel: [176, 318, 226, 148, 51],
  },
};

export const STAGES = ["Outbound touches", "Connected", "Qualified fit", "Rate quoted", "Booked"];
export const FUNNEL_COLORS = ["var(--s1)", "var(--s1)", "var(--s3)", "var(--s2)", "var(--accent)"];

export const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
/** % of loads booked with no human touch, by week. */
export const AUTONOMY = [49, 49, 51, 50, 53, 55, 55, 57, 59, 60, 61, 62];
/** % of conversations escalated to a human, by week. */
export const ESCALATION = [19.5, 19.1, 18.4, 18.8, 17.2, 16.4, 16.9, 15.1, 14.4, 13.8, 13.0, 12.4];

/** D30 repeat-book rate by first-booking cohort week. */
export const COHORTS = [
  { l: "W1", v: 29 },
  { l: "W2", v: 31 },
  { l: "W3", v: 30 },
  { l: "W4", v: 35 },
  { l: "W5", v: 37 },
  { l: "W6", v: 34 },
];

export interface FunnelStage {
  stage: string;
  count: number;
  pctOfTop: number;
  /** Drop from the previous stage, 0–100, null for the first stage. */
  dropPct: number | null;
}

/** Funnel normalized to 1,000 outbound touches, with stage-to-stage drop-off. */
export function funnelStages(seg: Segment): FunnelStage[] {
  const f = [...DATA[seg].funnel];
  f[0] = 1000;
  return f.map((count, i) => ({
    stage: STAGES[i],
    count,
    pctOfTop: (count / 1000) * 100,
    dropPct: i === 0 ? null : Math.round((1 - count / f[i - 1]) * 100),
  }));
}

/** The stage with the worst drop-off: where the next sprint goes for this segment. */
export function worstDrop(seg: Segment): FunnelStage {
  return funnelStages(seg)
    .slice(1)
    .reduce((a, b) => ((b.dropPct ?? 0) > (a.dropPct ?? 0) ? b : a));
}
