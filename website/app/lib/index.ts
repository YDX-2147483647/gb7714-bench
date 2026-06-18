import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  listFiles,
  parseDataFile,
  parseOutFile,
  parseOutPath,
  toPosix,
} from "./files";
import { buildOutTitle, compareDataFileKey } from "./naming";
import {
  assertNoUncategorizedSections,
  buildIndexSections,
  findEntrySection,
  mapSectionByEntryId,
  parseOriginalTomlDataFromText,
} from "./original-toml";
import type {
  BenchCache,
  BenchEntryData,
  BenchIndexData,
  BuiltinEntry,
  EntrySummary,
  FileItem,
  OutItem,
} from "./types";

let cachePromise: Promise<BenchCache> | undefined;

export async function getBenchIndexData(): Promise<BenchIndexData> {
  const cache = await getBenchCache();
  return cache.index;
}

export async function getBenchEntryByParam(
  paramId: string,
): Promise<BenchEntryData | null> {
  const cache = await getBenchCache();
  const idx = resolveEntryIndex(cache.index.entries, paramId);

  if (idx < 0 || idx >= cache.index.entries.length) {
    return null;
  }

  const entry = cache.index.entries[idx];

  return {
    entry,
    totalEntries: cache.index.entries.length,
    previousEntryId:
      idx > 0 ? (cache.index.entries[idx - 1]?.id ?? null) : null,
    nextEntryId:
      idx < cache.index.entries.length - 1
        ? (cache.index.entries[idx + 1]?.id ?? null)
        : null,
    entrySection: findEntrySection(cache.index.sections, entry.id),
    dataItems: cache.dataByIndex[idx] ?? [],
    outItems: cache.outByIndex[idx] ?? [],
  };
}

async function getBenchCache(): Promise<BenchCache> {
  if (!cachePromise) {
    cachePromise = buildBenchCache();
  }
  return cachePromise;
}

async function buildBenchCache(): Promise<BenchCache> {
  const root = path.resolve(process.cwd(), "..");
  const dataRoot = path.join(root, "data", "data");
  const outRoot = path.join(root, "target", "out");

  const dataPaths = await listFiles(dataRoot);
  const outPaths = (await listFiles(outRoot)).filter((p) =>
    p.toLowerCase().endsWith(".txt"),
  );

  const builtinPath = dataPaths.find((p) => p.endsWith(".builtin.json"));
  if (!builtinPath) {
    throw new Error("Cannot find builtin JSON file in data/data.");
  }

  const builtinText = await readFile(builtinPath, "utf8");
  const builtinEntries = JSON.parse(builtinText) as BuiltinEntry[];
  const indexEntries = buildIndexEntries(builtinEntries);

  const originalTomlPath = dataPaths.find((p) => p.endsWith(".original.toml"));
  const originalTomlData = originalTomlPath
    ? parseOriginalTomlDataFromText(await readFile(originalTomlPath, "utf8"))
    : null;
  const sections = originalTomlData?.sections ?? [];
  const sectionByEntryId = mapSectionByEntryId(indexEntries, sections);
  const indexSections = buildIndexSections(
    indexEntries,
    sections,
    sectionByEntryId,
  );
  assertNoUncategorizedSections(indexSections);

  const dataByIndex = indexEntries.map(() => [] as FileItem[]);
  const outByIndex = indexEntries.map(() => [] as OutItem[]);

  for (const filePath of dataPaths) {
    const rel = toPosix(path.relative(root, filePath));
    const fileKey = rel.replace(/^data\/data\//, "");

    if (filePath === originalTomlPath && originalTomlData) {
      for (let i = 0; i < indexEntries.length; i += 1) {
        const entryId = indexEntries[i]?.id ?? "";
        const item = originalTomlData.entriesById.get(entryId);

        if (item === undefined) {
          throw new Error(`Missing original.toml entry for ${entryId}`);
        }

        dataByIndex[i].push({
          fileKey,
          sourcePath: rel,
          item,
        });
      }

      continue;
    }

    const items = await parseDataFile(filePath);

    for (let i = 0; i < indexEntries.length; i += 1) {
      dataByIndex[i].push({
        fileKey,
        sourcePath: rel,
        item: items[i] ?? "",
      });
    }
  }

  for (const filePath of outPaths) {
    const rel = toPosix(path.relative(root, filePath));
    const parsed = parseOutPath(rel);
    const items = await parseOutFile(filePath);
    const simplifiedOutTitle = buildOutTitle(parsed);

    for (let i = 0; i < indexEntries.length; i += 1) {
      outByIndex[i].push({
        fileKey: simplifiedOutTitle,
        sourcePath: rel,
        dataset: parsed.dataset,
        processor: parsed.processor,
        style: parsed.style,
        item: items[i] ?? "",
      });
    }
  }

  for (const group of dataByIndex) {
    group.sort((a, b) => compareDataFileKey(a.fileKey, b.fileKey));
  }
  for (const group of outByIndex) {
    group.sort((a, b) => a.fileKey.localeCompare(b.fileKey));
  }

  return {
    index: {
      entries: indexEntries,
      sections: indexSections,
    },
    dataByIndex,
    outByIndex,
  };
}

function buildIndexEntries(builtinEntries: BuiltinEntry[]): EntrySummary[] {
  return builtinEntries.map((entry, i) => {
    const title = pickTitle(entry);
    return {
      index: i + 1,
      id: String(entry.id ?? `entry-${i + 1}`),
      citationKey: String(entry["citation-key"] ?? entry.id ?? ""),
      type: String(entry.type ?? "unknown"),
      title,
    };
  });
}

function pickTitle(entry: BuiltinEntry): string {
  const raw =
    (entry.title as string | undefined) ??
    (entry["container-title"] as string | undefined) ??
    (entry["citation-key"] as string | undefined) ??
    (entry.id as string | undefined) ??
    "(untitled)";
  return String(raw);
}

function resolveEntryIndex(entries: EntrySummary[], paramId: string): number {
  const decoded = decodeURIComponent(paramId);
  return entries.findIndex((entry) => entry.id === decoded);
}
