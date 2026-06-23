import { RESULT, SOURCE } from "virtual:gb7714-bench-files";
import type { EntryId, Result, Source } from "../../plugin/load_files";
import { compareKey } from "./util";

const sourceCanonical = SOURCE[
  "GB-T_7714—2025.builtin.json"
] as Source.AnyJson[];
const sourceOriginalToml = SOURCE[
  "GB-T_7714—2025.original.toml"
] as Source.OriginalTomlLibrary;

type EntryInfo = {
  id: EntryId;

  /** A map from data sources to their contents, ordered. */
  sources: [Source.Key, string][];
  /** A map from engine tuples to their results, ordered. */
  results: [Result.Key, string][];

  /** Info in `original.toml`. */
  original: {
    example: string;
    headings: string[];
    notes: string | null;
  };

  /** Auxiliary info extracted from `builtin.json`, only for displaying. */
  meta: {
    title: string | null;
    /** CSL entry type */
    entryType: string;
  };
};

export function getEntryInfo(id: EntryId): EntryInfo {
  // Load from the canonical

  const entryCanonicalIndex = sourceCanonical.findIndex(
    (entry) => entry.id === id,
  );
  if (entryCanonicalIndex === -1) {
    throw new Error(`Entry ${id} not found.`);
  }
  const entryCanonical = sourceCanonical[entryCanonicalIndex];

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
        const v = (lib as Source.AnyJson[])[entryCanonicalIndex];
        return [key, JSON.stringify(v, null, "\t")];
      } else if (k.endsWith(".bib")) {
        const v = (lib as Source.AnyBib[])[entryCanonicalIndex];
        return [key, v];
      } else {
        throw new Error(`Unknown data source: ${key}`);
      }
    })
    .sort((a, b) => compareKey(a[0], b[0]));

  const results = Object.entries(RESULT)
    .map(([k, v]) => [k, v[entryCanonicalIndex]] as [Result.Key, string])
    .sort((a, b) => compareKey(a[0], b[0]));

  return {
    id,
    sources,
    results,
    original: {
      example,
      headings: sectionOriginal.headings,
      notes: sectionOriginal.notes,
    },
    meta: {
      title: entryCanonical.title ?? null,
      entryType: entryCanonical.type,
    },
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  test("getEntryInfo", () => {
    const id = "gbt7714.9.2.1.3:4";
    const info = getEntryInfo(id);
    expect(info.id).toStrictEqual(id);

    expect(info.original).toStrictEqual({
      example: "[4] 陈登原.国史旧闻:第1卷[M].北京:中华书局,2000:29.",
      headings: [
        "9 参考文献标引体系编制法",
        "9.2 顺序编码制",
        "9.2.1 正文中的引用",
        "9.2.1.3 多次引用同一责任者的同一文献时",
      ],
      notes: "此节示例1重复序号，示例2不重复序号并标注「同上」。此处抄录前者。",
    });
    expect(info.meta).toStrictEqual({
      title: "国史旧闻",
      entryType: "book",
    });

    expect(info.sources.map(([k, _v]) => k)).toStrictEqual([
      "GB-T_7714—2025.builtin.bib",
      "GB-T_7714—2025.better.bib",
      "GB-T_7714—2025.builtin.json",
      "GB-T_7714—2025.better.json",
    ]);
    expect(info.sources[0][1]).toStrictEqual(
      `
@book{gbt7714.9.2.1.3:4,
	author = {{陈登原}},
	date = {2000},
	isbn = {978-7-101-00992-7},
	langid = {pinyin},
	location = {北京},
	note = {Pages: 29},
	publisher = {中华书局},
	title = {国史旧闻},
	volume = {1},
}
`.trim(),
    );

    expect(info.results.map(([k, _v]) => k).slice(0, 6)).toStrictEqual([
      "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.compliant.txt",
      "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.extended.txt",
      "GB-T_7714—2025.builtin.bib/gbt7714-bibtex-style/default.txt",
      "GB-T_7714—2025.builtin.bib/biblatex-gb7714-2025/default.txt",
      "GB-T_7714—2025.builtin.bib/citeproc-lua/gb-7714-2025-numeric.compliant.txt",
      "GB-T_7714—2025.builtin.bib/citeproc-lua/gb-7714-2025-numeric.extended.txt",
    ]);
    expect(info.results.length).toStrictEqual(42);
    expect(info.results[0][1]).toStrictEqual(
      "[187] 陈登原. 国史旧闻：卷1[M]. 北京：中华书局，2000.",
    );
  });
}
