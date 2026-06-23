import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "@std/toml";
import type { Plugin } from "vite";

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);
const DATA_DIR = path.join(ROOT_DIR, "data/data/");
const OUT_DIR = path.join(ROOT_DIR, "target/out/");

export type EntryId = `gbt7714.${string}:${string}`;
export type EntryIdUrlSafe = `gbt7714.${string}-${string}`;
export type EntryIdPrefix = `gbt7714.${string}:`;

/** Typed data sources. */
export namespace Source {
  /** The filename in `DATA_DIR` of a data source. */
  export type Key =
    `GB-T_7714—2025.${`${"builtin" | "better"}.${"bib" | "json"}` | "original.toml"}`;

  /** The library of the data source. */
  export type Value = OriginalTomlLibrary | AnyBib[] | AnyJson[];

  /** A representation suitable for `JSON.stringify`. */
  export type Serializable = Record<Key, Value>;

  /** Parsed and normalized `original.toml`. */
  export type OriginalTomlLibrary = {
    notes: string;
    sections: {
      idPrefix: EntryIdPrefix;
      headings: string[];
      examples: string[];
      notes: string | null;
    }[];
  };

  /** An entry with its trailing comments. */
  export type AnyBib = string;

  /** A CSL-JSON entry. */
  export type AnyJson = {
    id: EntryId;
    type: string;
    title?: string | undefined;
    "container-title"?: string | undefined;
    author?: Record<string, string>[] | undefined;
    issued?:
      | { "date-parts": (string | number)[][] }
      | { literal: string }
      | undefined;
  } & Record<string, string | (string | number | Record<string, string>)[]>;
}

async function loadSource(key: Source.Key): Promise<Source.Value> {
  const raw = (await readFile(path.join(DATA_DIR, key), "utf-8")).replaceAll(
    "\r\n",
    "\n",
  );

  if (key.endsWith(".json")) {
    return JSON.parse(raw) as Source.AnyJson[];
  } else if (key.endsWith(".bib")) {
    return raw
      .split(/\n(?=@)/g)
      .map((entry) => entry.trim() satisfies Source.AnyBib);
  } else if (key.endsWith(".original.toml")) {
    const { notes, section } = parseToml(raw) as {
      notes: string;
      section: {
        "id-prefix": EntryIdPrefix;
        headings: string[];
        examples: string;
        notes?: string | undefined;
      }[];
    };
    return {
      notes,
      sections: section.map((sec) => ({
        idPrefix: sec["id-prefix"],
        headings: sec.headings,
        examples: sec.examples.trim().split("\n"),
        notes: sec.notes?.trim() ?? null,
      })),
    } satisfies Source.OriginalTomlLibrary;
  } else {
    throw new Error(`Unknown data source: ${key}`);
  }
}

async function loadAllSources(): Promise<Source.Serializable> {
  const keys = (await readdir(DATA_DIR)) as Source.Key[];
  const pairs = await Promise.all(
    keys.map(async (key) => [key, await loadSource(key)]),
  );
  return Object.fromEntries(pairs);
}

/** Typed processed results. */
export namespace Result {
  /** The file path to the result of a (source, processor, style) tuple relative to `OUT_DIR`. */
  export type Key =
    `${Source.Key}/${string}/${"default" | `gb-7714-${"2025" | "2015"}-numeric.${"compliant" | "extended"}`}.txt`;

  /** The formatted library, as an array of entries. */
  export type Value = string[];

  /** A representation suitable for `JSON.stringify`. */
  export type Serializable = Record<Key, Value>;
}

async function loadAllResults(): Promise<Result.Serializable> {
  const files = (
    await readdir(OUT_DIR, { withFileTypes: true, recursive: true })
  ).filter((item) => item.isFile());
  const keys = files.map((f) =>
    path
      .join(path.relative(OUT_DIR, f.parentPath), f.name)
      .replaceAll(path.sep, "/"),
  ) as Result.Key[];

  const pairs = await Promise.all(
    keys.map(async (key) => {
      const lines: Result.Value = (
        await readFile(path.join(OUT_DIR, key), "utf-8")
      )
        .replaceAll("\r\n", "\n")
        .trim()
        .split("\n");
      return [key, lines];
    }),
  );

  return Object.fromEntries(pairs);
}

export function loadFiles(): Plugin {
  const name = "gb7714-bench-files";
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name,
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id: string) {
      if (id !== resolvedVirtualModuleId) {
        return;
      }

      const sources = await loadAllSources();
      const results = await loadAllResults();

      return `
      export const SOURCE = ${JSON.stringify(sources)};
      export const RESULT = ${JSON.stringify(results)};
      `;
    },
  };
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("load data sources", async () => {
    const sources = await loadAllSources();

    expect(Object.keys(sources).sort()).toEqual(
      [
        "GB-T_7714—2025.original.toml",
        "GB-T_7714—2025.builtin.bib",
        "GB-T_7714—2025.better.bib",
        "GB-T_7714—2025.builtin.json",
        "GB-T_7714—2025.better.json",
      ].sort(),
    );

    const nEntries = (
      sources["GB-T_7714—2025.builtin.json"] as Source.AnyJson[]
    ).length;

    for (const [k, vRaw] of Object.entries(sources)) {
      if (k.endsWith(".bib")) {
        const v = vRaw as Source.AnyBib[];
        expect(v.length).toBe(nEntries);
        expect(v[0]).toBeTypeOf("string");
      } else if (k.endsWith(".json")) {
        const v = vRaw as Source.AnyJson[];
        expect(v.length).toBe(nEntries);
        expect(v[0]).toBeTypeOf("object");
        expect(v[0].id).toBeTypeOf("string");
      } else if (k.endsWith(".original.toml")) {
        const v = vRaw as Source.OriginalTomlLibrary;
        expect(v.sections.length).toBeLessThan(nEntries);
        expect(
          v.sections
            .map((sec) => sec.examples.length)
            .reduce((acc, val) => acc + val, 0),
        ).toBeGreaterThanOrEqual(nEntries);
      }
    }
  });
  it("load processed results", async () => {
    const results = await loadAllResults();

    expect(new Set(Object.values(results).map((v) => v.length))).toHaveLength(
      1,
    );
  });
}
