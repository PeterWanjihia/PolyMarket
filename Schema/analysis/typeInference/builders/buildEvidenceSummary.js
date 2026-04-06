// analysis/typeInference/builders/buildEvidenceSummary.js

export function buildEvidenceSummary(context, candidates, resolved) {
  const rankedCandidates = [...candidates]
    .sort((a, b) => b.support - a.support)
    .slice(0, 5)
    .map((candidate) => ({
      subtype: candidate.candidateKind,
      detector: candidate.detector,
      support: Number(candidate.support.toFixed(4)),
      testedCount: candidate.testedCount,
      matchingCount: candidate.matchingCount,
    }));

  return {
    totalMarketUnits: context.totalMarketUnits,
    presentCount: context.presentCount,
    missingCount: context.missingCount,
    occurrenceCount: context.occurrenceCount,
    coverageRatio: context.coverageRatio,
    distinctValueCount: context.distinctValueCount,
    testedSemanticCandidates: candidates.length,
    winningSemanticCandidate: resolved.winningCandidate
      ? {
          subtype: resolved.winningCandidate.candidateKind,
          detector: resolved.winningCandidate.detector,
          support: Number(resolved.winningCandidate.support.toFixed(4)),
        }
      : null,
    topSemanticCandidates: rankedCandidates,
  };
}
