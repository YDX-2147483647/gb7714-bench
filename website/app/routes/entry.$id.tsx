import { Link, isRouteErrorResponse } from "react-router";

import { getBenchEntryByParam } from "../lib/bench.server";
import type { Route } from "./+types/entry.$id";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Entry ${params.id ?? ""}` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const data = await getBenchEntryByParam(params.id ?? "");
  if (!data) {
    throw new Response("Entry not found", { status: 404 });
  }
  return data;
}

export default function EntryDetail({ loaderData }: Route.ComponentProps) {
  const { entry, previousEntryId, nextEntryId, dataItems, outItems } = loaderData;

  return (
    <main className="page-shell detail-shell">
      <header className="hero-card detail-hero">
        <p className="hero-kicker">Entry #{entry.index}</p>
        <h1 className="hero-title">{entry.title}</h1>
        <p className="hero-subtitle detail-meta-line">
          <code>{entry.id}</code>
          <code>{entry.citationKey}</code>
          <code>{entry.type}</code>
        </p>
        <div className="detail-nav">
          <Link className="nav-chip" to="/">
            Back To Index
          </Link>
          {previousEntryId ? (
            <Link className="nav-chip" to={`/entry/${encodeURIComponent(previousEntryId)}/`}>
              Previous
            </Link>
          ) : null}
          {nextEntryId ? (
            <Link className="nav-chip" to={`/entry/${encodeURIComponent(nextEntryId)}/`}>
              Next
            </Link>
          ) : null}
        </div>
      </header>

      <section className="detail-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Data Sources</h2>
            <p>{dataItems.length} files</p>
          </div>
          <div className="panel-body">
            {dataItems.map((item) => (
              <section className="text-block" key={item.sourcePath}>
                <h3>{item.fileKey}</h3>
                <p className="path-note">{item.sourcePath}</p>
                {renderDataItem(item)}
              </section>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Output Variants</h2>
            <p>{outItems.length} files</p>
          </div>
          <div className="panel-body">
            {outItems.map((item) => (
              <section className="text-block" key={item.sourcePath}>
                <h3>{item.fileKey}</h3>
                <p className="path-note">{item.sourcePath}</p>
                <pre>{item.item || "(no item at this index)"}</pre>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="page-shell">
        <section className="hero-card">
          <p className="hero-kicker">404</p>
          <h1 className="hero-title">Entry Not Found</h1>
          <p className="hero-subtitle">该条目不存在，或参数格式不正确。</p>
          <Link className="nav-chip" to="/">
            Back To Index
          </Link>
        </section>
      </main>
    );
  }

  throw error;
}

function renderDataItem(item: { fileKey: string; item: string }) {
  const content = item.item || "(no item at this index)";
  if (item.fileKey.endsWith(".json")) {
    return <pre className="code-json" dangerouslySetInnerHTML={{ __html: highlightJson(content) }} />;
  }

  if (item.fileKey.endsWith(".bib")) {
    return <pre className="code-bib" dangerouslySetInnerHTML={{ __html: highlightBib(content) }} />;
  }

  return <pre>{content}</pre>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightJson(text: string): string {
  const escaped = escapeHtml(text);
  const tokenRegex =
    /(&quot;(?:\\.|[^\\])*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g;

  return escaped.replace(tokenRegex, (match, strToken, keySuffix, boolOrNull) => {
    if (strToken) {
      if (keySuffix) {
        return `<span class=\"tok-key\">${strToken}</span><span class=\"tok-punc\">${keySuffix}</span>`;
      }
      return `<span class=\"tok-string\">${strToken}</span>`;
    }
    if (boolOrNull) {
      return `<span class=\"tok-literal\">${match}</span>`;
    }
    return `<span class=\"tok-number\">${match}</span>`;
  });
}

function highlightBib(text: string): string {
  let escaped = escapeHtml(text);

  escaped = escaped.replace(
    /^(@[A-Za-z]+)(\{)([^,]+)(,?)/gm,
    '<span class="tok-entry">$1</span><span class="tok-punc">$2</span><span class="tok-key">$3</span><span class="tok-punc">$4</span>',
  );

  escaped = escaped.replace(
    /^(\s*)([A-Za-z][\w-]*)(\s*=\s*)/gm,
    '$1<span class="tok-field">$2</span><span class="tok-punc">$3</span>',
  );

  escaped = escaped.replace(/(\{[^{}\n]*\})/g, '<span class="tok-string">$1</span>');
  escaped = escaped.replace(/\b\d{2,}\b/g, '<span class="tok-number">$&</span>');

  return escaped;
}
