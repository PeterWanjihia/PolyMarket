// test/analysis/testArchiveLoader.js

import path from "path";
import { loadArchiveRun } from "../../analysis/archiveLoader.js";

async function main() {
  const archiveDirArg = process.argv[2];

  if (!archiveDirArg) {
    console.error("Usage: node test/analysis/testArchiveLoader.js <archiveDir>");
    process.exit(1);
  }

  const archiveDir = path.resolve(archiveDirArg);

  console.log("Loading archive run...");
  console.log("archiveDir:", archiveDir);

  const result = await loadArchiveRun(archiveDir);

  console.log("\nLOAD SUMMARY");
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        archiveDir: result.archiveDir,
        discoveredFileCount: result.discoveredFileCount,
        loadedCount: result.loadedCount,
        failedCount: result.failedCount,
      },
      null,
      2
    )
  );

  if (result.records.length > 0) {
    const first = result.records[0];

    console.log("\nFIRST LOADED RECORD");
    console.log(
      JSON.stringify(
        {
          sourceFile: first.sourceFile,
          topLevelKeys: Object.keys(first.record),
        },
        null,
        2
      )
    );
  }

  if (result.failures.length > 0) {
    console.log("\nFAILURES");
    console.log(JSON.stringify(result.failures, null, 2));
  }
}

main().catch((error) => {
  console.error("\nFATAL TEST ERROR");
  console.error(error);
  process.exit(1);
});