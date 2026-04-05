// analysis/pathExtraction/pathExtractor.js

import { getNodeKind } from "./nodeKind.js";
import { ROOT_PATH, joinObjectPath, joinArrayItemPath } from "./pathUtils.js";

function isMarketUnit(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(value, "sourceFile") &&
    Object.prototype.hasOwnProperty.call(value, "provenance") &&
    Object.prototype.hasOwnProperty.call(value, "marketIndex") &&
    Object.prototype.hasOwnProperty.call(value, "market")
  );
}

function buildObservation(marketUnit, path, value) {
  return {
    sourceFile: marketUnit.sourceFile,
    provenance: marketUnit.provenance,
    marketIndex: marketUnit.marketIndex,
    path,
    nodeKind: getNodeKind(value),
    value,
  };
}

function walkNode(value, currentPath, marketUnit, observations) {
  observations.push(buildObservation(marketUnit, currentPath, value));

  const nodeKind = getNodeKind(value);

  if (nodeKind === "null" || nodeKind === "primitive") {
    return;
  }

  if (nodeKind === "object") {
    for (const key of Object.keys(value)) {
      const childValue = value[key];
      const childPath = joinObjectPath(currentPath, key);

      walkNode(childValue, childPath, marketUnit, observations);
    }

    return;
  }

  if (nodeKind === "array") {
    const itemPath = joinArrayItemPath(currentPath);

    for (const item of value) {
      walkNode(item, itemPath, marketUnit, observations);
    }
  }
}

export function extractPathObservationsFromMarketUnit(marketUnit) {
  if (!isMarketUnit(marketUnit)) {
    throw new Error(
      "extractPathObservationsFromMarketUnit expected a valid market unit."
    );
  }

  const observations = [];
  walkNode(marketUnit.market, ROOT_PATH, marketUnit, observations);

  return {
    ok: true,
    observationCount: observations.length,
    observations,
  };
}

export function extractPathObservationsFromMarketUnits(marketUnits) {
  if (!Array.isArray(marketUnits)) {
    throw new Error(
      "extractPathObservationsFromMarketUnits expected an array of market units."
    );
  }

  const observations = [];
  const failures = [];

  for (const marketUnit of marketUnits) {
    try {
      const result = extractPathObservationsFromMarketUnit(marketUnit);
      observations.push(...result.observations);
    } catch (error) {
      failures.push({
        sourceFile: marketUnit?.sourceFile ?? null,
        marketIndex: marketUnit?.marketIndex ?? null,
        stage: "extract-market-paths",
        error: error.message,
      });
    }
  }

  return {
    ok: failures.length === 0,
    marketUnitCount: marketUnits.length,
    observationCount: observations.length,
    failedCount: failures.length,
    observations,
    failures,
  };
}