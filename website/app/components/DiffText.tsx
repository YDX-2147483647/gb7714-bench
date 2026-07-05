import { diffWordsWithSpace } from "diff";
import type { JSX } from "react";

export function DiffText({
  ref,
  actual,
  ignoreCase,
}: {
  ref: string;
  actual: string;
  ignoreCase?: boolean | undefined;
}): JSX.Element {
  const diff = diffWordsWithSpace(ref, actual, { ignoreCase });

  return (
    <pre className="diff-text">
      {diff.map((part, index) => {
        const key = `${index}-${part.value.slice(0, 8)}`;

        if (part.added) {
          return <ins key={key}>{part.value}</ins>;
        } else if (part.removed) {
          return <del key={key}>{part.value}</del>;
        } else {
          return <span key={key}>{part.value}</span>;
        }
      })}
    </pre>
  );
}

export function DiffTextLegend({
  actualTextLegend = "实际",
}: {
  actualTextLegend?: string;
}): JSX.Element {
  return (
    <code className="diff-text">
      <del>参考</del> <ins>{actualTextLegend}</ins>
    </code>
  );
}
