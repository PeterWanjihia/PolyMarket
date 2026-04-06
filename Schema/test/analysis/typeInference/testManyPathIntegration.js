// test/analysis/typeInference/testManyPathIntegration.js

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
      runId: "many-path",
      profileId: "fixture",
      profileMode: "test",
      capturedAt: "2026-04-06T00:00:00.000Z",
      provenanceTags: ["fixture"],
      jobId: `${sourceFile}-${marketIndex}`,
      pageNumber: 1,
      endpoint: "/markets",
      params: { limit: 10, offset: 0 },
      url: "https://example.test/markets",
      status: 200,
      ok: true,
    },
  };
}

function main() {
  const marketUnits = [
    buildMarketUnit("many-a.json", 0, {
      question: "Will A happen?",
      volume: "12.5",
      outcomes: '["Yes","No"]',
      events: [{ id: "1" }],
    }),
    buildMarketUnit("many-b.json", 0, {
      question: "Will B happen?",
      volume: "9.0",
      outcomes: '["Up","Down"]',
      events: [{ id: "2" }, { id: "3" }],
      feeType: null,
    }),
  ];

  const extractionResult = extractPathObservationsFromMarketUnits(marketUnits);
  const bundleResult = bundlePathObservations(extractionResult);
  const typedResult = inferPathTypes(bundleResult);

  assert.equal(typedResult.ok, true);
  assert.ok(typedResult.pathCount > 0);
  assert.equal(typedResult.typedPathProfiles.length, typedResult.pathCount);

  const paths = typedResult.typedPathProfiles.map((profile) => profile.path);
  const sorted = [...paths].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(paths, sorted, "Expected deterministic path ordering.");

  const outcomes = typedResult.typedPathProfiles.find((profile) => profile.path === "outcomes");
  assert.ok(outcomes, "Expected profile for outcomes.");
  assert.equal(outcomes.inferredType.subtype, "json-encoded-array");

  console.log("TYPE INFERENCE MANY-PATH INTEGRATION TEST PASSED");
}

main();
