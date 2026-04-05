import { baselineMarketsProfile } from "../../acquisition/queryProfile.js";
import { planRequest } from "../../acquisition/requestPlanner.js";
import { executeJob } from "../../acquisition/httpExecutor.js";
import { buildProvenance } from "../../acquisition/provenance.js";
import { writeRawArchiveRecord } from "../../acquisition/rawArchiveWriter.js";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function runTest() {
  const runId = "archive-test-001";
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const runDir = path.resolve(moduleDir, "../../acquisition/archive/raw", runId);

  await rm(runDir, { recursive: true, force: true });

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