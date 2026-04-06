// test/analysis/pathExtraction/testPathProfileBuilder.js

import path from "path";
import { loadArchiveRun } from "../../../analysis/archiveLoader.js";
import { extractMarkets } from "../../../analysis/marketExtractor.js";
import {
  extractPathObservationsFromMarketUnits,
  bundlePathObservations,
} from "../../../analysis/pathExtraction/index.js";

async function main() {
  const archiveDirArg = process.argv[2];
  const marketLimitArg = process.argv[3] ?? "25";
  const targetPathArg = process.argv[4] ?? null;

  if (!archiveDirArg) {
    console.error(
      "Usage: node test/analysis/pathExtraction/testPathProfileBuilder.js <archiveDir> [marketLimit] [path]"
    );
    process.exit(1);
  }

  const marketLimit = Number.parseInt(marketLimitArg, 10);

  if (!Number.isInteger(marketLimit) || marketLimit < 1) {
    throw new Error('Expected "marketLimit" to be a positive integer.');
  }

  const archiveDir = path.resolve(archiveDirArg);

  const loadResult = await loadArchiveRun(archiveDir);
  const marketResult = extractMarkets(loadResult.records);

  const marketUnits = marketResult.markets.slice(0, marketLimit);

  const observationResult =
    extractPathObservationsFromMarketUnits(marketUnits);

  const bundleResult = bundlePathObservations(observationResult);

  console.log("PROFILE BUILD SUMMARY");
  console.log(
    JSON.stringify(
      {
        ok: bundleResult.ok,
        marketUnitCount: bundleResult.marketUnitCount,
        observationCount: bundleResult.observationCount,
        pathCount: bundleResult.pathCount,
        failedCount: bundleResult.failedCount,
      },
      null,
      2
    )
  );

  if (!targetPathArg) {
    console.log("\nALL PATH BUNDLES");
    console.log(JSON.stringify(bundleResult.pathBundles, null, 2));
    return;
  }

  const profile = bundleResult.pathBundles.find((p) => p.path === targetPathArg);

  if (!profile) {
    throw new Error(`Path not found in path bundles: ${targetPathArg}`);
  }

  console.log(`\nPATH BUNDLE: ${targetPathArg}`);
  console.log(JSON.stringify(profile, null, 2));
}

main().catch((error) => {
  console.error("TEST FAILED");
  console.error(error);
  process.exit(1);
});