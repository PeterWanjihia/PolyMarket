import { buildPageProbeJob } from "./requestPlanner.js";
import { executeJob } from "./httpExecutor.js";

async function probeSinglePage(profile, runId, pageNumber, pageSize) {
  const job = buildPageProbeJob(profile, runId, pageNumber, pageSize);
  const result = await executeJob(job);

  if (!result.ok) {
    return {
      ok: false,
      pageNumber,
      recordCount: null,
      isEmpty: null,
      job,
      result
    };
  }

  const recordCount = Array.isArray(result.data) ? result.data.length : 0;

  return {
    ok: true,
    pageNumber,
    recordCount,
    isEmpty: recordCount === 0,
    isPartial: recordCount > 0 && recordCount < pageSize,
    job,
    result
  };
}

export async function probeCardinality(profile, runId, pageSize = 50) {
  const pagesTested = [];
  const pageCache = new Map();

  async function getPage(pageNumber) {
    if (pageCache.has(pageNumber)) {
      return pageCache.get(pageNumber);
    }

    const probe = await probeSinglePage(profile, runId, pageNumber, pageSize);

    pagesTested.push({
      pageNumber: probe.pageNumber,
      ok: probe.ok,
      recordCount: probe.recordCount,
      isEmpty: probe.isEmpty
    });

    pageCache.set(pageNumber, probe);
    return probe;
  }

  // Probe first page
  const first = await getPage(1);

  if (!first.ok) {
    return {
      ok: false,
      profileId: profile.id,
      pageSize,
      error: {
        type: "probe_execution_error",
        message: "Probe failed on page 1"
      },
      pagesTested
    };
  }

  if (first.isEmpty) {
    return {
      ok: true,
      profileId: profile.id,
      pageSize,
      totalPages: 0,
      totalRecords: 0,
      lastNonEmptyPage: null,
      lastPageRecordCount: 0,
      pagesTested
    };
  }

  // If partial pages imply "last page", stop early
  if (first.isPartial) {
    return {
      ok: true,
      profileId: profile.id,
      pageSize,
      totalPages: 1,
      totalRecords: first.recordCount,
      lastNonEmptyPage: 1,
      lastPageRecordCount: first.recordCount,
      pagesTested
    };
  }

  // Exponential search to find an upper bound
  let low = 1;
  let high = 2;

  while (true) {
    const probe = await getPage(high);

    if (!probe.ok) {
      return {
        ok: false,
        profileId: profile.id,
        pageSize,
        error: {
          type: "probe_execution_error",
          message: `Probe failed on page ${high}`
        },
        pagesTested
      };
    }

    if (probe.isEmpty) {
      break;
    }

    if (probe.isPartial) {
      return {
        ok: true,
        profileId: profile.id,
        pageSize,
        totalPages: high,
        totalRecords: ((high - 1) * pageSize) + probe.recordCount,
        lastNonEmptyPage: high,
        lastPageRecordCount: probe.recordCount,
        pagesTested
      };
    }

    low = high;
    high *= 2;
  }

  // Binary search for last non-empty page in (low, high)
  let lastNonEmptyPage = low;
  let lastPageRecordCount = pageCache.get(low).recordCount;

  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);
    const probe = await getPage(mid);

    if (!probe.ok) {
      return {
        ok: false,
        profileId: profile.id,
        pageSize,
        error: {
          type: "probe_execution_error",
          message: `Probe failed on page ${mid}`
        },
        pagesTested
      };
    }

    if (probe.isEmpty) {
      high = mid;
      continue;
    }

    lastNonEmptyPage = mid;
    lastPageRecordCount = probe.recordCount;

    if (probe.isPartial) {
      // Partial means last page under standard pagination semantics
      return {
        ok: true,
        profileId: profile.id,
        pageSize,
        totalPages: mid,
        totalRecords: ((mid - 1) * pageSize) + probe.recordCount,
        lastNonEmptyPage: mid,
        lastPageRecordCount: probe.recordCount,
        pagesTested
      };
    }

    low = mid;
  }

  // We know `high` is empty, so `lastNonEmptyPage` is exact
  const totalPages = lastNonEmptyPage;
  const totalRecords = ((totalPages - 1) * pageSize) + lastPageRecordCount;

  return {
    ok: true,
    profileId: profile.id,
    pageSize,
    totalPages,
    totalRecords,
    lastNonEmptyPage,
    lastPageRecordCount,
    pagesTested
  };
}