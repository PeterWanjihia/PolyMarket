import fs from "fs/promises";
import path from "path";

export async function loadArchiveRun(archiveDir) {
  const entryNames = await fs.readdir(archiveDir);

  const jsonFileNames = entryNames
    .filter((name) => name.endsWith(".json"))
    .sort();

  const records = [];
  const failures = [];

  for (const fileName of jsonFileNames) {
    const filePath = path.join(archiveDir, fileName);

    try {
      const rawText = await fs.readFile(filePath, "utf8");
      const parsedRecord = JSON.parse(rawText);

      records.push({
        sourceFile: fileName,
        record: parsedRecord,
      });
    } catch (error) {
      failures.push({
        sourceFile: fileName,
        stage: "read-or-parse",
        error: error.message,
      });
    }
  }

  return {
    ok: failures.length === 0,
    archiveDir,
    discoveredFileCount: jsonFileNames.length,
    loadedCount: records.length,
    failedCount: failures.length,
    records,
    failures,
  };
}