// analysis/archiveLoader.js

import fs from "fs/promises";
import path from "path";

function isNonNullObject(value) {
  return typeof value === "object" && value !== null;
}

function isArchiveCrawlRecord(value) {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(value, "provenance") &&
    Object.prototype.hasOwnProperty.call(value, "payload")
  );
}

export async function loadArchiveRun(archiveDir) {
  const entryNames = await fs.readdir(archiveDir);

  const jsonFileNames = entryNames
    .filter((name) => name.endsWith(".json"))
    .sort();

  const records = [];
  const failures = [];

  for (const fileName of jsonFileNames) {
    const filePath = path.join(archiveDir, fileName);

    let rawText;
    try {
      rawText = await fs.readFile(filePath, "utf8");
    } catch (error) {
      failures.push({
        sourceFile: fileName,
        stage: "read",
        error: error.message,
      });
      continue;
    }

    let parsedRecord;
    try {
      parsedRecord = JSON.parse(rawText);
    } catch (error) {
      failures.push({
        sourceFile: fileName,
        stage: "parse",
        error: error.message,
      });
      continue;
    }

    if (!isArchiveCrawlRecord(parsedRecord)) {
      failures.push({
        sourceFile: fileName,
        stage: "validate-record-shape",
        error: 'Parsed JSON is not a valid archive crawl record. Expected top-level "provenance" and "payload" properties.',
      });
      continue;
    }

    records.push({
      sourceFile: fileName,
      record: parsedRecord,
    });
  }

  return {
    ok: failures.length === 0,
    archiveDir,
    discoveredFileCount: jsonFileNames.length,
    loadedCount: records.length,
    failedCount: failures.length,
    records,
    failures,
  };
}