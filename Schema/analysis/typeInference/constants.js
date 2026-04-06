// analysis/typeInference/constants.js

export const RAW_KINDS = [
  "string",
  "number",
  "boolean",
  "null",
  "array",
  "object",
  "unknown",
];

export const STRING_SEMANTIC_SUBTYPES_V1 = [
  "numeric-string",
  "json-encoded-array",
  "json-encoded-object",
  "enum-like-string",
];

export const INFERENCE_DEFAULTS = {
  minSupportRatio: 0.7,
  minSampleSizeForHighConfidence: 20,
};
