import { describe, expect, it } from "vitest";

import {
  assertNoUncategorizedSections,
  buildIndexSectionsForTest,
  buildOutTitle,
  parseOriginalTomlDataFromText,
  parseOriginalTomlSectionsFromText,
  simplifyProcessorName,
  simplifyStyleName,
} from "./bench.server";

describe("title simplification", () => {
  it("simplifies processor names", () => {
    expect(simplifyProcessorName("biblatex-gb7714-2025")).toBe("biblatex");
    expect(simplifyProcessorName("citeproc-lua")).toBe("lua");
    expect(simplifyProcessorName("typst-modern-nju-thesis")).toBe("NJU");
  });

  it("simplifies style names", () => {
    expect(simplifyStyleName("default")).toBe("");
    expect(simplifyStyleName("gb-7714-2025-numeric.compliant")).toBe("2025 CSL");
    expect(simplifyStyleName("gb-7714-2015-numeric.extended")).toBe("2015 CSL-M⁺");
  });

  it("builds compact output titles", () => {
    expect(
      buildOutTitle({
        dataset: "GB-T_7714—2025.better.bib",
        processor: "typst-citrus",
        style: "gb-7714-2025-numeric.compliant",
      }),
    ).toBe("better.bib · citrus · 2025 CSL");

    expect(
      buildOutTitle({
        dataset: "GB-T_7714—2025.builtin.bib",
        processor: "biblatex-gb7714-2025",
        style: "default",
      }),
    ).toBe("builtin.bib · biblatex");
  });
});

describe("original toml sections", () => {
  it("parses section headings and notes from toml", () => {
    const sections = parseOriginalTomlSectionsFromText(`
[[section]]
id-prefix = 'gbt7714.5.1:'
headings = [
  '5 著录用文字',
  '5.1 参考文献应用信息资源本身的语种著录。',
]
notes = '''
示例备注
'''
examples = '''
[1] A
[2] B
'''
`);

    expect(sections).toEqual([
      {
        idPrefix: "gbt7714.5.1:",
        headings: ["5 著录用文字", "5.1 参考文献应用信息资源本身的语种著录。"],
        notes: "示例备注",
      },
    ]);
  });

  it("ignores toml sections without id-prefix", () => {
    const sections = parseOriginalTomlSectionsFromText(`
[[section]]
headings = ['A']
notes = '''B'''
`);

    expect(sections).toEqual([]);
  });

  it("maps examples by exact entry id instead of flattened position", () => {
    const parsed = parseOriginalTomlDataFromText(`
[[section]]
id-prefix = 'gbt7714.8.4.2:'
headings = ['8.4.2']
examples = '''
[1] A
[2] B
[3] C
[4] D
'''

[[section]]
id-prefix = 'gbt7714.8.5.1.1:'
headings = ['8.5.1.1']
examples = '''
2001,2 (1):5-6
2014,510:356-363
'''
`);

    expect(parsed.entriesById.get("gbt7714.8.4.2:3")).toBe("[3] C");
    expect(parsed.entriesById.get("gbt7714.8.5.1.1:1")).toBe("2001,2 (1):5-6");
  });

  it("does not allow uncategorized entries", () => {
    const sections = buildIndexSectionsForTest(
      [
        { index: 1, id: "gbt7714.5.1:1", citationKey: "a", title: "A", type: "book" },
        { index: 2, id: "gbt7714.9.9:1", citationKey: "b", title: "B", type: "book" },
      ],
      [
        {
          idPrefix: "gbt7714.5.1:",
          headings: ["H"],
          notes: "",
        },
      ],
    );

    expect(() => assertNoUncategorizedSections(sections)).toThrow(/Uncategorized entries exist/);
  });
});
