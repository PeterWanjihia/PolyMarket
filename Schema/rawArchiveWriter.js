import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeRawArchiveRecord(record, baseDir = "archive/raw") {
  const runId = record.provenance.runId;
  const jobId = record.provenance.jobId;

  const runDir = path.join(baseDir, runId);
  const filePath = path.join(runDir, `${jobId}.json`);

  await mkdir(runDir, { recursive: true });

  const json = JSON.stringify(record, null, 2);
  await writeFile(filePath, json, "utf-8");

  return {
    ok: true,
    runId,
    jobId,
    filePath
  };
}