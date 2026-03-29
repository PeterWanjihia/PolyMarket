
import { baselineMarketsProfile } from '../queryProfile.js';
import { planRequest } from '../requestPlanner.js';

function runTest() {
  console.log("Initializing Test: Baseline Markets Profile...\n");

  // Execute the planner with a fixed runId for deterministic testing
  const testRunId = "test-execution-001";
  const jobs = planRequest(baselineMarketsProfile, testRunId);

  console.log(`Generated ${jobs.length} jobs successfully.\n`);
  
  // Pretty-print the array of job objects
  console.log(JSON.stringify(jobs, null, 2));
}

runTest();