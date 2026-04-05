// test/analysis/pathExtraction/testPathExtractor.js

import path from "path";
import { loadArchiveRun } from "../../../analysis/archiveLoader.js";
import { extractMarkets } from "../../../analysis/marketExtractor.js";
import {
  extractPathObservationsFromMarketUnit,
  extractPathObservationsFromMarketUnits,
} from "../../../analysis/pathExtraction/index.js";

async function main() {
  const archiveDirArg = process.argv[2];

  if (!archiveDirArg) {
    console.error(
      "Usage: node test/analysis/pathExtraction/testPathExtractor.js <archiveDir>"
    );
    process.exit(1);
  }

  const archiveDir = path.resolve(archiveDirArg);

  const loadResult = await loadArchiveRun(archiveDir);
  const extractMarketsResult = extractMarkets(loadResult.records);

  const firstMarketUnit = extractMarketsResult.markets[0];

  const singleResult =
    extractPathObservationsFromMarketUnit(firstMarketUnit);

  console.log("SINGLE MARKET PATH EXTRACTION");
  console.log(
    JSON.stringify(
      {
        observationCount: singleResult.observationCount,
      },
      null,
      2
    )
  );

  console.log("\nALL OBSERVATIONS");
  console.log(
    JSON.stringify(
      singleResult.observations.map((obs) => ({
        path: obs.path,
        nodeKind: obs.nodeKind,
      })),
      null,
      2
    )
  );

  const batchMarketUnits = extractMarketsResult.markets.slice(0, 10);
  const batchResult =
    extractPathObservationsFromMarketUnits(batchMarketUnits);

  console.log("\nBATCH PATH EXTRACTION");
  console.log(
    JSON.stringify(
      {
        ok: batchResult.ok,
        marketUnitCount: batchResult.marketUnitCount,
        observationCount: batchResult.observationCount,
        failedCount: batchResult.failedCount,
      },
      null,
      2
    )
  );

  if (batchResult.failures.length > 0) {
    console.log("\nFAILURES");
    console.log(JSON.stringify(batchResult.failures, null, 2));
  }
}

main().catch((error) => {
  console.error("TEST FAILED");
  console.error(error);
  process.exit(1);
});