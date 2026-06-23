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
  return key.replace(/^GB-T_7714—2025\./, "");
}

export function humanizeResultKey(key: Result.Key): string {
  // TODO
  return key;
}
