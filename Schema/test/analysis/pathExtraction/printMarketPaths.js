// test/analysis/pathExtraction/printMarketPaths.js

import path from "path";
import { loadArchiveRun } from "../../../analysis/archiveLoader.js";
import { extractMarkets } from "../../../analysis/marketExtractor.js";
import { extractPathObservationsFromMarketUnit } from "../../../analysis/pathExtraction/index.js";

async function main() {
  const archiveDirArg = process.argv[2];
  const marketIndexArg = process.argv[3] ?? "0";

  if (!archiveDirArg) {
    console.error(
      "Usage: node test/analysis/pathExtraction/printMarketPaths.js <archiveDir> [marketIndex]"
    );
    process.exit(1);
  }

  const marketIndex = Number.parseInt(marketIndexArg, 10);

  if (!Number.isInteger(marketIndex) || marketIndex < 0) {
    throw new Error('Expected "marketIndex" to be a non-negative integer.');
  }

  const archiveDir = path.resolve(archiveDirArg);
  const loadResult = await loadArchiveRun(archiveDir);
  const extractResult = extractMarkets(loadResult.records);

  if (extractResult.markets.length === 0) {
    throw new Error("No markets found in archive.");
  }

  if (marketIndex >= extractResult.markets.length) {
    throw new Error(
      `marketIndex out of range. Got ${marketIndex}, but only ${extractResult.markets.length} markets are available.`
    );
  }

  const marketUnit = extractResult.markets[marketIndex];
  const paths = extractPathObservationsFromMarketUnit(marketUnit).observations.map(
    (obs) => obs.path
  );

  console.log(JSON.stringify(paths, null, 2));
}

main().catch((error) => {
  console.error("FAILED");
  console.error(error.message);
  process.exit(1);
});
