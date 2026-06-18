import { describe, expect, it } from "vitest";

import {
  assertNoUncategorizedSections,
  buildIndexSections,
  mapSectionByEntryId,
  parseOriginalTomlDataFromText,
} from "./original-toml";
import type { EntrySummary, SectionInfo, EntrySection } from "./types.js"


function buildIndexSectionsForTest(
  entries: EntrySummary[],
  sections: SectionInfo[]
): EntrySection[] {
  const sectionByEntryId = mapSectionByEntryId(entries, sections)
  return buildIndexSections(entries, sections, sectionByEntryId)
}

function parseOriginalTomlSectionsFromText(content: string): SectionInfo[] {
  return parseOriginalTomlDataFromText(content).sections
}

describe("bench.original-toml", () => {
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

