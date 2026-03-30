export function planRequest(profile, runId = Date.now()) {
  const jobs = [];

  const { 
    id: profileId, 
    endpoint, 
    baseParams, 
    pagination, 
    mode, 
    provenanceTags 
  } = profile;
  
  const { pageSize, initialPages } = pagination;

  for (let pageIndex = 0; pageIndex < initialPages; pageIndex++) {
    const offset = pageIndex * pageSize;

    const params = {
      ...baseParams,
      limit: pageSize,
      offset: offset
    };

    const job = {
      jobId: `${profileId}-run-${runId}-page-${pageIndex + 1}`, 
      profileId: profileId,
      endpoint: endpoint,
      mode: mode, 
      pageNumber: pageIndex + 1,
      params: params,
      provenanceTags: provenanceTags 
    };

    jobs.push(job);
  } 

  return jobs; 
}

export function buildPageProbeJob(profile, runId, pageNumber, pageSize) {
  const profileId = profile.id;
  const endpoint = profile.endpoint;
  const baseParams = profile.baseParams;

  const offset = (pageNumber - 1) * pageSize;

  const params = {
    ...baseParams,
    limit: pageSize,
    offset: offset
  };

  return {
    jobId: `${profileId}-run-${runId}-page-${pageNumber}`,
    profileId: profileId,
    endpoint: endpoint,
    mode: profile.mode,
    pageNumber: pageNumber,
    params: params,
    provenanceTags: profile.provenanceTags
  };
}