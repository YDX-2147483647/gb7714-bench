import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../",
);

export function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(ROOT_DIR, relativePath), "utf-8");
}
