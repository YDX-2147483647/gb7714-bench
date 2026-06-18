import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { listFiles, parseDataFile, parseOutFile, parseOutPath, toPosix } from "./bench.files";

const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) {
    await rm(dir, { recursive: true, force: true });
  }
});

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "gb7714-bench-files-"));
  tempDirs.push(dir);
  return dir;
}

describe("bench.files", () => {
  it("parses json data files into formatted entries", async () => {
    const dir = await createTempDir();
    const file = path.join(dir, "sample.json");
    await writeFile(file, JSON.stringify([{ id: "a", title: "A" }]), "utf8");

    await expect(parseDataFile(file)).resolves.toEqual(['{\n  "id": "a",\n  "title": "A"\n}']);
  });

  it("parses bib and out files by record boundary", async () => {
    const dir = await createTempDir();
    const bibFile = path.join(dir, "sample.bib");
    const outFile = path.join(dir, "sample.txt");

    await writeFile(bibFile, "@book{a,\n  title = {A},\n}\n@article{b,\n  title = {B},\n}\n", "utf8");
    await writeFile(outFile, "[1] First\ncontinued\n[2] Second\n", "utf8");

    await expect(parseDataFile(bibFile)).resolves.toEqual([
      "@book{a,\n  title = {A},\n}",
      "@article{b,\n  title = {B},\n}",
    ]);
    await expect(parseOutFile(outFile)).resolves.toEqual(["[1] First\ncontinued", "[2] Second"]);
  });

  it("lists files recursively and normalizes paths", async () => {
    const dir = await createTempDir();
    const nested = path.join(dir, "a", "b");
    await mkdir(nested, { recursive: true });
    await writeFile(path.join(dir, "root.txt"), "x", "utf8");
    await writeFile(path.join(nested, "leaf.txt"), "y", "utf8");

    const files = await listFiles(dir);

    expect(files).toHaveLength(2);
    expect(files[0]).toContain("leaf.txt");
    expect(files[1]).toContain("root.txt");
    expect(toPosix(`a${path.sep}b${path.sep}c`)).toBe("a/b/c");
  });

  it("parses out path metadata", () => {
    expect(parseOutPath("target/out/GB-T_7714—2025.builtin.bib/zotero/default.txt")).toEqual({
      dataset: "GB-T_7714—2025.builtin.bib",
      processor: "zotero",
      style: "default",
    });
  });
});