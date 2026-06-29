import type {
  EntryId,
  EntryIdUrlSafe,
  Result,
  Source,
} from "../../plugin/load_files";

export type { EntryIdUrlSafe };

export function encodeEntryId(id: EntryId): EntryIdUrlSafe {
  return id.replace(":", "-") as EntryIdUrlSafe;
}
export function decodeEntryId(id: EntryIdUrlSafe): EntryId {
  return id.replace("-", ":") as EntryId;
}

export function humanizeSourceKey(key: Source.Key): string {
  const [kind, suffix] = key.replace(/^GB-T_7714—2025\./, "").split(".");
  if (kind === "original" && suffix === "toml") {
    return "国标原文";
  }
  return `${kind[0].toUpperCase()}${kind.slice(1)} ${suffix}`;
}

export function humanizeResultKey(key: Result.Key): string {
  const [source, processor, style] = key.split("/");

  const processorRule: Record<string, string> = {
    "biblatex-gb7714-2025": "BibLaTeX",
    "citeproc-lua": "Lua",
    "gbt7714-bibtex-style": "BibTeX",
    pandoc: "Pandoc",
    typst: "Typst",
    "typst-citrus": "Citrus",
    "typst-gb7714-bilingual": "GB7714-bilingual",
    "typst-modern-nju-thesis": "NJU",
    "typst-omni-gb7714": "Omni",
    zotero: "Zotero",
    "naive-copy": "朴素复制",
  };

  const sourceHuman = humanizeSourceKey(source as Source.Key);
  const processorHuman = processorRule[processor] ?? processor;

  if (style === "default.txt") {
    return [sourceHuman, processorHuman].join(" · ");
  } else {
    const cslVersion = style.endsWith(".compliant.txt")
      ? "CSL"
      : style.endsWith(".extended.txt")
        ? "CSL-M⁺"
        : null;
    const gbVersion = style.startsWith("gb-7714-2015-numeric")
      ? "2015"
      : style.startsWith("gb-7714-2025-numeric")
        ? "2025"
        : null;
    const styleHuman =
      cslVersion && gbVersion ? `${gbVersion} ${cslVersion}` : style;

    return [sourceHuman, processorHuman, styleHuman].join(" · ");
  }
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("humanizeSourceKey", async () => {
    const { SOURCE } = await import("virtual:gb7714-bench-files");
    const { compareKey } = await import("./order");

    const keys = Object.keys(SOURCE) as Source.Key[];
    keys.sort(compareKey);

    expect(keys.map(humanizeSourceKey)).toMatchInlineSnapshot(`
      [
        "国标原文",
        "Builtin bib",
        "Better bib",
        "Builtin json",
        "Better json",
      ]
    `);
  });

  test("humanizeResultKey", () => {
    const keys: Result.Key[] = [
      "GB-T_7714—2025.original.toml/naive-copy/default.txt",
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
    ];

    const keysHuman = keys.map(humanizeResultKey);

    expect(new Set(keysHuman).size).toBe(keysHuman.length);
    expect(keysHuman).toMatchInlineSnapshot(`
      [
        "国标原文 · 朴素复制",
        "Builtin bib · Zotero · 2025 CSL",
        "Better bib · Zotero · 2025 CSL",
        "Better bib · Zotero · 2025 CSL-M⁺",
        "Better bib · BibTeX",
        "Better bib · BibLaTeX",
        "Better bib · Lua · 2025 CSL",
        "Better bib · Lua · 2025 CSL-M⁺",
        "Better bib · Typst · 2025 CSL",
        "Better bib · Citrus · 2025 CSL",
        "Better bib · Citrus · 2025 CSL-M⁺",
        "Better bib · GB7714-bilingual",
        "Better bib · Zotero · 2015 CSL",
        "Better bib · Typst · 2015 CSL",
        "Better bib · NJU · 2015 CSL",
        "Better bib · Omni",
        "Builtin json · Zotero · 2025 CSL",
      ]
    `);
  });
}
