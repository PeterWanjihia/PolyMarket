// analysis/typeInference/detectors/string/detectJsonEncodedArray.js

import { safeJsonParse } from "../../utils/safeJsonParse.js";

export function detectJsonEncodedArray(context) {
  const stringObservations = context.observationsByRawKind.string;
  const testedCount = stringObservations.length;

  if (testedCount === 0) {
    return {
      detector: "detectJsonEncodedArray",
      candidateKind: "json-encoded-array",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
    };
  }

  let matchingCount = 0;

  for (const observation of stringObservations) {
    const value = String(observation.value).trim();

    if (!value.startsWith("[")) {
      continue;
    }

    const parsed = safeJsonParse(value);

    if (parsed.ok && Array.isArray(parsed.value)) {
      matchingCount += 1;
    }
  }

  const support = matchingCount / testedCount;

  return {
    detector: "detectJsonEncodedArray",
    candidateKind: "json-encoded-array",
    applicable: true,
    support,
    testedCount,
    matchingCount,
  };
}
