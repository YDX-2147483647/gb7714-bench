import { parse as parseToml } from "@std/toml";

import type {
  EntrySection,
  EntrySectionInfo,
  EntrySummary,
  OriginalTomlData,
  SectionInfo,
} from "./types";

export function parseOriginalTomlDataFromText(
  content: string,
): OriginalTomlData {
  const parsed = parseToml(content) as { section?: unknown };
  const rawSections = Array.isArray(parsed.section) ? parsed.section : [];
  const sections: SectionInfo[] = [];
  const entriesById = new Map<string, string>();

  for (const section of rawSections) {
    if (!section || typeof section !== "object") {
      continue;
    }

    const typed = section as {
      "id-prefix"?: unknown;
      headings?: unknown;
      notes?: unknown;
      examples?: unknown;
    };

    const idPrefix =
      typeof typed["id-prefix"] === "string" ? typed["id-prefix"].trim() : "";
    if (!idPrefix) {
      continue;
    }

    const headings = Array.isArray(typed.headings)
      ? typed.headings
          .filter((heading): heading is string => typeof heading === "string")
          .map((heading) => heading.trim())
          .filter(Boolean)
      : [];
    const notes = typeof typed.notes === "string" ? typed.notes.trim() : "";

    sections.push({ idPrefix, headings, notes });

    if (typeof typed.examples !== "string") {
      continue;
    }

    const examples = splitTomlExampleLines(typed.examples);
    for (let i = 0; i < examples.length; i += 1) {
      entriesById.set(`${idPrefix}${i + 1}`, examples[i]);
    }
  }

  return { sections, entriesById };
}

export function assertNoUncategorizedSections(
  indexSections: EntrySection[],
): void {
  const uncategorized = indexSections.find(
    (section) => section.idPrefix === "uncategorized",
  );
  if (uncategorized) {
    throw new Error(
      `Uncategorized entries exist: ${uncategorized.entries
        .map((entry) => entry.id)
        .join(", ")}`,
    );
  }
}

export function mapSectionByEntryId(
  entries: EntrySummary[],
  sections: SectionInfo[],
): Map<string, SectionInfo> {
  const map = new Map<string, SectionInfo>();

  for (const entry of entries) {
    let matched: SectionInfo | undefined;
    for (const section of sections) {
      if (entry.id.startsWith(section.idPrefix)) {
        if (!matched || section.idPrefix.length > matched.idPrefix.length) {
          matched = section;
        }
      }
    }
    if (matched) {
      map.set(entry.id, matched);
    }
  }

  return map;
}

export function buildIndexSections(
  entries: EntrySummary[],
  sections: SectionInfo[],
  sectionByEntryId: Map<string, SectionInfo>,
): EntrySection[] {
  const grouped = new Map<string, EntrySummary[]>();
  for (const section of sections) {
    grouped.set(section.idPrefix, []);
  }

  const uncategorized: EntrySummary[] = [];
  for (const entry of entries) {
    const section = sectionByEntryId.get(entry.id);
    if (section) {
      grouped.get(section.idPrefix)?.push(entry);
    } else {
      uncategorized.push(entry);
    }
  }

  const result: EntrySection[] = [];

  for (const section of sections) {
    const sectionEntries = grouped.get(section.idPrefix) ?? [];
    if (sectionEntries.length > 0) {
      result.push({
        idPrefix: section.idPrefix,
        headings: section.headings,
        notes: section.notes,
        entries: sectionEntries,
      });
    }
  }

  if (uncategorized.length > 0) {
    result.push({
      idPrefix: "uncategorized",
      headings: ["Uncategorized"],
      notes: "",
      entries: uncategorized,
    });
  }

  return result;
}

export function findEntrySection(
  sections: EntrySection[],
  entryId: string,
): EntrySectionInfo | null {
  for (const section of sections) {
    if (section.entries.some((entry) => entry.id === entryId)) {
      return {
        idPrefix: section.idPrefix,
        headings: section.headings,
        notes: section.notes,
      };
    }
  }

  return null;
}

function splitTomlExampleLines(content: string): string[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (lines.at(-1) === "") {
    lines.pop();
  }

  return lines;
}
