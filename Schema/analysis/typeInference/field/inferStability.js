// analysis/typeInference/field/inferStability.js

export function inferStability(context, unionLike) {
  const nonNullCount = context.nonNullObservations.length;

  if (nonNullCount === 0) {
    return {
      stable: true,
    };
  }

  const nonNullKindCounts = Object.entries(context.rawKindCounts)
    .filter(([rawKind]) => rawKind !== "null")
    .map(([, count]) => count);

  const maxCount = nonNullKindCounts.reduce(
    (currentMax, count) => Math.max(currentMax, count),
    0
  );

  const dominantRatio = maxCount / nonNullCount;

  return {
    stable: !unionLike && dominantRatio >= 0.9,
  };
}
