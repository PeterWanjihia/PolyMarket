// analysis/typeInference/field/inferNullability.js

export function inferNullability(context) {
  return {
    nullable: (context.rawKindCounts.null ?? 0) > 0,
  };
}
