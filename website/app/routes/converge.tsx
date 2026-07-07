import { RESULT } from "virtual:gb7714-bench-files";
import { mdiOpenInNew } from "@mdi/js";
import { Link } from "react-router";
import type { DiffOptionAlwaysEnable } from "~/components/DiffControl";
import Icon from "~/components/Icon";
import {
  type Counts,
  CountsBars,
  CountsLegend,
  calcDistances,
  countDistances,
} from "~/components/StrDistance";
import { buildStorageKey, useLocalStorage } from "~/composables/hooks";
import { RESULT_KEYS_SORTED } from "~/lib/files";
import { humanizeResultKey } from "~/lib/naming";
import type { Result } from "../../plugin/load_files";
import type { Route } from "./+types/converge";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "评估处理结果趋同程度 | GB/T 7714 Benchmark" },
    {
      name: "description",
      content:
        "处理结果由数据源、引擎、样式三者共同决定。数据源提供文献信息，引擎实现文献著录，样式控制著录项目与格式。选择一种组合作为参考对象，评估其它组合与之趋同程度。",
    },
  ];
}

export default function ConvergeLeaderboard(_: Route.ComponentProps) {
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

  const actualKeys = RESULT_KEYS_SORTED.filter((key) => key !== refKey);

  const entriesSorted: [Result.Key, Counts][] = actualKeys
    .map((actualKey) => {
      const pairs = RESULT[refKey].map((refValue, canonicalIndex) => {
        const actualValue = RESULT[actualKey][canonicalIndex];
        return { refValue, actualValue };
      });
      const counts = countDistances(calcDistances(pairs));
      return [actualKey, counts] as [Result.Key, Counts];
    })
    .sort(
      ([_aKey, a], [_bKey, b]) =>
        b.exact + b.letterCaseOnly - (a.exact + a.letterCaseOnly) ||
        b.exact - a.exact ||
        b.lessThanTen + b.lessThanThree - (a.lessThanTen + a.lessThanThree) ||
        b.lessThanTen - a.lessThanTen,
    );

  return (
    <main className="mx-auto mb-16 p-4 lg:px-8">
      <header className="rounded-2xl border border-stroke bg-card p-5 shadow">
        <p className="font-bold text-accent text-sm">GB/T 7714 Benchmark</p>
        <h1 className="my-2 font-bold text-3xl">评估处理结果趋同程度</h1>
        <p className="my-1 text-ink-soft">
          处理结果由数据源、引擎、样式三者共同决定。数据源提供文献信息，引擎实现文献著录，样式控制著录项目与格式。
        </p>
        <p className="text-ink-soft">
          选择一种「数据源 · 引擎 ·
          样式」组合作为参考对象，评估其它组合与之趋同程度。
        </p>
      </header>

      <div className="my-4 overflow-clip rounded-2xl border border-stroke bg-card shadow">
        <div className="my-3 px-4">
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
      </div>

      <article className="my-4 overflow-clip rounded-2xl border border-stroke bg-card shadow">
        <h2 className="border-stroke border-b bg-bg-dark px-4 py-3">
          统计数字
        </h2>
        {entriesSorted.map(([key, counts], index) => (
          <section
            className="border-stroke border-t border-dashed px-4 py-2 first-of-type:border-t-0"
            key={key}
          >
            <h3 className="my-1">
              <Link
                to="/compare/"
                target="_blank"
                title="详细比较"
                className="-mx-1 rounded px-1 hover:bg-bg-dark hover:shadow-inner focus:bg-bg-dark focus:shadow-inner"
                onClick={() =>
                  // This temporary hack should be replaced when `/compare/` supports loading URL hashes.
                  window.localStorage.setItem(
                    buildStorageKey("compare-actual-key"),
                    JSON.stringify(key),
                  )
                }
              >
                <span className="mr-1">{humanizeResultKey(key)}</span>
                <span className="sr-only">详细比较</span>
                <span className="text-ink-soft">
                  <Icon path={mdiOpenInNew} />
                </span>
              </Link>
            </h3>
            <p className="mt-1 mb-2 text-ink-soft text-xs">{key}</p>
            <CountsBars counts={counts} />
            {index === 0 ? (
              <>
                <CountsLegend counts={counts} form="verbose" />
                <p>
                  以下简记为 <CountsLegend counts={counts} form="concise" />。
                </p>
              </>
            ) : (
              <CountsLegend counts={counts} form="concise" />
            )}
          </section>
        ))}
      </article>
    </main>
  );
}
