/**
 * Exports the dashboard's displayed figures so the Python pipeline's tests can
 * assert that SQL over event-level data reproduces them.
 *
 *   npm run export:targets
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUTONOMY, COHORTS, DATA, ESCALATION } from "../src/domain/dashboard";

const out = { segments: DATA, autonomy: AUTONOMY, escalation: ESCALATION, cohorts: COHORTS };
writeFileSync(join(import.meta.dirname, "..", "pipeline", "data", "dashboard_targets.json"), JSON.stringify(out, null, 2) + "\n");
console.log("wrote dashboard_targets.json");
