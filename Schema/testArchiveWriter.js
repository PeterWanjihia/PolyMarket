import { baselineMarketsProfile } from "./queryProfile.js";
import { planRequest } from "./requestPlanner.js";
import { executeJob } from "./httpExecutor.js";
import { buildProvenance } from "./provenance.js";
import { writeRawArchiveRecord } from "./rawArchiveWriter.js";

async function runTest() {
  const runId = "archive-test-001";

  const jobs = planRequest(baselineMarketsProfile, runId);

  const writeResults = [];

  for (const job of jobs) {
    const result = await executeJob(job);
    const provenance = buildProvenance(job, result);

    const record = {
      provenance,
      payload: result.data
    };

    const writeResult = await writeRawArchiveRecord(record);
    writeResults.push(writeResult);
  }

  console.log("ARCHIVE WRITE RESULTS:");
  console.log(JSON.stringify(writeResults, null, 2));
}

runTest();