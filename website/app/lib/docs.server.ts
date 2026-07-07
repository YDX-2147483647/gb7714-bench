import assert from "node:assert";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../",
);

function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(ROOT_DIR, relativePath), "utf-8");
}

function fixLinks(md: string): string {
  return md
    .replaceAll("https://gb7714.zhtyp.art/", "/")
    .replaceAll("](./CHANGELOG.md)", "](/changelog/)")
    .replaceAll(
      "](./",
      "](https://github.com/YDX-2147483647/gb7714-bench/blob/main/",
    );
}

export async function loadReadme(): Promise<string> {
  const readme = await readRepoFile("README.md");

  const magic = "<!-- NOTE: The following will be included in the website. -->";
  const magicStart = readme.indexOf(magic);
  assert(magicStart !== -1, "Magic string not found in README.md");
  const contentStart = magicStart + magic.length;

  return fixLinks(readme.slice(contentStart));
}

export async function loadChangelog(): Promise<string> {
  const changelog = await readRepoFile("CHANGELOG.md");
  return fixLinks(changelog.replace(/^# Changelog$/m, "").trim());
}
