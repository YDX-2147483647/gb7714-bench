import Markdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import remarkGfm from "remark-gfm";

import { loadReadme } from "~/lib/readme.server";
import type { Route } from "./+types/readme";

export async function loader(_: Route.LoaderArgs) {
  const readme = await loadReadme();
  return { readme };
}

export default function Readme({
  loaderData: { readme },
}: Route.ComponentProps) {
  return (
    <main className="mx-auto mb-16 p-4 lg:px-8">
      <header className="rounded-2xl border border-stroke bg-card p-5 shadow">
        {/* Copy the max-width of .prose */}
        <div className="mx-auto max-w-[65ch]">
          <p className="font-bold text-accent text-sm">GB/T 7714 Benchmark</p>
          <h1 className="my-2 font-bold text-3xl">
            GB/T 7714 格式参考文献引擎哪家强？
          </h1>
        </div>
      </header>
      <div className="my-4 overflow-clip rounded-2xl border border-stroke bg-card p-4 shadow">
        <div className="prose mx-auto">
          <Markdown
            remarkPlugins={[remarkGfm]}
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
            {readme}
          </Markdown>
        </div>
      </div>
    </main>
  );
}
