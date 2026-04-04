// test/analysis/testMarketExtractor.js

import path from "path";
import { loadArchiveRun } from "../../analysis/archiveLoader.js";
import { extractMarkets } from "../../analysis/marketExtractor.js";

async function main() {
  const archiveDirArg = process.argv[2];

  if (!archiveDirArg) {
    console.error(
      "Usage: node test/analysis/testMarketExtractor.js <archiveDir>"
    );
    process.exit(1);
  }

  const archiveDir = path.resolve(archiveDirArg);

  const loadResult = await loadArchiveRun(archiveDir);
  const extractResult = extractMarkets(loadResult.records);

  console.log("LOAD SUMMARY");
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

  console.log("\nEXTRACTION SUMMARY");
  console.log(
    JSON.stringify(
      {
        ok: extractResult.ok,
        sourceRecordCount: extractResult.sourceRecordCount,
        extractedCount: extractResult.extractedCount,
        failedCount: extractResult.failedCount,
      },
      null,
      2
    )
  );

  if (extractResult.markets.length > 0) {
    const first = extractResult.markets[0];

    console.log("\nFIRST EXTRACTED MARKET");
    console.log(
      JSON.stringify(
        {
          sourceFile: first.sourceFile,
          marketIndex: first.marketIndex,
          provenanceKeys: Object.keys(first.provenance),
          marketKeys: Object.keys(first.market).slice(0, 30),
        },
        null,
        2
      )
    );
  }

  if (extractResult.failures.length > 0) {
    console.log("\nFAILURES");
    console.log(JSON.stringify(extractResult.failures, null, 2));
  }
}

main().catch((error) => {
  console.error("TEST FAILED");
  console.error(error);
  process.exit(1);
});