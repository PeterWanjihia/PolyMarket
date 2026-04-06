// analysis/pathExtraction/pathProfileBuilder.js

function buildMarketUnitKey(observation) {
  return `${observation.sourceFile}::${observation.marketIndex}`;
}

export function buildPathProfile(path, observationsForPath, totalMarketUnits) {
  if (!Array.isArray(observationsForPath)) {
    throw new Error("buildPathProfile expected observationsForPath to be an array.");
  }

  if (!Number.isInteger(totalMarketUnits) || totalMarketUnits < 0) {
    throw new Error("buildPathProfile expected totalMarketUnits to be a non-negative integer.");
  }

  const marketUnitKeys = new Set();

  for (const observation of observationsForPath) {
    marketUnitKeys.add(buildMarketUnitKey(observation));
  }

  const presentCount = marketUnitKeys.size;
  const missingCount = totalMarketUnits - presentCount;
  const occurrenceCount = observationsForPath.length;
  const coverageRatio =
    totalMarketUnits === 0 ? 0 : presentCount / totalMarketUnits;

  return {
    path,
    totalMarketUnits,
    presentCount,
    missingCount,
    occurrenceCount,
    coverageRatio,
    observations: observationsForPath,
  };
}

export function buildPathProfiles(observations, totalMarketUnits) {
  if (!Array.isArray(observations)) {
    throw new Error("buildPathProfiles expected observations to be an array.");
  }

  if (!Number.isInteger(totalMarketUnits) || totalMarketUnits < 0) {
    throw new Error("buildPathProfiles expected totalMarketUnits to be a non-negative integer.");
  }

  const observationsByPath = new Map();

  for (const observation of observations) {
    const { path } = observation;

    if (!observationsByPath.has(path)) {
      observationsByPath.set(path, []);
    }

    observationsByPath.get(path).push(observation);
  }

  const profiles = [];

  for (const [path, observationsForPath] of observationsByPath.entries()) {
    profiles.push(
      buildPathProfile(path, observationsForPath, totalMarketUnits)
    );
  }

  profiles.sort((a, b) => a.path.localeCompare(b.path));

  return {
    ok: true,
    totalMarketUnits,
    pathCount: profiles.length,
    profiles,
  };
}