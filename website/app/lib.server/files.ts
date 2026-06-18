import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function parseDataFile(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return parseJsonData(content);
  }

  if (ext === ".bib") {
    return splitBibEntries(content);
  }

  return content.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

export async function parseOutFile(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf8");
  return splitOutEntries(content);
}

export function parseOutPath(relPath: string): {
  dataset: string;
  processor: string;
  style: string;
} {
  const parts = relPath.split("/");
  if (parts.length < 5) {
    return {
      dataset: "unknown-dataset",
      processor: "unknown-processor",
      style: parts[parts.length - 1] ?? "unknown-style",
    };
  }

  return {
    dataset: parts[2],
    processor: parts[3],
    style: parts[4].replace(/\.txt$/i, ""),
  };
}

export async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

export function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function parseJsonData(content: string): string[] {
  const parsed = JSON.parse(content) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((item) => JSON.stringify(item, null, 2));
}

function splitBibEntries(content: string): string[] {
  return content
    .split(/\r?\n(?=@)/g)
    .map((block) => block.trim())
    .filter((block) => block.startsWith("@"));
}

function splitOutEntries(content: string): string[] {
  return content
    .split(/\r?\n(?=\[\d+\]\s)/g)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
