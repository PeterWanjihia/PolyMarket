// analysis/typeInference/core/buildInferenceContext.js

import { assertPathObservationBundle } from "../contracts.js";
import { RAW_KINDS } from "../constants.js";

function normalizeRawKindCounts(rawKindCounts = {}) {
  const normalized = {};

  for (const rawKind of RAW_KINDS) {
    const value = rawKindCounts[rawKind];
    normalized[rawKind] = Number.isInteger(value) && value >= 0 ? value : 0;
  }

  return normalized;
}

function toValueKey(value) {
  if (value === undefined) {
    return "undefined";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function buildInferenceContext(bundle) {
  assertPathObservationBundle(bundle, "bundle");

  const rawKindCounts = normalizeRawKindCounts(bundle.rawKindCounts);
  const observationsByRawKind = Object.fromEntries(
    RAW_KINDS.map((rawKind) => [rawKind, []])
  );

  for (const observation of bundle.observations) {
    const rawKind = observationsByRawKind[observation.rawKind]
      ? observation.rawKind
      : "unknown";
    observationsByRawKind[rawKind].push(observation);
  }

  const nonNullObservations = bundle.observations.filter(
    (observation) => observation.rawKind !== "null"
  );

  const distinctValueKeys = new Set(
    bundle.observations.map((observation) => toValueKey(observation.value))
  );

  return {
    path: bundle.path,
    totalMarketUnits: bundle.totalMarketUnits,
    presentCount: bundle.presentCount,
    missingCount: bundle.missingCount,
    occurrenceCount: bundle.occurrenceCount,
    coverageRatio: bundle.coverageRatio,
    observations: bundle.observations,
    rawKindCounts,
    observationsByRawKind,
    nonNullObservations,
    distinctValueCount: distinctValueKeys.size,
  };
}
