"""
Every number on the cockpit must be computable from event-level data.
These tests recompute each one in SQL and compare it to what the dashboard displays.
"""
import re
import sqlite3

import pandas as pd
import pytest

import metrics
from conftest import tile

SEGS = ["oo", "sf", "mf"]


def minutes(text):
    """'2h 39m' -> 159, '35m' -> 35."""
    h = re.search(r"(\d+)h", text)
    m = re.search(r"(\d+)m", text)
    return (int(h.group(1)) * 60 if h else 0) + (int(m.group(1)) if m else 0)


def test_schema_enforces_a_nested_funnel(con):
    with pytest.raises(sqlite3.IntegrityError):  # booked without being quoted
        con.execute("INSERT INTO touches VALUES (999999, 'oo', 1, 1, 1, 0, 1, 0)")
    with pytest.raises(sqlite3.IntegrityError):  # booking for a touch that doesn't exist
        con.execute("INSERT INTO bookings VALUES (999999, 999999, 'oo', 1, 10, 0, 2000, 2000)")
    con.rollback()


def test_every_booking_comes_from_a_booked_touch(con):
    orphans = pd.read_sql_query(
        "SELECT COUNT(*) AS n FROM bookings b JOIN touches t USING (touch_id) WHERE t.booked = 0", con
    ).n.iloc[0]
    assert orphans == 0
    assert pd.read_sql_query("SELECT SUM(booked) AS n FROM touches", con).n.iloc[0] == \
        pd.read_sql_query("SELECT COUNT(*) AS n FROM bookings", con).n.iloc[0]


@pytest.mark.parametrize("seg", SEGS + ["all"])
def test_funnel_matches_dashboard_exactly(con, targets, seg):
    f = metrics.run(con, "01").set_index("segment").loc[seg]
    shown = targets["segments"][seg]["funnel"][1:]
    assert [f.connected_per_1k, f.qualified_per_1k, f.quoted_per_1k, f.booked_per_1k] == shown


@pytest.mark.parametrize("seg", SEGS + ["all"])
def test_scorecard_tiles_match_dashboard(con, targets, seg):
    s = metrics.run(con, "04").set_index("segment").loc[seg]
    ttc = next(t for t in targets["segments"][seg]["tiles"] if t["t"] == "Median time to cover")
    assert s.median_min_to_cover == minutes(ttc["v"])
    assert abs(s.p90_min_to_cover - minutes(ttc["d"].split("·")[1])) <= 1
    assert s.d30_repeat_pct == int(tile(targets, seg, "D30 repeat-book rate").rstrip("%"))
    assert s.rate_delta_pct == float(tile(targets, seg, "Rate delta vs. target").rstrip("%"))
    autonomy = int(tile(targets, seg, "Covered with no human").rstrip("%"))
    assert s.pct_no_human_w12 == autonomy


def test_weekly_trends_match_dashboard(con, targets):
    t = metrics.run(con, "03")
    assert list(t.pct_escalated) == targets["escalation"]
    assert [int(v + 0.5) for v in t.pct_booked_no_human] == targets["autonomy"]  # displayed series = computed, rounded
    assert t.pct_booked_no_human.iloc[-1] > t.pct_booked_no_human.iloc[0]


def test_cohorts_match_dashboard(con, targets):
    c = metrics.run(con, "05")
    assert list(c.d30_repeat_pct) == [x["v"] for x in targets["cohorts"]]


def test_worst_drop_matches_the_react_logic(con):
    w = metrics.run(con, "02").set_index("segment")
    assert w.loc["Mid fleet (31+)", "worst_stage"] == "Connected"
    assert w.loc["Mid fleet (31+)", "drop_pct"] == 68


def test_failure_taxonomy_sums_to_the_sample(con):
    f = metrics.run(con, "06")
    assert f.calls.sum() == 250
    assert f.pct_of_sample.sum() == pytest.approx(100, abs=0.2)
    assert metrics.run(con, "07").set_index("owner").loc["Product", "calls"] == 95


def test_every_query_has_a_question_and_runs(con):
    for q in metrics.load_queries():
        assert q.question, q.key
        pd.read_sql_query(q.sql, con)
