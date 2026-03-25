import { baselineMarketsProfile } from "./queryProfile.js";
import { planRequest } from "./requestPlanner.js";
import { executeJob } from "./httpExecutor.js";

async function runTest() {
  const testRunId = "test-execution-001";
  const jobs = planRequest(baselineMarketsProfile, testRunId);

  const firstJob = jobs[0];

  console.log("EXECUTING JOB:");
  console.log(JSON.stringify(firstJob, null, 2));

  const result = await executeJob(firstJob);

  console.log("\nEXECUTION RESULT:");
  console.log(JSON.stringify(result, null, 2));
}

runTest();