export function buildOutTitle(parsed: { dataset: string; processor: string; style: string }): string {
  const dataset = simplifyDatasetName(parsed.dataset);
  const processor = simplifyProcessorName(parsed.processor);
  const style = simplifyStyleName(parsed.style);

  return style ? `${dataset} · ${processor} · ${style}` : `${dataset} · ${processor}`;
}

export function simplifyProcessorName(processor: string): string {
  const mapped: Record<string, string> = {
    "biblatex-gb7714-2025": "biblatex",
    "citeproc-lua": "lua",
    "gbt7714-bibtex-style": "bibtex",
    typst: "typst",
    "typst-citrus": "citrus",
    "typst-gb7714-bilingual": "gb7714-bilingual",
    "typst-modern-nju-thesis": "NJU",
    "typst-omni-gb7714": "omni",
    zotero: "zotero",
  };

  return mapped[processor] ?? processor;
}

export function simplifyStyleName(style: string): string {
  if (style === "default") {
    return "";
  }

  let year = "";
  if (style.includes("gb-7714-2025-numeric")) {
    year = "2025";
  } else if (style.includes("gb-7714-2015-numeric")) {
    year = "2015";
  }

  let profile = "";
  if (style.endsWith(".compliant")) {
    profile = "CSL";
  } else if (style.endsWith(".extended")) {
    profile = "CSL-M⁺";
  }

  if (year && profile) {
    return `${year} ${profile}`;
  }
  if (year) {
    return year;
  }
  if (profile) {
    return profile;
  }

  return style;
}

export function compareDataFileKey(a: string, b: string): number {
  const rankA = rankDataFileKey(a);
  const rankB = rankDataFileKey(b);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return a.localeCompare(b);
}

export function rankDataFileKey(fileKey: string): number {
  if (fileKey.endsWith(".original.toml")) {
    return 0;
  }

  const formatRank = fileKey.endsWith(".bib") ? 0 : fileKey.endsWith(".json") ? 1 : 2;
  const sourceRank = fileKey.includes(".builtin.") ? 0 : fileKey.includes(".better.") ? 1 : 2;

  return 10 + formatRank * 3 + sourceRank;
}

function simplifyDatasetName(dataset: string): string {
  return dataset.replace(/^GB-T_7714—2025\./, "");
}