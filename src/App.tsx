import { useState } from "react";
import { AutonomyChart, Cohort, Funnel, SegmentFilter, Tiles } from "./components/Cockpit";
import type { Segment } from "./domain/dashboard";

export default function App() {
  const [seg, setSeg] = useState<Segment>("all");
  return (
    <>




<div className="topbar">
  <div className="topbar-in">
    <span className="badge">Independent case study · not affiliated with FleetWorks</span>
    <span className="who">Harsh Agarwal</span>
  </div>
</div>

<div className="wrap">

  <header className="hero">
    <div className="eyebrow">Case study · AI agents in freight brokerage</div>
    <h1>Carrier Agent Cockpit</h1>
    <div className="hero-rule"></div>
    <p className="lead">At hundreds of thousands of AI conversations a day with carriers, the instrumentation question isn't <em>did the agent answer the phone</em> — it's <strong>did this conversation move a load, hold the margin, and leave a carrier who'd pick up again.</strong> This is a scoreboard built to answer that, and the three questions to point it at first.</p>
    <div className="hero-meta">
      <span><b>Built by</b> Harsh Agarwal</span>
      <span><b>Data</b> illustrative, not FleetWorks'</span>
      <span><b>Read time</b> ~4 min</span>
    </div>
  </header>

  <section id="thesis">
    <div className="sec-head">
      <div className="eyebrow">01 — The premise</div>
      <h2>Two numbers get conflated at this scale</h2>
      <p className="lead">Reps went from covering 20–30 loads a day to 75+. The first jump came from removing dials. The next one comes from conversation quality — and you can only manage that if the two are measured separately.</p>
    </div>
    <div className="thesis">
      <div className="card vol">
        <div className="k">What's easy to measure</div>
        <div className="big">Volume</div>
        <p>Calls handled, texts sent, carriers touched. Goes up when you add capacity. Says nothing about whether the load got covered or whether the carrier enjoyed it. A busy agent and a good agent look identical here.</p>
      </div>
      <div className="card cov">
        <div className="k">What actually compounds</div>
        <div className="big">Coverage &amp; carrier trust</div>
        <p>Loads covered without a human, margin held against target, and the share of carriers who book a second load. This is the number that makes a brokerage renew — and the one carriers vote on by picking up or not.</p>
      </div>
    </div>
    <p className="note" style={{ marginTop: "18px" }}>Carrier-first isn't only a positioning line — it's a measurement choice. If the scoreboard rewards touches, the agent learns to spam. Every metric below is chosen so the agent can't win by dialing harder.</p>
  </section>

  <section id="tree">
    <div className="sec-head">
      <div className="eyebrow">02 — The metrics tree</div>
      <h2>One root metric, four branches, and where each one lies to you</h2>
      <p className="lead">The third line on each card is the part most trees skip: the way the metric goes green while the business gets worse. That's the line worth arguing about in a roadmap review.</p>
    </div>

    <div className="tree">
      <div className="tree-root">
        <span className="lbl">Root metric</span>
        <span className="val">Loads covered per rep-day, at or above target margin, without a human touch</span>
      </div>
      <div className="branches">

        <div className="branch">
          <div className="branch-hd"><i className="dot" style={{ background: "var(--s1)" }}></i>Reach</div>
          <div className="leaf">
            <div className="m">Right-carrier rate</div>
            <div className="d">Share of outbound touches to a carrier whose equipment, lane and timing actually fit the load.</div>
            <div className="w"><b>Lies when</b> matching loosens to lift connect volume — carriers still answer, they just stop booking.</div>
          </div>
          <div className="leaf">
            <div className="m">Connect rate by segment</div>
            <div className="d">Owner-operators answer; mid-size fleets route through a dispatcher. Blended, it hides both.</div>
            <div className="w"><b>Lies when</b> the mix shifts. Always cut it by fleet size.</div>
          </div>
          <div className="leaf">
            <div className="m">Touch fatigue</div>
            <div className="d">Contacts per carrier per week, and opt-out rate that follows it.</div>
            <div className="w"><b>Lies when</b> it's read as an average — damage sits in the top decile.</div>
          </div>
        </div>

        <div className="branch">
          <div className="branch-hd"><i className="dot" style={{ background: "var(--s2)" }}></i>Convert</div>
          <div className="leaf">
            <div className="m">Quoted → booked</div>
            <div className="d">The agent's negotiation win rate once a real rate is on the table.</div>
            <div className="w"><b>Lies when</b> only easy lanes get quoted. Segment by lane difficulty.</div>
          </div>
          <div className="leaf">
            <div className="m">Rate delta vs. target</div>
            <div className="d">Average basis points given away per booked load, against the broker's own target buy rate.</div>
            <div className="w"><b>Lies when</b> book rate is celebrated alone — you can buy 100% coverage with margin.</div>
          </div>
          <div className="leaf">
            <div className="m">Time to cover</div>
            <div className="d">Load posted → rate confirmation sent. The metric brokers feel on a Friday afternoon.</div>
            <div className="w"><b>Lies when</b> medians hide the tail. Watch p90; that's where the customer calls.</div>
          </div>
        </div>

        <div className="branch">
          <div className="branch-hd"><i className="dot" style={{ background: "var(--s3)" }}></i>Retain</div>
          <div className="leaf">
            <div className="m">D30 repeat-book rate</div>
            <div className="d">Of carriers who booked once, how many book again within 30 days. The carrier's actual verdict.</div>
            <div className="w"><b>Lies when</b> a few large fleets carry the cohort. Weight by carrier, not by load.</div>
          </div>
          <div className="leaf">
            <div className="m">Fall-off &amp; TONU rate</div>
            <div className="d">Booked loads that don't get covered. Usually a conversation defect, not a carrier defect.</div>
            <div className="w"><b>Lies when</b> it's owned by ops instead of product — the root cause is upstream in the call.</div>
          </div>
          <div className="leaf">
            <div className="m">Carrier-side sentiment</div>
            <div className="d">Hang-up point, repeat-question rate, and unprompted "let me talk to a person".</div>
            <div className="w"><b>Lies when</b> only surveyed carriers count. Use behavior, not opt-in surveys.</div>
          </div>
        </div>

        <div className="branch">
          <div className="branch-hd"><i className="dot" style={{ background: "var(--accent)" }}></i>Trust</div>
          <div className="leaf">
            <div className="m">Verification pass-through</div>
            <div className="d">Carriers who clear vetting without abandoning. Fraud controls that carriers won't finish aren't controls.</div>
            <div className="w"><b>Lies when</b> pass rate is read without abandonment beside it.</div>
          </div>
          <div className="leaf">
            <div className="m">Escalation rate + resolution</div>
            <div className="d">How often the agent hands to a human, and whether a human was there. Both halves.</div>
            <div className="w"><b>Lies when</b> it's driven to zero. Some escalations are the product working.</div>
          </div>
          <div className="leaf">
            <div className="m">Instruction fidelity</div>
            <div className="d">Sampled calls where every special instruction — dock hours, lumper, endorsements — was actually stated.</div>
            <div className="w"><b>Lies when</b> sampling is random rather than weighted to high-value loads.</div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <section id="cockpit">
    <div className="sec-head">
      <div className="eyebrow">03 — The cockpit</div>
      <h2>What that tree looks like on one screen</h2>
      <p className="lead">A working sketch, wired to illustrative data. Switch carrier segment and watch the funnel change shape — the point of the whole build is that owner-operators and mid-size fleets are two different products wearing one dashboard.</p>
    </div>

    <div className="filters">
      <span className="flabel">Carrier segment</span>
      <SegmentFilter seg={seg} onChange={setSeg} />
    </div>

    <Tiles seg={seg} />

    <div className="grid2">
      <div className="card pad">
        <div className="chart-hd">
          <h3>Coverage funnel</h3>
          <span className="sub mono">per 1,000 outbound touches</span>
        </div>
        <Funnel seg={seg} />
        <p className="note" style={{ marginTop: "16px" }}>The stage-to-stage drop on the right is the roadmap. Whichever one is worst for a segment is where the next sprint goes.</p>
      </div>

      <div className="card pad">
        <div className="chart-hd">
          <h3>Autonomy vs. escalation</h3>
          <span className="sub mono">last 12 weeks · %</span>
        </div>
        <AutonomyChart />
        <div className="legend">
          <span><i style={{ background: "var(--s1)" }}></i>Booked with no human touch</span>
          <span><i style={{ background: "var(--s2)" }}></i>Escalated to a human</span>
        </div>
        <p className="note" style={{ marginTop: "14px" }}>Same unit, one axis, on purpose. The healthy shape is these two separating — not escalation hitting zero.</p>
      </div>
    </div>

    <div className="grid2" style={{ marginTop: "18px" }}>
      <div className="card pad">
        <div className="chart-hd">
          <h3>Do they come back?</h3>
          <span className="sub mono">% of first-time carriers who book again within 30 days</span>
        </div>
        <Cohort />
        <p className="note" style={{ marginTop: "16px" }}>Cohorted by the week of their first booked load. A flat line here means the agent is renting carriers, not earning them.</p>
      </div>

      <div className="card pad">
        <div className="chart-hd">
          <h3>Where conversations break</h3>
          <span className="sub mono">250 sampled calls · weighted to high-value loads</span>
        </div>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr><th>Failure mode</th><th>Calls</th><th>Cost</th><th>Owner</th></tr>
            </thead>
            <tbody>
              <tr><td>Special instruction dropped</td><td className="num">68</td><td><span className="sev hi">Fall-off / TONU</span></td><td>Product</td></tr>
              <tr><td>Anchored high on a soft lane</td><td className="num">54</td><td><span className="sev hi">Margin</span></td><td>Pricing</td></tr>
              <tr><td>Equipment mismatch surfaced late</td><td className="num">41</td><td><span className="sev md">Wasted call</span></td><td>Matching</td></tr>
              <tr><td>Carrier abandoned during vetting</td><td className="num">39</td><td><span className="sev md">Lost supply</span></td><td>Trust &amp; safety</td></tr>
              <tr><td>Agent looped, carrier hung up</td><td className="num">27</td><td><span className="sev md">Carrier trust</span></td><td>Product</td></tr>
              <tr><td>Escalated, no human available</td><td className="num">21</td><td><span className="sev lo">Coverage delay</span></td><td>Ops</td></tr>
            </tbody>
          </table>
        </div>
        <p className="note" style={{ marginTop: "16px" }}>A taxonomy with an owner column is what turns QA listening into a backlog instead of a vibe.</p>
      </div>
    </div>
  </section>

  <section id="questions">
    <div className="sec-head">
      <div className="eyebrow">04 — First questions</div>
      <h2>Three questions to point this at first</h2>
      <p className="lead">The questions to answer before touching the roadmap, and what each answer would change.</p>
    </div>
    <div className="qs">
      <div className="card q">
        <div className="n">1</div>
        <div className="body">
          <div className="ask">Of loads the agent covered, how many did the carrier take again within 30 days — and how does that split by fleet size?</div>
          <p className="why">Repeat rate is the only carrier-side quality signal that can't be gamed by volume. If owner-operators return at twice the rate of mid-size fleets, the mid-fleet motion isn't a conversation problem, it's a dispatcher-workflow problem — and it needs a different surface, not a better voice.</p>
          <p className="then"><b>Changes:</b> whether the next quarter is agent quality or a second product surface</p>
        </div>
      </div>
      <div className="card q">
        <div className="n">2</div>
        <div className="body">
          <div className="ask">On the loads we don't cover autonomously, where in the conversation did it end?</div>
          <p className="why">Failure location beats failure count. Dying at rate negotiation is a pricing-input problem; dying at verification is a trust-and-safety UX problem; dying at special instructions is a data-completeness problem in what the broker gave us. Three different teams, three different fixes, one undifferentiated "escalation rate" hiding all of them.</p>
          <p className="then"><b>Changes:</b> which of the three teams gets the next two sprints</p>
        </div>
      </div>
      <div className="card q">
        <div className="n">3</div>
        <div className="body">
          <div className="ask">Which brokerages expanded agent scope after go-live — and what did the first 30 days look like for the ones that didn't?</div>
          <p className="why">Adoption inside a brokerage is a change-management problem before it's a product one. Reps who were burned by prior vendor promises quietly route around the agent. The brokerages that expand usually had one rep who saw a win in week one; the ones that stall usually had a bad Friday nobody debriefed. That pattern is findable in the data, and it's a playbook, not a feature.</p>
          <p className="then"><b>Changes:</b> the onboarding playbook, and what "launched" is allowed to mean</p>
        </div>
      </div>
    </div>
  </section>

  <section id="plan">
    <div className="sec-head">
      <div className="eyebrow">05 — Rollout plan · 90 days</div>
      <h2>Instrument, fix the worst drop, make it a playbook</h2>
    </div>
    <div className="plan">
      <div className="card pcol">
        <div className="ph">Days 0–30 · Ground truth</div>
        <ul>
          <li><b>Listen to calls.</b> 100+ recordings across segments before proposing anything. Build the failure taxonomy from what's actually there, not from this page.</li>
          <li><b>Ride along with two brokerages</b> — one expanding, one stalled — and one owner-operator's day.</li>
          <li><b>Agree the root metric</b> with the founders and name the metrics we're going to stop celebrating.</li>
        </ul>
      </div>
      <div className="card pcol">
        <div className="ph">Days 30–60 · One drop</div>
        <ul>
          <li><b>Pick the single worst funnel drop</b> for the largest segment and own it end to end with engineering.</li>
          <li><b>Ship, measure, keep or revert</b> in two-week loops with the failure taxonomy as the acceptance criteria.</li>
          <li><b>Stand up weekly QA sampling</b> weighted to high-value loads so quality has a standing forum.</li>
        </ul>
      </div>
      <div className="card pcol">
        <div className="ph">Days 60–90 · Repeatable</div>
        <ul>
          <li><b>Turn the win into an onboarding playbook</b> ops and GTM can run without the product team — education, docs, the week-one win, the Friday debrief.</li>
          <li><b>Define launch readiness</b> and what learning is owed after every launch.</li>
          <li><b>Publish the scoreboard</b> so the whole company argues from the same numbers.</li>
        </ul>
      </div>
    </div>
  </section>

  <footer>
    <p className="disc"><strong>On the numbers:</strong> every figure on this page is illustrative, generated to make the structure legible. None of it is FleetWorks' data, and nothing here is a claim about its metrics. The structure is the argument: swap in real numbers and the same page tells you where the next sprint goes. The <code>pipeline/</code> folder in the repository shows how each dashboard number is computed from event-level data. Public facts referenced (Series A, brokerage count, rep throughput, carrier-first positioning) come from TechCrunch, FreightCaviar and a Freight Pod founder interview.</p>
    <p className="sig">Harsh Agarwal</p>
  </footer>
</div>


    </>
  );
}
