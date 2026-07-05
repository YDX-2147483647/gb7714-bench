import { RESULT } from "virtual:gb7714-bench-files";
import { mdiOpenInNew } from "@mdi/js";
import leven from "leven";
import { type JSX, useMemo } from "react";
import { Link } from "react-router";
import {
  DiffControl,
  type DiffOptionAlwaysEnable,
} from "~/components/DiffControl";
import Icon from "~/components/Icon";
import { ResultItem } from "~/components/ResultItem";
import { buildStorageKey, useLocalStorage } from "~/composables/hooks";
import { ENTRY_IDS, RESULT_KEYS_SORTED } from "~/lib/files";
import { encodeEntryId, humanizeResultKey } from "~/lib/naming";
import { normalizeResult } from "~/lib/result_normalize";
import type { Result } from "../../plugin/load_files";
import type { Route } from "./+types/compare";

/** `options.maxDistance` for `leven`. */
const MAX_DISTANCE = "DOI:10.48550/arXiv.1205.5935".length * 1.5;

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
        <CountsBars counts={counts} />
        <CountsLegend counts={counts} />
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

type LevenDistance = [number, -1] | [0, number];

/**
 * 对于每条结果，若忽略大小写也有差异，则返回忽略大小写算出的距离，否则返回不忽略大小写算出的距离。
 * 两种距离的分别用`[major, -1]`和`[0, minor]`表示，可直接用于排序。
 */
function calcDistances(
  results: { refValue: string; actualValue: string }[],
): LevenDistance[] {
  return results.map(({ refValue, actualValue }) => {
    const ref = normalizeResult(refValue);
    const actual = normalizeResult(actualValue);

    // 差异特别大的往往是缺项，可以不计算具体距离以提高性能
    const options = { maxDistance: MAX_DISTANCE };
    const major = leven(ref.toLowerCase(), actual.toLowerCase(), options);

    if (major > 0) {
      return [major, -1];
    } else {
      const minor = leven(ref, actual, options);
      return [0, minor];
    }
  });
}

type Counts = {
  total: number;

  /** major = 0 ∧ minor = 0 */
  exact: number;
  /** major = 0 ∧ minor > 0 */
  letterCaseOnly: number;
  /** 1 ≤ major < 3 */
  lessThanThree: number;
  /** 3 ≤ major < 10 */
  lessThanTen: number;
  /** 10 ≤ major < MAX_DISTANCE */
  lessThanMax: number;
  /** major ≥ MAX_DISTANCE */
  disaster: number;
};

function countDistances(distances: LevenDistance[]): Counts {
  // biome-ignore format: the counting expressions look better in a single line.
  return {
    total: distances.length,
    exact: distances.filter(([major, minor]) => major === 0 && minor === 0).length,
    letterCaseOnly: distances.filter(([major, minor]) => major === 0 && minor > 0).length,
    lessThanThree: distances.filter(([major]) => major >= 1 && major < 3).length,
    lessThanTen: distances.filter(([major]) => major >= 3 && major < 10).length,
    lessThanMax: distances.filter(([major]) => major >= 10 && major < MAX_DISTANCE).length,
    disaster: distances.filter(([major]) => major >= MAX_DISTANCE).length,
  };
}

function CountsBars({ counts }: { counts: Counts }): JSX.Element {
  return (
    <div className="my-3 w-full px-4">
      <p className="flex h-4 w-full overflow-clip rounded-full">
        <span
          className="bg-green-400"
          style={{ width: `${(counts.exact / counts.total) * 100}%` }}
        />
        <span
          className="bg-sky-400"
          style={{
            width: `${(counts.letterCaseOnly / counts.total) * 100}%`,
          }}
        />
        <span
          className="bg-yellow-300"
          style={{
            width: `${(counts.lessThanThree / counts.total) * 100}%`,
          }}
        />
        <span
          className="bg-amber-400"
          style={{ width: `${(counts.lessThanTen / counts.total) * 100}%` }}
        />
        <span
          className="bg-red-600"
          style={{ width: `${(counts.lessThanMax / counts.total) * 100}%` }}
        />
        <span
          className="bg-purple-800"
          style={{ width: `${(counts.disaster / counts.total) * 100}%` }}
        />
      </p>
    </div>
  );
}

function CountsLegend({ counts }: { counts: Counts }): JSX.Element {
  return (
    <div className="prose my-3 max-w-full px-4">
      <p>
        {counts.total} 条文献统一标点符号编码方式后，待测与参考有{" "}
        <span className="underline decoration-3 decoration-green-400">
          {counts.exact} 条
        </span>
        完全一致、
        <span className="underline decoration-3 decoration-sky-400">
          {counts.letterCaseOnly} 条
        </span>
        不完全一致但只有大小写差异；
        <br />
        其余文献忽略大小写统计差异字符数（Levenshtein 距离），
        <span className="underline decoration-3 decoration-yellow-300">
          {counts.lessThanThree} 条
        </span>
        只差一两字，
        <span className="underline decoration-3 decoration-amber-400">
          {counts.lessThanTen} 条
        </span>
        相差三至九字，
        <span className="underline decoration-3 decoration-red-600">
          {counts.lessThanMax} 条
        </span>
        相差十字以上但不满 {MAX_DISTANCE} 字，
        <span className="underline decoration-3 decoration-purple-800">
          {counts.disaster} 条
        </span>
        相差 {MAX_DISTANCE} 字以上。（{MAX_DISTANCE} 是著录 DOI
        所用字符数典型值的 1.5 倍）
      </p>
    </div>
  );
}
