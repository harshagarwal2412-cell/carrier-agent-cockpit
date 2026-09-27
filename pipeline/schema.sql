-- Carrier Agent Cockpit: event-level data behind every dashboard metric.

CREATE TABLE segments (
    segment  TEXT PRIMARY KEY,          -- oo = owner-operator, sf = small fleet, mf = mid fleet
    label    TEXT NOT NULL
);

-- One outbound agent touch (call or text) about one load to one carrier
CREATE TABLE touches (
    touch_id   INTEGER PRIMARY KEY,
    segment    TEXT NOT NULL REFERENCES segments (segment),
    week       INTEGER NOT NULL CHECK (week BETWEEN 1 AND 12),
    connected  INTEGER NOT NULL CHECK (connected IN (0, 1)),
    qualified  INTEGER NOT NULL CHECK (qualified IN (0, 1)),   -- equipment, lane and timing fit
    quoted     INTEGER NOT NULL CHECK (quoted IN (0, 1)),
    booked     INTEGER NOT NULL CHECK (booked IN (0, 1)),
    escalated  INTEGER NOT NULL CHECK (escalated IN (0, 1)),   -- handed to a human
    CHECK (connected >= qualified AND qualified >= quoted AND quoted >= booked)  -- funnel is nested
);

CREATE TABLE bookings (
    booking_id        INTEGER PRIMARY KEY,
    touch_id          INTEGER NOT NULL UNIQUE REFERENCES touches (touch_id),
    segment           TEXT NOT NULL REFERENCES segments (segment),
    week              INTEGER NOT NULL,
    minutes_to_cover  REAL NOT NULL CHECK (minutes_to_cover > 0),  -- load posted -> rate con sent
    human_touched     INTEGER NOT NULL CHECK (human_touched IN (0, 1)),
    target_rate_usd   REAL NOT NULL,
    booked_rate_usd   REAL NOT NULL
);

-- Carriers by the week of their first booked load, and whether they booked again within 30 days
CREATE TABLE carriers (
    carrier_id           INTEGER PRIMARY KEY,
    segment              TEXT NOT NULL REFERENCES segments (segment),
    first_booking_week   INTEGER NOT NULL,
    rebooked_within_30d  INTEGER NOT NULL CHECK (rebooked_within_30d IN (0, 1))
);

-- QA sample of calls, weighted to high-value loads, tagged with a failure mode
CREATE TABLE call_reviews (
    review_id       INTEGER PRIMARY KEY,
    failure_mode    TEXT NOT NULL,
    cost            TEXT NOT NULL,
    owner           TEXT NOT NULL,
    load_value_usd  REAL NOT NULL
);
