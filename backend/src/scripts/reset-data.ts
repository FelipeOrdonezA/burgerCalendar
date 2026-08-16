import { readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function resetData(): Promise<void> {
  const dataPath = resolve(process.cwd(), "src", "data");
  const dataFiles = (await readdir(dataPath)).filter((fileName) => fileName.endsWith(".json"));

  await Promise.all(
    dataFiles.map((fileName) => {
      const filePath = resolve(dataPath, fileName);
      return writeFile(filePath, "[]\n", "utf-8");
    }),
  );

  console.log(`Data files reset successfully: ${dataFiles.length} files`);
}

resetData().catch((error) => {
  console.error(error);
  process.exit(1);
});
