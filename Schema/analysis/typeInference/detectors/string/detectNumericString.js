// analysis/typeInference/detectors/string/detectNumericString.js

import { isNumericString } from "../../utils/isNumericString.js";

export function detectNumericString(context) {
  const stringObservations = context.observationsByRawKind.string;
  const testedCount = stringObservations.length;

  if (testedCount === 0) {
    return {
      detector: "detectNumericString",
      candidateKind: "numeric-string",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
    };
  }

  const matchingCount = stringObservations.filter((observation) =>
    isNumericString(observation.value)
  ).length;

  const support = matchingCount / testedCount;

  return {
    detector: "detectNumericString",
    candidateKind: "numeric-string",
    applicable: true,
    support,
    testedCount,
    matchingCount,
  };
}
