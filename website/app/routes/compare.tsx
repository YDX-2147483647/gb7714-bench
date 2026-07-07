import { RESULT } from "virtual:gb7714-bench-files";
import { mdiOpenInNew } from "@mdi/js";
import { useMemo } from "react";
import { Link } from "react-router";
import {
  DiffControl,
  type DiffOptionAlwaysEnable,
} from "~/components/DiffControl";
import Icon from "~/components/Icon";
import { ResultItem } from "~/components/ResultItem";
import {
  CountsBars,
  CountsLegend,
  calcDistances,
  countDistances,
} from "~/components/StrDistance";
import { buildStorageKey, useLocalStorage } from "~/composables/hooks";
import { ENTRY_IDS, RESULT_KEYS_SORTED } from "~/lib/files";
import { encodeEntryId, humanizeResultKey } from "~/lib/naming";
import type { Result } from "../../plugin/load_files";
import type { Route } from "./+types/compare";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "比较「数据源 · 引擎 · 样式」组合 | GB/T 7714 Benchmark" },
    {
      name: "description",
      content:
        "处理结果由数据源、引擎、样式三者共同决定。数据源提供文献信息，引擎实现文献著录，样式控制著录项目与格式。选择两种组合，比较各条目处理结果。",
    },
  ];
}

export default function CompareTool(_: Route.ComponentProps) {
  const [diffOption, setDiffOption] = useLocalStorage<DiffOptionAlwaysEnable>(
    buildStorageKey("diff-option"),
    {
      refKey: RESULT_KEYS_SORTED[0],
      shouldNormalize: false,
      ignoreCase: false,
    },
    ({ refKey, ...rest }) => ({
      // `refKey` here cannot be null, but other pages may set it to null in the local storage.
      refKey: refKey ?? RESULT_KEYS_SORTED[0],
      ...rest,
    }),
  );

  const refKey = diffOption.refKey;
  const setRefKey = (refKey: Result.Key) =>
    setDiffOption((old) => ({ ...old, refKey }));

  const [actualKey, setActualKey] = useLocalStorage<Result.Key>(
    buildStorageKey("compare-actual-key"),
    RESULT_KEYS_SORTED[1],
  );

  const SORT_ORDER_OPTIONS = ["canonical", "str-distance-descending"] as const;
  const [sortOrder, setSortOrder] = useLocalStorage<
    (typeof SORT_ORDER_OPTIONS)[number]
  >(buildStorageKey("compare-sort-order"), "canonical");

  const resultsByCanonical = useMemo(() => {
    return RESULT[refKey].map((refValue, canonicalIndex) => {
      const entryId = ENTRY_IDS[canonicalIndex];
      const actualValue = RESULT[actualKey][canonicalIndex];
      return { entryId, canonicalIndex, refValue, actualValue };
    });
  }, [refKey, actualKey]);

  const distancesByCanonical = useMemo(
    () => calcDistances(resultsByCanonical),
    [resultsByCanonical],
  );

  const counts = countDistances(distancesByCanonical);

  const resultsSorted = useMemo(() => {
    if (sortOrder === "canonical") {
      return resultsByCanonical;
    } else {
      return [...resultsByCanonical].sort((a, b) => {
        const aDist = distancesByCanonical[a.canonicalIndex];
        const bDist = distancesByCanonical[b.canonicalIndex];
        return (
          // 1. 先忽略大小写计算结果差异，按差异距离降序排列
          bDist[0] - aDist[0] ||
          // 2. 若忽略大小写后结果都无差异，不忽略大小写重新计算，按差异距离降序排列
          bDist[1] - aDist[1] ||
          // 3. 若仍无法区分，按 canonicalIndex 升序排列
          a.canonicalIndex - b.canonicalIndex
        );
      });
    }
  }, [sortOrder, resultsByCanonical, distancesByCanonical]);

  return (
    <main className="mx-auto mb-16 p-4 lg:px-8">
      <header className="rounded-2xl border border-stroke bg-card p-5 shadow">
        <p className="font-bold text-accent text-sm">GB/T 7714 Benchmark</p>
        <h1 className="my-2 font-bold text-3xl">
          比较「数据源 · 引擎 · 样式」组合
        </h1>
        <p className="my-1 text-ink-soft">
          处理结果由数据源、引擎、样式三者共同决定。数据源提供文献信息，引擎实现文献著录，样式控制著录项目与格式。
        </p>
        <p className="text-ink-soft">
          选择两种「数据源 · 引擎 · 样式」组合，比较各条目处理结果。
        </p>
      </header>

      <div className="my-4 overflow-clip rounded-2xl border border-stroke bg-card shadow">
        <div className="my-3 grid grid-cols-1 gap-3 px-4">
          <div>
            <label>
              参考：
              <select
                className="max-w-full rounded border border-stroke bg-white px-2 py-1 text-ink text-sm"
                value={refKey}
                onChange={(e) => setRefKey(e.target.value as Result.Key)}
              >
                {RESULT_KEYS_SORTED.map((key) => (
                  <option key={key} value={key}>
                    {humanizeResultKey(key)}
                  </option>
                ))}
              </select>
            </label>
            <p className="my-1 text-ink-soft text-xs">{refKey}</p>
          </div>
          <div>
            <label>
              待测：
              <select
                className="max-w-full rounded border border-stroke bg-white px-2 py-1 text-ink text-sm"
                value={actualKey}
                onChange={(e) => setActualKey(e.target.value as Result.Key)}
              >
                {RESULT_KEYS_SORTED.map((key) => (
                  <option key={key} value={key}>
                    {humanizeResultKey(key)}
                  </option>
                ))}
              </select>
            </label>
            <p className="my-1 text-ink-soft text-xs">{actualKey}</p>
          </div>
        </div>
        <fieldset className="my-3 grid grid-cols-[auto_1fr] px-4">
          <legend className="contents">详细结果的排列方式：</legend>
          <div className="-ml-2">
            {SORT_ORDER_OPTIONS.map((option) => (
              <label key={option} className="mx-2 mb-1 inline-block lg:mb-0">
                <input
                  type="radio"
                  name="sort-order"
                  value={option}
                  checked={sortOrder === option}
                  onChange={() => setSortOrder(option)}
                />{" "}
                {option === "canonical" ? "国标章节示例顺序" : "差异大小降序"}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <article className="my-4 overflow-clip rounded-2xl border border-stroke bg-card shadow">
        <h2 className="border-stroke border-b bg-bg-dark px-4 py-3">
          统计数字
        </h2>
        <div className="my-3 w-full px-4">
          <CountsBars counts={counts} />
          <CountsLegend counts={counts} form="verbose" />
        </div>
      </article>

      <article className="my-4 overflow-clip rounded-2xl border border-stroke bg-card shadow">
        <h2 className="border-stroke border-b bg-bg-dark px-4 py-3">
          详细结果
        </h2>
        <DiffControl
          option={diffOption}
          onChange={setDiffOption}
          canDisable={false}
          actualTextLegend="待测"
        >
          ；
          <span className="inline-block">
            待测：
            <span className="font-semibold">
              {humanizeResultKey(actualKey)}
            </span>
          </span>
        </DiffControl>
        <div>
          {resultsSorted.map(({ entryId, refValue, actualValue }) => (
            <section key={entryId} className="my-3 px-4">
              <h3 className="mb-1 text-ink-soft text-xs">
                <Link
                  to={`/entry/${encodeEntryId(entryId)}/`}
                  target="_blank"
                  title="单独查看条目"
                  className="rounded px-1 hover:bg-bg-dark hover:shadow-inner focus:bg-bg-dark focus:shadow-inner"
                >
                  <code className="mr-1">{entryId}</code>
                  <span className="sr-only">单独查看条目</span>
                  <Icon path={mdiOpenInNew} />
                </Link>
              </h3>
              <ResultItem
                actualKey={actualKey}
                actualValue={actualValue}
                diffOption={diffOption}
                refValue={refValue}
              />
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
