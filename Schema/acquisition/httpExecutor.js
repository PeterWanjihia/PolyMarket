const GAMMA_BASE_URL = "https://gamma-api.polymarket.com";

function buildUrl(endpoint, params = {}) {
  const url = new URL(endpoint, GAMMA_BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export async function executeJob(job) {
  const url = buildUrl(job.endpoint, job.params);

  try {
    const response = await fetch(url);

    const status = response.status;
    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        jobId: job.jobId,
        profileId: job.profileId,
        endpoint: job.endpoint,
        mode: job.mode,
        pageNumber: job.pageNumber,
        provenanceTags: job.provenanceTags,
        url,
        status,
        data: null,
        error: {
          type: "http_error",
          message: `HTTP request failed with status ${status}`,
          details: data
        }
      };
    }

    return {
      ok: true,
      jobId: job.jobId,
      profileId: job.profileId,
      endpoint: job.endpoint,
      mode: job.mode,
      pageNumber: job.pageNumber,
      provenanceTags: job.provenanceTags,
      url,
      status,
      data,
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      jobId: job.jobId,
      profileId: job.profileId,
      endpoint: job.endpoint,
      mode: job.mode,
      pageNumber: job.pageNumber,
      provenanceTags: job.provenanceTags,
      url,
      status: null,
      data: null,
      error: {
        type: "execution_error",
        message: error.message
      }
    };
  }
}