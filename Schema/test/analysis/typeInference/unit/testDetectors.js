// test/analysis/typeInference/unit/testDetectors.js

import assert from "node:assert/strict";
import { detectNumericString } from "../../../../analysis/typeInference/detectors/string/detectNumericString.js";
import { detectJsonEncodedArray } from "../../../../analysis/typeInference/detectors/string/detectJsonEncodedArray.js";
import { detectJsonEncodedObject } from "../../../../analysis/typeInference/detectors/string/detectJsonEncodedObject.js";
import { detectEnumLikeString } from "../../../../analysis/typeInference/detectors/string/detectEnumLikeString.js";

function buildStringContext(values) {
  return {
    observationsByRawKind: {
      string: values.map((value) => ({ value })),
    },
  };
}

function testNumericStringDetector() {
  const numeric = detectNumericString(buildStringContext(["1", "2.5", "0.1"]));
  const mixed = detectNumericString(buildStringContext(["1", "abc", "2.5"]));

  assert.equal(numeric.support, 1);
  assert.ok(mixed.support > 0 && mixed.support < 1);
}

function testJsonEncodedArrayDetector() {
  const candidate = detectJsonEncodedArray(
    buildStringContext(['["Yes", "No"]', '["Up", "Down"]', "not-json"])
  );

  assert.equal(candidate.candidateKind, "json-encoded-array");
  assert.ok(candidate.support > 0);
}

function testJsonEncodedObjectDetector() {
  const candidate = detectJsonEncodedObject(
    buildStringContext(['{"a":1}', '{"b":2}', "[]"])
  );

  assert.equal(candidate.candidateKind, "json-encoded-object");
  assert.ok(candidate.support > 0);
}

function testEnumLikeDetectorRejectsFreeText() {
  const freeText = detectEnumLikeString(
    buildStringContext([
      "Will BTC break ATH?",
      "Will inflation cool this quarter?",
      "How many seats flip in the senate?",
      "Will rates be cut by June?",
      "Will turnout exceed 2020 levels?",
    ])
  );

  assert.equal(freeText.support, 0);
}

function main() {
  testNumericStringDetector();
  testJsonEncodedArrayDetector();
  testJsonEncodedObjectDetector();
  testEnumLikeDetectorRejectsFreeText();

  console.log("TYPE INFERENCE DETECTOR UNIT TESTS PASSED");
}

main();
