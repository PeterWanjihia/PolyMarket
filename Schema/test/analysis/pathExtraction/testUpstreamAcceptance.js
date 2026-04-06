// test/analysis/pathExtraction/testUpstreamAcceptance.js

import assert from "node:assert/strict";
import {
  extractPathObservationsFromMarketUnits,
  bundlePathObservations,
} from "../../../analysis/pathExtraction/index.js";

function buildMarketUnit(sourceFile, marketIndex, market) {
  return {
    sourceFile,
    marketIndex,
    market,
    provenance: {
      runId: "fixture-run",
      profileId: "fixture",
      profileMode: "test",
      capturedAt: "2026-04-06T00:00:00.000Z",
      provenanceTags: ["fixture"],
      jobId: `${sourceFile}-${marketIndex}`,
      pageNumber: 1,
      endpoint: "/markets",
      params: {
        limit: 2,
        offset: 0,
      },
      url: "https://example.test/markets",
      status: 200,
      ok: true,
    },
  };
}

function bundleFromMarketUnits(marketUnits) {
  const extractionResult = extractPathObservationsFromMarketUnits(marketUnits);
  return bundlePathObservations(extractionResult);
}

function getBundle(pathBundles, targetPath) {
  return pathBundles.find((bundle) => bundle.path === targetPath);
}

function testNullVsMissingFixture() {
  const marketUnits = [
    buildMarketUnit("fixture-null-missing-a.json", 0, { id: "a" }),
    buildMarketUnit("fixture-null-missing-b.json", 0, { id: "b", feeType: null }),
  ];

  const bundled = bundleFromMarketUnits(marketUnits);
  const feeTypeBundle = getBundle(bundled.pathBundles, "feeType");

  assert.ok(feeTypeBundle, "Expected feeType bundle to exist.");
  assert.equal(feeTypeBundle.totalMarketUnits, 2);
  assert.equal(feeTypeBundle.presentCount, 1);
  assert.equal(feeTypeBundle.missingCount, 1);
  assert.equal(feeTypeBundle.occurrenceCount, 1);
  assert.equal(feeTypeBundle.rawKindCounts.null, 1);
  assert.equal(feeTypeBundle.observations[0].rawKind, "null");
}

function testRepeatedArrayPathFixture() {
  const marketUnits = [
    buildMarketUnit("fixture-array-a.json", 0, { outcomes: ["Yes", "No", "Maybe"] }),
    buildMarketUnit("fixture-array-b.json", 0, { outcomes: ["Up", "Down"] }),
  ];

  const bundled = bundleFromMarketUnits(marketUnits);
  const outcomesItemBundle = getBundle(bundled.pathBundles, "outcomes[]");

  assert.ok(outcomesItemBundle, "Expected outcomes[] bundle to exist.");
  assert.equal(outcomesItemBundle.totalMarketUnits, 2);
  assert.equal(outcomesItemBundle.presentCount, 2);
  assert.equal(outcomesItemBundle.missingCount, 0);
  assert.equal(outcomesItemBundle.occurrenceCount, 5);
  assert.equal(outcomesItemBundle.observations.length, 5);
  assert.equal(outcomesItemBundle.rawKindCounts.string, 5);
}

function testCanonicalPathNotationFixture() {
  const marketUnits = [
    buildMarketUnit("fixture-canonical.json", 0, {
      tokens: [
        { price: "0.4" },
        { price: "0.6" },
      ],
    }),
  ];

  const bundled = bundleFromMarketUnits(marketUnits);
  const allPaths = bundled.pathBundles.map((bundle) => bundle.path);

  assert.ok(allPaths.includes("tokens"), "Expected path tokens.");
  assert.ok(allPaths.includes("tokens[]"), "Expected path tokens[].");
  assert.ok(allPaths.includes("tokens[].price"), "Expected path tokens[].price.");
}

function main() {
  testNullVsMissingFixture();
  testRepeatedArrayPathFixture();
  testCanonicalPathNotationFixture();

  console.log("UPSTREAM ACCEPTANCE FIXTURE TESTS PASSED");
}

main();
