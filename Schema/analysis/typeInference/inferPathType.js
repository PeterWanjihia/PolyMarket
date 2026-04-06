// analysis/typeInference/inferPathType.js

import { buildInferenceContext } from "./core/buildInferenceContext.js";
import { computeStructuralConfidence } from "./core/computeConfidence.js";
import { collectCandidates } from "./core/collectCandidates.js";
import { resolveCandidates } from "./core/resolveCandidates.js";
import { inferOptionality } from "./field/inferOptionality.js";
import { inferNullability } from "./field/inferNullability.js";
import { inferRepetition } from "./field/inferRepetition.js";
import { inferUnionLike } from "./field/inferUnionLike.js";
import { inferStability } from "./field/inferStability.js";
import { buildRawKindSummary } from "./builders/buildRawKindSummary.js";
import { buildEvidenceSummary } from "./builders/buildEvidenceSummary.js";
import { buildTypedPathProfile } from "./builders/buildTypedPathProfile.js";

export function inferPathType(pathObservationBundle, options = {}) {
  const context = buildInferenceContext(pathObservationBundle);

  const optionality = inferOptionality(context);
  const nullability = inferNullability(context);
  const repetition = inferRepetition(context);
  const { unionLike, nonNullKindsSeen } = inferUnionLike(context);
  const stability = inferStability(context, unionLike);

  const fieldProperties = {
    optional: optionality.optional,
    nullable: nullability.nullable,
    repeated: repetition.repeated,
    unionLike,
    stable: stability.stable,
  };

  const rawKindSummary = buildRawKindSummary(context);

  const candidates = collectCandidates(context);
  const resolved = resolveCandidates(candidates, options);

  const inferredType = {
    kind: rawKindSummary.dominantRawKind,
    subtype: resolved.subtype,
  };

  const warnings = [...resolved.warnings];

  if (unionLike) {
    warnings.push(
      `Multiple non-null raw kinds observed: ${nonNullKindsSeen.join(", ")}`
    );
  }

  if (context.occurrenceCount < 5) {
    warnings.push("Low sample size for robust inference.");
  }

  if (resolved.subtype === null && candidates.length > 0) {
    warnings.push("Semantic subtype unresolved; falling back to raw kind.");
  }

  const confidence = computeStructuralConfidence(
    context,
    rawKindSummary.dominantRawKind,
    unionLike,
    options
  );

  const mergedConfidence =
    confidence === null
      ? resolved.confidence
      : resolved.confidence === null
        ? confidence
        : Number(((confidence + resolved.confidence) / 2).toFixed(4));

  if (mergedConfidence !== null && mergedConfidence < 0.8) {
    warnings.push("Low confidence inference; review evidence before relying on subtype.");
  }

  const evidenceSummary = buildEvidenceSummary(context, candidates, resolved);

  return buildTypedPathProfile({
    context,
    fieldProperties,
    rawKindSummary,
    inferredType,
    confidence: mergedConfidence,
    warnings,
    alternates: resolved.alternates,
    evidenceSummary,
  });
}
