import { baselineMarketsProfile } from "../../acquisition/queryProfile.js";
import { planRequest } from "../../acquisition/requestPlanner.js";
import { executeJob } from "../../acquisition/httpExecutor.js";
import { buildProvenance } from "../../acquisition/provenance.js";

async function runTest() {
  const runId = "provenance-test-001";

  const jobs = planRequest(baselineMarketsProfile, runId);
  const firstJob = jobs[0];
  const result = await executeJob(firstJob);

  const provenance = buildProvenance(firstJob, result);

  console.log("PROVENANCE:");
  console.log(JSON.stringify(provenance, null, 2));
}

runTest();