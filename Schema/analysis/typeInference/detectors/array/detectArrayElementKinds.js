// analysis/typeInference/detectors/array/detectArrayElementKinds.js

function getRawKind(value) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  const valueType = typeof value;

  if (valueType === "object") {
    return "object";
  }

  if (valueType === "string") {
    return "string";
  }

  if (valueType === "number") {
    return "number";
  }

  if (valueType === "boolean") {
    return "boolean";
  }

  return "unknown";
}

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
      const kind = getRawKind(item);
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
