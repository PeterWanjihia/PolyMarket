import { baselineMarketsProfile } from "./queryProfile.js";
import { planRequest } from "./requestPlanner.js";
import { executeJob } from "./httpExecutor.js";
import { buildProvenance } from "./provenance.js";
import { writeRawArchiveRecord } from "./rawArchiveWriter.js";

async function runTest() {
  const runId = "archive-test-001";

  const jobs = planRequest(baselineMarketsProfile, runId);
  const firstJob = jobs[0];
  const result = await executeJob(firstJob);
  const provenance = buildProvenance(firstJob, result);

  const record = {
    provenance,
    payload: result.data
  };

  const writeResult = await writeRawArchiveRecord(record);

  console.log("ARCHIVE WRITE RESULT:");
  console.log(JSON.stringify(writeResult, null, 2));
}

runTest();