// analysis/typeInference/builders/buildRawKindSummary.js

import { RAW_KINDS } from "../constants.js";

export function buildRawKindSummary(context) {
  let dominantRawKind = null;
  let dominantCount = -1;

  for (const rawKind of RAW_KINDS) {
    const count = context.rawKindCounts[rawKind] ?? 0;

    if (count > dominantCount) {
      dominantRawKind = rawKind;
      dominantCount = count;
    }
  }

  if (context.occurrenceCount === 0) {
    dominantRawKind = null;
  }

  return {
    counts: context.rawKindCounts,
    dominantRawKind,
  };
}
