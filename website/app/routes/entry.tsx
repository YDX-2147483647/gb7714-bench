import { diffWordsWithSpace } from "diff";
import { useMemo, useState } from "react";
import { isRouteErrorResponse, Link } from "react-router";

import { getBenchEntryByParam } from "../lib.server";
import type { Route } from "./+types/entry";

export function meta({ params: { entryId } }: Route.MetaArgs) {
  return [{ title: `Entry ${entryId}` }];
}

export async function loader({ params: { entryId } }: Route.LoaderArgs) {
  const data = await getBenchEntryByParam(entryId.replace("-", ":") ?? "");
  if (!data) {
    throw new Response("Entry not found", { status: 404 });
  }
  return data;
}

export default function EntryDetail({ loaderData }: Route.ComponentProps) {
  const {
    entry,
    entrySection,
    previousEntryId,
    nextEntryId,
    dataItems,
    outItems,
  } = loaderData;
  const [baseVariant, setBaseVariant] = useState("");

  const outputOptions = useMemo(
    () =>
      Array.from(new Set(outItems.map((item) => item.fileKey))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [outItems],
  );
  const baseOutput = useMemo(
    () =>
      baseVariant
        ? (outItems.find((item) => item.fileKey === baseVariant) ?? null)
        : null,
    [baseVariant, outItems],
  );

  return (
    <main className="page-shell detail-shell">
      <header className="hero-card detail-hero">
        <p className="hero-kicker">Entry #{entry.index}</p>
        <h1 className="hero-title">{entry.title}</h1>
        <p className="hero-subtitle detail-meta-line">
          <code>{entry.id}</code>
          {entry.citationKey !== entry.id ? (
            <code>{entry.citationKey}</code>
          ) : null}
          <code>{entry.type}</code>
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
            <p>{dataItems.length} files</p>
          </div>
          <div className="panel-body">
            {dataItems.map((item) => (
              <section className="text-block" key={item.sourcePath}>
                <h3>{item.fileKey}</h3>
                <p className="path-note">{item.sourcePath}</p>
                {item.fileKey.endsWith(".original.toml") && entrySection ? (
                  <div className="section-meta-card">
                    <p className="section-meta-kicker">Section Headings</p>
                    <ul>
                      {entrySection.headings.map((heading) => (
                        <li key={heading}>{heading}</li>
                      ))}
                    </ul>
                    {entrySection.notes ? (
                      <>
                        <p className="section-meta-kicker">Section Notes</p>
                        <pre className="section-notes section-notes-in-entry">
                          {entrySection.notes}
                        </pre>
                      </>
                    ) : null}
                  </div>
                ) : null}
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
            {outItems.map((item) => (
              <section className="text-block" key={item.sourcePath}>
                <h3>{item.fileKey}</h3>
                <p className="path-note">{item.sourcePath}</p>
                {renderOutItem(item, baseOutput)}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function renderOutItem(
  item: { fileKey: string; item: string },
  baseOutput: { fileKey: string; item: string } | null,
) {
  const content = item.item || "(no item at this index)";

  if (!baseOutput) {
    return <pre>{content}</pre>;
  }

  if (baseOutput.fileKey === item.fileKey) {
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
      dangerouslySetInnerHTML={{ __html: renderDiff(baseOutput.item, content) }}
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

function renderDataItem(item: { fileKey: string; item: string }) {
  const content = item.item || "(no item at this index)";
  if (item.fileKey.endsWith(".json")) {
    return (
      <pre
        className="code-json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
        dangerouslySetInnerHTML={{ __html: highlightJson(content) }}
      />
    );
  }

  if (item.fileKey.endsWith(".bib")) {
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
