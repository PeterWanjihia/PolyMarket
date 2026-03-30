import { planRequest } from "./requestPlanner.js";
import { executeJob } from "./httpExecutor.js";

export async function runCrawl(profile, runId) {
  const jobs = planRequest(profile, runId);
  const results = [];

  let successCount = 0;
  let failureCount = 0;

  for (const job of jobs) {
    const result = await executeJob(job);

    results.push(result);

    if (result.ok) {
      successCount += 1;
    } else {
      failureCount += 1;
    }
  }

  return {
    runId: runId,
    profileId: profile.id,
    profileMode: profile.mode,
    jobsPlannedCount: jobs.length,
    successCount: successCount,
    failureCount: failureCount,
    results: results
  };
}