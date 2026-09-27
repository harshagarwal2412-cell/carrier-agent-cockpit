import json
import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import metrics  # noqa: E402


@pytest.fixture(scope="session")
def con():
    c = metrics.connect()
    yield c
    c.close()


@pytest.fixture(scope="session")
def targets():
    """Figures displayed by the React dashboard (exported by `npm run export:targets`)."""
    return json.loads((metrics.DATA / "dashboard_targets.json").read_text())


def tile(targets, seg, title):
    return next(t["v"] for t in targets["segments"][seg]["tiles"] if t["t"] == title)
