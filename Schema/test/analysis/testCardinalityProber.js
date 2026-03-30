import { baselineMarketsProfile } from "../../acquisition/queryProfile.js";
import { probeCardinality } from "../../analysis/cardinalityProber.js";

async function runTest() {
  const runId = "cardinality-probe-001";
  const summary = await probeCardinality(baselineMarketsProfile, runId, 50);

  console.log("CARDINALITY SUMMARY:");
  console.log(JSON.stringify(summary, null, 2));
}

runTest();