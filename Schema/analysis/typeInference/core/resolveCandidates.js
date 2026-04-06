// analysis/typeInference/core/resolveCandidates.js

import { INFERENCE_DEFAULTS } from "../constants.js";

function subtypePriority(candidateKind) {
  if (candidateKind === "array-of-objects") {
    return 7;
  }

  if (candidateKind === "array-of-strings" || candidateKind === "array-of-numbers") {
    return 6;
  }

  if (candidateKind === "stable-object") {
    return 5;
  }

  if (candidateKind === "json-encoded-array") {
    return 4;
  }

  if (candidateKind === "json-encoded-object") {
    return 3;
  }

  if (candidateKind === "numeric-string") {
    return 2;
  }

  if (candidateKind === "enum-like-string") {
    return 1;
  }

  if (candidateKind === "homogeneous-array") {
    return 1;
  }

  return 0;
}

export function resolveCandidates(candidates, options = {}) {
  const settings = {
    ...INFERENCE_DEFAULTS,
    ...options,
  };

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return {
      subtype: null,
      alternates: [],
      confidence: null,
      warnings: [],
      winningCandidate: null,
    };
  }

  const ranked = [...candidates].sort((a, b) => {
    if (b.support !== a.support) {
      return b.support - a.support;
    }

    return subtypePriority(b.candidateKind) - subtypePriority(a.candidateKind);
  });

  const winner = ranked[0];

  if (winner.support < settings.minSupportRatio) {
    return {
      subtype: null,
      alternates: [],
      confidence: null,
      warnings: [
        `No semantic subtype met minSupportRatio (${settings.minSupportRatio}).`,
      ],
      winningCandidate: null,
    };
  }

  const alternates = ranked
    .slice(1)
    .filter((candidate) => candidate.support >= settings.minSupportRatio)
    .map((candidate) => ({
      subtype: candidate.candidateKind,
      support: Number(candidate.support.toFixed(4)),
      detector: candidate.detector,
    }));

  const warnings = [];

  if (ranked.length > 1 && ranked[1].support >= winner.support - 0.1) {
    warnings.push("Competing semantic subtype candidates have close support.");
  }

  return {
    subtype: winner.candidateKind,
    alternates,
    confidence: Number(winner.support.toFixed(4)),
    warnings,
    winningCandidate: winner,
  };
}
