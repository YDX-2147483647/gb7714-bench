import { Link } from "react-router";
import { getSections } from "~/lib/files";
import { encodeEntryId } from "~/lib/naming";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "逐条目浏览 | GB/T 7714 Benchmark" },
    {
      name: "description",
      content: "按 GB/T 7714—2025 章节示例顺序，逐条目浏览数据源与处理结果。",
    },
  ];
}

export async function loader() {
  return { sections: getSections() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { sections } = loaderData;

  return (
    <main className="mx-auto mb-16 p-4 lg:px-8">
      <section className="rounded-2xl border border-stroke bg-card p-5 shadow">
        <p className="text-accent text-sm">GB/T 7714 Benchmark</p>
        <h1 className="my-2 text-3xl">逐条目浏览</h1>
        <p className="text-ink-soft">
          按 GB/T 7714—2025 章节示例顺序，逐条目浏览数据源与处理结果。
        </p>
      </section>

      <div className="my-4 grid overflow-clip rounded-2xl border border-stroke bg-card shadow">
        {sections.map((section) => (
          <section
            className="border-stroke border-t first:border-t-0"
            key={section.idPrefix}
          >
            <header className="sticky top-0 border-stroke border-b border-dashed bg-bg p-4 pb-2">
              <p className="text-accent text-sm">
                <code>{section.idPrefix}</code>
              </p>
              <h2 className="my-2 text-lg">{section.headings.join(" → ")}</h2>
              {section.notes?.split("\n").map((par) => (
                <p key={par} className="pb-1 text-ink-soft text-sm">
                  {par}
                </p>
              ))}
            </header>

            <ul className="m-0 list-none p-0">
              {section.entries.map((entry) => (
                // 访问`/#id`时，需滚动到此元素，但要避让 sticky header
                <li
                  key={entry.id}
                  className="scroll-mt-30"
                  id={encodeEntryId(entry.id)}
                >
                  <Link
                    className="grid grid-cols-[auto_1fr] gap-4 border-stroke border-t border-dashed p-4 transition-colors duration-150 hover:bg-bg-dark focus:bg-bg-dark"
                    to={`/entry/${encodeEntryId(entry.id)}/`}
                  >
                    <code className="font-semibold">
                      [{entry.canonicalIndex + 1}]
                    </code>
                    <span className="grid gap-2">
                      <span>{entry.meta.name}</span>
                      <span className="flex flex-wrap gap-2 text-ink-soft text-xs">
                        {[entry.id, entry.meta.entryType].map((tag) => (
                          <code
                            key={tag}
                            className="rounded-full border border-stroke px-2 py-0.5"
                          >
                            {tag}
                          </code>
                        ))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
