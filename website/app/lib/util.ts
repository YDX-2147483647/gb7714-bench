import type { Result, Source } from "../../plugin/load_files";

/**
 * Compare by an array of keyword groups.
 *
 * - Elements that contain keywords from earlier groups are sorted before elements that contain keywords from later groups.
 * - If two elements contain keywords from the same group, they are sorted by their order in the group.
 * - Elements that do not contain any keywords are put at the end and sorted alphabetically.
 */
function compareByKeywords(
  keywords: string[][],
): (a: string, b: string) => number {
  const toMax = (x: number): number => (x === -1 ? Number.MAX_SAFE_INTEGER : x);

  return (a, b) => {
    for (const group of keywords) {
      const aIndex = toMax(group.findIndex((keyword) => a.includes(keyword)));
      const bIndex = toMax(group.findIndex((keyword) => b.includes(keyword)));
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
    }
    return a.localeCompare(b);
  };
}

export function compareKey(
  a: Result.Key | Source.Key,
  b: Result.Key | Source.Key,
): number {
  const [aSource, ...aRest] = a.split("/");
  const [bSource, ...bRest] = b.split("/");

  if (aSource !== bSource) {
    return compareByKeywords([
      ["original.toml", "bib", "json"],
      ["builtin", "better"],
    ])(aSource, bSource);
  } else {
    return compareByKeywords([
      [
        // 2025 styles
        "zotero/gb-7714-2025",
        "bibtex",
        "biblatex",
        "gb-7714-2025",
        "typst-gb7714-bilingual",
        // 2015 styles
        "zotero/gb-7714-2015",
        "gb-7714-2015",
        "typst-omni-gb7714",
      ],
      ["lua", "typst/", "typst-"],
      ["compliant", "extended"],
    ])(aRest.join("/"), bRest.join("/"));
  }
}

if (import.meta.vitest) {
  const { describe, test, expect } = import.meta.vitest;

  test("compareByKeywords", () => {
    const keywords = [
      ["bib", "json"],
      ["builtin", "better"],
    ];

    expect(
      [
        "a.json",
        "a.whatever",
        "b.json",
        "b.whatever",
        "better.bib",
        "better.json",
        "builtin.bib",
        "builtin.json",
      ].sort(compareByKeywords(keywords)),
    ).toStrictEqual([
      "builtin.bib",
      "better.bib",
      "builtin.json",
      "better.json",
      "a.json",
      "b.json",
      "a.whatever",
      "b.whatever",
    ]);
  });

  describe("compareKey", () => {
    test("source keys", () => {
      const keys: Source.Key[] = [
        "GB-T_7714—2025.better.bib",
        "GB-T_7714—2025.better.json",
        "GB-T_7714—2025.builtin.bib",
        "GB-T_7714—2025.builtin.json",
        "GB-T_7714—2025.original.toml",
      ];

      expect(keys.sort(compareKey)).toStrictEqual([
        "GB-T_7714—2025.original.toml",
        "GB-T_7714—2025.builtin.bib",
        "GB-T_7714—2025.better.bib",
        "GB-T_7714—2025.builtin.json",
        "GB-T_7714—2025.better.json",
      ]);
    });
    test("result keys", () => {
      const zoteroKeys: Result.Key[] = [
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.builtin.json/zotero/gb-7714-2025-numeric.compliant.txt",
      ];
      expect(zoteroKeys.sort(compareKey)).toStrictEqual([
        "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.builtin.json/zotero/gb-7714-2025-numeric.compliant.txt",
      ]);

      const keys: Result.Key[] = [
        "GB-T_7714—2025.better.bib/biblatex-gb7714-2025/default.txt",
        "GB-T_7714—2025.better.bib/citeproc-lua/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/citeproc-lua/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.better.bib/gbt7714-bibtex-style/default.txt",
        "GB-T_7714—2025.better.bib/typst-citrus/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst-citrus/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.better.bib/typst-gb7714-bilingual/default.txt",
        "GB-T_7714—2025.better.bib/typst-modern-nju-thesis/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst-omni-gb7714/default.txt",
        "GB-T_7714—2025.better.bib/typst/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.builtin.json/zotero/gb-7714-2025-numeric.compliant.txt",
      ];

      expect(keys.sort(compareKey)).toStrictEqual([
        "GB-T_7714—2025.builtin.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.better.bib/gbt7714-bibtex-style/default.txt",
        "GB-T_7714—2025.better.bib/biblatex-gb7714-2025/default.txt",
        "GB-T_7714—2025.better.bib/citeproc-lua/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/citeproc-lua/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.better.bib/typst/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst-citrus/gb-7714-2025-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst-citrus/gb-7714-2025-numeric.extended.txt",
        "GB-T_7714—2025.better.bib/typst-gb7714-bilingual/default.txt",
        "GB-T_7714—2025.better.bib/zotero/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst-modern-nju-thesis/gb-7714-2015-numeric.compliant.txt",
        "GB-T_7714—2025.better.bib/typst-omni-gb7714/default.txt",
        "GB-T_7714—2025.builtin.json/zotero/gb-7714-2025-numeric.compliant.txt",
      ]);
    });
  });
}
