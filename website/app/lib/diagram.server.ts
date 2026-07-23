import { RESULT, SOURCE } from "virtual:gb7714-bench-files";
import { execa } from "execa";
import { calcDistances, countDistances } from "~/components/StrDistance";
import type { Source } from "../../plugin/load_files";
import diagramTyp from "./diagram.typ?raw";
import { RESULT_KEYS_SORTED } from "./files";
import { humanizeResultKey, humanizeSourceKey } from "./naming";
import { compareKey } from "./order";

const refSource = "GB-T_7714—2025.original.toml";
const refKey = `${refSource}/naive-copy/default.txt`;
const refResult = RESULT[refKey];

type SysInputs = {
  /** The source of the typst document. */
  src: string;
  /** List of sources, ordered, excluding the ref source. */
  sourcesHuman: string[];
  /** Metrics of processors and styles, excluding the ref result. */
  metrics: {
    [processorStyleHuman: string]: {
      processor: string;
      metrics: { [sourceHuman: string]: number };
    };
  };
};

function calcMetrics(): SysInputs["metrics"] {
  const pairs = RESULT_KEYS_SORTED.filter((key) => key !== refKey).map(
    (key) => {
      const pairs = refResult.map((refValue, canonicalIndex) => {
        const actualValue = RESULT[key][canonicalIndex];
        return { refValue, actualValue };
      });
      const counts = countDistances(calcDistances(pairs));
      const metric = counts.exact + counts.letterCaseOnly;
      return { key, metric };
    },
  );

  const metrics: SysInputs["metrics"] = {};
  for (const { key, metric } of pairs) {
    const [_source, processor, _style] = key.split("/");
    const [sourceHuman, ...restHuman] = humanizeResultKey(key).split(" · ");
    const processorStyleHuman = restHuman.join(" · ");

    metrics[processorStyleHuman] ??= { processor, metrics: {} };
    metrics[processorStyleHuman].metrics[sourceHuman] = metric;
  }

  return metrics;
}

export async function compile({
  format,
}: {
  format: "svg" | "pdf";
}): Promise<Uint8Array> {
  const metrics = calcMetrics();
  const sourcesHuman = (Object.keys(SOURCE) as Source.Key[])
    .filter((key) => key !== refSource)
    .sort(compareKey)
    .map(humanizeSourceKey);

  const inputs = {
    src: diagramTyp,
    sourcesHuman,
    metrics,
  } satisfies SysInputs;

  const { stdout } = await execa(
    "typst",
    [
      "compile",
      "-",
      "-",
      `--format=${format}`,
      ...Object.entries(inputs).flatMap(([key, value]) => {
        const serialized =
          typeof value === "string" ? value : JSON.stringify(value);
        return ["--input", `${key}=${serialized}`];
      }),
    ],
    {
      input: diagramTyp,
      encoding: "buffer",
    },
  );
  return stdout;
}
