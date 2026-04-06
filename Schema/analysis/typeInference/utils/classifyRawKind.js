// analysis/typeInference/utils/classifyRawKind.js

export function classifyRawKind(value) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  const valueType = typeof value;

  if (valueType === "object") {
    return "object";
  }

  if (valueType === "string") {
    return "string";
  }

  if (valueType === "number") {
    return "number";
  }

  if (valueType === "boolean") {
    return "boolean";
  }

  return "unknown";
}
