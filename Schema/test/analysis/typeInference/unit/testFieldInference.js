// test/analysis/typeInference/unit/testFieldInference.js

import assert from "node:assert/strict";
import { inferOptionality } from "../../../../analysis/typeInference/field/inferOptionality.js";
import { inferNullability } from "../../../../analysis/typeInference/field/inferNullability.js";
import { inferRepetition } from "../../../../analysis/typeInference/field/inferRepetition.js";
import { inferUnionLike } from "../../../../analysis/typeInference/field/inferUnionLike.js";
import { inferStability } from "../../../../analysis/typeInference/field/inferStability.js";

function buildContext(overrides = {}) {
  return {
    missingCount: 0,
    presentCount: 10,
    occurrenceCount: 10,
    rawKindCounts: {
      string: 10,
      number: 0,
      boolean: 0,
      null: 0,
      array: 0,
      object: 0,
      unknown: 0,
    },
    nonNullObservations: new Array(10).fill({ rawKind: "string" }),
    ...overrides,
  };
}

function testOptionality() {
  assert.equal(inferOptionality(buildContext({ missingCount: 0 })).optional, false);
  assert.equal(inferOptionality(buildContext({ missingCount: 2 })).optional, true);
}

function testNullability() {
  assert.equal(inferNullability(buildContext()).nullable, false);
  assert.equal(
    inferNullability(
      buildContext({ rawKindCounts: { ...buildContext().rawKindCounts, null: 3 } })
    ).nullable,
    true
  );
}

function testRepetition() {
  assert.equal(inferRepetition(buildContext({ occurrenceCount: 10, presentCount: 10 })).repeated, false);
  assert.equal(inferRepetition(buildContext({ occurrenceCount: 15, presentCount: 10 })).repeated, true);
}

function testUnionLikeAndStability() {
  const unionContext = buildContext({
    rawKindCounts: {
      string: 6,
      number: 4,
      boolean: 0,
      null: 0,
      array: 0,
      object: 0,
      unknown: 0,
    },
    nonNullObservations: new Array(10).fill({ rawKind: "string" }),
  });

  const singleKindContext = buildContext({
    rawKindCounts: {
      string: 10,
      number: 0,
      boolean: 0,
      null: 0,
      array: 0,
      object: 0,
      unknown: 0,
    },
  });

  const union = inferUnionLike(unionContext);
  const single = inferUnionLike(singleKindContext);

  assert.equal(union.unionLike, true);
  assert.equal(single.unionLike, false);

  assert.equal(inferStability(unionContext, union.unionLike).stable, false);
  assert.equal(inferStability(singleKindContext, single.unionLike).stable, true);
}

function main() {
  testOptionality();
  testNullability();
  testRepetition();
  testUnionLikeAndStability();

  console.log("TYPE INFERENCE FIELD UNIT TESTS PASSED");
}

main();
