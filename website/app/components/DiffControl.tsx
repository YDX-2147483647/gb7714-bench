import type { JSX, PropsWithChildren } from "react";

import { humanizeResultKey } from "~/lib/naming";
import type { Result } from "../../plugin/load_files";
import { DiffTextLegend } from "./DiffText";

type BuildDiffOption<T extends Result.Key | null> = {
  /** The result selected for reference in diff. Empty if diff is disabled. */
  refKey: T;
  /** Whether to normalize the result before comparison. */
  shouldNormalize: boolean;
  /** Whether to consider uppercase and lowercase equal. */
  ignoreCase: boolean;
};

export type DiffOption = BuildDiffOption<Result.Key | null>;
export type DiffOptionAlwaysEnable = BuildDiffOption<Result.Key>;

export function DiffControl<T extends Result.Key | null>({
  canDisable,
  option,
  onChange,
  actualTextLegend,
  children,
}: PropsWithChildren<{
  canDisable: null extends T ? true : false;
  option: BuildDiffOption<T>;
  onChange: (option: BuildDiffOption<T>) => void;
  actualTextLegend?: string;
}>): JSX.Element {
  const { refKey, shouldNormalize, ignoreCase } = option;
  return (
    <div className="sticky top-0 border-stroke border-b border-dashed bg-bg p-4 text-ink text-sm">
      {refKey ? (
        <>
          <p className="mb-2 flex items-center justify-between">
            <span>
              对比结果图例：
              <DiffTextLegend actualTextLegend={actualTextLegend} />
            </span>
            {canDisable && (
              <button
                type="button"
                className="mx-2 -my-2 rounded border border-stroke bg-bg-dark px-2 py-1 text-xs hover:bg-bg-dark-hover focus:bg-bg-dark-hover"
                onClick={() => onChange({ ...option, refKey: null as T })}
              >
                退出对比
              </button>
            )}
          </p>
          <p className="mb-2">
            参考：
            <span className="font-semibold">{humanizeResultKey(refKey)}</span>
            {children}
          </p>
          <p className="grid grid-cols-[auto_1fr]">
            <span>对比策略：</span>
            <span className="-ml-2">
              <label className="mx-2 mb-1 inline-block lg:mb-0">
                <input
                  type="checkbox"
                  checked={shouldNormalize}
                  onChange={(e) =>
                    onChange({ ...option, shouldNormalize: e.target.checked })
                  }
                />{" "}
                对比前统一标点符号编码方式
              </label>
              <label className="mx-2 inline-block">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) =>
                    onChange({ ...option, ignoreCase: e.target.checked })
                  }
                />{" "}
                忽略大小写
              </label>
            </span>
          </p>
        </>
      ) : (
        <>
          <p className="mb-2">参考：未选择</p>
          <p>可通过单击标题选择某一结果作为参考对象，让其它结果与之比较</p>
        </>
      )}
    </div>
  );
}
