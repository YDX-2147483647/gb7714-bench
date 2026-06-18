export type BuiltinEntry = {
  id: string;
  title?: string;
  "citation-key"?: string;
  type?: string;
  [key: string]: unknown;
};

export type SectionInfo = {
  idPrefix: string;
  headings: string[];
  notes: string;
};

export type OriginalTomlData = {
  sections: SectionInfo[];
  entriesById: Map<string, string>;
};

export type EntrySummary = {
  index: number;
  id: string;
  citationKey: string;
  title: string;
  type: string;
};

export type EntrySection = {
  idPrefix: string;
  headings: string[];
  notes: string;
  entries: EntrySummary[];
};

export type FileItem = {
  fileKey: string;
  sourcePath: string;
  item: string;
};

export type OutItem = FileItem & {
  dataset: string;
  processor: string;
  style: string;
};

export type BenchIndexData = {
  entries: EntrySummary[];
  sections: EntrySection[];
};

export type EntrySectionInfo = {
  idPrefix: string;
  headings: string[];
  notes: string;
};

export type BenchEntryData = {
  entry: EntrySummary;
  totalEntries: number;
  previousEntryId: string | null;
  nextEntryId: string | null;
  entrySection: EntrySectionInfo | null;
  dataItems: FileItem[];
  outItems: OutItem[];
};

export type BenchCache = {
  index: BenchIndexData;
  dataByIndex: FileItem[][];
  outByIndex: OutItem[][];
};
