// analysis/pathExtraction/pathProfileBuilder.js

function buildMarketUnitKey(observation) {
  return `${observation.sourceFile}::${observation.marketIndex}`;
}

function sortObservationsDeterministically(observationsForPath) {
  return [...observationsForPath].sort((a, b) => {
    const sourceFileCompare = String(a.sourceFile).localeCompare(String(b.sourceFile));
    if (sourceFileCompare !== 0) {
      return sourceFileCompare;
    }

    const marketIndexCompare = a.marketIndex - b.marketIndex;
    if (marketIndexCompare !== 0) {
      return marketIndexCompare;
    }

    const orderA = Number.isInteger(a.observationOrder) ? a.observationOrder : 0;
    const orderB = Number.isInteger(b.observationOrder) ? b.observationOrder : 0;
    return orderA - orderB;
  });
}

function buildRawKindCounts(observationsForPath) {
  const rawKindCounts = {
    string: 0,
    number: 0,
    boolean: 0,
    null: 0,
    array: 0,
    object: 0,
    unknown: 0,
  };

  for (const observation of observationsForPath) {
    const rawKind = observation.rawKind;

    if (Object.prototype.hasOwnProperty.call(rawKindCounts, rawKind)) {
      rawKindCounts[rawKind] += 1;
      continue;
    }

    rawKindCounts.unknown += 1;
  }

  return rawKindCounts;
}

export function buildPathProfile(path, observationsForPath, totalMarketUnits) {
  if (!Array.isArray(observationsForPath)) {
    throw new Error("buildPathProfile expected observationsForPath to be an array.");
  }

  if (!Number.isInteger(totalMarketUnits) || totalMarketUnits < 0) {
    throw new Error("buildPathProfile expected totalMarketUnits to be a non-negative integer.");
  }

  const sortedObservations = sortObservationsDeterministically(observationsForPath);
  const marketUnitKeys = new Set();

  for (const observation of sortedObservations) {
    marketUnitKeys.add(buildMarketUnitKey(observation));
  }

  const presentCount = marketUnitKeys.size;
  const missingCount = totalMarketUnits - presentCount;
  const occurrenceCount = sortedObservations.length;
  const coverageRatio =
    totalMarketUnits === 0 ? 0 : presentCount / totalMarketUnits;
  const rawKindCounts = buildRawKindCounts(sortedObservations);

  return {
    path,
    totalMarketUnits,
    presentCount,
    missingCount,
    occurrenceCount,
    coverageRatio,
    rawKindCounts,
    observations: sortedObservations,
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