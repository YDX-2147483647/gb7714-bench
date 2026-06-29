import { RESULT, SOURCE } from "virtual:gb7714-bench-files";
import type {
  EntryId,
  EntryIdPrefix,
  Result,
  Source,
} from "../../plugin/load_files";

import { compareKey } from "./order";

const sourceCanonical = SOURCE[
  "GB-T_7714—2025.builtin.json"
] as Source.AnyJson[];
const sourceOriginalToml = SOURCE[
  "GB-T_7714—2025.original.toml"
] as Source.OriginalTomlLibrary;

export type EntryInfo = {
  id: EntryId;

  /** Index in the library, starting from zero. */
  canonicalIndex: number;

  /** A map from data sources to their contents, ordered. */
  sources: [Source.Key, string][];
  /** A map from engine tuples to their results, ordered. */
  results: [Result.Key, string][];

  /** Info in `sourceOriginalToml`. */
  original: {
    example: string;
    headings: string[];
    notes: string | null;
  };

  meta: EntryMeta;
};

/** Auxiliary info extracted from `sourceCanonical`, only for displaying. */
type EntryMeta = {
  /** @see buildName */
  name: string | null;
  /** CSL entry type. */
  entryType: string;
};

/** Build the display name for an entry */
function buildName(entry: Source.AnyJson): string | null {
  const title = entry.title ?? entry["container-title"];
  if (title) {
    return title;
  }

  if (entry.author?.at(0)) {
    return Object.values(entry.author[0]).join(" ");
  }

  const publisher =
    entry.publisher ?? entry.archive ?? entry["publisher-place"];
  if (publisher) {
    return publisher;
  }

  if (entry.issued) {
    if ("literal" in entry.issued) {
      return entry.issued.literal;
    }
    if ("date-parts" in entry.issued) {
      return JSON.stringify(entry.issued["date-parts"]);
    }
  }

  const meaningful = Object.entries(entry).filter(
    ([k, v]) =>
      !["id", "citation-key", "type", "language", "langid", "note"].includes(
        k,
      ) && typeof v === "string",
  );
  if (meaningful.length === 1) {
    const [k, v] = meaningful[0];
    return `${k}: ${v}`;
  }

  return null;
}

/**
 * @throws Error if not found.
 */
function getCanonicalEntry(id: EntryId): {
  canonicalIndex: number;
  meta: EntryMeta;
} {
  const canonicalIndex = sourceCanonical.findIndex((entry) => entry.id === id);
  if (canonicalIndex === -1) {
    throw new Error(`Entry ${id} not found.`);
  }

  const entry = sourceCanonical[canonicalIndex];
  const meta = {
    name: buildName(entry),
    entryType: entry.type,
  };

  return { canonicalIndex, meta };
}

/**
 * @throws Error if not found.
 */
export function getEntryInfo(id: EntryId): EntryInfo {
  // Load from the canonical

  const { canonicalIndex, meta } = getCanonicalEntry(id);

  // Load from the original

  const afterColon = id.indexOf(":") + 1;
  const idPrefix = id.slice(0, afterColon);
  const indexInSection = Number(id.slice(afterColon)) - 1;

  const sectionOriginal = sourceOriginalToml.sections.find(
    (sec) => idPrefix === sec.idPrefix,
  );
  if (sectionOriginal === undefined) {
    throw new Error(`Failed to find the section for ${id} in original.toml.`);
  }
  const example = sectionOriginal.examples[indexInSection];
  if (example === undefined) {
    throw new Error(`Failed to find the example for ${id} in original.toml.`);
  }

  // Load regular sources and results

  const sources = Object.entries(SOURCE)
    .filter(([k, _]) => !k.endsWith(".original.toml"))
    .map(([k, lib]): [Source.Key, string] => {
      const key = k as Source.Key;
      if (k.endsWith(".json")) {
        const v = (lib as Source.AnyJson[])[canonicalIndex];
        return [key, JSON.stringify(v, null, "\t")];
      } else if (k.endsWith(".bib")) {
        const v = (lib as Source.AnyBib[])[canonicalIndex];
        return [key, v];
      } else {
        throw new Error(`Unknown data source: ${key}`);
      }
    })
    .sort((a, b) => compareKey(a[0], b[0]));

  const results = Object.entries(RESULT)
    .map(([k, v]) => [k, v[canonicalIndex]] as [Result.Key, string])
    .sort((a, b) => compareKey(a[0], b[0]));

  return {
    id,
    canonicalIndex,
    sources,
    results,
    original: {
      example,
      headings: sectionOriginal.headings,
      notes: sectionOriginal.notes,
    },
    meta,
  };
}

export function getAdjacentEntryIds(canonicalIndex: number): {
  prev: EntryId | null;
  next: EntryId | null;
} {
  return {
    prev: canonicalIndex >= 1 ? sourceCanonical[canonicalIndex - 1].id : null,
    next: sourceCanonical.at(canonicalIndex + 1)?.id ?? null,
  };
}

type SectionInfo = {
  idPrefix: EntryIdPrefix;
  headings: string[];
  notes: string | null;
  entries: { id: EntryId; canonicalIndex: number; meta: EntryMeta }[];
};

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function getSections(): SectionInfo[] {
  return sourceOriginalToml.sections.map(
    ({ examples, headings, idPrefix, notes }) => {
      // 顺序编码制与著者-出版年制对照的例子只保留一份，见`data/scripts/check_consistency.py`
      const nEntries =
        idPrefix === "gbt7714.7.1.3:" ? examples.length / 2 : examples.length;

      const entries = range(nEntries).map((i) => {
        const id: EntryId = `${idPrefix}${i + 1}`;
        const { canonicalIndex, meta } = getCanonicalEntry(id);
        return { id, canonicalIndex, meta };
      });

      return { idPrefix, headings, notes, entries };
    },
  );
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("range", () => {
    expect(range(3)).toStrictEqual([0, 1, 2]);
  });

  test("getEntryInfo", () => {
    const id = "gbt7714.9.2.1.3:4";
    const info = getEntryInfo(id);
    expect(info.id).toStrictEqual(id);

    expect(info.canonicalIndex).toMatchInlineSnapshot(`186`);

    expect(info.original).toMatchInlineSnapshot(`
      {
        "example": "[4] 陈登原.国史旧闻:第1卷[M].北京:中华书局,2000:29.",
        "headings": [
          "9 参考文献标引体系编制法",
          "9.2 顺序编码制",
          "9.2.1 正文中的引用",
          "9.2.1.3 多次引用同一责任者的同一文献时……",
        ],
        "notes": "此节示例1重复序号，示例2不重复序号并标注「同上」。此处抄录前者。",
      }
    `);
    expect(info.meta).toMatchInlineSnapshot(`
      {
        "entryType": "book",
        "name": "国史旧闻",
      }
    `);

    expect(info.sources.map(([k, _v]) => k)).toMatchInlineSnapshot(`
      [
        "GB-T_7714—2025.builtin.bib",
        "GB-T_7714—2025.better.bib",
        "GB-T_7714—2025.builtin.json",
        "GB-T_7714—2025.better.json",
      ]
    `);
    expect(info.sources[0][1]).toMatchInlineSnapshot(`
      "@book{gbt7714.9.2.1.3:4,
      	author = {{陈登原}},
      	date = {2000},
      	isbn = {978-7-101-00992-7},
      	langid = {pinyin},
      	location = {北京},
      	note = {Pages: 29},
      	publisher = {中华书局},
      	title = {国史旧闻},
      	volume = {1},
      }"
    `);

    expect(info.results.map(([k, _v]) => k).slice(0, 7)).toMatchInlineSnapshot(`
      [
        "GB-T_7714—2025.original.toml/naive-copy/default.txt",
        "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.builtin.bib/gbt7714-bibtex-style/default.txt",
        "GB-T_7714—2025.builtin.bib/biblatex-gb7714-2025/default.txt",
        "GB-T_7714—2025.builtin.bib/citeproc-lua/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.builtin.bib/citeproc-lua/gb-7714-2025-numeric.extended.txt",
      ]
    `);
    expect(info.results.length).toMatchInlineSnapshot(`47`);
    expect(info.results[1][1]).toMatchInlineSnapshot(
      `"[187] 陈登原. 国史旧闻：卷1[M]. 北京：中华书局，2000."`,
    );
  });

  test("getEntryInfo error if not found", () => {
    const id = "gbt7714.0.0" as EntryId;
    expect(() => getEntryInfo(id)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Entry gbt7714.0.0 not found.]`,
    );
  });

  test("getSections", () => {
    const sections = getSections();

    expect(sections.length).toMatchInlineSnapshot(`67`);
    expect(sections[0].headings).toMatchInlineSnapshot(`
      [
        "5 著录用文字",
        "5.1 参考文献应用信息资源本身的语种著录。",
      ]
    `);
    expect(sections[0].notes).toMatchInlineSnapshot(`null`);
    expect(sections[0].entries.length).toMatchInlineSnapshot(`4`);
    expect(sections[0].entries[0]).toMatchInlineSnapshot(`
      {
        "canonicalIndex": 0,
        "id": "gbt7714.5.1:1",
        "meta": {
          "entryType": "book",
          "name": "银行业的未来与人工智能",
        },
      }
    `);
  });

  test("buildName", () => {
    const noName = sourceCanonical
      .filter((entry) => buildName(entry) === null)
      .map((entry) => entry.id);

    expect(noName).toHaveLength(0);
  });
}
