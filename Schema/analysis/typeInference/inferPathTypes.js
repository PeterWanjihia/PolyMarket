// analysis/typeInference/inferPathTypes.js

import { inferPathType } from "./inferPathType.js";
import { isPathObservationBundle } from "./contracts.js";

export function inferPathTypes(pathBundlesResult, options = {}) {
  if (
    typeof pathBundlesResult !== "object" ||
    pathBundlesResult === null ||
    !Array.isArray(pathBundlesResult.pathBundles)
  ) {
    throw new Error(
      "inferPathTypes expected an object containing pathBundles[]."
    );
  }

  const invalidBundle = pathBundlesResult.pathBundles.find(
    (bundle) => !isPathObservationBundle(bundle)
  );

  if (invalidBundle) {
    throw new Error("inferPathTypes received an invalid PathObservationBundle.");
  }

  const typedPathProfiles = pathBundlesResult.pathBundles
    .map((bundle) => inferPathType(bundle, options))
    .sort((a, b) => a.path.localeCompare(b.path));

  const unionLikePathCount = typedPathProfiles.filter(
    (profile) => profile.fieldProperties.unionLike
  ).length;

  const nullablePathCount = typedPathProfiles.filter(
    (profile) => profile.fieldProperties.nullable
  ).length;

  const optionalPathCount = typedPathProfiles.filter(
    (profile) => profile.fieldProperties.optional
  ).length;

  return {
    ok: Boolean(pathBundlesResult.ok),
    marketUnitCount: pathBundlesResult.marketUnitCount,
    pathCount: typedPathProfiles.length,
    optionalPathCount,
    nullablePathCount,
    unionLikePathCount,
    typedPathProfiles,
    failures: Array.isArray(pathBundlesResult.failures)
      ? pathBundlesResult.failures
      : [],
  };
}
