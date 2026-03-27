import { baselineMarketsProfile } from "./queryProfile.js";
import { runCrawl } from "./crawlOrchestrator.js";

async function runTest() {
  const testRunId = "crawl-run-001";

  const crawlResult = await runCrawl(baselineMarketsProfile, testRunId);

  console.log("CRAWL RESULT:");
  console.log(JSON.stringify(crawlResult, null, 2));
}

runTest();