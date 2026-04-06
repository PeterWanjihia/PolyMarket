// analysis/typeInference/builders/buildTypedPathProfile.js

export function buildTypedPathProfile({
  context,
  fieldProperties,
  rawKindSummary,
  inferredType,
  confidence,
  warnings,
  alternates = [],
  evidenceSummary,
}) {
  return {
    path: context.path,
    fieldProperties,
    rawKindSummary,
    inferredType,
    alternates,
    confidence,
    warnings,
    evidenceSummary:
      evidenceSummary ?? {
        totalMarketUnits: context.totalMarketUnits,
        presentCount: context.presentCount,
        missingCount: context.missingCount,
        occurrenceCount: context.occurrenceCount,
        coverageRatio: context.coverageRatio,
        distinctValueCount: context.distinctValueCount,
      },
  };
}
