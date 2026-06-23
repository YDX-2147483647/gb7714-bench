import type { JSX } from "react";

import ShikiHighlighter, {
  createHighlighterCore,
  createOnigurumaEngine,
} from "react-shiki/core";

// https://www.npmjs.com/package/react-shiki#react-shikicore-minimal-bundle
const highlighter = await createHighlighterCore({
  themes: [import("@shikijs/themes/github-light")],
  langs: [import("@shikijs/langs/bibtex"), import("@shikijs/langs/json")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export function SyntaxHighlighter({
  language,
  children,
  className,
}: {
  language: "bibtex" | "json" | "text";
  children: string;
  className?: string;
}): JSX.Element {
  return (
    <ShikiHighlighter
      highlighter={highlighter}
      language={language}
      theme="github-light"
      // outputFormat="react" leads to the following client error, so `html` is used instead.
      //   [react-shiki] highlight failed: Cannot parse `style` attribute Caused by: TypeError: import_cjs.default is not a function
      outputFormat="html"
      className={className}
    >
      {children}
    </ShikiHighlighter>
  );
}
