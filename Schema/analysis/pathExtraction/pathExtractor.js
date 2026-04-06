// analysis/pathExtraction/pathExtractor.js

import { getNodeKind } from "./nodeKind.js";
import { ROOT_PATH, joinObjectPath, joinArrayItemPath } from "./pathUtils.js";

function getRawKind(value) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (typeof value === "object") {
    return "object";
  }

  if (typeof value === "string") {
    return "string";
  }

  if (typeof value === "number") {
    return "number";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  return "unknown";
}

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

function buildObservation(marketUnit, path, value, observationOrder) {
  return {
    sourceFile: marketUnit.sourceFile,
    provenance: marketUnit.provenance,
    marketIndex: marketUnit.marketIndex,
    marketUnitId: `${marketUnit.sourceFile}::${marketUnit.marketIndex}`,
    path,
    nodeKind: getNodeKind(value),
    rawKind: getRawKind(value),
    observationOrder,
    value,
  };
}

function walkNode(value, currentPath, marketUnit, observations, state) {
  const observationOrder = state.nextObservationOrder;
  state.nextObservationOrder += 1;

  observations.push(
    buildObservation(marketUnit, currentPath, value, observationOrder)
  );

  const nodeKind = getNodeKind(value);

  if (nodeKind === "null" || nodeKind === "primitive") {
    return;
  }

  if (nodeKind === "object") {
    for (const key of Object.keys(value)) {
      const childValue = value[key];
      const childPath = joinObjectPath(currentPath, key);

      walkNode(childValue, childPath, marketUnit, observations, state);
    }

    return;
  }

  if (nodeKind === "array") {
    const itemPath = joinArrayItemPath(currentPath);

    for (const item of value) {
      walkNode(item, itemPath, marketUnit, observations, state);
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
  const state = {
    nextObservationOrder: 0,
  };
  walkNode(marketUnit.market, ROOT_PATH, marketUnit, observations, state);

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