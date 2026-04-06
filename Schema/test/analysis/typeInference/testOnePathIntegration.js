// test/analysis/typeInference/testOnePathIntegration.js

import assert from "node:assert/strict";
import { inferPathType } from "../../../analysis/typeInference/index.js";

function buildVolumeBundle() {
  const observations = [
    {
      sourceFile: "fixture-one-path-a.json",
      provenance: { runId: "one-path" },
      marketIndex: 0,
      marketUnitId: "fixture-one-path-a.json::0",
      path: "volume",
      rawKind: "string",
      value: "12.5",
    },
    {
      sourceFile: "fixture-one-path-b.json",
      provenance: { runId: "one-path" },
      marketIndex: 0,
      marketUnitId: "fixture-one-path-b.json::0",
      path: "volume",
      rawKind: "string",
      value: "9.1",
    },
    {
      sourceFile: "fixture-one-path-c.json",
      provenance: { runId: "one-path" },
      marketIndex: 0,
      marketUnitId: "fixture-one-path-c.json::0",
      path: "volume",
      rawKind: "string",
      value: "0",
    },
  ];

  return {
    path: "volume",
    totalMarketUnits: 3,
    presentCount: 3,
    missingCount: 0,
    occurrenceCount: observations.length,
    coverageRatio: 1,
    rawKindCounts: {
      string: 3,
      number: 0,
      boolean: 0,
      null: 0,
      array: 0,
      object: 0,
      unknown: 0,
    },
    observations,
  };
}

function main() {
  const profile = inferPathType(buildVolumeBundle());

  assert.equal(profile.path, "volume");
  assert.equal(profile.fieldProperties.optional, false);
  assert.equal(profile.fieldProperties.nullable, false);
  assert.equal(profile.rawKindSummary.dominantRawKind, "string");
  assert.equal(profile.inferredType.kind, "string");
  assert.equal(profile.inferredType.subtype, "numeric-string");
  assert.ok(profile.evidenceSummary.topSemanticCandidates.length > 0);

  console.log("TYPE INFERENCE ONE-PATH INTEGRATION TEST PASSED");
}

main();
