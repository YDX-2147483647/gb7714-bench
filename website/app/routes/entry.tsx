import { useMemo, useState } from "react";
import { isRouteErrorResponse, Link } from "react-router";

import { DiffText, DiffTextLegend } from "~/components/DiffText";
import { SyntaxHighlighter } from "~/components/SyntaxHighlighter";
import { getAdjacentEntryIds, getEntryInfo } from "~/lib/files";
import {
  decodeEntryId,
  type EntryIdUrlSafe,
  encodeEntryId,
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
  const nav = getAdjacentEntryIds(entry.canonicalIndex);
  return {
    entry,
    nav,
  };
}

export default function EntryDetail({ loaderData }: Route.ComponentProps) {
  const { entry, nav } = loaderData;
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
      <header className="grid gap-[0.6rem] overflow-hidden rounded-2xl border border-stroke bg-[radial-gradient(circle_at_85%_15%,#ffe9c7_0%,transparent_45%),var(--color-card)] p-5 shadow-[0_10px_24px_rgba(199,109,42,0.08)]">
        <p className="m-0 text-[0.82rem] text-accent-2">
          Entry [{entry.canonicalIndex + 1}]
        </p>
        <h1 className="mt-[0.35rem] mb-0 text-[clamp(1.5rem,3vw,2.4rem)]">
          {entry.meta.name}
        </h1>
        <p className="mt-[0.6rem] mb-0 flex flex-wrap gap-[0.35rem] text-[0.95rem] text-ink-soft">
          <code className="rounded-[0.35rem] border border-stroke bg-bg-soft px-[0.36rem] py-[0.06rem]">
            {entry.id}
          </code>
          <code className="rounded-[0.35rem] border border-stroke bg-bg-soft px-[0.36rem] py-[0.06rem]">
            {entry.meta.entryType}
          </code>
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full border border-stroke bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
            to="/"
          >
            Back To Index
          </Link>
          {nav.prev ? (
            <Link
              className="rounded-full border border-stroke bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
              to={`/entry/${encodeEntryId(nav.prev)}/`}
            >
              Previous
            </Link>
          ) : null}
          {nav.next ? (
            <Link
              className="rounded-full border border-stroke bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
              to={`/entry/${encodeEntryId(nav.next)}/`}
            >
              Next
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="overflow-hidden rounded-[0.9rem] border border-stroke bg-card">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-soft px-[0.95rem] py-[0.8rem]">
            <h2>Data Sources</h2>
            <p>Original + {entry.sources.length} files</p>
          </div>
          <div className="grid">
            <section className="border-[#eedfca] border-t border-dashed px-[0.95rem] py-[0.78rem] first:border-t-0">
              <h3 className="m-0 text-[0.93rem]">Original</h3>
              <p className="mt-[0.3rem] break-all text-[0.75rem] text-ink-soft">
                GB-T_7714—2025.original.toml
              </p>
              <div className="mt-2 rounded-lg border border-[#ecd9bf] bg-[#fff8ea] px-[0.6rem] py-2">
                <p className="m-0 text-[#7a4f25] text-[0.72rem] uppercase tracking-[0.06em]">
                  Section Headings
                </p>
                <ul className="mt-1 mb-0 pl-[1.2rem]">
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
                    <p className="mt-[0.35rem] whitespace-pre-wrap rounded-[0.45rem] border border-[#edd9be] bg-card p-[0.55rem] text-[0.76rem] text-ink-soft">
                      {entry.original.notes}
                    </p>
                  </>
                ) : null}
              </div>
              <pre className="mt-[0.55rem] max-h-72 overflow-auto whitespace-pre-wrap rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-[0.78rem]">
                {entry.original.example}
              </pre>
            </section>

            {entry.sources.map(([key, value]) => (
              <section
                className="border-[#eedfca] border-t border-dashed px-[0.95rem] py-[0.78rem] first:border-t-0"
                key={key}
              >
                <h3 className="m-0 text-[0.93rem]">{humanizeSourceKey(key)}</h3>
                <p className="mt-[0.3rem] break-all text-[0.75rem] text-ink-soft">
                  {key}
                </p>
                {renderDataItem(key, value)}
              </section>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[0.9rem] border border-stroke bg-card">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-soft px-[0.95rem] py-[0.8rem]">
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
              className="max-w-full rounded-[0.4rem] border border-[#e7d4b8] bg-white px-[0.4rem] py-[0.22rem] text-[0.78rem] text-ink"
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
            <DiffTextLegend />
          </div>
          <div className="grid">
            {entry.results.map(([key, value]) => (
              <section
                className="border-[#eedfca] border-t border-dashed px-[0.95rem] py-[0.78rem] first:border-t-0"
                key={key}
              >
                <h3 className="m-0 text-[0.93rem]">{humanizeResultKey(key)}</h3>
                {baseVariant === key && (
                  <span className="float-right mt-[0.55rem] inline-block rounded-full border border-[#e3cca8] bg-[#fff1d4] px-[0.45rem] py-[0.1rem] text-[#7c5027] text-sm">
                    Baseline
                  </span>
                )}
                <p className="mt-[0.3rem] break-all text-[0.75rem] text-ink-soft">
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
  const [baseKey, baseValue] = baseOutput ?? [null, null];

  return (
    <div className="mt-[0.55rem] max-h-72 rounded-[0.55rem] border border-[#efdfca] bg-[#fffbf5] p-[0.6rem] text-sm">
      {baseKey === null || baseKey === key ? (
        <pre>{value}</pre>
      ) : (
        <DiffText actual={value} ref={baseValue} />
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="mx-auto w-[min(1320px,92vw)] pt-5 pb-8">
        <section className="relative overflow-hidden rounded-2xl border border-stroke bg-[radial-gradient(circle_at_85%_15%,#ffe9c7_0%,transparent_45%),var(--color-card)] p-5 shadow-[0_10px_24px_rgba(199,109,42,0.08)]">
          <p className="m-0 text-[0.82rem] text-accent-2">404</p>
          <h1 className="mt-[0.35rem] mb-0 text-[clamp(1.5rem,3vw,2.4rem)]">
            Entry Not Found
          </h1>
          <p className="mt-[0.6rem] mb-0 text-[0.95rem] text-ink-soft">
            该条目不存在，或参数格式不正确。
          </p>
          <Link
            className="rounded-full border border-stroke bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
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
  const language = key.endsWith(".json")
    ? "json"
    : key.endsWith(".bib")
      ? "bibtex"
      : "text";
  return (
    <SyntaxHighlighter language={language} className="text-sm">
      {value}
    </SyntaxHighlighter>
  );
}
