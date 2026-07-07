import { type JSX, useMemo } from "react";
import { data, isRouteErrorResponse, Link } from "react-router";

import { DiffControl, type DiffOption } from "~/components/DiffControl";
import { ResultItem } from "~/components/ResultItem";
import { SyntaxHighlighter } from "~/components/SyntaxHighlighter";
import { calcAddedRanges } from "~/composables/diff";
import { buildStorageKey, useLocalStorage } from "~/composables/hooks";
import { type EntryInfo, getAdjacentEntryIds, getEntryInfo } from "~/lib/files";
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
      title: `条目 [${canonicalIndex !== undefined ? canonicalIndex + 1 : "?"}] ${decodeEntryId(entryId as EntryIdUrlSafe)} | GB/T 7714 Benchmark`,
    },
  ];
}

export async function clientLoader({ params: { entryId } }: Route.LoaderArgs) {
  let entry: EntryInfo;
  try {
    entry = getEntryInfo(decodeEntryId(entryId as EntryIdUrlSafe));
  } catch (error) {
    if (error instanceof Error) {
      throw data(error.message, { status: 404, statusText: "Entry Not Found" });
    }
    throw error;
  }

  const nav = getAdjacentEntryIds(entry.canonicalIndex);
  return { entry, nav };
}

export default function EntryDetail({ loaderData }: Route.ComponentProps) {
  const { entry, nav } = loaderData;

  const [diffOption, setDiffOption] = useLocalStorage<DiffOption>(
    buildStorageKey("diff-option"),
    {
      refKey: entry.results.at(0)?.[0] ?? null,
      shouldNormalize: false,
      ignoreCase: false,
    },
  );

  const resultRefKey = diffOption.refKey;
  const setResultRefKey = (refKey: Result.Key | null) =>
    setDiffOption((old) => ({ ...old, refKey }));

  const resultRefValue = useMemo(
    () =>
      resultRefKey
        ? (entry.results.find(([key, _value]) => key === resultRefKey)?.[1] ??
          null)
        : null,
    [resultRefKey, entry.results],
  );

  return (
    <main className="mx-auto mb-16 grid gap-4 p-4 lg:px-8">
      <header className="grid gap-2 rounded-2xl border border-stroke bg-card p-5 shadow">
        <p className="flex flex-wrap items-baseline gap-2 text-sm">
          <span className="text-accent">条目 [{entry.canonicalIndex + 1}]</span>
          {[entry.id, entry.meta.entryType].map((tag) => (
            <code
              key={tag}
              className="rounded-full border border-stroke px-2 py-0.5 text-ink-soft"
            >
              {tag}
            </code>
          ))}
        </p>
        <h1 className="mb-2 text-4xl">{entry.meta.name}</h1>
        <div className="flex flex-wrap gap-2">
          {[
            {
              to: nav.prev ? `/entry/${encodeEntryId(nav.prev)}/` : null,
              body: "上一条目",
            },
            {
              to: `/entry/#${encodeEntryId(entry.id)}`,
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
                className="rounded border border-stroke bg-bg-dark px-2 py-1 text-xs hover:bg-bg-dark-hover focus:bg-bg-dark-hover"
                to={to}
              >
                {body}
              </Link>
            );
          })}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-3">
        <article className="overflow-clip rounded-2xl border border-stroke bg-card shadow lg:rounded-br-none">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-dark px-4 py-3">
            <h2>数据源</h2>
            <p className="text-ink-soft text-sm">
              国标原文 + {entry.sources.length} 种格式
            </p>
          </div>
          <div className="lg:scrollbar-thin lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <section className="px-4 py-2">
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
              <pre className="rounded-xl bg-white px-5 py-6 text-sm">
                {entry.original.example}
              </pre>
            </section>

            {entry.sources.map(([key, value], index) => (
              <section
                className="border-stroke border-t border-dashed px-4 py-2"
                key={key}
              >
                <h3 className="my-1">{humanizeSourceKey(key)}</h3>
                <p className="my-1 text-ink-soft text-xs">{key}</p>
                {renderSourceItem(
                  key,
                  value,
                  entry.sources[
                    // *.builtin.* comes before *.better.*
                    index + (key.includes(".builtin.") ? 1 : -1)
                  ][1],
                )}
              </section>
            ))}
          </div>
        </article>

        <article className="overflow-clip rounded-2xl border border-stroke bg-card shadow lg:rounded-bl-none">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-dark px-4 py-3">
            <h2>处理结果</h2>
            <p className="text-ink-soft text-sm">
              {entry.results.length} 种「数据源 · 引擎 · 样式」组合
            </p>
          </div>
          <DiffControl
            option={diffOption}
            canDisable={true}
            onChange={setDiffOption}
          />
          <div>
            {entry.results.map(([key, value]) => (
              <section
                className="border-stroke border-t border-dashed px-4 py-2"
                key={key}
              >
                <h3 className="my-1">
                  {resultRefKey === key ? (
                    <span className="-mx-1 rounded bg-green-200 px-1 font-bold">
                      {humanizeResultKey(key)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="-mx-1 rounded px-1 hover:bg-green-100 focus:bg-green-100"
                      onClick={() => setResultRefKey(key)}
                    >
                      {humanizeResultKey(key)}
                    </button>
                  )}
                </h3>
                <p className="mt-1 mb-2 text-ink-soft text-xs">{key}</p>
                <ResultItem
                  actualKey={key}
                  actualValue={value}
                  diffOption={diffOption}
                  refValue={resultRefValue}
                />
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function renderSourceItem(
  key: Source.Key,
  value: string,
  refValue: string,
): JSX.Element {
  const language = key.endsWith(".json")
    ? "json"
    : key.endsWith(".bib")
      ? "bibtex"
      : "text";

  const highlightRanges = calcAddedRanges(refValue, value);

  return (
    <SyntaxHighlighter
      className="text-sm"
      language={language}
      highlightRanges={highlightRanges}
    >
      {value}
    </SyntaxHighlighter>
  );
}

export function ErrorBoundary({
  error,
  params: { entryId },
}: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="mx-auto max-w-max p-8">
        <section className="grid gap-4 overflow-clip rounded-2xl border border-stroke bg-card p-5 shadow">
          <p className="text-accent">
            {error.status} {error.statusText}
          </p>
          <h1 className="text-3xl">
            条目 [?] {decodeEntryId(entryId as EntryIdUrlSafe)} 不存在
          </h1>
          <div>{error.data}</div>
          <p>
            正常不应该有此问题，请通过{" "}
            <a
              className="hover:underline focus:underline"
              href="https://github.com/YDX-2147483647/gb7714-bench/issues/new/choose"
              target="_blank"
              rel="noopener"
            >
              GitHub issue
            </a>{" "}
            或其它方式反馈。
          </p>

          <p>
            <Link
              className="rounded border border-stroke bg-bg-dark px-2 py-1 text-xs hover:bg-bg-dark-hover focus:bg-bg-dark-hover"
              to="/entry/"
            >
              返回条目索引
            </Link>
          </p>
        </section>
      </main>
    );
  }

  throw error;
}
