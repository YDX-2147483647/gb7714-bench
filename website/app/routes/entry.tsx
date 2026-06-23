import { diffWordsWithSpace } from "diff";
import { useMemo, useState } from "react";
import { isRouteErrorResponse, Link } from "react-router";

import { getEntryInfo } from "~/lib/files";
import { decodeEntryId, type EntryIdUrlSafe } from "~/lib/naming";
import type { Route } from "./+types/entry";

export function meta({ params: { entryId }, loaderData }: Route.MetaArgs) {
  const canonicalIndex = loaderData?.entry?.canonicalIndex ?? -1;
  return [{ title: `Entry [${canonicalIndex + 1}] ${entryId}` }];
}

export async function clientLoader({ params: { entryId } }: Route.LoaderArgs) {
  const entry = getEntryInfo(decodeEntryId(entryId as EntryIdUrlSafe));
  return {
    entry,
    // TODO
    previousEntryId: "gbt7714.5.1:1",
    nextEntryId: "gbt7714.5.1:1",
  };
}

export default function EntryDetail({ loaderData }: Route.ComponentProps) {
  const { entry, previousEntryId, nextEntryId } = loaderData;
  const [baseVariant, setBaseVariant] = useState("");

  const outputOptions = useMemo(
    () => entry.results.map(([key, _]) => key),
    [entry.results],
  );
  const baseOutput = useMemo(
    () =>
      baseVariant
        ? (entry.results.find(([key, _]) => key === baseVariant) ?? null)
        : null,
    [baseVariant, entry.results],
  );

  return (
    <main className="page-shell detail-shell">
      <header className="hero-card detail-hero">
        <p className="hero-kicker">Entry [{entry.canonicalIndex + 1}]</p>
        <h1 className="hero-title">{entry.meta.title}</h1>
        <p className="hero-subtitle detail-meta-line">
          <code>{entry.id}</code>
          <code>{entry.meta.entryType}</code>
        </p>
        <div className="detail-nav">
          <Link className="nav-chip" to="/">
            Back To Index
          </Link>
          {previousEntryId ? (
            <Link
              className="nav-chip"
              to={`/entry/${previousEntryId.replace(":", "-")}/`}
            >
              Previous
            </Link>
          ) : null}
          {nextEntryId ? (
            <Link
              className="nav-chip"
              to={`/entry/${nextEntryId.replace(":", "-")}/`}
            >
              Next
            </Link>
          ) : null}
        </div>
      </header>

      <section className="detail-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Data Sources</h2>
            <p>Original + {entry.sources.length} files</p>
          </div>
          <div className="panel-body">
            <section className="text-block">
              <h3>Original</h3>
              <p className="path-note">GB-T_7714—2025.original.toml</p>
              <div className="section-meta-card">
                <p className="section-meta-kicker">Section Headings</p>
                <ul>
                  {entry.original.headings.map((heading) => (
                    <li key={heading}>{heading}</li>
                  ))}
                </ul>
                {entry.original.notes ? (
                  <>
                    <p className="section-meta-kicker">Section Notes</p>
                    <p className="section-notes section-notes-in-entry">
                      {entry.original.notes}
                    </p>
                  </>
                ) : null}
              </div>
              <pre>{entry.original.example}</pre>
            </section>
            {entry.sources.map(([key, value]) => (
              <section className="text-block" key={key}>
                <h3>{key}</h3>
                <p className="path-note">{key}</p>
                {renderDataItem(key, value)}
              </section>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Processed Results</h2>
            <p>{entry.results.length} files</p>
          </div>
          <div className="panel-filter-row">
            <label htmlFor="diff-base">Diff Base</label>
            <select
              id="diff-base"
              value={baseVariant}
              onChange={(event) => setBaseVariant(event.target.value)}
            >
              <option value="">(none)</option>
              {outputOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="panel-body">
            {entry.results.map(([key, value]) => (
              <section className="text-block" key={key}>
                <h3>{key}</h3>
                <p className="path-note">{key}</p>
                {renderOutItem(key, value, baseOutput)}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function renderOutItem(
  key: string,
  value: string,
  baseOutput: [string, string] | null,
) {
  const content = value;

  if (!baseOutput) {
    return <pre>{content}</pre>;
  }

  const [baseKey, baseValue] = baseOutput;

  if (baseKey === key) {
    return (
      <>
        <p className="diff-badge">Baseline</p>
        <pre>{content}</pre>
      </>
    );
  }

  return (
    <pre
      className="code-diff"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
      dangerouslySetInnerHTML={{ __html: renderDiff(baseValue, content) }}
    />
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

function renderDataItem(key: string, value: string) {
  const content = value;
  if (key.endsWith(".json")) {
    return (
      <pre
        className="code-json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
        dangerouslySetInnerHTML={{ __html: highlightJson(content) }}
      />
    );
  }

  if (key.endsWith(".bib")) {
    return (
      <pre
        className="code-bib"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
        dangerouslySetInnerHTML={{ __html: highlightBib(content) }}
      />
    );
  }

  return <pre>{content}</pre>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightJson(text: string): string {
  const escaped = escapeHtml(text);
  const tokenRegex =
    /(&quot;(?:\\.|[^\\])*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g;

  return escaped.replace(
    tokenRegex,
    (match, strToken, keySuffix, boolOrNull) => {
      if (strToken) {
        if (keySuffix) {
          return `<span class="tok-key">${strToken}</span><span class="tok-punc">${keySuffix}</span>`;
        }
        return `<span class="tok-string">${strToken}</span>`;
      }
      if (boolOrNull) {
        return `<span class="tok-literal">${match}</span>`;
      }
      return `<span class="tok-number">${match}</span>`;
    },
  );
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

  escaped = escaped.replace(
    /(\{[^{}\n]*\})/g,
    '<span class="tok-string">$1</span>',
  );
  escaped = escaped.replace(
    /\b\d{2,}\b/g,
    '<span class="tok-number">$&</span>',
  );

  return escaped;
}

function renderDiff(baseText: string, targetText: string): string {
  const base = baseText || "";
  const target = targetText || "";
  const parts = diffWordsWithSpace(base, target);

  return parts
    .map((part) => {
      const html = escapeHtml(part.value);
      if (part.added) {
        return `<span class="tok-added">${html}</span>`;
      }
      if (part.removed) {
        return `<span class="tok-removed">${html}</span>`;
      }
      return `<span>${html}</span>`;
    })
    .join("");
}
