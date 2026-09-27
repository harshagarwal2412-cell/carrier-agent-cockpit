import { AUTONOMY, COHORTS, DATA, ESCALATION, FUNNEL_COLORS, SEGMENTS, WEEKS, funnelStages, type Segment } from "../domain/dashboard";

export function SegmentFilter({ seg, onChange }: { seg: Segment; onChange: (s: Segment) => void }) {
  return (
    <div className="seg" role="group" aria-label="Carrier segment filter">
      {SEGMENTS.map((s) => (
        <button key={s.id} type="button" aria-pressed={seg === s.id} onClick={() => onChange(s.id)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function Tiles({ seg }: { seg: Segment }) {
  return (
    <div className="tiles">
      {DATA[seg].tiles.map((t) => (
        <div className="tile" key={t.t}>
          <div className="t">{t.t}</div>
          <div className="tile-val">{t.v}</div>
          <div className={`delta ${t.c}`}>{t.d}</div>
        </div>
      ))}
    </div>
  );
}

export function Funnel({ seg }: { seg: Segment }) {
  const stages = funnelStages(seg);
  return (
    <div className="funnel">
      {stages.map((s, i) => (
        <div key={s.stage} className={`frow${i === stages.length - 1 ? " hl" : ""}`}>
          <div className="fl">{s.stage}</div>
          <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <div className="ftrack" style={{ flex: 1, overflow: "visible" }}>
              <div
                className={`fbar${s.pctOfTop < 14 ? " outside" : ""}`}
                style={{ width: `${s.pctOfTop.toFixed(1)}%`, background: FUNNEL_COLORS[i] }}
              >
                <span>{s.count.toLocaleString()}</span>
              </div>
            </div>
            <div className="fdrop">{s.dropPct === null ? "" : `−${s.dropPct}%`}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const MONO = "IBM Plex Mono, monospace";

/** Autonomous booking vs. escalation, same unit on one axis. */
export function AutonomyChart() {
  const W = 520;
  const H = 240;
  const PL = 38;
  const PR = 14;
  const PT = 14;
  const PB = 28;
  const iw = W - PL - PR;
  const ih = H - PT - PB;
  const maxY = 70;
  const x = (i: number) => PL + (i / (WEEKS.length - 1)) * iw;
  const y = (v: number) => PT + ih - (v / maxY) * ih;
  const path = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = WEEKS.length - 1;

  return (
    <svg
      className="lc"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Autonomous coverage rising from ${AUTONOMY[0]} to ${AUTONOMY[last]} percent while escalation falls from ${ESCALATION[0]} to ${ESCALATION[last]} percent over twelve weeks`}
    >
      {[0, 20, 40, 60].map((v) => (
        <g key={v}>
          <line x1={PL} y1={y(v)} x2={W - PR} y2={y(v)} stroke="var(--line-soft)" strokeWidth={1} />
          <text x={PL - 8} y={y(v) + 4} textAnchor="end" fontFamily={MONO} fontSize="10" fill="var(--ink-3)">
            {v}
          </text>
        </g>
      ))}
      {[0, 3, 6, 9, 11].map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontFamily={MONO} fontSize="10" fill="var(--ink-3)">
          {WEEKS[i]}
        </text>
      ))}
      <path d={path(AUTONOMY)} fill="none" stroke="var(--s1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(ESCALATION)} fill="none" stroke="var(--s2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last)} cy={y(AUTONOMY[last])} r={4.5} fill="var(--s1)" stroke="var(--card)" strokeWidth={2} />
      <circle cx={x(last)} cy={y(ESCALATION[last])} r={4.5} fill="var(--s2)" stroke="var(--card)" strokeWidth={2} />
      <text x={x(last) - 8} y={y(AUTONOMY[last]) - 10} textAnchor="end" fontFamily={MONO} fontSize="11" fontWeight="600" fill="var(--ink)">
        {AUTONOMY[last]}%
      </text>
      <text x={x(last) - 8} y={y(ESCALATION[last]) + 16} textAnchor="end" fontFamily={MONO} fontSize="11" fontWeight="600" fill="var(--ink)">
        {ESCALATION[last]}%
      </text>
    </svg>
  );
}

export function Cohort() {
  const max = 44;
  return (
    <div className="cohort">
      {COHORTS.map((c) => (
        <div className="cbar-wrap" key={c.l}>
          <div className="cv">{c.v}%</div>
          <div className="cbar" style={{ height: `${((c.v / max) * 148).toFixed(0)}px` }} />
          <div className="cl">{c.l}</div>
        </div>
      ))}
    </div>
  );
}
