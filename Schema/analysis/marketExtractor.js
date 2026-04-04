// analysis/marketExtractor.js

function isNonNullObject(value) {
  return typeof value === "object" && value !== null;
}

function isPlainMarketCandidate(value) {
  return isNonNullObject(value) && !Array.isArray(value);
}

export function extractMarkets(loadedRecords) {
  if (!Array.isArray(loadedRecords)) {
    throw new Error("extractMarkets expected an array of loaded records.");
  }

  const markets = [];
  const failures = [];

  for (const loadedRecord of loadedRecords) {
    const sourceFile = loadedRecord?.sourceFile;
    const record = loadedRecord?.record;

    if (!isNonNullObject(record)) {
      failures.push({
        sourceFile: sourceFile ?? null,
        stage: "validate-loaded-record",
        error: 'Loaded record is missing a valid "record" object.',
      });
      continue;
    }

    const provenance = record.provenance;
    const payload = record.payload;

    if (!Array.isArray(payload)) {
      failures.push({
        sourceFile: sourceFile ?? null,
        stage: "validate-payload",
        error: 'Expected "payload" to be an array of market objects.',
      });
      continue;
    }

    let payloadIsValid = true;

    for (let marketIndex = 0; marketIndex < payload.length; marketIndex += 1) {
      const market = payload[marketIndex];

      if (!isPlainMarketCandidate(market)) {
        failures.push({
          sourceFile: sourceFile ?? null,
          stage: "validate-market-item",
          error: `Payload item at index ${marketIndex} is not a valid market object candidate.`,
        });
        payloadIsValid = false;
        break;
      }
    }

    if (!payloadIsValid) {
      continue;
    }

    for (let marketIndex = 0; marketIndex < payload.length; marketIndex += 1) {
      const market = payload[marketIndex];

      markets.push({
        sourceFile,
        provenance,
        marketIndex,
        market,
      });
    }
  }

  return {
    ok: failures.length === 0,
    sourceRecordCount: loadedRecords.length,
    extractedCount: markets.length,
    failedCount: failures.length,
    markets,
    failures,
  };
}