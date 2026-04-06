// analysis/typeInference/field/inferRepetition.js

export function inferRepetition(context) {
  return {
    repeated: context.occurrenceCount > context.presentCount,
  };
}
