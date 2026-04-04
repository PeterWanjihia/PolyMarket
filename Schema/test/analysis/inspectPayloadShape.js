// test/analysis/inspectPayloadShape.js

import path from "path";
import { loadArchiveRun } from "../../analysis/archiveLoader.js";

function summarizePayload(payload) {
  const summary = {
    payloadType: typeof payload,
    isArray: Array.isArray(payload),
    isNull: payload === null,
  };

  if (Array.isArray(payload)) {
    summary.length = payload.length;

    if (payload.length > 0) {
      const firstItem = payload[0];
      summary.firstItemType = typeof firstItem;
      summary.firstItemIsArray = Array.isArray(firstItem);
      summary.firstItemIsNull = firstItem === null;

      if (
        typeof firstItem === "object" &&
        firstItem !== null &&
        !Array.isArray(firstItem)
      ) {
        summary.firstItemKeys = Object.keys(firstItem).slice(0, 30);
      }
    }

    return summary;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload)
  ) {
    summary.topLevelKeys = Object.keys(payload).slice(0, 30);
  }

  return summary;
}

async function main() {
  const archiveDirArg = process.argv[2];

  if (!archiveDirArg) {
    console.error(
      "Usage: node test/analysis/inspectPayloadShape.js <archiveDir>"
    );
    process.exit(1);
  }

  const archiveDir = path.resolve(archiveDirArg);
  const loadResult = await loadArchiveRun(archiveDir);

  console.log("LOAD STATUS");
  console.log(
    JSON.stringify(
      {
        ok: loadResult.ok,
        discoveredFileCount: loadResult.discoveredFileCount,
        loadedCount: loadResult.loadedCount,
        failedCount: loadResult.failedCount,
      },
      null,
      2
    )
  );

  const sampleRecords = loadResult.records.slice(0, 3);

  console.log("\nPAYLOAD SHAPE SAMPLES");

  for (const item of sampleRecords) {
    const payload = item.record.payload;

    console.log(
      JSON.stringify(
        {
          sourceFile: item.sourceFile,
          payloadSummary: summarizePayload(payload),
        },
        null,
        2
      )
    );
  }
}

main().catch((error) => {
  console.error("INSPECTION FAILED");
  console.error(error);
  process.exit(1);
});