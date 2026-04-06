// analysis/typeInference/field/inferOptionality.js

export function inferOptionality(context) {
  return {
    optional: context.missingCount > 0,
  };
}
