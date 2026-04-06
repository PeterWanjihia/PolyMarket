// test/analysis/typeInference/testTypeInferenceAcceptance.js

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
      runId: "type-inference-fixture-run",
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

function inferProfilesFromMarketUnits(marketUnits) {
  const extractionResult = extractPathObservationsFromMarketUnits(marketUnits);
  const bundleResult = bundlePathObservations(extractionResult);
  return inferPathTypes(bundleResult);
}

function getProfile(result, path) {
  return result.typedPathProfiles.find((profile) => profile.path === path);
}

function testNumericStringDetection() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-numeric-a.json", 0, { volume: "12.5" }),
    buildMarketUnit("fixture-numeric-b.json", 0, { volume: "9" }),
    buildMarketUnit("fixture-numeric-c.json", 0, { volume: "0.01" }),
  ]);

  const volume = getProfile(result, "volume");

  assert.ok(volume, "Expected typed profile for volume.");
  assert.equal(volume.inferredType.kind, "string");
  assert.equal(volume.inferredType.subtype, "numeric-string");
}

function testJsonEncodedArrayDetection() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-json-array-a.json", 0, { outcomes: '["Yes", "No"]' }),
    buildMarketUnit("fixture-json-array-b.json", 0, { outcomes: '["Up", "Down"]' }),
    buildMarketUnit("fixture-json-array-c.json", 0, { outcomes: '["A", "B", "C"]' }),
  ]);

  const outcomes = getProfile(result, "outcomes");

  assert.ok(outcomes, "Expected typed profile for outcomes.");
  assert.equal(outcomes.inferredType.kind, "string");
  assert.equal(outcomes.inferredType.subtype, "json-encoded-array");
}

function testEnumLikeStringDetection() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-enum-a.json", 0, { status: "open" }),
    buildMarketUnit("fixture-enum-b.json", 0, { status: "closed" }),
    buildMarketUnit("fixture-enum-c.json", 0, { status: "open" }),
    buildMarketUnit("fixture-enum-d.json", 0, { status: "closed" }),
    buildMarketUnit("fixture-enum-e.json", 0, { status: "open" }),
    buildMarketUnit("fixture-enum-f.json", 0, { status: "closed" }),
  ]);

  const status = getProfile(result, "status");

  assert.ok(status, "Expected typed profile for status.");
  assert.equal(status.inferredType.kind, "string");
  assert.equal(status.inferredType.subtype, "enum-like-string");
}

function testOptionalAndNullableDistinction() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-opt-null-a.json", 0, { id: "a" }),
    buildMarketUnit("fixture-opt-null-b.json", 0, { id: "b", feeType: null }),
  ]);

  const feeType = getProfile(result, "feeType");

  assert.ok(feeType, "Expected typed profile for feeType.");
  assert.equal(feeType.fieldProperties.optional, true);
  assert.equal(feeType.fieldProperties.nullable, true);
}

function testUnionLikeDetection() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-union-a.json", 0, { meta: "simple" }),
    buildMarketUnit("fixture-union-b.json", 0, { meta: { mode: "advanced" } }),
  ]);

  const meta = getProfile(result, "meta");

  assert.ok(meta, "Expected typed profile for meta.");
  assert.equal(meta.fieldProperties.unionLike, true);
  assert.ok(
    meta.warnings.some((warning) =>
      warning.includes("Multiple non-null raw kinds observed")
    ),
    "Expected union-like warning for meta."
  );
}

function testArrayAndObjectDetectors() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-array-obj-a.json", 0, {
      events: [{ id: "e1" }, { id: "e2" }],
    }),
    buildMarketUnit("fixture-array-obj-b.json", 0, {
      events: [{ id: "e3" }],
    }),
  ]);

  const events = getProfile(result, "events");
  const eventItem = getProfile(result, "events[]");

  assert.ok(events, "Expected typed profile for events.");
  assert.equal(events.inferredType.kind, "array");
  assert.equal(events.inferredType.subtype, "array-of-objects");

  assert.ok(eventItem, "Expected typed profile for events[].");
  assert.equal(eventItem.inferredType.kind, "object");
  assert.ok(
    ["stable-object", "dynamic-record"].includes(eventItem.inferredType.subtype),
    "Expected object subtype for events[]."
  );
}

function testAmbiguousSemanticSubtypeResolution() {
  const result = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-ambiguous-a.json", 0, { mixedString: "12.5" }),
    buildMarketUnit("fixture-ambiguous-b.json", 0, { mixedString: "9.0" }),
    buildMarketUnit("fixture-ambiguous-c.json", 0, { mixedString: '["A", "B"]' }),
    buildMarketUnit("fixture-ambiguous-d.json", 0, { mixedString: '["C", "D"]' }),
  ]);

  const mixed = getProfile(result, "mixedString");

  assert.ok(mixed, "Expected typed profile for mixedString.");
  assert.equal(mixed.inferredType.kind, "string");
  assert.equal(mixed.inferredType.subtype, null);
  assert.ok(
    mixed.warnings.some((warning) => warning.includes("Semantic subtype unresolved")),
    "Expected unresolved subtype warning for ambiguous mixedString field."
  );
}

function testConfidenceCalibrationBySampleSize() {
  const smallSampleResult = inferProfilesFromMarketUnits([
    buildMarketUnit("fixture-small-conf-a.json", 0, { volume: "1.0" }),
    buildMarketUnit("fixture-small-conf-b.json", 0, { volume: "2.0" }),
    buildMarketUnit("fixture-small-conf-c.json", 0, { volume: "3.0" }),
  ]);

  const largeSampleMarketUnits = [];
  for (let index = 0; index < 30; index += 1) {
    largeSampleMarketUnits.push(
      buildMarketUnit(`fixture-large-conf-${index}.json`, 0, {
        volume: `${index + 1}.0`,
      })
    );
  }

  const largeSampleResult = inferProfilesFromMarketUnits(largeSampleMarketUnits);

  const smallVolume = getProfile(smallSampleResult, "volume");
  const largeVolume = getProfile(largeSampleResult, "volume");

  assert.ok(smallVolume && largeVolume, "Expected volume profile for both sample sizes.");
  assert.ok(
    smallVolume.confidence < largeVolume.confidence,
    "Expected lower confidence for small sample volume field."
  );
}

function main() {
  testNumericStringDetection();
  testJsonEncodedArrayDetection();
  testEnumLikeStringDetection();
  testOptionalAndNullableDistinction();
  testUnionLikeDetection();
  testArrayAndObjectDetectors();
  testAmbiguousSemanticSubtypeResolution();
  testConfidenceCalibrationBySampleSize();

  console.log("TYPE INFERENCE ACCEPTANCE TESTS PASSED");
}

main();
