import type { JSX } from "react";
import { DiffText } from "~/components/DiffText";
import { normalizeResult } from "~/lib/result_normalize";
import type { Result } from "../../plugin/load_files";
import type { DiffOption } from "./DiffControl";

export function ResultItem({
  actualKey,
  actualValue,
  diffOption,
  refValue,
}: {
  actualKey: Result.Key;
  actualValue: string;
  diffOption: DiffOption;
  refValue: string | null;
}): JSX.Element {
  const { refKey, ignoreCase, shouldNormalize } = diffOption;
  const normalizeIfShould =
    refKey !== null && shouldNormalize ? normalizeResult : (s: string) => s;

  return (
    <div className="rounded-xl border border-stroke bg-bg-soft p-2 text-sm">
      {refValue === null || refKey === actualKey ? (
        <pre>{normalizeIfShould(actualValue)}</pre>
      ) : (
        <DiffText
          actual={normalizeIfShould(actualValue)}
          ref={normalizeIfShould(refValue)}
          ignoreCase={ignoreCase}
        />
      )}
    </div>
  );
}
