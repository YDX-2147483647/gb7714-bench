import { Link } from "react-router";
import { getBenchIndexData } from "../lib";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GB/T 7714 Bench Explorer" },
    {
      name: "description",
      content: "Browse benchmark entries and formatted outputs.",
    },
  ];
}

export async function loader() {
  return getBenchIndexData();
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { entries, sections } = loaderData;

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="hero-kicker">GB/T 7714 Benchmark</p>
        <h1 className="hero-title">Reference Entry Explorer</h1>
        <p className="hero-subtitle">
          以 <code>builtin.json</code>{" "}
          的顺序为主索引。点击任意条目可查看同序号下的全部
          <code>data</code> 与 <code>out</code>。
        </p>
      </section>

      <section className="entry-list-wrap">
        <div className="entry-list-head">
          <h2>Entries</h2>
          <p>{entries.length} total</p>
        </div>
        <div className="section-list">
          {sections.map((section) => (
            <section className="entry-section" key={section.idPrefix}>
              <header className="entry-section-head">
                <p className="entry-section-kicker">{section.idPrefix}</p>
                <h3>{section.headings.join(" / ")}</h3>
                {section.notes ? (
                  <pre className="section-notes">{section.notes}</pre>
                ) : null}
              </header>

              <ul className="entry-list">
                {section.entries.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      className="entry-link"
                      to={`/entry/${entry.id.replace(":", "-")}/`}
                    >
                      <span className="entry-number">#{entry.index}</span>
                      <span className="entry-body">
                        <span className="entry-title">{entry.title}</span>
                        <span className="entry-meta">
                          <code>{entry.id}</code>
                          <code>{entry.type}</code>
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
