import { parse as parseToml } from "@std/toml";
import { parse as parseYaml } from "@std/yaml";
import { readRepoFile } from "./util.server";

/** `X.Y.Z` or `YYYY-MM-DD GIT_REVISION`. */
type Version = string;

type TypstLocalPkgName =
  | "omni-gb7714"
  | "gb7714-bilingual"
  | "modern-nju-thesis"
  | "citrus";

export type Versions = {
  zotero: {
    "citation.js": Version;
    "citeproc-js": Version;
  };
  "typst-py": Version;
  typst: Record<TypstLocalPkgName, Version>;
  ci: {
    pandoc: Version;
    citum: Version;
  };
};

export async function loadVersions(): Promise<Versions> {
  return {
    zotero: await loadZoteroVersions(),
    "typst-py": await loadTypstPyVersion(),
    typst: await loadTypstLocalPkgVersions(),
    ci: await loadCiVersions(),
  };
}

async function loadZoteroVersions(): Promise<Versions["zotero"]> {
  const lock = parseYaml(
    await readRepoFile("processors/zotero/pnpm-lock.yaml"),
  ) as {
    importers: {
      ".": {
        dependencies: {
          "@citation-js/core": { specifier: string; version: Version };
        };
      };
    };
    packages: {
      [key in `citeproc@${string}`]: { resolution: { integrity: string } };
    };
  };
  return {
    "citation.js":
      lock.importers["."].dependencies["@citation-js/core"].version,
    "citeproc-js": (
      Object.keys(lock.packages).find((name) =>
        name.startsWith("citeproc@"),
      ) as string
    ).replace(/^citeproc@/, ""),
  };
}

async function loadTypstPyVersion(): Promise<Versions["typst-py"]> {
  const raw = parseToml(await readRepoFile("processors/typst_etc/uv.lock")) as {
    package: { name: string; version: Version }[];
  };
  return (
    raw.package.find(({ name }) => name === "typst") as { version: Version }
  ).version;
}

async function loadTypstLocalPkgVersions(): Promise<Versions["typst"]> {
  const raw = parseToml(await readRepoFile("scripts/typst-local-pkg.toml")) as {
    pkg: {
      name: TypstLocalPkgName;
      version: string;
      src:
        | { git: string; rev: string; committer_date: Date; dir?: string }
        | { registry: "universe"; version: string };
      patch: string;
    }[];
  };

  return Object.fromEntries(
    raw.pkg.map(({ name, src }) => [
      name,
      "git" in src
        ? `${formatDate(src.committer_date)} ${src.rev.slice(0, 7)}`
        : src.version,
    ]),
  ) as Record<TypstLocalPkgName, Version>;
}

async function loadCiVersions(): Promise<Versions["ci"]> {
  const ci = parseYaml(await readRepoFile(".github/workflows/ci.yaml")) as {
    jobs: {
      "run-processors": {
        steps: (
          | { uses: "pandoc/actions/setup@v1"; with: { version: string } }
          | { name: "Setup citum"; env: { CITUM_VERSION: `v${string}` } }
          | { run: string }
          | { uses: string }
        )[];
      };
    };
  };
  const steps = ci.jobs["run-processors"].steps;
  return {
    pandoc: (
      steps.find(
        (step) => "uses" in step && step.uses === "pandoc/actions/setup@v1",
      ) as { with: { version: string } }
    ).with.version,
    citum: (
      steps.find((step) => "name" in step && step.name === "Setup citum") as {
        env: { CITUM_VERSION: `v${string}` };
      }
    ).env.CITUM_VERSION.replace(/^v/, ""),
  };
}

/** Format a `Date` in UTC+8 without time. */
function formatDate(date: Date): string {
  const utc8Time = date.getTime() + 8 * 60 * 60 * 1000;
  const utc8Date = new Date(utc8Time);
  return utc8Date.toISOString().split("T")[0];
}

if (import.meta.vitest) {
  const { test, expect, describe } = import.meta.vitest;

  test("formatDate", () => {
    const date = new Date("2026-04-27T02:15:58+08:00");
    expect(formatDate(date)).toBe("2026-04-27");
  });

  describe("loadVersions", async () => {
    const versions = await loadVersions();

    function* iterPairs(): Generator<[string, string]> {
      for (const [key, value] of Object.entries(versions)) {
        if (typeof value === "object" && value !== null) {
          for (const [subKey, subValue] of Object.entries(value)) {
            yield [`${key}/${subKey}`, subValue];
          }
        } else {
          yield [key, value];
        }
      }
    }

    test.for(Array.from(iterPairs()))("%s — %s", ([_key, value]) => {
      expect(value).toMatch(
        /^(\d+\.\d+(\.\d+)?|\d{4}-\d{2}-\d{2} [0-9a-f]{7})$/,
      );
    });
  });
}
