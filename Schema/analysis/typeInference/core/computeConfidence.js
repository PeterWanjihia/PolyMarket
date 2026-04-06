// analysis/typeInference/core/computeConfidence.js

import { INFERENCE_DEFAULTS } from "../constants.js";

export function computeStructuralConfidence(context, dominantRawKind, unionLike, options = {}) {
  if (!dominantRawKind || context.occurrenceCount === 0) {
    return null;
  }

  const defaults = {
    ...INFERENCE_DEFAULTS,
    ...options,
  };

  const dominantCount = context.rawKindCounts[dominantRawKind] ?? 0;
  const supportRatio = dominantCount / context.occurrenceCount;

  if (context.occurrenceCount < defaults.minSampleSizeForHighConfidence) {
    return Number((supportRatio * 0.85).toFixed(4));
  }

  if (unionLike) {
    return Number((supportRatio * 0.75).toFixed(4));
  }

  return Number(supportRatio.toFixed(4));
}
