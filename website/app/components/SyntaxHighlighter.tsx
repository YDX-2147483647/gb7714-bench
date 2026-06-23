import type { JSX } from "react";
import ShikiHighlighter from "react-shiki";

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
