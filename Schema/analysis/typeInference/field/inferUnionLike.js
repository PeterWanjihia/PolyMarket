// analysis/typeInference/field/inferUnionLike.js

import { RAW_KINDS } from "../constants.js";

export function inferUnionLike(context) {
  const nonNullKindsSeen = RAW_KINDS.filter(
    (rawKind) => rawKind !== "null" && (context.rawKindCounts[rawKind] ?? 0) > 0
  );

  return {
    unionLike: nonNullKindsSeen.length > 1,
    nonNullKindsSeen,
  };
}
