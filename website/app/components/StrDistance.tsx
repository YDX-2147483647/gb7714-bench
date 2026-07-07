import leven from "leven";
import type { JSX } from "react";
import { normalizeResult } from "~/lib/result_normalize";

/** `options.maxDistance` for `leven`. */
const MAX_DISTANCE = "DOI:10.48550/arXiv.1205.5935".length * 1.5;

type StrDistance = [number, -1] | [0, number];

/**
 * 对于每条结果，若忽略大小写也有差异，则返回忽略大小写算出的距离，否则返回不忽略大小写算出的距离。
 * 两种距离的分别用`[major, -1]`和`[0, minor]`表示，可直接用于排序。
 */
export function calcDistances(
  results: { refValue: string; actualValue: string }[],
): StrDistance[] {
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

export type Counts = {
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

export function countDistances(distances: StrDistance[]): Counts {
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

export function CountsBars({ counts }: { counts: Counts }): JSX.Element {
  return (
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
  );
}

export function CountsLegend({
  counts,
  form,
}: {
  counts: Counts;
  form: "verbose" | "concise";
}): JSX.Element {
  if (form === "concise") {
    return (
      <span>
        <span className="-mx-0.5 border-green-400 border-b-2 px-0.5">
          {counts.exact}
        </span>
        {", "}
        <span className="-mx-0.5 border-sky-400 border-b-2 px-0.5">
          {counts.letterCaseOnly}
        </span>
        {" | "}
        <span className="-mx-0.5 border-yellow-300 border-b-2 px-0.5">
          {counts.lessThanThree}
        </span>
        {", "}
        <span className="-mx-0.5 border-amber-400 border-b-2 px-0.5">
          {counts.lessThanTen}
        </span>
        {", "}
        <span className="-mx-0.5 border-red-600 border-b-2 px-0.5">
          {counts.lessThanMax}
        </span>
        {" | "}
        <span className="-mx-0.5 border-purple-800 border-b-2 px-0.5">
          {counts.disaster}
        </span>
      </span>
    );
  }

  return (
    <div className="prose my-3 max-w-full">
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
