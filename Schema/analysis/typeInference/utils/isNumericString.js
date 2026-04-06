// analysis/typeInference/utils/isNumericString.js

export function isNumericString(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (!/^-?(?:\d+|\d*\.\d+)$/.test(trimmed)) {
    return false;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed);
}
