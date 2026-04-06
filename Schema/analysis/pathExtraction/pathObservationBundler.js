// analysis/pathExtraction/pathObservationBundler.js

import { buildPathProfiles } from "./pathProfileBuilder.js";

function isValidExtractionResult(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray(value.observations) &&
    Number.isInteger(value.marketUnitCount) &&
    value.marketUnitCount >= 0
  );
}

export function bundlePathObservations(extractionResult) {
  if (!isValidExtractionResult(extractionResult)) {
    throw new Error(
      "bundlePathObservations expected an extraction result with observations[] and marketUnitCount."
    );
  }

  const profileResult = buildPathProfiles(
    extractionResult.observations,
    extractionResult.marketUnitCount
  );
  const failures = Array.isArray(extractionResult.failures)
    ? extractionResult.failures
    : [];

  return {
    ok: Boolean(extractionResult.ok) && profileResult.ok,
    marketUnitCount: extractionResult.marketUnitCount,
    observationCount: extractionResult.observationCount,
    pathCount: profileResult.pathCount,
    failedCount: failures.length,
    pathBundles: profileResult.profiles,
    failures,
  };
}
