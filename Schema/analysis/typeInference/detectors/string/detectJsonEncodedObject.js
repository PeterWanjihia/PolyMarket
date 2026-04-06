// analysis/typeInference/detectors/string/detectJsonEncodedObject.js

import { safeJsonParse } from "../../utils/safeJsonParse.js";

function isNonNullObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function detectJsonEncodedObject(context) {
  const stringObservations = context.observationsByRawKind.string;
  const testedCount = stringObservations.length;

  if (testedCount === 0) {
    return {
      detector: "detectJsonEncodedObject",
      candidateKind: "json-encoded-object",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
    };
  }

  let matchingCount = 0;

  for (const observation of stringObservations) {
    const value = String(observation.value).trim();

    if (!value.startsWith("{")) {
      continue;
    }

    const parsed = safeJsonParse(value);

    if (parsed.ok && isNonNullObject(parsed.value)) {
      matchingCount += 1;
    }
  }

  const support = matchingCount / testedCount;

  return {
    detector: "detectJsonEncodedObject",
    candidateKind: "json-encoded-object",
    applicable: true,
    support,
    testedCount,
    matchingCount,
  };
}
