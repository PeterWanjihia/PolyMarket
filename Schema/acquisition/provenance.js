export function buildProvenance(job, result) {
  return {
    runId: extractRunId(job.jobId),
    capturedAt: new Date().toISOString(),

    profileId: job.profileId,
    profileMode: job.mode,
    provenanceTags: job.provenanceTags,

    jobId: job.jobId,
    pageNumber: job.pageNumber,
    endpoint: job.endpoint,
    params: job.params,

    url: result.url,
    status: result.status,
    ok: result.ok
  };
}

function extractRunId(jobId) {
  const marker = "-run-";
  const pageMarker = "-page-";

  const runStart = jobId.indexOf(marker);
  const pageStart = jobId.lastIndexOf(pageMarker);

  if (runStart === -1 || pageStart === -1 || pageStart <= runStart) {
    return null;
  }

  return jobId.slice(runStart + marker.length, pageStart);
}