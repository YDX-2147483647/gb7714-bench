import type { JSX, ReactNode } from "react";
import Markdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";

export function MarkdownPage({
  heading,
  children,
  epilogue = null,
  description = null,
}: {
  heading: ReactNode;
  children: string;
  epilogue?: ReactNode;
  description?: ReactNode;
}): JSX.Element {
  return (
    <main className="mx-auto mb-16 p-4 lg:px-8">
      <header className="rounded-2xl border border-stroke bg-card p-5 shadow">
        {/* Copy the max-width of .prose */}
        <div className="mx-auto max-w-[65ch]">
          <p className="font-bold text-accent text-sm">GB/T 7714 Benchmark</p>
          <h1 className="my-2 font-bold text-3xl">{heading}</h1>
          {description && <p className="my-1 text-ink-soft">{description}</p>}
        </div>
      </header>
      <div className="my-4 overflow-clip rounded-2xl border border-stroke bg-card p-4 shadow">
        <div className="prose mx-auto">
          <Markdown
            remarkPlugins={[
              remarkGfm,
              [remarkGithub, { repository: "YDX-2147483647/gb7714-bench" }],
            ]}
            rehypePlugins={[
              [
                rehypeExternalLinks,
                {
                  target: "_blank",
                  rel: ["noopener"],
                },
              ],
            ]}
          >
            {children}
          </Markdown>
          {epilogue}
        </div>
      </div>
    </main>
  );
}
