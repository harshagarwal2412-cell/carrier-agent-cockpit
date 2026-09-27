import { describe, expect, it } from "vitest";
import { AUTONOMY, COHORTS, DATA, ESCALATION, SEGMENTS, WEEKS, funnelStages, worstDrop } from "./dashboard";

describe("dashboard data", () => {
  it("has five tiles and a five-stage funnel for every segment", () => {
    for (const s of SEGMENTS) {
      expect(DATA[s.id].tiles).toHaveLength(5);
      expect(DATA[s.id].funnel).toHaveLength(5);
    }
  });

  it("every funnel is monotonically non-increasing after normalization", () => {
    for (const s of SEGMENTS) {
      const counts = funnelStages(s.id).map((f) => f.count);
      for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });

  it("time series cover 12 weeks and move in the healthy direction", () => {
    expect(AUTONOMY).toHaveLength(WEEKS.length);
    expect(ESCALATION).toHaveLength(WEEKS.length);
    expect(AUTONOMY.at(-1)!).toBeGreaterThan(AUTONOMY[0]);
    expect(ESCALATION.at(-1)!).toBeLessThan(ESCALATION[0]);
  });

  it("the autonomy tile matches the last week of the series", () => {
    expect(DATA.all.tiles[1].v).toBe(`${AUTONOMY.at(-1)}%`);
  });

  it("cohort values are percentages", () => {
    for (const c of COHORTS) {
      expect(c.v).toBeGreaterThan(0);
      expect(c.v).toBeLessThan(100);
    }
  });
});

describe("funnel math", () => {
  it("normalizes to 1,000 touches and computes stage drops", () => {
    const f = funnelStages("all");
    expect(f[0]).toMatchObject({ count: 1000, pctOfTop: 100, dropPct: null });
    expect(f[1].dropPct).toBe(59); // 1000 → 412
    expect(f[4].dropPct).toBe(61); // 191 → 74
  });

  it("finds each segment's worst drop — the roadmap priority", () => {
    expect(worstDrop("all").stage).toBe("Booked");
    expect(worstDrop("mf").stage).toBe("Connected"); // mid fleets route through dispatchers
    expect(worstDrop("mf").dropPct).toBe(68);
  });

  it("mid fleets convert worst end to end", () => {
    const booked = (s: "oo" | "sf" | "mf") => funnelStages(s).at(-1)!.count;
    expect(booked("mf")).toBeLessThan(booked("sf"));
    expect(booked("sf")).toBeLessThan(booked("oo"));
  });
});
