// test/analysis/typeInference/testTypeInferenceRobustness.js

import assert from "node:assert/strict";
import {
  extractPathObservationsFromMarketUnits,
  bundlePathObservations,
} from "../../../analysis/pathExtraction/index.js";
import { inferPathTypes } from "../../../analysis/typeInference/index.js";

function buildMarketUnit(sourceFile, marketIndex, market) {
  return {
    sourceFile,
    marketIndex,
    market,
    provenance: {
      runId: "type-inference-robustness",
      profileId: "fixture",
      profileMode: "test",
      capturedAt: "2026-04-06T00:00:00.000Z",
      provenanceTags: ["fixture"],
      jobId: `${sourceFile}-${marketIndex}`,
      pageNumber: 1,
      endpoint: "/markets",
      params: {
        limit: 10,
        offset: 0,
      },
      url: "https://example.test/markets",
      status: 200,
      ok: true,
    },
  };
}

function inferFromMarketUnits(marketUnits) {
  const extractionResult = extractPathObservationsFromMarketUnits(marketUnits);
  const bundleResult = bundlePathObservations(extractionResult);
  return inferPathTypes(bundleResult);
}

function testDeterministicOutput() {
  const marketUnits = [
    buildMarketUnit("deterministic-a.json", 0, {
      outcomes: '["Yes", "No"]',
      volume: "12.5",
      active: true,
    }),
    buildMarketUnit("deterministic-b.json", 0, {
      outcomes: '["Up", "Down"]',
      volume: "18.1",
      active: false,
    }),
  ];

  const first = inferFromMarketUnits(marketUnits);
  const second = inferFromMarketUnits(marketUnits);

  assert.deepEqual(second, first, "Expected deterministic inference output.");
}

function testEmptyInput() {
  const result = inferFromMarketUnits([]);

  assert.equal(result.ok, true);
  assert.equal(result.marketUnitCount, 0);
  assert.equal(result.pathCount, 0);
  assert.equal(result.typedPathProfiles.length, 0);
  assert.equal(result.failures.length, 0);
}

function testPartialFailurePropagation() {
  const valid = buildMarketUnit("partial-valid.json", 0, {
    volume: "12.2",
    status: "open",
  });

  const invalid = {
    sourceFile: "partial-invalid.json",
    marketIndex: 1,
    market: null,
  };

  const result = inferFromMarketUnits([valid, invalid]);

  assert.equal(result.ok, false);
  assert.ok(result.pathCount > 0, "Expected profiles from valid input to remain.");
  assert.ok(result.failures.length >= 1, "Expected propagated extraction failure.");
}

function testLowConfidenceWarningOnTinySample() {
  const result = inferFromMarketUnits([
    buildMarketUnit("tiny-a.json", 0, { volume: "12.5" }),
    buildMarketUnit("tiny-b.json", 0, { volume: "14.0" }),
  ]);

  const volumeProfile = result.typedPathProfiles.find((profile) => profile.path === "volume");

  assert.ok(volumeProfile, "Expected typed profile for volume.");
  assert.ok(
    volumeProfile.warnings.some((warning) =>
      warning.includes("Low sample size") || warning.includes("Low confidence")
    ),
    "Expected warning for low-evidence inference."
  );
}

function main() {
  testDeterministicOutput();
  testEmptyInput();
  testPartialFailurePropagation();
  testLowConfidenceWarningOnTinySample();

  console.log("TYPE INFERENCE ROBUSTNESS TESTS PASSED");
}

main();
