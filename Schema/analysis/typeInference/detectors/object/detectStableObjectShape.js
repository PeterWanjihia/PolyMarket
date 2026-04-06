// analysis/typeInference/detectors/object/detectStableObjectShape.js

function getObjectShapeSignature(value) {
  const keys = Object.keys(value).sort();
  return keys.join("|");
}

export function detectStableObjectShape(context) {
  const objectObservations = context.observationsByRawKind.object;
  const testedCount = objectObservations.length;

  if (testedCount === 0) {
    return {
      detector: "detectStableObjectShape",
      candidateKind: "stable-object",
      applicable: false,
      support: 0,
      testedCount: 0,
      matchingCount: 0,
      details: {
        distinctShapeCount: 0,
      },
    };
  }

  const shapeCounts = new Map();

  for (const observation of objectObservations) {
    const signature = getObjectShapeSignature(observation.value);
    shapeCounts.set(signature, (shapeCounts.get(signature) ?? 0) + 1);
  }

  const ranked = [...shapeCounts.entries()].sort((a, b) => b[1] - a[1]);
  const dominantCount = ranked[0][1];
  const dominantRatio = dominantCount / testedCount;
  const stableThreshold = 0.8;
  const stable = dominantRatio >= stableThreshold;

  return {
    detector: "detectStableObjectShape",
    candidateKind: stable ? "stable-object" : "dynamic-record",
    applicable: true,
    support: stable ? dominantRatio : 1 - dominantRatio,
    testedCount,
    matchingCount: stable ? dominantCount : testedCount - dominantCount,
    details: {
      distinctShapeCount: ranked.length,
      dominantRatio,
    },
  };
}
