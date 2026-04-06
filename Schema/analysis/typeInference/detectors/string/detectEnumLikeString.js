// analysis/typeInference/detectors/string/detectEnumLikeString.js

export function detectEnumLikeString(context) {
  const stringObservations = context.observationsByRawKind.string;
  const testedCount = stringObservations.length;

  if (testedCount === 0) {
    return {
      detector: "detectEnumLikeString",
      candidateKind: "enum-like-string",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
      details: {
        distinctCount: 0,
      },
    };
  }

  const distinctValues = new Set(
    stringObservations.map((observation) => String(observation.value))
  );

  const distinctCount = distinctValues.size;
  const distinctRatio = distinctCount / testedCount;
  const maxDistinct = 12;
  const maxDistinctRatio = 0.4;

  const looksEnumLike =
    testedCount >= 5 &&
    distinctCount <= maxDistinct &&
    distinctRatio <= maxDistinctRatio;

  const support = looksEnumLike ? 1 : 0;

  return {
    detector: "detectEnumLikeString",
    candidateKind: "enum-like-string",
    applicable: true,
    support,
    testedCount,
    matchingCount: looksEnumLike ? testedCount : 0,
    details: {
      distinctCount,
      distinctRatio,
    },
  };
}
