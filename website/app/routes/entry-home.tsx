import { Link } from "react-router";
import { getSections } from "~/lib/files";
import { encodeEntryId } from "~/lib/naming";
import type { EntryId } from "../../plugin/load_files";
import type { Route } from "./+types/entry-home";

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
  const sections = getSections();

  const outline: {
    chapter: string;
    children: { heading: string; firstId: EntryId }[];
  }[] = [];
  for (const sec of sections) {
    if (sec.headings[0] !== outline.at(-1)?.chapter) {
      outline.push({
        chapter: sec.headings[0],
        children: [],
      });
    }
    if (
      sec.headings.length >= 2 &&
      sec.headings[1] !== outline.at(-1)?.children.at(-1)?.heading
    ) {
      outline.at(-1)?.children.push({
        heading: sec.headings[1],
        firstId: sec.entries[0].id,
      });
    }
  }

  return { sections, outline };
}

export default function EntryHome({ loaderData }: Route.ComponentProps) {
  const { sections, outline } = loaderData;

  return (
    <main className="mx-auto mb-16 p-4 lg:px-8">
      <header className="rounded-2xl border border-stroke bg-card p-5 shadow">
        <p className="font-bold text-accent text-sm">GB/T 7714 Benchmark</p>
        <h1 className="my-2 font-bold text-3xl">逐条目浏览</h1>
        <p className="text-ink-soft">
          按 GB/T 7714—2025 章节示例顺序，逐条目浏览数据源与处理结果。
        </p>
      </header>

      <nav className="my-4 overflow-clip rounded-2xl border border-stroke bg-card shadow">
        <h2 className="border-stroke border-b border-dashed bg-bg p-4 font-bold text-xl">
          目录
        </h2>
        <ol className="mb-2">
          {outline.map(({ chapter, children }) => (
            <li
              key={chapter}
              className="block border-stroke border-t border-dashed px-6 py-2"
            >
              <p>{chapter}</p>
              <ol className="my-2 flex flex-wrap gap-2 pl-3">
                {children.map(({ heading, firstId }) => (
                  <li key={heading}>
                    <Link
                      to={`#${encodeEntryId(firstId)}`}
                      className="rounded border border-stroke bg-bg-dark px-2 py-1 text-xs hover:bg-bg-dark-hover focus:bg-bg-dark-hover"
                    >
                      {heading}
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </nav>

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
                // 访问`/entry/#id`时，需滚动到此元素，但要避让 sticky header
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
