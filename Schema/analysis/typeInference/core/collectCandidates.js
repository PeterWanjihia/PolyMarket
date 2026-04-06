// analysis/typeInference/core/collectCandidates.js

import { detectNumericString } from "../detectors/string/detectNumericString.js";
import { detectJsonEncodedArray } from "../detectors/string/detectJsonEncodedArray.js";
import { detectJsonEncodedObject } from "../detectors/string/detectJsonEncodedObject.js";
import { detectEnumLikeString } from "../detectors/string/detectEnumLikeString.js";
import { detectHomogeneousArray } from "../detectors/array/detectHomogeneousArray.js";
import { detectArrayElementKinds } from "../detectors/array/detectArrayElementKinds.js";
import { detectStableObjectShape } from "../detectors/object/detectStableObjectShape.js";

export function collectCandidates(context) {
  const candidates = [];

  if ((context.rawKindCounts.string ?? 0) > 0) {
    candidates.push(detectNumericString(context));
    candidates.push(detectJsonEncodedArray(context));
    candidates.push(detectJsonEncodedObject(context));
    candidates.push(detectEnumLikeString(context));
  }

  if ((context.rawKindCounts.array ?? 0) > 0) {
    candidates.push(detectHomogeneousArray(context));
    candidates.push(detectArrayElementKinds(context));
  }

  if ((context.rawKindCounts.object ?? 0) > 0) {
    candidates.push(detectStableObjectShape(context));
  }

  return candidates.filter((candidate) => candidate.applicable);
}
