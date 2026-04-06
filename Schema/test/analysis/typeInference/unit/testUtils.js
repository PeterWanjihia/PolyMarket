// test/analysis/typeInference/unit/testUtils.js

import assert from "node:assert/strict";
import {
  isNumericString,
  safeJsonParse,
  classifyRawKind,
} from "../../../../analysis/typeInference/index.js";
import { detectEnumLikeString } from "../../../../analysis/typeInference/detectors/string/detectEnumLikeString.js";

function testIsNumericString() {
  assert.equal(isNumericString("12"), true);
  assert.equal(isNumericString("-12.5"), true);
  assert.equal(isNumericString("0.01"), true);
  assert.equal(isNumericString(" 14.2 "), true);
  assert.equal(isNumericString(""), false);
  assert.equal(isNumericString("12a"), false);
  assert.equal(isNumericString("true"), false);
}

function testSafeJsonParse() {
  const valid = safeJsonParse('{"a":1}');
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.value, { a: 1 });

  const invalid = safeJsonParse("not-json");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.value, null);
}

function testClassifyRawKind() {
  assert.equal(classifyRawKind("x"), "string");
  assert.equal(classifyRawKind(1), "number");
  assert.equal(classifyRawKind(true), "boolean");
  assert.equal(classifyRawKind(null), "null");
  assert.equal(classifyRawKind([]), "array");
  assert.equal(classifyRawKind({}), "object");
}

function testEnumLikeHeuristic() {
  const enumContext = {
    observationsByRawKind: {
      string: [
        { value: "open" },
        { value: "closed" },
        { value: "open" },
        { value: "closed" },
        { value: "open" },
      ],
    },
  };

  const freeTextContext = {
    observationsByRawKind: {
      string: [
        { value: "Will BTC go up this week?" },
        { value: "How many states will flip?" },
        { value: "Can team A still qualify?" },
        { value: "What is total turnout?" },
        { value: "Will CPI cool this quarter?" },
      ],
    },
  };

  const enumCandidate = detectEnumLikeString(enumContext);
  const freeTextCandidate = detectEnumLikeString(freeTextContext);

  assert.equal(enumCandidate.candidateKind, "enum-like-string");
  assert.equal(enumCandidate.support, 1);
  assert.equal(freeTextCandidate.support, 0);
}

function main() {
  testIsNumericString();
  testSafeJsonParse();
  testClassifyRawKind();
  testEnumLikeHeuristic();

  console.log("TYPE INFERENCE UTIL UNIT TESTS PASSED");
}

main();
