// analysis/typeInference/detectors/array/detectHomogeneousArray.js

import { classifyRawKind } from "../../utils/classifyRawKind.js";

export function detectHomogeneousArray(context) {
  const arrayObservations = context.observationsByRawKind.array;
  const testedCount = arrayObservations.length;

  if (testedCount === 0) {
    return {
      detector: "detectHomogeneousArray",
      candidateKind: "homogeneous-array",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
    };
  }

  let homogeneousCount = 0;

  for (const observation of arrayObservations) {
    const value = observation.value;
    const elementKinds = new Set(value.map((item) => classifyRawKind(item)));

    if (elementKinds.size <= 1) {
      homogeneousCount += 1;
    }
  }

  const homogeneousRatio = homogeneousCount / testedCount;
  const candidateKind =
    homogeneousRatio >= 0.5 ? "homogeneous-array" : "heterogeneous-array";
  const support =
    homogeneousRatio >= 0.5 ? homogeneousRatio : 1 - homogeneousRatio;

  return {
    detector: "detectHomogeneousArray",
    candidateKind,
    applicable: true,
    support,
    testedCount,
    matchingCount: candidateKind === "homogeneous-array" ? homogeneousCount : testedCount - homogeneousCount,
  };
}
