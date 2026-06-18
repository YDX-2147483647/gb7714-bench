import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const tempDirs: string[] = [];
const originalCwd = process.cwd();

afterEach(async () => {
  process.chdir(originalCwd);
  vi.resetModules();

  for (const dir of tempDirs.splice(0)) {
    await rm(dir, { recursive: true, force: true });
  }
});

async function createTempWorkspace(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "gb7714-bench-server-"));
  tempDirs.push(dir);
  return dir;
}

describe("bench.server", () => {
  it("builds index and entry data from workspace files", async () => {
    const workspace = await createTempWorkspace();
    const websiteDir = path.join(workspace, "website");
    const dataDir = path.join(workspace, "data", "data");
    const outDir = path.join(workspace, "target", "out", "GB-T_7714—2025.builtin.bib", "zotero");

    await mkdir(websiteDir, { recursive: true });
    await mkdir(dataDir, { recursive: true });
    await mkdir(outDir, { recursive: true });

    await writeFile(
      path.join(dataDir, "GB-T_7714—2025.builtin.json"),
      JSON.stringify([
        {
          id: "gbt7714.8.5.1.1:1",
          "citation-key": "gbt7714.8.5.1.1:1",
          type: "article-journal",
        },
      ]),
      "utf8",
    );
    await writeFile(
      path.join(dataDir, "GB-T_7714—2025.original.toml"),
      `[[section]]
id-prefix = 'gbt7714.8.5.1.1:'
headings = ['8', '8.5', '8.5.1', '8.5.1.1']
notes = '''note'''
examples = '''
2001,2 (1):5-6
'''
`,
      "utf8",
    );
    await writeFile(
      path.join(dataDir, "GB-T_7714—2025.builtin.bib"),
      "@article{gbt7714.8.5.1.1:1,\n  title = {A},\n}\n",
      "utf8",
    );
    await writeFile(path.join(outDir, "default.txt"), "[1] Output item\n", "utf8");

    process.chdir(websiteDir);

    const benchServer = await import("./bench.server");
    const index = await benchServer.getBenchIndexData();
    const entry = await benchServer.getBenchEntryByParam("gbt7714.8.5.1.1%3A1");

    expect(index.entries).toHaveLength(1);
    expect(index.sections[0]?.idPrefix).toBe("gbt7714.8.5.1.1:");
    expect(entry?.entry.id).toBe("gbt7714.8.5.1.1:1");
    expect(entry?.entrySection?.notes).toBe("note");
    expect(entry?.dataItems[0]?.item).toBe("2001,2 (1):5-6");
    expect(entry?.outItems[0]?.item).toBe("[1] Output item");
  });
});
