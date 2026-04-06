// analysis/typeInference/utils/safeJsonParse.js

export function safeJsonParse(value) {
  try {
    return {
      ok: true,
      value: JSON.parse(value),
    };
  } catch {
    return {
      ok: false,
      value: null,
    };
  }
}
