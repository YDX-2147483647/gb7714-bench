import { Link } from "react-router";
import { getSections } from "~/lib/files";
import { encodeEntryId } from "~/lib/naming";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "GB/T 7714 Bench Explorer" },
    {
      name: "description",
      content: "Browse benchmark entries and formatted outputs.",
    },
  ];
}

export async function loader() {
  return { sections: getSections() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { sections } = loaderData;

  return (
    <main className="mx-auto w-[min(1320px,92vw)] pt-5 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-stroke bg-[radial-gradient(circle_at_85%_15%,#ffe9c7_0%,transparent_45%),var(--color-card)] p-5 shadow-[0_10px_24px_rgba(199,109,42,0.08)]">
        <p className="m-0 text-[0.82rem] text-accent-2 uppercase tracking-[0.08em]">
          GB/T 7714 Benchmark
        </p>
        <h1 className="mt-[0.35rem] mb-0 text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.2]">
          Reference Entry Explorer
        </h1>
        <p className="mt-[0.6rem] mb-0 text-[0.95rem] text-ink-soft leading-[1.7]">
          以{" "}
          <code className="rounded-[0.35rem] border border-stroke bg-bg-soft px-[0.36rem] py-[0.06rem]">
            builtin.json
          </code>{" "}
          的顺序为主索引。点击任意条目可查看同序号下的全部
          <code className="rounded-[0.35rem] border border-stroke bg-bg-soft px-[0.36rem] py-[0.06rem]">
            data
          </code>{" "}
          与{" "}
          <code className="rounded-[0.35rem] border border-stroke bg-bg-soft px-[0.36rem] py-[0.06rem]">
            out
          </code>
          。
        </p>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-stroke bg-card">
        <div className="flex items-baseline justify-between border-stroke border-b bg-bg-soft px-4 py-[0.95rem]">
          <h2>Entries</h2>
        </div>
        <div className="grid">
          {sections.map((section) => (
            <section
              className="border-[#ead8bd] border-t first:border-t-0"
              key={section.idPrefix}
            >
              <header className="border-[#efdfca] border-b border-dashed bg-[#fff8eb] px-4 py-[0.9rem]">
                <p className="m-0 font-mono text-[0.76rem] text-accent-2">
                  {section.idPrefix}
                </p>
                <h3 className="mt-1 mb-0 text-[1rem]">
                  {section.headings.join(" / ")}
                </h3>
                {section.notes ? (
                  <pre className="mt-2 whitespace-pre-wrap rounded-[0.45rem] border border-[#edd9be] bg-card p-[0.55rem] text-[0.76rem] text-ink-soft leading-[1.55]">
                    {section.notes}
                  </pre>
                ) : null}
              </header>

              <ul className="m-0 list-none p-0">
                {section.entries.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      className="grid grid-cols-[4rem_1fr] gap-[0.8rem] border-[#eedfca] border-t border-dashed px-4 py-[0.9rem] transition-colors duration-150 hover:bg-[#fff8e8] max-[700px]:grid-cols-[3rem_1fr] max-[700px]:gap-[0.55rem] max-[700px]:px-3"
                      to={`/entry/${encodeEntryId(entry.id)}/`}
                    >
                      <span className="font-mono font-semibold text-accent">
                        [{entry.canonicalIndex + 1}]
                      </span>
                      <span className="grid gap-[0.2rem]">
                        <span className="text-[1rem] leading-[1.45]">
                          {entry.meta.name}
                        </span>
                        <span className="flex flex-wrap gap-[0.35rem]">
                          <code className="rounded-full border border-[#e8d8c1] px-2 py-[0.08rem] text-[0.73rem] text-ink-soft">
                            {entry.id}
                          </code>
                          <code className="rounded-full border border-[#e8d8c1] px-2 py-[0.08rem] text-[0.73rem] text-ink-soft">
                            {entry.meta.entryType}
                          </code>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
