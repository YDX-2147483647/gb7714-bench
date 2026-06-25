import { type JSX, useMemo, useState } from "react";
import { data, isRouteErrorResponse, Link } from "react-router";

import { DiffText, DiffTextLegend } from "~/components/DiffText";
import { SyntaxHighlighter } from "~/components/SyntaxHighlighter";
import { type EntryInfo, getAdjacentEntryIds, getEntryInfo } from "~/lib/files";
import {
  decodeEntryId,
  type EntryIdUrlSafe,
  encodeEntryId,
  humanizeResultKey,
  humanizeSourceKey,
} from "~/lib/naming";
import { normalizeResult } from "~/lib/result_normalize";
import type { Result, Source } from "../../plugin/load_files";
import type { Route } from "./+types/entry";

export function meta({ params: { entryId }, loaderData }: Route.MetaArgs) {
  const canonicalIndex = loaderData?.entry?.canonicalIndex;
  return [
    {
      title: `条目 [${canonicalIndex !== undefined ? canonicalIndex + 1 : "?"}] ${entryId} | GB/T 7714 Benchmark`,
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

function applyFn<T extends string | null>(
  shouldApply: boolean,
  fn: (x: string) => string,
  x: T,
): T {
  if (shouldApply && x !== null) {
    return fn(x) as T;
  } else {
    return x;
  }
}

export default function EntryDetail({ loaderData }: Route.ComponentProps) {
  const { entry, nav } = loaderData;

  // `resultRef` is the result selected for reference in diff. Empty if diff is disabled.
  const [resultRefKey, setResultRefKey] = useState<Result.Key | null>(
    entry.results.at(0)?.[0] ?? null,
  );
  const resultRefValue = useMemo(
    () =>
      resultRefKey
        ? (entry.results.find(([key, _value]) => key === resultRefKey)?.[1] ??
          null)
        : null,
    [resultRefKey, entry.results],
  );

  // Diff options
  const [shouldNormalizeResult, setShouldNormalizeResult] =
    useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);

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
        <h1 className="mb-2 text-3xl">{entry.meta.name}</h1>
        <div className="flex flex-wrap gap-2">
          {[
            {
              to: nav.prev ? `/entry/${encodeEntryId(nav.prev)}/` : null,
              body: "上一条目",
            },
            {
              to: `/#${encodeEntryId(entry.id)}`,
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="overflow-clip rounded-xl border border-stroke bg-card shadow">
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-dark px-4 py-3">
            <h2>数据源</h2>
            <p className="text-ink-soft text-sm">
              国标原文 + {entry.sources.length} 种格式
            </p>
          </div>
          <div className="grid">
            <section className="border-stroke border-t border-dashed px-4 py-2 first:border-t-0">
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
                className="border-stroke border-t border-dashed px-4 py-2 first:border-t-0"
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
          <div className="flex items-baseline justify-between border-stroke border-b bg-bg-dark px-4 py-3">
            <h2>处理结果</h2>
            <p className="text-ink-soft text-sm">
              {entry.results.length} 种「数据源 · 引擎 · 样式」组合
            </p>
          </div>
          <div className="sticky top-0 border-stroke border-b border-dashed bg-bg p-4 text-ink text-sm">
            {resultRefKey ? (
              <>
                <p className="mb-2 flex items-center justify-between">
                  <span>
                    对比结果图例：
                    <DiffTextLegend />
                  </span>
                  <button
                    type="button"
                    className="mx-2 -my-2 rounded border border-stroke bg-bg-dark px-2 py-1 text-xs hover:bg-bg-dark-hover focus:bg-bg-dark-hover"
                    onClick={() => setResultRefKey(null)}
                  >
                    退出对比
                  </button>
                </p>
                <p className="mb-2">
                  参考：
                  <span className="font-semibold">
                    {humanizeResultKey(resultRefKey)}
                  </span>
                </p>
                <p className="grid grid-cols-[auto_1fr]">
                  <span>对比策略：</span>
                  <span className="-ml-2">
                    <label className="mx-2 inline-block">
                      <input
                        type="checkbox"
                        checked={shouldNormalizeResult}
                        onChange={(e) =>
                          setShouldNormalizeResult(e.target.checked)
                        }
                      />{" "}
                      对比前统一标点符号编码方式
                    </label>
                    <label className="mx-2 inline-block">
                      <input
                        type="checkbox"
                        checked={ignoreCase}
                        onChange={(e) => setIgnoreCase(e.target.checked)}
                      />{" "}
                      忽略大小写
                    </label>
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="mb-2">参考：未选择</p>
                <p>
                  可通过单击标题选择某一结果作为参考对象，让其它结果与之比较
                </p>
              </>
            )}
          </div>
          <div className="grid">
            {entry.results.map(([key, value]) => (
              <section
                className="border-stroke border-t border-dashed px-4 py-2 first:border-t-0"
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
                <p className="my-1 text-ink-soft text-xs">{key}</p>
                {renderResultItem(
                  key,
                  applyFn(
                    resultRefKey !== null && shouldNormalizeResult,
                    normalizeResult,
                    value,
                  ),
                  resultRefKey,
                  applyFn(
                    resultRefKey !== null && shouldNormalizeResult,
                    normalizeResult,
                    resultRefValue,
                  ),
                  ignoreCase,
                )}
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
  refKey: Result.Key | null,
  refValue: string | null,
  ignoreCase?: boolean | undefined,
): JSX.Element {
  return (
    <div className="mt-2 rounded-xl border border-stroke bg-bg-soft p-2 text-sm">
      {refValue === null || refKey === key ? (
        <pre>{value}</pre>
      ) : (
        <DiffText actual={value} ref={refValue} ignoreCase={ignoreCase} />
      )}
    </div>
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
              to="/"
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
