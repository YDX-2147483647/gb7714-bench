import { diffWordsWithSpace } from "diff";
import { useMemo, useState } from "react";
import { isRouteErrorResponse, Link } from "react-router";

import { getEntryInfo } from "~/lib/files";
import {
  decodeEntryId,
  type EntryIdUrlSafe,
  humanizeResultKey,
  humanizeSourceKey,
} from "~/lib/naming";
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
    <main className="mx-auto grid w-[min(1320px,92vw)] gap-4 pt-5 pb-8">
      <header className="grid gap-[0.6rem] overflow-hidden rounded-[1rem] border border-[var(--color-stroke)] bg-[radial-gradient(circle_at_85%_15%,_#ffe9c7_0%,_transparent_45%),var(--color-card)] p-5 shadow-[0_10px_24px_rgba(199,109,42,0.08)]">
        <p className="m-0 text-[0.82rem] text-[var(--color-accent-2)] uppercase tracking-[0.08em]">
          Entry [{entry.canonicalIndex + 1}]
        </p>
        <h1 className="mt-[0.35rem] mb-0 text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.2]">
          {entry.meta.title}
        </h1>
        <p className="mt-[0.6rem] mb-0 flex flex-wrap gap-[0.35rem] text-[0.95rem] text-[var(--color-ink-soft)] leading-[1.7]">
          <code className="rounded-[0.35rem] border border-[var(--color-stroke)] bg-[var(--color-bg-soft)] px-[0.36rem] py-[0.06rem]">
            {entry.id}
          </code>
          <code className="rounded-[0.35rem] border border-[var(--color-stroke)] bg-[var(--color-bg-soft)] px-[0.36rem] py-[0.06rem]">
            {entry.meta.entryType}
          </code>
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full border border-[var(--color-stroke)] bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
            to="/"
          >
            Back To Index
          </Link>
          {previousEntryId ? (
            <Link
              className="rounded-full border border-[var(--color-stroke)] bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
              to={`/entry/${previousEntryId.replace(":", "-")}/`}
            >
              Previous
            </Link>
          ) : null}
          {nextEntryId ? (
            <Link
              className="rounded-full border border-[var(--color-stroke)] bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
              to={`/entry/${nextEntryId.replace(":", "-")}/`}
            >
              Next
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="overflow-hidden rounded-[0.9rem] border border-[var(--color-stroke)] bg-[var(--color-card)]">
          <div className="flex items-baseline justify-between border-[var(--color-stroke)] border-b bg-[var(--color-bg-soft)] px-[0.95rem] py-[0.8rem]">
            <h2>Data Sources</h2>
            <p>Original + {entry.sources.length} files</p>
          </div>
          <div className="grid">
            <section className="border-[#eedfca] border-t border-dashed px-[0.95rem] py-[0.78rem] first:border-t-0">
              <h3 className="m-0 text-[0.93rem]">Original</h3>
              <p className="mt-[0.3rem] break-all text-[0.75rem] text-[var(--color-ink-soft)]">
                GB-T_7714—2025.original.toml
              </p>
              <div className="mt-2 rounded-[0.5rem] border border-[#ecd9bf] bg-[#fff8ea] px-[0.6rem] py-[0.5rem]">
                <p className="m-0 text-[#7a4f25] text-[0.72rem] uppercase tracking-[0.06em]">
                  Section Headings
                </p>
                <ul className="mt-[0.25rem] mb-0 pl-[1.2rem]">
                  {entry.original.headings.map((heading) => (
                    <li className="my-[0.2rem] text-[0.78rem]" key={heading}>
                      {heading}
                    </li>
                  ))}
                </ul>
                {entry.original.notes ? (
                  <>
                    <p className="m-0 text-[#7a4f25] text-[0.72rem] uppercase tracking-[0.06em]">
                      Section Notes
                    </p>
                    <p className="mt-[0.35rem] whitespace-pre-wrap rounded-[0.45rem] border border-[#edd9be] bg-[#fffdf8] p-[0.55rem] text-[0.76rem] text-[var(--color-ink-soft)] leading-[1.55]">
                      {entry.original.notes}
                    </p>
                  </>
                ) : null}
              </div>
              <pre className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]">
                {entry.original.example}
              </pre>
            </section>

            {entry.sources.map(([key, value]) => (
              <section
                className="border-[#eedfca] border-t border-dashed px-[0.95rem] py-[0.78rem] first:border-t-0"
                key={key}
              >
                <h3 className="m-0 text-[0.93rem]">{humanizeSourceKey(key)}</h3>
                <p className="mt-[0.3rem] break-all text-[0.75rem] text-[var(--color-ink-soft)]">
                  {key}
                </p>
                {renderDataItem(key, value)}
              </section>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[0.9rem] border border-[var(--color-stroke)] bg-[var(--color-card)]">
          <div className="flex items-baseline justify-between border-[var(--color-stroke)] border-b bg-[var(--color-bg-soft)] px-[0.95rem] py-[0.8rem]">
            <h2>Processed Results</h2>
            <p>{entry.results.length} files</p>
          </div>
          <div className="flex items-center gap-[0.65rem] border-[#ead8bd] border-b border-dashed bg-[#fff9ee] px-[0.95rem] py-[0.55rem]">
            <label
              className="text-[#694b36] text-[0.78rem]"
              htmlFor="diff-base"
            >
              Diff Base
            </label>
            <select
              className="max-w-full rounded-[0.4rem] border border-[#e7d4b8] bg-white px-[0.4rem] py-[0.22rem] text-[0.78rem] text-[var(--color-ink)]"
              id="diff-base"
              value={baseVariant}
              onChange={(event) => setBaseVariant(event.target.value)}
            >
              <option value="">(none)</option>
              {outputOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {humanizeResultKey(opt)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid">
            {entry.results.map(([key, value]) => (
              <section
                className="border-[#eedfca] border-t border-dashed px-[0.95rem] py-[0.78rem] first:border-t-0"
                key={key}
              >
                <h3 className="m-0 text-[0.93rem]">{humanizeResultKey(key)}</h3>
                <p className="mt-[0.3rem] break-all text-[0.75rem] text-[var(--color-ink-soft)]">
                  {key}
                </p>
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
    return (
      <pre className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]">
        {content}
      </pre>
    );
  }

  const [baseKey, baseValue] = baseOutput;

  if (baseKey === key) {
    return (
      <>
        <p className="mt-[0.55rem] inline-block rounded-full border border-[#e3cca8] bg-[#fff1d4] px-[0.45rem] py-[0.1rem] text-[#7c5027] text-[0.7rem]">
          Baseline
        </p>
        <pre className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]">
          {content}
        </pre>
      </>
    );
  }

  return (
    <pre
      className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
      dangerouslySetInnerHTML={{ __html: renderDiff(baseValue, content) }}
    />
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="mx-auto w-[min(1320px,92vw)] pt-5 pb-8">
        <section className="relative overflow-hidden rounded-[1rem] border border-[var(--color-stroke)] bg-[radial-gradient(circle_at_85%_15%,_#ffe9c7_0%,_transparent_45%),var(--color-card)] p-5 shadow-[0_10px_24px_rgba(199,109,42,0.08)]">
          <p className="m-0 text-[0.82rem] text-[var(--color-accent-2)] uppercase tracking-[0.08em]">
            404
          </p>
          <h1 className="mt-[0.35rem] mb-0 text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.2]">
            Entry Not Found
          </h1>
          <p className="mt-[0.6rem] mb-0 text-[0.95rem] text-[var(--color-ink-soft)] leading-[1.7]">
            该条目不存在，或参数格式不正确。
          </p>
          <Link
            className="rounded-full border border-[var(--color-stroke)] bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
            to="/"
          >
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
        className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
        dangerouslySetInnerHTML={{ __html: highlightJson(content) }}
      />
    );
  }

  if (key.endsWith(".bib")) {
    return (
      <pre
        className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: todo
        dangerouslySetInnerHTML={{ __html: highlightBib(content) }}
      />
    );
  }

  return (
    <pre className="mt-[0.55rem] max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem] leading-[1.55]">
      {content}
    </pre>
  );
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
          return `<span class="font-semibold text-[#8a4d0f]">${strToken}</span><span class="text-[#7b7f89]">${keySuffix}</span>`;
        }
        return `<span class="text-[#0f6e59]">${strToken}</span>`;
      }
      if (boolOrNull) {
        return `<span class="font-semibold text-[#6a3fb8]">${match}</span>`;
      }
      return `<span class="text-[#154fb4]">${match}</span>`;
    },
  );
}

function highlightBib(text: string): string {
  let escaped = escapeHtml(text);

  escaped = escaped.replace(
    /^(@[A-Za-z]+)(\{)([^,]+)(,?)/gm,
    '<span class="font-bold text-[#a23221]">$1</span><span class="text-[#7b7f89]">$2</span><span class="font-semibold text-[#8a4d0f]">$3</span><span class="text-[#7b7f89]">$4</span>',
  );

  escaped = escaped.replace(
    /^(\s*)([A-Za-z][\w-]*)(\s*=\s*)/gm,
    '$1<span class="font-semibold text-[#8a4d0f]">$2</span><span class="text-[#7b7f89]">$3</span>',
  );

  escaped = escaped.replace(
    /(\{[^{}\n]*\})/g,
    '<span class="text-[#0f6e59]">$1</span>',
  );
  escaped = escaped.replace(
    /\b\d{2,}\b/g,
    '<span class="text-[#154fb4]">$&</span>',
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
        return `<span class="bg-[#daf8dd] text-[#0e5b2a]">${html}</span>`;
      }
      if (part.removed) {
        return `<span class="bg-[#ffe1df] text-[#8b1b1b] line-through">${html}</span>`;
      }
      return `<span>${html}</span>`;
    })
    .join("");
}
