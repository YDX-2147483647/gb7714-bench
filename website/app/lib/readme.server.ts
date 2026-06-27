import assert from "node:assert";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../",
);

export async function loadReadme(): Promise<string> {
  const readme = await readFile(path.join(ROOT_DIR, "README.md"), "utf-8");

  const magic = "<!-- NOTE: The following will be included in the website. -->";
  const magicStart = readme.indexOf(magic);
  assert(magicStart !== -1, "Magic string not found in README.md");
  const contentStart = magicStart + magic.length;

  return readme
    .slice(contentStart)
    .replaceAll("https://gb7714.zhtyp.art/", "/")
    .replaceAll(
      "](./",
      "](https://github.com/YDX-2147483647/gb7714-bench/blob/main/",
    );
}
