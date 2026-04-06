// test/analysis/typeInference/testTypeInference.js

import path from "path";
import { loadArchiveRun } from "../../../analysis/archiveLoader.js";
import { extractMarkets } from "../../../analysis/marketExtractor.js";
import {
	extractPathObservationsFromMarketUnits,
	bundlePathObservations,
} from "../../../analysis/pathExtraction/index.js";
import { inferPathTypes } from "../../../analysis/typeInference/index.js";

async function main() {
	const archiveDirArg = process.argv[2];
	const marketLimitArg = process.argv[3] ?? "125";

	if (!archiveDirArg) {
		console.error(
			"Usage: node test/analysis/typeInference/testTypeInference.js <archiveDir> [marketLimit]"
		);
		process.exit(1);
	}

	const marketLimit = Number.parseInt(marketLimitArg, 10);

	if (!Number.isInteger(marketLimit) || marketLimit < 1) {
		throw new Error('Expected "marketLimit" to be a positive integer.');
	}

	const archiveDir = path.resolve(archiveDirArg);

	const loadResult = await loadArchiveRun(archiveDir);
	const marketResult = extractMarkets(loadResult.records);
	const marketUnits = marketResult.markets.slice(0, marketLimit);

	const extractionResult = extractPathObservationsFromMarketUnits(marketUnits);
	const bundleResult = bundlePathObservations(extractionResult);
	const typedResult = inferPathTypes(bundleResult);

	console.log("TYPE INFERENCE (MILESTONE 3) SUMMARY");
	console.log(
		JSON.stringify(
			{
				ok: typedResult.ok,
				marketUnitCount: typedResult.marketUnitCount,
				pathCount: typedResult.pathCount,
				optionalPathCount: typedResult.optionalPathCount,
				nullablePathCount: typedResult.nullablePathCount,
				unionLikePathCount: typedResult.unionLikePathCount,
			},
			null,
			2
		)
	);

	const inspectPaths = [
		"volume",
		"outcomes",
		"events",
		"events[]",
		"feeType",
	];

	for (const targetPath of inspectPaths) {
		const profile = typedResult.typedPathProfiles.find(
			(item) => item.path === targetPath
		);

		if (!profile) {
			continue;
		}

		console.log(`\nTYPED PATH PROFILE: ${targetPath}`);
		console.log(
			JSON.stringify(
				{
					path: profile.path,
					fieldProperties: profile.fieldProperties,
					rawKindSummary: profile.rawKindSummary,
					inferredType: profile.inferredType,
					  alternates: profile.alternates,
					confidence: profile.confidence,
					warnings: profile.warnings,
					evidenceSummary: profile.evidenceSummary,
				},
				null,
				2
			)
		);
	}
}

main().catch((error) => {
	console.error("TYPE INFERENCE TEST FAILED");
	console.error(error);
	process.exit(1);
});
