// analysis/typeInference/contracts.js

import { RAW_KINDS } from "./constants.js";

const RAW_KIND_SET = new Set(RAW_KINDS);

/**
 * PathObservation (upstream evidence item)
 * @typedef {Object} PathObservation
 * @property {string} sourceFile
 * @property {Object} provenance
 * @property {number} marketIndex
 * @property {string} marketUnitId
 * @property {string} path
 * @property {string} rawKind
 * @property {any} value
 */

/**
 * PathObservationBundle (upstream contract for one path)
 * @typedef {Object} PathObservationBundle
 * @property {string} path
 * @property {number} totalMarketUnits
 * @property {number} presentCount
 * @property {number} missingCount
 * @property {number} occurrenceCount
 * @property {number} coverageRatio
 * @property {Record<string, number>} rawKindCounts
 * @property {PathObservation[]} observations
 */

/**
 * TypedPathProfile (typeInference output for one path)
 * @typedef {Object} TypedPathProfile
 * @property {string} path
 * @property {Object} fieldProperties
 * @property {boolean} fieldProperties.optional
 * @property {boolean} fieldProperties.nullable
 * @property {boolean} fieldProperties.repeated
 * @property {boolean} fieldProperties.unionLike
 * @property {boolean} fieldProperties.stable
 * @property {Object} rawKindSummary
 * @property {Record<string, number>} rawKindSummary.counts
 * @property {string|null} rawKindSummary.dominantRawKind
 * @property {Object} inferredType
 * @property {string|null} inferredType.kind
 * @property {string|null} inferredType.subtype
 * @property {number|null} confidence
 * @property {string[]} warnings
 */

function isFiniteNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function isPathObservation(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    typeof value.sourceFile === "string" &&
    typeof value.marketIndex === "number" &&
    typeof value.marketUnitId === "string" &&
    typeof value.path === "string" &&
    typeof value.provenance === "object" &&
    value.provenance !== null &&
    typeof value.rawKind === "string" &&
    RAW_KIND_SET.has(value.rawKind)
  );
}

export function isPathObservationBundle(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!Array.isArray(value.observations)) {
    return false;
  }

  return (
    typeof value.path === "string" &&
    isFiniteNonNegativeInteger(value.totalMarketUnits) &&
    isFiniteNonNegativeInteger(value.presentCount) &&
    isFiniteNonNegativeInteger(value.missingCount) &&
    isFiniteNonNegativeInteger(value.occurrenceCount) &&
    typeof value.coverageRatio === "number" &&
    typeof value.rawKindCounts === "object" &&
    value.rawKindCounts !== null &&
    value.observations.every(isPathObservation)
  );
}

export function assertPathObservationBundle(value, label = "bundle") {
  if (!isPathObservationBundle(value)) {
    throw new Error(`Expected ${label} to be a valid PathObservationBundle.`);
  }
}
