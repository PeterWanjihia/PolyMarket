// analysis/typeInference/detectors/array/detectArrayElementKinds.js

import { classifyRawKind } from "../../utils/classifyRawKind.js";

function subtypeForElementKind(elementKind) {
  if (elementKind === "string") {
    return "array-of-strings";
  }

  if (elementKind === "number") {
    return "array-of-numbers";
  }

  if (elementKind === "object") {
    return "array-of-objects";
  }

  return "array-of-mixed";
}

export function detectArrayElementKinds(context) {
  const arrayObservations = context.observationsByRawKind.array;

  if (arrayObservations.length === 0) {
    return {
      detector: "detectArrayElementKinds",
      candidateKind: "array-of-mixed",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
      details: {
        elementCount: 0,
      },
    };
  }

  const elementKindCounts = new Map();
  let elementCount = 0;

  for (const observation of arrayObservations) {
    for (const item of observation.value) {
      const kind = classifyRawKind(item);
      elementKindCounts.set(kind, (elementKindCounts.get(kind) ?? 0) + 1);
      elementCount += 1;
    }
  }

  if (elementCount === 0) {
    return {
      detector: "detectArrayElementKinds",
      candidateKind: "array-of-mixed",
      applicable: false,
      support: 0,
      testedCount: arrayObservations.length,
      matchingCount: 0,
      details: {
        elementCount,
      },
    };
  }

  const ranked = [...elementKindCounts.entries()].sort((a, b) => b[1] - a[1]);
  const [dominantElementKind, dominantCount] = ranked[0];

  return {
    detector: "detectArrayElementKinds",
    candidateKind: subtypeForElementKind(dominantElementKind),
    applicable: true,
    support: dominantCount / elementCount,
    testedCount: arrayObservations.length,
    matchingCount: dominantCount,
    details: {
      elementCount,
      dominantElementKind,
      elementKindCounts: Object.fromEntries(ranked),
    },
  };
}
