import { diffWordsWithSpace } from "diff";
import type { JSX } from "react";

export function DiffText({
  ref,
  actual,
}: {
  ref: string;
  actual: string;
}): JSX.Element {
  const diff = diffWordsWithSpace(ref, actual);

  return (
    <pre className="diff-text">
      {diff.map((part) => {
        if (part.added) {
          return <ins>{part.value}</ins>;
        } else if (part.removed) {
          return <del>{part.value}</del>;
        } else {
          return <span>{part.value}</span>;
        }
      })}
    </pre>
  );
}

export function DiffTextLegend(): JSX.Element {
  return <DiffText ref="ref " actual=" actual" />;
}
