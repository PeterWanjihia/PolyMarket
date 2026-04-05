// test/analysis/pathExtraction/inspectOutcomeFields.js

import path from "path";
import { loadArchiveRun } from "../../../analysis/archiveLoader.js";
import { extractMarkets } from "../../../analysis/marketExtractor.js";

async function main() {
  const archiveDirArg = process.argv[2];

  if (!archiveDirArg) {
    console.error(
      "Usage: node test/analysis/pathExtraction/inspectOutcomeFields.js <archiveDir>"
    );
    process.exit(1);
  }

  const archiveDir = path.resolve(archiveDirArg);

  const loadResult = await loadArchiveRun(archiveDir);
  const extractResult = extractMarkets(loadResult.records);

  const firstMarketUnit = extractResult.markets[0];
  const market = firstMarketUnit.market;

  console.log(
    JSON.stringify(
      {
        outcomesType: typeof market.outcomes,
        outcomesIsArray: Array.isArray(market.outcomes),
        outcomesValue: market.outcomes,
        outcomePricesType: typeof market.outcomePrices,
        outcomePricesIsArray: Array.isArray(market.outcomePrices),
        outcomePricesValue: market.outcomePrices,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("INSPECTION FAILED");
  console.error(error);
  process.exit(1);
});