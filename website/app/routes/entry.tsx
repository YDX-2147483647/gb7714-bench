import { type JSX, useMemo, useState } from "react";
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
import type { Result, Source } from "../../plugin/load_files";
import type { Route } from "./+types/entry";

export function meta({ params: { entryId }, loaderData }: Route.MetaArgs) {
  const canonicalIndex = loaderData?.entry?.canonicalIndex;
  return [
    {
      title: `条目 [${canonicalIndex !== undefined ? canonicalIndex + 1 : "?"}] ${entryId}`,
    },
  ];
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

  const resultKeys = entry.results.map(([key, _]) => key);

  // `resultRef` is the result selected for reference in diff. Empty if diff is disabled.
  const [resultRefKey, setResultRefKey] = useState<Result.Key | "">("");
  const resultRefValue = useMemo(
    () =>
      resultRefKey
        ? (entry.results.find(([key, _value]) => key === resultRefKey)?.[1] ??
          null)
        : null,
    [resultRefKey, entry.results],
  );

  return (
    <main className="mx-auto grid gap-4 p-4 lg:px-8">
      <header className="grid gap-2 rounded-2xl border border-stroke bg-[radial-gradient(circle_at_85%_15%,#ffe9c7_0%,transparent_45%),var(--color-card)] p-5 shadow">
        <p className="flex flex-wrap gap-2 text-sm">
          <span className="text-accent-2">
            条目 [{entry.canonicalIndex + 1}]
          </span>
          {[entry.id, entry.meta.entryType].map((tag) => (
            <code
              key={tag}
              className="rounded-full border border-[#e8d8c1] px-2 py-0.5 text-ink-soft"
            >
              {tag}
            </code>
          ))}
        </p>
        <h1 className="mb-2 text-3xl">{entry.meta.name}</h1>
        <div className="flex flex-wrap gap-2">
          {[
            {
              to: nav.prev ? `/entry/${encodeEntryId(nav.prev)}/` : null,
              body: "上一条目",
            },
            {
              to: "/",
              body: "返回条目索引",
            },
            {
              to: nav.next ? `/entry/${encodeEntryId(nav.next)}/` : null,
              body: "下一条目",
            },
          ].map(({ to, body }) => {
            if (!to) {
              return null;
            }
            return (
              <Link
                key={to}
                className="rounded border border-stroke bg-[#fff5df] px-[0.68rem] py-[0.24rem] text-[#5e3f2d] text-[0.78rem] hover:bg-[#ffeccc]"
                to={to}
              >
                {body}
              </Link>
            );
          })}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="overflow-clip rounded-xl border border-stroke bg-card shadow">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-soft px-4 py-[0.8rem]">
            <h2>数据源</h2>
            <p className="text-ink-soft text-sm">
              国标原文 + {entry.sources.length} 种格式
            </p>
          </div>
          <div className="grid">
            <section className="border-[#eedfca] border-t border-dashed px-4 py-2 first:border-t-0">
              <h3 className="my-1">国标原文</h3>
              <p className="my-1 text-ink-soft text-xs">
                GB-T_7714—2025.original.toml
              </p>
              <div className="my-2 px-2 text-sm">
                <ul className="my-2">
                  {entry.original.headings.map((heading) => (
                    <li className="my-1" key={heading}>
                      {heading}
                    </li>
                  ))}
                </ul>
                {entry.original.notes?.split("\n").map((par) => (
                  <p key={par} className="pb-1">
                    {par}
                  </p>
                ))}
              </div>
              <pre className="rounded-2xl bg-white px-5 py-6 text-sm">
                {entry.original.example}
              </pre>
            </section>

            {entry.sources.map(([key, value]) => (
              <section
                className="border-[#eedfca] border-t border-dashed px-4 py-2 first:border-t-0"
                key={key}
              >
                <h3 className="my-1">{humanizeSourceKey(key)}</h3>
                <p className="my-1 text-ink-soft text-xs">{key}</p>
                {renderSourceItem(key, value)}
              </section>
            ))}
          </div>
        </article>

        <article className="overflow-clip rounded-xl border border-stroke bg-card shadow">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-soft px-4 py-[0.8rem]">
            <h2>处理结果</h2>
            <p className="text-ink-soft text-sm">
              {entry.results.length} 种「数据源 · 引擎 · 样式」组合
            </p>
          </div>
          <div className="sticky top-0 flex items-center gap-[0.65rem] border-[#ead8bd] border-b border-dashed bg-[#fff9ee] px-4 py-[0.55rem]">
            {/* TODO: Improve UI logic */}
            <label className="text-[#694b36] text-[0.78rem]" htmlFor="diff-ref">
              Diff Ref
            </label>
            <select
              className="max-w-full rounded-[0.4rem] border border-[#e7d4b8] bg-white px-[0.4rem] py-[0.22rem] text-[0.78rem] text-ink"
              id="diff-ref"
              value={resultRefKey}
              onChange={(event) =>
                setResultRefKey(event.target.value as Result.Key | "")
              }
            >
              <option value="">(none)</option>
              {resultKeys.map((opt) => (
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
                className="border-[#eedfca] border-t border-dashed px-4 py-2 first:border-t-0"
                key={key}
              >
                <h3 className="my-1">{humanizeResultKey(key)}</h3>
                {resultRefKey === key && (
                  <span className="float-right mt-[0.55rem] inline-block rounded-full border border-[#e3cca8] bg-[#fff1d4] px-[0.45rem] py-[0.1rem] text-[#7c5027] text-sm">
                    Baseline
                  </span>
                )}
                <p className="my-1 text-ink-soft text-xs">{key}</p>
                {renderResultItem(key, value, resultRefKey, resultRefValue)}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function renderSourceItem(key: Source.Key, value: string): JSX.Element {
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

function renderResultItem(
  key: Result.Key,
  value: string,
  refKey: Result.Key | "",
  refValue: string | null,
): JSX.Element {
  return (
    <div className="mt-2 rounded-xl border border-[#efdfca] bg-[#fffbf5] p-2 text-sm">
      {refValue === null || refKey === key ? (
        <pre>{value}</pre>
      ) : (
        <DiffText actual={value} ref={refValue} />
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // TODO: This isn't working.
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="mx-auto w-[min(1320px,92vw)] pt-5 pb-8">
        <section className="relative overflow-clip rounded-2xl border border-stroke bg-[radial-gradient(circle_at_85%_15%,#ffe9c7_0%,transparent_45%),var(--color-card)] p-5 shadow">
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
